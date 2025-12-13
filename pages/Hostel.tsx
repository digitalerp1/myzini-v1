
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { Student, HostelBuilding, StudentHostelData, HostelFeeRecord } from '../types';
import Spinner from '../components/Spinner';
import HostelIcon from '../components/icons/HostelIcon';
import UserCircleIcon from '../components/icons/UserCircleIcon';

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
    
    // Stats
    const [totalCapacity, setTotalCapacity] = useState(0); // This is approximate as rooms don't have capacity field yet
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
                                    s.hostel_data.building_id === b.id && // Matching IDs is safer, but UI uses names often. 
                                    // Fallback to name matching if IDs are tricky or just match exact strings stored
                                    s.hostel_data.room_no === r &&
                                    s.hostel_data.floor_name === f.name && // strict match
                                    s.hostel_data.building_name === b.name
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
            fee_records: selectedStudent.hostel_data?.fee_records || [] // preserve history if re-assigning
        };

        // Also update the flat fields for backward compatibility if needed, but mainly the JSON
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
            building_name: null, floor_name: null, room_no: null // clear flat fields
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
            month: payMonth,
            amount: feeAmount,
            status: 'Paid',
            paid_date: new Date().toISOString()
        };

        // Check if month already exists
        const existingRecords = selectedStudent.hostel_data.fee_records || [];
        const monthExistsIndex = existingRecords.findIndex(r => r.month === payMonth);
        
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
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                        <HostelIcon className="w-8 h-8 text-indigo-600"/> Hostel Management
                    </h1>
                    <p className="text-gray-500">Manage rooms, students, and hostel fees.</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-1 flex">
                    <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>Overview</button>
                    <button onClick={() => setActiveTab('occupancy')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'occupancy' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>Room View</button>
                    <button onClick={() => setActiveTab('students')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'students' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>Student List</button>
                </div>
            </div>

            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
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
            )}

            {/* Occupancy Map Tab */}
            {activeTab === 'occupancy' && (
                <div className="space-y-8 animate-fade-in">
                    {occupancyData.map((b, idx) => (
                        <div key={idx} className="bg-white rounded-xl shadow-md overflow-hidden">
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
                                                <div key={rIdx} className={`border rounded-lg p-4 transition-all ${r.occupants.length > 0 ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-50 border-gray-200 opacity-70'}`}>
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="font-bold text-gray-800">Room {r.roomNo}</span>
                                                        <span className="text-xs font-bold bg-white px-2 py-0.5 rounded border border-gray-300">{r.occupants.length} Occ.</span>
                                                    </div>
                                                    <div className="space-y-1">
                                                        {r.occupants.length > 0 ? r.occupants.map(occ => (
                                                            <div key={occ.id} className="text-xs flex items-center gap-1 text-gray-700">
                                                                <UserCircleIcon/> {occ.name}
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
                    {occupancyData.length === 0 && <div className="text-center text-gray-500 py-10">No hostel infrastructure defined in profile.</div>}
                </div>
            )}

            {/* Students List Tab */}
            {activeTab === 'students' && (
                <div className="bg-white rounded-xl shadow-md overflow-hidden animate-fade-in">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hostel Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room Info</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {students.map((student) => {
                                    const isHostelite = student.hostel_data?.is_active;
                                    return (
                                        <tr key={student.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-gray-900">{student.name}</div>
                                                <div className="text-xs text-gray-500">{student.father_name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.class}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {isHostelite ? 
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span> : 
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Day Scholar</span>
                                                }
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {isHostelite ? `${student.hostel_data?.building_name}, Room ${student.hostel_data?.room_no}` : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {isHostelite ? (
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => addDue(student)} className="text-red-600 hover:text-red-900 bg-red-50 px-2 py-1 rounded">Add Due</button>
                                                        <button onClick={() => handleOpenPay(student)} className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-2 py-1 rounded">Collect Fee</button>
                                                        <button onClick={() => handleExit(student)} className="text-gray-500 hover:text-gray-700 bg-gray-100 px-2 py-1 rounded">Exit</button>
                                                    </div>
                                                ) : (
                                                    <button onClick={() => handleOpenAssign(student)} className="text-green-600 hover:text-green-900 font-bold">Assign Room</button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Assign Modal */}
            {isAssignModalOpen && selectedStudent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
                        <h2 className="text-xl font-bold mb-4">Assign Room to {selectedStudent.name}</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Building</label>
                                <select className="w-full border rounded p-2 mt-1" value={formData.building} onChange={handleBuildingChange}>
                                    <option value="">Select Building</option>
                                    {buildings.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Floor</label>
                                <select className="w-full border rounded p-2 mt-1" value={formData.floor} onChange={handleFloorChange} disabled={!formData.building}>
                                    <option value="">Select Floor</option>
                                    {availableFloors.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Room</label>
                                <select className="w-full border rounded p-2 mt-1" value={formData.room} onChange={(e) => setFormData({...formData, room: e.target.value})} disabled={!formData.floor}>
                                    <option value="">Select Room</option>
                                    {availableRooms.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Monthly Hostel Fee (₹)</label>
                                <input type="number" className="w-full border rounded p-2 mt-1" value={formData.fee} onChange={(e) => setFormData({...formData, fee: Number(e.target.value)})} />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={() => setIsAssignModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                            <button onClick={submitAssignment} disabled={processing} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2">
                                {processing && <Spinner size="4"/>} Assign
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Pay Modal */}
            {isPayModalOpen && selectedStudent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-sm shadow-xl">
                        <h2 className="text-xl font-bold mb-4">Collect Hostel Fee</h2>
                        <p className="mb-4">Student: <strong>{selectedStudent.name}</strong></p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Month</label>
                            <select className="w-full border rounded p-2 mt-1" value={payMonth} onChange={(e) => setPayMonth(e.target.value)}>
                                {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>
                        <p className="mb-6 text-lg">Amount: <strong>₹{selectedStudent.hostel_data?.monthly_fee}</strong></p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setIsPayModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                            <button onClick={submitPay} disabled={processing} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center gap-2">
                                {processing && <Spinner size="4"/>} Confirm Payment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Hostel;
