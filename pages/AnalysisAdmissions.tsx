
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import Spinner from '../components/Spinner';
import { DonutChart, LineChart, SimpleBarChart } from '../components/ChartComponents';
import StatCard from '../components/StatCard';
import ChartBarIcon from '../components/icons/ChartBarIcon';

const AnalysisAdmissions: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { data: students } = await supabase.from('students').select('*');
            
            if (students) {
                const currentYear = new Date().getFullYear();
                const admissionTrend = new Array(12).fill(0);
                const genderMap = { 'Male': 0, 'Female': 0, 'Other': 0 };
                const casteMap = new Map<string, number>();
                const classMap = new Map<string, number>();

                students.forEach(s => {
                    // Trend
                    if (s.registration_date) {
                        const d = new Date(s.registration_date);
                        if (d.getFullYear() === currentYear) admissionTrend[d.getMonth()]++;
                    }
                    // Gender
                    if (s.gender === 'Male') genderMap['Male']++;
                    else if (s.gender === 'Female') genderMap['Female']++;
                    else genderMap['Other']++;

                    // Caste
                    const caste = s.caste || 'General';
                    casteMap.set(caste, (casteMap.get(caste) || 0) + 1);

                    // Class Strength
                    const cls = s.class || 'Unassigned';
                    classMap.set(cls, (classMap.get(cls) || 0) + 1);
                });

                const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                const trendData = admissionTrend.map((val, i) => ({ label: monthLabels[i], value: val }));
                
                const genderData = [
                    { label: 'Boys', value: genderMap['Male'], color: '#3b82f6' },
                    { label: 'Girls', value: genderMap['Female'], color: '#ec4899' }
                ];

                const casteData = Array.from(casteMap.entries()).map(([label, value], i) => ({
                    label, value, color: ['#f59e0b', '#8b5cf6', '#10b981', '#ef4444', '#6366f1'][i % 5]
                }));

                const classStrength = Array.from(classMap.entries())
                    .map(([label, value]) => ({ label, value }))
                    .sort((a, b) => b.value - a.value);

                setData({
                    totalStudents: students.length,
                    newAdmissions: admissionTrend.reduce((a, b) => a + b, 0),
                    trendData,
                    genderData,
                    casteData,
                    classStrength
                });
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    if (loading) return <div className="h-screen flex items-center justify-center"><Spinner size="12"/></div>;

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <h1 className="text-3xl font-bold text-gray-800 border-b pb-4">Admission & Demographics Analysis</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard title="Total Student Strength" value={data.totalStudents} icon={<ChartBarIcon className="text-white w-6 h-6"/>} color="bg-indigo-600" />
                <StatCard title="New Admissions (This Year)" value={data.newAdmissions} icon={<ChartBarIcon className="text-white w-6 h-6"/>} color="bg-green-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <LineChart title="Admissions Trend (Current Year)" data={data.trendData} color="#8b5cf6" />
                </div>
                <DonutChart title="Gender Distribution" data={data.genderData} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <SimpleBarChart title="Class Strength" data={data.classStrength} color="bg-blue-500" />
                <DonutChart title="Social Category / Caste Distribution" data={data.casteData} />
            </div>
        </div>
    );
};

export default AnalysisAdmissions;
