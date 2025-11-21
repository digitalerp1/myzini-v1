
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabase';
import { Class, ExamResult, Student, OwnerProfile } from '../../types';
import { generateCertificatesPdf, QualifiedStudent } from '../../services/pdfService';
import Spinner from '../Spinner';
import DeleteIcon from '../icons/DeleteIcon';

// Import all templates for previewing
import { CertificateTemplateFormal } from './templates/CertificateTemplateFormal';
import { CertificateTemplateModern } from './templates/CertificateTemplateModern';
import { CertificateTemplateClassic } from './templates/CertificateTemplateClassic';
import { CertificateTemplateArtistic } from './templates/CertificateTemplateArtistic';
import { CertificateTemplateAchievement } from './templates/CertificateTemplateAchievement';
import { CertificateTemplateProfessional1 } from './templates/CertificateTemplateProfessional1';
import { CertificateTemplateProfessional2 } from './templates/CertificateTemplateProfessional2';
import { CertificateTemplateProfessional3 } from './templates/CertificateTemplateProfessional3';

interface ExamInfo { key: string; name: string; className: string; }
interface Criteria { division: string; minPercentage: number | ''; }

const certificateTemplates = [
    { id: 'formal', label: 'Formal', component: CertificateTemplateFormal },
    { id: 'modern', label: 'Modern', component: CertificateTemplateModern },
    { id: 'classic', label: 'Classic', component: CertificateTemplateClassic },
    { id: 'artistic', label: 'Artistic', component: CertificateTemplateArtistic },
    { id: 'achievement', label: 'Achievement', component: CertificateTemplateAchievement },
    { id: 'professional1', label: 'Imperial Gold', component: CertificateTemplateProfessional1 },
    { id: 'professional2', label: 'Corporate Blue', component: CertificateTemplateProfessional2 },
    { id: 'professional3', label: 'Classic Crest', component: CertificateTemplateProfessional3 },
];

const previewStudent: Student = {
    id: 1, uid: '', name: 'Ananya Gupta', class: 'Class VIII', roll_number: '801',
    photo_url: `https://ui-avatars.com/api/?name=Ananya+Gupta&background=e8e8e8&color=555&size=128&bold=true`,
    father_name: 'Mr. Sunil Gupta', registration_date: new Date().toISOString(),
};
const previewSchool: OwnerProfile = {
    uid: '', school_name: 'Heritage Valley School', mobile_number: '0123-456-789',
    address: 'Greenwood Avenue, Wisdom Town', principal_name: 'Dr. Evelyn Reed'
};


const CertificateGenerator: React.FC = () => {
    const [classes, setClasses] = useState<Class[]>([]);
    const [exams, setExams] = useState<ExamInfo[]>([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedExamKey, setSelectedExamKey] = useState('');
    const [sessionYear, setSessionYear] = useState(`${new Date().getFullYear()}-${new Date().getFullYear() + 1}`);
    const [criteria, setCriteria] = useState<Criteria[]>([
        { division: 'First Division with Distinction', minPercentage: 90 },
        { division: 'First Division', minPercentage: 75 },
        { division: 'Second Division', minPercentage: 60 },
    ]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState(certificateTemplates[0].id);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [classesRes, examsRes] = await Promise.all([
                supabase.from('classes').select('*').order('class_name'),
                supabase.from('exam_results').select('exam_name, class')
            ]);
            if (classesRes.error) throw classesRes.error;
            if (examsRes.error) throw examsRes.error;

            setClasses(classesRes.data as Class[]);
            
            const examMap = new Map<string, ExamInfo>();
            for (const result of examsRes.data) {
                const key = `${result.exam_name}|${result.class}`;
                if (!examMap.has(key)) {
                    examMap.set(key, { key, name: result.exam_name, className: result.class });
                }
            }
            setExams(Array.from(examMap.values()));

        } catch (err: any) { setError(err.message); } 
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleCriteriaChange = (index: number, field: keyof Criteria, value: string) => {
        const newCriteria = [...criteria];
        newCriteria[index] = {
            ...newCriteria[index],
            [field]: field === 'minPercentage' ? (value === '' ? '' : Number(value)) : value
        };
        setCriteria(newCriteria);
    };
    const addCriteria = () => setCriteria([...criteria, { division: '', minPercentage: '' }]);
    const removeCriteria = (index: number) => setCriteria(criteria.filter((_, i) => i !== index));

    const handleGenerate = async () => {
        if (!selectedClass || !selectedExamKey || !sessionYear) {
            setError("Please select a class, reference exam, and session year.");
            return;
        }
        setGenerating(true);
        setProgress(0);
        setError(null);
        setMessage("Fetching and processing results...");

        try {
            const [examName, className] = selectedExamKey.split('|');
            if (className !== selectedClass) {
                throw new Error("The selected reference exam does not belong to the selected class.");
            }
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
            const studentsMap = new Map((studentsRes.data as Student[]).map(s => [s.roll_number, s]));
            const schoolProfile = profileRes.data as OwnerProfile;

            const sortedCriteria = [...criteria].sort((a, b) => Number(b.minPercentage) - Number(a.minPercentage));

            const qualifiedStudents: QualifiedStudent[] = results.map(result => {
                const totalMarks = result.subjects_marks.subjects.reduce((sum, s) => sum + Number(s.total_marks), 0);
                const obtainedMarks = result.subjects_marks.subjects.reduce((sum, s) => sum + Number(s.obtained_marks), 0);
                const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;
                
                const division = sortedCriteria.find(c => c.minPercentage !== '' && percentage >= c.minPercentage)?.division;
                const student = studentsMap.get(result.roll_number);

                return (division && student) ? { student, division, percentage } : null;
            }).filter((qs): qs is QualifiedStudent => qs !== null);

            if (qualifiedStudents.length === 0) {
                throw new Error("No students met the specified criteria for certificate generation.");
            }

            setMessage(`Found ${qualifiedStudents.length} qualified students. Generating certificates...`);
            await generateCertificatesPdf(qualifiedStudents, schoolProfile, examName, sessionYear, selectedTemplate, setProgress);

            setMessage("Certificates generated successfully!");

        } catch (err: any) {
            setError(err.message);
        } finally {
            setGenerating(false);
            setTimeout(() => setMessage(null), 5000);
        }
    };

     const TemplatePreview: React.FC<{ template: typeof certificateTemplates[0]; isSelected: boolean; onSelect: () => void; }> = ({ template, isSelected, onSelect }) => (
        <div onClick={onSelect} className={`cursor-pointer rounded-lg p-3 border-2 transition-all ${isSelected ? 'border-primary shadow-2xl bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}>
            <div className="w-full h-48 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden pointer-events-none">
                <div style={{ transform: 'scale(0.4)', transformOrigin: 'center center' }}>
                    <template.component student={previewStudent} school={previewSchool} division="First Division" percentage={88.5} examName="Annual Exam" sessionYear="2023-2024" />
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
                    <label className="block text-lg font-bold text-gray-800 mb-4">1. Choose a Certificate Template</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                        {certificateTemplates.map(t => <TemplatePreview key={t.id} template={t} isSelected={selectedTemplate === t.id} onSelect={() => setSelectedTemplate(t.id)} />)}
                    </div>
                </div>

                <div>
                    <label className="block text-lg font-bold text-gray-800">2. Set Generation Parameters</label>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {loading ? <Spinner/> : (
                            <>
                                <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="input-field">
                                    <option value="">-- Select Class --</option>
                                    {classes.map(c => <option key={c.id} value={c.class_name}>{c.class_name}</option>)}
                                </select>
                                <select value={selectedExamKey} onChange={e => setSelectedExamKey(e.target.value)} className="input-field" disabled={!selectedClass}>
                                    <option value="">-- Select Reference Exam --</option>
                                    {exams.filter(e => e.className === selectedClass).map(e => <option key={e.key} value={e.key}>{e.name}</option>)}
                                </select>
                                <input type="text" value={sessionYear} onChange={e => setSessionYear(e.target.value)} placeholder="Session Year (e.g., 2023-24)" className="input-field" />
                            </>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-lg font-bold text-gray-800 mb-4">3. Define Division Criteria</label>
                    <div className="space-y-3">
                        {criteria.map((c, index) => (
                            <div key={index} className="flex items-center gap-3 bg-gray-50 p-3 rounded-md">
                                <input type="text" placeholder="Division Name" value={c.division} onChange={e => handleCriteriaChange(index, 'division', e.target.value)} className="input-field flex-grow" />
                                <span className="font-semibold text-gray-600">&ge;</span>
                                <input type="number" placeholder="%" value={c.minPercentage} onChange={e => handleCriteriaChange(index, 'minPercentage', e.target.value)} className="input-field w-28" />
                                <span className="font-semibold text-gray-600">%</span>
                                <button onClick={() => removeCriteria(index)} className="text-red-500 hover:text-red-700 disabled:text-gray-300" disabled={criteria.length <= 1}><DeleteIcon /></button>
                            </div>
                        ))}
                        <button onClick={addCriteria} className="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">+ Add Criteria</button>
                    </div>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={generating || !selectedClass || !selectedExamKey}
                    className="w-full px-6 py-4 bg-secondary text-white text-lg font-semibold rounded-md hover:bg-green-600 flex items-center justify-center gap-3 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {generating ? <Spinner size="5" /> : '4. Generate Certificates PDF'}
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
            <style>{`.input-field {
                display: block; width: 100%; padding: 0.75rem 1rem; border: 1px solid #d1d5db;
                background-color: white; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
            }`}</style>
        </div>
    );
};

export default CertificateGenerator;
