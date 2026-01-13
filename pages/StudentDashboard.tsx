
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Student } from '../types';
import Spinner from '../components/Spinner';
import LogoutIcon from '../components/icons/LogoutIcon';
import UserCircleIcon from '../components/icons/UserCircleIcon';

interface StudentDashboardProps {
    student: Student;
    onLogout: () => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ student, onLogout }) => {
    const [activeTab, setActiveTab] = useState<'profile' | 'fees' | 'attendance' | 'results'>('profile');
    const [classTeacher, setClassTeacher] = useState<{ name: string, mobile: string } | null>(null);
    const [attendanceData, setAttendanceData] = useState<any[]>([]);
    const [examResults, setExamResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Fee calculations
    const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    
    useEffect(() => {
        const fetchStudentData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Class Teacher
                if (student.class) {
                    const { data: classData } = await supabase
                        .from('classes')
                        .select('staff(name, mobile)')
                        .eq('class_name', student.class)
                        .eq('uid', student.uid) // Ensure we check within the same school/owner scope
                        .single();
                    
                    if (classData && classData.staff) {
                         // @ts-ignore
                        setClassTeacher(classData.staff);
                    }
                }

                // 2. Fetch Attendance (Only for this student's class and where roll no is present)
                if (student.class && student.roll_number) {
                    // First get class ID
                    const { data: cls } = await supabase.from('classes').select('id').eq('class_name', student.class).eq('uid', student.uid).single();
                    if (cls) {
                         const currentYear = new Date().getFullYear();
                         const { data: att } = await supabase
                            .from('attendance')
                            .select('date, present, absent')
                            .eq('class_id', cls.id)
                            .gte('date', `${currentYear}-01-01`);
                        
                        if (att) {
                            const myAtt = att.map(rec => {
                                let status = 'Holiday';
                                if (rec.present?.split(',').includes(student.roll_number!)) status = 'Present';
                                else if (rec.absent?.split(',').includes(student.roll_number!)) status = 'Absent';
                                return { date: rec.date, status };
                            });
                            setAttendanceData(myAtt);
                        }
                    }
                }

                // 3. Fetch Exam Results
                if (student.roll_number) {
                    const { data: results } = await supabase
                        .from('exam_results')
                        .select('*')
                        .eq('roll_number', student.roll_number)
                        .eq('class', student.class)
                        .eq('uid', student.uid);
                    
                    if (results) setExamResults(results);
                }

            } catch (err) {
                console.error("Error fetching student details", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStudentData();
    }, [student]);

    const parseFeeStatus = (status: string | undefined) => {
        if (!status || status === 'undefined') return { label: 'Pending', color: 'bg-gray-100 text-gray-600' };
        if (status === 'Dues') return { label: 'Unpaid', color: 'bg-red-100 text-red-600' };
        // Check if it's a date or payment string
        if (status.includes('=d=') || /^\d{4}-\d{2}-\d{2}/.test(status)) {
            // Check for partial
             if(status.includes('=d=')) {
                 // Simple heuristic: if it has payment data, mark paid for summary
                 return { label: 'Paid/Partial', color: 'bg-green-100 text-green-600' };
             }
             return { label: 'Paid', color: 'bg-green-100 text-green-600' };
        }
        return { label: 'Pending', color: 'bg-gray-100 text-gray-600' };
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Header */}
            <div className="bg-green-600 text-white p-6 shadow-lg">
                <div className="max-w-5xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">Student Portal</h1>
                        <p className="opacity-90">Welcome, {student.name}</p>
                    </div>
                    <button onClick={onLogout} className="flex items-center gap-2 bg-green-700 hover:bg-green-800 px-4 py-2 rounded-lg transition-colors">
                        <LogoutIcon /> Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto p-4 -mt-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Sidebar / Profile Card */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-md p-6 text-center">
                            <img 
                                src={student.photo_url || `https://ui-avatars.com/api/?name=${student.name}&background=16a34a&color=fff`} 
                                alt="Profile" 
                                className="w-32 h-32 rounded-full mx-auto border-4 border-green-100 object-cover shadow-sm"
                            />
                            <h2 className="text-xl font-bold text-gray-800 mt-4">{student.name}</h2>
                            <p className="text-green-600 font-medium">{student.class} | Roll: {student.roll_number}</p>
                            
                            <div className="mt-6 border-t pt-4 text-left text-sm space-y-2">
                                <p className="flex justify-between"><span className="text-gray-500">Father:</span> <span className="font-medium">{student.father_name}</span></p>
                                <p className="flex justify-between"><span className="text-gray-500">Mobile:</span> <span className="font-medium">{student.mobile}</span></p>
                                <p className="flex justify-between"><span className="text-gray-500">DOB:</span> <span className="font-medium">{student.date_of_birth}</span></p>
                            </div>
                        </div>

                        {/* Class Teacher Card */}
                        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <UserCircleIcon /> Class Teacher
                            </h3>
                            {classTeacher ? (
                                <div>
                                    <p className="text-lg font-medium text-blue-900">{classTeacher.name}</p>
                                    <p className="text-gray-500 text-sm mt-1">{classTeacher.mobile}</p>
                                    <a href={`tel:${classTeacher.mobile}`} className="mt-3 block text-center w-full bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm font-bold">
                                        Call Teacher
                                    </a>
                                </div>
                            ) : (
                                <p className="text-gray-400 italic">No class teacher assigned.</p>
                            )}
                        </div>
                    </div>

                    {/* Main Tabs Area */}
                    <div className="md:col-span-2">
                        <div className="bg-white rounded-xl shadow-md overflow-hidden min-h-[500px]">
                            {/* Tabs Navigation */}
                            <div className="flex border-b">
                                <button 
                                    onClick={() => setActiveTab('profile')}
                                    className={`flex-1 py-4 font-medium text-sm transition-colors ${activeTab === 'profile' ? 'bg-green-50 text-green-700 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Overview
                                </button>
                                <button 
                                    onClick={() => setActiveTab('fees')}
                                    className={`flex-1 py-4 font-medium text-sm transition-colors ${activeTab === 'fees' ? 'bg-green-50 text-green-700 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Fees
                                </button>
                                <button 
                                    onClick={() => setActiveTab('attendance')}
                                    className={`flex-1 py-4 font-medium text-sm transition-colors ${activeTab === 'attendance' ? 'bg-green-50 text-green-700 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Attendance
                                </button>
                                <button 
                                    onClick={() => setActiveTab('results')}
                                    className={`flex-1 py-4 font-medium text-sm transition-colors ${activeTab === 'results' ? 'bg-green-50 text-green-700 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Results
                                </button>
                            </div>

                            {/* Tab Content */}
                            <div className="p-6">
                                {loading && <div className="flex justify-center py-10"><Spinner /></div>}
                                
                                {!loading && activeTab === 'profile' && (
                                    <div className="space-y-6">
                                        <div className="bg-indigo-50 p-4 rounded-lg">
                                            <h3 className="font-bold text-indigo-900 mb-2">Notice Board</h3>
                                            <p className="text-indigo-700 text-sm">Welcome to your new digital dashboard! Check your latest exam results and fee status here.</p>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 border rounded-lg text-center">
                                                <div className="text-3xl font-bold text-gray-800">{attendanceData.filter(a => a.status === 'Present').length}</div>
                                                <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Days Present</div>
                                            </div>
                                            <div className="p-4 border rounded-lg text-center">
                                                <div className="text-3xl font-bold text-gray-800">{examResults.length}</div>
                                                <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Exams Taken</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {!loading && activeTab === 'fees' && (
                                    <div className="space-y-4">
                                        {student.previous_dues && student.previous_dues > 0 && (
                                            <div className="bg-red-50 p-4 rounded-lg flex justify-between items-center border border-red-100">
                                                <span className="font-bold text-red-700">Previous Dues</span>
                                                <span className="font-bold text-red-700">₹{student.previous_dues}</span>
                                            </div>
                                        )}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {months.map(month => {
                                                const status = parseFeeStatus(student[month as keyof Student] as string);
                                                return (
                                                    <div key={month} className="flex justify-between items-center p-3 border rounded-lg">
                                                        <span className="capitalize font-medium text-gray-700">{month}</span>
                                                        <span className={`px-2 py-1 rounded text-xs font-bold ${status.color}`}>{status.label}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {!loading && activeTab === 'attendance' && (
                                    <div>
                                        <h3 className="font-bold text-gray-800 mb-4">Recent Attendance</h3>
                                        <div className="space-y-2 max-h-96 overflow-y-auto">
                                            {attendanceData.length === 0 ? <p className="text-gray-500 italic">No attendance records found.</p> :
                                            attendanceData.slice().reverse().map((rec, i) => (
                                                <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                                    <span className="text-gray-700 font-medium">{new Date(rec.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${rec.status === 'Present' ? 'bg-green-200 text-green-800' : rec.status === 'Absent' ? 'bg-red-200 text-red-800' : 'bg-gray-200 text-gray-800'}`}>
                                                        {rec.status}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {!loading && activeTab === 'results' && (
                                    <div className="space-y-6">
                                        {examResults.length === 0 ? <p className="text-gray-500 italic text-center py-10">No exam results uploaded yet.</p> : 
                                        examResults.map((result, idx) => {
                                            const subjects = result.subjects_marks?.subjects || [];
                                            const totalObtained = subjects.reduce((sum: number, s: any) => sum + Number(s.obtained_marks), 0);
                                            const totalMax = subjects.reduce((sum: number, s: any) => sum + Number(s.total_marks), 0);
                                            const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
                                            
                                            return (
                                                <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden">
                                                    <div className="bg-gray-100 p-4 flex justify-between items-center">
                                                        <h3 className="font-bold text-gray-800">{result.exam_name}</h3>
                                                        <span className="bg-white px-2 py-1 rounded text-sm font-bold shadow-sm">{percentage.toFixed(1)}%</span>
                                                    </div>
                                                    <div className="p-4">
                                                        <table className="w-full text-sm">
                                                            <thead>
                                                                <tr className="text-gray-500 border-b">
                                                                    <th className="text-left pb-2">Subject</th>
                                                                    <th className="text-right pb-2">Marks</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y">
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
                                                                <tr className="font-bold bg-gray-50">
                                                                    <td className="py-2 pl-2">Total</td>
                                                                    <td className="py-2 text-right pr-2">{totalObtained} / {totalMax}</td>
                                                                </tr>
                                                            </tfoot>
                                                        </table>
                                                    </div>
                                                </div>
                                            );
                                        })}
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
