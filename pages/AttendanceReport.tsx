
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { Class, Student, Attendance as AttendanceType } from '../types';
import Spinner from '../components/Spinner';

interface ProcessedAttendanceRecord extends AttendanceType {
    className: string;
    presentStudents: Student[];
    absentStudents: Student[];
}

const AttendanceReport: React.FC = () => {
    const [allProcessedRecords, setAllProcessedRecords] = useState<ProcessedAttendanceRecord[]>([]);
    const [filteredRecords, setFilteredRecords] = useState<ProcessedAttendanceRecord[]>([]);
    const [selectedRecord, setSelectedRecord] = useState<ProcessedAttendanceRecord | null>(null);
    const [classes, setClasses] = useState<Class[]>([]);
    const [filters, setFilters] = useState({ classId: '', date: '', month: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDataAndProcess = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [attendanceRes, classesRes, studentsRes] = await Promise.all([
                supabase.from('attendance').select('*').order('date', { ascending: false }),
                supabase.from('classes').select('*'),
                supabase.from('students').select('*')
            ]);

            if (attendanceRes.error) throw attendanceRes.error;
            if (classesRes.error) throw classesRes.error;
            if (studentsRes.error) throw studentsRes.error;

            const attendanceData: AttendanceType[] = attendanceRes.data;
            const classesData: Class[] = classesRes.data;
            const studentsData: Student[] = studentsRes.data;
            
            setClasses(classesData);

            const classesMap = new Map(classesData.map(c => [c.id, c.class_name]));
            const studentsByClassAndRoll = new Map<string, Map<string, Student>>();
            for (const student of studentsData) {
                if (student.class && student.roll_number) {
                    if (!studentsByClassAndRoll.has(student.class)) {
                        studentsByClassAndRoll.set(student.class, new Map());
                    }
                    studentsByClassAndRoll.get(student.class)!.set(student.roll_number, student);
                }
            }
            
            const processed = attendanceData.map(record => {
                const className = classesMap.get(record.class_id) || 'Unknown Class';
                const classStudentsMap = studentsByClassAndRoll.get(className);

                const presentRolls = record.present ? record.present.split(',') : [];
                const absentRolls = record.absent ? record.absent.split(',') : [];

                const presentStudents = presentRolls
                    .map(roll => classStudentsMap?.get(roll))
                    .filter((s): s is Student => !!s);
                
                const absentStudents = absentRolls
                    .map(roll => classStudentsMap?.get(roll))
                    .filter((s): s is Student => !!s);
                
                return { ...record, className, presentStudents, absentStudents };
            });

            setAllProcessedRecords(processed);
            setFilteredRecords(processed);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDataAndProcess();
    }, [fetchDataAndProcess]);

    useEffect(() => {
        let records = [...allProcessedRecords];
        if (filters.classId) {
            records = records.filter(r => r.class_id.toString() === filters.classId);
        }
        if (filters.date) {
            records = records.filter(r => r.date === filters.date);
        }
        if (filters.month) {
            records = records.filter(r => r.date.startsWith(filters.month));
        }
        setFilteredRecords(records);
    }, [filters, allProcessedRecords]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => {
            const newFilters = { ...prev, [name]: value };
            // If a more specific filter is set, clear the less specific one
            if (name === 'date' && value) newFilters.month = '';
            if (name === 'month' && value) newFilters.date = '';
            return newFilters;
        });
    };
    
    const clearFilters = () => {
        setFilters({ classId: '', date: '', month: '' });
    };

    if (loading) {
        return <div className="flex justify-center items-center h-96"><Spinner size="12" /></div>;
    }

    if (error) {
        return <div className="text-center text-red-500 bg-red-100 p-4 rounded-lg">{error}</div>;
    }
    
    if (selectedRecord) {
        return (
            <div className="bg-white p-8 rounded-xl shadow-lg">
                <button onClick={() => setSelectedRecord(null)} className="mb-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">
                    &larr; Back to Report List
                </button>
                <div className="border-b pb-4 mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Attendance Details</h2>
                    <p className="text-gray-600">
                        <span className="font-semibold">Class:</span> {selectedRecord.className} | 
                        <span className="font-semibold"> Date:</span> {new Date(selectedRecord.date).toLocaleDateString()}
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-xl font-semibold text-green-600 mb-3">Present ({selectedRecord.presentStudents.length})</h3>
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                           {selectedRecord.presentStudents.length > 0 ? selectedRecord.presentStudents.map(s => (
                               <div key={s.id} className="flex items-center gap-3 bg-gray-50 p-2 rounded-md">
                                   <img src={s.photo_url || `https://ui-avatars.com/api/?name=${s.name}`} alt={s.name} className="w-12 h-12 rounded-full object-cover"/>
                                   <div>
                                       <p className="font-semibold">{s.name}</p>
                                       <p className="text-sm text-gray-500">Roll: {s.roll_number}</p>
                                   </div>
                               </div>
                           )) : <p className="text-gray-500">No students were marked present.</p>}
                        </div>
                    </div>
                     <div>
                        <h3 className="text-xl font-semibold text-red-600 mb-3">Absent ({selectedRecord.absentStudents.length})</h3>
                         <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                           {selectedRecord.absentStudents.length > 0 ? selectedRecord.absentStudents.map(s => (
                               <div key={s.id} className="flex items-center gap-3 bg-red-50 p-2 rounded-md">
                                   <img src={s.photo_url || `https://ui-avatars.com/api/?name=${s.name}`} alt={s.name} className="w-12 h-12 rounded-full object-cover"/>
                                   <div>
                                       <p className="font-semibold">{s.name}</p>
                                       <p className="text-sm text-gray-500">Roll: {s.roll_number}</p>
                                   </div>
                               </div>
                           )) : <p className="text-gray-500">No students were marked absent.</p>}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Attendance Report</h1>
            
            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center p-4 bg-gray-50 rounded-lg mb-6">
                <div className="flex-1 min-w-[150px]">
                    <label htmlFor="classId" className="block text-sm font-medium text-gray-700">Class</label>
                    <select id="classId" name="classId" value={filters.classId} onChange={handleFilterChange} className="mt-1 input-field">
                        <option value="">All Classes</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.class_name}</option>)}
                    </select>
                </div>
                 <div className="flex-1 min-w-[150px]">
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">Specific Date</label>
                    <input type="date" id="date" name="date" value={filters.date} onChange={handleFilterChange} className="mt-1 input-field" />
                </div>
                 <div className="flex-1 min-w-[150px]">
                    <label htmlFor="month" className="block text-sm font-medium text-gray-700">Month</label>
                    <input type="month" id="month" name="month" value={filters.month} onChange={handleFilterChange} className="mt-1 input-field" />
                </div>
                <div className="pt-6">
                    <button onClick={clearFilters} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100">Clear Filters</button>
                </div>
            </div>

            {/* Report List */}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="th">Date</th>
                            <th className="th">Class</th>
                            <th className="th">Present</th>
                            <th className="th">Absent</th>
                            <th className="th text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredRecords.length > 0 ? filteredRecords.map(record => (
                            <tr key={record.id}>
                                <td className="td">{new Date(record.date).toLocaleDateString()}</td>
                                <td className="td font-semibold">{record.className}</td>
                                <td className="td text-green-600">{record.presentStudents.length}</td>
                                <td className="td text-red-600">{record.absentStudents.length}</td>
                                <td className="td text-center">
                                    <button onClick={() => setSelectedRecord(record)} className="px-3 py-1 bg-primary text-white text-sm rounded-md hover:bg-primary-dark">
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={5} className="text-center py-8 text-gray-500">No records match the current filters.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
             <style>{`
                .input-field { display: block; width: 100%; padding: 0.5rem 0.75rem; border-radius: 0.375rem; border: 1px solid #D1D5DB; }
                .th { padding: 0.75rem 1rem; text-align: left; font-size: 0.75rem; font-weight: 500; color: #6B7280; text-transform: uppercase; }
                .td { padding: 1rem 1rem; font-size: 0.875rem; white-space: nowrap; }
            `}</style>
        </div>
    );
};

export default AttendanceReport;
