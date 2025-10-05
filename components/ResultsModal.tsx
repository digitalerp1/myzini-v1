import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { ExamResult, SubjectMarks, Student } from '../types';
import Spinner from './Spinner';

interface SubjectMarkDef {
    subject_name: string;
    total_marks: number | string;
    pass_marks: number | string;
}

interface ResultsModalProps {
    result: ExamResult | null;
    student: Student;
    examName: string;
    subjectsTemplate: SubjectMarkDef[];
    onClose: () => void;
    onSave: () => void;
}

const ResultsModal: React.FC<ResultsModalProps> = ({ result, student, examName, subjectsTemplate, onClose, onSave }) => {
    const [subjects, setSubjects] = useState<Partial<SubjectMarks>[]>(() => {
         const studentMarksMap = new Map(result?.subjects_marks?.subjects.map(s => [s.subject_name, s.obtained_marks]));
        return subjectsTemplate.map(templateSubject => ({
            subject_name: templateSubject.subject_name,
            total_marks: templateSubject.total_marks,
            pass_marks: templateSubject.pass_marks,
            obtained_marks: studentMarksMap.get(templateSubject.subject_name) ?? ''
        }));
    });
    
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleObtainedMarksChange = (index: number, value: string | number) => {
        const newSubjects = [...subjects];
        newSubjects[index] = { ...newSubjects[index], obtained_marks: value };
        setSubjects(newSubjects);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!student?.class || !student?.roll_number) {
            setError("Student information is missing.");
            return;
        }

        const invalidSubject = subjects.some(s => s.obtained_marks === '' || s.obtained_marks === null || s.obtained_marks === undefined);
        if (invalidSubject) {
            setError("Please ensure obtained marks are filled for all subjects.");
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
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-6 flex-shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Enter Marks for {examName}</h2>
                        <p className="text-gray-600">Student: {student.name} (Roll: {student.roll_number})</p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl">&times;</button>
                </div>
                {error && <div className="p-3 mb-4 text-sm bg-red-100 text-red-700 rounded-md">{error}</div>}
                
                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto pr-2 -mr-2">
                    {/* Header */}
                    <div className="grid grid-cols-10 gap-2 items-center font-semibold text-gray-600 text-sm mb-2 px-2">
                        <div className="col-span-4">Subject</div>
                        <div className="col-span-2">Obtained Marks</div>
                        <div className="col-span-2 text-center">Total Marks</div>
                        <div className="col-span-2 text-center">Pass Marks</div>
                    </div>

                    <div className="space-y-3">
                    {subjects.map((s, index) => (
                        <div key={index} className="grid grid-cols-10 gap-2 items-center p-2 rounded-md bg-gray-50">
                            <div className="col-span-4 font-medium text-gray-800">{s.subject_name}</div>
                            <input 
                                type="number" 
                                placeholder="Marks" 
                                value={s.obtained_marks ?? ''} 
                                onChange={e => handleObtainedMarksChange(index, e.target.value)} 
                                required 
                                className="input-field col-span-2"
                                max={s.total_marks}
                                min={0}
                            />
                            <div className="col-span-2 text-center text-gray-700">/ {s.total_marks}</div>
                            <div className="col-span-2 text-center text-gray-500">{s.pass_marks}</div>
                        </div>
                    ))}
                    </div>
                    
                    <div className="flex justify-end items-center gap-4 mt-6 pt-4 border-t">
                        <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">Cancel</button>
                        <button type="submit" disabled={saving} className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:bg-gray-400 flex items-center gap-2">
                            {saving && <Spinner size="5" />} {saving ? 'Saving...' : 'Save Result'}
                        </button>
                    </div>
                </form>
            </div>
            <style>{`
                .input-field { display: block; width: 100%; padding: 0.5rem 0.75rem; border-radius: 0.375rem; border: 1px solid #D1D5DB; }
                .input-field:focus { border-color: #4f46e5; --tw-ring-color: #4f46e5; }
            `}</style>
        </div>
    );
};

export default ResultsModal;
