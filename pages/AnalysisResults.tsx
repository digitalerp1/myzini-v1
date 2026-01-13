
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import Spinner from '../components/Spinner';
import { SimpleBarChart } from '../components/ChartComponents';
import AcademicCapIcon from '../components/icons/AcademicCapIcon';

const AnalysisResults: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { data: results } = await supabase.from('exam_results').select('*');

            if (results) {
                const examMap = new Map<string, { total: number, count: number, passed: number }>();
                const subjectMap = new Map<string, { total: number, count: number }>();

                results.forEach(res => {
                    const totalMarks = res.subjects_marks.subjects.reduce((a:number, b:any) => a + Number(b.total_marks), 0);
                    const obtMarks = res.subjects_marks.subjects.reduce((a:number, b:any) => a + Number(b.obtained_marks), 0);
                    const percent = totalMarks > 0 ? (obtMarks / totalMarks) * 100 : 0;
                    
                    // Exam Level
                    const ex = examMap.get(res.exam_name) || { total: 0, count: 0, passed: 0 };
                    ex.total += percent;
                    ex.count++;
                    
                    // Simple pass check (if avg > 33%)
                    if (percent >= 33) ex.passed++;
                    examMap.set(res.exam_name, ex);

                    // Subject Level
                    res.subjects_marks.subjects.forEach((s: any) => {
                        const subPercent = (Number(s.obtained_marks) / Number(s.total_marks)) * 100;
                        const sub = subjectMap.get(s.subject_name) || { total: 0, count: 0 };
                        sub.total += subPercent;
                        sub.count++;
                        subjectMap.set(s.subject_name, sub);
                    });
                });

                const examPerformance = Array.from(examMap.entries()).map(([label, d]) => ({
                    label, value: Math.round(d.total / d.count)
                }));

                const passRates = Array.from(examMap.entries()).map(([label, d]) => ({
                    label, value: Math.round((d.passed / d.count) * 100)
                }));

                const subjectPerformance = Array.from(subjectMap.entries()).map(([label, d]) => ({
                    label, value: Math.round(d.total / d.count)
                })).sort((a,b) => b.value - a.value).slice(0, 10);

                setData({
                    totalExams: examMap.size,
                    examPerformance,
                    passRates,
                    subjectPerformance
                });
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    if (loading) return <div className="h-screen flex items-center justify-center"><Spinner size="12"/></div>;

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <div className="flex items-center gap-4 border-b pb-4">
                <div className="p-3 bg-indigo-100 rounded-full text-indigo-600">
                    {/* FIX: Added className support previously to AcademicCapIcon, ensuring it works here */}
                    <AcademicCapIcon className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-bold text-gray-800">Academic Results Analysis</h1>
            </div>

            {data && data.totalExams === 0 ? (
                <div className="text-center py-20 text-gray-500">No exam results uploaded yet.</div>
            ) : (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <SimpleBarChart title="Average Score by Exam (%)" data={data.examPerformance} color="bg-indigo-500" />
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <SimpleBarChart title="Pass Rate per Exam (%)" data={data.passRates} color="bg-green-500" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <SimpleBarChart title="Subject-wise Average Performance (%)" data={data.subjectPerformance} color="bg-pink-500" />
                    </div>
                </>
            )}
        </div>
    );
};

export default AnalysisResults;