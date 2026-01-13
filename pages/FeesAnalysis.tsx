
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { Student, Class, Expense, Attendance, SalaryRecord } from '../types';
import Spinner from '../components/Spinner';
import StatCard from '../components/StatCard';
import { DonutChart, SimpleBarChart, LineChart } from '../components/ChartComponents';
import StudentsIcon from '../components/icons/StudentsIcon';
import RupeeIcon from '../components/icons/RupeeIcon';
import DuesIcon from '../components/icons/DuesIcon';
import ViewIcon from '../components/icons/ViewIcon';
import StudentProfileModal from '../components/StudentProfileModal';

interface FeesAnalysisProps {
    user: User;
}

interface AnalysisData {
    totalPaid: number;
    totalDues: number;
    todayPaidMoney: number;
    monthlyProjected: number;
    classFeesMap: Map<string, number>;
    allStudents: Student[];
    allClasses: Class[];
    classAttendanceToday: { label: string; value: number }[];
    classDuesVolume: { label: string; value: number }[];
    classPaidToday: { label: string; value: number }[];
    admissionTrend: { label: string; value: number }[];
}

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fullMonthKeys: (keyof Student)[] = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

const parsePaidAmount = (status: string | undefined | null): number => {
    if (!status || status === 'undefined' || status === 'Dues') return 0;
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(status)) return Infinity;
    return status.split(';').reduce((total, p) => {
        const parts = p.split('=d=');
        return total + (parts.length === 2 ? parseFloat(parts[0]) || 0 : 0);
    }, 0);
};

const FeesAnalysis: React.FC<FeesAnalysisProps> = ({ user }) => {
    const [data, setData] = useState<AnalysisData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedDrillClass, setSelectedDrillClass] = useState<string | null>(null);
    const [selectedStudentForModal, setSelectedStudentForModal] = useState<Student | null>(null);

    const processData = useCallback((students: Student[], classes: Class[], attendance: Attendance[]) => {
        const todayStr = new Date().toISOString().split('T')[0];
        const currentMonthIdx = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        let totalPaid = 0;
        let totalDues = 0;
        let todayPaidMoney = 0;
        let monthlyProjected = 0;

        const classFeesMap = new Map(classes.map(c => [c.class_name, c.school_fees || 0]));
        const admissionTrendMap = new Array(12).fill(0);
        const classPaidTodayMap = new Map<string, number>();
        const classDuesVolumeMap = new Map<string, number>();
        const classAttendanceMap = new Map<string, number>();

        students.forEach(s => {
            const sClass = s.class || 'Unassigned';
            const fee = classFeesMap.get(sClass) || 0;
            monthlyProjected += fee;

            if (s.registration_date && new Date(s.registration_date).getFullYear() === currentYear) {
                admissionTrendMap[new Date(s.registration_date).getMonth()]++;
            }

            // Cross-year Dues: Previous Dues + Current Year Billed Dues
            totalDues += (s.previous_dues || 0);
            classDuesVolumeMap.set(sClass, (classDuesVolumeMap.get(sClass) || 0) + (s.previous_dues || 0));

            fullMonthKeys.forEach((monthKey, idx) => {
                const status = s[monthKey] as string | undefined;
                if (idx <= currentMonthIdx) {
                    const paidAmountRaw = parsePaidAmount(status);
                    const paidAmount = paidAmountRaw === Infinity ? fee : paidAmountRaw;
                    
                    totalPaid += paidAmount;
                    if (status?.includes(todayStr)) {
                        todayPaidMoney += paidAmount;
                        classPaidTodayMap.set(sClass, (classPaidTodayMap.get(sClass) || 0) + paidAmount);
                    }

                    if (paidAmount < fee) {
                        const monthDue = fee - paidAmount;
                        totalDues += monthDue;
                        classDuesVolumeMap.set(sClass, (classDuesVolumeMap.get(sClass) || 0) + monthDue);
                    }
                }
            });
        });

        attendance.forEach(record => {
            if (record.date === todayStr) {
                const count = record.present ? record.present.split(',').length : 0;
                const cls = classes.find(c => c.id === record.class_id);
                if (cls) classAttendanceMap.set(cls.class_name, count);
            }
        });

        setData({
            totalPaid, totalDues, todayPaidMoney, monthlyProjected,
            classFeesMap, allStudents: students, allClasses: classes,
            classAttendanceToday: Array.from(classAttendanceMap.entries()).map(([label, value]) => ({ label, value })),
            classDuesVolume: Array.from(classDuesVolumeMap.entries()).map(([label, value]) => ({ label, value })),
            classPaidToday: Array.from(classPaidTodayMap.entries()).map(([label, value]) => ({ label, value })),
            admissionTrend: admissionTrendMap.map((val, i) => ({ label: monthNames[i], value: val }))
        });
    }, []);

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            const [studentsRes, classesRes, attendanceRes] = await Promise.all([
                supabase.from('students').select('*'),
                supabase.from('classes').select('*'),
                supabase.from('attendance').select('*').gte('date', new Date().toISOString().split('T')[0])
            ]);
            if (!studentsRes.error && !classesRes.error) {
                processData(studentsRes.data, classesRes.data, attendanceRes.data || []);
            }
            setLoading(false);
        };
        fetchAll();
    }, [processData]);

    const drillDownStudents = useMemo(() => {
        if (!selectedDrillClass || !data) return [];
        return data.allStudents.filter(s => s.class === selectedDrillClass).map(s => {
            const fee = data.classFeesMap.get(s.class || '') || 0;
            let currentDues = (s.previous_dues || 0);
            fullMonthKeys.forEach((m, idx) => {
                if (idx <= new Date().getMonth()) {
                    const paid = parsePaidAmount(s[m] as string);
                    currentDues += (fee - (paid === Infinity ? fee : paid));
                }
            });
            return { ...s, calculatedTotalDue: currentDues };
        }).sort((a, b) => b.calculatedTotalDue - a.calculatedTotalDue);
    }, [selectedDrillClass, data]);

    if (loading) return <div className="flex items-center justify-center h-screen"><Spinner size="12"/></div>;
    if (!data) return null;

    const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                <RupeeIcon className="text-primary-dark w-10 h-10" /> Advanced Fees Analysis
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Collection" value={formatCurrency(data.totalPaid)} icon={<RupeeIcon />} color="bg-emerald-500" />
                <StatCard title="Total Outstanding" value={formatCurrency(data.totalDues)} icon={<DuesIcon />} color="bg-rose-500" />
                <StatCard title="Today's Cash Flow" value={formatCurrency(data.todayPaidMoney)} icon={<RupeeIcon />} color="bg-indigo-500" />
                <StatCard title="Monthly Projected" value={formatCurrency(data.monthlyProjected)} icon={<StudentsIcon />} color="bg-blue-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
                    <SimpleBarChart title="Today's Collection by Class (₹)" data={data.classPaidToday} color="bg-emerald-400" />
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
                    <SimpleBarChart title="Total Dues Volume by Class (₹)" data={data.classDuesVolume} color="bg-rose-400" />
                    <p className="text-[10px] text-gray-400 mt-2 text-center uppercase tracking-widest font-bold">Interactive: Click Class Below to View Details</p>
                </div>
            </div>

            {/* Class Drill Down Selector */}
            <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <h2 className="text-2xl font-black text-gray-800">Class Drill-Down</h2>
                    <select 
                        className="bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-2 font-bold text-gray-700 outline-none focus:border-primary"
                        value={selectedDrillClass || ''}
                        onChange={(e) => setSelectedDrillClass(e.target.value || null)}
                    >
                        <option value="">Select a Class to View Dues List</option>
                        {data.allClasses.map(c => <option key={c.id} value={c.class_name}>{c.class_name}</option>)}
                    </select>
                </div>

                {selectedDrillClass ? (
                    <div className="overflow-x-auto rounded-xl border border-gray-100">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase">Student</th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase">Guardian Info</th>
                                    <th className="px-6 py-4 text-center text-xs font-black text-gray-500 uppercase">Mobile</th>
                                    <th className="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase bg-rose-50 text-rose-700">Total Pending</th>
                                    <th className="px-6 py-4 text-center text-xs font-black text-gray-500 uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {drillDownStudents.map(s => (
                                    <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <img className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm" src={s.photo_url || `https://ui-avatars.com/api/?name=${s.name}`} alt="" />
                                                <div>
                                                    <p className="font-bold text-gray-900">{s.name}</p>
                                                    <p className="text-xs text-gray-500">Roll: {s.roll_number}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                                            {s.father_name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <a href={`tel:${s.mobile}`} className="text-indigo-600 font-bold hover:underline">{s.mobile || '-'}</a>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right font-black text-rose-600 bg-rose-50/30">
                                            {formatCurrency(s.calculatedTotalDue)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <button onClick={() => setSelectedStudentForModal(s)} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                                                <ViewIcon className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-20 text-gray-400 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <RupeeIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <p className="text-lg font-bold">Choose a class above to generate a real-time debt report.</p>
                    </div>
                )}
            </div>

            {selectedStudentForModal && (
                <StudentProfileModal 
                    student={selectedStudentForModal} 
                    classes={data.allClasses} 
                    onClose={() => setSelectedStudentForModal(null)} 
                />
            )}
        </div>
    );
};

export default FeesAnalysis;
