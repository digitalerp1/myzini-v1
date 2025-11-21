
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../services/supabase';
import { ExamResult, Student, OwnerProfile } from '../../types';
import { generateMarksheetsPdf, ResultWithStudent } from '../../services/pdfService';
import Spinner from '../Spinner';

// Import all templates for previewing
import { MarksheetTemplateClassic } from './templates/MarksheetTemplateClassic';
import { MarksheetTemplateModern } from './templates/MarksheetTemplateModern';
import { MarksheetTemplateProfessional } from './templates/MarksheetTemplateProfessional';
import { MarksheetTemplateMinimalist } from './templates/MarksheetTemplateMinimalist';
import { MarksheetTemplateCreative } from './templates/MarksheetTemplateCreative';
import { MarksheetTemplateGrid } from './templates/MarksheetTemplateGrid';
import { MarksheetTemplateOfficial } from './templates/MarksheetTemplateOfficial';

interface ExamInfo {
    key: string;
    name: string;
    className: string;
}

const marksheetTemplates = [
    { id: 'classic', label: 'Classic Formal', component: MarksheetTemplateClassic },
    { id: 'modern', label: 'Modern Clean', component: MarksheetTemplateModern },
    { id: 'professional', label: 'Professional', component: MarksheetTemplateProfessional },
    { id: 'minimalist', label: 'Minimalist', component: MarksheetTemplateMinimalist },
    { id: 'creative', label: 'Creative', component: MarksheetTemplateCreative },
    { id: 'grid', label: 'Detailed Grid', component: MarksheetTemplateGrid },
    { id: 'official', label: 'Government Style', component: MarksheetTemplateOfficial },
];

// Dummy data for rendering realistic previews
const previewStudent: Student = {
    id: 1, uid: '', name: 'Amit Singh', class: 'Class X', roll_number: '101',
    photo_url: `https://ui-avatars.com/api/?name=Amit+Singh&background=e8e8e8&color=555&size=128&bold=true`,
    father_name: 'Mr. Vijay Singh', mobile: '9876543210', registration_date: new Date().toISOString(),
};
const previewResult: ExamResult = {
    id: 1, uid: '', exam_name: 'Mid-Term Examination', class: 'Class X', roll_number: '101',
    subjects_marks: { subjects: [
        { subject_name: 'English', total_marks: 100, pass_marks: 33, obtained_marks: 85 },
        { subject_name: 'Mathematics', total_marks: 100, pass_marks: 33, obtained_marks: 92 },
        { subject_name: 'Science', total_marks: 100, pass_marks: 33, obtained_marks: 88 },
        { subject_name: 'Social Studies', total_marks: 100, pass_marks: 33, obtained_marks: 78 },
        { subject_name: 'Hindi', total_marks: 100, pass_marks: 33, obtained_marks: 81 },
    ]},
    created_at: new Date().toISOString(),
};
const previewSchool: OwnerProfile = {
    uid: '', school_name: 'Apex International School', mobile_number: '0123-456-789',
    address: '123 Education Lane, Knowledge City, 110011', website: 'www.your-school.com',
    school_image_url: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzRmNDZlNSI+PHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgMTJjLTIuNzYgMC01LTIuMjQtNS01czIuMjQtNSA1LTUgNSAyLjI0IDUgNS0yLjI0IDUtNSA1eiIvPjwvc3ZnPg==`,
};

const MarksheetGenerator: React.FC = () => {
    const [exams, setExams] = useState<ExamInfo[]>([]);
    const [selectedExamKey, setSelectedExamKey] = useState('');
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState(marksheetTemplates[0].id);

    useEffect(() => {
        const fetchExams = async () => {
            setLoading(true);
            const { data, error } = await supabase.from('exam_results').select('exam_name, class');
            if (error) {
                setError(error.message);
            } else {
                const examMap = new Map<string, ExamInfo>();
                for (const result of data) {
                    const key = `${result.exam_name}|${result.class}`;
                    if (!examMap.has(key)) {
                        examMap.set(key, { key, name: result.exam_name, className: result.class });
                    }
                }
                setExams(Array.from(examMap.values()));
            }
            setLoading(false);
        };
        fetchExams();
    }, []);

    const handleGenerate = async () => {
        if (!selectedExamKey) {
            setError("Please select an exam.");
            return;
        }
        setGenerating(true);
        setProgress(0);
        setError(null);
        setMessage("Fetching data...");

        try {
            const [examName, className] = selectedExamKey.split('|');
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not authenticated.");

            const [resultsRes, studentsRes, profileRes] = await Promise.all([
                supabase.from('exam_results').select('*').eq('exam_name', examName).eq('class', className),
                supabase.from('students').select('*').eq('class', className),
                supabase.from('owner').select('*').eq('uid', user.id).single()
            ]);

            if (resultsRes.error) throw resultsRes.error;
            if (studentsRes.error) throw studentsRes.error;
            if (profileRes.error) throw profileRes.error;

            const results = resultsRes.data as ExamResult[];
            const students = studentsRes.data as Student[];
            const schoolProfile = profileRes.data as OwnerProfile;

            if (results.length === 0) throw new Error("No results found for the selected exam.");

            const studentsMap = new Map(students.map(s => [s.roll_number, s]));
            const resultsWithStudentData: ResultWithStudent[] = results
                .map(result => ({ ...result, student: studentsMap.get(result.roll_number) as Student }))
                .filter(r => r.student); // Filter out results where student wasn't found

            await generateMarksheetsPdf(resultsWithStudentData, schoolProfile, selectedTemplate, (p) => {
                setProgress(p);
                setMessage(`Generating ${results.length} marksheets... ${p}%`);
            });

            setMessage("Marksheets generated successfully!");

        } catch (err: any) {
            setError(err.message);
        } finally {
            setGenerating(false);
            setTimeout(() => setMessage(null), 5000);
        }
    };
    
    const TemplatePreview: React.FC<{ template: typeof marksheetTemplates[0]; isSelected: boolean; onSelect: () => void; }> = ({ template, isSelected, onSelect }) => (
        <div onClick={onSelect} className={`cursor-pointer rounded-lg p-3 border-2 transition-all ${isSelected ? 'border-primary shadow-2xl bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}>
            <div className="w-full h-48 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden pointer-events-none">
                <div style={{ transform: 'scale(0.35)', transformOrigin: 'top center' }}>
                    <template.component student={previewStudent} school={previewSchool} result={previewResult} />
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
                    <label className="block text-lg font-bold text-gray-800 mb-4">1. Choose a Marksheet Template</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                        {marksheetTemplates.map(template => (
                           <TemplatePreview key={template.id} template={template} isSelected={selectedTemplate === template.id} onSelect={() => setSelectedTemplate(template.id)} />
                        ))}
                    </div>
                </div>

                <div>
                    <label htmlFor="exam-select" className="block text-lg font-bold text-gray-800">2. Select an Exam</label>
                    {loading ? <Spinner /> : (
                        <select
                            id="exam-select"
                            value={selectedExamKey}
                            onChange={(e) => setSelectedExamKey(e.target.value)}
                            className="mt-2 block w-full px-4 py-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-base"
                        >
                            <option value="" disabled>-- Choose an exam --</option>
                            {exams.map(e => <option key={e.key} value={e.key}>{e.name} - {e.className}</option>)}
                        </select>
                    )}
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={generating || !selectedExamKey}
                    className="w-full px-6 py-4 bg-secondary text-white text-lg font-semibold rounded-md hover:bg-green-600 transition-colors flex items-center justify-center gap-3 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {generating ? <Spinner size="5" /> : '3. Generate Marksheets PDF'}
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

export default MarksheetGenerator;
