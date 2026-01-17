
import React, { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { Student, Staff, Class, Expense, Attendance, ExamResult, SalaryRecord, OwnerProfile } from '../types';
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
    
    schoolProfile: any; // Using any to handle end_premium and premium_status
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
    const [trialExpired, setTrialExpired] = useState(false);
    
    // Timer State
    const [timeLeft, setTimeLeft] = useState<{days: number, hours: number, min: number, sec: number} | null>(null);
    const [currentPremiumPrice, setCurrentPremiumPrice] = useState(999);

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

            // --- PREMIUM & TRIAL ENFORCEMENT LOGIC ---
            if (ownerProfile) {
                const now = new Date();
                const regDate = new Date(ownerProfile.register_date);
                const diffTime = Math.abs(now.getTime() - regDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                let shouldUpdateDB = false;
                let updatedStatus = ownerProfile.premium_status;

                // Case 1: Subscription end_premium exists
                if (ownerProfile.end_premium) {
                    const expiryDate = new Date(ownerProfile.end_premium);
                    if (now > expiryDate) {
                        updatedStatus = ""; // Expired
                        shouldUpdateDB = true;
                    }
                } 
                // Case 2: 90 Days Trial Logic
                else if (diffDays > 90) {
                    setTrialExpired(true);
                    if (ownerProfile.premium_status) {
                        updatedStatus = ""; // Clear status on trial end
                        shouldUpdateDB = true;
                    }
                }

                if (shouldUpdateDB) {
                    await supabase.from('owner').update({ premium_status: updatedStatus }).eq('uid', user.id);
                }
            }

            // Existing Financial Calculations
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
                let studentHasDues = false;

                if (s.registration_date) {
                    const d = new Date(s.registration_date);
                    if (d.getFullYear() === currentYear) monthlyAdmissions[d.getMonth()]++;
                }

                const c = s.caste || 'General';
                casteMap.set(c, (casteMap.get(c) || 0) + 1);

                totalDues += (s.previous_dues || 0);
                if ((s.previous_dues || 0) > 0) studentHasDues = true;

                monthKeys.forEach((key, idx) => {
                    const status = s[key] as string;
                    const paid = parsePaidAmount(status);
                    const actualPaid = paid === Infinity ? fee : paid;
                    
                    totalRevenue += actualPaid;
                    const d = status && /^\d{4}/.test(status) ? new Date(status.split(';')[0].split('=d=')[1] || status) : null;
                    if (d && d.getFullYear() === currentYear) monthlyRevenue[d.getMonth()] += actualPaid;

                    if (idx <= currentMonthIdx) {
                        const due = fee - actualPaid;
                        if (due > 0) {
                            totalDues += due;
                            studentHasDues = true;
                        }
                    }
                });

                if (!studentHasDues) paidStudentsCount++;
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
                    { label: 'Fully Paid', value: paidStudentsCount, color: '#10b981' },
                    { label: 'Pending', value: students.length - paidStudentsCount, color: '#f59e0b' }
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

    // Countdown and Price Logic
    useEffect(() => {
        if (!data?.schoolProfile?.register_date) return;

        const regDate = new Date(data.schoolProfile.register_date);
        const trialEndDate = new Date(regDate.getTime() + 90 * 24 * 60 * 60 * 1000);

        const timer = setInterval(() => {
            const now = new Date();
            const diff = trialEndDate.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeLeft({ days: 0, hours: 0, min: 0, sec: 0 });
                clearInterval(timer);
            } else {
                setTimeLeft({
                    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                    min: Math.floor((diff / 1000 / 60) % 60),
                    sec: Math.floor((diff / 1000) % 60)
                });
            }

            const daysSinceReg = Math.floor((now.getTime() - regDate.getTime()) / (1000 * 60 * 60 * 24));
            const calculatedPrice = 999 + (daysSinceReg * 10);
            setCurrentPremiumPrice(Math.min(calculatedPrice, 1299));

        }, 1000);

        return () => clearInterval(timer);
    }, [data?.schoolProfile]);

    if (loading) return <div className="flex items-center justify-center h-screen bg-gray-50"><Spinner size="12"/></div>;
    if (error) return <div className="text-center text-red-500 p-8 text-xl font-bold">Error: {error}</div>;
    if (!data) return null;

    const format = (val: number) => `₹${val.toLocaleString('en-IN')}`;

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <style>{`
                @keyframes blink {
                    0% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(0.98); }
                    100% { opacity: 1; transform: scale(1); }
                }
                .bhuk-bhak {
                    animation: blink 1.5s infinite ease-in-out;
                }
                .premium-banner {
                    background: linear-gradient(90deg, #4f46e5, #9333ea, #db2777);
                    background-size: 200% 200%;
                    animation: gradientShift 5s ease infinite;
                }
                @keyframes gradientShift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            `}</style>

            {/* Trial Expiry Alert */}
            {trialExpired && !data.schoolProfile?.premium_status && (
                <div className="bg-rose-600 text-white p-4 rounded-xl shadow-lg flex items-center justify-between mb-4 border-2 border-white animate-pulse">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">⚠️</span>
                        <div>
                            <p className="font-black text-lg">90-Day Free Trial Expired</p>
                            <p className="text-xs opacity-90">Please activate your account to avoid data restriction.</p>
                        </div>
                    </div>
                    <a href="tel:9241981083" className="bg-white text-rose-600 px-4 py-2 rounded-lg font-black text-sm hover:bg-rose-50 transition-colors">ACTIVATE NOW</a>
                </div>
            )}

            {/* Existing Trial & Premium Banner UI */}
            {timeLeft && (
                <div className="premium-banner rounded-3xl p-6 text-white shadow-2xl overflow-hidden relative border-4 border-yellow-400 bhuk-bhak">
                    <div className="absolute -right-10 -top-10 opacity-10 rotate-12">
                        <RupeeIcon className="w-64 h-64" />
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
                        <div className="text-center md:text-left">
                            <h2 className="text-3xl font-black tracking-tighter uppercase mb-1">🎁 Limited Time Free Trial 🎁</h2>
                            <p className="text-indigo-100 font-bold text-lg">Your high-security administrative environment is active.</p>
                            <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4">
                                <div className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur-md border border-white/30 text-center min-w-[80px]">
                                    <span className="block text-2xl font-black">{timeLeft.days}</span>
                                    <span className="text-[10px] uppercase font-bold tracking-widest">Days</span>
                                </div>
                                <div className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur-md border border-white/30 text-center min-w-[80px]">
                                    <span className="block text-2xl font-black">{timeLeft.hours}</span>
                                    <span className="text-[10px] uppercase font-bold tracking-widest">Hours</span>
                                </div>
                                <div className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur-md border border-white/30 text-center min-w-[80px]">
                                    <span className="block text-2xl font-black">{timeLeft.min}</span>
                                    <span className="text-[10px] uppercase font-bold tracking-widest">Mins</span>
                                </div>
                                <div className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur-md border border-white/30 text-center min-w-[80px]">
                                    <span className="block text-2xl font-black text-yellow-300">{timeLeft.sec}</span>
                                    <span className="text-[10px] uppercase font-bold tracking-widest text-yellow-200">Secs</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-yellow-400 text-slate-900 p-6 rounded-2xl shadow-inner border-2 border-white text-center md:text-right min-w-[280px]">
                            <p className="text-xs font-black uppercase tracking-tighter opacity-70">Exclusive Activation Offer</p>
                            <div className="flex items-center justify-center md:justify-end gap-2 my-1">
                                <span className="text-lg line-through opacity-50 font-bold">₹1299</span>
                                <span className="text-4xl font-black">₹{currentPremiumPrice}</span>
                                <span className="text-xs font-bold bg-slate-900 text-white px-2 py-0.5 rounded">/YEAR</span>
                            </div>
                            <p className="text-[10px] font-bold text-rose-600 mb-4">*Price increases ₹10 every 24 hours</p>
                            <div className="bg-slate-900 text-white p-3 rounded-xl">
                                <p className="text-[10px] font-bold uppercase mb-1 opacity-60">Contact Agent for Activation</p>
                                <a href="tel:9241981083" className="text-xl font-black hover:text-yellow-400 transition-colors">9241981083</a>
                            </div>
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
