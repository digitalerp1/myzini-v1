import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../services/supabase';
import { ExamResult as ResultType, Student, Class } from '../types';
import Spinner from '../components/Spinner';
import ResultsModal from '../components/ResultsModal';
import EditIcon from '../components/icons/EditIcon';
import CheckCircleIcon from '../components/icons/CheckCircleIcon';

interface Exam {
    name: string;
    className: string;
    studentCount: number;
}

const Results: React.FC = () => {
    const [view, setView] = useState<'list' | 'entry'>('list');
    const [currentExam, setCurrentExam] = useState<{ name: string; className: string } | null>(null);
    
    const [exams, setExams] = useState<Exam[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [resultsForExam, setResultsForExam] = useState<ResultType[]>([]);
    const [allClasses, setAllClasses] = useState<Class[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
    const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    const fetchExamsList = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('exam_results').select('exam_name, class');
        if (error) {
            setError(error.message);
        } else {
            const examMap = new Map<string, Exam>();
            for (const result of data) {
                const key = `${result.exam_name}-${result.class}`;
                if (examMap.has(key)) {
                    examMap.get(key)!.studentCount++;
                } else {
                    examMap.set(key, { name: result.exam_name, className: result.class, studentCount: 1 });
                }
            }
            setExams(Array.from(examMap.values()));
        }

        // Also fetch classes for the setup modal
        const { data: classesData } = await supabase.from('classes').select('*').order('class_name');
        if(classesData) setAllClasses(classesData as Class[]);

        setLoading(false);
    }, []);

    useEffect(() => {
        if (view === 'list') {
            fetchExamsList();
        }
    }, [view, fetchExamsList]);

    const handleStartNewExam = (examName: string, className: string) => {
        setCurrentExam({ name: examName, className: className });
        setView('entry');
        setIsSetupModalOpen(false);
    };
    
    const handleManageExam = (exam: Exam) => {
        setCurrentExam({ name: exam.name, className: exam.className });
        setView('entry');
    };

    const handleBackToList = () => {
        setView('list');
        setCurrentExam(null);
        setStudents([]);
        setResultsForExam([]);
    };
    
    const openResultsModal = (student: Student) => {
        setSelectedStudent(student);
        setIsResultsModalOpen(true);
    };

    const closeResultsModal = () => {
        setIsResultsModalOpen(false);
        setSelectedStudent(null);
    };

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };
    
    // This effect runs when the view changes to 'entry'
    useEffect(() => {
        if (view === 'entry' && currentExam) {
            const fetchEntryData = async () => {
                setLoading(true);
                try {
                    const [studentsRes, resultsRes] = await Promise.all([
                        supabase.from('students').select('*').eq('class', currentExam.className).order('roll_number'),
                        supabase.from('exam_results').select('*').eq('exam_name', currentExam.name).eq('class', currentExam.className)
                    ]);
                    if (studentsRes.error) throw studentsRes.error;
                    if (resultsRes.error) throw resultsRes.error;
                    setStudents(studentsRes.data as Student[]);
                    setResultsForExam(resultsRes.data as ResultType[]);
                } catch (err: any) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };
            fetchEntryData();
        }
    }, [view, currentExam]);

    // UI for List View
    const renderListView = () => (
        <>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Exam Results</h1>
                <button onClick={() => setIsSetupModalOpen(true)} className="px-5 py-2.5 bg-primary text-white font-semibold rounded-md hover:bg-primary-dark transition-colors">
                    Add/Manage Exam Results
                </button>
            </div>
            {message && <div className={`p-4 mb-4 text-sm rounded-md ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{message.text}</div>}
            {loading ? <div className="flex justify-center items-center h-96"><Spinner size="12" /></div> :
             error ? <div className="text-center text-red-500">{error}</div> :
             exams.length === 0 ? (
                <div className="text-center text-gray-500 h-96 flex flex-col justify-center items-center">
                    <h2 className="mt-4 text-xl font-semibold">No Exams Found</h2>
                    <p className="mt-2">Get started by adding results for a new exam.</p>
                </div>
             ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="th">Exam Name</th>
                                <th className="th">Class</th>
                                <th className="th">Results Entered</th>
                                <th className="th text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {exams.map(exam => (
                                <tr key={`${exam.name}-${exam.className}`}>
                                    <td className="td font-medium">{exam.name}</td>
                                    <td className="td">{exam.className}</td>
                                    <td className="td">{exam.studentCount}</td>
                                    <td className="td text-center">
                                        <button onClick={() => handleManageExam(exam)} className="px-4 py-2 bg-primary text-white text-sm rounded-md hover:bg-primary-dark">
                                            Manage
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {isSetupModalOpen && <ExamSetupModal classes={allClasses} onClose={() => setIsSetupModalOpen(false)} onStart={handleStartNewExam} />}
        </>
    );

    // UI for Entry View
    const renderEntryView = () => {
        const studentResultsMap = new Map(resultsForExam.map(r => [r.roll_number, r]));

        return (
            <>
                <div className="flex items-center mb-6">
                    <button onClick={handleBackToList} className="mr-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">&larr; Back</button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">{currentExam?.name}</h1>
                        <p className="text-lg text-gray-600">Entering Results for Class {currentExam?.className}</p>
                    </div>
                </div>
                 {message && <div className={`p-4 mb-4 text-sm rounded-md ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{message.text}</div>}

                {loading ? <div className="flex justify-center items-center h-96"><Spinner size="12" /></div> :
                 error ? <div className="text-center text-red-500">{error}</div> :
                 students.length === 0 ? <p className="text-gray-500 text-center py-10">No students found for this class.</p> :
                 (
                    <div className="overflow-x-auto">
                         <table className="min-w-full bg-white border border-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="th">Status</th>
                                    <th className="th">Student Name</th>
                                    <th className="th">Roll No.</th>
                                    <th className="th text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {students.map(student => {
                                    const hasResult = student.roll_number ? studentResultsMap.has(student.roll_number) : false;
                                    return (
                                        <tr key={student.id} className={hasResult ? 'bg-green-50' : ''}>
                                            <td className="td text-center">
                                                {hasResult ? <CheckCircleIcon /> : <EditIcon />}
                                            </td>
                                            <td className="td font-medium">{student.name}</td>
                                            <td className="td">{student.roll_number || 'N/A'}</td>
                                            <td className="td text-center">
                                                <button onClick={() => openResultsModal(student)} className="text-indigo-600 hover:text-indigo-900 font-semibold">
                                                    {hasResult ? 'Edit Marks' : 'Add Marks'}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                 )}
                {isResultsModalOpen && selectedStudent && currentExam && (
                    <ResultsModal
                        result={studentResultsMap.get(selectedStudent.roll_number!) || null}
                        student={selectedStudent}
                        examName={currentExam.name}
                        existingSubjects={resultsForExam[0]?.subjects_marks.subjects.map(s => s.subject_name) || []}
                        onClose={closeResultsModal}
                        onSave={() => {
                            showMessage('success', `Result for ${selectedStudent.name} saved successfully.`);
                            closeResultsModal();
                            // Refetch results for the exam to update the list status
                            if (currentExam) {
                                supabase.from('exam_results').select('*').eq('exam_name', currentExam.name).eq('class', currentExam.className)
                                    .then(({ data }) => setResultsForExam(data as ResultType[]));
                            }
                        }}
                    />
                )}
            </>
        );
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg">
            {view === 'list' ? renderListView() : renderEntryView()}
            <style>{`
                .th { padding: 0.75rem 1rem; text-align: left; font-size: 0.75rem; font-weight: 500; color: #6B7280; text-transform: uppercase; }
                .td { padding: 1rem 1rem; font-size: 0.875rem; white-space: nowrap; }
            `}</style>
        </div>
    );
};

// A simple modal for setting up the exam name and class
interface ExamSetupModalProps {
    classes: Class[];
    onClose: () => void;
    onStart: (examName: string, className: string) => void;
}

const ExamSetupModal: React.FC<ExamSetupModalProps> = ({ classes, onClose, onStart }) => {
    const [examName, setExamName] = useState('');
    const [className, setClassName] = useState(classes[0]?.class_name || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (examName && className) {
            onStart(examName, className);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Add or Manage Results</h2>
                <p className="text-gray-600 mb-6">Enter an exam name and select a class to begin adding or editing results.</p>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                         <div>
                            <label className="label">Exam Name</label>
                            <input type="text" value={examName} onChange={e => setExamName(e.target.value)} required className="input-field" placeholder="e.g., Mid-Term Exam 2024"/>
                        </div>
                        <div>
                            <label className="label">Class</label>
                            <select value={className} onChange={e => setClassName(e.target.value)} required className="input-field">
                                {classes.map(c => <option key={c.id} value={c.class_name}>{c.class_name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end items-center gap-4 mt-8">
                        <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">Continue</button>
                    </div>
                </form>
            </div>
             <style>{`
                .label { display: block; margin-bottom: 0.25rem; font-size: 0.875rem; font-weight: 500; color: #374151; }
                .input-field { display: block; width: 100%; padding: 0.5rem 0.75rem; border-radius: 0.375rem; border: 1px solid #D1D5DB; }
            `}</style>
        </div>
    );
};

export default Results;
