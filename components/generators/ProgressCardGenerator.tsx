
import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { Class, Student, OwnerProfile, Attendance, ExamResult } from '../../types';
import { generateProgressCardsPdf, ProgressCardData } from '../../services/pdfService';
import Spinner from '../Spinner';

// Import templates for preview
import { ProgressCardTemplateClassic } from './templates/ProgressCardTemplateClassic';
import { ProgressCardTemplateModern } from './templates/ProgressCardTemplateModern';
import { ProgressCardTemplateCreative } from './templates/ProgressCardTemplateCreative';
import { ProgressCardTemplateOfficial } from './templates/ProgressCardTemplateOfficial';
import { ProgressCardTemplateVibrant } from './templates/ProgressCardTemplateVibrant';
import { ProgressCardTemplateDetailed } from './templates/ProgressCardTemplateDetailed';

const progressTemplates = [
    { id: 'detailed', label: 'Detailed Matrix', component: ProgressCardTemplateDetailed },
    { id: 'classic', label: 'Classic', component: ProgressCardTemplateClassic },
    { id: 'modern', label: 'Modern', component: ProgressCardTemplateModern },
    { id: 'creative', label: 'Creative', component: ProgressCardTemplateCreative },
    { id: 'official', label: 'Official', component: ProgressCardTemplateOfficial },
    { id: 'vibrant', label: 'Vibrant', component: ProgressCardTemplateVibrant },
];

// Dummy data for preview
const previewData: ProgressCardData = {
    student: {
        id: 1, uid: '', name: 'Arjun Singh', class: 'Class X', roll_number: '101',
        photo_url: `https://ui-avatars.com/api/?name=Arjun+Singh&background=e8e8e8&color=555&size=128&bold=true`,
        father_name: 'Mr. Vikram Singh', registration_date: new Date().toISOString(), mobile: '9876543210', date_of_birth: '2008-08-15'
    } as Student,
    school: {
        uid: '', school_name: 'St. Xavier Public School', mobile_number: '0123-456-789',
        address: '123 School Lane, Education City', school_image_url: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzRmNDZlNSI+PHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgMTJjLTIuNzYgMC01LTIuMjQtNS01czIuMjQtNSA1LTUgNSAyLjI0IDUgNS0yLjI0IDUtNSA1eiIvPjwvc3ZnPg=="
    },
    attendanceReport: [
        { month: 'Jan', present: 22, absent: 2, holiday: 7 },
        { month: 'Feb', present: 20, absent: 1, holiday: 7 },
        { month: 'Mar', present: 23, absent: 0, holiday: 8 },
        { month: 'Apr', present: 18, absent: 4, holiday: 8 },
    ],
    examReport: [
        { examName: 'Unit Test 1', percentage: 78 },
        { examName: 'Half Yearly', percentage: 82 },
        { examName: 'Unit Test 2', percentage: 85 },
        { examName: 'Annual', percentage: 91 },
    ]
};

const ProgressCardGenerator: React.FC = () => {
    const [classes, setClasses] = useState<Class[]>([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState(progressTemplates[0].id);

    useEffect(() => {
        const fetchClasses = async () => {
            setLoading(true);
            const { data, error } = await supabase.from('classes').select('*').order('class_name');
            if (error) setError(error.message);
            else setClasses(data as Class[]);
            setLoading(false);
        };
        fetchClasses();
    }, []);

    const handleGenerate = async () => {
        if (!selectedClass) {
            setError("Please select a class.");
            return;
        }
        setGenerating(true);
        setProgress(0);
        setError(null);
        setMessage("Fetching data...");

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not authenticated.");

            const classObj = classes.find(c => c.class_name === selectedClass);
            if(!classObj) throw new Error("Class info not found.");

            // 1. Fetch Students
            const { data: students, error: studError } = await supabase
                .from('students').select('*').eq('class', selectedClass).order('roll_number');
            if (studError) throw studError;
            if (!students || students.length === 0) throw new Error("No students found in class.");

            // 2. Fetch School Profile
            const { data: school, error: schoolError } = await supabase
                .from('owner').select('*').eq('uid', user.id).single();
            if (schoolError) throw schoolError;

            // 3. Fetch Attendance for the Class (Current Year)
            const currentYear = new Date().getFullYear();
            const { data: attendance, error: attError } = await supabase
                .from('attendance')
                .select('*')
                .eq('class_id', classObj.id)
                .gte('date', `${currentYear}-01-01`)
                .lte('date', `${currentYear}-12-31`);
            if (attError) throw attError;

            // 4. Fetch All Exam Results for the Class
            const { data: exams, error: examError } = await supabase
                .from('exam_results')
                .select('*')
                .eq('class', selectedClass);
            if (examError) throw examError;

            // --- Data Processing ---
            const processedData: ProgressCardData[] = students.map(student => {
                // A. Process Attendance
                const monthStats = new Map<number, {present: number, absent: number, holiday: number}>();
                // Initialize all months to 0
                for(let m=0; m<12; m++) monthStats.set(m, {present: 0, absent: 0, holiday: 0});

                attendance?.forEach(record => {
                    const date = new Date(record.date);
                    const month = date.getMonth();
                    const stats = monthStats.get(month)!;
                    
                    const presentList = record.present ? record.present.split(',') : [];
                    const absentList = record.absent ? record.absent.split(',') : [];

                    if (presentList.includes(student.roll_number || '')) {
                        stats.present++;
                    } else if (absentList.includes(student.roll_number || '')) {
                        stats.absent++;
                    } else {
                        stats.absent++;
                    }
                });

                const attendanceReport = Array.from(monthStats.entries())
                    .sort((a, b) => a[0] - b[0])
                    .map(([monthIndex, stats]) => {
                        const daysInMonth = new Date(currentYear, monthIndex + 1, 0).getDate();
                        const today = new Date();
                        if (monthIndex > today.getMonth()) return null;
                        
                        let holidays = daysInMonth - (stats.present + stats.absent);
                        if (monthIndex === today.getMonth()) {
                            holidays = today.getDate() - (stats.present + stats.absent);
                        }
                        if (holidays < 0) holidays = 0;

                        return {
                            month: new Date(0, monthIndex).toLocaleString('default', { month: 'short' }),
                            present: stats.present,
                            absent: stats.absent,
                            holiday: holidays
                        };
                    }).filter(x => x !== null) as { month: string, present: number, absent: number, holiday: number }[];


                // B. Process Exams
                const studentExams = exams?.filter(e => e.roll_number === student.roll_number) || [];
                const examReport = studentExams.map(exam => {
                    const totalMax = exam.subjects_marks.subjects.reduce((acc: number, curr: any) => acc + Number(curr.total_marks), 0);
                    const totalObt = exam.subjects_marks.subjects.reduce((acc: number, curr: any) => acc + Number(curr.obtained_marks), 0);
                    return {
                        examName: exam.exam_name,
                        percentage: totalMax > 0 ? (totalObt / totalMax) * 100 : 0
                    };
                });

                return {
                    student: student as Student,
                    school: school as OwnerProfile,
                    attendanceReport,
                    examReport
                };
            });

            setMessage(`Generating progress cards for ${processedData.length} students...`);
            await generateProgressCardsPdf(processedData, selectedTemplate, setProgress);
            setMessage("Progress cards generated successfully!");

        } catch (err: any) {
            setError(err.message);
        } finally {
            setGenerating(false);
            setTimeout(() => setMessage(null), 5000);
        }
    };

    const TemplatePreview: React.FC<{ template: typeof progressTemplates[0]; isSelected: boolean; onSelect: () => void; }> = ({ template, isSelected, onSelect }) => (
        <div onClick={onSelect} className={`cursor-pointer rounded-lg p-3 border-2 transition-all ${isSelected ? 'border-primary shadow-2xl bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}>
            <div className="w-full h-48 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden pointer-events-none">
                <div style={{ transform: 'scale(0.3)', transformOrigin: 'top center', height: '100%' }}>
                    <template.component data={previewData} />
                </div>
            </div>
            <div className="flex items-center justify-center mt-3">
                 <input type="radio" name="template" checked={isSelected} readOnly className="h-4 w-4 text-primary focus:ring-primary border-gray-300"/>
                 <label className="ml-2 block text-sm font-medium text-gray-800">{template.label}</label>
            </div>
        </div>
    );

    return (
        <div>
            {error && <div className="p-4 mb-4 text-sm rounded-md bg-red-100 text-red-700">{error}</div>}
            
            <div className="space-y-8">
                <div>
                    <label className="block text-lg font-bold text-gray-800 mb-4">1. Choose a Template</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                        {progressTemplates.map(template => (
                           <TemplatePreview key={template.id} template={template} isSelected={selectedTemplate === template.id} onSelect={() => setSelectedTemplate(template.id)} />
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-lg font-bold text-gray-800">2. Select Class</label>
                    {loading ? <Spinner /> : (
                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="mt-2 block w-full px-4 py-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-base"
                        >
                            <option value="" disabled>-- Choose a class --</option>
                            {classes.map(c => <option key={c.id} value={c.class_name}>{c.class_name}</option>)}
                        </select>
                    )}
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={generating || !selectedClass}
                    className="w-full px-6 py-4 bg-secondary text-white text-lg font-semibold rounded-md hover:bg-green-600 flex items-center justify-center gap-3 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {generating ? <Spinner size="5" /> : '3. Generate Progress Cards'}
                </button>

                 {generating && (
                    <div className="space-y-2 pt-2">
                        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                            <div className="bg-primary h-4 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                        </div>
                        <p className="text-center text-sm font-medium text-primary">{message}</p>
                    </div>
                )}
                {!generating && message && <div className="p-4 text-sm rounded-md bg-blue-100 text-blue-700 text-center">{message}</div>}
            </div>
        </div>
    );
};

export default ProgressCardGenerator;
