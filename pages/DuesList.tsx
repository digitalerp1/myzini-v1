
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
    if (!status || status === 'undefined' || status === 'Dues') {
        return 0;
    }
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(status)) {
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


const DuesList: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [allStudents, setAllStudents] = useState<Student[]>([]); 
    const [filteredStudents, setFilteredStudents] = useState<StudentWithDues[]>([]);
    const [schoolProfile, setSchoolProfile] = useState<OwnerProfile | null>(null);
    
    const [classes, setClasses] = useState<Class[]>([]);
    const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
    const [filter, setFilter] = useState('all');

    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const [studentsRes, classesRes, feesRes, profileRes] = await Promise.all([
                supabase.from('students').select('*'),
                supabase.from('classes').select('*'),
                supabase.from('fees_types').select('*'),
                supabase.from('owner').select('*').eq('uid', user.id).single()
            ]);

            if (studentsRes.error) throw studentsRes.error;
            if (classesRes.error) throw classesRes.error;
            if (feesRes.error) throw feesRes.error;

            setAllStudents(studentsRes.data);
            setClasses(classesRes.data);
            setFeeTypes(feesRes.data as FeeType[]);
            setSchoolProfile(profileRes.data);
            
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Logic to process dues based on the selected filter
    useEffect(() => {
        if (allStudents.length === 0) return;

        const classFeesMap = new Map<string, number>(classes.map(c => [c.class_name, c.school_fees || 0]));
        const studentsWithCalculatedDues: StudentWithDues[] = [];

        allStudents.forEach(student => {
            let calculatedDue = 0;
            const classFee = classFeesMap.get(student.class || '') || 0;

            if (filter === 'all') {
                calculatedDue += (student.previous_dues || 0);
                
                months.forEach(month => {
                    const status = student[month];
                    if (!status || status === 'undefined') return; 

                    if (status === 'Dues') {
                        calculatedDue += classFee;
                    } else {
                        const paidAmount = parsePaidAmount(String(status));
                        const actualPaid = paidAmount === Infinity ? classFee : paidAmount;
                        if (actualPaid < classFee) {
                            calculatedDue += (classFee - actualPaid);
                        }
                    }
                });

                if(student.other_fees) {
                    student.other_fees.forEach(otherFee => {
                        if(!otherFee.paid_date) calculatedDue += otherFee.amount;
                    });
                }

            } else if (filter.startsWith('month:')) {
                const month = filter.split(':')[1] as keyof Student;
                const status = student[month];
                
                if (status && status !== 'undefined') {
                    if (status === 'Dues') {
                        calculatedDue = classFee;
                    } else {
                        const paidAmount = parsePaidAmount(String(status));
                        const actualPaid = paidAmount === Infinity ? classFee : paidAmount;
                        if (actualPaid < classFee) {
                            calculatedDue = classFee - actualPaid;
                        }
                    }
                }

            } else if (filter.startsWith('other:')) {
                const feeName = filter.split(':')[1];
                if(student.other_fees) {
                    const feeObj = student.other_fees.find(f => f.fees_name === feeName && !f.paid_date);
                    if (feeObj) {
                        calculatedDue = feeObj.amount;
                    }
                }
            }

            if (calculatedDue > 0) {
                studentsWithCalculatedDues.push({ ...student, dueAmount: calculatedDue });
            }
        });

        studentsWithCalculatedDues.sort((a,b) => b.dueAmount - a.dueAmount);
        setFilteredStudents(studentsWithCalculatedDues);

    }, [filter, allStudents, classes]);

    const sendWhatsApp = (student: StudentWithDues) => {
        if (!student.mobile) {
            alert("Mobile number not found for this student.");
            return;
        }

        const classFeesMap = new Map<string, number>(classes.map(c => [c.class_name, c.school_fees || 0]));
        const classFee = classFeesMap.get(student.class || '') || 0;
        const schoolName = schoolProfile?.school_name || "Our School";
        
        let message = `*FEE DUES NOTICE*\n`;
        message += `*${schoolName}*\n\n`;
        message += `Dear Parent,\nThis is a friendly reminder regarding the fee status of your child:\n`;
        message += `*Name:* ${student.name}\n`;
        message += `*Class:* ${student.class}\n`;
        message += `*Roll No:* ${student.roll_number}\n\n`;
        
        message += `*--- MONTHLY BREAKDOWN ---*\n`;
        
        let totalPaid = 0;
        let foundRecords = false;

        months.forEach((month, index) => {
            const status = student[month];
            if (!status || status === 'undefined') return;
            foundRecords = true;

            const paidAmountRaw = parsePaidAmount(String(status));
            const paidAmount = paidAmountRaw === Infinity ? classFee : paidAmountRaw;
            const dueAmount = classFee - paidAmount;
            
            totalPaid += paidAmount;

            if (dueAmount > 0) {
                message += `• *${monthNames[index]}*: Paid ₹${paidAmount}, *Due ₹${dueAmount}*\n`;
            } else {
                message += `• *${monthNames[index]}*: Paid ₹${paidAmount} (Fully Paid)\n`;
            }
        });

        if (!foundRecords) message += `_No monthly fees recorded yet._\n`;

        if (student.previous_dues && student.previous_dues > 0) {
            message += `\n*Arrears (Previous Dues):* ₹${student.previous_dues}\n`;
        }

        const unpaidOtherFees = student.other_fees?.filter(f => !f.paid_date) || [];
        if (unpaidOtherFees.length > 0) {
            message += `\n*Other Dues:*\n`;
            unpaidOtherFees.forEach(f => {
                message += `• ${f.fees_name}: ₹${f.amount}\n`;
            });
        }

        message += `\n*--- SUMMARY ---*\n`;
        message += `*Total Paid YTD:* ₹${totalPaid}\n`;
        message += `*TOTAL OUTSTANDING:* ₹${student.dueAmount}\n\n`;
        message += `Please clear the dues as soon as possible. Thank you.\n`;
        message += `_Contact Office: ${schoolProfile?.mobile_number || ''}_`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${student.mobile.replace(/\D/g, '')}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
    };

    const handleViewProfile = (student: Student) => {
        setSelectedStudent(student);
        setIsProfileModalOpen(true);
    };

    const closeModal = () => {
        setIsProfileModalOpen(false);
        setSelectedStudent(null);
        fetchData();
    }
    
    if (loading) {
        return <div className="flex justify-center items-center h-96"><Spinner size="12" /></div>;
    }

    if (error) {
        return <div className="text-center text-red-500 bg-red-100 p-4 rounded-lg">Error loading dues data: {error}</div>;
    }

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-gray-800">Fee Dues List</h1>
                <div className="flex items-center gap-2">
                    <label htmlFor="filter" className="text-sm font-medium text-gray-700">Showing Dues For:</label>
                    <select id="filter" value={filter} onChange={e => setFilter(e.target.value)} className="input-field border-primary text-primary font-semibold">
                        <option value="all">Everything (Total Dues)</option>
                        <optgroup label="Specific Month">
                            {months.map(m => <option key={m} value={`month:${m}`} className="capitalize">{m}</option>)}
                        </optgroup>
                        <optgroup label="Specific Fee Type">
                            {feeTypes.map(f => <option key={f.id} value={`other:${f.fees_name}`}>{f.fees_name}</option>)}
                        </optgroup>
                    </select>
                </div>
            </div>

            {filteredStudents.length === 0 ? (
                <div className="text-center text-gray-500 py-20 bg-green-50 rounded-lg border border-green-100">
                    <h2 className="text-2xl font-bold text-green-600">All Clear!</h2>
                    <p className="mt-2 text-green-800">No pending dues found for the selected category.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="th">Name</th>
                                <th className="th">Class</th>
                                <th className="th">Roll No.</th>
                                <th className="th">Father's Name</th>
                                <th className="th text-right bg-red-50 text-red-700">
                                    {filter === 'all' ? 'Total Outstanding' : 'Due Amount'}
                                </th>
                                <th className="th text-center">Notify</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredStudents.map(student => (
                                <tr key={student.id} className="hover:bg-indigo-50 transition-colors group">
                                    <td className="td font-bold text-gray-800 cursor-pointer" onClick={() => handleViewProfile(student)}>{student.name}</td>
                                    <td className="td cursor-pointer" onClick={() => handleViewProfile(student)}>{student.class || 'N/A'}</td>
                                    <td className="td cursor-pointer" onClick={() => handleViewProfile(student)}>{student.roll_number || 'N/A'}</td>
                                    <td className="td text-gray-500 cursor-pointer" onClick={() => handleViewProfile(student)}>{student.father_name}</td>
                                    <td className="td font-bold text-red-600 text-right text-lg cursor-pointer" onClick={() => handleViewProfile(student)}>₹{student.dueAmount.toLocaleString('en-IN')}</td>
                                    <td className="td text-center">
                                        <button 
                                            onClick={() => sendWhatsApp(student)}
                                            className="p-2 bg-emerald-100 text-emerald-700 rounded-full hover:bg-emerald-600 hover:text-white transition-all transform hover:scale-110 shadow-sm"
                                            title="Send detailed dues summary on WhatsApp"
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 448 512">
                                                <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.4 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.1-16.4-14.6-27.4-32.6-30.6-38.1-3.2-5.6-.3-8.6 2.5-11.4 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.3 3.7-5.5 5.5-9.2 1.9-3.7 1-6.9-.5-9.7-1.4-2.8-12.4-29.9-17-41.1-4.5-10.9-9.1-9.3-12.4-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.8 23.5 9.2 31.6 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {isProfileModalOpen && selectedStudent && (
                 <StudentProfileModal 
                    student={selectedStudent}
                    classes={classes}
                    onClose={closeModal}
                 />
            )}
            <style>{`
                .input-field {
                    padding: 0.5rem 1rem; border: 2px solid #e5e7eb; border-radius: 0.375rem; outline: none;
                }
                .th { padding: 1rem; text-align: left; font-size: 0.75rem; font-weight: 700; color: #4b5563; text-transform: uppercase; letter-spacing: 0.05em; }
                .td { padding: 1rem 1rem; font-size: 0.875rem; white-space: nowrap; }
            `}</style>
        </div>
    );
};

export default DuesList;
