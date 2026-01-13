import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../services/supabase';
import { Student, Class, OtherFee } from '../types';
import Spinner from './Spinner';
import UserCircleIcon from './icons/UserCircleIcon';
import PhoneIcon from './icons/PhoneIcon';
import AcademicCapIcon from './icons/AcademicCapIcon';
import TransportIcon from './icons/TransportIcon';
import RupeeIcon from './icons/RupeeIcon';

interface StudentProfileModalProps {
    student: Student;
    classes: Class[];
    onClose: () => void;
}

const monthKeys: (keyof Student)[] = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const parsePaidAmount = (status: string | undefined | null): number => {
    if (!status || status === 'undefined' || status === 'Dues') return 0;
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(status)) return Infinity;
    return status.split(';').reduce((total, p) => {
        const parts = p.split('=d=');
        return total + (parts.length === 2 ? parseFloat(parts[0]) || 0 : 0);
    }, 0);
};

const StudentProfileModal: React.FC<StudentProfileModalProps> = ({ student: initialStudent, classes, onClose }) => {
    const [student, setStudent] = useState<Student>(initialStudent);
    const [activeTab, setActiveTab] = useState<'info' | 'fees' | 'all-years'>('info');
    const [updatingFee, setUpdatingFee] = useState<string | null>(null);
    const [paymentAction, setPaymentAction] = useState<{ month: string, remaining: number } | null>(null);
    const [customAmount, setCustomAmount] = useState<string>('');

    useEffect(() => {
        const channel = supabase.channel(`profile-${initialStudent.id}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'students', filter: `id=eq.${initialStudent.id}` }, 
            (payload) => setStudent(payload.new as Student))
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [initialStudent.id]);

    const classInfo = useMemo(() => classes.find(c => c.class_name === student.class), [classes, student.class]);
    const monthlyFee = classInfo?.school_fees || 0;

    const feeStats = useMemo(() => {
        let totalPaid = 0;
        let sessionDues = (student.previous_dues || 0);
        const currentMonthIdx = new Date().getMonth();

        monthKeys.forEach((key, idx) => {
            const status = student[key] as string;
            const paid = parsePaidAmount(status);
            const actualPaid = paid === Infinity ? monthlyFee : paid;
            totalPaid += actualPaid;

            if (idx <= currentMonthIdx) {
                const balance = monthlyFee - actualPaid;
                if (balance > 0) sessionDues += balance;
            }
        });

        const otherPaid = (student.other_fees || []).reduce((acc, f) => acc + (f.paid_date ? f.amount : 0), 0);
        const otherDues = (student.other_fees || []).reduce((acc, f) => acc + (!f.paid_date ? f.amount : 0), 0);

        return { totalPaid: totalPaid + otherPaid, totalDues: sessionDues + otherDues, previousDues: student.previous_dues || 0 };
    }, [student, monthlyFee]);

    const handlePayment = async (month: keyof Student, amount: number) => {
        if (amount <= 0) return;
        setUpdatingFee(month as string);
        const currentStatus = student[month] as string;
        const newPayment = `${amount}=d=${new Date().toISOString()}`;
        const newStatus = (currentStatus && currentStatus !== 'undefined' && currentStatus !== 'Dues') 
            ? `${currentStatus};${newPayment}` 
            : newPayment;

        const { error } = await supabase.from('students').update({ [month]: newStatus }).eq('id', student.id);
        if (!error) {
            setPaymentAction(null);
            setCustomAmount('');
        }
        setUpdatingFee(null);
    };

    const renderFeeBadge = (monthKey: keyof Student) => {
        const status = student[monthKey] as string;
        const paid = parsePaidAmount(status);
        const actualPaid = paid === Infinity ? monthlyFee : paid;
        const remaining = monthlyFee - actualPaid;
        const isActionOpen = paymentAction?.month === monthKey;

        if (actualPaid >= monthlyFee && monthlyFee > 0) return <span className="badge bg-green-100 text-green-700">Paid</span>;
        
        return (
            <div className="relative flex items-center gap-2">
                <span className={`badge ${actualPaid > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-rose-100 text-rose-700'}`}>
                    {actualPaid > 0 ? `Partial (₹${remaining})` : 'Dues'}
                </span>
                <button 
                    onClick={() => setPaymentAction({ month: monthKey as string, remaining })}
                    className="p-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors px-2 font-bold"
                >
                    Pay
                </button>
                {isActionOpen && (
                    <div className="absolute bottom-full right-0 mb-2 w-48 bg-white border border-gray-200 shadow-2xl rounded-xl p-3 z-50 animate-fade-in">
                        <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Record Payment</p>
                        <button 
                            onClick={() => handlePayment(monthKey, remaining)}
                            className="w-full text-xs py-2 bg-emerald-600 text-white rounded-lg font-black mb-2 hover:bg-emerald-700"
                        >
                            Full: ₹{remaining}
                        </button>
                        <div className="flex gap-1">
                            <input 
                                type="number" 
                                placeholder="Amt" 
                                value={customAmount}
                                onChange={(e) => setCustomAmount(e.target.value)}
                                className="w-full text-xs p-2 border rounded-lg outline-none focus:border-indigo-500"
                            />
                            <button 
                                onClick={() => handlePayment(monthKey, parseFloat(customAmount))}
                                className="px-3 bg-indigo-600 text-white rounded-lg font-black"
                            >&rarr;</button>
                        </div>
                        <button onClick={() => setPaymentAction(null)} className="absolute -top-2 -right-2 w-5 h-5 bg-gray-400 text-white rounded-full text-xs">&times;</button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden border border-white/20">
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Student Profile</h2>
                        <p className="text-indigo-600 font-bold text-sm">Class {student.class} | Roll {student.roll_number}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors text-4xl leading-none">&times;</button>
                </div>

                <div className="flex p-2 bg-gray-100/50 gap-1 overflow-x-auto no-scrollbar">
                    {['info', 'fees', 'all-years'].map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                            {tab.replace('-', ' ')}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                    {activeTab === 'info' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                            <div className="flex flex-col items-center gap-6">
                                <img src={student.photo_url || `https://ui-avatars.com/api/?name=${student.name}&background=4f46e5&color=fff&size=256`} className="w-48 h-48 rounded-[2rem] object-cover shadow-2xl border-4 border-white" alt=""/>
                                <div className="text-center">
                                    <h3 className="text-2xl font-black text-gray-900">{student.name}</h3>
                                    <p className="text-gray-500 font-medium">Joined: {new Date(student.registration_date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="lg:col-span-2 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InfoBox label="Guardian Name" value={student.father_name} icon={<UserCircleIcon />} />
                                    <InfoBox label="Primary Contact" value={student.mobile} icon={<PhoneIcon />} />
                                    <InfoBox label="Mother's Name" value={student.mother_name} icon={<UserCircleIcon />} />
                                    <InfoBox label="Date of Birth" value={student.date_of_birth} icon={<AcademicCapIcon />} />
                                    <InfoBox label="Aadhar Card" value={student.aadhar} icon={<AcademicCapIcon />} />
                                    <InfoBox label="Home Address" value={student.address} icon={<RupeeIcon />} />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'fees' && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <SummaryCard label="Monthly Projected" value={`₹${monthlyFee}`} color="blue" />
                                <SummaryCard label="Paid (Current)" value={`₹${feeStats.totalPaid}`} color="emerald" />
                                <SummaryCard label="Total Dues" value={`₹${feeStats.totalDues}`} color="rose" />
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {monthKeys.map((key, idx) => (
                                    <div key={key} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col justify-between min-h-[100px] hover:bg-gray-100 transition-colors">
                                        <p className="font-black text-gray-800 text-sm">{monthNames[idx]}</p>
                                        <div className="mt-2">{renderFeeBadge(key)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'all-years' && (
                        <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-4 border-dashed border-gray-100 max-w-2xl mx-auto">
                            <RupeeIcon className="w-16 h-16 mx-auto mb-4 opacity-10" />
                            <h3 className="text-xl font-black text-gray-400">Archived Financial Records</h3>
                            <p className="text-gray-400 mt-2 px-10">Detailed cross-session analysis for previous years (2020-2023) is visible for migrated student accounts only.</p>
                            <div className="mt-8 inline-block px-8 py-4 bg-white rounded-3xl shadow-sm border border-gray-100">
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Opening Session Arrears</p>
                                <p className="text-3xl font-black text-gray-800 mt-1">₹{feeStats.previousDues.toLocaleString()}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <style>{`
                .badge { padding: 4px 12px; border-radius: 9999px; font-size: 10px; font-weight: 800; text-transform: uppercase; white-space: nowrap; }
            `}</style>
        </div>
    );
};

const InfoBox = ({ label, value, icon }: any) => (
    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex items-center gap-4">
        <div className="p-3 bg-white rounded-xl shadow-sm text-indigo-600">{icon}</div>
        <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
            <p className="font-black text-gray-800 truncate max-w-[200px]">{value || '-'}</p>
        </div>
    </div>
);

const SummaryCard = ({ label, value, color }: any) => {
    const colors: any = {
        blue: 'bg-blue-50 text-blue-800 border-blue-100',
        emerald: 'bg-emerald-50 text-emerald-800 border-emerald-100',
        rose: 'bg-rose-50 text-rose-800 border-rose-100'
    };
    return (
        <div className={`p-6 rounded-3xl border-2 text-center shadow-sm ${colors[color]}`}>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{label}</p>
            <p className="text-3xl font-black mt-1">{value}</p>
        </div>
    );
};

export default StudentProfileModal;