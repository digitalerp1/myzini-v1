
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
    totalBoys: number;
    totalGirls: number;
    totalStaff: number;
    totalClasses: number;
    totalSubjects: number;
    
    totalRevenue: number;
    totalExpenses: number;
    totalSalariesPaid: number;
    totalDues: number;
    
    attendanceToday: { label: string; value: number; color: string }[];
    genderData: { label: string; value: number; color: string }[];
    casteData: { label: string; value: number; color: string }[];
    feeStatusData: { label: string; value: number; color: string }[];
    
    revenueTrend: { label: string; value: number }[];
    admissionTrend: { label: string; value: number }[];
    expenseCategory: { label: string; value: number; color: string }[];
    classStrength: { label: string; value: number }[];
}

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fullMonthKeys: (keyof Student)[] = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

const parsePaidAmount = (status: string | undefined | null): number => {
    if (!status || status === 'undefined' || status === 'Dues') return 0;
    // Legacy ISO date string check (means fully paid in old system)
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(status)) return Infinity;
    
    // Check for new format: "AMOUNT=d=DATE"
    return status.split(';').reduce((total, p) => {
        const parts = p.split('=d=');
        // If part[0] is a number, add it
        const val = parseFloat(parts[0]);
        return total + (isNaN(val) ? 0 : val);
    }, 0);
};

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const currentYear = new Date().getFullYear();
            const today = new Date().toISOString().split('T')[0];

            const [studentsRes, staffRes, classesRes, subjectsRes, expensesRes, salaryRes, attRes] = await Promise.all([
                supabase.from('students').select('*'),
                supabase.from('staff').select('*'),
                supabase.from('classes').select('*'),
                supabase.from('subjects').select('*', { count: 'exact', head: true }),
                supabase.from('expenses').select('*'),
                supabase.from('salary_records').select('*'),
                supabase.from('attendance').select('*').eq('date', today)
            ]);

            if (studentsRes.error) throw studentsRes.error;

            const students = studentsRes.data as Student[];
            const staff = staffRes.data as Staff[];
            const classes = classesRes.data as Class[];
            const expenses = expensesRes.data as Expense[];
            const salaries = salaryRes.data as SalaryRecord[];
            const attendance = attRes.data as Attendance[];

            // Financial Calculations
            const classFeesMap = new Map(classes.map(c => [c.class_name, c.school_fees || 0]));
            let totalRevenue = 0;
            let totalDues = 0;
            
            // Counters for Pie Chart
            let feeFullyPaidCount = 0; // Students with 0 dues
            let feePartialCount = 0; // Students with some dues but also some payment
            let feeDuesCount = 0; // Students with dues and NO payment/interaction
            
            const monthlyRevenue = new Array(12).fill(0);
            const monthlyAdmissions = new Array(12).fill(0);
            const casteMap = new Map<string, number>();
            const expenseMap = new Map<string, number>();

            students.forEach(s => {
                const className = s.class || '';
                const monthlyFee = classFeesMap.get(className) || 0;
                
                // Track individual student balance to determine status category
                let currentStudentDue = 0;
                let currentStudentPaid = 0;

                // Admissions Trend
                if (s.registration_date) {
                    const d = new Date(s.registration_date);
                    if (d.getFullYear() === currentYear) monthlyAdmissions[d.getMonth()]++;
                }

                // Caste Map
                const c = s.caste || 'General';
                casteMap.set(c, (casteMap.get(c) || 0) + 1);

                // 1. Previous Dues (Always added to Total Dues)
                const prevDues = s.previous_dues || 0;
                totalDues += prevDues;
                currentStudentDue += prevDues;

                // 2. Monthly Fees Logic
                fullMonthKeys.forEach((key) => {
                    const status = s[key] as string;

                    // STRICT CHECK: If undefined, null, or empty -> Skip (Not billed)
                    if (!status || status === 'undefined') {
                        return;
                    }

                    if (status === 'Dues') {
                        // Explicitly marked as Due
                        totalDues += monthlyFee;
                        currentStudentDue += monthlyFee;
                    } else {
                        // Attempt to parse payment
                        const paidAmount = parsePaidAmount(status);
                        
                        if (paidAmount === Infinity) {
                            // Legacy full payment
                            const actualPaid = monthlyFee;
                            totalRevenue += actualPaid;
                            currentStudentPaid += actualPaid;
                            // Add to monthly revenue trend (approximate month based on key index)
                            // Ideally we parse date from string, but legacy ISO is just date.
                            // For simplicity in trend, we can use current month logic or parsing
                            const d = new Date(status); 
                             if (!isNaN(d.getTime()) && d.getFullYear() === currentYear) {
                                monthlyRevenue[d.getMonth()] += actualPaid;
                            }
                        } else {
                            // Standard Payment Format (Amount=d=Date)
                            // Add to revenue
                            totalRevenue += paidAmount;
                            currentStudentPaid += paidAmount;

                            // Extract date for trend
                            if (status.includes('=d=')) {
                                const datePart = status.split('=d=')[1]?.split(';')[0];
                                if (datePart) {
                                    const d = new Date(datePart);
                                    if (!isNaN(d.getTime()) && d.getFullYear() === currentYear) {
                                        monthlyRevenue[d.getMonth()] += paidAmount;
                                    }
                                }
                            }

                            // Calculate Partial Dues
                            if (paidAmount < monthlyFee) {
                                const balance = monthlyFee - paidAmount;
                                totalDues += balance;
                                currentStudentDue += balance;
                            }
                        }
                    }
                });
                
                // Categorize Student
                if (currentStudentDue > 0) {
                    // Has dues
                    if (currentStudentPaid > 0) feePartialCount++;
                    else feeDuesCount++;
                } else {
                    // No dues (fully paid or not billed yet)
                    feeFullyPaidCount++;
                }
            });

            // Attendance Today
            let presentCount = 0;
            attendance.forEach(rec => {
                presentCount += rec.present ? rec.present.split(',').length : 0;
            });

            // Expenses & Salaries
            const totalSalariesPaid = salaries.reduce((sum, s) => sum + s.amount, 0);
            const totalExps = expenses.reduce((sum, e) => {
                expenseMap.set(e.category, (expenseMap.get(e.category) || 0) + e.amount);
                return sum + e.amount;
            }, 0);

            // Chart Data Prep
            const expenseCategory = Array.from(expenseMap.entries()).map(([label, value], i) => ({
                label, value, color: ['#f87171', '#60a5fa', '#34d399', '#fbbf24', '#a78bfa'][i % 5]
            }));

            const classCountMap = new Map<string, number>();
            students.forEach(s => { if(s.class) classCountMap.set(s.class, (classCountMap.get(s.class) || 0) + 1); });

            setData({
                totalStudents: students.length,
                totalBoys: students.filter(s => s.gender === 'Male').length,
                totalGirls: students.filter(s => s.gender === 'Female').length,
                totalStaff: staff.length,
                totalClasses: classes.length,
                totalSubjects: subjectsRes.count || 0,
                totalRevenue,
                totalExpenses: totalExps + totalSalariesPaid,
                totalSalariesPaid,
                totalDues,
                attendanceToday: [
                    { label: 'Present', value: presentCount, color: '#10b981' },
                    { label: 'Absent', value: Math.max(0, students.length - presentCount), color: '#ef4444' }
                ],
                genderData: [
                    { label: 'Boys', value: students.filter(s => s.gender === 'Male').length, color: '#3b82f6' },
                    { label: 'Girls', value: students.filter(s => s.gender === 'Female').length, color: '#ec4899' }
                ],
                casteData: Array.from(casteMap.entries()).map(([label, value], i) => ({
                    label, value, color: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ec4899'][i % 5]
                })),
                feeStatusData: [
                    { label: 'Fully Paid', value: feeFullyPaidCount, color: '#10b981' },
                    { label: 'Partial Dues', value: feePartialCount, color: '#f59e0b' },
                    { label: 'Full Dues', value: feeDuesCount, color: '#ef4444' }
                ],
                revenueTrend: monthlyRevenue.map((val, i) => ({ label: monthNames[i], value: val })),
                admissionTrend: monthlyAdmissions.map((val, i) => ({ label: monthNames[i], value: val })),
                expenseCategory,
                classStrength: Array.from(classCountMap.entries()).map(([label, value]) => ({ label, value })).sort((a,b) => b.value - a.value).slice(0, 10)
            });

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    if (loading) return <div className="flex items-center justify-center h-screen bg-gray-50"><Spinner size="12"/></div>;
    if (error) return <div className="text-center text-red-500 p-8">Error: {error}</div>;
    if (!data) return null;

    const format = (val: number) => `₹${val.toLocaleString('en-IN')}`;

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-gray-200 pb-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Institutional Dashboard</h1>
                    <p className="text-gray-500 mt-1 font-medium">Global analytics and operational health overview.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchData} className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all">Refresh Analytics</button>
                </div>
            </div>

            {/* Core Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Students" value={data.totalStudents} icon={<StudentsIcon className="text-white w-6 h-6"/>} color="bg-indigo-600" />
                <StatCard title="Total Staff" value={data.totalStaff} icon={<StaffIcon className="text-white w-6 h-6"/>} color="bg-pink-600" />
                <StatCard title="Total Classes" value={data.totalClasses} icon={<ClassesIcon className="text-white w-6 h-6"/>} color="bg-blue-600" />
                <StatCard title="Subjects Taught" value={data.totalSubjects} icon={<AcademicCapIcon className="text-white w-6 h-6"/>} color="bg-teal-600" />
            </div>

            {/* Financial Health Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Revenue" value={format(data.totalRevenue)} icon={<RupeeIcon className="text-white w-6 h-6"/>} color="bg-emerald-600" />
                <StatCard title="Net Liabilities" value={format(data.totalExpenses)} icon={<ExpensesIcon className="text-white w-6 h-6"/>} color="bg-rose-600" />
                <StatCard title="Total Dues Amount" value={format(data.totalDues)} icon={<DuesIcon className="text-white w-6 h-6"/>} color="bg-amber-500" />
                <StatCard title="Salaries Disbursed" value={format(data.totalSalariesPaid)} icon={<RupeeIcon className="text-white w-6 h-6"/>} color="bg-indigo-400" />
            </div>

            {/* Demographics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-xl border border-blue-50">
                    <div className="flex justify-around items-center">
                        <div className="text-center">
                            <p className="text-blue-500 font-black text-4xl">{data.totalBoys}</p>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Total Boys</p>
                        </div>
                        <div className="h-12 w-px bg-gray-100"></div>
                        <div className="text-center">
                            <p className="text-pink-500 font-black text-4xl">{data.totalGirls}</p>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Total Girls</p>
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-xl border border-gray-100">
                    <LineChart title="Fee Collection Trend (YTD)" data={data.revenueTrend} color="#10b981" />
                </div>
            </div>

            {/* Analytical Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <DonutChart title="Today's Turnout" data={data.attendanceToday} />
                <DonutChart title="Gender Ratio" data={data.genderData} />
                <DonutChart title="Financial Standing" data={data.feeStatusData} />
                
                <div className="lg:col-span-2">
                    <SimpleBarChart title="Top 10 Class Strengths" data={data.classStrength} color="bg-indigo-400" />
                </div>
                <DonutChart title="Expense Split" data={data.expenseCategory} />

                <div className="lg:col-span-2">
                    <SimpleBarChart title="Admission Growth (Monthly)" data={data.admissionTrend} color="bg-teal-400" />
                </div>
                <DonutChart title="Social Demographics" data={data.casteData} />
            </div>
        </div>
    );
};

export default Dashboard;
