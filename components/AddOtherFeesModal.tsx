import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { Class, Student, FeeType, OtherFee } from '../types';
import Spinner from './Spinner';

interface AddOtherFeesModalProps {
    onClose: () => void;
    onSuccess: (studentCount: number, feeName: string) => void;
}

const AddOtherFeesModal: React.FC<AddOtherFeesModalProps> = ({ onClose, onSuccess }) => {
    const [classes, setClasses] = useState<Class[]>([]);
    const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
    const [students, setStudents] = useState<Student[]>([]);

    const [selectedClassIds, setSelectedClassIds] = useState<number[]>([]);
    const [selectedFeeTypeId, setSelectedFeeTypeId] = useState<number | ''>('');
    const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [classesRes, feesRes] = await Promise.all([
                    supabase.from('classes').select('*').order('class_name'),
                    supabase.from('fees_types').select('*').order('fees_name')
                ]);
                if (classesRes.error) throw classesRes.error;
                if (feesRes.error) throw feesRes.error;
                setClasses(classesRes.data as Class[]);
                setFeeTypes(feesRes.data as FeeType[]);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    const handleClassChange = useCallback(async (classIds: number[]) => {
        setSelectedClassIds(classIds);
        setSelectedStudentIds([]);
        if (classIds.length === 0) {
            setStudents([]);
            return;
        }
        setLoadingStudents(true);
        const { data, error } = await supabase.from('students').select('*').in('class', classIds.map(id => classes.find(c=> c.id === id)?.class_name)).order('name');
        if (error) {
            setError(error.message);
        } else {
            setStudents(data as Student[]);
        }
        setLoadingStudents(false);
    }, [classes]);

    const handleToggleClass = (classId: number) => {
        const newSelection = selectedClassIds.includes(classId)
            ? selectedClassIds.filter(id => id !== classId)
            : [...selectedClassIds, classId];
        handleClassChange(newSelection);
    };

    const handleStudentToggle = (studentId: number) => {
        setSelectedStudentIds(prev => prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]);
    };
    
    const toggleAllStudents = () => {
        setSelectedStudentIds(prev => prev.length === students.length ? [] : students.map(s => s.id));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedStudentIds.length === 0 || !selectedFeeTypeId) {
            setError("Please select students and a fee type.");
            return;
        }

        setSaving(true);
        setError(null);
        
        try {
            const selectedFeeType = feeTypes.find(f => f.id === selectedFeeTypeId);
            if (!selectedFeeType) throw new Error("Selected fee type not found.");

            const { data: studentsToUpdate, error: fetchError } = await supabase
                .from('students')
                .select('id, other_fees')
                .in('id', selectedStudentIds);
            
            if(fetchError) throw fetchError;

            const updates = studentsToUpdate.map(student => {
                const newFee: OtherFee = {
                    fees_name: selectedFeeType.fees_name,
                    amount: selectedFeeType.amount,
                    dues_date: new Date().toISOString(),
                };
                const existingFees = student.other_fees || [];
                return {
                    id: student.id,
                    other_fees: [...existingFees, newFee],
                };
            });

            const { error: updateError } = await supabase.from('students').upsert(updates);
            if (updateError) throw updateError;
            
            onSuccess(selectedStudentIds.length, selectedFeeType.fees_name);

        } catch (err: any) {
            setError(`Failed to add fees: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="flex-shrink-0 flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Add Other Fees</h2>
                    <button onClick={onClose} disabled={saving} className="text-gray-500 hover:text-gray-800 text-3xl">&times;</button>
                </div>

                {error && <div className="p-3 mb-4 text-sm bg-red-100 text-red-700 rounded-md">{error}</div>}
                
                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto space-y-6 pr-2 -mr-2">
                    {loading ? <div className="flex justify-center"><Spinner /></div> : (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">1. Select Fee Type</label>
                                <select value={selectedFeeTypeId} onChange={e => setSelectedFeeTypeId(Number(e.target.value))} required className="mt-1 input-field" disabled={saving}>
                                    <option value="">-- Choose a fee --</option>
                                    {feeTypes.map(f => <option key={f.id} value={f.id}>{f.fees_name} (₹{f.amount})</option>)}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700">2. Select Classes</label>
                                <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 gap-2 border border-gray-200 p-3 rounded-md">
                                    {classes.map(c => (
                                        <label key={c.id} className={`flex items-center space-x-2 p-1.5 rounded-md ${saving ? 'cursor-not-allowed' : 'hover:bg-gray-100 cursor-pointer'}`}>
                                            <input type="checkbox" checked={selectedClassIds.includes(c.id)} onChange={() => handleToggleClass(c.id)} disabled={saving} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"/>
                                            <span className="text-sm">{c.class_name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            
                            <div className={selectedClassIds.length === 0 ? 'opacity-50' : ''}>
                                <div className="flex justify-between items-center">
                                    <label className="block text-sm font-medium text-gray-700">3. Select Students</label>
                                    <button type="button" onClick={toggleAllStudents} disabled={selectedClassIds.length === 0 || saving || loadingStudents} className="text-sm font-medium text-primary hover:text-primary-dark disabled:text-gray-400">
                                        {selectedStudentIds.length === students.length && students.length > 0 ? 'Deselect All' : 'Select All'}
                                    </button>
                                </div>
                                <div className="mt-2 border border-gray-200 p-3 rounded-md h-56 overflow-y-auto">
                                    {loadingStudents ? <div className="flex justify-center items-center h-full"><Spinner/></div> :
                                     selectedClassIds.length === 0 ? <p className="text-center text-gray-500">Select a class to see students.</p> :
                                     students.length === 0 ? <p className="text-center text-gray-500">No students found.</p> :
                                     (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
                                            {students.map(student => (
                                                <label key={student.id} className="flex items-center space-x-2 p-1.5 rounded-md hover:bg-gray-100 cursor-pointer">
                                                    <input type="checkbox" checked={selectedStudentIds.includes(student.id)} onChange={() => handleStudentToggle(student.id)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"/>
                                                    <span className="text-sm">{student.name}</span>
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
                    <button onClick={handleSubmit} disabled={saving || selectedStudentIds.length === 0 || !selectedFeeTypeId} className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 flex items-center gap-2">
                        {saving && <Spinner size="5" />}
                        {saving ? 'Adding Fees...' : 'Confirm and Add Fees'}
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

export default AddOtherFeesModal;
