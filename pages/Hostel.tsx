
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { Student, HostelBuilding, StudentHostelData, HostelFeeRecord } from '../types';
import Spinner from '../components/Spinner';
import HostelIcon from '../components/icons/HostelIcon';
import UserCircleIcon from '../components/icons/UserCircleIcon';
import PlusIcon from '../components/icons/PlusIcon';

interface OccupancyView {
    buildingName: string;
    floors: {
        floorName: string;
        rooms: {
            roomNo: string;
            occupants: Student[];
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

    // Modal State for Assign/Pay
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [formData, setFormData] = useState({
        building: '', floor: '', room: '', fee: 0
    });
    const [availableFloors, setAvailableFloors] = useState<any[]>([]);
    const [availableRooms, setAvailableRooms] = useState<string[]>([]);
    
    const [isPayModalOpen, setIsPayModalOpen] = useState(false);
    const [payMonth, setPayMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
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
        setTotalCapacity(roomCount * 4); // Assuming 4 beds per room as generic estimate

        allStudents.forEach(s => {
            if(s.hostel_data && s.hostel_data.is_active) {
                occupantsCount++;
                s.hostel_data.fee_records?.forEach(rec => {
                    if(rec.status === 'Paid') revenue += rec.amount;
                    else dues += rec.amount;
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

    // Handlers for Assignment Modal
    const handleOpenAssign = (student: Student) => {
        setSelectedStudent(student);
        setFormData({ building: '', floor: '', room: '', fee: student.hostel_data?.monthly_fee || 0 });
        setAvailableFloors([]);
        setAvailableRooms([]);
        setIsAssignModalOpen(true);
    };

    const handleBuildingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const bName = e.target.value;
        const building = buildings.find(b => b.name === bName);
        setFormData({...formData, building: bName, floor: '', room: ''});
        setAvailableFloors(building?.floors || []);
        setAvailableRooms([]);
    };

    const handleFloorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const fName = e.target.value;
        const floor = availableFloors.find(f => f.name === fName);
        setFormData({...formData, floor: fName, room: ''});
        setAvailableRooms(floor?.rooms || []);
    };

    const submitAssignment = async () => {
        if(!selectedStudent || !formData.building || !formData.floor || !formData.room) return;
        setProcessing(true);

        const building = buildings.find(b => b.name === formData.building);
        const floor = building?.floors.find(f => f.name === formData.floor);

        const newHostelData: StudentHostelData = {
            is_active: true,
            building_id: building?.id || '',
            building_name: building?.name || '',
            floor_id: floor?.id || '',
            floor_name: floor?.name || '',
            room_no: formData.room,
            joining_date: new Date().toISOString(),
            monthly_fee: Number(formData.fee),
            fee_records: selectedStudent.hostel_data?.fee_records || []
        };

        const { error } = await supabase.from('students').update({
            hostel_data: newHostelData,
            building_name: formData.building,
            floor_name: formData.floor,
            room_no: formData.room
        }).eq('id', selectedStudent.id);

        if(!error) {
            fetchData();
            setIsAssignModalOpen(false);
        } else {
            alert(error.message);
        }
        setProcessing(false);
    };

    // Handlers for Exit
    const handleExit = async (student: Student) => {
        if(!window.confirm(`Mark ${student.name} as exited from hostel?`)) return;
        
        const updatedData = {
            ...student.hostel_data,
            is_active: false,
            exit_date: new Date().toISOString()
        };

        await supabase.from('students').update({
            hostel_data: updatedData,
            building_name: null, floor_name: null, room_no: null
        }).eq('id', student.id);
        fetchData();
    };

    // Fee Collection Logic
    const handleOpenPay = (student: Student) => {
        setSelectedStudent(student);
        setIsPayModalOpen(true);
    };

    const submitPay = async () => {
        if(!selectedStudent || !selectedStudent.hostel_data) return;
        setProcessing(true);

        const feeAmount = selectedStudent.hostel_data.monthly_fee;
        const newRecord: HostelFeeRecord = {
            id: crypto.randomUUID(),
            month: payMonth,
            amount: feeAmount,
            status: 'Paid',
            paid_date: new Date().toISOString()
        };

        const existingRecords = selectedStudent.hostel_data.fee_records || [];
        const monthExistsIndex = existingRecords.findIndex(r => r.month === payMonth && r.status === 'Due');
        
        let updatedRecords;
        if(monthExistsIndex >= 0) {
            updatedRecords = [...existingRecords];
            updatedRecords[monthExistsIndex] = newRecord;
        } else {
            updatedRecords = [...existingRecords, newRecord];
        }

        const updatedData = { ...selectedStudent.hostel_data, fee_records: updatedRecords };

        await supabase.from('students').update({ hostel_data: updatedData }).eq('id', selectedStudent.id);
        
        setProcessing(false);
        setIsPayModalOpen(false);
        fetchData();
    };

    const addDue = async (student: Student) => {
        if(!student.hostel_data) return;
        const feeAmount = student.hostel_data.monthly_fee;
        const month = prompt("Enter month name to mark as Due:", new Date().toLocaleString('default', { month: 'long' }));
        if(!month) return;

        const newRecord: HostelFeeRecord = {
            id: crypto.randomUUID(),
            month: month,
            amount: feeAmount,
            status: 'Due'
        };
        const updatedRecords = [...(student.hostel_data.fee_records || []), newRecord];
        const updatedData = { ...student.hostel_data, fee_records: updatedRecords };
        
        await supabase.from('students').update({ hostel_data: updatedData }).eq('id', student.id);
        fetchData();
    }


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
                            <p className="text-3xl font-bold text-gray-800 mt-2">{currentOccupancy}</p>
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
                            <p className="text-gray-500 text-sm font-semibold uppercase">Estimated Capacity</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">{totalCapacity} <span className="text-xs text-gray-400 font-normal">(approx)</span></p>
                        </div>
                    </div>
                    
                    {/* Recent Transactions Mini Table could go here */}
                </div>
            )}

            {/* Occupancy Map Tab */}
            {activeTab === 'occupancy' && (
                <div className="space-y-8 animate-fade-in">
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
                                            {f.rooms.map((r, rIdx) => (
                                                <div key={rIdx} className={`border rounded-lg p-4 transition-all ${r.occupants.length > 0 ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="font-bold text-gray-800">Room {r.roomNo}</span>
                                                        <span className={`text-xs font-bold px-2 py-0.5 rounded border ${r.occupants.length > 0 ? 'bg-white border-indigo-200 text-indigo-700' : 'border-gray-300'}`}>{r.occupants.length} Occ.</span>
                                                    </div>
                                                    <div className="space-y-1">
                                                        {r.occupants.length > 0 ? r.occupants.map(occ => (
                                                            <div key={occ.id} className="text-xs flex items-center gap-1.5 text-gray-700 bg-white p-1 rounded border border-indigo-100">
                                                                <UserCircleIcon className="w-3 h-3 text-indigo-500"/> {occ.name}
                                                            </div>
                                                        )) : <span className="text-xs text-gray-400 italic">Vacant</span>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    {occupancyData.length === 0 && <div className="text-center text-gray-500 py-10 bg-white rounded-xl shadow-sm">No hostel infrastructure defined in profile. Go to Profile > Infrastructure.</div>}
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
                        {/* Summary for filtered list could go here */}
                        <div className="text-sm text-gray-500">
                            Showing {filteredStudents.length} students
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
                                    const totalPaid = hostelFeeRecords.filter(r => r.status === 'Paid').reduce((sum, r) => sum + r.amount, 0);
                                    const totalDue = hostelFeeRecords.filter(r => r.status === 'Due').reduce((sum, r) => sum + r.amount, 0);

                                    return (
                                        <tr key={student.id} className="hover:bg-gray-50 transition-colors">
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
                                                {isHostelite ? (
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => addDue(student)} className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded text-xs font-bold transition-colors">
                                                            + Due
                                                        </button>
                                                        <button onClick={() => handleOpenPay(student)} className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded text-xs font-bold transition-colors">
                                                            Collect
                                                        </button>
                                                        <button onClick={() => handleExit(student)} title="Mark as Exited" className="text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors">
                                                            &times;
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button onClick={() => handleOpenAssign(student)} className="text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 ml-auto shadow-sm transition-colors">
                                                        <PlusIcon className="w-3 h-3"/> Assign
                                                    </button>
                                                )}
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

            {/* Assign Modal */}
            {isAssignModalOpen && selectedStudent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl">
                        <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Assign Room to {selectedStudent.name}</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Building</label>
                                <select className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" value={formData.building} onChange={handleBuildingChange}>
                                    <option value="">Select Building</option>
                                    {buildings.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
                                <select className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none disabled:bg-gray-100" value={formData.floor} onChange={handleFloorChange} disabled={!formData.building}>
                                    <option value="">Select Floor</option>
                                    {availableFloors.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
                                <select className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none disabled:bg-gray-100" value={formData.room} onChange={(e) => setFormData({...formData, room: e.target.value})} disabled={!formData.floor}>
                                    <option value="">Select Room</option>
                                    {availableRooms.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Hostel Fee (₹)</label>
                                <input type="number" className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" value={formData.fee} onChange={(e) => setFormData({...formData, fee: Number(e.target.value)})} />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <button onClick={() => setIsAssignModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors">Cancel</button>
                            <button onClick={submitAssignment} disabled={processing} className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center gap-2 shadow-sm transition-colors">
                                {processing && <Spinner size="4"/>} Confirm Assignment
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Pay Modal */}
            {isPayModalOpen && selectedStudent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-xl w-full max-w-sm shadow-2xl">
                        <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Collect Hostel Fee</h2>
                        <div className="mb-4 bg-indigo-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-500">Student</p>
                            <p className="font-bold text-gray-800">{selectedStudent.name}</p>
                            <p className="text-xs text-gray-500">Room: {selectedStudent.hostel_data?.room_no}</p>
                        </div>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Select Month</label>
                            <select className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 outline-none" value={payMonth} onChange={(e) => setPayMonth(e.target.value)}>
                                {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="flex justify-between items-center mb-6 bg-gray-50 p-3 rounded-md border border-gray-200">
                            <span className="text-gray-600 font-medium">Amount:</span>
                            <span className="text-xl font-bold text-green-600">₹{selectedStudent.hostel_data?.monthly_fee}</span>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => setIsPayModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors">Cancel</button>
                            <button onClick={submitPay} disabled={processing} className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center gap-2 shadow-sm transition-colors">
                                {processing && <Spinner size="4"/>} Record Payment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Hostel;
