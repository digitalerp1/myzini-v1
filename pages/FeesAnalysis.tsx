
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { Student, Class, Attendance } from '../types';
import Spinner from '../components/Spinner';
import StatCard from '../components/StatCard';
import { SimpleBarChart, DonutChart } from '../components/ChartComponents';
import StudentsIcon from '../components/icons/StudentsIcon';
import RupeeIcon from '../components/icons/RupeeIcon';
import DuesIcon from '../components/icons/DuesIcon';
import ViewIcon from '../components/icons/ViewIcon';
import StudentProfileModal from '../components/StudentProfileModal';

interface FeesAnalysisProps {
    user: User;
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

const FeesAnalysis: React.FC<FeesAnalysisProps> = ({ user }) => {
    const [loading, setLoading] = useState(true);
    const [allStudents, setAllStudents] = useState<Student[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [selectedDrillClass, setSelectedDrillClass] = useState<string | null>(null);
    const [selectedStudentForProfile, setSelectedStudentForProfile] = useState<Student | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        const [studentsRes, classesRes] = await Promise.all([
            supabase.from('students').select('*'),
            supabase.from('classes').select('*')
        ]);
        if (studentsRes.data) setAllStudents(studentsRes.data);
        if (classesRes.data) setClasses(classesRes.data);
        setLoading(false);
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const stats = useMemo(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        const currentMonthIdx = new Date().getMonth();
        const classFeesMap = new Map(classes.map(c => [c.class_name, c.school_fees || 0]));

        let totalCollection = 0;
        let totalDues = 0;
        let todayCollection = 0;

        const classPaidToday: { [key: string]: number } = {};
        const classDuesVolume: { [key: string]: number } = {};

        allStudents.forEach(s => {
            const className = s.class || 'Unassigned';
            const monthlyFee = classFeesMap.get(className) || 0;
            
            // Previous Arrears
            totalDues += (s.previous_dues || 0);
            // FIX: Added type safety check for classDuesVolume key access on line 75
            classDuesVolume[className] = (classDuesVolume[className] || 0) + (s.previous_dues || 0);

            monthKeys.forEach((key, idx) => {
                const status = s[key] as string;
                const paid = parsePaidAmount(status);
                const actualPaid = paid === Infinity ? monthlyFee : paid;
                
                totalCollection += actualPaid;
                
                // Today check
                if (status?.includes(todayStr)) {
                    const todayParts = status.split(';').filter(p => p.includes(todayStr));
                    todayParts.forEach(tp => {
                        // FIX: Ensure numeric arithmetic for collection calculation on line 88
                        const amt = parseFloat(tp.split('=d=')[0]) || 0;
                        todayCollection += amt;
                        classPaidToday[className] = (classPaidToday[className] || 0) + amt;
                    });
                }

                if (idx <= currentMonthIdx) {
                    const due = monthlyFee - actualPaid;
                    if (due > 0) {
                        totalDues += due;
                        classDuesVolume[className] = (classDuesVolume[className] || 0) + due;
                    }
                }
            });
        });

        return {
            totalCollection,
            totalDues,
            todayCollection,
            paidChart: Object.entries(classPaidToday).map(([label, value]) => ({ label, value })),
            duesChart: Object.entries(classDuesVolume).map(([label, value]) => ({ label, value }))
        };
    }, [allStudents, classes]);

    const drillDownStudents = useMemo(() => {
        if (!selectedDrillClass) return [];
        const classFee = classes.find(c => c.class_name === selectedDrillClass)?.school_fees || 0;
        const currentMonthIdx = new Date().getMonth();

        return allStudents.filter(s => s.class === selectedDrillClass).map(s => {
            let studentDue = (s.previous_dues || 0);
            monthKeys.forEach((key, idx) => {
                if (idx <= currentMonthIdx) {
                    const paid = parsePaidAmount(s[key] as string);
                    studentDue += (classFee - (paid === Infinity ? classFee : paid));
                }
            });
            return { ...s, calculatedDue: studentDue };
        }).sort((a, b) => b.calculatedDue - a.calculatedDue);
    }, [selectedDrillClass, allStudents, classes]);

    if (loading) return <div className="flex justify-center items-center h-screen"><Spinner size="12" /></div>;

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-gray-200 pb-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Advanced Fees Center</h1>
                    <p className="text-gray-500 mt-1 font-medium">Real-time financial tracking and debt recovery intelligence.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchData} className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-bold text-gray-700 hover:bg-gray-50">Refresh Data</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Collection (Life)" value={`₹${stats.totalCollection.toLocaleString()}`} icon={<RupeeIcon />} color="bg-emerald-500" />
                <StatCard title="Total Outstanding" value={`₹${stats.totalDues.toLocaleString()}`} icon={<DuesIcon />} color="bg-rose-500" />
                <StatCard title="Today's Collection" value={`₹${stats.todayCollection.toLocaleString()}`} icon={<RupeeIcon />} color="bg-indigo-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100">
                    <SimpleBarChart title="Today's Cash Flow by Class (₹)" data={stats.paidChart} color="bg-indigo-400" />
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100">
                    <SimpleBarChart title="Total Debt Volume by Class (₹)" data={stats.duesChart} color="bg-rose-400" />
                </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <h2 className="text-2xl font-black text-gray-800">Class Debt Explorer</h2>
                    <select 
                        className="bg-gray-50 border-2 border-gray-200 rounded-xl px-6 py-3 font-black text-gray-700 outline-none focus:border-indigo-500 cursor-pointer shadow-sm"
                        value={selectedDrillClass || ''}
                        onChange={(e) => setSelectedDrillClass(e.target.value || null)}
                    >
                        <option value="">Select a class to drill down...</option>
                        {classes.map(c => <option key={c.id} value={c.class_name}>{c.class_name}</option>)}
                    </select>
                </div>

                {selectedDrillClass ? (
                    <div className="overflow-x-auto rounded-2xl border border-gray-100">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Student / Parents</th>
                                    <th className="px-6 py-4 text-center text-xs font-black text-gray-400 uppercase tracking-widest">Mobile</th>
                                    <th className="px-6 py-4 text-right text-xs font-black text-rose-600 uppercase tracking-widest bg-rose-50/50">Balance Due</th>
                                    <th className="px-6 py-4 text-center text-xs font-black text-gray-400 uppercase tracking-widest">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {drillDownStudents.map(s => (
                                    <tr key={s.id} className="hover:bg-indigo-50/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <img className="h-12 w-12 rounded-2xl object-cover border-2 border-white shadow-md" src={s.photo_url || `https://ui-avatars.com/api/?name=${s.name}&background=random`} alt="" />
                                                <div>
                                                    <p className="font-black text-gray-900">{s.name}</p>
                                                    <p className="text-xs text-gray-400 font-bold">F/N: {s.father_name || '-'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <a href={`tel:${s.mobile}`} className="text-indigo-600 font-black hover:underline">{s.mobile || '-'}</a>
                                        </td>
                                        <td className="px-6 py-4 text-right font-black text-lg text-rose-600 bg-rose-50/20">
                                            ₹{s.calculatedDue.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button onClick={() => setSelectedStudentForProfile(s)} className="p-3 bg-white border border-gray-200 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                                                <ViewIcon className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-20 text-gray-400 bg-gray-50 rounded-3xl border-4 border-dashed border-gray-100">
                        <DuesIcon className="w-20 h-20 mx-auto mb-4 opacity-10" />
                        <p className="text-xl font-bold italic">Select a class to generate a real-time recovery list.</p>
                    </div>
                )}
            </div>

            {selectedStudentForProfile && (
                <StudentProfileModal 
                    student={selectedStudentForProfile} 
                    classes={classes} 
                    onClose={() => {
                        setSelectedStudentForProfile(null);
                        fetchData();
                    }} 
                />
            )}
        </div>
    );
};

export default FeesAnalysis;
