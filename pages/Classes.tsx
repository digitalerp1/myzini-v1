
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { Subject, Class, Assignment, Staff } from '../types';
import Spinner from '../components/Spinner';
import EditIcon from '../components/icons/EditIcon';
import DeleteIcon from '../components/icons/DeleteIcon';

type ModalType = 'SUBJECT' | 'CLASS' | 'ASSIGNMENT' | null;

const Classes: React.FC = () => {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [staffList, setStaffList] = useState<Staff[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [modal, setModal] = useState<ModalType>(null);
    const [selectedItem, setSelectedItem] = useState<Subject | Class | Assignment | null>(null);
    const [formState, setFormState] = useState<any>({});
    const [saving, setSaving] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [subjectsRes, classesRes, assignmentsRes, staffRes] = await Promise.all([
                supabase.from('subjects').select('*').order('subject_name'),
                supabase.from('classes').select('*').order('class_name'),
                supabase.from('assign_class').select('*'),
                // FIX: Select all staff fields to match the Staff type.
                supabase.from('staff').select('*').order('name')
            ]);

            if (subjectsRes.error) throw subjectsRes.error;
            if (classesRes.error) throw classesRes.error;
            if (assignmentsRes.error) throw assignmentsRes.error;
            if (staffRes.error) throw staffRes.error;

            setSubjects(subjectsRes.data);
            setClasses(classesRes.data);
            setAssignments(assignmentsRes.data);
            setStaffList(staffRes.data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();

        const channel = supabase.channel('public-class-management')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'subjects' }, () => loadData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'classes' }, () => loadData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'assign_class' }, () => loadData())
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [loadData]);

    const openModal = (type: ModalType, item: any = null) => {
        setModal(type);
        setSelectedItem(item);
        setFormState(item || {});
    };

    const closeModal = () => {
        setModal(null);
        setSelectedItem(null);
        setFormState({});
        setError(null);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        let tableName = '';
        let dataToSave = { ...formState };
        delete dataToSave.id;

        switch (modal) {
            case 'SUBJECT':
                tableName = 'subjects';
                break;
            case 'CLASS':
                tableName = 'classes';
                if (dataToSave.staff_id === '') dataToSave.staff_id = null;
                dataToSave.school_fees = Number(dataToSave.school_fees) || null;
                break;
            case 'ASSIGNMENT':
                tableName = 'assign_class';
                if (dataToSave.staff_id === '') dataToSave.staff_id = null;
                if (dataToSave.incoming_time === '') dataToSave.incoming_time = null;
                if (dataToSave.outgoing_time === '') dataToSave.outgoing_time = null;
                break;
            default:
                setSaving(false);
                return;
        }

        const { error } = selectedItem
            ? await supabase.from(tableName).update(dataToSave).eq('id', (selectedItem as any).id)
            : await supabase.from(tableName).insert(dataToSave);
        
        if (error) {
            setError(error.message);
        } else {
            closeModal();
        }
        setSaving(false);
    };
    
    const handleDelete = async (table: string, id: number) => {
        if(window.confirm('Are you sure you want to delete this item?')){
            await supabase.from(table).delete().eq('id', id);
        }
    }

    const renderModalContent = () => {
        switch (modal) {
            case 'SUBJECT':
                return (
                    <>
                        <div className="form-group full-width">
                            <label htmlFor="subject_name" className="block text-sm font-medium text-gray-700">Subject Name</label>
                            <input type="text" id="subject_name" name="subject_name" value={formState.subject_name || ''} onChange={handleFormChange} required className="mt-1 input-field"/>
                        </div>
                    </>
                );
            case 'CLASS':
                return (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-group">
                            <label htmlFor="class_name" className="block text-sm font-medium text-gray-700">Class Name</label>
                            <input type="text" id="class_name" name="class_name" value={formState.class_name || ''} onChange={handleFormChange} required className="mt-1 input-field"/>
                        </div>
                        <div className="form-group">
                            <label htmlFor="school_fees" className="block text-sm font-medium text-gray-700">School Fees</label>
                            <input type="number" id="school_fees" name="school_fees" value={formState.school_fees || ''} onChange={handleFormChange} placeholder="e.g., 500" className="mt-1 input-field"/>
                        </div>
                         <div className="form-group md:col-span-2">
                            <label htmlFor="staff_id" className="block text-sm font-medium text-gray-700">Class Teacher (Optional)</label>
                            <select id="staff_id" name="staff_id" value={formState.staff_id || ''} onChange={handleFormChange} className="mt-1 input-field">
                                <option value="">-- Select Teacher --</option>
                                {staffList.map(s => <option key={s.staff_id} value={s.staff_id}>{s.name}</option>)}
                            </select>
                        </div>
                    </div>
                );
            case 'ASSIGNMENT':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-group">
                            <label htmlFor="class_id" className="block text-sm font-medium text-gray-700">Class</label>
                            <select id="class_id" name="class_id" value={formState.class_id || ''} onChange={handleFormChange} required className="mt-1 input-field">
                                <option value="">-- Select Class --</option>
                                {classes.map(c => <option key={c.id} value={c.id}>{c.class_name}</option>)}
                            </select>
                        </div>
                         <div className="form-group">
                            <label htmlFor="subject_id" className="block text-sm font-medium text-gray-700">Subject</label>
                            <select id="subject_id" name="subject_id" value={formState.subject_id || ''} onChange={handleFormChange} required className="mt-1 input-field">
                                <option value="">-- Select Subject --</option>
                                {subjects.map(s => <option key={s.id} value={s.id}>{s.subject_name}</option>)}
                            </select>
                        </div>
                        <div className="form-group md:col-span-2">
                            <label htmlFor="staff_id" className="block text-sm font-medium text-gray-700">Teacher</label>
                            <select id="staff_id" name="staff_id" value={formState.staff_id || ''} onChange={handleFormChange} className="mt-1 input-field">
                                <option value="">-- Select Teacher --</option>
                                {staffList.map(s => <option key={s.staff_id} value={s.staff_id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="incoming_time" className="block text-sm font-medium text-gray-700">Incoming Time</label>
                            <input type="time" id="incoming_time" name="incoming_time" value={formState.incoming_time || ''} onChange={handleFormChange} className="mt-1 input-field"/>
                        </div>
                        <div className="form-group">
                            <label htmlFor="outgoing_time" className="block text-sm font-medium text-gray-700">Outgoing Time</label>
                            <input type="time" id="outgoing_time" name="outgoing_time" value={formState.outgoing_time || ''} onChange={handleFormChange} className="mt-1 input-field"/>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const getModalTitle = () => {
        const action = selectedItem ? 'Edit' : 'Add';
        switch (modal) {
            case 'SUBJECT': return `${action} Subject`;
            case 'CLASS': return `${action} Class`;
            case 'ASSIGNMENT': return `${action} Assignment`;
            default: return '';
        }
    };

    if(loading) return <div className="flex justify-center items-center h-96"><Spinner size="12" /></div>;

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800">Class Dashboard</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Subjects Section */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-700">Manage Subjects</h2>
                        <button onClick={() => openModal('SUBJECT')} className="btn-primary">+ Add</button>
                    </div>
                    <div className="overflow-y-auto max-h-80">
                        <table className="min-w-full">
                            <thead className="bg-gray-50"><tr><th className="table-th">Subject Name</th><th className="table-th text-center">Actions</th></tr></thead>
                            <tbody className="divide-y divide-gray-200">
                                {subjects.map(s => (
                                    <tr key={s.id}>
                                        <td className="table-td">{s.subject_name}</td>
                                        <td className="table-td text-center"><div className="flex justify-center items-center space-x-2">
                                            <button onClick={() => openModal('SUBJECT', s)} className="text-indigo-600 hover:text-indigo-900"><EditIcon /></button>
                                            <button onClick={() => handleDelete('subjects', s.id)} className="text-red-600 hover:text-red-900"><DeleteIcon /></button>
                                        </div></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Classes Section */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-700">Manage Classes</h2>
                        <button onClick={() => openModal('CLASS')} className="btn-primary">+ Add</button>
                    </div>
                     <div className="overflow-y-auto max-h-80">
                        <table className="min-w-full">
                            <thead className="bg-gray-50"><tr><th className="table-th">Class Name</th><th className="table-th">Fees</th><th className="table-th">Class Teacher</th><th className="table-th text-center">Actions</th></tr></thead>
                            <tbody className="divide-y divide-gray-200">
                                {classes.map(c => (
                                    <tr key={c.id}>
                                        <td className="table-td">{c.class_name}</td>
                                        <td className="table-td font-mono">₹{c.school_fees?.toLocaleString() || 'N/A'}</td>
                                        <td className="table-td">{staffList.find(s => s.staff_id === c.staff_id)?.name || 'N/A'}</td>
                                        <td className="table-td text-center"><div className="flex justify-center items-center space-x-2">
                                            <button onClick={() => openModal('CLASS', c)} className="text-indigo-600 hover:text-indigo-900"><EditIcon /></button>
                                            <button onClick={() => handleDelete('classes', c.id)} className="text-red-600 hover:text-red-900"><DeleteIcon /></button>
                                        </div></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Assignments Section */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-700">Assigned Classes & Teachers</h2>
                    <button onClick={() => openModal('ASSIGNMENT')} className="btn-primary">+ Assign Class</button>
                </div>
                <div className="overflow-x-auto">
                     <table className="min-w-full">
                        <thead className="bg-gray-50"><tr>
                            <th className="table-th">Class</th><th className="table-th">Subject</th><th className="table-th">Teacher</th><th className="table-th">Timing</th><th className="table-th text-center">Actions</th>
                        </tr></thead>
                        <tbody className="divide-y divide-gray-200">
                           {assignments.map(a => (
                                <tr key={a.id}>
                                    <td className="table-td">{classes.find(c => c.id === a.class_id)?.class_name || 'N/A'}</td>
                                    <td className="table-td">{subjects.find(s => s.id === a.subject_id)?.subject_name || 'N/A'}</td>
                                    <td className="table-td">{staffList.find(s => s.staff_id === a.staff_id)?.name || 'N/A'}</td>
                                    <td className="table-td">{`${a.incoming_time || ''} - ${a.outgoing_time || ''}`}</td>
                                    <td className="table-td text-center"><div className="flex justify-center items-center space-x-2">
                                        <button onClick={() => openModal('ASSIGNMENT', a)} className="text-indigo-600 hover:text-indigo-900"><EditIcon /></button>
                                        <button onClick={() => handleDelete('assign_class', a.id)} className="text-red-600 hover:text-red-900"><DeleteIcon /></button>
                                    </div></td>
                                </tr>
                           ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {modal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">{getModalTitle()}</h2>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-800 text-3xl">&times;</button>
                        </div>
                        {error && <div className="p-3 mb-4 text-sm bg-red-100 text-red-700 rounded-md">{error}</div>}
                        <form onSubmit={handleSubmit}>
                            {renderModalContent()}
                            <div className="flex justify-end items-center gap-4 mt-6">
                                <button type="button" onClick={closeModal} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">Cancel</button>
                                <button type="submit" disabled={saving} className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:bg-gray-400 flex items-center gap-2">
                                    {saving && <Spinner size="5" />} {saving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
             <style>{`
                .btn-primary {
                    padding: 0.5rem 1rem;
                    border: none;
                    border-radius: 0.375rem;
                    font-size: 0.875rem;
                    font-weight: 500;
                    cursor: pointer;
                    background-color: #4f46e5;
                    color: white;
                    transition: background-color 0.2s;
                }
                .btn-primary:hover {
                    background-color: #4338ca;
                }
                .table-th {
                    padding: 0.75rem 1rem;
                    text-align: left;
                    font-size: 0.75rem;
                    font-weight: 500;
                    color: #6B7280;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .table-td {
                    padding: 1rem 1rem;
                    font-size: 0.875rem;
                    white-space: nowrap;
                }
                 .input-field {
                    display: block;
                    width: 100%;
                    padding: 0.5rem 0.75rem;
                    border-radius: 0.375rem;
                    border-width: 1px;
                    border-color: #D1D5DB;
                    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
                }
                .input-field:focus {
                    border-color: #4f46e5;
                    --tw-ring-color: #4f46e5;
                }
            `}</style>
        </div>
    );
};

export default Classes;