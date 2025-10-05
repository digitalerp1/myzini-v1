
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { Class, Student } from '../types';
import Spinner from '../components/Spinner';

const Attendance: React.FC = () => {
    const [classes, setClasses] = useState<Class[]>([]);
    const [selectedClass, setSelectedClass] = useState<Class | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [presentRolls, setPresentRolls] = useState<Set<string>>(new Set());
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const fetchClasses = useCallback(async () => {
        setLoading(true);
        setError(null);
        const { data, error } = await supabase.from('classes').select('*').order('class_name');
        if (error) {
            setError(error.message);
        } else {
            setClasses(data as Class[]);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchClasses();
    }, [fetchClasses]);

    const handleClassSelect = useCallback(async (classToSelect: Class) => {
        setLoading(true);
        setSelectedClass(classToSelect);
        setError(null);
        setMessage(null);
        
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .eq('class', classToSelect.class_name)
            .order('roll_number');

        if (error) {
            setError(error.message);
            setStudents([]);
        } else {
            // FIX: Explicitly type the student data to ensure correct type inference downstream.
            const studentData: Student[] = data || [];
            const validStudents = studentData.filter(s => s.roll_number);
            setStudents(validStudents);
            // By default, mark all students as present
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

    const markAll = (present: boolean) => {
        if (present) {
            const allRolls = new Set(students.map(s => s.roll_number!));
            setPresentRolls(allRolls);
        } else {
            setPresentRolls(new Set());
        }
    };
    
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
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-gray-800">Take Attendance</h1>
                <p className="text-gray-600">Select a class to begin marking attendance for today.</p>
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {classes.map(c => (
                        <div 
                            key={c.id} 
                            onClick={() => handleClassSelect(c)}
                            className="bg-white p-6 rounded-xl shadow-lg cursor-pointer hover:shadow-xl hover:border-primary border-2 border-transparent transition-all transform hover:-translate-y-1 flex flex-col items-center justify-center aspect-square"
                        >
                            <h2 className="text-2xl font-bold text-gray-800 text-center">{c.class_name}</h2>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    
    // View for marking attendance for a selected class
    return (
        <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <button onClick={() => setSelectedClass(null)} className="mb-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">
                        &larr; Back to Classes
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800">
                        Attendance for Class <span className="text-primary">{selectedClass.class_name}</span>
                    </h1>
                    <p className="text-gray-600">Date: {new Date().toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => markAll(true)} className="px-4 py-2 bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition-colors">Mark All Present</button>
                    <button onClick={() => markAll(false)} className="px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors">Mark All Absent</button>
                </div>
            </div>
            
             {message && (
                <div className="p-4 mb-4 text-sm rounded-md bg-green-100 text-green-700">
                    {message}
                </div>
            )}
            
            {loading ? <div className="flex justify-center items-center h-96"><Spinner size="12" /></div> :
            students.length === 0 ? <p className="text-gray-500 text-center">No students with roll numbers found in this class.</p> :
            (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {students.map(student => (
                        <label key={student.id} className="relative block border-2 rounded-lg p-3 cursor-pointer transition-all"
                            style={{borderColor: presentRolls.has(student.roll_number!) ? '#4f46e5' : '#e5e7eb'}}>
                            <input 
                                type="checkbox"
                                checked={presentRolls.has(student.roll_number!)}
                                onChange={() => handleTogglePresence(student.roll_number!)}
                                className="absolute top-2 right-2 h-5 w-5 text-primary rounded border-gray-300 focus:ring-primary"
                            />
                            <img src={student.photo_url || `https://ui-avatars.com/api/?name=${student.name}&background=random`} alt={student.name} className="w-full h-32 object-cover rounded-md mb-2"/>
                            <p className="font-bold text-gray-800 truncate">{student.name}</p>
                            <p className="text-sm text-gray-500">Roll: {student.roll_number}</p>
                        </label>
                    ))}
                </div>
            )}
            
            <div className="mt-8 flex justify-end">
                <button 
                    onClick={handleSubmit} 
                    disabled={saving || loading}
                    className="px-8 py-3 bg-primary text-white font-semibold rounded-md hover:bg-primary-dark disabled:bg-gray-400 flex items-center gap-2 transition-colors">
                    {saving && <Spinner size="5" />}
                    {saving ? 'Saving...' : 'Submit Attendance'}
                </button>
            </div>
        </div>
    );
};

export default Attendance;
