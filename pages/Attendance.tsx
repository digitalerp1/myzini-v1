
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { Class, Student, Staff } from '../types';
import Spinner from '../components/Spinner';
import ClassesIcon from '../components/icons/ClassesIcon';
import UserCircleIcon from '../components/icons/UserCircleIcon';

const Attendance: React.FC = () => {
    const [classes, setClasses] = useState<Class[]>([]);
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [selectedClass, setSelectedClass] = useState<Class | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [presentRolls, setPresentRolls] = useState<Set<string>>(new Set());
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const fetchInitialData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [classesRes, staffRes] = await Promise.all([
                supabase.from('classes').select('*').order('class_name'),
                supabase.from('staff').select('staff_id, name')
            ]);

            if (classesRes.error) throw classesRes.error;
            if (staffRes.error) throw staffRes.error;

            setClasses(classesRes.data as Class[]);
            setStaffList(staffRes.data as Staff[]);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    const handleClassSelect = useCallback(async (classToSelect: Class) => {
        setLoading(true);
        setSelectedClass(classToSelect);
        setError(null);
        setMessage(null);
        
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .eq('class', classToSelect.class_name);

        if (error) {
            setError(error.message);
            setStudents([]);
        } else {
            const studentData: Student[] = data || [];
            const validStudents = studentData.filter(s => s.roll_number);
            
            // Sort students numerically by roll number (Natural Sort)
            validStudents.sort((a, b) => {
                return (a.roll_number || '').localeCompare(b.roll_number || '', undefined, { numeric: true, sensitivity: 'base' });
            });

            setStudents(validStudents);
            const allRolls = new Set(validStudents.map(s => s.roll_number!));
            setPresentRolls(allRolls);
        }
        setLoading(false);
    }, []);
    
    const handleTogglePresence = (rollNumber: string) => {
        setPresentRolls(prev => {
            const newSet = new Set(prev);
            if (newSet.has(rollNumber)) {
                newSet.delete(rollNumber);
            } else {
                newSet.add(rollNumber);
            }
            return newSet;
        });
    };

    const toggleAll = (check: boolean) => {
        if (check) {
            const allRolls = new Set(students.map(s => s.roll_number!));
            setPresentRolls(allRolls);
        } else {
            setPresentRolls(new Set());
        }
    }
    
    const handleSubmit = async () => {
        if (!selectedClass) return;

        setSaving(true);
        setError(null);
        setMessage(null);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setError("You must be logged in to perform this action.");
            setSaving(false);
            return;
        }

        const absentRolls = students
            .map(s => s.roll_number!)
            .filter(roll => !presentRolls.has(roll));

        const presentString = Array.from(presentRolls).join(',');
        const absentString = absentRolls.join(',');
        
        const today = new Date().toISOString().split('T')[0];

        const { error } = await supabase
            .from('attendance')
            .upsert({
                uid: user.id,
                class_id: selectedClass.id,
                date: today,
                present: presentString,
                absent: absentString,
            }, {
                onConflict: 'uid,class_id,date'
            });

        if (error) {
            setError(`Failed to save attendance: ${error.message}`);
        } else {
            setMessage('Attendance saved successfully!');
            setTimeout(() => setMessage(null), 3000);
        }
        setSaving(false);
    };


    if (loading && !selectedClass) {
        return <div className="flex justify-center items-center h-96"><Spinner size="12" /></div>;
    }

    if (error) {
        return <div className="text-center text-red-500 bg-red-100 p-4 rounded-lg">{error}</div>;
    }

    // View for selecting a class
    if (!selectedClass) {
        return (
            <div className="space-y-8 animate-fade-in">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Take Attendance</h1>
                        <p className="text-gray-500 mt-1">Select a class to begin marking attendance for {new Date().toLocaleDateString()}.</p>
                    </div>
                </div>
                
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {classes.map(c => {
                        const teacherName = staffList.find(s => s.staff_id === c.staff_id)?.name;
                        return (
                            <div 
                                key={c.id} 
                                onClick={() => handleClassSelect(c)}
                                className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-200 cursor-pointer transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
                            >
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-indigo-600 group-hover:h-2 transition-all"></div>
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="p-3 bg-indigo-50 rounded-xl group-hover:bg-indigo-100 transition-colors text-primary">
                                            <ClassesIcon className="w-8 h-8" />
                                        </div>
                                        <div className="text-gray-300 group-hover:text-primary transition-colors">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
                                        </div>
                                    </div>
                                    
                                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{c.class_name}</h2>
                                    
                                    <div className="flex items-center text-sm text-gray-500 bg-gray-50 p-2 rounded-lg">
                                        <div className="text-gray-400 mr-2"><UserCircleIcon /></div>
                                        <span className="truncate font-medium">
                                            {teacherName || 'No Class Teacher'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                {classes.length === 0 && (
                    <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-500">No classes found. Please add classes first.</p>
                    </div>
                )}
            </div>
        );
    }
    
    const allChecked = presentRolls.size === students.length && students.length > 0;
    const isIndeterminate = presentRolls.size > 0 && presentRolls.size < students.length;

    // View for marking attendance for a selected class
    return (
        <div className="bg-white p-8 rounded-xl shadow-lg animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-gray-100 pb-6">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <button onClick={() => setSelectedClass(null)} className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Class <span className="text-primary">{selectedClass.class_name}</span>
                        </h1>
                        <p className="text-sm text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 bg-indigo-50 px-4 py-2 rounded-lg">
                   <div className="text-center">
                        <p className="text-xs font-semibold text-gray-500 uppercase">Present</p>
                        <p className="text-xl font-bold text-green-600">{presentRolls.size}</p>
                   </div>
                   <div className="w-px h-8 bg-gray-300"></div>
                   <div className="text-center">
                        <p className="text-xs font-semibold text-gray-500 uppercase">Absent</p>
                        <p className="text-xl font-bold text-red-600">{students.length - presentRolls.size}</p>
                   </div>
                   <div className="w-px h-8 bg-gray-300"></div>
                   <div className="text-center">
                        <p className="text-xs font-semibold text-gray-500 uppercase">Total</p>
                        <p className="text-xl font-bold text-gray-800">{students.length}</p>
                   </div>
                </div>
            </div>
            
             {message && (
                <div className="p-4 mb-6 text-sm rounded-md bg-green-100 text-green-700 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    {message}
                </div>
            )}
            
            {loading ? <div className="flex justify-center items-center h-96"><Spinner size="12" /></div> :
            students.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 text-lg">No students found in this class.</p>
                    <p className="text-gray-400 text-sm">Add students to {selectedClass.class_name} to take attendance.</p>
                </div>
            ) :
            (
                <div className="overflow-hidden border border-gray-200 rounded-lg">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="p-4 w-10">
                                        <div className="flex items-center">
                                            <input type="checkbox" className="h-5 w-5 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
                                            checked={allChecked}
                                            ref={el => { if (el) el.indeterminate = isIndeterminate; }}
                                            onChange={(e) => toggleAll(e.target.checked)}
                                            />
                                        </div>
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Student Details
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Roll Number
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {students.map(student => {
                                    const isPresent = presentRolls.has(student.roll_number!);
                                    return (
                                        <tr 
                                            key={student.id} 
                                            className={`transition-colors cursor-pointer hover:bg-gray-50 ${isPresent ? 'bg-indigo-50/30' : ''}`}
                                            onClick={() => handleTogglePresence(student.roll_number!)}
                                        >
                                            <td className="p-4" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center">
                                                    <input type="checkbox"
                                                    checked={isPresent}
                                                    onChange={() => handleTogglePresence(student.roll_number!)}
                                                    className="h-5 w-5 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <img className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm" src={student.photo_url || `https://ui-avatars.com/api/?name=${student.name}&background=random`} alt={student.name} />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-semibold text-gray-900">{student.name}</div>
                                                        <div className="text-xs text-gray-500">{student.father_name || 'N/A'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    {student.roll_number}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                {isPresent ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        Present
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                        Absent
                                                    </span>
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
            
            <div className="mt-8 flex justify-end pt-4 border-t border-gray-100">
                <button 
                    onClick={handleSubmit} 
                    disabled={saving || loading || students.length === 0}
                    className="px-8 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                    {saving && <Spinner size="5" />}
                    {saving ? 'Saving...' : 'Submit Attendance'}
                </button>
            </div>
        </div>
    );
};

export default Attendance;
    