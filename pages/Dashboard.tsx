
import React, { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { Student, Staff, Class, Expense, Attendance, ExamResult } from '../types';
import Spinner from '../components/Spinner';
import StatCard from '../components/StatCard';
import { DonutChart, LineChart, SimpleBarChart } from '../components/ChartComponents';
import StudentsIcon from '../components/icons/StudentsIcon';
import StaffIcon from '../components/icons/StaffIcon';
import ClassesIcon from '../components/icons/ClassesIcon';
import RupeeIcon from '../components/icons/RupeeIcon';
import ExpensesIcon from '../components/icons/ExpensesIcon';
import DuesIcon from '../components/icons/DuesIcon';

interface DashboardProps {
    user: User;
}

interface DashboardData {
    totalStudents: number;
    totalStaff: number;
    totalClasses: number;
    totalRevenue: number;
    totalExpenses: number;
    totalDues: number;
    attendanceToday: { label: string; value: number; color: string }[];
    revenueTrend: { label: string; value: number }[];
    expenseCategory: { label: string; value: number; color: string }[];
    classStrength: { label: string; value: number }[];
    genderData: { label: string; value: number; color: string }[];
    examPerformance: { label: string; value: number }[];
    staffStatus: { label: string; value: number; color: string }[];
    profitTrend: { label: string; value: number }[];
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
        examResults: ExamResult[]
    ) => {
        const currentYear = new Date().getFullYear();
        const today = new Date().toISOString().split('T')[0];

        // 1. Basic Totals
        const totalStudents = students.length;
        const totalStaff = staff.length;
        const totalClasses = classes.length;
        const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

        // 2. Financial Calculations (Complex)
        let totalRevenue = 0;
        let totalDues = 0;
        const monthlyRevenue = new Array(12).fill(0);
        const monthlyExpenses = new Array(12).fill(0);
        
        // Expense Trend
        expenses.forEach(e => {
            const d = new Date(e.date);
            if (d.getFullYear() === currentYear) {
                monthlyExpenses[d.getMonth()] += e.amount;
            }
        });

        // Revenue & Dues Logic
        const classFeesMap = new Map(classes.map(c => [c.class_name, c.school_fees || 0]));
        
        students.forEach(s => {
            // Check Other Fees (paid_date)
            if (s.other_fees) {
                s.other_fees.forEach(fee => {
                    if (fee.paid_date) {
                        totalRevenue += fee.amount;
                        const d = new Date(fee.paid_date);
                        if (d.getFullYear() === currentYear) monthlyRevenue[d.getMonth()] += fee.amount;
                    } else {
                        totalDues += fee.amount;
                    }
                });
            }
            
            // Previous Dues
            totalDues += (s.previous_dues || 0);

            // Monthly Fees
            const fee = classFeesMap.get(s.class || '') || 0;
            fullMonthKeys.forEach((month, index) => {
                const status = s[month];
                if (!status || status === 'undefined') {
                    // If month has passed and no status, assume due if filtering strictly, but for dashboard summation:
                    // We usually count dues for months explicitly marked 'Dues' or past months.
                    // Simplifying: Only count explicit Dues or partials for dashboard total to be safe.
                    return; 
                }

                if (status === 'Dues') {
                    totalDues += fee;
                } else {
                    // Parse payments: "500=d=2024-01-01;200=d=..."
                    const parts = status.split(';');
                    let monthPaid = 0;
                    
                    // Legacy check
                    if (/^\d{4}-\d{2}-\d{2}/.test(status) && !status.includes('=')) {
                        monthPaid = fee;
                        totalRevenue += fee;
                        const d = new Date(status);
                        if(d.getFullYear() === currentYear) monthlyRevenue[d.getMonth()] += fee;
                    } else {
                        parts.forEach(p => {
                            const [amtStr, dateStr] = p.split('=d=');
                            const amt = parseFloat(amtStr) || 0;
                            monthPaid += amt;
                            totalRevenue += amt;
                            if (dateStr) {
                                const d = new Date(dateStr);
                                if(d.getFullYear() === currentYear) monthlyRevenue[d.getMonth()] += amt;
                            }
                        });
                    }

                    if (monthPaid < fee) totalDues += (fee - monthPaid);
                }
            });
        });

        // 3. Charts Data Preparation

        // A. Attendance Today
        let presentCount = 0;
        let absentCount = 0;
        // Find attendance records for today
        attendance.forEach(r => {
            if (r.date === today) {
                presentCount += r.present ? r.present.split(',').length : 0;
                absentCount += r.absent ? r.absent.split(',').length : 0;
            }
        });
        // If no attendance taken today, estimate from yesterday or show 0 (showing 0/0 looks bad, so maybe show averages if 0)
        const attendanceToday = [
            { label: 'Present', value: presentCount, color: '#10b981' },
            { label: 'Absent', value: absentCount, color: '#ef4444' },
        ];

        // B. Revenue Trend
        const revenueTrend = monthlyRevenue.map((val, i) => ({ label: monthNames[i], value: val }));

        // C. Expense Category
        const expenseMap = new Map<string, number>();
        expenses.forEach(e => {
            const current = expenseMap.get(e.category) || 0;
            expenseMap.set(e.category, current + e.amount);
        });
        const expenseColors = ['#f59e0b', '#6366f1', '#ec4899', '#8b5cf6', '#14b8a6'];
        const expenseCategory = Array.from(expenseMap.entries()).map(([label, value], i) => ({
            label, value, color: expenseColors[i % expenseColors.length]
        }));

        // D. Class Strength
        const classCountMap = new Map<string, number>();
        students.forEach(s => {
            if(s.class) classCountMap.set(s.class, (classCountMap.get(s.class) || 0) + 1);
        });
        const classStrength = Array.from(classCountMap.entries())
            .map(([label, value]) => ({ label, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10); // Top 10 classes

        // E. Gender Ratio
        const boys = students.filter(s => s.gender === 'Male').length;
        const girls = students.filter(s => s.gender === 'Female').length;
        const genderData = [
            { label: 'Boys', value: boys, color: '#3b82f6' },
            { label: 'Girls', value: girls, color: '#ec4899' }
        ];

        // F. Exam Performance (Avg % per Exam Name)
        const examMap = new Map<string, { total: number, count: number }>();
        examResults.forEach(res => {
            const totalMarks = res.subjects_marks.subjects.reduce((a, b) => a + Number(b.total_marks), 0);
            const obtMarks = res.subjects_marks.subjects.reduce((a, b) => a + Number(b.obtained_marks), 0);
            const percent = totalMarks > 0 ? (obtMarks / totalMarks) * 100 : 0;
            
            const current = examMap.get(res.exam_name) || { total: 0, count: 0 };
            examMap.set(res.exam_name, { total: current.total + percent, count: current.count + 1 });
        });
        const examPerformance = Array.from(examMap.entries()).map(([label, { total, count }]) => ({
            label, value: Math.round(total / count)
        }));

        // G. Staff Status
        const activeStaff = staff.filter(s => s.is_active).length;
        const inactiveStaff = staff.length - activeStaff;
        const staffStatus = [
            { label: 'Active', value: activeStaff, color: '#10b981' },
            { label: 'Inactive', value: inactiveStaff, color: '#9ca3af' }
        ];

        // H. Profit Trend (Revenue - Expenses)
        const profitTrend = monthlyRevenue.map((rev, i) => ({
            label: monthNames[i],
            value: rev - monthlyExpenses[i]
        }));

        setData({
            totalStudents, totalStaff, totalClasses, totalRevenue, totalExpenses, totalDues,
            attendanceToday, revenueTrend, expenseCategory, classStrength, genderData,
            examPerformance, staffStatus, profitTrend
        });

    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const currentYear = new Date().getFullYear();
                const [studentsRes, staffRes, classesRes, expensesRes, attendanceRes, resultsRes] = await Promise.all([
                    supabase.from('students').select('*'),
                    supabase.from('staff').select('*'),
                    supabase.from('classes').select('*'),
                    supabase.from('expenses').select('*'),
                    supabase.from('attendance').select('date, present, absent').gte('date', `${currentYear}-01-01`),
                    supabase.from('exam_results').select('*')
                ]);

                if (studentsRes.error) throw studentsRes.error;
                
                processData(
                    studentsRes.data as Student[],
                    staffRes.data as Staff[],
                    classesRes.data as Class[],
                    expensesRes.data as Expense[],
                    attendanceRes.data as Attendance[],
                    resultsRes.data as ExamResult[]
                );

            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [processData, user.id]);
    
    if (loading) return <div className="flex items-center justify-center h-screen"><Spinner size="12"/></div>;
    if (error) return <div className="text-center text-red-500 p-8">Error loading dashboard: {error}</div>;
    if (!data) return <div className="text-center text-gray-500">No data available.</div>;

    const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header Section */}
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
                <p className="text-gray-500">Welcome back! Here's what's happening in your school.</p>
            </div>

            {/* 1. Key Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                 <StatCard title="Total Revenue" value={formatCurrency(data.totalRevenue)} icon={<RupeeIcon className="w-6 h-6 text-white"/>} color="bg-emerald-500" />
                 <StatCard title="Total Expenses" value={formatCurrency(data.totalExpenses)} icon={<ExpensesIcon className="w-6 h-6 text-white"/>} color="bg-rose-500" />
                 <StatCard title="Net Dues" value={formatCurrency(data.totalDues)} icon={<DuesIcon className="w-6 h-6 text-white"/>} color="bg-amber-500" />
                 <StatCard title="Total Students" value={data.totalStudents} icon={<StudentsIcon className="w-6 h-6 text-white"/>} color="bg-indigo-500" />
            </div>

            {/* 2. Financial Analysis Section */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-700 border-b pb-2">Financial Analysis</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <LineChart title="Monthly Revenue Collection" data={data.revenueTrend} color="#10b981" />
                    </div>
                    <DonutChart title="Expense Distribution" data={data.expenseCategory} />
                    <div className="lg:col-span-3">
                         <SimpleBarChart title="Monthly Net Profit (Income - Expense)" data={data.profitTrend} color="bg-blue-500" />
                    </div>
                </div>
            </div>

            {/* 3. Academic & Operations Section */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-700 border-b pb-2">Academic & Operations</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <DonutChart title="Attendance (Today)" data={data.attendanceToday} />
                    <SimpleBarChart title="Student Strength by Class" data={data.classStrength} color="bg-indigo-400" />
                    <SimpleBarChart title="Avg. Exam Performance (%)" data={data.examPerformance} color="bg-violet-500" />
                </div>
            </div>

            {/* 4. Demographics & Staff Section */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-700 border-b pb-2">Demographics & Staff</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-2 flex flex-col justify-center bg-white p-6 rounded-xl shadow-md">
                        <h3 className="font-bold text-gray-600 mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <button className="p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition">Add Student</button>
                            <button className="p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition">Collect Fees</button>
                            <button className="p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition">Mark Attendance</button>
                            <button className="p-3 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition">Add Expense</button>
                        </div>
                    </div>
                    <DonutChart title="Gender Ratio" data={data.genderData} />
                    <DonutChart title="Staff Status" data={data.staffStatus} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
