
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
    
    attendanceToday: { label: string; value: number; color: string }[];
    staffAttendanceToday: { label: string; value: number; color: string }[];
    
    revenueTrend: { label: string; value: number }[];
    expenseCategory: { label: string; value: number; color: string }[];
    profitTrend: { label: string; value: number }[];
    salaryVsRevenue: { label: string; value: number }[];
    
    classStrength: { label: string; value: number }[];
    genderData: { label: string; value: number; color: string }[];
    casteData: { label: string; value: number; color: string }[];
    feeStatusData: { label: string; value: number; color: string }[];
    admissionTrend: { label: string; value: number }[];
    
    examPerformance: { label: string; value: number }[];
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
        const currentYear = new Date().getFullYear();
        const today = new Date().toISOString().split('T')[0];

        // 1. Basic Counts
        const totalStudents = students.length;
        const totalStaff = staff.length;
        const totalClasses = classes.length;
        
        // 2. Financials
        const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
        const totalSalariesPaid = salaryRecords.reduce((sum, s) => sum + s.amount, 0);
        
        let totalRevenue = 0;
        let totalDues = 0;
        let feeFullyPaidCount = 0;
        let feePartialCount = 0;
        let feeDuesCount = 0;

        const monthlyRevenue = new Array(12).fill(0);
        const monthlyExpenses = new Array(12).fill(0);
        const monthlySalaries = new Array(12).fill(0);
        const monthlyAdmissions = new Array(12).fill(0);

        // Process Expenses & Salaries by Month
        expenses.forEach(e => {
            const d = new Date(e.date);
            if (d.getFullYear() === currentYear) monthlyExpenses[d.getMonth()] += e.amount;
        });
        salaryRecords.forEach(s => {
            const d = new Date(s.date_time);
            if (d.getFullYear() === currentYear) {
                monthlySalaries[d.getMonth()] += s.amount;
                monthlyExpenses[d.getMonth()] += s.amount; // Add salaries to total monthly expenses calculation
            }
        });

        const classFeesMap = new Map(classes.map(c => [c.class_name, c.school_fees || 0]));
        
        // Process Student Financials & Demographics
        const casteMap = new Map<string, number>();

        students.forEach(s => {
            // Admissions Trend
            if (s.registration_date) {
                const d = new Date(s.registration_date);
                if (d.getFullYear() === currentYear) monthlyAdmissions[d.getMonth()] += 1;
            }

            // Caste
            const caste = s.caste || 'Unspecified';
            casteMap.set(caste, (casteMap.get(caste) || 0) + 1);

            // Fees Logic
            let studentPaidTotal = 0;
            let studentDueTotal = 0;
            const yearlyFee = (classFeesMap.get(s.class || '') || 0) * 12; // Approx yearly total fee

            // Other Fees
            if (s.other_fees) {
                s.other_fees.forEach(fee => {
                    if (fee.paid_date) {
                        totalRevenue += fee.amount;
                        const d = new Date(fee.paid_date);
                        if (d.getFullYear() === currentYear) monthlyRevenue[d.getMonth()] += fee.amount;
                        studentPaidTotal += fee.amount;
                    } else {
                        totalDues += fee.amount;
                        studentDueTotal += fee.amount;
                    }
                });
            }
            
            // Previous Dues
            totalDues += (s.previous_dues || 0);
            studentDueTotal += (s.previous_dues || 0);

            // Monthly Fees
            const fee = classFeesMap.get(s.class || '') || 0;
            fullMonthKeys.forEach((month) => {
                const status = s[month] as string | undefined;
                if (!status || status === 'undefined') return;

                if (status === 'Dues') {
                    totalDues += fee;
                    studentDueTotal += fee;
                } else {
                    const parts = status.split(';');
                    let monthPaid = 0;
                    
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

                    if (monthPaid < fee) {
                        totalDues += (fee - monthPaid);
                        studentDueTotal += (fee - monthPaid);
                    }
                    studentPaidTotal += monthPaid;
                }
            });

            if (studentDueTotal === 0) feeFullyPaidCount++;
            else if (studentPaidTotal > 0) feePartialCount++;
            else feeDuesCount++;
        });

        // 3. Charts Data Construction

        // A. Attendance
        let presentCount = 0;
        let absentCount = 0;
        attendance.forEach(r => {
            if (r.date === today) {
                presentCount += r.present ? r.present.split(',').length : 0;
                absentCount += r.absent ? r.absent.split(',').length : 0;
            }
        });
        const attendanceToday = [
            { label: 'Present', value: presentCount, color: '#10b981' },
            { label: 'Absent', value: absentCount, color: '#ef4444' },
        ];

        // Mock Staff Attendance (Replace with real if table available)
        // Assuming active staff are expected to be present unless data says otherwise.
        // Ideally fetch from `staff_attendence` table. For now, simple stats.
        const activeStaff = staff.filter(s => s.is_active).length;
        const staffAttendanceToday = [
             { label: 'Active', value: activeStaff, color: '#3b82f6' },
             { label: 'On Leave', value: 0, color: '#fbbf24' } // Placeholder
        ];

        // B. Trends
        const revenueTrend = monthlyRevenue.map((val, i) => ({ label: monthNames[i], value: val }));
        const profitTrend = monthlyRevenue.map((rev, i) => ({ label: monthNames[i], value: rev - monthlyExpenses[i] }));
        const admissionTrend = monthlyAdmissions.map((val, i) => ({ label: monthNames[i], value: val }));
        const salaryVsRevenue = [
            { label: 'Revenue', value: totalRevenue },
            { label: 'Salaries Paid', value: totalSalariesPaid }
        ];

        // C. Categories & Demographics
        const expenseMap = new Map<string, number>();
        expenses.forEach(e => expenseMap.set(e.category, (expenseMap.get(e.category) || 0) + e.amount));
        const expenseColors = ['#f59e0b', '#6366f1', '#ec4899', '#8b5cf6', '#14b8a6'];
        const expenseCategory = Array.from(expenseMap.entries()).map(([label, value], i) => ({
            label, value, color: expenseColors[i % expenseColors.length]
        }));

        const casteData = Array.from(casteMap.entries()).map(([label, value], i) => ({
            label, value, color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][i % 5]
        }));

        const feeStatusData = [
            { label: 'Fully Paid', value: feeFullyPaidCount, color: '#10b981' },
            { label: 'Partial Paid', value: feePartialCount, color: '#f59e0b' },
            { label: 'Unpaid/Dues', value: feeDuesCount, color: '#ef4444' }
        ];

        const boys = students.filter(s => s.gender === 'Male').length;
        const girls = students.filter(s => s.gender === 'Female').length;
        const genderData = [
            { label: 'Boys', value: boys, color: '#3b82f6' },
            { label: 'Girls', value: girls, color: '#ec4899' }
        ];

        // D. Academics
        const classCountMap = new Map<string, number>();
        students.forEach(s => { if(s.class) classCountMap.set(s.class, (classCountMap.get(s.class) || 0) + 1); });
        const classStrength = Array.from(classCountMap.entries())
            .map(([label, value]) => ({ label, value }))
            .sort((a, b) => b.value - a.value).slice(0, 10);

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

        setData({
            totalStudents, totalStaff, totalClasses, totalSubjects: subjectsCount,
            totalRevenue, totalExpenses: totalExpenses + totalSalariesPaid, totalSalariesPaid, totalDues,
            attendanceToday, staffAttendanceToday,
            revenueTrend, expenseCategory, profitTrend, salaryVsRevenue,
            classStrength, genderData, casteData, feeStatusData, admissionTrend,
            examPerformance
        });

    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const currentYear = new Date().getFullYear();
                const [studentsRes, staffRes, classesRes, expensesRes, attendanceRes, resultsRes, salaryRes, subjectsRes] = await Promise.all([
                    supabase.from('students').select('*'),
                    supabase.from('staff').select('*'),
                    supabase.from('classes').select('*'),
                    supabase.from('expenses').select('*'),
                    supabase.from('attendance').select('date, present, absent').gte('date', `${currentYear}-01-01`),
                    supabase.from('exam_results').select('*'),
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
                    resultsRes.data as ExamResult[],
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
    if (error) return <div className="text-center text-red-500 p-8 bg-red-50 m-4 rounded-lg">Error loading dashboard: {error}</div>;
    if (!data) return <div className="text-center text-gray-500">No data available.</div>;

    const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

    return (
        <div className="space-y-8 animate-fade-in pb-8">
            {/* 1. Top KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 <StatCard title="Total Students" value={data.totalStudents} icon={<StudentsIcon className="w-6 h-6 text-white"/>} color="bg-indigo-500" />
                 <StatCard title="Total Staff" value={data.totalStaff} icon={<StaffIcon className="w-6 h-6 text-white"/>} color="bg-pink-500" />
                 <StatCard title="Total Classes" value={data.totalClasses} icon={<ClassesIcon className="w-6 h-6 text-white"/>} color="bg-blue-500" />
                 <StatCard title="Subjects" value={data.totalSubjects} icon={<AcademicCapIcon />} color="bg-purple-500" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 <StatCard title="Total Revenue" value={formatCurrency(data.totalRevenue)} icon={<RupeeIcon className="w-6 h-6 text-white"/>} color="bg-emerald-500" />
                 <StatCard title="Salaries Paid" value={formatCurrency(data.totalSalariesPaid)} icon={<RupeeIcon className="w-6 h-6 text-white"/>} color="bg-teal-500" />
                 <StatCard title="Total Expenses" value={formatCurrency(data.totalExpenses)} icon={<ExpensesIcon className="w-6 h-6 text-white"/>} color="bg-rose-500" />
                 <StatCard title="Net Dues" value={formatCurrency(data.totalDues)} icon={<DuesIcon className="w-6 h-6 text-white"/>} color="bg-amber-500" />
            </div>

            {/* 2. Financial & Analytical Charts (Grid Layout) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Row 1: Revenue, Profit, Fees */}
                <div className="lg:col-span-2">
                    <LineChart title="Monthly Revenue Collection" data={data.revenueTrend} color="#10b981" />
                </div>
                <DonutChart title="Fee Payment Status" data={data.feeStatusData} />

                {/* Row 2: Profit, Expenses, Salaries */}
                <SimpleBarChart title="Net Profit (Income - Expense)" data={data.profitTrend} color="bg-blue-500" />
                <DonutChart title="Expense Categories" data={data.expenseCategory} />
                <SimpleBarChart title="Salaries vs Revenue" data={data.salaryVsRevenue} color="bg-teal-600" />

                {/* Row 3: Academics & Demographics */}
                <DonutChart title="Student Attendance (Today)" data={data.attendanceToday} />
                <DonutChart title="Staff Status" data={data.staffAttendanceToday} />
                <LineChart title="New Admissions Trend" data={data.admissionTrend} color="#8b5cf6" />

                {/* Row 4: Demographics Detailed */}
                <DonutChart title="Gender Ratio" data={data.genderData} />
                <SimpleBarChart title="Student Count by Caste" data={data.casteData} color="bg-orange-400" />
                <SimpleBarChart title="Class Strength" data={data.classStrength} color="bg-indigo-400" />
                
                {/* Row 5: Performance */}
                <div className="lg:col-span-3">
                     <SimpleBarChart title="Average Exam Performance (%)" data={data.examPerformance} color="bg-rose-500" />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
