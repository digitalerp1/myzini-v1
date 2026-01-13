
import React, { useState } from 'react';
import { Student } from '../types';
import LogoutIcon from '../components/icons/LogoutIcon';
import UserCircleIcon from '../components/icons/UserCircleIcon';
import CalendarIcon from '../components/icons/CalendarIcon';

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

const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const parsePaidAmount = (status: string | undefined | null): number => {
    if (!status || status === 'undefined' || status === 'Dues') return 0;
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
    if (isoDateRegex.test(status)) return Infinity;
    return status.split(';').reduce((total, payment) => {
        const parts = payment.split('=d=');
        return total + (parts.length === 2 ? parseFloat(parts[0]) || 0 : 0);
    }, 0);
};

const StudentDashboard: React.FC<StudentDashboardProps> = ({ student: studentsData, onLogout }) => {
    const [selectedStudentIndex, setSelectedStudentIndex] = useState(0);
    const [activeTab, setActiveTab] = useState<'profile' | 'fees' | 'attendance' | 'results' | 'routine'>('profile');
    const [feeView, setFeeView] = useState<'current' | 'all'>('current');

    const currentData = studentsData[selectedStudentIndex];
    const { student_profile: profile, school_info: school, exam_results: examResults, attendance_records: attendanceData, class_info } = currentData;
    
    const monthlyFee = class_info?.school_fees || 0;
    const timeTable = currentData.class_info?.time_table || [];

    // --- FEE ANALYSIS (Cross Year Aware) ---
    let totalPaidSum = 0;
    let currentSessionDues = 0;
    const previousArrears = profile.previous_dues || 0;

    const feeLedger = months.map((monthKey, index) => {
        const status = profile[monthKey as keyof Student] as string | undefined;
        const paidAmountRaw = parsePaidAmount(status);
        const paidAmount = paidAmountRaw === Infinity ? monthlyFee : paidAmountRaw;
        totalPaidSum += paidAmount;

        const isPastOrCurrent = index <= new Date().getMonth();
        let statusText = 'Upcoming';
        let statusColor = 'bg-gray-100 text-gray-400';
        let balanceForMonth = 0;

        if (paidAmount >= monthlyFee && monthlyFee > 0) {
            statusText = 'Paid';
            statusColor = 'bg-green-100 text-green-700';
        } else if (paidAmount > 0) {
            balanceForMonth = monthlyFee - paidAmount;
            statusText = `Bal: ₹${balanceForMonth}`;
            statusColor = 'bg-yellow-100 text-yellow-700';
            if (isPastOrCurrent) currentSessionDues += balanceForMonth;
        } else if (status === 'Dues' || isPastOrCurrent) {
            statusText = 'Dues';
            statusColor = 'bg-red-100 text-red-700';
            if (isPastOrCurrent) currentSessionDues += monthlyFee;
        }

        return { month: monthNames[index], feeAmount: monthlyFee, paidAmount, statusText, statusColor };
    });

    const netOutstanding = currentSessionDues + previousArrears;

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20">
            <header className="bg-white shadow-sm sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black text-xl">
                            {school.school_name.charAt(0)}
                        </div>
                        <h1 className="text-lg font-bold text-gray-900 hidden sm:block">{school.school_name}</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        {studentsData.length > 1 && (
                            <select className="bg-indigo-50 border-none text-indigo-700 py-1.5 px-3 rounded-full text-sm font-bold outline-none" value={selectedStudentIndex} onChange={(e) => setSelectedStudentIndex(Number(e.target.value))}>
                                {studentsData.map((s, idx) => <option key={idx} value={idx}>{s.student_profile.name}</option>)}
                            </select>
                        )}
                        <button onClick={onLogout} className="text-gray-400 hover:text-red-500"><LogoutIcon /></button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm mb-8 overflow-x-auto">
                    {['profile', 'fees', 'routine', 'results', 'attendance'].map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab as any)} className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all capitalize whitespace-nowrap ${activeTab === tab ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-indigo-600'}`}>{tab}</button>
                    ))}
                </div>

                {activeTab === 'profile' && (
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden animate-fade-in">
                        <div className="h-32 bg-indigo-600"></div>
                        <div className="px-10 pb-10">
                            <div className="flex flex-col sm:flex-row items-center gap-6 -mt-12 mb-8 text-center sm:text-left">
                                <img src={profile.photo_url || `https://ui-avatars.com/api/?name=${profile.name}`} className="w-32 h-32 rounded-3xl border-4 border-white shadow-2xl object-cover bg-white" alt=""/>
                                <div className="flex-1">
                                    <h2 className="text-3xl font-black text-gray-900">{profile.name}</h2>
                                    <p className="text-indigo-600 font-bold">Class {profile.class} | Roll {profile.roll_number}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <Section label="Academic Details" icon="🎓">
                                    <InfoRow label="Registration" value={new Date(profile.registration_date).toLocaleDateString()} />
                                    <InfoRow label="Aadhar" value={profile.aadhar} />
                                    <InfoRow label="Gender" value={profile.gender} />
                                </Section>
                                <Section label="Guardian Details" icon="🏠">
                                    <InfoRow label="Father" value={profile.father_name} />
                                    <InfoRow label="Mobile" value={profile.mobile} />
                                    <InfoRow label="Address" value={profile.address} />
                                </Section>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'fees' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-emerald-50 p-6 rounded-2xl border-2 border-emerald-100 text-center">
                                <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">Total Paid</p>
                                <p className="text-3xl font-black text-emerald-900">₹{totalPaidSum.toLocaleString()}</p>
                            </div>
                            <div className="bg-rose-50 p-6 rounded-2xl border-2 border-rose-100 text-center">
                                <p className="text-xs font-black text-rose-600 uppercase tracking-widest">Net Balance Due</p>
                                <p className="text-3xl font-black text-rose-900">₹{netOutstanding.toLocaleString()}</p>
                            </div>
                             <div className="bg-indigo-50 p-6 rounded-2xl border-2 border-indigo-100 text-center">
                                <p className="text-xs font-black text-indigo-600 uppercase tracking-widest">Previous Arrears</p>
                                <p className="text-3xl font-black text-indigo-900">₹{previousArrears.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-black text-gray-800">Fee Ledger Analysis</h3>
                                <div className="flex bg-gray-100 p-1 rounded-lg">
                                    <button onClick={() => setFeeView('current')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${feeView === 'current' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}>This Year</button>
                                    <button onClick={() => setFeeView('all')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${feeView === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}>Life History</button>
                                </div>
                            </div>

                            {feeView === 'current' ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {feeLedger.map((row, idx) => (
                                        <div key={idx} className="bg-gray-50 rounded-2xl p-4 flex flex-col justify-between border border-gray-100">
                                            <p className="font-black text-gray-800 text-sm">{row.month}</p>
                                            <span className={`mt-2 px-3 py-1 rounded-full text-[10px] font-black uppercase text-center ${row.statusColor}`}>
                                                {row.statusText}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 space-y-4">
                                    <div className="bg-gray-50 p-6 rounded-2xl border border-dashed border-gray-300">
                                        <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">Cumulative Cross-Year Summary</p>
                                        <div className="grid grid-cols-2 gap-4 mt-6">
                                            <div className="text-left bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                                <p className="text-xs text-gray-400 font-bold">Total Fees Invoiced</p>
                                                <p className="text-xl font-black text-gray-800">₹{((monthlyFee * 12) + previousArrears).toLocaleString()}</p>
                                            </div>
                                            <div className="text-left bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                                <p className="text-xs text-gray-400 font-bold">Total Credits Received</p>
                                                <p className="text-xl font-black text-emerald-600">₹{totalPaidSum.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'routine' && (
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden animate-fade-in border border-gray-100">
                        <div className="p-8 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <h3 className="font-black text-xl text-gray-800 flex items-center gap-2"><CalendarIcon /> Daily Routine</h3>
                        </div>
                        {timeTable.length === 0 ? (
                            <p className="p-20 text-center text-gray-400 font-bold uppercase tracking-widest">Not Uploaded</p>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="bg-white text-gray-400 border-b">
                                    <tr><th className="px-8 py-4 text-left font-black">TIME</th><th className="px-8 py-4 text-left font-black">SUBJECT</th></tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {timeTable.map((slot, idx) => (
                                        <tr key={idx} className="hover:bg-indigo-50/30 transition-colors">
                                            <td className="px-8 py-4 font-black text-indigo-600 uppercase text-xs">{slot.time}</td>
                                            <td className="px-8 py-4 font-bold text-gray-800">{slot.subject}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

const Section = ({ label, icon, children }: any) => (
    <div className="space-y-4">
        <h3 className="text-xs font-black text-indigo-500 uppercase tracking-widest flex items-center gap-2">
            <span className="text-lg">{icon}</span> {label}
        </h3>
        <div className="space-y-3">{children}</div>
    </div>
);

const InfoRow = ({ label, value }: any) => (
    <div className="flex justify-between border-b border-gray-50 pb-2">
        <span className="text-sm text-gray-400 font-bold">{label}</span>
        <span className="text-sm text-gray-900 font-bold">{value || '-'}</span>
    </div>
);

export default StudentDashboard;
