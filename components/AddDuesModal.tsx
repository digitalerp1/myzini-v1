import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Class } from '../types';
import Spinner from './Spinner';

interface AddDuesModalProps {
    onClose: () => void;
    onSuccess: (className: string, months: string[]) => void;
}

const monthNames = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

const AddDuesModal: React.FC<AddDuesModalProps> = ({ onClose, onSuccess }) => {
    const [classes, setClasses] = useState<Class[]>([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // New states for UI feedback
    const [processedStudents, setProcessedStudents] = useState<string[]>([]);
    const [isComplete, setIsComplete] = useState(false);
    const [processingMessage, setProcessingMessage] = useState('');


    useEffect(() => {
        const fetchClasses = async () => {
            const { data, error } = await supabase.from('classes').select('*').order('class_name');
            if (error) {
                setError(error.message);
            } else {
                setClasses(data as Class[]);
                if (data && data.length > 0) {
                    setSelectedClass(data[0].class_name);
                }
            }
            setLoading(false);
        };
        fetchClasses();
    }, []);

    const handleMonthToggle = (month: string) => {
        setSelectedMonths(prev =>
            prev.includes(month)
                ? prev.filter(m => m !== month)
                : [...prev, month]
        );
    };

    const toggleAllMonths = () => {
        if (selectedMonths.length === monthNames.length) {
            setSelectedMonths([]);
        } else {
            setSelectedMonths([...monthNames]);
        }
    };
    
    const handleFinalClose = () => {
        onSuccess(selectedClass, selectedMonths);
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClass || selectedMonths.length === 0) {
            setError("Please select a class and at least one month.");
            return;
        }

        const confirmation = window.confirm(
            `Are you sure you want to add dues for: ${selectedMonths.join(', ')} to all unpaid students in ${selectedClass}? This action is final.`
        );

        if (!confirmation) {
            return;
        }

        setSaving(true);
        setError(null);
        setProcessedStudents([]);
        setIsComplete(false);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setError("You must be logged in to perform this action.");
            setSaving(false);
            return;
        }
        
        try {
            const uniqueStudentNames = new Set<string>();

            for (const month of selectedMonths) {
                setProcessingMessage(`Analyzing students for ${month}...`);
                const { data: studentsToUpdate, error: fetchError } = await supabase
                    .from('students')
                    .select('name')
                    .eq('uid', user.id)
                    .eq('class', selectedClass)
                    .or(`${month}.eq.undefined,${month}.is.null,${month}.eq.Dues`);

                if (fetchError) {
                    throw new Error(`Could not fetch student data for ${month}: ${fetchError.message}`);
                }

                if (studentsToUpdate && studentsToUpdate.length > 0) {
                    studentsToUpdate.forEach(s => uniqueStudentNames.add(s.name));
                    setProcessedStudents(Array.from(uniqueStudentNames).sort());

                    setProcessingMessage(`Updating records for ${month}...`);
                    const { error: updateError } = await supabase
                        .from('students')
                        .update({ [month]: 'Dues' })
                        .eq('uid', user.id)
                        .eq('class', selectedClass)
                        .or(`${month}.eq.undefined,${month}.is.null,${month}.eq.Dues`);
                    
                    if (updateError) {
                        throw new Error(`Failed to update dues for ${month}: ${updateError.message}`);
                    }
                }
            }
            
            setProcessingMessage(`Process complete. Dues added/updated for ${uniqueStudentNames.size} students.`);
            setIsComplete(true);

        } catch(err: any) {
             setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-3xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Add Dues to a Class</h2>
                    <button onClick={isComplete ? handleFinalClose : onClose} className="text-gray-500 hover:text-gray-800 text-3xl">&times;</button>
                </div>

                {error && <div className="p-3 mb-4 text-sm bg-red-100 text-red-700 rounded-md">{error}</div>}
                
                {loading ? <div className="flex justify-center"><Spinner /></div> : (
                    <>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="class" className="block text-sm font-medium text-gray-700">Class</label>
                                <select id="class" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} required className="mt-1 input-field" disabled={saving || isComplete}>
                                    {classes.map(c => <option key={c.id} value={c.class_name}>{c.class_name}</option>)}
                                </select>
                            </div>
                            <div>
                                <div className="flex justify-between items-center">
                                    <label className="block text-sm font-medium text-gray-700">Months</label>
                                    <button type="button" onClick={toggleAllMonths} disabled={saving || isComplete} className="text-sm font-medium text-primary hover:text-primary-dark disabled:text-gray-400">
                                        {selectedMonths.length === monthNames.length ? 'Deselect All' : 'Select All'}
                                    </button>
                                </div>
                                <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 gap-2 border border-gray-200 p-3 rounded-md">
                                    {monthNames.map(month => (
                                        <label key={month} className={`flex items-center space-x-2 p-1.5 rounded-md ${saving || isComplete ? 'cursor-not-allowed text-gray-400' : 'hover:bg-gray-100 cursor-pointer'}`}>
                                            <input
                                                type="checkbox"
                                                checked={selectedMonths.includes(month)}
                                                onChange={() => handleMonthToggle(month)}
                                                disabled={saving || isComplete}
                                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary disabled:bg-gray-200"
                                            />
                                            <span className="text-sm capitalize">{month}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <p className="text-sm text-yellow-700 bg-yellow-50 p-3 rounded-md">
                                <strong>Warning:</strong> This will mark fees as 'Dues' for all students in the class who haven't paid for the selected months. Paid records are not affected.
                            </p>
                            <div className="flex justify-end items-center gap-4 pt-4">
                                {!isComplete ? (
                                    <>
                                        <button type="button" onClick={onClose} disabled={saving} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50">
                                            Cancel
                                        </button>
                                        <button type="submit" disabled={saving} className="px-6 py-2 bg-secondary text-white rounded-md hover:bg-green-600 disabled:bg-gray-400 flex items-center gap-2">
                                            {saving && <Spinner size="5" />}
                                            {saving ? 'Processing...' : 'Confirm and Add Dues'}
                                        </button>
                                    </>
                                ) : (
                                    <button type="button" onClick={handleFinalClose} className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">
                                       Done
                                    </button>
                                )}
                            </div>
                        </form>
                        
                        {(saving || isComplete) && (
                            <div className="mt-6">
                                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                    {saving && <Spinner size="5" />}
                                    {processingMessage}
                                </h3>
                                {processedStudents.length > 0 && (
                                    <div className="mt-2 border rounded-md p-3 h-40 overflow-y-auto bg-gray-50">
                                        <p className="text-xs text-gray-500 mb-2">Students being updated:</p>
                                        <ul className="list-disc list-inside text-sm text-gray-700 columns-2 sm:columns-3">
                                            {processedStudents.map(name => <li key={name}>{name}</li>)}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
            <style>{`
                .input-field {
                    display: block;
                    width: 100%;
                    padding: 0.5rem 0.75rem;
                    border-radius: 0.375rem;
                    border-width: 1px;
                    border-color: #D1D5DB;
                    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
                }
                .input-field:focus {
                    border-color: #4f46e5;
                    --tw-ring-color: #4f46e5;
                }
            `}</style>
        </div>
    );
};

export default AddDuesModal;