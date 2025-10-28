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
    const [allStudentsWithDues, setAllStudentsWithDues] = useState<StudentWithDues[]>([]);
    const [filteredStudents, setFilteredStudents] = useState<StudentWithDues[]>([]);
    
    const [classes, setClasses] = useState<Class[]>([]);
    const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
    const [filter, setFilter] = useState('all');

    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    const processDuesData = useCallback(async () => {
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

            const students: Student[] = studentsRes.data;
            const classesData: Class[] = classesRes.data;
            setClasses(classesData);
            setFeeTypes(feesRes.data as FeeType[]);
            
            const classFeesMap = new Map(classesData.map(c => [c.class_name, c.school_fees || 0]));
            
            const studentsWithDues: StudentWithDues[] = [];

            for (const student of students) {
                let studentTotalDues = 0;
                
                // Monthly fees
                const fee = classFeesMap.get(student.class || '') || 0;
                if (fee > 0) {
                     months.forEach(month => {
                        const status = student[month];
                        if (status && status !== 'undefined') {
                            const paidAmountRaw = parsePaidAmount(String(status));
                            const paidAmount = paidAmountRaw === Infinity ? fee : paidAmountRaw;
                            if (paidAmount < fee) {
                                studentTotalDues += (fee - paidAmount);
                            }
                        }
                    });
                }
               
                // Other fees
                if(student.other_fees) {
                    student.other_fees.forEach(otherFee => {
                        if(!otherFee.paid_date) {
                            studentTotalDues += otherFee.amount;
                        }
                    });
                }

                if (studentTotalDues > 0) {
                    studentsWithDues.push({ ...student, dueAmount: studentTotalDues });
                }
            }
            setAllStudentsWithDues(studentsWithDues);
            setFilteredStudents(studentsWithDues);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        processDuesData();
    }, [processDuesData]);

    useEffect(() => {
        if (filter === 'all') {
            setFilteredStudents(allStudentsWithDues);
            return;
        }
        
        const [type, value] = filter.split(':');
        const classFeesMap = new Map(classes.map(c => [c.class_name, c.school_fees || 0]));

        const filtered = allStudentsWithDues.filter(student => {
            if (type === 'month') {
                const fee = classFeesMap.get(student.class || '') || 0;
                const status = student[value as keyof Student];
                const paidAmountRaw = parsePaidAmount(String(status));
                const paidAmount = paidAmountRaw === Infinity ? fee : paidAmountRaw;
                return paidAmount < fee;
            }
            if (type === 'other') {
                return student.other_fees?.some(f => f.fees_name === value && !f.paid_date);
            }
            return false;
        });

        setFilteredStudents(filtered);

    }, [filter, allStudentsWithDues, classes]);

    const handleViewProfile = (student: Student) => {
        setSelectedStudent(student);
        setIsProfileModalOpen(true);
    };

    const closeModal = () => {
        setIsProfileModalOpen(false);
        setSelectedStudent(null);
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
                <h1 className="text-3xl font-bold text-gray-800">Fee Dues Report</h1>
                <div>
                    <label htmlFor="filter" className="text-sm font-medium mr-2">Filter by:</label>
                    <select id="filter" value={filter} onChange={e => setFilter(e.target.value)} className="input-field">
                        <option value="all">All Dues</option>
                        <optgroup label="Monthly Tuition">
                            {months.map(m => <option key={m} value={`month:${m}`} className="capitalize">{m}</option>)}
                        </optgroup>
                        <optgroup label="Other Fees">
                            {feeTypes.map(f => <option key={f.id} value={`other:${f.fees_name}`}>{f.fees_name}</option>)}
                        </optgroup>
                    </select>
                </div>
            </div>

            {filteredStudents.length === 0 ? (
                <div className="text-center text-gray-500 py-20">
                    <h2 className="text-2xl font-semibold text-green-600">All Clear!</h2>
                    <p className="mt-2">No students found with dues for the selected filter.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="th">Name</th>
                                <th className="th">Class</th>
                                <th className="th">Roll No.</th>
                                <th className="th">Mobile</th>
                                <th className="th text-right">Total Amount Due</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredStudents.map(student => (
                                <tr key={student.id} onClick={() => handleViewProfile(student)} className="hover:bg-gray-50 cursor-pointer">
                                    <td className="td font-medium">{student.name}</td>
                                    <td className="td">{student.class || 'N/A'}</td>
                                    <td className="td">{student.roll_number || 'N/A'}</td>
                                    <td className="td">{student.mobile || 'N/A'}</td>
                                    <td className="td font-bold text-red-600 text-right">₹{student.dueAmount.toLocaleString('en-IN')}</td>
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
                    padding: 0.5rem 1rem; border: 1px solid #d1d5db; border-radius: 0.375rem;
                }
                .th { padding: 0.75rem 1rem; text-align: left; font-size: 0.75rem; font-weight: 500; color: #6B7280; text-transform: uppercase; }
                .td { padding: 1rem 1rem; font-size: 0.875rem; white-space: nowrap; }
            `}</style>
        </div>
    );
};

export default DuesList;