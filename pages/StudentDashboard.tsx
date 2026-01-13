
import React, { useState, useEffect } from 'react';
import { Student } from '../types';
import LogoutIcon from '../components/icons/LogoutIcon';
import UserCircleIcon from '../components/icons/UserCircleIcon';

interface AggregatedStudentData {
    student_profile: Student;
    school_info: {
        school_name: string;
        address: string;
        principal_name?: string;
        school_image_url?: string;
        mobile?: string;
    };
    exam_results: any[];
    attendance_records: { date: string; status: 'Present' | 'Absent' | 'Holiday' }[];
}

interface StudentDashboardProps {
    student: AggregatedStudentData[]; // Array to support siblings
    onLogout: () => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ student: studentsData, onLogout }) => {
    // State to handle which sibling is currently selected
    const [selectedStudentIndex, setSelectedStudentIndex] = useState(0);
    const [activeTab, setActiveTab] = useState<'profile' | 'fees' | 'attendance' | 'results'>('profile');

    // Access current student data securely from the prop
    const currentData = studentsData[selectedStudentIndex];
    const { student_profile: profile, school_info: school, exam_results: examResults, attendance_records: attendanceData } = currentData;

    const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

    const parseFeeStatus = (status: string | undefined) => {
        if (!status || status === 'undefined') return { label: 'Pending', color: 'bg-gray-100 text-gray-600' };
        if (status === 'Dues') return { label: 'Unpaid', color: 'bg-red-100 text-red-600' };
        if (status.includes('=d=') || /^\d{4}-\d{2}-\d{2}/.test(status)) {
             return { label: 'Paid', color: 'bg-green-100 text-green-600' };
        }
        return { label: 'Pending', color: 'bg-gray-100 text-gray-600' };
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Header */}
            <div className="bg-green-600 text-white p-4 shadow-lg sticky top-0 z-20">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        {school.school_image_url && (
                            <img src={school.school_image_url} alt="Logo" className="w-12 h-12 bg-white rounded-full p-1 object-contain" />
                        )}
                        <div>
                            <h1 className="text-xl font-bold leading-tight">{school.school_name}</h1>
                            <p className="text-sm opacity-90 text-green-100">Student Portal</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Sibling Selector */}
                        {studentsData.length > 1 && (
                            <select 
                                className="bg-green-700 text-white text-sm border border-green-500 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-green-400"
                                value={selectedStudentIndex}
                                onChange={(e) => setSelectedStudentIndex(Number(e.target.value))}
                            >
                                {studentsData.map((s, idx) => (
                                    <option key={idx} value={idx}>{s.student_profile.name} ({s.student_profile.class})</option>
                                ))}
                            </select>
                        )}
                        <button onClick={onLogout} className="flex items-center gap-2 bg-green-800 hover:bg-green-900 px-4 py-2 rounded-lg transition-colors text-sm font-medium">
                            <LogoutIcon className="w-4 h-4" /> Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto p-4 mt-6 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Sidebar / Profile Card */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-md p-6 text-center border border-gray-100 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-20 bg-green-50 z-0"></div>
                            <div className="relative z-10">
                                <img 
                                    src={profile.photo_url || `https://ui-avatars.com/api/?name=${profile.name}&background=16a34a&color=fff`} 
                                    alt="Profile" 
                                    className="w-28 h-28 rounded-full mx-auto border-4 border-white shadow-md object-cover"
                                />
                                <h2 className="text-xl font-bold text-gray-800 mt-4">{profile.name}</h2>
                                <p className="text-green-600 font-medium bg-green-50 inline-block px-3 py-1 rounded-full text-sm mt-1 border border-green-100">
                                    {profile.class} | Roll: {profile.roll_number}
                                </p>
                                
                                <div className="mt-6 pt-4 text-left text-sm space-y-3 border-t border-gray-100">
                                    <p className="flex justify-between"><span className="text-gray-500">Father:</span> <span className="font-medium text-gray-900">{profile.father_name}</span></p>
                                    <p className="flex justify-between"><span className="text-gray-500">Mobile:</span> <span className="font-medium text-gray-900">{profile.mobile}</span></p>
                                    <p className="flex justify-between"><span className="text-gray-500">DOB:</span> <span className="font-medium text-gray-900">{profile.date_of_birth}</span></p>
                                </div>
                            </div>
                        </div>

                        {/* School Contact Card */}
                        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <UserCircleIcon /> School Info
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">{school.address}</p>
                            {school.mobile && (
                                <a href={`tel:${school.mobile}`} className="mt-2 block text-center w-full bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm font-bold">
                                    Call Office: {school.mobile}
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Main Tabs Area */}
                    <div className="md:col-span-2">
                        <div className="bg-white rounded-xl shadow-md overflow-hidden min-h-[500px]">
                            {/* Tabs Navigation */}
                            <div className="flex border-b overflow-x-auto">
                                {['profile', 'fees', 'attendance', 'results'].map((tab) => (
                                    <button 
                                        key={tab}
                                        onClick={() => setActiveTab(tab as any)}
                                        className={`flex-1 py-4 px-2 font-medium text-sm transition-colors capitalize whitespace-nowrap
                                            ${activeTab === tab ? 'bg-green-50 text-green-700 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            {/* Tab Content */}
                            <div className="p-6">
                                
                                {activeTab === 'profile' && (
                                    <div className="space-y-6 animate-fade-in">
                                        <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100">
                                            <h3 className="font-bold text-indigo-900 mb-2 text-lg">Dashboard Overview</h3>
                                            <p className="text-indigo-700 text-sm leading-relaxed">
                                                Welcome back! You have attended <strong>{attendanceData.filter(a => a.status === 'Present').length} days</strong> this session and completed <strong>{examResults.length} exams</strong>.
                                            </p>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-gray-50 rounded-lg text-center border border-gray-200">
                                                <div className="text-3xl font-bold text-green-600">{attendanceData.filter(a => a.status === 'Present').length}</div>
                                                <div className="text-xs text-gray-500 uppercase tracking-wider mt-1 font-semibold">Days Present</div>
                                            </div>
                                            <div className="p-4 bg-gray-50 rounded-lg text-center border border-gray-200">
                                                <div className="text-3xl font-bold text-blue-600">{examResults.length}</div>
                                                <div className="text-xs text-gray-500 uppercase tracking-wider mt-1 font-semibold">Exams Taken</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'fees' && (
                                    <div className="space-y-4 animate-fade-in">
                                        {profile.previous_dues && profile.previous_dues > 0 && (
                                            <div className="bg-red-50 p-4 rounded-lg flex justify-between items-center border border-red-100">
                                                <span className="font-bold text-red-700">Previous Dues Arrears</span>
                                                <span className="font-bold text-red-700">₹{profile.previous_dues}</span>
                                            </div>
                                        )}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {months.map(month => {
                                                const status = parseFeeStatus(profile[month as keyof Student] as string);
                                                return (
                                                    <div key={month} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow bg-gray-50/50">
                                                        <span className="capitalize font-medium text-gray-700">{month}</span>
                                                        <span className={`px-2 py-1 rounded text-xs font-bold ${status.color}`}>{status.label}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'attendance' && (
                                    <div className="animate-fade-in">
                                        <h3 className="font-bold text-gray-800 mb-4">Attendance Log</h3>
                                        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                                            {attendanceData.length === 0 ? (
                                                <p className="text-gray-500 italic text-center py-8">No attendance records found for this year.</p>
                                            ) : (
                                                attendanceData.slice().reverse().map((rec, i) => (
                                                    <div key={i} className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                                                        <span className="text-gray-700 font-medium">{new Date(rec.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${rec.status === 'Present' ? 'bg-green-100 text-green-800' : rec.status === 'Absent' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                            {rec.status}
                                                        </span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'results' && (
                                    <div className="space-y-6 animate-fade-in">
                                        {examResults.length === 0 ? (
                                            <div className="text-center py-12">
                                                <div className="text-gray-300 mb-3">
                                                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                                </div>
                                                <p className="text-gray-500">No exam results declared yet.</p>
                                            </div>
                                        ) : (
                                            examResults.map((result, idx) => {
                                                const subjects = result.subjects_marks?.subjects || [];
                                                const totalObtained = subjects.reduce((sum: number, s: any) => sum + Number(s.obtained_marks), 0);
                                                const totalMax = subjects.reduce((sum: number, s: any) => sum + Number(s.total_marks), 0);
                                                const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
                                                
                                                return (
                                                    <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                                        <div className="bg-gray-50 p-4 flex justify-between items-center border-b border-gray-200">
                                                            <h3 className="font-bold text-gray-800">{result.exam_name}</h3>
                                                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${percentage >= 33 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                                {percentage.toFixed(1)}%
                                                            </span>
                                                        </div>
                                                        <div className="p-4">
                                                            <table className="w-full text-sm">
                                                                <thead>
                                                                    <tr className="text-gray-500 border-b border-gray-100">
                                                                        <th className="text-left pb-2 font-medium">Subject</th>
                                                                        <th className="text-right pb-2 font-medium">Marks</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-gray-50">
                                                                    {subjects.map((sub: any, sIdx: number) => (
                                                                        <tr key={sIdx}>
                                                                            <td className="py-2 text-gray-700">{sub.subject_name}</td>
                                                                            <td className="py-2 text-right font-medium">
                                                                                {sub.obtained_marks} <span className="text-gray-400 text-xs">/ {sub.total_marks}</span>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                                <tfoot>
                                                                    <tr className="bg-gray-50">
                                                                        <td className="py-2 pl-2 font-bold text-gray-800">Total</td>
                                                                        <td className="py-2 text-right pr-2 font-bold text-gray-800">{totalObtained} / {totalMax}</td>
                                                                    </tr>
                                                                </tfoot>
                                                            </table>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
