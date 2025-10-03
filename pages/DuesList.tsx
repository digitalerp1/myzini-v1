
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { Student, Class } from '../types';
import Spinner from '../components/Spinner';
import RupeeIcon from '../components/icons/RupeeIcon';

interface StudentWithDues extends Student {
    dueAmount: number;
}

interface DuesData {
    [className: string]: {
        students: StudentWithDues[];
        totalDues: number;
    }
}

const months: (keyof Student)[] = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

const DuesList: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [duesData, setDuesData] = useState<DuesData>({});
    const [selectedClass, setSelectedClass] = useState<string | null>(null);

    const processDuesData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [studentsRes, classesRes] = await Promise.all([
                supabase.from('students').select('*'),
                supabase.from('classes').select('*')
            ]);

            if (studentsRes.error) throw studentsRes.error;
            if (classesRes.error) throw classesRes.error;

            const students: Student[] = studentsRes.data;
            const classes: Class[] = classesRes.data;
            const classFeesMap = new Map(classes.map(c => [c.class_name, c.school_fees || 0]));
            
            const aggregatedDues: DuesData = {};

            for (const student of students) {
                if (!student.class) continue;

                const fee = classFeesMap.get(student.class) || 0;
                if (fee === 0) continue;

                const duesMonths = months.filter(month => student[month] === 'Dues').length;

                if (duesMonths > 0) {
                    const dueAmount = duesMonths * fee;
                    if (!aggregatedDues[student.class]) {
                        aggregatedDues[student.class] = { students: [], totalDues: 0 };
                    }
                    aggregatedDues[student.class].students.push({ ...student, dueAmount });
                    aggregatedDues[student.class].totalDues += dueAmount;
                }
            }
            setDuesData(aggregatedDues);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        processDuesData();
    }, [processDuesData]);
    
    if (loading) {
        return <div className="flex justify-center items-center h-96"><Spinner size="12" /></div>;
    }

    if (error) {
        return <div className="text-center text-red-500 bg-red-100 p-4 rounded-lg">Error loading dues data: {error}</div>;
    }

    if (selectedClass && duesData[selectedClass]) {
        const { students } = duesData[selectedClass];
        return (
            <div className="bg-white p-8 rounded-xl shadow-lg">
                <div className="flex items-center mb-6">
                    <button onClick={() => setSelectedClass(null)} className="mr-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">
                        &larr; Back
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800">
                        Dues for Class <span className="text-primary">{selectedClass}</span>
                    </h1>
                </div>
                 <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photo</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No.</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                                <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Due</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {students.map(student => (
                                <tr key={student.id}>
                                    <td className="py-2 px-4">
                                        <img src={student.photo_url || `https://ui-avatars.com/api/?name=${student.name}&background=random`} alt={student.name} className="w-12 h-12 rounded-full object-cover"/>
                                    </td>
                                    <td className="py-4 px-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                                    <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">{student.roll_number || 'N/A'}</td>
                                    <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">{student.mobile || 'N/A'}</td>
                                    <td className="py-4 px-4 whitespace-nowrap text-sm font-bold text-red-600 text-right">₹{student.dueAmount.toLocaleString('en-IN')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Fee Dues Summary</h1>
            
            {Object.keys(duesData).length === 0 ? (
                <div className="bg-white p-8 rounded-xl shadow-lg text-center text-gray-500">
                    <h2 className="text-2xl font-semibold text-green-600">All Clear!</h2>
                    <p className="mt-2">No pending student fee dues found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Fix: Use Object.keys to iterate over duesData for correct type inference. */}
                    {Object.keys(duesData).map((className) => {
                        const data = duesData[className];
                        return (
                            <div key={className} onClick={() => setSelectedClass(className)} className="bg-white p-6 rounded-xl shadow-lg cursor-pointer hover:shadow-xl hover:border-primary border-2 border-transparent transition-all transform hover:-translate-y-1">
                                <h2 className="text-2xl font-bold text-gray-800">{className}</h2>
                                <div className="mt-4 space-y-3 text-gray-600">
                                    <div className="flex justify-between items-center">
                                        <span>Students with Dues:</span>
                                        <span className="font-bold text-lg text-red-500">{data.students.length}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Total Amount Due:</span>
                                        <span className="font-bold text-lg text-red-500">₹{data.totalDues.toLocaleString('en-IN')}</span>
                                    </div>
                                </div>
                                <div className="mt-4 text-right text-sm text-primary font-semibold">
                                    View Details &rarr;
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default DuesList;
