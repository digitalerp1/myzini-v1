import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { Class, Student, OwnerProfile } from '../../types';
import { generateDuesBillPdf } from '../../services/pdfService';
import Spinner from '../Spinner';

// Import all templates for previewing
import { DuesBillTemplateOfficial } from './templates/DuesBillTemplateOfficial';
import { DuesBillTemplateCompact } from './templates/DuesBillTemplateCompact';
import { DuesBillTemplateDetailed } from './templates/DuesBillTemplateDetailed';
import { DuesBillTemplateSimple } from './templates/DuesBillTemplateSimple';
import { DuesBillTemplateModern } from './templates/DuesBillTemplateModern';

const monthNames = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

const billTemplates = [
    { id: 'official', label: 'Official Formal', component: DuesBillTemplateOfficial },
    { id: 'compact', label: 'Compact Modern', component: DuesBillTemplateCompact },
    { id: 'detailed', label: 'Detailed Ledger', component: DuesBillTemplateDetailed },
    { id: 'simple', label: 'Simple B&W', component: DuesBillTemplateSimple },
    { id: 'modern', label: 'Modern Clean', component: DuesBillTemplateModern },
];

// Dummy data for rendering realistic previews
const previewStudent: Student = {
    id: 1, uid: '', name: 'Priya Sharma', class: 'Class V', roll_number: '502',
    photo_url: `https://ui-avatars.com/api/?name=Priya+Sharma&background=e8e8e8&color=555&size=128&bold=true`,
    father_name: 'Mr. Rajesh Sharma',
    mobile: '9876543210',
    registration_date: new Date().toISOString(),
    january: '2024-01-10T10:00:00Z',
    february: '2024-02-08T10:00:00Z',
    march: 'Dues',
    april: 'Dues'
};
const previewSchool: OwnerProfile = {
    uid: '', school_name: 'Vidya Mandir School', mobile_number: '0123-456-789',
    address: '456 Gyan Marg, Shiksha Nagar, 110022',
    website: 'www.your-school.com',
    school_image_url: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzRmNDZlNSI+PHBhdGggZD0iTTUgMTMuNWw3LTcgNyA3LTctNy03IDd2N2g3di03eiIvPjwvc3ZnPg==`,
};

const DuesBillGenerator: React.FC = () => {
    const [classes, setClasses] = useState<Class[]>([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(monthNames[new Date().getMonth()]);
    const [loadingClasses, setLoadingClasses] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState(billTemplates[0].id);

    useEffect(() => {
        const fetchClasses = async () => {
            setLoadingClasses(true);
            const { data, error } = await supabase.from('classes').select('*').order('class_name');
            if (error) {
                setError(error.message);
            } else {
                setClasses(data as Class[]);
            }
            setLoadingClasses(false);
        };
        fetchClasses();
    }, []);

    const handleGenerate = async () => {
        if (!selectedClass || !selectedMonth) {
            setError("Please select a class and a month.");
            return;
        }
        setGenerating(true);
        setProgress(0);
        setError(null);
        setMessage("Fetching student and school data...");

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not authenticated.");

            const [studentsRes, profileRes, allClassesRes] = await Promise.all([
                supabase.from('students').select('*').eq('class', selectedClass).order('roll_number'),
                supabase.from('owner').select('*').eq('uid', user.id).single(),
                supabase.from('classes').select('*')
            ]);

            if (studentsRes.error) throw studentsRes.error;
            if (profileRes.error) throw profileRes.error;
            if (allClassesRes.error) throw allClassesRes.error;

            const students = studentsRes.data as Student[];
            const schoolProfile = profileRes.data as OwnerProfile;
            const allClasses = allClassesRes.data as Class[];
            
            if (students.length === 0) {
                throw new Error("No students found in the selected class.");
            }

            await generateDuesBillPdf(students, schoolProfile, allClasses, selectedMonth, selectedTemplate, (p) => {
                 setProgress(p);
                 setMessage(`Found ${students.length} students. Generating fee bills... ${p}%`);
            });

            setMessage("Fee bills generated successfully! Your download should start shortly.");

        } catch (err: any) {
            setError(err.message);
        } finally {
            setGenerating(false);
            setProgress(0);
            setTimeout(() => setMessage(null), 5000);
        }
    };

     const TemplatePreview: React.FC<{ template: typeof billTemplates[0]; isSelected: boolean; onSelect: () => void; }> = ({ template, isSelected, onSelect }) => (
        <div onClick={onSelect} className={`cursor-pointer rounded-lg p-3 border-2 transition-all ${isSelected ? 'border-primary shadow-2xl bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}>
            <div className="w-full h-48 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden pointer-events-none">
                 <div style={{ transform: 'scale(0.55)', transformOrigin: 'center center' }}>
                    <template.component 
                        student={previewStudent} 
                        school={previewSchool} 
                        classFee={500}
                        selectedMonthIndex={monthNames.indexOf(selectedMonth)}
                    />
                </div>
            </div>
            <div className="flex items-center justify-center mt-3">
                 <input type="radio" name="bill_template" checked={isSelected} readOnly className="h-4 w-4 text-primary focus:ring-primary border-gray-300"/>
                 <label className="ml-2 block text-sm font-medium text-gray-800">{template.label}</label>
            </div>
        </div>
    );

    return (
        <div>
            {error && <div className="p-4 mb-4 text-sm rounded-md bg-red-100 text-red-700">{error}</div>}

            <div className="space-y-8">
                 <div>
                    <label className="block text-lg font-bold text-gray-800 mb-4">1. Choose a Bill Template</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                        {billTemplates.map(template => (
                           <TemplatePreview 
                                key={template.id}
                                template={template} 
                                isSelected={selectedTemplate === template.id} 
                                onSelect={() => setSelectedTemplate(template.id)} 
                            />
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="class-select" className="block text-lg font-bold text-gray-800">2. Select Class</label>
                        {loadingClasses ? <Spinner /> : (
                            <select
                                id="class-select"
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                className="mt-2 block w-full px-4 py-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-base"
                            >
                                <option value="" disabled>-- Choose a class --</option>
                                {classes.map(c => <option key={c.id} value={c.class_name}>{c.class_name}</option>)}
                            </select>
                        )}
                    </div>
                    <div>
                        <label htmlFor="month-select" className="block text-lg font-bold text-gray-800">3. Select Bill Month</label>
                        <select
                            id="month-select"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="mt-2 block w-full px-4 py-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-base"
                        >
                            {monthNames.map(month => <option key={month} value={month} className="capitalize">{month}</option>)}
                        </select>
                    </div>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={generating || !selectedClass}
                    className="w-full px-6 py-4 bg-secondary text-white text-lg font-semibold rounded-md hover:bg-green-600 transition-colors flex items-center justify-center gap-3 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {generating ? <Spinner size="5" /> : '4. Generate PDF'}
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

export default DuesBillGenerator;