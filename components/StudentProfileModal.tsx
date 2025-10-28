import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { Student, Class, Attendance, OtherFee } from '../types';
import Spinner from './Spinner';
import UserCircleIcon from './icons/UserCircleIcon';
import MailIcon from './icons/MailIcon';
import PhoneIcon from './icons/PhoneIcon';
import LocationIcon from './icons/LocationIcon';
import CalendarIcon from './icons/CalendarIcon';
import AcademicCapIcon from './icons/AcademicCapIcon';


interface StudentProfileModalProps {
    student: Student;
    classes: Class[];
    onClose: () => void;
}

const months: (keyof Student)[] = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const parsePaidAmount = (status: string | undefined | null): number => {
    if (!status || status === 'undefined' || status === 'Dues') {
        return 0;
    }
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
    if (isoDateRegex.test(status)) {
        return Infinity; // Represents a legacy full payment
    }
    const payments = status.split(';');
    return payments.reduce((total, payment) => {
        const parts = payment.split('=d=');
        if (parts.length === 2) {
            const amount = parseFloat(parts[0]);
            return total + (isNaN(amount) ? 0 : amount);
        }
        return total;
    }, 0);
};

const StudentProfileModal: React.FC<StudentProfileModalProps> = ({ student: initialStudent, classes, onClose }) => {
    const [student, setStudent] = useState<Student>(initialStudent);
    const [updatingFee, setUpdatingFee] = useState<string | null>(null);
    const [attendanceStatus, setAttendanceStatus] = useState<Map<string, 'present' | 'absent'>>(new Map());
    const [loadingAttendance, setLoadingAttendance] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [paymentAction, setPaymentAction] = useState<{ month: string, remaining: number } | null>(null);
    const [customAmount, setCustomAmount] = useState<string>('');

    const currentYear = new Date().getFullYear();

     useEffect(() => {
        const channel = supabase.channel(`student-profile-${initialStudent.id}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'students',
                filter: `id=eq.${initialStudent.id}`
            }, (payload) => {
                setStudent(payload.new as Student);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [initialStudent.id]);


    const fetchAttendanceData = useCallback(async () => {
        if (!student.class || !student.roll_number) {
            setLoadingAttendance(false);
            return;
        }

        const studentClassInfo = classes.find(c => c.class_name === student.class);
        if (!studentClassInfo) {
            setLoadingAttendance(false);
            return;
        }

        setLoadingAttendance(true);
        const { data, error } = await supabase
            .from('attendance')
            .select('date, present, absent')
            .eq('class_id', studentClassInfo.id)
            .gte('date', `${currentYear}-01-01`)
            .lte('date', `${currentYear}-12-31`);

        if (error) {
            setError(error.message);
        } else {
            const statusMap = new Map<string, 'present' | 'absent'>();
            data.forEach(record => {
                const presentRolls = record.present ? record.present.split(',') : [];
                const absentRolls = record.absent ? record.absent.split(',') : [];

                if (presentRolls.includes(student.roll_number!)) {
                    statusMap.set(record.date, 'present');
                } else if (absentRolls.includes(student.roll_number!)) {
                    statusMap.set(record.date, 'absent');
                }
            });
            setAttendanceStatus(statusMap);
        }
        setLoadingAttendance(false);
    }, [student.class, student.roll_number, classes, currentYear]);

    useEffect(() => {
        fetchAttendanceData();
    }, [fetchAttendanceData]);

    const handlePayment = async (month: keyof Student, amountToPay: number) => {
        if (!amountToPay || amountToPay <= 0) {
            setError('Invalid payment amount.');
            return;
        }
        setUpdatingFee(month);
        setError(null);

        const { data: currentStudentData, error: fetchError } = await supabase
            .from('students').select(month).eq('id', student.id).single();
        
        if (fetchError) {
            setError(`Failed to fetch latest data: ${fetchError.message}`);
            setUpdatingFee(null);
            return;
        }

        const currentStatus = currentStudentData?.[month];
        const newPaymentEntry = `${amountToPay}=d=${new Date().toISOString()}`;
        
        let newStatus = newPaymentEntry;
        const paidSoFar = parsePaidAmount(String(currentStatus));

        if (paidSoFar > 0 && paidSoFar !== Infinity) {
            newStatus = `${currentStatus};${newPaymentEntry}`;
        }

        const { error } = await supabase.from('students').update({ [month]: newStatus }).eq('id', student.id);
        
        if (error) {
            setError(`Failed to update fee: ${error.message}`);
        } else {
            // Optimistic update handled by Supabase realtime, just close the popover.
            setPaymentAction(null);
            setCustomAmount('');
        }
        setUpdatingFee(null);
    };

    const studentClassInfo = classes.find(c => c.class_name === student.class);
    const feeAmount = studentClassInfo?.school_fees || 0;

    const { totalDues, totalPaid } = months.reduce((acc, month) => {
        const paidForMonthRaw = parsePaidAmount(String(student[month]));
        const paidForMonth = paidForMonthRaw === Infinity ? feeAmount : paidForMonthRaw;
        
        acc.totalPaid += paidForMonth;

        if (student[month] && student[month] !== 'undefined' && paidForMonth < feeAmount) {
            acc.totalDues += (feeAmount - paidForMonth);
        }
        return acc;
    }, { totalDues: 0, totalPaid: 0 });

    const otherFeesSummary = (student.other_fees || []).reduce((acc, fee) => {
        if (fee.paid_date) {
            acc.paid += fee.amount;
        } else {
            acc.dues += fee.amount;
        }
        return acc;
    }, { paid: 0, dues: 0 });

    const finalTotalPaid = totalPaid + otherFeesSummary.paid;
    const finalTotalDues = totalDues + otherFeesSummary.dues;

    const attendanceSummary = Array.from(attendanceStatus.values()).reduce((acc, status) => {
        if (status === 'present') acc.present++;
        if (status === 'absent') acc.absent++;
        return acc;
    }, { present: 0, absent: 0 });

    const renderFeeStatus = (month: keyof Student) => {
        const status = student[month];
        const paidAmountRaw = parsePaidAmount(String(status));
        const paidAmount = paidAmountRaw === Infinity ? feeAmount : paidAmountRaw;
        const isFullyPaid = paidAmount >= feeAmount && feeAmount > 0;
        const remainingDue = feeAmount - paidAmount;

        const isActionOpen = paymentAction?.month === month;

        if (isFullyPaid) {
            return <span className="fee-badge bg-green-100 text-green-800">Paid</span>;
        }
        if (paidAmount > 0) {
            return (
                <div className="flex items-center gap-2 relative">
                    <span className="fee-badge bg-yellow-100 text-yellow-800" title={`Paid: ₹${paidAmount}`}>
                        Partially Paid (₹{remainingDue} due)
                    </span>
                    <button 
                        onClick={() => setPaymentAction({ month, remaining: remainingDue })}
                        disabled={!!updatingFee}
                        className="px-2 py-0.5 text-xs text-white bg-blue-600 rounded hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        Pay
                    </button>
                    {isActionOpen && renderPaymentPopover(month, remainingDue)}
                </div>
            );
        }
        if (status === 'Dues') {
             return (
                <div className="flex items-center gap-2 relative">
                    <span className="fee-badge bg-red-100 text-red-800">Dues</span>
                    <button 
                        onClick={() => setPaymentAction({ month, remaining: feeAmount })}
                        disabled={!!updatingFee}
                        className="px-2 py-0.5 text-xs text-white bg-green-600 rounded hover:bg-green-700 disabled:bg-gray-400"
                    >
                        {updatingFee === month ? <Spinner size="3" /> : 'Pay'}
                    </button>
                     {isActionOpen && renderPaymentPopover(month, feeAmount)}
                </div>
            );
        }
        return <span className="fee-badge bg-gray-200 text-gray-800">Pending</span>;
    };
    
    const renderPaymentPopover = (month: keyof Student, remaining: number) => (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-300 rounded-lg shadow-xl z-10 p-4 space-y-3">
            <h4 className="font-bold text-sm text-gray-800">Record Payment for {month}</h4>
            <button
                onClick={() => handlePayment(month, remaining)}
                disabled={updatingFee === month}
                className="w-full text-center px-3 py-2 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400"
            >
                {updatingFee === month ? <Spinner size="4" /> : `Pay Full Amount (₹${remaining})`}
            </button>
            <div className="flex items-center gap-2">
                <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Custom amount"
                    max={remaining}
                    className="flex-grow block w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                />
                <button
                    onClick={() => handlePayment(month, Number(customAmount))}
                    disabled={updatingFee === month || !customAmount || Number(customAmount) <= 0 || Number(customAmount) > remaining}
                    className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
                >
                    Pay
                </button>
            </div>
            <button onClick={() => { setPaymentAction(null); setCustomAmount(''); }} className="absolute -top-2 -right-2 text-xs bg-gray-600 text-white w-5 h-5 rounded-full">&times;</button>
        </div>
    );
    
    const generateCalendarDays = (year: number, month: number) => {
        const days = [];
        const date = new Date(year, month, 1);
        const firstDayIndex = date.getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < firstDayIndex; i++) {
            days.push(<div key={`empty-${i}`} className="w-8 h-8" />);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const fullDate = new Date(year, month, day);
            const dateString = fullDate.toISOString().split('T')[0];
            const dayOfWeek = fullDate.getDay();

            let statusClass = 'bg-gray-100 text-gray-700 hover:bg-gray-200';
            const status = attendanceStatus.get(dateString);

            if (status === 'present') statusClass = 'bg-green-500 text-white font-bold';
            else if (status === 'absent') statusClass = 'bg-red-500 text-white font-bold';
            else if (dayOfWeek === 0) statusClass = 'bg-yellow-400 text-white';

            days.push(
                <div key={day} className={`w-8 h-8 flex items-center justify-center rounded-full text-xs transition-colors duration-200 ${statusClass}`}>
                    {day}
                </div>
            );
        }
        return days;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-gray-50 p-8 rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] flex flex-col">
                <div className="flex justify-between items-center mb-6 flex-shrink-0">
                    <h2 className="text-3xl font-bold text-gray-800">Student Profile</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-4xl leading-none">&times;</button>
                </div>
                {error && <div className="p-3 mb-4 text-sm bg-red-100 text-red-700 rounded-md flex-shrink-0">{error}</div>}
                <div className="overflow-y-auto pr-4 -mr-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column: Profile & Info */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white p-6 rounded-xl shadow-md text-center">
                                <img src={student.photo_url || `https://ui-avatars.com/api/?name=${student.name}&background=4f46e5&color=fff&size=128`} alt={student.name} className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-primary-dark shadow-lg"/>
                                <h3 className="text-2xl font-bold text-gray-900 mt-4">{student.name}</h3>
                                <p className="text-md text-gray-600">Class: {student.class || 'N/A'}</p>
                                <p className="text-sm text-gray-500 font-mono">Roll No: {student.roll_number || 'N/A'}</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
                                <h4 className="info-header"><UserCircleIcon /> Personal Information</h4>
                                <InfoItem label="Father's Name" value={student.father_name} />
                                <InfoItem label="Mother's Name" value={student.mother_name} />
                                <InfoItem label="Date of Birth" value={student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : '-'} />
                                <InfoItem label="Gender" value={student.gender} />
                                <InfoItem label="Blood Group" value={student.blood_group} />
                            </div>
                             <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
                                <h4 className="info-header"><PhoneIcon /> Contact Details</h4>
                                <InfoItem label="Mobile" value={student.mobile} />
                                <InfoItem label="Gmail" value={student.gmail} />
                                <InfoItem label="Address" value={student.address} fullWidth/>
                            </div>
                             <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
                                <h4 className="info-header"><AcademicCapIcon /> Academic Information</h4>
                                <InfoItem label="Registration Date" value={new Date(student.registration_date).toLocaleDateString()} />
                                <InfoItem label="Aadhar" value={student.aadhar} />
                                <InfoItem label="Previous School" value={student.previous_school_name} />
                            </div>
                        </div>

                        {/* Right Column: Fees & Attendance */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white p-6 rounded-xl shadow-md">
                                <h4 className="text-xl font-bold text-gray-800 mb-4">Fee Records</h4>
                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    <FeeStatCard label="Monthly Fee" value={`₹${feeAmount.toLocaleString()}`} color="blue" />
                                    <FeeStatCard label="Total Paid" value={`₹${finalTotalPaid.toLocaleString()}`} color="green" />
                                    <FeeStatCard label="Total Dues" value={`₹${finalTotalDues.toLocaleString()}`} color="red" />
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {months.map(month => (
                                        <div key={month} className="flex justify-between items-center bg-gray-50 p-2.5 rounded-lg">
                                            <span className="font-medium text-sm capitalize">{month}</span>
                                            {renderFeeStatus(month)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-md">
                                <h4 className="text-xl font-bold text-gray-800 mb-2">Attendance Calendar {currentYear}</h4>
                                 <div className="flex items-center gap-4 text-xs mb-4 text-gray-600">
                                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-green-500 rounded-sm"></span>Present ({attendanceSummary.present})</span>
                                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-red-500 rounded-sm"></span>Absent ({attendanceSummary.absent})</span>
                                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-yellow-400 rounded-sm"></span>Holiday</span>
                                </div>
                                {loadingAttendance ? <div className="flex justify-center items-center h-64"><Spinner size="10"/></div> :
                                 !student.roll_number ? <p className="text-center text-gray-500 py-10">Student has no roll number assigned. Cannot display attendance.</p> :
                                (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {monthNames.map((name, index) => (
                                            <div key={name}>
                                                <h5 className="font-bold text-center mb-2">{name}</h5>
                                                <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-500 mb-1">
                                                    <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                                                </div>
                                                <div className="grid grid-cols-7 gap-1">
                                                    {generateCalendarDays(currentYear, index)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                .info-header { display: flex; align-items: center; gap: 0.5rem; font-size: 1.125rem; font-weight: 700; color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.5rem; margin-bottom: 1rem; }
                .fee-badge { padding: 0.125rem 0.5rem; font-size: 0.75rem; font-weight: 500; border-radius: 9999px; white-space: nowrap; }
            `}</style>
        </div>
    );
};

const InfoItem = ({ label, value, fullWidth = false }: { label: string, value?: string | null, fullWidth?: boolean }) => (
    <div className={fullWidth ? 'col-span-full' : ''}>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="mt-1 text-sm text-gray-900">{value || '-'}</p>
    </div>
);

const FeeStatCard = ({ label, value, color }: { label: string, value: string, color: 'blue'|'green'|'red' }) => {
    const colors = {
        blue: 'bg-blue-50 text-blue-800',
        green: 'bg-green-50 text-green-800',
        red: 'bg-red-50 text-red-800'
    };
    return (
        <div className={`p-3 rounded-lg text-center ${colors[color]}`}>
            <p className="text-xs font-medium uppercase">{label}</p>
            <p className="text-xl font-bold">{value}</p>
        </div>
    );
}


export default StudentProfileModal;