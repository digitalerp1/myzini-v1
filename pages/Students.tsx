
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { Student as StudentType, Class } from '../types';
import Spinner from '../components/Spinner';
import StudentModal from '../components/StudentModal';
import StudentProfileModal from '../components/StudentProfileModal';
import EditIcon from '../components/icons/EditIcon';
import DeleteIcon from '../components/icons/DeleteIcon';
import ViewIcon from '../components/icons/ViewIcon';
import DownloadIcon from '../components/icons/DownloadIcon';
import PlusIcon from '../components/icons/PlusIcon';

const Students: React.FC = () => {
    const [students, setStudents] = useState<StudentType[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<StudentType | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterClass, setFilterClass] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        const { data: classesData } = await supabase.from('classes').select('*').order('class_name');
        if (classesData) setClasses(classesData);

        let query = supabase.from('students').select('*');
        if (filterClass) query = query.eq('class', filterClass);
        if (searchTerm) query = query.ilike('name', `%${searchTerm}%`);

        const { data: studentsData } = await query;
        if (studentsData) {
            // Natural sort by Roll Number
            const sorted = (studentsData as StudentType[]).sort((a, b) => {
                return (a.roll_number || '').localeCompare(b.roll_number || '', undefined, { numeric: true, sensitivity: 'base' });
            });
            setStudents(sorted);
        }
        setLoading(false);
    }, [filterClass, searchTerm]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const closeModal = () => {
        setIsModalOpen(false);
        setIsProfileModalOpen(false);
        setSelectedStudent(null);
        fetchData();
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Student Directory</h1>
                <button onClick={() => setIsModalOpen(true)} className="px-5 py-2.5 bg-primary text-white font-semibold rounded-md flex items-center gap-2"><PlusIcon /> Admission</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <input type="search" placeholder="Search name or roll..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} className="md:col-span-2 px-3 py-2 border rounded-md"/>
                <select value={filterClass} onChange={e=>setFilterClass(e.target.value)} className="px-3 py-2 border rounded-md">
                    <option value="">All Classes</option>
                    {classes.map(c => <option key={c.id} value={c.class_name}>{c.class_name}</option>)}
                </select>
            </div>

            {loading ? <div className="flex justify-center py-20"><Spinner size="12" /></div> : (
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                            <tr>
                                <th className="py-3 px-4 text-left">Roll</th>
                                <th className="py-3 px-4 text-left">Student</th>
                                <th className="py-3 px-4 text-left">Class</th>
                                <th className="py-3 px-4 text-left">Disc.</th>
                                <th className="py-3 px-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-sm">
                            {students.map(s => (
                                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-4 px-4 font-mono font-bold text-primary">{s.roll_number || '-'}</td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            <img src={s.photo_url || `https://ui-avatars.com/api/?name=${s.name}`} className="w-8 h-8 rounded-full object-cover border"/>
                                            <span className="font-bold text-gray-900">{s.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-gray-500">{s.class}</td>
                                    <td className="py-4 px-4"><span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-black">{s.discount || 0}%</span></td>
                                    <td className="py-4 px-4 text-center">
                                        <div className="flex justify-center gap-3">
                                            <button onClick={()=>{setSelectedStudent(s); setIsProfileModalOpen(true);}} className="text-blue-600"><ViewIcon/></button>
                                            <button onClick={()=>{setSelectedStudent(s); setIsModalOpen(true);}} className="text-indigo-600"><EditIcon/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isModalOpen && <StudentModal student={selectedStudent} classes={classes} onClose={closeModal} onSave={closeModal} />}
            {isProfileModalOpen && selectedStudent && <StudentProfileModal student={selectedStudent} classes={classes} onClose={closeModal} />}
        </div>
    );
};

export default Students;
