
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
    const [updatingOtherFee, setUpdatingOtherFee] = useState<string | null>(null);
    const [attendanceStatus, setAttendanceStatus] = useState<Map<string, 'present' | 'absent'>>(new Map());
    const [classAttendanceDates, setClassAttendanceDates] = useState<Set<string>>(new Set());
    const [loadingAttendance, setLoadingAttendance] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [paymentAction, setPaymentAction] = useState<{ month: string, remaining: number } | null>(null);
    const [customAmount, setCustomAmount] = useState<string>('');
    
    // New State for Driver and Attendance UI
    const [assignedDriver, setAssignedDriver] = useState<{ name: string; van_number: string } | null>(null);
    const [showAllAttendance, setShowAllAttendance] = useState(false);

    // Hostel Payment States
    const [hostelPayAmount, setHostelPayAmount] = useState<string>('');
    const [hostelPayDesc, setHostelPayDesc] = useState<string>('Hostel Fee Payment');
    const [hostelDueAmount, setHostelDueAmount] = useState<string>('');
    const [hostelDueDesc, setHostelDueDesc] = useState<string>('Monthly Rent');
    const [isHostelProcessing, setIsHostelProcessing] = useState(false);

    // Active Tab State
    const [activeTab, setActiveTab] = useState<'info' | 'fees' | 'hostel'>('info');

    const currentYear = new Date().getFullYear();
    const currentMonthIndex = new Date().getMonth();

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

    // Fetch Assigned Driver
    useEffect(() => {
        const fetchDriver = async () => {
            if (!student.class || !student.roll_number) return;
            
            const { data, error } = await supabase
                .from('driver')
                .select('name, van_number, students_list');
            
            if (data) {
                // Find the driver who has this student in their list
                const match = data.find((d: any) => 
                    d.students_list?.some((s: any) => 
                        s.class === student.class && s.roll_number === student.roll_number
                    )
                );
                
                if (match) {
                    setAssignedDriver({ name: match.name, van_number: match.van_number });
                } else {
                    setAssignedDriver(null);
                }
            }
        };
        fetchDriver();
    }, [student.class, student.roll_number]);


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
            const classDates = new Set<string>();

            data.forEach(record => {
                // Track that attendance was taken on this day for this class
                classDates.add(record.date);

                const presentRolls = record.present ? record.present.split(',') : [];
                const absentRolls = record.absent ? record.absent.split(',') : [];

                if (presentRolls.includes(student.roll_number!)) {
                    statusMap.set(record.date, 'present');
                } else if (absentRolls.includes(student.roll_number!)) {
                    statusMap.set(record.date, 'absent');
                }
            });
            setAttendanceStatus(statusMap);
            setClassAttendanceDates(classDates);
        }
        setLoadingAttendance(false);
    }, [student.class, student.roll_number, classes, currentYear]);

    useEffect(() => {
        fetchAttendanceData();
    }, [fetchAttendanceData]);

    // --- Hostel Logic ---
    const handleAddHostelRecord = async (type: 'Paid' | 'Due') => {
        const amount = type === 'Paid' ? parseFloat(hostelPayAmount) : parseFloat(hostelDueAmount);
        const desc = type === 'Paid' ? hostelPayDesc : hostelDueDesc;

        if (isNaN(amount) || amount <= 0) {
            setError("Please enter a valid amount.");
            return;
        }

        setIsHostelProcessing(true);
        
        const newRecord: HostelFeeRecord = {
            id: crypto.randomUUID(),
            month: desc, // We use month field for description in this flexible ledger
            amount: amount,
            status: type,
            paid_date: type === 'Paid' ? new Date().toISOString() : undefined,
            description: desc
        };

        const existingRecords = student.hostel_data?.fee_records || [];
        const updatedRecords = [...existingRecords, newRecord];
        
        // Ensure structure is maintained
        const updatedHostelData = { 
            ...(student.hostel_data || { 
                is_active: true, 
                building_id: '', building_name: 'Unknown', 
                floor_id: '', floor_name: '', 
                room_no: '', joining_date: new Date().toISOString(), monthly_fee: 0 
            }),
            fee_records: updatedRecords 
        };

        const { error: updateError } = await supabase
            .from('students')
            .update({ hostel_data: updatedHostelData })
            .eq('id', student.id);

        if (updateError) {
            setError(updateError.message);
        } else {
            // Reset inputs
            setHostelPayAmount('');
            setHostelDueAmount('');
            if(type === 'Due') setHostelDueDesc('Monthly Rent');
        }
        setIsHostelProcessing(false);
    };


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

    const handlePayOtherFee = async (feeToPay: OtherFee) => {
        const key = `${feeToPay.fees_name}-${feeToPay.dues_date}`;
        setUpdatingOtherFee(key);
        setError(null);

        const updatedOtherFees = student.other_fees?.map(fee => {
            if (fee.fees_name === feeToPay.fees_name && fee.dues_date === feeToPay.dues_date && !fee.paid_date) {
                return { ...fee, paid_date: new Date().toISOString() };
            }
            return fee;
        });

        const { error } = await supabase
            .from('students')
            .update({ other_fees: updatedOtherFees })
            .eq('id', student.id);
        
        if (error) {
            setError(`Failed to update fee: ${error.message}`);
        }
        setUpdatingOtherFee(null);
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
    const finalTotalDues = totalDues + otherFeesSummary.dues + (student.previous_dues || 0);

    const attendanceSummary = Array.from(attendanceStatus.values()).reduce((acc: { present: number; absent: number }, status) => {
        if (status === 'present') acc.present++;
        if (status === 'absent') acc.absent++;
        return acc;
    }, { present: 0, absent: 0 });

    // Hostel Calculations
    const hostelData = student.hostel_data as StudentHostelData | undefined;
    const hostelTotalPaid = hostelData?.fee_records?.filter(r => r.status === 'Paid').reduce((sum, r) => sum + r.amount, 0) || 0;
    const hostelTotalDues = hostelData?.fee_records?.filter(r => r.status === 'Due').reduce((sum, r) => sum + r.amount, 0) || 0;
    const hostelBalance = hostelTotalDues - hostelTotalPaid;


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
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < firstDayIndex; i++) {
            days.push(<div key={`empty-${i}`} className="w-8 h-8" />);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const fullDate = new Date(year, month, day);
            const dateString = `${fullDate.getFullYear()}-${String(fullDate.getMonth() + 1).padStart(2, '0')}-${String(fullDate.getDate()).padStart(2, '0')}`;
            
            let statusClass = 'bg-gray-100 text-gray-700 hover:bg-gray-200';
            let title = '';
            const status = attendanceStatus.get(dateString);

            if (fullDate > today) {
                statusClass = 'bg-gray-50 text-gray-400'; // Future
                title = 'Future Date';
            } else if (status === 'present') {
                statusClass = 'bg-green-500 text-white font-bold shadow-sm';
                title = 'Present';
            } else if (status === 'absent') {
                statusClass = 'bg-red-500 text-white font-bold shadow-sm';
                title = 'Absent';
            } else if (!classAttendanceDates.has(dateString)) {
                statusClass = 'bg-yellow-100 text-yellow-800 font-bold';
                title = 'Holiday / No School';
            } else {
                title = 'No Data';
            }

            days.push(
                <div key={day} className={`w-8 h-8 flex items-center justify-center rounded-full text-xs transition-colors duration-200 ${statusClass}`} title={title}>
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
                
                {/* Tabs */}
                <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg mb-4 w-fit">
                    <button onClick={() => setActiveTab('info')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'info' ? 'bg-white text-primary shadow' : 'text-gray-600 hover:bg-gray-300'}`}>Profile Info</button>
                    <button onClick={() => setActiveTab('fees')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'fees' ? 'bg-white text-primary shadow' : 'text-gray-600 hover:bg-gray-300'}`}>Academic Fees</button>
                    <button onClick={() => setActiveTab('hostel')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'hostel' ? 'bg-white text-primary shadow' : 'text-gray-600 hover:bg-gray-300'}`}>Hostel Details</button>
                </div>

                {error && <div className="p-3 mb-4 text-sm bg-red-100 text-red-700 rounded-md flex-shrink-0">{error}</div>}
                
                <div className="overflow-y-auto pr-4 -mr-4 flex-1">
                    
                    {/* General Profile Section - Always Visible on Left for large screens */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white p-6 rounded-xl shadow-md text-center">
                                <img src={student.photo_url || `https://ui-avatars.com/api/?name=${student.name}&background=4f46e5&color=fff&size=128`} alt={student.name} className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-primary-dark shadow-lg"/>
                                <h3 className="text-2xl font-bold text-gray-900 mt-4">{student.name}</h3>
                                <p className="text-md text-gray-600">Class: {student.class || 'N/A'}</p>
                                <p className="text-sm text-gray-500 font-mono">Roll No: {student.roll_number || 'N/A'}</p>
                            </div>
                            
                            {activeTab === 'info' && (
                                <>
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
                                        {assignedDriver && (
                                            <>
                                                <div className="pt-2 border-t border-gray-100"></div>
                                                <div className="flex items-center gap-2 text-primary font-semibold">
                                                    <TransportIcon className="w-4 h-4"/> Transport Details
                                                </div>
                                                <InfoItem label="Driver Name" value={assignedDriver.name} />
                                                <InfoItem label="Van Number" value={assignedDriver.van_number} />
                                            </>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Right Content Area changes based on Tab */}
                        <div className="lg:col-span-2 space-y-6">
                            
                            {activeTab === 'info' && (
                                <div className="bg-white p-6 rounded-xl shadow-md">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-xl font-bold text-gray-800">Attendance ({currentYear})</h4>
                                        <button 
                                            onClick={() => setShowAllAttendance(!showAllAttendance)}
                                            className="text-sm text-primary hover:text-primary-dark underline"
                                        >
                                            {showAllAttendance ? 'Hide History' : 'Show More Attendance Records'}
                                        </button>
                                    </div>
                                    
                                    <div className="flex flex-wrap items-center gap-4 text-xs mb-4 text-gray-600 bg-gray-50 p-2 rounded-lg">
                                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-green-500 rounded-sm"></span>Present ({attendanceSummary.present})</span>
                                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-red-500 rounded-sm"></span>Absent ({attendanceSummary.absent})</span>
                                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-yellow-100 text-yellow-800 border border-yellow-200 rounded-sm"></span>Holiday</span>
                                    </div>

                                    {loadingAttendance ? <div className="flex justify-center items-center h-48"><Spinner size="10"/></div> :
                                    !student.roll_number ? <p className="text-center text-gray-500 py-10">Student has no roll number assigned. Cannot display attendance.</p> :
                                    (
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 transition-all duration-300">
                                            {(showAllAttendance ? monthNames : [monthNames[currentMonthIndex]]).map((name, i) => {
                                                const monthIdx = showAllAttendance ? i : currentMonthIndex;
                                                return (
                                                    <div key={name} className="border border-gray-100 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                                                        <h5 className="font-bold text-center mb-2 text-gray-700 border-b border-gray-100 pb-1">{name}</h5>
                                                        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-gray-400 mb-1">
                                                            <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                                                        </div>
                                                        <div className="grid grid-cols-7 gap-1">
                                                            {generateCalendarDays(currentYear, monthIdx)}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'fees' && (
                                <>
                                    <div className="bg-white p-6 rounded-xl shadow-md">
                                        <h4 className="text-xl font-bold text-gray-800 mb-4">Fee Records</h4>
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <FeeStatCard label="Monthly Fee" value={`₹${feeAmount.toLocaleString()}`} color="blue" />
                                            <FeeStatCard label="Previous Dues" value={`₹${(student.previous_dues || 0).toLocaleString()}`} color="orange" />
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
                                        <h4 className="info-header">Other Fees</h4>
                                        <div className="h-40 overflow-y-auto border border-gray-200 rounded-md">
                                            {(student.other_fees && student.other_fees.length > 0) ? (
                                                <table className="min-w-full text-sm">
                                                    <thead className="bg-gray-50 sticky top-0">
                                                        <tr>
                                                            <th className="p-2 text-left font-medium text-gray-500">Fee Name</th>
                                                            <th className="p-2 text-right font-medium text-gray-500">Amount</th>
                                                            <th className="p-2 text-center font-medium text-gray-500">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-200">
                                                        {student.other_fees.map((fee, index) => {
                                                            const key = `${fee.fees_name}-${fee.dues_date}`;
                                                            return (
                                                                <tr key={index}>
                                                                    <td className="p-2">{fee.fees_name}</td>
                                                                    <td className="p-2 text-right">₹{fee.amount.toLocaleString()}</td>
                                                                    <td className="p-2 text-center">
                                                                        {fee.paid_date ? (
                                                                            <span className="fee-badge bg-green-100 text-green-800">Paid</span>
                                                                        ) : (
                                                                            <button onClick={() => handlePayOtherFee(fee)} disabled={updatingOtherFee === key} className="px-2 py-0.5 text-xs text-white bg-blue-600 rounded hover:bg-blue-700 disabled:bg-gray-400">
                                                                                {updatingOtherFee === key ? <Spinner size="3" /> : 'Pay'}
                                                                            </button>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            ) : (
                                                <p className="text-center text-gray-500 p-4">No other fees found.</p>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}

                            {activeTab === 'hostel' && (
                                <div className="space-y-6">
                                    <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-indigo-500">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                                <HostelIcon className="w-6 h-6 text-indigo-600" />
                                                Hostel Details
                                            </h4>
                                            {hostelData && (
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${hostelData.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {hostelData.is_active ? 'ACTIVE RESIDENT' : 'EXITED'}
                                                </span>
                                            )}
                                        </div>
                                        
                                        {!hostelData ? (
                                            <div className="text-center py-10 bg-gray-50 rounded-lg">
                                                <p className="text-gray-500">This student has not been assigned to a hostel room.</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                                                    <p className="text-xs font-bold text-indigo-500 uppercase tracking-wide">Location</p>
                                                    <div className="mt-2 space-y-1">
                                                        <p className="text-lg font-bold text-gray-800">{hostelData.building_name}</p>
                                                        <p className="text-gray-600">{hostelData.floor_name}, Room <strong>{hostelData.room_no}</strong></p>
                                                    </div>
                                                </div>
                                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Timeline</p>
                                                    <div className="mt-2 space-y-1">
                                                        <p className="text-sm text-gray-700">Joined: <strong>{new Date(hostelData.joining_date).toLocaleDateString()}</strong></p>
                                                        {hostelData.exit_date && <p className="text-sm text-red-600">Exited: <strong>{new Date(hostelData.exit_date).toLocaleDateString()}</strong></p>}
                                                        <p className="text-sm text-gray-700">Monthly Rent: <strong>₹{hostelData.monthly_fee}</strong></p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {hostelData && (
                                        <>
                                            <div className="bg-white p-6 rounded-xl shadow-md">
                                                <h4 className="text-lg font-bold text-gray-800 mb-4">Hostel Fee Ledger</h4>
                                                
                                                <div className="grid grid-cols-2 gap-4 mb-4">
                                                    <div className="bg-green-50 p-3 rounded-lg text-center border border-green-100">
                                                        <p className="text-xs font-bold text-green-600 uppercase">Total Paid</p>
                                                        <p className="text-xl font-bold text-green-900">₹{hostelTotalPaid.toLocaleString()}</p>
                                                    </div>
                                                    <div className="bg-red-50 p-3 rounded-lg text-center border border-red-100">
                                                        <p className="text-xs font-bold text-red-600 uppercase">Total Due (Historical)</p>
                                                        <p className="text-xl font-bold text-red-900">₹{hostelTotalDues.toLocaleString()}</p>
                                                    </div>
                                                    <div className="bg-blue-50 p-3 rounded-lg text-center border border-blue-100 col-span-2">
                                                        <p className="text-xs font-bold text-blue-600 uppercase">Net Balance Pending</p>
                                                        <p className="text-xl font-bold text-blue-900">₹{hostelBalance.toLocaleString()}</p>
                                                    </div>
                                                </div>

                                                <div className="overflow-x-auto border border-gray-200 rounded-lg max-h-60 overflow-y-auto mb-6">
                                                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                                                        <thead className="bg-gray-50 sticky top-0">
                                                            <tr>
                                                                <th className="px-4 py-2 text-left font-medium text-gray-500">Description / Month</th>
                                                                <th className="px-4 py-2 text-right font-medium text-gray-500">Amount</th>
                                                                <th className="px-4 py-2 text-center font-medium text-gray-500">Type</th>
                                                                <th className="px-4 py-2 text-right font-medium text-gray-500">Date</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                            {hostelData.fee_records && hostelData.fee_records.length > 0 ? (
                                                                hostelData.fee_records.map((rec, idx) => (
                                                                    <tr key={idx}>
                                                                        <td className="px-4 py-2 font-medium">{rec.description || rec.month}</td>
                                                                        <td className="px-4 py-2 text-right">₹{rec.amount}</td>
                                                                        <td className="px-4 py-2 text-center">
                                                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${rec.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                                                {rec.status}
                                                                            </span>
                                                                        </td>
                                                                        <td className="px-4 py-2 text-right text-gray-500">
                                                                            {rec.paid_date ? new Date(rec.paid_date).toLocaleDateString() : '-'}
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            ) : (
                                                                <tr>
                                                                    <td colSpan={4} className="px-4 py-4 text-center text-gray-500">No fee records found.</td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>

                                                {/* Manual Payment Section */}
                                                <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <h5 className="font-bold text-gray-700 mb-2">Record Payment</h5>
                                                        <div className="flex flex-col gap-2">
                                                            <input 
                                                                type="text" placeholder="Description (e.g. Partial Payment)" 
                                                                value={hostelPayDesc} onChange={e => setHostelPayDesc(e.target.value)}
                                                                className="border p-2 rounded text-sm w-full"
                                                            />
                                                            <div className="flex gap-2">
                                                                <input 
                                                                    type="number" placeholder="Amount" 
                                                                    value={hostelPayAmount} onChange={e => setHostelPayAmount(e.target.value)}
                                                                    className="border p-2 rounded text-sm flex-1"
                                                                />
                                                                <button onClick={() => handleAddHostelRecord('Paid')} disabled={isHostelProcessing} className="bg-green-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-green-700 disabled:opacity-50">
                                                                    Pay
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h5 className="font-bold text-gray-700 mb-2">Add Due / Charge</h5>
                                                        <div className="flex flex-col gap-2">
                                                            <input 
                                                                type="text" placeholder="Description (e.g. Damage Fine)" 
                                                                value={hostelDueDesc} onChange={e => setHostelDueDesc(e.target.value)}
                                                                className="border p-2 rounded text-sm w-full"
                                                            />
                                                            <div className="flex gap-2">
                                                                <input 
                                                                    type="number" placeholder="Amount" 
                                                                    value={hostelDueAmount} onChange={e => setHostelDueAmount(e.target.value)}
                                                                    className="border p-2 rounded text-sm flex-1"
                                                                />
                                                                <button onClick={() => handleAddHostelRecord('Due')} disabled={isHostelProcessing} className="bg-red-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-red-700 disabled:opacity-50">
                                                                    Add Due
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

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

const FeeStatCard = ({ label, value, color }: { label: string, value: string, color: 'blue'|'green'|'red'|'orange' }) => {
    const colors = {
        blue: 'bg-blue-50 text-blue-800',
        green: 'bg-green-50 text-green-800',
        red: 'bg-red-50 text-red-800',
        orange: 'bg-orange-50 text-orange-800',
    };
    return (
        <div className={`p-3 rounded-lg text-center ${colors[color]}`}>
            <p className="text-xs font-medium uppercase">{label}</p>
            <p className="text-xl font-bold">{value}</p>
        </div>
    );
}


export default StudentProfileModal;
