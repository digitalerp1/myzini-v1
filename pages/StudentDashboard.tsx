
import React, { useState, useMemo } from 'react';
import { Student } from '../types';
import LogoutIcon from '../components/icons/LogoutIcon';
import UserCircleIcon from '../components/icons/UserCircleIcon';
import CalendarIcon from '../components/icons/CalendarIcon';
import RupeeIcon from '../components/icons/RupeeIcon';
import AcademicCapIcon from '../components/icons/AcademicCapIcon';

interface AggregatedStudentData {
    student_profile: Student;
    school_info: {
        school_name: string;
        address: string;
        principal_name?: string;
        school_image_url?: string;
        mobile?: string;
        website?: string;
    };
    class_info?: {
        school_fees: number;
        class_teacher?: { name: string; mobile: string };
        time_table?: { subject: string; teacher: string; time: string }[];
    };
    exam_results: any[];
    attendance_records: { date: string; status: 'Present' | 'Absent' | 'Holiday' }[];
}

interface StudentDashboardProps {
    student: AggregatedStudentData[];
    onLogout: () => void;
}

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const monthKeys = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

const parsePaidAmount = (status: string | undefined | null): number => {
    if (!status || status === 'undefined' || status === 'Dues') return 0;
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(status)) return Infinity; 
    return status.split(';').reduce((total, p) => {
        const parts = p.split('=d=');
        return total + (parts.length === 2 ? parseFloat(parts[0]) || 0 : 0);
    }, 0);
};

const StudentDashboard: React.FC<StudentDashboardProps> = ({ student: studentsData, onLogout }) => {
    const [selectedStudentIndex, setSelectedStudentIndex] = useState(0);
    const [activeTab, setActiveTab] = useState<'profile' | 'fees' | 'attendance' | 'results' | 'routine'>('profile');

    const currentData = studentsData[selectedStudentIndex];
    const { student_profile: profile, school_info: school, exam_results: examResults, attendance_records: attendanceData, class_info } = currentData;
    
    const baseMonthlyFee = class_info?.school_fees || 0;
    const discountPercent = profile.discount || 0;
    const netMonthlyFee = baseMonthlyFee - (baseMonthlyFee * discountPercent / 100);

    const feeLedger = useMemo(() => {
        let currentYearDues = (profile.previous_dues || 0);
        let currentYearPaid = 0;
        const currentMonthIdx = new Date().getMonth();

        const ledger = monthKeys.map((key, idx) => {
            const status = profile[key as keyof Student] as string;
            const paid = parsePaidAmount(status);
            const actualPaid = paid === Infinity ? netMonthlyFee : paid;
            
            currentYearPaid += actualPaid;
            
            const isPast = idx <= currentMonthIdx;
            let statusText = 'Upcoming';
            let color = 'bg-gray-100 text-gray-400';
            
            if (actualPaid >= netMonthlyFee && netMonthlyFee > 0) {
                statusText = 'Paid';
                color = 'bg-emerald-100 text-emerald-700';
            } else if (actualPaid > 0) {
                statusText = `Bal: ₹${Math.round(netMonthlyFee - actualPaid)}`;
                color = 'bg-amber-100 text-amber-700';
                if (isPast) currentYearDues += (netMonthlyFee - actualPaid);
            } else if (isPast || status === 'Dues') {
                statusText = 'Due';
                color = 'bg-rose-100 text-rose-700';
                if (isPast) currentYearDues += netMonthlyFee;
            }

            return { month: monthNames[idx], statusText, color, paid: actualPaid };
        });

        return { ledger, totalPaid: Math.round(currentYearPaid), totalDues: Math.round(currentYearDues) };
    }, [profile, netMonthlyFee]);

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <header className="bg-white shadow-md px-6 h-16 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white font-black text-xl">
                        {school.school_name.charAt(0)}
                    </div>
                    <h1 className="text-lg font-black text-gray-900 hidden sm:block">{school.school_name}</h1>
                </div>
                <div className="flex items-center gap-4">
                    {studentsData.length > 1 && (
                        <select className="bg-indigo-50 text-primary py-1.5 px-4 rounded-full text-xs font-black outline-none" value={selectedStudentIndex} onChange={(e) => setSelectedStudentIndex(Number(e.target.value))}>
                            {studentsData.map((s, idx) => <option key={idx} value={idx}>{s.student_profile.name}</option>)}
                        </select>
                    )}
                    <button onClick={onLogout} className="flex items-center gap-2 text-gray-400 hover:text-rose-500 font-bold text-sm transition-colors">
                        <LogoutIcon /> <span className="hidden sm:inline">Logout</span>
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex bg-white p-1 rounded-2xl shadow-sm mb-8 overflow-x-auto gap-1 border border-gray-100">
                    {['profile', 'fees', 'routine', 'results', 'attendance'].map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab as any)} className={`flex-1 py-3 px-6 rounded-xl text-sm font-black transition-all capitalize whitespace-nowrap ${activeTab === tab ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50 hover:text-primary'}`}>{tab}</button>
                    ))}
                </div>

                {activeTab === 'fees' && (
                    <div className="animate-fade-in space-y-8">
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                            <div className="bg-white p-8 rounded-[2rem] border-2 border-emerald-100 text-center shadow-sm">
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Base Fee</p>
                                <p className="text-3xl font-black text-emerald-900 mt-1">₹{baseMonthlyFee}</p>
                            </div>
                            <div className="bg-amber-50 p-8 rounded-[2rem] border-2 border-amber-100 text-center shadow-sm">
                                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Your Discount</p>
                                <p className="text-3xl font-black text-amber-900 mt-1">{discountPercent}%</p>
                            </div>
                            <div className="bg-emerald-50 p-8 rounded-[2rem] border-2 border-emerald-100 text-center shadow-sm">
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Total Paid</p>
                                <p className="text-3xl font-black text-emerald-900 mt-1">₹{feeLedger.totalPaid}</p>
                            </div>
                            <div className="bg-rose-50 p-8 rounded-[2rem] border-2 border-rose-100 text-center shadow-sm">
                                <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Current Dues</p>
                                <p className="text-3xl font-black text-rose-900 mt-1">₹{feeLedger.totalDues}</p>
                            </div>
                        </div>

                        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100">
                            <h3 className="text-2xl font-black text-gray-800 mb-10">Monthly Ledger (Session 2024-25)</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                                {feeLedger.ledger.map((m, idx) => (
                                    <div key={idx} className="bg-gray-50 rounded-3xl p-6 border border-gray-100 hover:shadow-lg transition-all">
                                        <p className="font-black text-gray-800 text-lg">{m.month}</p>
                                        <div className={`mt-3 inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${m.color}`}>
                                            {m.statusText}
                                        </div>
                                        <p className="mt-4 text-xs text-gray-400 font-bold tracking-wider">Paid: ₹{m.paid.toFixed(0)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                
                {/* ... other tabs ... */}
            </main>
        </div>
    );
};

export default StudentDashboard;
