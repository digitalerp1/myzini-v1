
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { Student, Class } from '../types';
import Spinner from '../components/Spinner';
import StatCard from '../components/StatCard';
import { SimpleBarChart } from '../components/ChartComponents';
import RupeeIcon from '../components/icons/RupeeIcon';
import DuesIcon from '../components/icons/DuesIcon';
import ViewIcon from '../components/icons/ViewIcon';
import StudentProfileModal from '../components/StudentProfileModal';

interface FeesAnalysisProps {
    user: User;
}

const monthKeys: (keyof Student)[] = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

const parsePaidAmount = (status: string | undefined | null): number => {
    if (!status || status === 'undefined' || status === 'Dues') return 0;
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
    if (isoDateRegex.test(status)) return Infinity; 
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
            
            totalDues += (s.previous_dues || 0);
            classDuesVolume[className] = (Number(classDuesVolume[className]) || 0) + (s.previous_dues || 0);

            monthKeys.forEach((key, idx) => {
                const status = s[key] as string;
                const paid = parsePaidAmount(status);
                const actualPaid = paid === Infinity ? monthlyFee : paid;
                
                totalCollection += actualPaid;
                
                if (status?.includes(todayStr)) {
                    const todayPayments = status.split(';').filter(p => p.includes(todayStr));
                    todayPayments.forEach(tp => {
                        const amt = parseFloat(tp.split('=d=')[0]) || 0;
                        todayCollection += amt;
                        classPaidToday[className] = (Number(classPaidToday[className]) || 0) + amt;
                    });
                }

                if (idx <= currentMonthIdx) {
                    const due = monthlyFee - actualPaid;
                    if (due > 0) {
                        totalDues += due;
                        classDuesVolume[className] = (Number(classDuesVolume[className]) || 0) + due;
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
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                <RupeeIcon className="text-primary-dark w-10 h-10" /> Advanced Fees Analysis
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Collection" value={`₹${stats.totalCollection.toLocaleString()}`} icon={<RupeeIcon />} color="bg-emerald-500" />
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
                    <h2 className="text-2xl font-black text-gray-800">Class Debtor List</h2>
                    <select 
                        className="bg-gray-50 border-2 border-gray-200 rounded-xl px-6 py-3 font-black text-gray-700 outline-none focus:border-indigo-500"
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
                                    <th className="px-6 py-4 text-right text-xs font-black text-rose-600 uppercase tracking-widest bg-rose-50/50">Cumulative Due</th>
                                    <th className="px-6 py-4 text-center text-xs font-black text-gray-400 uppercase tracking-widest">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {drillDownStudents.map(s => (
                                    <tr key={s.id} className="hover:bg-indigo-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <img className="h-12 w-12 rounded-2xl object-cover border-2 border-white shadow-md" src={s.photo_url || `https://ui-avatars.com/api/?name=${s.name}&background=random`} alt="" />
                                                <div>
                                                    <p className="font-black text-gray-900">{s.name}</p>
                                                    <p className="text-xs text-gray-400 font-bold">Father: {s.father_name || '-'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center font-bold text-gray-600">
                                            {s.mobile || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right font-black text-lg text-rose-600 bg-rose-50/20">
                                            ₹{s.calculatedDue.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button onClick={() => setSelectedStudentForProfile(s)} className="p-3 bg-white border border-gray-200 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                                                {/* FIX: Removed className from ViewIcon as its current definition doesn't support it or caused type mismatch */}
                                                <ViewIcon />
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
                        <p className="text-xl font-bold italic">Select a class above to generate a debtor recovery list.</p>
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