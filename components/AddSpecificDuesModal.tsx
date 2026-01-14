
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { Class, Student } from '../types';
import Spinner from './Spinner';

interface AddSpecificDuesModalProps {
    onClose: () => void;
    onSuccess: (studentCount: number, months: string[]) => void;
}

const monthNames = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

const AddSpecificDuesModal: React.FC<AddSpecificDuesModalProps> = ({ onClose, onSuccess }) => {
    const [classes, setClasses] = useState<Class[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    
    // Changed from single string to array of strings
    const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
    const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
    const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchClasses = async () => {
            const { data, error } = await supabase.from('classes').select('*').order('class_name');
            if (error) {
                setError(error.message);
            } else {
                setClasses(data as Class[]);
            }
            setLoading(false);
        };
        fetchClasses();
    }, []);

    // Fetch students whenever the list of selected classes changes
    const fetchStudentsForClasses = useCallback(async (classList: string[]) => {
        if (classList.length === 0) {
            setStudents([]);
            setSelectedStudentIds([]); // Clear selected students if no class
            return;
        }
        setLoadingStudents(true);
        
        // Use .in() to fetch students from multiple classes
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .in('class', classList)
            .order('name');

        if (error) {
            setError(error.message);
        } else {
            setStudents(data as Student[]);
            setSelectedStudentIds([]); // Reset selections when class filter changes
        }
        setLoadingStudents(false);
    }, []);

    const handleClassToggle = (className: string) => {
        const newSelection = selectedClasses.includes(className)
            ? selectedClasses.filter(c => c !== className)
            : [...selectedClasses, className];
        
        setSelectedClasses(newSelection);
        fetchStudentsForClasses(newSelection);
    };

    const toggleAllClasses = () => {
        if (selectedClasses.length === classes.length) {
            setSelectedClasses([]);
            fetchStudentsForClasses([]);
        } else {
            const allClasses = classes.map(c => c.class_name);
            setSelectedClasses(allClasses);
            fetchStudentsForClasses(allClasses);
        }
    };

    const handleMonthToggle = (month: string) => {
        setSelectedMonths(prev => prev.includes(month) ? prev.filter(m => m !== month) : [...prev, month]);
    };

    const toggleAllMonths = () => {
        setSelectedMonths(prev => prev.length === monthNames.length ? [] : [...monthNames]);
    };

    const handleStudentToggle = (studentId: number) => {
        setSelectedStudentIds(prev => prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]);
    };
    
    const toggleAllStudents = () => {
        setSelectedStudentIds(prev => prev.length === students.length ? [] : students.map(s => s.id));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedClasses.length === 0 || selectedMonths.length === 0 || selectedStudentIds.length === 0) {
            setError("Please select at least one class, one month, and one student.");
            return;
        }

        setSaving(true);
        setError(null);
        
        try {
            const updateObject: { [key: string]: string } = {};
            selectedMonths.forEach(month => {
                updateObject[month] = 'Dues';
            });

            const { error: updateError } = await supabase
                .from('students')
                .update(updateObject)
                .in('id', selectedStudentIds);
            
            if (updateError) throw updateError;
            
            onSuccess(selectedStudentIds.length, selectedMonths);

        } catch (err: any) {
            setError(`Failed to add dues: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-6 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-gray-800">Add Dues to Specific Students</h2>
                    <button onClick={onClose} disabled={saving} className="text-gray-500 hover:text-gray-800 text-3xl">&times;</button>
                </div>

                {error && <div className="p-3 mb-4 text-sm bg-red-100 text-red-700 rounded-md">{error}</div>}
                
                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto space-y-6 pr-2 -mr-2">
                    {loading ? <div className="flex justify-center"><Spinner /></div> : (
                        <>
                            {/* 1. Class Selection */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-700">1. Select Classes</label>
                                    <button type="button" onClick={toggleAllClasses} disabled={saving} className="text-sm font-medium text-primary hover:text-primary-dark disabled:text-gray-400">
                                        {selectedClasses.length === classes.length ? 'Deselect All' : 'Select All'}
                                    </button>
                                </div>
                                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 border border-gray-200 p-3 rounded-md max-h-40 overflow-y-auto">
                                    {classes.map(c => (
                                        <label key={c.id} className={`flex items-center space-x-2 p-1.5 rounded-md ${saving ? 'cursor-not-allowed' : 'hover:bg-gray-100 cursor-pointer'}`}>
                                            <input 
                                                type="checkbox" 
                                                checked={selectedClasses.includes(c.class_name)} 
                                                onChange={() => handleClassToggle(c.class_name)} 
                                                disabled={saving} 
                                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                            />
                                            <span className="text-sm">{c.class_name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* 2. Month Selection */}
                            <div className={selectedClasses.length === 0 ? 'opacity-50' : ''}>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-700">2. Select Months</label>
                                    <button type="button" onClick={toggleAllMonths} disabled={selectedClasses.length === 0 || saving} className="text-sm font-medium text-primary hover:text-primary-dark disabled:text-gray-400">
                                        {selectedMonths.length === monthNames.length ? 'Deselect All' : 'Select All'}
                                    </button>
                                </div>
                                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 border border-gray-200 p-3 rounded-md">
                                    {monthNames.map(month => (
                                        <label key={month} className={`flex items-center space-x-2 p-1.5 rounded-md ${selectedClasses.length === 0 || saving ? 'cursor-not-allowed' : 'hover:bg-gray-100 cursor-pointer'}`}>
                                            <input type="checkbox" checked={selectedMonths.includes(month)} onChange={() => handleMonthToggle(month)} disabled={selectedClasses.length === 0 || saving} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"/>
                                            <span className="text-sm capitalize">{month}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            
                            {/* 3. Student Selection */}
                            <div className={selectedClasses.length === 0 ? 'opacity-50' : ''}>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-700">3. Select Students ({students.length} found)</label>
                                    <button type="button" onClick={toggleAllStudents} disabled={selectedClasses.length === 0 || saving || loadingStudents} className="text-sm font-medium text-primary hover:text-primary-dark disabled:text-gray-400">
                                        {selectedStudentIds.length === students.length && students.length > 0 ? 'Deselect All' : 'Select All'}
                                    </button>
                                </div>
                                <div className="mt-2 border border-gray-200 p-3 rounded-md h-64 overflow-y-auto">
                                    {loadingStudents ? <div className="flex justify-center items-center h-full"><Spinner/></div> :
                                     selectedClasses.length === 0 ? <p className="text-center text-gray-500">Please select classes above to load students.</p> :
                                     students.length === 0 ? <p className="text-center text-gray-500">No students found in the selected classes.</p> :
                                     (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
                                            {students.map(student => (
                                                <label key={student.id} className="flex items-center space-x-2 p-1.5 rounded-md hover:bg-gray-100 cursor-pointer">
                                                    <input type="checkbox" checked={selectedStudentIds.includes(student.id)} onChange={() => handleStudentToggle(student.id)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"/>
                                                    <span className="text-sm">
                                                        {student.name} 
                                                        <span className="text-xs text-gray-500 block ml-6">({student.class} - R:{student.roll_number})</span>
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                     )
                                    }
                                </div>
                            </div>
                        </>
                    )}
                </form>

                <div className="flex-shrink-0 flex justify-end items-center gap-4 pt-6 border-t mt-6">
                    <button type="button" onClick={onClose} disabled={saving} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={saving || selectedClasses.length === 0 || selectedMonths.length === 0 || selectedStudentIds.length === 0} className="px-6 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 disabled:bg-gray-400 flex items-center gap-2">
                        {saving && <Spinner size="5" />}
                        {saving ? 'Adding Dues...' : 'Confirm and Add Dues'}
                    </button>
                </div>
            </div>
            <style>{`
                .input-field {
                    display: block; width: 100%; padding: 0.5rem 0.75rem; border-radius: 0.375rem;
                    border-width: 1px; border-color: #D1D5DB; background-color: white;
                    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
                }
                .input-field:focus { border-color: #4f46e5; --tw-ring-color: #4f46e5; }
                .input-field:disabled { background-color: #f3f4f6; cursor: not-allowed; }
            `}</style>
        </div>
    );
};

export default AddSpecificDuesModal;
