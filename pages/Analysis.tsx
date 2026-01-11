
import React, { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { Student, Staff, Class, Expense, Attendance, SalaryRecord } from '../types';
import Spinner from '../components/Spinner';
import StatCard from '../components/StatCard';
import { DonutChart, LineChart, SimpleBarChart } from '../components/ChartComponents';
import StudentsIcon from '../components/icons/StudentsIcon';
import StaffIcon from '../components/icons/StaffIcon';
import ClassesIcon from '../components/icons/ClassesIcon';
import RupeeIcon from '../components/icons/RupeeIcon';
import ExpensesIcon from '../components/icons/ExpensesIcon';
import DuesIcon from '../components/icons/DuesIcon';
import AcademicCapIcon from '../components/icons/AcademicCapIcon';

interface AnalysisProps {
    user: User;
}

interface AnalysisData {
    // School Wide KPIs
    totalPaid: number;
    totalDues: number;
    totalExpenses: number;
    totalClasses: number;
    totalSubjects: number;
    totalStaff: number;

    // Today's Stats
    todayPresentStudents: number;
    todayDuesStudents: number;
    todayPaidMoney: number;

    // Class Performance
    classWisePresentToday: { label: string; value: number }[];
    classWiseDuesCount: { label: string; value: number }[];
    classWisePaidToday: { label: string; value: number }[];
    classWisePaidThisMonth: { label: string; value: number }[];
    
    // Demographics
    religionTotal: { label: string; value: number; color: string }[];
    classReligionMatrix: { label: string; value: number }[]; // Simplification for chart display
    admissionTrend: { label: string; value: number }[];
}

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fullMonthKeys: (keyof Student)[] = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

const Analysis: React.FC<AnalysisProps> = ({ user }) => {
    const [data, setData] = useState<AnalysisData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const processAnalysis = useCallback((
        students: Student[], 
        staff: Staff[], 
        classes: Class[], 
        expenses: Expense[], 
        attendance: Attendance[],
        salaryRecords: SalaryRecord[],
        subjectsCount: number
    ) => {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const currentYear = now.getFullYear();
        const currentMonthIdx = now.getMonth();

        let totalPaid = 0;
        let totalDues = 0;
        let todayPaidMoney = 0;
        let todayDuesStudents = 0;
        let todayPresentStudents = 0;

        const classFeesMap = new Map(classes.map(c => [c.class_name, c.school_fees || 0]));
        const admissionTrendMap = new Array(12).fill(0);
        const religionMap = new Map<string, number>();
        const classAttendanceMap = new Map<string, number>();
        const classDuesCountMap = new Map<string, number>();
        const classPaidTodayMap = new Map<string, number>();
        const classPaidMonthMap = new Map<string, number>();

        // 1. Process Students
        students.forEach(s => {
            const sClass = s.class || 'Unknown';
            const fee = classFeesMap.get(sClass) || 0;
            let studentHasDuesToday = false;

            // Admission Trend
            if (s.registration_date) {
                const d = new Date(s.registration_date);
                if (d.getFullYear() === currentYear) admissionTrendMap[d.getMonth()]++;
            }

            // Religion (Caste mapped as religion for this UI)
            const religion = s.caste || 'Other';
            religionMap.set(religion, (religionMap.get(religion) || 0) + 1);

            // Monthly Fees Processing
            fullMonthKeys.forEach((monthKey, idx) => {
                const status = s[monthKey] as string | undefined;
                if (!status || status === 'undefined') {
                    if (idx <= currentMonthIdx) {
                        totalDues += fee;
                        studentHasDuesToday = true;
                    }
                    return;
                }

                if (status === 'Dues') {
                    totalDues += fee;
                    if (idx <= currentMonthIdx) studentHasDuesToday = true;
                } else {
                    const parts = status.split(';');
                    let studentMonthPaid = 0;
                    
                    parts.forEach(p => {
                        const [amtStr, dateStr] = p.split('=d=');
                        const amt = parseFloat(amtStr) || (status.length > 10 ? fee : 0); // fallback for legacy ISO dates
                        const actualDate = dateStr || status;

                        studentMonthPaid += amt;
                        totalPaid += amt;

                        if (actualDate.startsWith(todayStr)) {
                            todayPaidMoney += amt;
                            classPaidTodayMap.set(sClass, (classPaidTodayMap.get(sClass) || 0) + amt);
                        }

                        const d = new Date(actualDate);
                        if (d.getFullYear() === currentYear && d.getMonth() === currentMonthIdx) {
                            classPaidMonthMap.set(sClass, (classPaidMonthMap.get(sClass) || 0) + amt);
                        }
                    });

                    if (studentMonthPaid < fee && idx <= currentMonthIdx) {
                        totalDues += (fee - studentMonthPaid);
                        studentHasDuesToday = true;
                    }
                }
            });

            if (studentHasDuesToday) {
                todayDuesStudents++;
                classDuesCountMap.set(sClass, (classDuesCountMap.get(sClass) || 0) + 1);
            }
        });

        // 2. Process Attendance Today
        attendance.forEach(record => {
            if (record.date === todayStr) {
                const presentCount = record.present ? record.present.split(',').length : 0;
                todayPresentStudents += presentCount;
                const cls = classes.find(c => c.id === record.class_id);
                if (cls) classAttendanceMap.set(cls.class_name, presentCount);
            }
        });

        // 3. Process Expenses
        const totalSalaries = salaryRecords.reduce((sum, sr) => sum + sr.amount, 0);
        const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0) + totalSalaries;

        setData({
            totalPaid,
            totalDues,
            totalExpenses,
            totalClasses: classes.length,
            totalSubjects: subjectsCount,
            totalStaff: staff.length,
            todayPresentStudents,
            todayDuesStudents,
            todayPaidMoney,
            classWisePresentToday: Array.from(classAttendanceMap.entries()).map(([label, value]) => ({ label, value })),
            classWiseDuesCount: Array.from(classDuesCountMap.entries()).map(([label, value]) => ({ label, value })),
            classWisePaidToday: Array.from(classPaidTodayMap.entries()).map(([label, value]) => ({ label, value })),
            classWisePaidThisMonth: Array.from(classPaidMonthMap.entries()).map(([label, value]) => ({ label, value })),
            religionTotal: Array.from(religionMap.entries()).map(([label, value], i) => ({ 
                label, value, color: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ec4899'][i % 5] 
            })),
            classReligionMatrix: Array.from(religionMap.entries()).map(([label, value]) => ({ label, value })),
            admissionTrend: admissionTrendMap.map((val, i) => ({ label: monthNames[i], value: val }))
        });

    }, []);

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const [studentsRes, staffRes, classesRes, expensesRes, attendanceRes, salaryRes, subjectsRes] = await Promise.all([
                    supabase.from('students').select('*'),
                    supabase.from('staff').select('*'),
                    supabase.from('classes').select('*'),
                    supabase.from('expenses').select('*'),
                    supabase.from('attendance').select('*').gte('date', new Date().toISOString().split('T')[0]),
                    supabase.from('salary_records').select('*'),
                    supabase.from('subjects').select('*', { count: 'exact', head: true })
                ]);

                if (studentsRes.error) throw studentsRes.error;
                
                processAnalysis(
                    studentsRes.data as Student[],
                    staffRes.data as Staff[],
                    classesRes.data as Class[],
                    expensesRes.data as Expense[],
                    attendanceRes.data as Attendance[],
                    salaryRes.data as SalaryRecord[],
                    subjectsRes.count || 0
                );
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [processAnalysis, user.id]);

    if (loading) return <div className="flex items-center justify-center h-screen"><Spinner size="12"/></div>;
    if (error) return <div className="p-8 text-red-500 bg-red-50 rounded-lg m-6">Analysis Error: {error}</div>;
    if (!data) return null;

    const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <h1 className="text-3xl font-extrabold text-gray-900 border-b pb-4">School Analytical Report</h1>
            
            {/* Primary KPI Row - Today Focused */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Today's Present Students" value={data.todayPresentStudents} icon={<StudentsIcon className="w-6 h-6 text-white"/>} color="bg-green-500" />
                <StatCard title="Students with Dues Today" value={data.todayDuesStudents} icon={<DuesIcon className="w-6 h-6 text-white"/>} color="bg-rose-500" />
                <StatCard title="Total Paid Money (Today)" value={formatCurrency(data.todayPaidMoney)} icon={<RupeeIcon className="w-6 h-6 text-white"/>} color="bg-emerald-600" />
            </div>

            {/* General Counters Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard title="Total Classes" value={data.totalClasses} icon={<ClassesIcon className="w-5 h-5 text-white"/>} color="bg-indigo-500" />
                <StatCard title="Total Subjects" value={data.totalSubjects} icon={<AcademicCapIcon />} color="bg-teal-500" />
                <StatCard title="Total Staff" value={data.totalStaff} icon={<StaffIcon className="w-5 h-5 text-white"/>} color="bg-blue-500" />
                <StatCard title="Total Expenses" value={formatCurrency(data.totalExpenses)} icon={<ExpensesIcon className="w-5 h-5 text-white"/>} color="bg-orange-500" />
                <StatCard title="Total Paid (All)" value={formatCurrency(data.totalPaid)} icon={<RupeeIcon className="w-5 h-5 text-white"/>} color="bg-emerald-500" />
            </div>

            {/* Attendance & Dues Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <SimpleBarChart title="Class-wise Attendance (Present Today)" data={data.classWisePresentToday} color="bg-green-400" />
                <SimpleBarChart title="Class-wise Dues Count (Pending)" data={data.classWiseDuesCount} color="bg-rose-400" />
            </div>

            {/* Revenue Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <SimpleBarChart title="Fees Collected Today by Class" data={data.classWisePaidToday} color="bg-emerald-500" />
                <SimpleBarChart title="Fees Collected This Month by Class" data={data.classWisePaidThisMonth} color="bg-blue-500" />
            </div>

            {/* Growth & Demographics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <LineChart title="Admission Trend (Yearly)" data={data.admissionTrend} color="#4f46e5" />
                </div>
                <DonutChart title="Religion/Caste Distribution (Total)" data={data.religionTotal} />
            </div>

            {/* Outstanding Statement */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border-t-8 border-red-500 flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                    <h3 className="text-xl font-bold text-gray-500">School Net Balance</h3>
                    <p className="text-4xl font-black text-red-600 mt-2">Total Dues: {formatCurrency(data.totalDues)}</p>
                </div>
                <div className="text-gray-400 italic text-sm max-w-sm">
                    This figure represents the sum of all unpaid monthly fees and previous session dues for all active students.
                </div>
            </div>
        </div>
    );
};

export default Analysis;
