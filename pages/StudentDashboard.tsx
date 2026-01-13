
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
    student: AggregatedStudentData[]; // Array to support siblings
    onLogout: () => void;
}

const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// Helper to parse paid amount
const parsePaidAmount = (status: string | undefined | null): number => {
    if (!status || status === 'undefined' || status === 'Dues') return 0;
    if (/^\d{4}-\d{2}-\d{2}/.test(status) && !status.includes('=')) return Infinity;
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
    
    const monthlyFee = class_info?.school_fees || 0;
    const classTeacher = class_info?.class_teacher;
    const timeTable = class_info?.time_table || [];

    // --- FEE CALCULATION LOGIC ---
    let totalFeesPaid = 0;
    let totalFeesDue = 0;

    const feeLedger = months.map((monthKey, index) => {
        const status = profile[monthKey as keyof Student] as string | undefined;
        let paid = 0;
        let due = 0;
        let statusText = 'Pending';
        let statusColor = 'bg-gray-100 text-gray-500';

        const parsedPaid = parsePaidAmount(status);
        if (parsedPaid === Infinity) paid = monthlyFee;
        else paid = parsedPaid;

        const currentMonthIndex = new Date().getMonth();
        const isPastOrCurrent = index <= currentMonthIndex;

        if (isPastOrCurrent) {
            if (paid >= monthlyFee) {
                due = 0; statusText = 'Paid'; statusColor = 'bg-green-100 text-green-700';
            } else if (paid > 0) {
                due = monthlyFee - paid; statusText = 'Partial'; statusColor = 'bg-yellow-100 text-yellow-700';
            } else if (status === 'Dues') {
                due = monthlyFee; statusText = 'Due'; statusColor = 'bg-red-100 text-red-700';
            } else {
                due = monthlyFee; statusText = 'Due'; statusColor = 'bg-red-100 text-red-700';
            }
        } else {
            due = monthlyFee; statusText = 'Upcoming';
        }

        totalFeesPaid += paid;
        if(isPastOrCurrent) totalFeesDue += due;

        return { month: monthNames[index], feeAmount: monthlyFee, paidAmount: paid, dueAmount: due, statusText, statusColor };
    });

    if(profile.previous_dues) totalFeesDue += profile.previous_dues;

    // Calculate Other Fees
    const otherFees = profile.other_fees || [];
    otherFees.forEach(f => {
        if(f.paid_date) totalFeesPaid += f.amount;
        else totalFeesDue += f.amount;
    });

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* --- Header Section --- */}
            <header className="bg-white shadow-sm sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-3">
                            {school.school_image_url ? (
                                <img className="h-10 w-10 rounded-full object-contain bg-gray-50 border" src={school.school_image_url} alt="Logo" />
                            ) : (
                                <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                                    {school.school_name.charAt(0)}
                                </div>
                            )}
                            <div>
                                <h1 className="text-lg font-bold text-gray-900 leading-tight hidden sm:block">{school.school_name}</h1>
                                <span className="text-xs text-indigo-600 font-semibold uppercase tracking-wider">Student Portal</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {studentsData.length > 1 && (
                                <div className="relative">
                                    <select 
                                        className="appearance-none bg-indigo-50 border border-indigo-100 text-indigo-700 py-1.5 pl-3 pr-8 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                                        value={selectedStudentIndex}
                                        onChange={(e) => setSelectedStudentIndex(Number(e.target.value))}
                                    >
                                        {studentsData.map((s, idx) => (
                                            <option key={idx} value={idx}>{s.student_profile.name}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-indigo-700">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            )}
                            <button onClick={onLogout} className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors text-sm font-medium">
                                <LogoutIcon className="w-5 h-5" /> <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                
                {/* --- Tab Navigation --- */}
                <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm mb-8 overflow-x-auto">
                    {['profile', 'fees', 'routine', 'results', 'attendance'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 capitalize whitespace-nowrap
                                ${activeTab === tab 
                                    ? 'bg-indigo-600 text-white shadow-md transform scale-105' 
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-indigo-600'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* --- TAB CONTENT --- */}

                {/* 1. PROFILE TAB */}
                {activeTab === 'profile' && (
                    <div className="animate-fade-in-up">
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                            <div className="h-40 bg-gradient-to-r from-indigo-600 to-purple-600 relative">
                                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                            </div>
                            
                            <div className="relative px-6 sm:px-10 pb-10">
                                <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 mb-8 gap-6">
                                    <div className="relative">
                                        <img 
                                            src={profile.photo_url || `https://ui-avatars.com/api/?name=${profile.name}&background=fff&color=4f46e5&size=256&bold=true`} 
                                            alt="Profile" 
                                            className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover bg-white"
                                        />
                                        <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-400 border-2 border-white rounded-full"></div>
                                    </div>
                                    <div className="text-center sm:text-left flex-1">
                                        <h2 className="text-3xl font-bold text-gray-900">{profile.name}</h2>
                                        <p className="text-indigo-600 font-medium text-lg">{profile.class} <span className="text-gray-300 mx-2">|</span> Roll No: {profile.roll_number}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                    <div className="space-y-6">
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b pb-2">Personal Details</h3>
                                        <InfoRow label="Date of Birth" value={profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : 'N/A'} icon="🎂" />
                                        <InfoRow label="Gender" value={profile.gender} icon="⚥" />
                                        <InfoRow label="Blood Group" value={profile.blood_group} icon="🩸" />
                                        <InfoRow label="Caste/Category" value={profile.caste} icon="🏷️" />
                                    </div>
                                    <div className="space-y-6">
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b pb-2">Family & Contact</h3>
                                        <InfoRow label="Father's Name" value={profile.father_name} icon="👨" />
                                        <InfoRow label="Mother's Name" value={profile.mother_name} icon="👩" />
                                        <InfoRow label="Mobile Number" value={profile.mobile} icon="📱" />
                                        <InfoRow label="Address" value={profile.address} icon="📍" />
                                    </div>
                                </div>
                                
                                {/* Class Teacher Section */}
                                {classTeacher && (
                                    <div className="mt-8 bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center gap-4">
                                        <div className="bg-blue-200 p-2 rounded-full text-blue-700">
                                            <UserCircleIcon />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-blue-500 uppercase">Class Teacher</p>
                                            <p className="font-bold text-gray-800">{classTeacher.name}</p>
                                            <p className="text-sm text-gray-600">{classTeacher.mobile}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                
                {/* 2. ROUTINE TAB */}
                {activeTab === 'routine' && (
                    <div className="animate-fade-in-up">
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                                <h3 className="font-bold text-gray-800 flex items-center gap-2"><CalendarIcon /> Daily Class Routine</h3>
                                <span className="text-sm bg-white border px-3 py-1 rounded text-gray-600">Class {profile.class}</span>
                            </div>
                            
                            {timeTable.length === 0 ? (
                                <div className="p-12 text-center text-gray-500">
                                    <p>No routine has been uploaded for your class yet.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm">
                                        <thead className="bg-white text-gray-500 border-b">
                                            <tr>
                                                <th className="px-6 py-3 text-left">Time</th>
                                                <th className="px-6 py-3 text-left">Subject</th>
                                                <th className="px-6 py-3 text-left">Teacher</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {timeTable.map((slot, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 font-mono font-bold text-indigo-600">{slot.time}</td>
                                                    <td className="px-6 py-4 font-semibold text-gray-800">{slot.subject}</td>
                                                    <td className="px-6 py-4 text-gray-600">{slot.teacher || 'N/A'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 3. FEES TAB */}
                {activeTab === 'fees' && (
                    <div className="animate-fade-in-up space-y-8">
                        {/* Fee Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-indigo-500">
                                <p className="text-sm font-semibold text-gray-500 uppercase">Total Payable</p>
                                <p className="text-3xl font-bold text-gray-800 mt-1">₹{(totalFeesPaid + totalFeesDue).toLocaleString()}</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
                                <p className="text-sm font-semibold text-gray-500 uppercase">Total Paid</p>
                                <p className="text-3xl font-bold text-green-600 mt-1">₹{totalFeesPaid.toLocaleString()}</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500">
                                <p className="text-sm font-semibold text-gray-500 uppercase">Total Due</p>
                                <p className="text-3xl font-bold text-red-600 mt-1">₹{totalFeesDue.toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Detailed Ledger */}
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                                <h3 className="font-bold text-gray-800">Fee Ledger</h3>
                                <span className="text-xs font-mono text-gray-500 bg-white px-2 py-1 rounded border">Tuition: ₹{monthlyFee}/mo</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm text-left">
                                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-6 py-3">Description</th>
                                            <th className="px-6 py-3 text-right">Amount</th>
                                            <th className="px-6 py-3 text-right">Paid</th>
                                            <th className="px-6 py-3 text-right">Due</th>
                                            <th className="px-6 py-3 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {profile.previous_dues && profile.previous_dues > 0 && (
                                            <tr className="bg-red-50/30">
                                                <td className="px-6 py-4 font-bold text-red-800">Previous Dues</td>
                                                <td className="px-6 py-4 text-right text-gray-500">-</td>
                                                <td className="px-6 py-4 text-right text-gray-500">-</td>
                                                <td className="px-6 py-4 text-right font-bold text-red-600">₹{profile.previous_dues}</td>
                                                <td className="px-6 py-4 text-center"><span className="px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">Due</span></td>
                                            </tr>
                                        )}
                                        {feeLedger.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-gray-900">{row.month}</td>
                                                <td className="px-6 py-4 text-right text-gray-600">₹{row.feeAmount}</td>
                                                <td className="px-6 py-4 text-right font-medium text-green-600">{row.paidAmount > 0 ? `₹${row.paidAmount}` : '-'}</td>
                                                <td className="px-6 py-4 text-right font-bold text-red-600">{row.dueAmount > 0 ? `₹${row.dueAmount}` : '-'}</td>
                                                <td className="px-6 py-4 text-center"><span className={`px-3 py-1 rounded-full text-xs font-bold ${row.statusColor}`}>{row.statusText}</span></td>
                                            </tr>
                                        ))}
                                        {otherFees.map((fee, i) => (
                                            <tr key={`other-${i}`} className="bg-yellow-50/50">
                                                 <td className="px-6 py-4 font-medium text-gray-800">{fee.fees_name} (Extra)</td>
                                                 <td className="px-6 py-4 text-right text-gray-600">₹{fee.amount}</td>
                                                 <td className="px-6 py-4 text-right font-medium text-green-600">{fee.paid_date ? `₹${fee.amount}` : '-'}</td>
                                                 <td className="px-6 py-4 text-right font-bold text-red-600">{!fee.paid_date ? `₹${fee.amount}` : '-'}</td>
                                                 <td className="px-6 py-4 text-center">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${fee.paid_date ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {fee.paid_date ? 'Paid' : 'Due'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. RESULTS TAB */}
                {activeTab === 'results' && (
                    <div className="animate-fade-in-up">
                        {examResults.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
                                <div className="text-6xl mb-4">📝</div>
                                <h3 className="text-xl font-bold text-gray-800">No Results Declared</h3>
                                <p className="text-gray-500 mt-2">Check back later for your exam updates.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {examResults.map((result, idx) => {
                                    const subjects = result.subjects_marks?.subjects || [];
                                    const totalObtained = subjects.reduce((sum:number, s:any) => sum + Number(s.obtained_marks), 0);
                                    const totalMax = subjects.reduce((sum:number, s:any) => sum + Number(s.total_marks), 0);
                                    const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
                                    const isPass = percentage >= 33;

                                    return (
                                        <div key={idx} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden transform transition-all hover:-translate-y-1 hover:shadow-xl">
                                            <div className={`p-4 flex justify-between items-center ${isPass ? 'bg-indigo-600' : 'bg-red-600'} text-white`}>
                                                <h3 className="font-bold text-lg">{result.exam_name}</h3>
                                                <span className="bg-white/20 px-3 py-1 rounded-lg text-sm font-mono backdrop-blur-sm">
                                                    {percentage.toFixed(1)}%
                                                </span>
                                            </div>
                                            
                                            <div className="p-6">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="border-b border-gray-200 text-gray-500">
                                                            <th className="text-left pb-2 font-semibold">Subject</th>
                                                            <th className="text-right pb-2 font-semibold">Total</th>
                                                            <th className="text-right pb-2 font-semibold">Obtained</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {subjects.map((sub: any, sIdx: number) => (
                                                            <tr key={sIdx}>
                                                                <td className="py-3 text-gray-800 font-medium">{sub.subject_name}</td>
                                                                <td className="py-3 text-right text-gray-500">{sub.total_marks}</td>
                                                                <td className="py-3 text-right font-bold text-gray-900">{sub.obtained_marks}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                    <tfoot>
                                                        <tr className="bg-gray-50">
                                                            <td className="py-3 pl-2 font-bold text-gray-800">GRAND TOTAL</td>
                                                            <td className="py-3 text-right text-gray-500 font-semibold">{totalMax}</td>
                                                            <td className="py-3 text-right font-bold text-indigo-600 pr-2">{totalObtained}</td>
                                                        </tr>
                                                    </tfoot>
                                                </table>

                                                <div className={`mt-4 text-center py-2 rounded-lg font-bold text-sm uppercase tracking-widest ${isPass ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                    Result: {isPass ? 'PASSED' : 'FAILED'}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* 5. ATTENDANCE TAB */}
                {activeTab === 'attendance' && (
                    <div className="animate-fade-in-up space-y-8">
                        {/* Attendance Summary */}
                        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex flex-col md:flex-row items-center justify-around gap-6">
                            <div className="text-center">
                                <div className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-2">Total Working Days</div>
                                <div className="text-4xl font-black text-gray-800">{attendanceData.length}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-2">Present</div>
                                <div className="text-4xl font-black text-green-600">{attendanceData.filter(a => a.status === 'Present').length}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-2">Absent</div>
                                <div className="text-4xl font-black text-red-500">{attendanceData.filter(a => a.status === 'Absent').length}</div>
                            </div>
                             <div className="text-center">
                                <div className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-2">Percentage</div>
                                <div className="text-4xl font-black text-indigo-600">
                                    {attendanceData.length > 0 
                                        ? Math.round((attendanceData.filter(a => a.status === 'Present').length / attendanceData.length) * 100) 
                                        : 0}%
                                </div>
                            </div>
                        </div>

                        {/* Visual Calendar */}
                        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                            <h3 className="font-bold text-gray-800 text-lg mb-6 border-b pb-2">Attendance Calendar</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {monthNames.map((month, mIdx) => {
                                    const currentYear = new Date().getFullYear();
                                    const daysInMonth = new Date(currentYear, mIdx + 1, 0).getDate();
                                    const days = Array.from({length: daysInMonth}, (_, i) => i + 1);
                                    
                                    // Get records for this month
                                    const monthRecords = attendanceData.filter(rec => {
                                        const d = new Date(rec.date);
                                        return d.getMonth() === mIdx && d.getFullYear() === currentYear;
                                    });

                                    // Only show months that have passed or are current
                                    if (mIdx > new Date().getMonth()) return null;

                                    return (
                                        <div key={month} className="border border-gray-100 rounded-lg p-4">
                                            <h4 className="font-bold text-center text-gray-700 mb-3">{month}</h4>
                                            <div className="grid grid-cols-7 gap-1 text-center text-[10px]">
                                                {days.map(day => {
                                                    const dateStr = `${currentYear}-${String(mIdx+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                                                    const record = monthRecords.find(r => r.date === dateStr);
                                                    
                                                    let bgClass = 'bg-gray-50 text-gray-300'; // Default / No Data
                                                    if (record) {
                                                        if(record.status === 'Present') bgClass = 'bg-green-500 text-white font-bold';
                                                        else if(record.status === 'Absent') bgClass = 'bg-red-500 text-white font-bold';
                                                        else if(record.status === 'Holiday') bgClass = 'bg-yellow-400 text-white';
                                                    }

                                                    return (
                                                        <div key={day} className={`w-6 h-6 flex items-center justify-center rounded-full mx-auto ${bgClass}`}>
                                                            {day}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
};

// --- Sub Components ---
const InfoRow: React.FC<{ label: string; value?: string; icon: string }> = ({ label, value, icon }) => (
    <div className="flex items-start gap-3">
        <span className="text-xl">{icon}</span>
        <div>
            <p className="text-xs font-semibold text-gray-400 uppercase">{label}</p>
            <p className="text-gray-800 font-medium">{value || 'N/A'}</p>
        </div>
    </div>
);

export default StudentDashboard;
