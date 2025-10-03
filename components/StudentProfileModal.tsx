import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { Student, Class, Attendance } from '../types';
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


const StudentProfileModal: React.FC<StudentProfileModalProps> = ({ student, classes, onClose }) => {
    const [updatingFee, setUpdatingFee] = useState<string | null>(null);
    const [attendanceStatus, setAttendanceStatus] = useState<Map<string, 'present' | 'absent'>>(new Map());
    const [loadingAttendance, setLoadingAttendance] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const currentYear = new Date().getFullYear();

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

    const handleMarkAsPaid = async (month: keyof Student) => {
        setUpdatingFee(month);
        setError(null);
        const updateData = { [month]: new Date().toISOString() };

        const { error } = await supabase.from('students').update(updateData).eq('id', student.id);
        if (error) {
            setError(`Failed to update fee: ${error.message}`);
        }
        setUpdatingFee(null);
    };

    const studentClassInfo = classes.find(c => c.class_name === student.class);
    const feeAmount = studentClassInfo?.school_fees || 0;

    const { totalDues, totalPaid } = months.reduce((acc, month) => {
        const status = student[month];
        if (status === 'Dues') {
            acc.totalDues += feeAmount;
        } else if (status && status !== 'undefined') {
            acc.totalPaid += feeAmount;
        }
        return acc;
    }, { totalDues: 0, totalPaid: 0 });

    const renderFeeStatus = (month: keyof Student) => {
        const status = student[month];
        if (status === 'undefined' || !status) return <span className="fee-badge bg-gray-200 text-gray-800">Pending</span>;
        if (status === 'Dues') return (
            <div className="flex items-center gap-2">
                <span className="fee-badge bg-red-100 text-red-800">Dues</span>
                <button 
                    onClick={() => handleMarkAsPaid(month)}
                    disabled={!!updatingFee}
                    className="px-2 py-0.5 text-xs text-white bg-green-600 rounded hover:bg-green-700 disabled:bg-gray-400"
                >
                    {updatingFee === month ? <Spinner size="3" /> : 'Pay'}
                </button>
            </div>
        );
        return <span className="fee-badge bg-green-100 text-green-800" title={`Paid on ${new Date(status).toLocaleDateString()}`}>Paid</span>;
    };
    
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
                                    <FeeStatCard label="Total Paid" value={`₹${totalPaid.toLocaleString()}`} color="green" />
                                    <FeeStatCard label="Total Dues" value={`₹${totalDues.toLocaleString()}`} color="red" />
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
                                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-green-500 rounded-sm"></span>Present</span>
                                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-red-500 rounded-sm"></span>Absent</span>
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
                .fee-badge { padding: 0.125rem 0.5rem; font-size: 0.75rem; font-weight: 500; border-radius: 9999px; }
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
