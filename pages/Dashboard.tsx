
import React, { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { Student, Staff, Class, Expense, Attendance, ExamResult, SalaryRecord } from '../types';
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

interface DashboardProps {
    user: User;
}

interface DashboardData {
    totalStudents: number;
    totalStaff: number;
    totalClasses: number;
    totalSubjects: number;
    
    totalRevenue: number;
    totalExpenses: number;
    totalSalariesPaid: number;
    totalDues: number;

    // Today's specific stats
    todayPaidAmount: number;
    todayPresentStudents: number;
    todayDuesStudents: number;
    
    attendanceToday: { label: string; value: number; color: string }[];
    
    revenueTrend: { label: string; value: number }[];
    expenseCategory: { label: string; value: number; color: string }[];
    
    classStrength: { label: string; value: number }[];
    classAttendanceToday: { label: string; value: number }[];
    classRevenueToday: { label: string; value: number }[];
    classRevenueThisMonth: { label: string; value: number }[];
    
    casteData: { label: string; value: number; color: string }[];
    feeStatusData: { label: string; value: number; color: string }[];
    admissionTrend: { label: string; value: number }[];
}

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fullMonthKeys: (keyof Student)[] = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const processData = useCallback((
        students: Student[], 
        staff: Staff[], 
        classes: Class[], 
        expenses: Expense[], 
        attendance: Attendance[],
        examResults: ExamResult[],
        salaryRecords: SalaryRecord[],
        subjectsCount: number
    ) => {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const currentYear = now.getFullYear();
        const currentMonthIdx = now.getMonth();

        // 1. Basic Counts
        const totalStudents = students.length;
        const totalStaff = staff.length;
        const totalClasses = classes.length;
        
        // 2. Financials & Today's Stats
        const totalSalariesPaid = salaryRecords.reduce((sum, s) => sum + s.amount, 0);
        const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0) + totalSalariesPaid;
        
        let totalRevenue = 0;
        let totalDues = 0;
        let todayPaidAmount = 0;
        let todayDuesStudents = 0;

        const monthlyRevenue = new Array(12).fill(0);
        const monthlyAdmissions = new Array(12).fill(0);
        
        const classRevenueTodayMap = new Map<string, number>();
        const classRevenueMonthMap = new Map<string, number>();
        const casteMap = new Map<string, number>();

        const classFeesMap = new Map(classes.map(c => [c.class_name, c.school_fees || 0]));

        students.forEach(s => {
            // Admissions Trend
            if (s.registration_date) {
                const d = new Date(s.registration_date);
                if (d.getFullYear() === currentYear) monthlyAdmissions[d.getMonth()] += 1;
            }

            // Religion/Caste Distribution
            const caste = s.caste || 'Other';
            casteMap.set(caste, (casteMap.get(caste) || 0) + 1);

            let hasDuesToday = false;
            const sClass = s.class || 'Unknown';

            // Process Monthly Fees
            const fee = classFeesMap.get(sClass) || 0;
            
            fullMonthKeys.forEach((monthKey, idx) => {
                const status = s[monthKey] as string | undefined;
                if (!status || status === 'undefined') {
                    if (idx <= currentMonthIdx) {
                        totalDues += fee;
                        hasDuesToday = true;
                    }
                    return;
                }

                if (status === 'Dues') {
                    totalDues += fee;
                    if (idx <= currentMonthIdx) hasDuesToday = true;
                } else {
                    const parts = status.split(';');
                    let studentMonthPaid = 0;
                    
                    // Regex to check if it's just a legacy ISO date
                    if (/^\d{4}-\d{2}-\d{2}/.test(status) && !status.includes('=')) {
                        studentMonthPaid = fee;
                        totalRevenue += fee;
                        const d = new Date(status);
                        if (d.getFullYear() === currentYear) monthlyRevenue[d.getMonth()] += fee;
                        if (status.startsWith(todayStr)) {
                            todayPaidAmount += fee;
                            classRevenueTodayMap.set(sClass, (classRevenueTodayMap.get(sClass) || 0) + fee);
                        }
                        if (d.getMonth() === currentMonthIdx && d.getFullYear() === currentYear) {
                            classRevenueMonthMap.set(sClass, (classRevenueMonthMap.get(sClass) || 0) + fee);
                        }
                    } else {
                        // Modern partial payment format: AMT=d=DATE
                        parts.forEach(p => {
                            const [amtStr, dateStr] = p.split('=d=');
                            const amt = parseFloat(amtStr) || 0;
                            studentMonthPaid += amt;
                            totalRevenue += amt;
                            if (dateStr) {
                                const d = new Date(dateStr);
                                if (d.getFullYear() === currentYear) monthlyRevenue[d.getMonth()] += amt;
                                if (dateStr.startsWith(todayStr)) {
                                    todayPaidAmount += amt;
                                    classRevenueTodayMap.set(sClass, (classRevenueTodayMap.get(sClass) || 0) + amt);
                                }
                                if (d.getMonth() === currentMonthIdx && d.getFullYear() === currentYear) {
                                    classRevenueMonthMap.set(sClass, (classRevenueMonthMap.get(sClass) || 0) + amt);
                                }
                            }
                        });
                    }

                    if (studentMonthPaid < fee && idx <= currentMonthIdx) {
                        totalDues += (fee - studentMonthPaid);
                        hasDuesToday = true;
                    }
                }
            });

            // Check Other Fees
            if (s.other_fees) {
                s.other_fees.forEach(f => {
                    if (f.paid_date) {
                        totalRevenue += f.amount;
                        if (f.paid_date.startsWith(todayStr)) todayPaidAmount += f.amount;
                    } else {
                        totalDues += f.amount;
                        hasDuesToday = true;
                    }
                });
            }

            if (hasDuesToday) todayDuesStudents++;
        });

        // 3. Attendance Today
        let todayPresentStudents = 0;
        let todayAbsentStudents = 0;
        const classAttendanceTodayMap = new Map<string, number>();

        attendance.forEach(r => {
            if (r.date === todayStr) {
                const presentCount = r.present ? r.present.split(',').length : 0;
                const absentCount = r.absent ? r.absent.split(',').length : 0;
                todayPresentStudents += presentCount;
                todayAbsentStudents += absentCount;

                // Find class name from ID
                const cls = classes.find(c => c.id === r.class_id);
                if (cls) {
                    classAttendanceTodayMap.set(cls.class_name, presentCount);
                }
            }
        });

        // Construct chart datasets
        const classAttendanceToday = Array.from(classAttendanceTodayMap.entries()).map(([label, value]) => ({ label, value }));
        const classRevenueToday = Array.from(classRevenueTodayMap.entries()).map(([label, value]) => ({ label, value }));
        const classRevenueThisMonth = Array.from(classRevenueMonthMap.entries()).map(([label, value]) => ({ label, value }));
        const admissionTrend = monthlyAdmissions.map((val, i) => ({ label: monthNames[i], value: val }));
        const revenueTrend = monthlyRevenue.map((val, i) => ({ label: monthNames[i], value: val }));
        
        const expenseMap = new Map<string, number>();
        expenses.forEach(e => expenseMap.set(e.category, (expenseMap.get(e.category) || 0) + e.amount));
        const expenseCategory = Array.from(expenseMap.entries()).map(([label, value], i) => ({
            label, value, color: ['#f87171', '#60a5fa', '#34d399', '#fbbf24', '#a78bfa'][i % 5]
        }));

        const casteData = Array.from(casteMap.entries()).map(([label, value], i) => ({
            label, value, color: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ec4899'][i % 5]
        }));

        const classCountMap = new Map<string, number>();
        students.forEach(s => { if(s.class) classCountMap.set(s.class, (classCountMap.get(s.class) || 0) + 1); });
        const classStrength = Array.from(classCountMap.entries()).map(([label, value]) => ({ label, value }));

        setData({
            totalStudents, totalStaff, totalClasses, totalSubjects: subjectsCount,
            totalRevenue, totalExpenses, totalSalariesPaid, totalDues,
            todayPaidAmount, todayPresentStudents, todayDuesStudents,
            attendanceToday: [
                { label: 'Present', value: todayPresentStudents, color: '#10b981' },
                { label: 'Absent', value: todayAbsentStudents, color: '#ef4444' }
            ],
            revenueTrend, expenseCategory, casteData, admissionTrend,
            classStrength, classAttendanceToday, classRevenueToday, classRevenueThisMonth,
            feeStatusData: [
                { label: 'Paid', value: totalStudents - todayDuesStudents, color: '#10b981' },
                { label: 'Dues', value: todayDuesStudents, color: '#ef4444' }
            ]
        });

    }, []);

    useEffect(() => {
        const fetchData = async () => {
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
                    [], // exam results not needed for this dashboard view
                    salaryRes.data as SalaryRecord[],
                    subjectsRes.count || 0
                );

            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [processData, user.id]);
    
    if (loading) return <div className="flex items-center justify-center h-screen bg-gray-50"><Spinner size="12"/></div>;
    if (error) return <div className="text-center text-red-500 p-8 bg-red-50 m-4 rounded-lg">Error: {error}</div>;
    if (!data) return null;

    const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* 1. Primary KPIs - Today's Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                 <StatCard title="Total Present (Today)" value={data.todayPresentStudents} icon={<StudentsIcon className="w-6 h-6 text-white"/>} color="bg-green-500" />
                 <StatCard title="Paid Money (Today)" value={formatCurrency(data.todayPaidAmount)} icon={<RupeeIcon className="w-6 h-6 text-white"/>} color="bg-emerald-600" />
                 <StatCard title="Students with Dues" value={data.todayDuesStudents} icon={<DuesIcon className="w-6 h-6 text-white"/>} color="bg-rose-500" />
                 <StatCard title="Total Staff" value={data.totalStaff} icon={<StaffIcon className="w-6 h-6 text-white"/>} color="bg-indigo-500" />
            </div>

            {/* 2. Secondary KPIs - School Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 <StatCard title="Total Revenue" value={formatCurrency(data.totalRevenue)} icon={<RupeeIcon className="w-6 h-6 text-white"/>} color="bg-blue-500" />
                 <StatCard title="Total Expenses" value={formatCurrency(data.totalExpenses)} icon={<ExpensesIcon className="w-6 h-6 text-white"/>} color="bg-orange-500" />
                 <StatCard title="Total Classes" value={data.totalClasses} icon={<ClassesIcon className="w-6 h-6 text-white"/>} color="bg-purple-500" />
                 <StatCard title="Total Subjects" value={data.totalSubjects} icon={<AcademicCapIcon />} color="bg-teal-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 3. Real-time Attendance & Fees */}
                <div className="lg:col-span-2">
                    <SimpleBarChart title="Class-wise Attendance (Present Today)" data={data.classAttendanceToday} color="bg-green-400" />
                </div>
                <DonutChart title="Overall Attendance (Today)" data={data.attendanceToday} />

                <div className="lg:col-span-2">
                    <SimpleBarChart title="Fees Collected Today by Class" data={data.classRevenueToday} color="bg-emerald-500" />
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md flex flex-col justify-center text-center">
                    <h3 className="text-gray-500 font-bold mb-2">Net Outstanding Dues</h3>
                    <p className="text-4xl font-extrabold text-red-600">{formatCurrency(data.totalDues)}</p>
                    <p className="text-xs text-gray-400 mt-2">Cumulative unpaid fees across all classes</p>
                </div>

                {/* 4. Monthly Performance */}
                <div className="lg:col-span-2">
                    <LineChart title="Monthly Revenue Trend (This Year)" data={data.revenueTrend} color="#4f46e5" />
                </div>
                <SimpleBarChart title="Revenue by Class (This Month)" data={data.classRevenueThisMonth} color="bg-indigo-500" />

                {/* 5. Demographics & Admissions */}
                <div className="lg:col-span-2">
                    <SimpleBarChart title="Student Admissions per Month" data={data.admissionTrend} color="bg-teal-500" />
                </div>
                <DonutChart title="Religion/Caste Distribution" data={data.casteData} />

                <div className="lg:col-span-2">
                    <SimpleBarChart title="Student Strength by Class" data={data.classStrength} color="bg-blue-400" />
                </div>
                <DonutChart title="Expense Categories" data={data.expenseCategory} />
            </div>
        </div>
    );
};

export default Dashboard;
