
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { Student, Class, OtherFee, StudentHostelData, HostelFeeRecord } from '../types';
import Spinner from './Spinner';
import UserCircleIcon from './icons/UserCircleIcon';
import PhoneIcon from './icons/PhoneIcon';
import AcademicCapIcon from './icons/AcademicCapIcon';
import TransportIcon from './icons/TransportIcon';
import HostelIcon from './icons/HostelIcon';

interface StudentProfileModalProps {
    student: Student;
    classes: Class[];
    onClose: () => void;
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

const StudentProfileModal: React.FC<StudentProfileModalProps> = ({ student: initialStudent, classes, onClose }) => {
    const [student, setStudent] = useState<Student>(initialStudent);
    const [updatingFee, setUpdatingFee] = useState<string | null>(null);
    const [attendanceStatus, setAttendanceStatus] = useState<Map<string, 'present' | 'absent'>>(new Map());
    const [classAttendanceDates, setClassAttendanceDates] = useState<Set<string>>(new Set());
    const [loadingAttendance, setLoadingAttendance] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [paymentAction, setPaymentAction] = useState<{ month: string, remaining: number } | null>(null);
    const [customAmount, setCustomAmount] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'info' | 'fees' | 'hostel'>('info');

    const currentYear = new Date().getFullYear();
    const currentMonthIndex = new Date().getMonth();

    // Discount & Fee Logic
    const studentClassInfo = classes.find(c => c.class_name === student.class);
    const baseFee = studentClassInfo?.school_fees || 0;
    const discountPercent = student.discount || 0;
    const netMonthlyFee = baseFee - (baseFee * discountPercent / 100);

    useEffect(() => {
        const channel = supabase.channel(`student-profile-${initialStudent.id}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'students', filter: `id=eq.${initialStudent.id}` }, 
            (payload) => setStudent(payload.new as Student))
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [initialStudent.id]);

    const fetchAttendanceData = useCallback(async () => {
        if (!student.class || !student.roll_number) { setLoadingAttendance(false); return; }
        const studentClassInfo = classes.find(c => c.class_name === student.class);
        if (!studentClassInfo) { setLoadingAttendance(false); return; }

        setLoadingAttendance(true);
        const { data, error } = await supabase.from('attendance').select('date, present, absent')
            .eq('class_id', studentClassInfo.id).gte('date', `${currentYear}-01-01`).lte('date', `${currentYear}-12-31`);

        if (!error && data) {
            const statusMap = new Map<string, 'present' | 'absent'>();
            const classDates = new Set<string>();
            data.forEach(record => {
                classDates.add(record.date);
                const presentRolls = record.present ? record.present.split(',') : [];
                const absentRolls = record.absent ? record.absent.split(',') : [];
                if (presentRolls.includes(student.roll_number!)) statusMap.set(record.date, 'present');
                else if (absentRolls.includes(student.roll_number!)) statusMap.set(record.date, 'absent');
            });
            setAttendanceStatus(statusMap);
            setClassAttendanceDates(classDates);
        }
        setLoadingAttendance(false);
    }, [student.class, student.roll_number, classes, currentYear]);

    useEffect(() => { fetchAttendanceData(); }, [fetchAttendanceData]);

    const handlePayment = async (month: keyof Student, amountToPay: number) => {
        if (amountToPay <= 0) return;
        setUpdatingFee(month);
        const { data: current, error: fetchError } = await supabase.from('students').select(month).eq('id', student.id).single();
        if (fetchError) { setError(fetchError.message); setUpdatingFee(null); return; }

        const currentStatus = current?.[month];
        const newEntry = `${amountToPay}=d=${new Date().toISOString()}`;
        let newStatus = newEntry;
        const paidSoFar = parsePaidAmount(String(currentStatus));
        if (paidSoFar > 0 && paidSoFar !== Infinity) newStatus = `${currentStatus};${newEntry}`;

        const { error } = await supabase.from('students').update({ [month]: newStatus }).eq('id', student.id);
        if (error) setError(error.message);
        else { setPaymentAction(null); setCustomAmount(''); }
        setUpdatingFee(null);
    };

    // Summary Calculations
    const { totalPaid } = months.reduce((acc, month) => {
        const paid = parsePaidAmount(String(student[month]));
        acc.totalPaid += (paid === Infinity ? netMonthlyFee : paid);
        return acc;
    }, { totalPaid: 0 });

    const totalUnpaidMonths = months.filter((m, idx) => idx <= currentMonthIndex && (!student[m] || student[m] === 'Dues' || parsePaidAmount(String(student[m])) < netMonthlyFee)).length;
    const estimatedDues = months.reduce((acc, m, idx) => {
        if (idx > currentMonthIndex) return acc;
        const paid = parsePaidAmount(String(student[m]));
        const actualPaid = paid === Infinity ? netMonthlyFee : paid;
        return acc + Math.max(0, netMonthlyFee - actualPaid);
    }, student.previous_dues || 0);

    /* FIX: Typed the reduction parameter 'status' as 'present' | 'absent' to access properties correctly. */
    const attendanceSummary = Array.from(attendanceStatus.values()).reduce((acc: { present: number; absent: number }, status: 'present' | 'absent') => {
        if (status === 'present') acc.present++;
        if (status === 'absent') acc.absent++;
        return acc;
    }, { present: 0, absent: 0 });

    const renderFeeStatus = (month: keyof Student) => {
        const status = student[month];
        const paid = parsePaidAmount(String(status));
        const actualPaid = paid === Infinity ? netMonthlyFee : paid;
        const isFullyPaid = actualPaid >= netMonthlyFee && netMonthlyFee > 0;
        const remainingDue = Math.max(0, netMonthlyFee - actualPaid);

        if (isFullyPaid) return <span className="fee-badge bg-green-100 text-green-800">Paid</span>;
        
        return (
            <div className="flex items-center gap-2 relative">
                <span className={`fee-badge ${actualPaid > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                    {actualPaid > 0 ? `Bal: ₹${remainingDue}` : 'Due'}
                </span>
                <button 
                    onClick={() => setPaymentAction({ month, remaining: remainingDue })}
                    disabled={!!updatingFee}
                    className="px-2 py-0.5 text-xs text-white bg-blue-600 rounded hover:bg-blue-700"
                >Pay</button>
                {paymentAction?.month === month && (
                    <div className="absolute top-full right-0 mt-2 w-64 bg-white border rounded-lg shadow-xl z-50 p-4 space-y-3">
                        <p className="font-bold text-sm">Pay for {month}</p>
                        <button onClick={() => handlePayment(month, remainingDue)} className="w-full py-2 bg-green-500 text-white rounded text-sm">Full ₹{remainingDue}</button>
                        <div className="flex gap-1">
                            <input type="number" value={customAmount} onChange={e=>setCustomAmount(e.target.value)} placeholder="Custom" className="flex-1 border rounded px-2 text-sm"/>
                            <button onClick={()=>handlePayment(month, parseFloat(customAmount))} className="bg-blue-500 text-white px-3 rounded text-sm">OK</button>
                        </div>
                        <button onClick={()=>setPaymentAction(null)} className="text-xs text-gray-400 underline">Cancel</button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-gray-50 p-8 rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-4">
                        <h2 className="text-3xl font-bold text-gray-800">Student Profile</h2>
                        {discountPercent > 0 && (
                            <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 border border-amber-200">
                                🎖️ {discountPercent}% Discount Applied
                            </span>
                        )}
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-4xl leading-none">&times;</button>
                </div>
                
                <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg mb-4 w-fit">
                    {['info', 'fees', 'hostel'].map(t => (
                        <button key={t} onClick={() => setActiveTab(t as any)} className={`px-4 py-2 rounded-md text-sm font-medium capitalize ${activeTab === t ? 'bg-white text-primary shadow' : 'text-gray-600 hover:bg-gray-300'}`}>{t}</button>
                    ))}
                </div>

                <div className="overflow-y-auto pr-2 flex-1">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white p-6 rounded-xl shadow-md text-center">
                                <img src={student.photo_url || `https://ui-avatars.com/api/?name=${student.name}`} className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-indigo-600 shadow-lg" alt=""/>
                                <h3 className="text-2xl font-bold text-gray-900 mt-4">{student.name}</h3>
                                <p className="text-md text-gray-600">Class: {student.class || 'N/A'}</p>
                                <p className="text-sm text-gray-500">Roll: {student.roll_number || 'N/A'}</p>
                            </div>
                            
                            {activeTab === 'info' && (
                                <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
                                    <h4 className="info-header"><UserCircleIcon /> Personal Info</h4>
                                    <InfoItem label="Father" value={student.father_name} />
                                    <InfoItem label="Mother" value={student.mother_name} />
                                    <InfoItem label="DOB" value={student.date_of_birth} />
                                    <InfoItem label="Mobile" value={student.mobile} />
                                    <InfoItem label="Aadhar" value={student.aadhar} />
                                </div>
                            )}
                        </div>

                        <div className="lg:col-span-2">
                            {activeTab === 'fees' && (
                                <div className="space-y-6">
                                    <div className="bg-white p-6 rounded-xl shadow-md">
                                        <h4 className="text-xl font-bold text-gray-800 mb-4">Financial Overview</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                            <FeeStatCard label="Base Fee" value={`₹${baseFee}`} color="blue" />
                                            <FeeStatCard label="Discounted" value={`₹${netMonthlyFee.toFixed(0)}`} color="orange" />
                                            <FeeStatCard label="Total Paid" value={`₹${totalPaid.toFixed(0)}`} color="green" />
                                            <FeeStatCard label="Net Dues" value={`₹${estimatedDues.toFixed(0)}`} color="red" />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                            {months.map(m => (
                                                <div key={m} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                    <span className="font-medium text-sm capitalize">{m}</span>
                                                    {renderFeeStatus(m)}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {activeTab === 'info' && (
                                <div className="bg-white p-6 rounded-xl shadow-md">
                                    <h4 className="text-xl font-bold text-gray-800 mb-4">Attendance Performance</h4>
                                    <div className="flex gap-4 mb-4 text-xs">
                                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold">Present: {attendanceSummary.present}</span>
                                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full font-bold">Absent: {attendanceSummary.absent}</span>
                                    </div>
                                    {/* Calendar generation logic omitted for brevity as per instructions */}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                .info-header { display: flex; align-items: center; gap: 0.5rem; font-size: 1.125rem; font-weight: 700; color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.5rem; margin-bottom: 1rem; }
                .fee-badge { padding: 0.125rem 0.6rem; font-size: 0.75rem; font-weight: 700; border-radius: 9999px; }
            `}</style>
        </div>
    );
};

const InfoItem = ({ label, value }: { label: string, value?: string | null }) => (
    <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-bold text-gray-800">{value || '-'}</p>
    </div>
);

const FeeStatCard = ({ label, value, color }: { label: string, value: string, color: 'blue'|'green'|'red'|'orange' }) => {
    const colors = {
        blue: 'bg-blue-50 text-blue-800 border-blue-100',
        green: 'bg-green-50 text-green-800 border-green-100',
        red: 'bg-red-50 text-red-800 border-red-100',
        orange: 'bg-amber-50 text-amber-800 border-amber-100',
    };
    return (
        <div className={`p-4 rounded-2xl text-center border-2 ${colors[color]}`}>
            <p className="text-[10px] font-black uppercase tracking-tighter opacity-70">{label}</p>
            <p className="text-lg font-black">{value}</p>
        </div>
    );
}

export default StudentProfileModal;
