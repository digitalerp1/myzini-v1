import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { ExamResult, SubjectMarks, Student, Subject } from '../types';
import Spinner from './Spinner';
import DeleteIcon from './icons/DeleteIcon';

interface ResultsModalProps {
    result: ExamResult | null;
    student: Student;
    examName: string;
    existingSubjects: string[]; // Subjects from another result for the same exam
    onClose: () => void;
    onSave: () => void;
}

const ResultsModal: React.FC<ResultsModalProps> = ({ result, student, examName, existingSubjects, onClose, onSave }) => {
    const [subjects, setSubjects] = useState<Partial<SubjectMarks>[]>(
        result?.subjects_marks?.subjects || 
        (existingSubjects.length > 0 ? existingSubjects.map(s => ({ subject_name: s, total_marks: 100, pass_marks: 33, obtained_marks: '' })) :
        [{ subject_name: '', total_marks: 100, pass_marks: 33, obtained_marks: '' }])
    );
    const [dbSubjects, setDbSubjects] = useState<Subject[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSubjects = async () => {
            setLoading(true);
            const { data, error } = await supabase.from('subjects').select('*').order('subject_name');
            if (error) {
                setError(error.message);
            } else {
                setDbSubjects(data as Subject[]);
            }
            setLoading(false);
        };
        fetchSubjects();
    }, []);

    const handleSubjectChange = (index: number, field: keyof SubjectMarks, value: string | number) => {
        const newSubjects = [...subjects];
        newSubjects[index] = { ...newSubjects[index], [field]: value };
        setSubjects(newSubjects);
    };

    const addSubjectRow = () => {
        setSubjects([...subjects, { subject_name: '', total_marks: 100, pass_marks: 33, obtained_marks: '' }]);
    };

    const removeSubjectRow = (index: number) => {
        if (subjects.length > 1) {
            setSubjects(subjects.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!student?.class || !student?.roll_number) {
            setError("Student information is missing.");
            return;
        }

        const invalidSubject = subjects.some(s => !s.subject_name || s.obtained_marks === '' || s.total_marks === '' || s.pass_marks === '');
        if (invalidSubject) {
            setError("Please ensure all subject fields are filled, including obtained marks.");
            return;
        }

        setSaving(true);
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setError("You must be logged in to save results.");
            setSaving(false);
            return;
        }

        const dataToSave = {
            uid: user.id,
            exam_name: examName,
            class: student.class,
            roll_number: student.roll_number,
            subjects_marks: {
                subjects: subjects.map(s => ({
                    subject_name: s.subject_name,
                    total_marks: Number(s.total_marks) || 0,
                    pass_marks: Number(s.pass_marks) || 0,
                    obtained_marks: Number(s.obtained_marks) || 0,
                })),
            },
        };
        
        const { error: saveError } = await supabase.from('exam_results').upsert(dataToSave, {
            onConflict: 'uid,exam_name,class,roll_number'
        });
        
        if (saveError) {
            setError(saveError.message);
        } else {
            onSave();
        }
        setSaving(false);
    };

    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-6 flex-shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Enter Marks</h2>
                        <p className="text-gray-600">For {student.name} (Roll: {student.roll_number})</p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl">&times;</button>
                </div>
                {error && <div className="p-3 mb-4 text-sm bg-red-100 text-red-700 rounded-md">{error}</div>}
                
                {loading ? <div className="flex-grow flex justify-center items-center"><Spinner size="10"/></div> :
                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto pr-2 -mr-2">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2 border-b pb-2">Subjects & Marks</h3>
                    <div className="space-y-3">
                    {subjects.map((s, index) => (
                        <div key={index} className="grid grid-cols-10 gap-2 items-center">
                            <select
                                value={s.subject_name}
                                onChange={e => handleSubjectChange(index, 'subject_name', e.target.value)}
                                className="input-field col-span-3"
                                // Disable subject selection if subjects are already set for this exam
                                disabled={existingSubjects.length > 0}
                            >
                                <option value="">Select Subject</option>
                                {dbSubjects.map(sub => <option key={sub.id} value={sub.subject_name}>{sub.subject_name}</option>)}
                            </select>
                            <input type="number" placeholder="Obtained" value={s.obtained_marks ?? ''} onChange={e => handleSubjectChange(index, 'obtained_marks', e.target.value)} required className="input-field col-span-2"/>
                            <input type="number" placeholder="Total" value={s.total_marks ?? ''} onChange={e => handleSubjectChange(index, 'total_marks', e.target.value)} required className="input-field col-span-2"/>
                            <input type="number" placeholder="Passing" value={s.pass_marks ?? ''} onChange={e => handleSubjectChange(index, 'pass_marks', e.target.value)} required className="input-field col-span-2"/>
                            <button 
                                type="button" 
                                onClick={() => removeSubjectRow(index)} 
                                className="text-red-500 hover:text-red-700 disabled:text-gray-300"
                                disabled={existingSubjects.length > 0 || subjects.length <= 1}
                            >
                                <DeleteIcon />
                            </button>
                        </div>
                    ))}
                    </div>
                    <button 
                        type="button" 
                        onClick={addSubjectRow} 
                        className="mt-4 px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        disabled={existingSubjects.length > 0}
                    >
                        + Add Subject
                    </button>
                    
                    <div className="flex justify-end items-center gap-4 mt-6 pt-4 border-t">
                        <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">Cancel</button>
                        <button type="submit" disabled={saving} className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:bg-gray-400 flex items-center gap-2">
                            {saving && <Spinner size="5" />} {saving ? 'Saving...' : 'Save Result'}
                        </button>
                    </div>
                </form>
                }
            </div>
            <style>{`
                .label { display: block; margin-bottom: 0.25rem; font-size: 0.875rem; font-weight: 500; color: #374151; }
                .input-field { display: block; width: 100%; padding: 0.5rem 0.75rem; border-radius: 0.375rem; border: 1px solid #D1D5DB; }
                .input-field:focus { border-color: #4f46e5; --tw-ring-color: #4f46e5; }
                .input-field:disabled { background-color: #F3F4F6; cursor: not-allowed; }
            `}</style>
        </div>
    );
};

export default ResultsModal;
