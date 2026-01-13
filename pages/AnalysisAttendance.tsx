
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import Spinner from '../components/Spinner';
import { LineChart, SimpleBarChart, DonutChart } from '../components/ChartComponents';
import StatCard from '../components/StatCard';
import StudentsIcon from '../components/icons/StudentsIcon';

const AnalysisAttendance: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const today = new Date();
            const year = today.getFullYear();
            const month = today.getMonth(); // 0-indexed

            const { data: attendanceData } = await supabase.from('attendance').select('*').gte('date', `${year}-01-01`);
            const { data: classesData } = await supabase.from('classes').select('id, class_name');

            if (attendanceData && classesData) {
                // 1. Daily Trend (Last 7 Days)
                const last7DaysMap = new Map<string, number>();
                for (let i = 6; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(today.getDate() - i);
                    const dateStr = d.toISOString().split('T')[0];
                    last7DaysMap.set(dateStr, 0);
                }

                // 2. Class-wise Today
                const todayStr = today.toISOString().split('T')[0];
                const classTodayMap = new Map<string, number>();
                const classMap = new Map(classesData.map(c => [c.id, c.class_name]));

                let totalPresentToday = 0;
                let totalAbsentToday = 0;

                attendanceData.forEach(rec => {
                    // Trend
                    if (last7DaysMap.has(rec.date)) {
                        const presentCount = rec.present ? rec.present.split(',').length : 0;
                        last7DaysMap.set(rec.date, (last7DaysMap.get(rec.date) || 0) + presentCount);
                    }

                    // Today
                    if (rec.date === todayStr) {
                        const presentCount = rec.present ? rec.present.split(',').length : 0;
                        const absentCount = rec.absent ? rec.absent.split(',').length : 0;
                        totalPresentToday += presentCount;
                        totalAbsentToday += absentCount;
                        
                        const className = classMap.get(rec.class_id);
                        if (className) {
                            classTodayMap.set(className, presentCount);
                        }
                    }
                });

                // FIX: Added type assertion to ensure 'date' is treated as string for Date constructor
                const trendData = Array.from(last7DaysMap.entries()).map(([date, val]) => ({
                    label: new Date(date as string).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
                    value: val
                }));

                const classData = Array.from(classTodayMap.entries()).map(([label, value]) => ({ label, value }));

                // 3. Monthly Average
                const monthlyAvg = new Array(12).fill(0);
                const monthlyDays = new Array(12).fill(0);
                attendanceData.forEach(rec => {
                    const d = new Date(rec.date);
                    if(d.getFullYear() === year) {
                        monthlyAvg[d.getMonth()] += (rec.present ? rec.present.split(',').length : 0);
                        monthlyDays[d.getMonth()]++; // Count records to average later? Or just total sum showing volume. Let's show total present volume per month.
                    }
                });
                const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                const monthlyData = monthlyAvg.map((val, i) => ({ label: monthLabels[i], value: val }));

                setData({
                    todayPresent: totalPresentToday,
                    todayAbsent: totalAbsentToday,
                    attendancePercent: totalPresentToday + totalAbsentToday > 0 
                        ? Math.round((totalPresentToday / (totalPresentToday + totalAbsentToday)) * 100) 
                        : 0,
                    trendData,
                    classData,
                    monthlyData
                });
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    if (loading) return <div className="h-screen flex items-center justify-center"><Spinner size="12"/></div>;

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <h1 className="text-3xl font-bold text-gray-800 border-b pb-4">Student Attendance Analysis</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Present Today" value={data.todayPresent} icon={<StudentsIcon className="text-white w-6 h-6"/>} color="bg-green-500" />
                <StatCard title="Absent Today" value={data.todayAbsent} icon={<StudentsIcon className="text-white w-6 h-6"/>} color="bg-red-500" />
                <StatCard title="Today's Turnout" value={`${data.attendancePercent}%`} icon={<StudentsIcon className="text-white w-6 h-6"/>} color="bg-blue-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <LineChart title="Attendance Trend (Last 7 Days)" data={data.trendData} color="#10b981" />
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <SimpleBarChart title="Class-wise Presence (Today)" data={data.classData} color="bg-indigo-500" />
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
                <SimpleBarChart title="Total Monthly Attendance Volume" data={data.monthlyData} color="bg-teal-500" />
            </div>
        </div>
    );
};

export default AnalysisAttendance;