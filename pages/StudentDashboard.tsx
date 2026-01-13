
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
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
    if (isoDateRegex.test(status)) return Infinity; 
    return status.split(';').reduce((total, p) => {
        const parts = p.split('=d=');
        return total + (parts.length === 2 ? parseFloat(parts[0]) || 0 : 0);
    }, 0);
};

const StudentDashboard: React.FC<StudentDashboardProps> = ({ student: studentsData, onLogout }) => {
    const [selectedStudentIndex, setSelectedStudentIndex] = useState(0);
    const [activeTab, setActiveTab] = useState<'profile' | 'fees' | 'attendance' | 'results' | 'routine'>('profile');
    const [historyView, setHistoryView] = useState<'current' | 'all'>('current');

    const currentData = studentsData[selectedStudentIndex];
    const { student_profile: profile, school_info: school, exam_results: examResults, attendance_records: attendanceData, class_info } = currentData;
    
    const monthlyFee = class_info?.school_fees || 0;
    const timeTable = currentData.class_info?.time_table || [];

    const feeLedger = useMemo(() => {
        let currentYearDues = (profile.previous_dues || 0);
        let currentYearPaid = 0;
        const currentMonthIdx = new Date().getMonth();

        const ledger = monthKeys.map((key, idx) => {
            const status = profile[key as keyof Student] as string;
            const paid = parsePaidAmount(status);
            const actualPaid = paid === Infinity ? monthlyFee : paid;
            
            currentYearPaid += actualPaid;
            
            const isPast = idx <= currentMonthIdx;
            let statusText = 'Upcoming';
            let color = 'bg-gray-100 text-gray-400';
            
            if (actualPaid >= monthlyFee && monthlyFee > 0) {
                statusText = 'Paid';
                color = 'bg-emerald-100 text-emerald-700';
            } else if (actualPaid > 0) {
                statusText = `Bal: ₹${monthlyFee - actualPaid}`;
                color = 'bg-amber-100 text-amber-700';
                if (isPast) currentYearDues += (monthlyFee - actualPaid);
            } else if (isPast || status === 'Dues') {
                statusText = 'Due';
                color = 'bg-rose-100 text-rose-700';
                if (isPast) currentYearDues += monthlyFee;
            }

            return { month: monthNames[idx], statusText, color, paid: actualPaid };
        });

        return { ledger, totalPaid: currentYearPaid, totalDues: currentYearDues };
    }, [profile, monthlyFee]);

    return (
        <div className="min-h-screen bg-gray-50 pb-12 font-sans">
            <header className="bg-white shadow-md sticky top-0 z-30 px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-md">
                        {school.school_name.charAt(0)}
                    </div>
                    <h1 className="text-lg font-black text-gray-900 hidden sm:block truncate max-w-[250px]">{school.school_name}</h1>
                </div>
                <div className="flex items-center gap-4">
                    {studentsData.length > 1 && (
                        <select className="bg-indigo-50 border-none text-indigo-700 py-1.5 px-4 rounded-full text-xs font-black outline-none focus:ring-2 focus:ring-indigo-500" value={selectedStudentIndex} onChange={(e) => setSelectedStudentIndex(Number(e.target.value))}>
                            {studentsData.map((s, idx) => <option key={idx} value={idx}>{s.student_profile.name}</option>)}
                        </select>
                    )}
                    <button onClick={onLogout} className="flex items-center gap-2 text-gray-400 hover:text-rose-500 font-bold text-sm transition-colors">
                        <LogoutIcon /> <span className="hidden sm:inline">Logout</span>
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex bg-white p-1 rounded-2xl shadow-sm mb-8 overflow-x-auto gap-1 no-scrollbar border border-gray-100">
                    {['profile', 'fees', 'routine', 'results', 'attendance'].map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab as any)} className={`flex-1 py-3 px-6 rounded-xl text-sm font-black transition-all capitalize whitespace-nowrap ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50 hover:text-indigo-600'}`}>{tab}</button>
                    ))}
                </div>

                {activeTab === 'profile' && (
                    <div className="animate-fade-in space-y-6">
                        <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100">
                            <div className="h-32 bg-gradient-to-r from-indigo-600 to-blue-700"></div>
                            <div className="px-10 pb-10">
                                <div className="flex flex-col sm:flex-row items-center gap-8 -mt-16 mb-10 text-center sm:text-left">
                                    <img src={profile.photo_url || `https://ui-avatars.com/api/?name=${profile.name}&background=fff&color=4f46e5&size=256&bold=true`} className="w-40 h-40 rounded-[2.5rem] border-8 border-white shadow-2xl object-cover bg-white" alt=""/>
                                    <div className="flex-1">
                                        <h2 className="text-4xl font-black text-gray-900 tracking-tight">{profile.name}</h2>
                                        <p className="text-indigo-600 font-black tracking-tight text-xl">Class {profile.class} | Roll {profile.roll_number}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div className="space-y-6">
                                        <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest border-b border-gray-100 pb-3 flex items-center gap-2">
                                            {/* FIX: Added className support previously to AcademicCapIcon, ensuring it works here */}
                                            <AcademicCapIcon className="w-4 h-4" /> Academic Info
                                        </h3>
                                        <DataRow label="Admission Date" value={new Date(profile.registration_date).toLocaleDateString()} />
                                        <DataRow label="Aadhar Card" value={profile.aadhar} />
                                        <DataRow label="Gender" value={profile.gender} />
                                        <DataRow label="Address" value={profile.address} />
                                    </div>
                                    <div className="space-y-6">
                                        <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest border-b border-gray-100 pb-3 flex items-center gap-2">
                                            {/* FIX: Removed className from UserCircleIcon as its current definition doesn't support it or caused type mismatch */}
                                            <UserCircleIcon /> Parents Info
                                        </h3>
                                        <DataRow label="Father's Name" value={profile.father_name} />
                                        <DataRow label="Mother's Name" value={profile.mother_name} />
                                        <DataRow label="Contact Mobile" value={profile.mobile} />
                                        <DataRow label="Caste" value={profile.caste} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'fees' && (
                    <div className="animate-fade-in space-y-8">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="bg-emerald-50 p-8 rounded-[2rem] border-2 border-emerald-100 text-center shadow-sm">
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Lifetime Paid</p>
                                <p className="text-4xl font-black text-emerald-900 mt-1">₹{feeLedger.totalPaid.toLocaleString()}</p>
                            </div>
                            <div className="bg-rose-50 p-8 rounded-[2rem] border-2 border-rose-100 text-center shadow-sm">
                                <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Current Dues</p>
                                <p className="text-4xl font-black text-rose-900 mt-1">₹{feeLedger.totalDues.toLocaleString()}</p>
                            </div>
                             <div className="bg-indigo-50 p-8 rounded-[2rem] border-2 border-indigo-100 text-center shadow-sm">
                                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Opening Balance</p>
                                <p className="text-4xl font-black text-indigo-900 mt-1">₹{(profile.previous_dues || 0).toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100">
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-2xl font-black text-gray-800">Fee Ledger Analysis</h3>
                                <div className="flex bg-gray-100 p-1 rounded-2xl">
                                    <button onClick={() => setHistoryView('current')} className={`px-6 py-2 text-xs font-black rounded-xl transition-all ${historyView === 'current' ? 'bg-white text-indigo-600 shadow-md' : 'text-gray-400'}`}>Session</button>
                                    <button onClick={() => setHistoryView('all')} className={`px-6 py-2 text-xs font-black rounded-xl transition-all ${historyView === 'all' ? 'bg-white text-indigo-600 shadow-md' : 'text-gray-400'}`}>Life History</button>
                                </div>
                            </div>

                            {historyView === 'current' ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {feeLedger.ledger.map((m, idx) => (
                                        <div key={idx} className="bg-gray-50 rounded-3xl p-6 border border-gray-100 hover:shadow-lg transition-all">
                                            <p className="font-black text-gray-800 text-lg">{m.month}</p>
                                            <div className={`mt-3 inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${m.color}`}>
                                                {m.statusText}
                                            </div>
                                            <p className="mt-4 text-xs text-gray-400 font-bold tracking-wider">Paid: ₹{m.paid.toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-16 text-center bg-gray-50 rounded-[2rem] border-4 border-dashed border-gray-100">
                                    <RupeeIcon className="w-20 h-20 mx-auto mb-6 opacity-20 text-indigo-500" />
                                    <h3 className="text-xl font-bold text-gray-500">Cross-Session Analysis</h3>
                                    <p className="text-gray-400 mt-2 max-w-md mx-auto">Previous years arrears and consolidated payment history are combined in your opening balance summary above.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'routine' && (
                    <div className="animate-fade-in bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100">
                        <div className="p-10 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                            {/* FIX: Added className support previously to CalendarIcon, ensuring it works here */}
                            <h3 className="font-black text-2xl text-gray-800 flex items-center gap-3"><CalendarIcon className="w-8 h-8 text-indigo-600" /> Academic Routine</h3>
                        </div>
                        {timeTable.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {timeTable.map((slot, idx) => (
                                    <div key={idx} className="p-8 flex items-center gap-10 hover:bg-indigo-50 transition-colors">
                                        <div className="w-40 font-black text-indigo-600 text-sm bg-indigo-50 py-3 px-5 rounded-2xl text-center shadow-sm">{slot.time}</div>
                                        <div className="flex-1">
                                            <p className="font-black text-gray-800 text-xl">{slot.subject}</p>
                                            <p className="text-xs text-gray-400 font-black uppercase tracking-widest mt-1">{slot.teacher || 'Assigning soon...'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-24 text-center text-gray-300 font-black uppercase tracking-widest text-lg">Time Table Not Uploaded</div>
                        )}
                    </div>
                )}

                {activeTab === 'attendance' && (
                    <div className="animate-fade-in space-y-8">
                        <div className="bg-white rounded-[2rem] shadow-xl p-10 border border-gray-100">
                            <h3 className="text-2xl font-black text-gray-800 mb-10">Engagement Statistics</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                                {monthNames.map((m, idx) => {
                                    if (idx > new Date().getMonth()) return null;
                                    const count = attendanceData.filter(a => new Date(a.date).getMonth() === idx).length;
                                    const present = attendanceData.filter(a => new Date(a.date).getMonth() === idx && a.status === 'Present').length;
                                    const percentage = count > 0 ? Math.round((present / count) * 100) : 0;
                                    return (
                                        <div key={m} className="bg-gray-50 p-8 rounded-[2rem] text-center relative overflow-hidden group shadow-sm">
                                            <div className="absolute bottom-0 left-0 h-1.5 bg-indigo-500 transition-all duration-700" style={{ width: `${percentage}%` }}></div>
                                            <p className="text-xs font-black text-gray-400 uppercase mb-3">{m}</p>
                                            <p className="text-4xl font-black text-gray-800">{percentage}%</p>
                                            <p className="text-[10px] text-gray-400 font-black mt-3 uppercase">{present} / {count} Days</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'results' && (
                    <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-10">
                        {examResults.length > 0 ? examResults.map((exam, idx) => {
                            const subjects = exam.subjects_marks?.subjects || [];
                            const obt = subjects.reduce((a:number, s:any) => a + Number(s.obtained_marks), 0);
                            const tot = subjects.reduce((a:number, s:any) => a + Number(s.total_marks), 0);
                            const perc = tot > 0 ? (obt / tot) * 100 : 0;

                            return (
                                <div key={idx} className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-gray-100 flex flex-col">
                                    <div className="p-8 bg-indigo-600 text-white flex justify-between items-center">
                                        <h3 className="font-black text-2xl uppercase">{exam.exam_name}</h3>
                                        <span className="text-4xl font-black">{Math.round(perc)}%</span>
                                    </div>
                                    <div className="p-8 flex-1 space-y-4">
                                        {subjects.map((s:any, si:number) => (
                                            <div key={si} className="flex justify-between items-center border-b border-gray-50 pb-3 last:border-0">
                                                <span className="font-bold text-gray-500 text-sm uppercase">{s.subject_name}</span>
                                                <span className="font-black text-gray-900">{s.obtained_marks} <span className="text-gray-300 text-[10px] font-medium">/ {s.total_marks}</span></span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className={`p-5 text-center font-black text-xs uppercase tracking-widest ${perc >= 33 ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
                                        Session Outcome: {perc >= 33 ? 'Qualified' : 'Requires Effort'}
                                    </div>
                                </div>
                            )
                        }) : (
                            <div className="md:col-span-2 py-32 text-center bg-white rounded-[2.5rem] shadow-xl font-black text-gray-200 uppercase tracking-widest text-3xl">No Academic Data Found</div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

const DataRow = ({ label, value }: { label: string; value?: string | null }) => (
    <div className="flex justify-between items-baseline border-b border-gray-50 pb-3">
        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{label}</span>
        <span className="text-sm font-black text-gray-800 text-right ml-6 break-words max-w-[220px]">{value || '-'}</span>
    </div>
);

export default StudentDashboard;