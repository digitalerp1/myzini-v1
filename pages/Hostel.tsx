
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { Student, HostelBuilding, StudentHostelData, HostelFeeRecord } from '../types';
import Spinner from '../components/Spinner';
import HostelIcon from '../components/icons/HostelIcon';
import UserCircleIcon from '../components/icons/UserCircleIcon';
import PlusIcon from '../components/icons/PlusIcon';
import StudentProfileModal from '../components/StudentProfileModal';

interface OccupancyView {
    buildingName: string;
    floors: {
        floorName: string;
        rooms: {
            roomNo: string;
            occupants: Student[];
            capacity: number; // Defaulting to 4 for now, or could be dynamic
        }[];
    }[];
}

const Hostel: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'occupancy' | 'students'>('dashboard');
    const [students, setStudents] = useState<Student[]>([]);
    const [buildings, setBuildings] = useState<HostelBuilding[]>([]);
    const [loading, setLoading] = useState(true);
    const [occupancyData, setOccupancyData] = useState<OccupancyView[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Stats
    const [totalCapacity, setTotalCapacity] = useState(0); 
    const [currentOccupancy, setCurrentOccupancy] = useState(0);
    const [totalDues, setTotalDues] = useState(0);
    const [totalRevenue, setTotalRevenue] = useState(0);

    // Modal State
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    
    // Bulk Dues State
    const [isBulkDuesOpen, setIsBulkDuesOpen] = useState(false);
    const [bulkMonth, setBulkMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
    const [processing, setProcessing] = useState(false);

    // Fetch Data
    const fetchData = useCallback(async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if(!user) return;

        // Fetch Owner Profile for Buildings
        const { data: ownerData } = await supabase
            .from('owner')
            .select('hostel_managment')
            .eq('uid', user.id)
            .single();
        
        const buildingsList: HostelBuilding[] = ownerData?.hostel_managment ? (ownerData.hostel_managment as any) : [];
        setBuildings(buildingsList);

        // Fetch Students with Hostel Data
        const { data: studentsData } = await supabase
            .from('students')
            .select('*')
            .order('name');
        
        const allStudents = studentsData as Student[];
        setStudents(allStudents);

        // Process Data
        let occupantsCount = 0;
        let dues = 0;
        let revenue = 0;
        let roomCount = 0;

        // Structure Occupancy Map
        const occMap: OccupancyView[] = buildingsList.map(b => {
            return {
                buildingName: b.name,
                floors: b.floors.map(f => {
                    return {
                        floorName: f.name,
                        rooms: f.rooms.map(r => {
                            roomCount++;
                            return {
                                roomNo: r,
                                capacity: 4, // Assuming 4 beds per room standard
                                occupants: allStudents.filter(s => 
                                    s.hostel_data?.is_active && 
                                    s.hostel_data.building_name === b.name &&
                                    s.hostel_data.floor_name === f.name &&
                                    s.hostel_data.room_no === r
                                )
                            };
                        })
                    };
                })
            };
        });
        setOccupancyData(occMap);
        setTotalCapacity(roomCount * 4); 

        allStudents.forEach(s => {
            if(s.hostel_data && s.hostel_data.is_active) {
                occupantsCount++;
                s.hostel_data.fee_records?.forEach(rec => {
                    // Modern calculation based on paid_amount vs amount
                    if (rec.paid_amount) revenue += rec.paid_amount;
                    dues += (rec.amount - (rec.paid_amount || 0));
                });
            }
        });

        setCurrentOccupancy(occupantsCount);
        setTotalDues(dues);
        setTotalRevenue(revenue);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Filtering Logic for Student List
    const filteredStudents = students.filter(s => {
        const matchesSearch = 
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.roll_number?.includes(searchQuery) ||
            s.class?.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Show all students in list view to allow assigning non-hostelites
        return matchesSearch; 
    });

    const handleViewProfile = (student: Student) => {
        setSelectedStudent(student);
        setIsProfileModalOpen(true);
    };

    // --- Bulk Dues Logic ---
    const handleBulkDues = async () => {
        if (!window.confirm(`Are you sure you want to add dues for ${bulkMonth} to ALL active hostel students?`)) return;
        
        setProcessing(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            alert("User authentication failed.");
            setProcessing(false);
            return;
        }

        // Only target active hostel students
        const activeStudents = students.filter(s => s.hostel_data?.is_active);
        
        let successCount = 0;
        let failCount = 0;

        // We update students one by one (or could do batched updates if supabase RPC was set up) 
        // to avoid RLS issues with bulk upsert on mixed data.
        for (const student of activeStudents) {
            const feeAmount = student.hostel_data?.monthly_fee || 0;
            const newRecord: HostelFeeRecord = {
                id: crypto.randomUUID(),
                month: bulkMonth,
                amount: feeAmount,
                paid_amount: 0,
                status: 'Due',
                description: 'Monthly Rent',
                payment_history: []
            };
            
            const updatedRecords = [...(student.hostel_data?.fee_records || []), newRecord];
            const updatedHostelData = { ...student.hostel_data, fee_records: updatedRecords };

            const { error } = await supabase
                .from('students')
                .update({ hostel_data: updatedHostelData })
                .eq('id', student.id)
                .eq('uid', user.id); // Strict RLS check

            if (!error) {
                successCount++;
            } else {
                console.error(`Failed to update student ${student.id}`, error);
                failCount++;
            }
        }

        if (successCount > 0) {
            alert(`Successfully added dues for ${successCount} students.${failCount > 0 ? ` Failed for ${failCount} students.` : ''}`);
            setIsBulkDuesOpen(false);
            fetchData();
        } else if (activeStudents.length === 0) {
            alert("No active hostel students found.");
        } else {
            alert("Failed to add dues. Check permissions.");
        }
        setProcessing(false);
    };


    if(loading) return <div className="flex justify-center h-96 items-center"><Spinner size="12" /></div>;

    return (
        <div className="bg-gray-50 min-h-screen p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                        <HostelIcon className="w-8 h-8 text-indigo-600"/> Hostel Management
                    </h1>
                    <p className="text-gray-500">Manage rooms, students, and hostel fees.</p>
                </div>
                <div className="flex gap-2 bg-white rounded-lg shadow-sm p-1">
                    <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>Overview</button>
                    <button onClick={() => setActiveTab('occupancy')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'occupancy' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>Room View</button>
                    <button onClick={() => setActiveTab('students')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'students' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>Students & Fees</button>
                </div>
            </div>

            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
                <div className="animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
                            <p className="text-gray-500 text-sm font-semibold uppercase">Total Occupants</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">{currentOccupancy} <span className="text-sm font-normal text-gray-400">/ {totalCapacity}</span></p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
                            <p className="text-gray-500 text-sm font-semibold uppercase">Total Revenue (Paid)</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">₹{totalRevenue.toLocaleString()}</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500">
                            <p className="text-gray-500 text-sm font-semibold uppercase">Total Dues</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">₹{totalDues.toLocaleString()}</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500">
                            <p className="text-gray-500 text-sm font-semibold uppercase">Vacancy</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">{totalCapacity - currentOccupancy} <span className="text-xs text-gray-400 font-normal">Beds Available</span></p>
                        </div>
                    </div>
                    
                    <div className="flex justify-end">
                        <button onClick={() => setIsBulkDuesOpen(true)} className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md flex items-center gap-2">
                            <PlusIcon className="w-5 h-5"/> Add Monthly Dues to All Active
                        </button>
                    </div>
                </div>
            )}

            {/* Occupancy Map Tab */}
            {activeTab === 'occupancy' && (
                <div className="space-y-8 animate-fade-in">
                    <div className="flex gap-4 mb-4 text-sm">
                        <div className="flex items-center gap-2"><span className="w-4 h-4 bg-white border border-gray-300 rounded"></span> Vacant</div>
                        <div className="flex items-center gap-2"><span className="w-4 h-4 bg-indigo-50 border border-indigo-200 rounded"></span> Partially Occupied</div>
                        <div className="flex items-center gap-2"><span className="w-4 h-4 bg-red-50 border border-red-200 rounded"></span> Full</div>
                    </div>

                    {occupancyData.map((b, idx) => (
                        <div key={idx} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                            <div className="bg-gray-800 text-white px-6 py-4 flex justify-between items-center">
                                <h2 className="text-xl font-bold">{b.buildingName}</h2>
                                <span className="text-sm bg-gray-700 px-3 py-1 rounded-full">{b.floors.length} Floors</span>
                            </div>
                            <div className="p-6 space-y-6">
                                {b.floors.map((f, fIdx) => (
                                    <div key={fIdx} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                                        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                            <span className="w-2 h-6 bg-indigo-500 rounded-full"></span> {f.floorName}
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {f.rooms.map((r, rIdx) => {
                                                const occupancy = r.occupants.length;
                                                const capacity = r.capacity;
                                                const isFull = occupancy >= capacity;
                                                const isEmpty = occupancy === 0;
                                                
                                                let cardClass = "bg-white border-gray-200";
                                                if(isFull) cardClass = "bg-red-50 border-red-200 shadow-sm";
                                                else if(!isEmpty) cardClass = "bg-indigo-50 border-indigo-200 shadow-sm";

                                                return (
                                                    <div key={rIdx} className={`border rounded-lg p-4 transition-all ${cardClass}`}>
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="font-bold text-gray-800">Room {r.roomNo}</span>
                                                            <span className={`text-xs font-bold px-2 py-0.5 rounded border ${isFull ? 'bg-red-100 text-red-800 border-red-200' : 'bg-green-100 text-green-800 border-green-200'}`}>
                                                                {occupancy}/{capacity}
                                                            </span>
                                                        </div>
                                                        <div className="space-y-1 min-h-[40px]">
                                                            {r.occupants.length > 0 ? r.occupants.map(occ => (
                                                                <div key={occ.id} className="text-xs flex items-center gap-1.5 text-gray-700 bg-white/50 p-1 rounded">
                                                                    {/* FIX: Removed className from UserCircleIcon as its current definition doesn't support it or caused type mismatch */}
                                                                    <UserCircleIcon /> {occ.name}
                                                                </div>
                                                            )) : <span className="text-xs text-green-600 italic flex items-center gap-1"><PlusIcon className="w-3 h-3"/> Available</span>}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    {occupancyData.length === 0 && <div className="text-center text-gray-500 py-10 bg-white rounded-xl shadow-sm">No hostel infrastructure defined in profile. Go to Profile &gt; Infrastructure.</div>}
                </div>
            )}

            {/* Students List Tab */}
            {activeTab === 'students' && (
                <div className="bg-white rounded-xl shadow-md overflow-hidden animate-fade-in flex flex-col h-[calc(100vh-12rem)]">
                    <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="relative w-full md:w-96">
                            <input 
                                type="text" 
                                placeholder="Search student by Name, Class or Roll..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>
                        
                        <div className="flex gap-2">
                             <button onClick={() => setIsBulkDuesOpen(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium shadow-sm transition-colors">
                                + Bulk Dues
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto flex-1">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class Info</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hostel Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee Balance</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredStudents.map((student) => {
                                    const isHostelite = student.hostel_data?.is_active;
                                    const hostelFeeRecords = student.hostel_data?.fee_records || [];
                                    const totalPaid = hostelFeeRecords.reduce((sum, r) => sum + (r.paid_amount || 0), 0);
                                    const totalDue = hostelFeeRecords.reduce((sum, r) => sum + (r.amount - (r.paid_amount || 0)), 0);

                                    return (
                                        <tr key={student.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleViewProfile(student)}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0">
                                                        <img className="h-10 w-10 rounded-full object-cover" src={student.photo_url || `https://ui-avatars.com/api/?name=${student.name}`} alt="" />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                                        <div className="text-xs text-gray-500">{student.father_name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{student.class}</div>
                                                <div className="text-xs text-gray-500">Roll: {student.roll_number}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {isHostelite ? (
                                                    <div>
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 mb-1">Active</span>
                                                        <div className="text-xs text-gray-500">
                                                            {student.hostel_data?.building_name}, {student.hostel_data?.room_no}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Day Scholar</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {isHostelite ? (
                                                    <div className="text-sm">
                                                        <div className="text-green-600 font-medium">Paid: ₹{totalPaid}</div>
                                                        <div className="text-red-600 font-bold">Due: ₹{totalDue}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button className="text-indigo-600 hover:text-indigo-900 px-3 py-1 bg-indigo-50 rounded-md text-xs font-bold">Manage</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredStudents.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                                            No students found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Bulk Dues Modal */}
            {isBulkDuesOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-xl w-full max-w-sm shadow-2xl">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">Add Bulk Hostel Dues</h2>
                        <p className="text-sm text-gray-600 mb-4">This will add the monthly fee as 'Due' to <strong>ALL</strong> active hostel students.</p>
                        
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Select Month</label>
                            <select className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 outline-none" value={bulkMonth} onChange={(e) => setBulkMonth(e.target.value)}>
                                {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                            <button onClick={() => setIsBulkDuesOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors" disabled={processing}>Cancel</button>
                            <button onClick={handleBulkDues} disabled={processing} className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center gap-2 shadow-sm transition-colors">
                                {processing && <Spinner size="4"/>} Confirm Add
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isProfileModalOpen && selectedStudent && (
                 <StudentProfileModal 
                    student={selectedStudent}
                    classes={[]} // Passed empty as not needed for hostel focus, could fetch if needed
                    onClose={() => {
                        setIsProfileModalOpen(false);
                        fetchData();
                    }}
                 />
            )}
        </div>
    );
};

export default Hostel;