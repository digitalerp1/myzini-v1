
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { Student, Class, FeeType, OwnerProfile } from '../types';
import Spinner from '../components/Spinner';
import StudentProfileModal from '../components/StudentProfileModal';

interface StudentWithDues extends Student {
    dueAmount: number;
}

const months: (keyof Student)[] = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const parsePaidAmount = (status: string | undefined | null): number => {
    if (!status || status === 'undefined' || status === 'Dues') return 0;
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(status)) return Infinity;
    return status.split(';').reduce((total, payment) => {
        const parts = payment.split('=d=');
        return total + (parts.length === 2 ? parseFloat(parts[0]) || 0 : 0);
    }, 0);
};

const DuesList: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [allStudents, setAllStudents] = useState<Student[]>([]); 
    const [filteredStudents, setFilteredStudents] = useState<StudentWithDues[]>([]);
    const [schoolProfile, setSchoolProfile] = useState<OwnerProfile | null>(null);
    const [classes, setClasses] = useState<Class[]>([]);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedClassFilter, setSelectedClassFilter] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const [studentsRes, classesRes, profileRes] = await Promise.all([
            supabase.from('students').select('*'),
            supabase.from('classes').select('*').order('class_name'),
            supabase.from('owner').select('*').eq('uid', user.id).single()
        ]);
        if (studentsRes.data) setAllStudents(studentsRes.data);
        if (classesRes.data) setClasses(classesRes.data);
        if (profileRes.data) setSchoolProfile(profileRes.data);
        setLoading(false);
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    useEffect(() => {
        if (allStudents.length === 0) return;
        const classFeesMap = new Map(classes.map(c => [c.class_name, c.school_fees || 0]));
        const currentMonthIdx = new Date().getMonth();

        const result = allStudents.filter(s => {
            if (selectedClassFilter && s.class !== selectedClassFilter) return false;
            if (searchQuery && !s.name.toLowerCase().includes(searchQuery.toLowerCase()) && !s.roll_number?.includes(searchQuery)) return false;
            return true;
        }).map(student => {
            const baseFee = classFeesMap.get(student.class || '') || 0;
            const discount = student.discount || 0;
            const netFee = baseFee - (baseFee * discount / 100);
            /* FIX: Ensured student.previous_dues is treated as a number. */
            let calculatedDue = Number(student.previous_dues || 0);

            months.forEach((month, idx) => {
                if (idx > currentMonthIdx && filter !== 'all') return;
                const status = student[month];
                if (!status || status === 'undefined') return;

                const paid = parsePaidAmount(String(status));
                const actualPaid = paid === Infinity ? netFee : paid;
                if (actualPaid < netFee) calculatedDue += (netFee - actualPaid);
            });

            return { ...student, dueAmount: Math.round(calculatedDue) };
        }).filter(s => s.dueAmount > 0).sort((a,b) => b.dueAmount - a.dueAmount);

        setFilteredStudents(result);
    }, [filter, allStudents, classes, searchQuery, selectedClassFilter]);

    if (loading) return <div className="flex justify-center items-center h-96"><Spinner size="12" /></div>;

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Debtors List (Discount Aware)</h1>
            
            <div className="flex flex-col xl:flex-row justify-between gap-4 mb-6 bg-gray-50 p-4 rounded-2xl">
                <input type="text" placeholder="Search Student..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} className="px-4 py-2 border rounded-xl flex-1"/>
                <select value={selectedClassFilter} onChange={e=>setSelectedClassFilter(e.target.value)} className="px-4 py-2 border rounded-xl">
                    <option value="">All Classes</option>
                    {classes.map(c => <option key={c.id} value={c.class_name}>{c.class_name}</option>)}
                </select>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Student</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Class</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Discount</th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-rose-600 uppercase">Outstanding</th>
                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {filteredStudents.map(s => (
                            <tr key={s.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-bold">{s.name}</td>
                                <td className="px-6 py-4">{s.class}</td>
                                <td className="px-6 py-4">
                                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-[10px] font-black">{s.discount || 0}%</span>
                                </td>
                                <td className="px-6 py-4 text-right font-black text-rose-600">₹{s.dueAmount}</td>
                                <td className="px-6 py-4 text-center">
                                    <button onClick={()=>setSelectedStudent(s)} className="text-primary hover:underline font-bold text-sm">View Profile</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedStudent && (
                <StudentProfileModal student={selectedStudent} classes={classes} onClose={()=>setSelectedStudent(null)} />
            )}
        </div>
    );
};

export default DuesList;
