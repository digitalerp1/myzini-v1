
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
    schoolProfile: any; 
}

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const monthKeys: (keyof Student)[] = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

const parsePaidAmount = (status: string | undefined | null): number => {
    if (!status || status === 'undefined' || status === 'Dues') return 0;
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(status)) return Infinity;
    return status.split(';').reduce((total, p) => {
        const parts = p.split('=d=');
        return total + (parts.length === 2 ? parseFloat(parts[0]) || 0 : 0);
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
            const currentMonthIdx = new Date().getMonth();

            const [studentsRes, staffRes, classesRes, subjectsRes, expensesRes, salaryRes, attRes, ownerRes] = await Promise.all([
                supabase.from('students').select('*'),
                supabase.from('staff').select('*'),
                supabase.from('classes').select('*'),
                supabase.from('subjects').select('*', { count: 'exact', head: true }),
                supabase.from('expenses').select('*'),
                supabase.from('salary_records').select('*'),
                supabase.from('attendance').select('*').eq('date', today),
                supabase.from('owner').select('*').eq('uid', user.id).single()
            ]);

            if (studentsRes.error) throw studentsRes.error;

            const students = studentsRes.data as Student[];
            const staff = staffRes.data as Staff[];
            const classes = classesRes.data as Class[];
            const expenses = expensesRes.data as Expense[];
            const salaries = salaryRes.data as SalaryRecord[];
            const attendance = attRes.data as Attendance[];
            const ownerProfile = ownerRes.data;

            const classFeesMap = new Map(classes.map(c => [c.class_name, c.school_fees || 0]));
            let totalRevenue = 0;
            let totalDues = 0;
            let paidStudentsCount = 0;
            
            const monthlyRevenue = new Array(12).fill(0);
            const monthlyAdmissions = new Array(12).fill(0);
            const casteMap = new Map<string, number>();
            const expenseMap = new Map<string, number>();

            students.forEach(s => {
                const className = s.class || '';
                const baseFee = classFeesMap.get(className) || 0;
                // DISCOUNT LOGIC: Calculate net fee per student
                const discount = s.discount || 0;
                const netMonthlyFee = baseFee - (baseFee * discount / 100);

                if (s.registration_date) {
                    const d = new Date(s.registration_date);
                    if (d.getFullYear() === currentYear) monthlyAdmissions[d.getMonth()]++;
                }

                const c = s.caste || 'General';
                casteMap.set(c, (casteMap.get(c) || 0) + 1);

                totalDues += (s.previous_dues || 0);
                let studentPending = (s.previous_dues || 0);

                monthKeys.forEach((key, idx) => {
                    const status = s[key] as string;
                    const paid = parsePaidAmount(status);
                    const actualPaid = paid === Infinity ? netMonthlyFee : paid;
                    
                    totalRevenue += actualPaid;
                    const d = status && /^\d{4}/.test(status) ? new Date(status.split(';')[0].split('=d=')[1] || status) : null;
                    if (d && d.getFullYear() === currentYear) monthlyRevenue[d.getMonth()] += actualPaid;

                    if (idx <= currentMonthIdx) {
                        const due = netMonthlyFee - actualPaid;
                        if (due > 0) {
                            totalDues += due;
                            studentPending += due;
                        }
                    }
                });

                if (studentPending <= 0) paidStudentsCount++;
            });

            let presentCount = 0;
            attendance.forEach(rec => {
                presentCount += rec.present ? rec.present.split(',').length : 0;
            });

            const totalSalariesPaid = salaries.reduce((sum, s) => sum + s.amount, 0);
            const totalExps = expenses.reduce((sum, e) => {
                expenseMap.set(e.category, (expenseMap.get(e.category) || 0) + e.amount);
                return sum + e.amount;
            }, 0);

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
                    { label: 'Up to Date', value: paidStudentsCount, color: '#10b981' },
                    { label: 'Outstanding', value: students.length - paidStudentsCount, color: '#f59e0b' }
                ],
                revenueTrend: monthlyRevenue.map((val, i) => ({ label: monthNames[i], value: val })),
                admissionTrend: monthlyAdmissions.map((val, i) => ({ label: monthNames[i], value: val })),
                expenseCategory: Array.from(expenseMap.entries()).map(([label, value], i) => ({
                    label, value, color: ['#f87171', '#60a5fa', '#34d399', '#fbbf24', '#a78bfa'][i % 5]
                })),
                classStrength: Array.from(new Map(students.map(s => [s.class || 'N/A', students.filter(x => x.class === s.class).length])).entries()).map(([label, value]) => ({ label, value })).sort((a,b) => b.value - a.value).slice(0, 10),
                schoolProfile: ownerProfile
            });

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user.id]);

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
                    <p className="text-gray-500 mt-1 font-medium">Real-time stats including student discounts and financials.</p>
                </div>
                <button onClick={fetchData} className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all">Refresh</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Students" value={data.totalStudents} icon={<StudentsIcon className="text-white w-6 h-6"/>} color="bg-indigo-600" />
                <StatCard title="Total Staff" value={data.totalStaff} icon={<StaffIcon className="text-white w-6 h-6"/>} color="bg-pink-600" />
                <StatCard title="Total Classes" value={data.totalClasses} icon={<ClassesIcon className="text-white w-6 h-6"/>} color="bg-blue-600" />
                <StatCard title="Subjects" value={data.totalSubjects} icon={<AcademicCapIcon className="text-white w-6 h-6"/>} color="bg-teal-600" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Net Revenue" value={format(data.totalRevenue)} icon={<RupeeIcon className="text-white w-6 h-6"/>} color="bg-emerald-600" />
                <StatCard title="Liabilities" value={format(data.totalExpenses)} icon={<ExpensesIcon className="text-white w-6 h-6"/>} color="bg-rose-600" />
                <StatCard title="Total Dues" value={format(data.totalDues)} icon={<DuesIcon className="text-white w-6 h-6"/>} color="bg-amber-500" />
                <StatCard title="Salaries Paid" value={format(data.totalSalariesPaid)} icon={<RupeeIcon className="text-white w-6 h-6"/>} color="bg-indigo-400" />
            </div>

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
                    <LineChart title="Collection Trend (After Discounts)" data={data.revenueTrend} color="#10b981" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <DonutChart title="Today's Attendance" data={data.attendanceToday} />
                <DonutChart title="Gender Ratio" data={data.genderData} />
                <DonutChart title="Fee Standings" data={data.feeStatusData} />
                <div className="lg:col-span-2"><SimpleBarChart title="Class Strengths" data={data.classStrength} color="bg-indigo-400" /></div>
                <DonutChart title="Expense Split" data={data.expenseCategory} />
            </div>
        </div>
    );
};

export default Dashboard;
