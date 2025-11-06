import React, { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { Student, Staff, Class, Expense, Attendance } from '../types';
import Spinner from '../components/Spinner';
import StatCard from '../components/StatCard';
import BarChart from '../components/BarChart';
import GroupedBarChart from '../components/GroupedBarChart';
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
    totalBoys: number;
    totalGirls: number;
    totalPaid: number;
    totalDues: number;
    totalExpenses: number;
    totalPreviousDues: number;
    genderByClass: { label: string; value1: number; value2: number }[];
    paidByClass: { label: string; value: number }[];
    duesByClass: { label: string; value: number }[];
    currentMonthPaidByClass: { label: string; value: number }[];
    currentMonthDuesByClass: { label: string; value: number }[];
    admissionsByMonth: { label: string; value: number }[];
    attendanceByMonth: { label: string; value1: number; value2: number }[];
}

const parsePaidAmount = (status: string | undefined | null): number => {
    if (!status || status === 'undefined' || status === 'Dues') {
        return 0;
    }

    const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
    if (isoDateRegex.test(status)) {
        return Infinity; // Represents a legacy full payment
    }

    const payments = status.split(';');
    return payments.reduce((total, payment) => {
        const parts = payment.split('=d=');
        if (parts.length === 2) {
            const amount = parseFloat(parts[0]);
            return total + (isNaN(amount) ? 0 : amount);
        }
        return total;
    }, 0);
};


const Dashboard: React.FC<DashboardProps> = ({ user }) => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const processData = useCallback((students: Student[], staff: Staff[], classes: Class[], expenses: Expense[], attendance: Attendance[]) => {
        // KPI Calculations
        const totalStudents = students.length;
        const totalStaff = staff.length;
        const totalClasses = classes.length;
        const totalBoys = students.filter(s => s.gender === 'Male').length;
        const totalGirls = students.filter(s => s.gender === 'Female').length;
        const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
        const totalPreviousDues = students.reduce((sum, s) => sum + (s.previous_dues || 0), 0);

        const classFeesMap = new Map(classes.map(c => [c.class_name, c.school_fees || 0]));
        const months: (keyof Student)[] = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
        const currentMonthIndex = new Date().getMonth();
        const currentMonthName = months[currentMonthIndex];
        
        let totalPaid = 0;
        let totalDues = 0;

        const genderByClass: { [key: string]: { boys: number, girls: number } } = {};
        const paidByClass: { [key: string]: number } = {};
        const duesByClass: { [key: string]: number } = {};
        const currentMonthPaidByClass: { [key: string]: number } = {};
        const currentMonthDuesByClass: { [key: string]: number } = {};
        const admissionsByMonth = Array(12).fill(0).map((_, i) => ({
            label: new Date(0, i).toLocaleString('default', { month: 'short' }),
            value: 0
        }));

        for (const s of students) {
            const fee = classFeesMap.get(s.class || '') || 0;
            
            // Gender by Class
            if (s.class) {
                if (!genderByClass[s.class]) genderByClass[s.class] = { boys: 0, girls: 0 };
                if (s.gender === 'Male') genderByClass[s.class].boys++;
                if (s.gender === 'Female') genderByClass[s.class].girls++;
            }

            // Admissions by Month
            const admissionMonth = new Date(s.registration_date).getMonth();
            admissionsByMonth[admissionMonth].value++;

            // Monthly Fee calculations
            months.forEach(month => {
                const status = s[month];
                if (!status || status === 'undefined') return;

                const paidForMonthRaw = parsePaidAmount(String(status));
                const paidForMonth = paidForMonthRaw === Infinity ? fee : paidForMonthRaw;

                totalPaid += paidForMonth;

                if (!paidByClass[s.class!]) paidByClass[s.class!] = 0;
                paidByClass[s.class!] += paidForMonth;
                
                if (month === currentMonthName) {
                    if (!currentMonthPaidByClass[s.class!]) currentMonthPaidByClass[s.class!] = 0;
                    currentMonthPaidByClass[s.class!] += paidForMonth;
                }

                if (paidForMonth < fee) {
                    const dueForMonth = fee - paidForMonth;
                    totalDues += dueForMonth;

                    if (!duesByClass[s.class!]) duesByClass[s.class!] = 0;
                    duesByClass[s.class!] += dueForMonth;

                    if (month === currentMonthName) {
                        if (!currentMonthDuesByClass[s.class!]) currentMonthDuesByClass[s.class!] = 0;
                        currentMonthDuesByClass[s.class!] += dueForMonth;
                    }
                }
            });

            // Other Fees calculation
            if (s.other_fees) {
                for (const otherFee of s.other_fees) {
                    if (otherFee.paid_date) {
                        totalPaid += otherFee.amount;
                    } else {
                        totalDues += otherFee.amount;
                    }
                }
            }
            
            // Previous Dues
            if (s.previous_dues) {
                totalDues += s.previous_dues;
                if (s.class) {
                    if (!duesByClass[s.class!]) duesByClass[s.class!] = 0;
                    duesByClass[s.class!] += s.previous_dues;
                }
            }
        }

        // Attendance by Month
        const attendanceByMonthData = Array(12).fill(0).map(() => ({ present: 0, absent: 0 }));
        const currentYear = new Date().getFullYear().toString();
        for (const record of attendance) {
            if (record.date.startsWith(currentYear)) {
                const monthIndex = new Date(record.date).getMonth();
                const presentCount = record.present ? record.present.split(',').length : 0;
                const absentCount = record.absent ? record.absent.split(',').length : 0;
                attendanceByMonthData[monthIndex].present += presentCount;
                attendanceByMonthData[monthIndex].absent += absentCount;
            }
        }
        const attendanceByMonth = attendanceByMonthData.map((d, i) => ({
            label: new Date(0, i).toLocaleString('default', { month: 'short' }),
            value1: d.present,
            value2: d.absent
        }));
        
        // Format data for charts
        const formatForChart = (obj: { [key: string]: number }) => Object.entries(obj).map(([label, value]) => ({ label, value })).sort((a,b) => b.value - a.value);

        setData({
            totalStudents, totalStaff, totalClasses, totalBoys, totalGirls, totalPaid, totalDues, totalExpenses, totalPreviousDues,
            genderByClass: Object.entries(genderByClass).map(([label, { boys, girls }]) => ({ label, value1: boys, value2: girls })),
            paidByClass: formatForChart(paidByClass),
            duesByClass: formatForChart(duesByClass),
            currentMonthPaidByClass: formatForChart(currentMonthPaidByClass),
            currentMonthDuesByClass: formatForChart(currentMonthDuesByClass),
            admissionsByMonth,
            attendanceByMonth
        });

    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const currentYear = new Date().getFullYear();
                const [studentsRes, staffRes, classesRes, expensesRes, attendanceRes] = await Promise.all([
                    supabase.from('students').select('*'),
                    supabase.from('staff').select('id'),
                    supabase.from('classes').select('*'),
                    supabase.from('expenses').select('amount'),
                    supabase.from('attendance').select('date, present, absent').gte('date', `${currentYear}-01-01`).lte('date', `${currentYear}-12-31`)
                ]);

                if (studentsRes.error) throw studentsRes.error;
                if (staffRes.error) throw staffRes.error;
                if (classesRes.error) throw classesRes.error;
                if (expensesRes.error) throw expensesRes.error;
                if (attendanceRes.error) throw attendanceRes.error;

                processData(
                    studentsRes.data as Student[],
                    staffRes.data as Staff[],
                    classesRes.data as Class[],
                    expensesRes.data as Expense[],
                    attendanceRes.data as Attendance[]
                );

            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [processData, user.id]);
    
    if (loading) {
        return <div className="flex items-center justify-center h-full"><Spinner size="12"/></div>;
    }
    
    if (error) {
        return <div className="text-center text-red-500">Error loading dashboard data: {error}</div>;
    }

    if (!data) {
        return <div className="text-center text-gray-500">No data to display.</div>;
    }

    const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                 <StatCard title="Total Students" value={data.totalStudents} icon={<StudentsIcon className="w-7 h-7 text-white"/>} color="bg-blue-500" />
                 <StatCard title="Total Staff" value={data.totalStaff} icon={<StaffIcon className="w-7 h-7 text-white"/>} color="bg-purple-500" />
                 <StatCard title="Total Classes" value={data.totalClasses} icon={<ClassesIcon className="w-7 h-7 text-white"/>} color="bg-indigo-500" />

                 <StatCard title="Total Boys" value={data.totalBoys} icon={<StudentsIcon className="w-7 h-7 text-white"/>} color="bg-sky-500" />
                 <StatCard title="Total Girls" value={data.totalGirls} icon={<StudentsIcon className="w-7 h-7 text-white"/>} color="bg-pink-500" />
                 <StatCard title="Total Expenses" value={formatCurrency(data.totalExpenses)} icon={<ExpensesIcon className="w-7 h-7 text-white"/>} color="bg-orange-500" />

                 <StatCard title="Total Paid" value={formatCurrency(data.totalPaid)} icon={<RupeeIcon className="w-7 h-7 text-white"/>} color="bg-green-500" />
                 <StatCard title="Total Dues" value={formatCurrency(data.totalDues)} icon={<DuesIcon className="w-7 h-7 text-white"/>} color="bg-red-500" />
                 <StatCard title="Previous Dues" value={formatCurrency(data.totalPreviousDues)} icon={<DuesIcon className="w-7 h-7 text-white"/>} color="bg-yellow-500" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                 <div className="lg:col-span-2 xl:col-span-3">
                     <GroupedBarChart title="Monthly Attendance Summary" data={data.attendanceByMonth} label1="Present" label2="Absent" color1="bg-green-500" color2="bg-red-500" />
                 </div>
                 <div className="xl:col-span-3">
                     <GroupedBarChart title="Students per Class" data={data.genderByClass} label1="Boys" label2="Girls" color1="bg-sky-500" color2="bg-pink-500" />
                 </div>
                 <BarChart title="Total Paid Fees by Class" data={data.paidByClass} color="bg-green-500" />
                 <BarChart title="Total Dues by Class" data={data.duesByClass} color="bg-red-500" />
                 <div className="lg:col-span-2 xl:col-span-1">
                    <BarChart title="Monthly Student Admissions" data={data.admissionsByMonth} color="bg-indigo-500" />
                 </div>
                 <BarChart title="Current Month Paid by Class" data={data.currentMonthPaidByClass} color="bg-green-400" />
                 <BarChart title="Current Month Dues by Class" data={data.currentMonthDuesByClass} color="bg-red-400" />
            </div>
        </div>
    );
};

export default Dashboard;