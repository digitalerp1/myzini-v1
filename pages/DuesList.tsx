
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { Student, Class, FeeType } from '../types';
import Spinner from '../components/Spinner';
import StudentProfileModal from '../components/StudentProfileModal';

interface StudentWithDues extends Student {
    dueAmount: number;
}

const months: (keyof Student)[] = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

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


const DuesList: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [allStudents, setAllStudents] = useState<Student[]>([]); // Store raw student data
    const [filteredStudents, setFilteredStudents] = useState<StudentWithDues[]>([]);
    
    const [classes, setClasses] = useState<Class[]>([]);
    const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
    const [filter, setFilter] = useState('all');

    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [studentsRes, classesRes, feesRes] = await Promise.all([
                supabase.from('students').select('*'),
                supabase.from('classes').select('*'),
                supabase.from('fees_types').select('*')
            ]);

            if (studentsRes.error) throw studentsRes.error;
            if (classesRes.error) throw classesRes.error;
            if (feesRes.error) throw feesRes.error;

            setAllStudents(studentsRes.data);
            setClasses(classesRes.data);
            setFeeTypes(feesRes.data as FeeType[]);
            
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
                // Case 1: Total Dues (Previous + All Months + All Other Fees)
                calculatedDue += (student.previous_dues || 0);
                
                // Monthly
                months.forEach(month => {
                    const status = student[month];
                    // Consider it due if it's explicitly 'Dues', or part paid, or 'undefined' (meaning not updated yet but technically due if implied)
                    // To be safe and cleaner, we usually calculate dues based on explicit 'Dues' status or partial payment.
                    // If status is undefined/null, we assume it hasn't been processed yet, so maybe exclude? 
                    // For "All Dues", let's include explicit Dues and Partial.
                    if (status && status !== 'undefined') {
                        const paidAmountRaw = parsePaidAmount(String(status));
                        const paidAmount = paidAmountRaw === Infinity ? classFee : paidAmountRaw;
                        if (paidAmount < classFee) {
                            calculatedDue += (classFee - paidAmount);
                        }
                    }
                });

                // Other Fees
                if(student.other_fees) {
                    student.other_fees.forEach(otherFee => {
                        if(!otherFee.paid_date) calculatedDue += otherFee.amount;
                    });
                }

            } else if (filter.startsWith('month:')) {
                // Case 2: Specific Month Dues
                const month = filter.split(':')[1] as keyof Student;
                const status = student[month];
                
                if (status && status !== 'undefined') {
                    const paidAmountRaw = parsePaidAmount(String(status));
                    const paidAmount = paidAmountRaw === Infinity ? classFee : paidAmountRaw;
                    if (paidAmount < classFee) {
                        calculatedDue = classFee - paidAmount;
                    }
                } else if (status === 'Dues') {
                     calculatedDue = classFee;
                }

            } else if (filter.startsWith('other:')) {
                // Case 3: Specific Other Fee
                const feeName = filter.split(':')[1];
                if(student.other_fees) {
                    const feeObj = student.other_fees.find(f => f.fees_name === feeName && !f.paid_date);
                    if (feeObj) {
                        calculatedDue = feeObj.amount;
                    }
                }
            }

            // Only add to list if there is a due amount for the selected filter
            if (calculatedDue > 0) {
                studentsWithCalculatedDues.push({ ...student, dueAmount: calculatedDue });
            }
        });

        setFilteredStudents(studentsWithCalculatedDues);

    }, [filter, allStudents, classes]);

    const handleViewProfile = (student: Student) => {
        setSelectedStudent(student);
        setIsProfileModalOpen(true);
    };

    const closeModal = () => {
        setIsProfileModalOpen(false);
        setSelectedStudent(null);
        fetchData(); // Refresh data after potential payments in modal
    }
    
    if (loading) {
        return <div className="flex justify-center items-center h-96"><Spinner size="12" /></div>;
    }

    if (error) {
        return <div className="text-center text-red-500 bg-red-100 p-4 rounded-lg">Error loading dues data: {error}</div>;
    }

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-6">
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
                                <th className="th">Mobile</th>
                                <th className="th text-right bg-red-50 text-red-700">
                                    {filter === 'all' ? 'Total Outstanding' : 'Due Amount'}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredStudents.map(student => (
                                <tr key={student.id} onClick={() => handleViewProfile(student)} className="hover:bg-indigo-50 cursor-pointer transition-colors">
                                    <td className="td font-bold text-gray-800">{student.name}</td>
                                    <td className="td">{student.class || 'N/A'}</td>
                                    <td className="td">{student.roll_number || 'N/A'}</td>
                                    <td className="td text-gray-500">{student.father_name}</td>
                                    <td className="td">{student.mobile || 'N/A'}</td>
                                    <td className="td font-bold text-red-600 text-right text-lg">₹{student.dueAmount.toLocaleString('en-IN')}</td>
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
                .td { padding: 1rem; font-size: 0.875rem; white-space: nowrap; }
            `}</style>
        </div>
    );
};

export default DuesList;
