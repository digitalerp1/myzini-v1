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
    const [selectedClass, setSelectedClass] = useState('');
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

    const handleClassChange = useCallback(async (className: string) => {
        setSelectedClass(className);
        setSelectedStudentIds([]); // Reset student selection
        if (!className) {
            setStudents([]);
            return;
        }
        setLoadingStudents(true);
        const { data, error } = await supabase.from('students').select('*').eq('class', className).order('name');
        if (error) {
            setError(error.message);
        } else {
            setStudents(data as Student[]);
        }
        setLoadingStudents(false);
    }, []);

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
        if (!selectedClass || selectedMonths.length === 0 || selectedStudentIds.length === 0) {
            setError("Please select a class, at least one month, and at least one student.");
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
                            <div>
                                <label htmlFor="class" className="block text-sm font-medium text-gray-700">1. Select Class</label>
                                <select id="class" value={selectedClass} onChange={(e) => handleClassChange(e.target.value)} required className="mt-1 input-field" disabled={saving}>
                                    <option value="">-- Choose a class --</option>
                                    {classes.map(c => <option key={c.id} value={c.class_name}>{c.class_name}</option>)}
                                </select>
                            </div>

                            <div className={!selectedClass ? 'opacity-50' : ''}>
                                <div className="flex justify-between items-center">
                                    <label className="block text-sm font-medium text-gray-700">2. Select Months</label>
                                    <button type="button" onClick={toggleAllMonths} disabled={!selectedClass || saving} className="text-sm font-medium text-primary hover:text-primary-dark disabled:text-gray-400">
                                        {selectedMonths.length === monthNames.length ? 'Deselect All' : 'Select All'}
                                    </button>
                                </div>
                                <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 gap-2 border border-gray-200 p-3 rounded-md">
                                    {monthNames.map(month => (
                                        <label key={month} className={`flex items-center space-x-2 p-1.5 rounded-md ${!selectedClass || saving ? 'cursor-not-allowed' : 'hover:bg-gray-100 cursor-pointer'}`}>
                                            <input type="checkbox" checked={selectedMonths.includes(month)} onChange={() => handleMonthToggle(month)} disabled={!selectedClass || saving} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"/>
                                            <span className="text-sm capitalize">{month}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            
                            <div className={!selectedClass ? 'opacity-50' : ''}>
                                <div className="flex justify-between items-center">
                                    <label className="block text-sm font-medium text-gray-700">3. Select Students</label>
                                    <button type="button" onClick={toggleAllStudents} disabled={!selectedClass || saving || loadingStudents} className="text-sm font-medium text-primary hover:text-primary-dark disabled:text-gray-400">
                                        {selectedStudentIds.length === students.length && students.length > 0 ? 'Deselect All' : 'Select All'}
                                    </button>
                                </div>
                                <div className="mt-2 border border-gray-200 p-3 rounded-md h-64 overflow-y-auto">
                                    {loadingStudents ? <div className="flex justify-center items-center h-full"><Spinner/></div> :
                                     !selectedClass ? <p className="text-center text-gray-500">Please select a class to see students.</p> :
                                     students.length === 0 ? <p className="text-center text-gray-500">No students found in this class.</p> :
                                     (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
                                            {students.map(student => (
                                                <label key={student.id} className="flex items-center space-x-2 p-1.5 rounded-md hover:bg-gray-100 cursor-pointer">
                                                    <input type="checkbox" checked={selectedStudentIds.includes(student.id)} onChange={() => handleStudentToggle(student.id)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"/>
                                                    <span className="text-sm">{student.name} <span className="text-gray-500">(R:{student.roll_number})</span></span>
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
                    <button onClick={handleSubmit} disabled={saving || !selectedClass || selectedMonths.length === 0 || selectedStudentIds.length === 0} className="px-6 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 disabled:bg-gray-400 flex items-center gap-2">
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