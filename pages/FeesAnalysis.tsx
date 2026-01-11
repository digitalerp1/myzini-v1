
import React, { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { Student, Staff, Class, Expense, Attendance, SalaryRecord } from '../types';
import Spinner from '../components/Spinner';
import StatCard from '../components/StatCard';
import { DonutChart, SimpleBarChart, LineChart } from '../components/ChartComponents';
import StudentsIcon from '../components/icons/StudentsIcon';
import StaffIcon from '../components/icons/StaffIcon';
import ClassesIcon from '../components/icons/ClassesIcon';
import RupeeIcon from '../components/icons/RupeeIcon';
import ExpensesIcon from '../components/icons/ExpensesIcon';
import DuesIcon from '../components/icons/DuesIcon';
import AcademicCapIcon from '../components/icons/AcademicCapIcon';

interface FeesAnalysisProps {
    user: User;
}

interface AnalysisData {
    // Top Row Stats
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

    // Class Performance Charts
    classAttendanceToday: { label: string; value: number }[];
    classDuesCount: { label: string; value: number }[];
    classPaidToday: { label: string; value: number }[];
    classPaidThisMonth: { label: string; value: number }[];
    
    // Demographics
    religionTotal: { label: string; value: number; color: string }[];
    admissionTrend: { label: string; value: number }[];
}

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fullMonthKeys: (keyof Student)[] = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

const FeesAnalysis: React.FC<FeesAnalysisProps> = ({ user }) => {
    const [data, setData] = useState<AnalysisData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const processData = useCallback((
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
        const classDuesMap = new Map<string, number>();
        const classPaidTodayMap = new Map<string, number>();
        const classPaidMonthMap = new Map<string, number>();

        // 1. Process Students
        students.forEach(s => {
            const sClass = s.class || 'Unknown';
            const fee = classFeesMap.get(sClass) || 0;
            let studentHasDuesInPeriod = false;

            // Admissions Trend
            if (s.registration_date) {
                const d = new Date(s.registration_date);
                if (d.getFullYear() === currentYear) admissionTrendMap[d.getMonth()]++;
            }

            // Religion/Caste (Caste used as proxy for requested religion field)
            const religion = s.caste || 'Other';
            religionMap.set(religion, (religionMap.get(religion) || 0) + 1);

            // Fee processing logic
            fullMonthKeys.forEach((monthKey, idx) => {
                const status = s[monthKey] as string | undefined;
                
                // If past or current month and no record or explicitly marked Dues
                if (idx <= currentMonthIdx) {
                    if (!status || status === 'undefined' || status === 'Dues') {
                        totalDues += fee;
                        studentHasDuesInPeriod = true;
                    } else {
                        // Process partial or full payments
                        const payments = status.split(';');
                        let studentPaidThisMonth = 0;
                        payments.forEach(p => {
                            const [amtStr, dateStr] = p.split('=d=');
                            const amt = parseFloat(amtStr) || (status.length > 10 ? fee : 0);
                            const actualDate = dateStr || status;
                            
                            studentPaidThisMonth += amt;
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

                        if (studentPaidThisMonth < fee) {
                            totalDues += (fee - studentPaidThisMonth);
                            studentHasDuesInPeriod = true;
                        }
                    }
                }
            });

            // Count dues students for today's summary card
            if (studentHasDuesInPeriod) {
                todayDuesStudents++;
                classDuesMap.set(sClass, (classDuesMap.get(sClass) || 0) + 1);
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

        // 3. Process Expenses (Expenses + Staff Salaries)
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
            classAttendanceToday: Array.from(classAttendanceMap.entries()).map(([label, value]) => ({ label, value })),
            classDuesCount: Array.from(classDuesMap.entries()).map(([label, value]) => ({ label, value })),
            classPaidToday: Array.from(classPaidTodayMap.entries()).map(([label, value]) => ({ label, value })),
            classPaidThisMonth: Array.from(classPaidMonthMap.entries()).map(([label, value]) => ({ label, value })),
            religionTotal: Array.from(religionMap.entries()).map(([label, value], i) => ({ 
                label, value, color: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ec4899'][i % 5] 
            })),
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
                
                processData(
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
    }, [processData, user.id]);

    if (loading) return <div className="flex items-center justify-center h-screen"><Spinner size="12"/></div>;
    if (error) return <div className="p-8 text-red-500 bg-red-50 rounded-lg m-6">Analysis Error: {error}</div>;
    if (!data) return null;

    const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <h1 className="text-3xl font-extrabold text-gray-900 border-b-2 border-primary-dark pb-4 flex items-center gap-3">
                <RupeeIcon className="w-10 h-10 text-primary-dark" />
                Financial & Operational Analysis
            </h1>
            
            {/* Primary KPI Row - Business Vitality */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Paid Fees (All)" value={formatCurrency(data.totalPaid)} icon={<RupeeIcon className="w-6 h-6 text-white"/>} color="bg-emerald-600" />
                <StatCard title="Net Outstanding Dues" value={formatCurrency(data.totalDues)} icon={<DuesIcon className="w-6 h-6 text-white"/>} color="bg-rose-600" />
                <StatCard title="Fees Paid (Today)" value={formatCurrency(data.todayPaidMoney)} icon={<RupeeIcon className="w-6 h-6 text-white"/>} color="bg-indigo-600" />
                <StatCard title="Total School Expenses" value={formatCurrency(data.totalExpenses)} icon={<ExpensesIcon className="w-6 h-6 text-white"/>} color="bg-orange-500" />
            </div>

            {/* Today's Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard title="Present Students" value={data.todayPresentStudents} icon={<StudentsIcon className="w-5 h-5 text-white"/>} color="bg-green-500" />
                <StatCard title="Dues Students" value={data.todayDuesStudents} icon={<DuesIcon className="w-5 h-5 text-white"/>} color="bg-red-500" />
                <StatCard title="Total Staff" value={data.totalStaff} icon={<StaffIcon className="w-5 h-5 text-white"/>} color="bg-blue-500" />
                <StatCard title="Classes" value={data.totalClasses} icon={<ClassesIcon className="w-5 h-5 text-white"/>} color="bg-purple-500" />
                <StatCard title="Subjects" value={data.totalSubjects} icon={<AcademicCapIcon />} color="bg-teal-500" />
            </div>

            {/* Today's Attendance & Collection Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                    <SimpleBarChart title="Today's Present Students by Class" data={data.classAttendanceToday} color="bg-green-400" />
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                    <SimpleBarChart title="Today's Revenue by Class (₹)" data={data.classPaidToday} color="bg-emerald-500" />
                </div>
            </div>

            {/* Dues & Monthly Collection Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                    <SimpleBarChart title="Students with Outstanding Dues by Class" data={data.classDuesCount} color="bg-rose-400" />
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                    <SimpleBarChart title="This Month's Fee Collection by Class (₹)" data={data.classPaidThisMonth} color="bg-blue-500" />
                </div>
            </div>

            {/* Demographics & Admission Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                    <LineChart title="Annual Admission Trend (Students per Month)" data={data.admissionTrend} color="#4f46e5" />
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                    <DonutChart title="Religion/Caste Demographic Distribution" data={data.religionTotal} />
                </div>
            </div>

            {/* Financial Summary Note */}
            <div className="bg-indigo-900 text-white p-8 rounded-3xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
                    <RupeeIcon className="w-64 h-64" />
                </div>
                <div className="relative z-10">
                    <h3 className="text-xl font-bold opacity-80">School Financial Standing</h3>
                    <p className="text-4xl font-black mt-2">Net Cash Position: {formatCurrency(data.totalPaid - data.totalExpenses)}</p>
                </div>
                <div className="relative z-10 text-right">
                    <p className="text-sm italic opacity-70 max-w-xs ml-auto">
                        This report aggregates all tuition fees, other fee types, staff salaries, and overhead expenses to provide a clear financial snapshot of the current session.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FeesAnalysis;
