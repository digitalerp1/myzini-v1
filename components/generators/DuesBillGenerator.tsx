import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { Class, Student, OwnerProfile } from '../../types';
import { generateDuesBillPdf } from '../../services/pdfService';
import Spinner from '../Spinner';

const monthNames = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

const DuesBillGenerator: React.FC = () => {
    const [classes, setClasses] = useState<Class[]>([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(monthNames[new Date().getMonth()]);
    const [loadingClasses, setLoadingClasses] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

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

            setMessage(`Found ${students.length} students. Generating fee bills...`);

            await generateDuesBillPdf(students, schoolProfile, allClasses, selectedMonth);

            setMessage("Fee bills generated successfully! Your download should start shortly.");

        } catch (err: any) {
            setError(err.message);
        } finally {
            setGenerating(false);
            setTimeout(() => setMessage(null), 5000);
        }
    };

    return (
        <div>
            {error && <div className="p-4 mb-4 text-sm rounded-md bg-red-100 text-red-700">{error}</div>}
            {message && <div className="p-4 mb-4 text-sm rounded-md bg-blue-100 text-blue-700">{message}</div>}

            <div className="flex flex-wrap items-end gap-4">
                <div className="flex-grow">
                    <label htmlFor="class-select" className="block text-sm font-medium text-gray-700">Select Class</label>
                    {loadingClasses ? <Spinner /> : (
                        <select
                            id="class-select"
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        >
                            <option value="" disabled>-- Choose a class --</option>
                            {classes.map(c => <option key={c.id} value={c.class_name}>{c.class_name}</option>)}
                        </select>
                    )}
                </div>
                 <div className="flex-grow">
                    <label htmlFor="month-select" className="block text-sm font-medium text-gray-700">Select Bill Month</label>
                    <select
                        id="month-select"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    >
                        {monthNames.map(month => <option key={month} value={month} className="capitalize">{month}</option>)}
                    </select>
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={generating || !selectedClass}
                    className="px-6 py-2.5 bg-secondary text-white font-semibold rounded-md hover:bg-green-600 transition-colors flex items-center gap-2 disabled:bg-gray-400"
                >
                    {generating ? <Spinner size="5" /> : 'Generate'}
                </button>
            </div>
        </div>
    );
};

export default DuesBillGenerator;