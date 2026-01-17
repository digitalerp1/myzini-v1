
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
    
    schoolProfile: any; 
}

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const monthKeys: (keyof Student)[] = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

const parsePaidAmount = (status: string | undefined | null): number => {
    if (!status || status === 'undefined' || status === 'Dues') return 0;
    // Check if it's a legacy full date string
    if (/^\d{4}-\d{2}-\d{2}/.test(status) && !status.includes('=d=')) return Infinity;
    // Check if it's the new partial payment format: amount=d=date;amount2=d=date2
    return status.split(';').reduce((total, p) => {
        const parts = p.split('=d=');
        return total + (parts.length >= 1 ? parseFloat(parts[0]) || 0 : 0);
    }, 0);
};

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Premium Tracking UI State
    const [premiumMeta, setPremiumMeta] = useState<{
        statusLabel: string;
        timeLabel: string;
        time: { days: number; hours: number; min: number; sec: number };
        isExpired: boolean;
        isPremium: boolean;
    } | null>(null);

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

            const students = studentsRes.data as Student[] || [];
            const staff = staffRes.data as Staff[] || [];
            const classes = classesRes.data as Class[] || [];
            const expenses = expensesRes.data as Expense[] || [];
            const salaries = salaryRes.data as SalaryRecord[] || [];
            const attendance = attRes.data as Attendance[] || [];
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
                const fee = classFeesMap.get(className) || 0;
                let studentIsFullyPaid = true;

                if (s.registration_date) {
                    const d = new Date(s.registration_date);
                    if (d.getFullYear() === currentYear) monthlyAdmissions[d.getMonth()]++;
                }

                const c = s.caste || 'General';
                casteMap.set(c, (casteMap.get(c) || 0) + 1);

                totalDues += (s.previous_dues || 0);

                monthKeys.forEach((key, idx) => {
                    const status = s[key] as string;
                    const paid = parsePaidAmount(status);
                    const actualPaid = paid === Infinity ? fee : paid;
                    
                    totalRevenue += actualPaid;
                    
                    // Group revenue by payment date if possible
                    if (status && status.includes('=d=')) {
                        const firstDateStr = status.split(';')[0].split('=d=')[1];
                        const d = new Date(firstDateStr);
                        if (!isNaN(d.getTime()) && d.getFullYear() === currentYear) {
                            monthlyRevenue[d.getMonth()] += actualPaid;
                        }
                    }

                    if (idx <= currentMonthIdx) {
                        const due = fee - actualPaid;
                        if (due > 0) {
                            totalDues += due;
                            studentIsFullyPaid = false;
                        }
                    }
                });

                if (studentIsFullyPaid) paidStudentsCount++;
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
                    { label: 'Cleared', value: paidStudentsCount, color: '#10b981' },
                    { label: 'Due', value: students.length - paidStudentsCount, color: '#f59e0b' }
                ],
                revenueTrend: monthlyRevenue.map((val, i) => ({ label: monthNames[i], value: val })),
                admissionTrend: monthlyAdmissions.map((val, i) => ({ label: monthNames[i], value: val })),
                expenseCategory,
                classStrength: Array.from(classCountMap.entries()).map(([label, value]) => ({ label, value })).sort((a,b) => b.value - a.value).slice(0, 10),
                schoolProfile: ownerProfile
            });

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user.id]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // --- TIMER & PREMIUM LOGIC ---
    useEffect(() => {
        if (!data?.schoolProfile) return;

        const timerInterval = setInterval(() => {
            const now = new Date();
            const profile = data.schoolProfile;
            let targetDate: Date;
            let isPremium = false;

            if (profile.end_premium && profile.end_premium.trim() !== "") {
                // PREMIUM MODE: Parse YYYY-MM-DD-HH:mm
                const p = profile.end_premium.split('-');
                const dateStr = `${p[0]}-${p[1]}-${p[2]}T${p[3]}:00`;
                targetDate = new Date(dateStr);
                isPremium = true;
            } else {
                // TRIAL MODE: 90 Days from registration
                const regDate = new Date(profile.register_date);
                targetDate = new Date(regDate.getTime() + (90 * 24 * 60 * 60 * 1000));
                isPremium = false;
            }

            const diff = targetDate.getTime() - now.getTime();
            const isExpired = diff <= 0;
            const absDiff = Math.abs(diff);

            setPremiumMeta({
                isPremium,
                isExpired,
                statusLabel: isExpired ? "Subscription Expired" : (isPremium ? "Premium Protection Active" : "Free Trial Active"),
                timeLabel: isExpired ? "Time since expiry" : "Remaining Time",
                time: {
                    days: Math.floor(absDiff / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((absDiff / (1000 * 60 * 60)) % 24),
                    min: Math.floor((absDiff / 1000 / 60) % 60),
                    sec: Math.floor((absDiff / 1000) % 60)
                }
            });
        }, 1000);

        return () => clearInterval(timerInterval);
    }, [data?.schoolProfile]);

    if (loading) return <div className="flex items-center justify-center h-screen bg-gray-50"><Spinner size="12"/></div>;
    if (error) return <div className="text-center text-red-500 p-8 text-xl font-bold">Error: {error}</div>;
    if (!data) return null;

    const format = (val: number) => `₹${val.toLocaleString('en-IN')}`;

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <style>{`
                @keyframes flow { from { background-position: 0% 50%; } to { background-position: 100% 50%; } }
                .premium-banner {
                    background: linear-gradient(90deg, #4f46e5, #9333ea, #db2777);
                    background-size: 200% 200%;
                    animation: flow 5s linear infinite;
                }
                .trial-banner {
                    background: linear-gradient(90deg, #1e2937, #4b5563);
                }
                .expired-banner {
                    background: linear-gradient(90deg, #b91c1c, #450a0a);
                }
            `}</style>

            {/* Premium Header Banner */}
            {premiumMeta && (
                <div className={`rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden border-4 border-white ${premiumMeta.isExpired ? 'expired-banner' : premiumMeta.isPremium ? 'premium-banner' : 'trial-banner'}`}>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                        <div className="text-center md:text-left">
                            <h2 className="text-4xl font-black tracking-tighter uppercase mb-1">
                                {premiumMeta.isExpired ? '⚠️ ' : '💎 '}{premiumMeta.statusLabel}
                            </h2>
                            <p className="text-white/80 font-bold text-lg">
                                {premiumMeta.isExpired ? 'Your institutional access period has ended. Contact support for renewal.' : 'Your high-security administrative environment is fully functional.'}
                            </p>
                            
                            <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-4">
                                {[
                                    {v: premiumMeta.time.days, l: 'Days'},
                                    {v: premiumMeta.time.hours, l: 'Hrs'},
                                    {v: premiumMeta.time.min, l: 'Min'},
                                    {v: premiumMeta.time.sec, l: 'Sec', c: 'text-yellow-300'}
                                ].map((t, idx) => (
                                    <div key={idx} className="bg-black/20 px-5 py-3 rounded-2xl backdrop-blur-md border border-white/20 text-center min-w-[90px]">
                                        <span className={`block text-3xl font-black ${t.c || ''}`}>{t.v}</span>
                                        <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">{t.l}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white/10 p-6 rounded-3xl backdrop-blur-xl border border-white/20 text-center md:text-right min-w-[300px]">
                            <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-3">Service & Activation</p>
                            <a href="tel:9241981083" className="text-3xl font-black hover:text-yellow-400 transition-colors block mb-1">9241981083</a>
                            <p className="text-[10px] font-bold">Contact for premium keys or technical aid</p>
                            {premiumMeta.isExpired && (
                                <button className="mt-6 w-full bg-white text-rose-700 font-black py-3 rounded-xl hover:bg-rose-50 transition-all shadow-xl">REACTIVATE ACCOUNT</button>
                            )}
                        </div>
                    </div>
                </div>
            )}

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
                <StatCard title="Subjects" value={data.totalSubjects} icon={<AcademicCapIcon className="text-white w-6 h-6"/>} color="bg-teal-600" />
            </div>

            {/* Financial Health Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Revenue" value={format(data.totalRevenue)} icon={<RupeeIcon className="text-white w-6 h-6"/>} color="bg-emerald-600" />
                <StatCard title="Expenses" value={format(data.totalExpenses)} icon={<ExpensesIcon className="text-white w-6 h-6"/>} color="bg-rose-600" />
                <StatCard title="Net Dues" value={format(data.totalDues)} icon={<DuesIcon className="text-white w-6 h-6"/>} color="bg-amber-500" />
                <StatCard title="Salaries Paid" value={format(data.totalSalariesPaid)} icon={<RupeeIcon className="text-white w-6 h-6"/>} color="bg-indigo-400" />
            </div>

            {/* Analytical Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <DonutChart title="Today's Attendance" data={data.attendanceToday} />
                <DonutChart title="Gender Distribution" data={data.genderData} />
                <DonutChart title="Financial Standing" data={data.feeStatusData} />
                
                <div className="lg:col-span-2">
                    <LineChart title="Collection Trend (Current Year)" data={data.revenueTrend} color="#10b981" />
                </div>
                <DonutChart title="Expenditure Breakdown" data={data.expenseCategory} />

                <div className="lg:col-span-2">
                    <SimpleBarChart title="Class-wise Strength" data={data.classStrength} color="bg-indigo-400" />
                </div>
                <DonutChart title="Caste Distribution" data={data.casteData} />

                <div className="lg:col-span-3">
                    <SimpleBarChart title="Monthly Admissions" data={data.admissionTrend} color="bg-teal-400" />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
