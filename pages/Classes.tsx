
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { Subject, Class, Assignment, Staff } from '../types';
import Spinner from '../components/Spinner';
import EditIcon from '../components/icons/EditIcon';
import DeleteIcon from '../components/icons/DeleteIcon';
import PlusIcon from '../components/icons/PlusIcon';
import UserCircleIcon from '../components/icons/UserCircleIcon';
import ClassesIcon from '../components/icons/ClassesIcon';

type ModalType = 'SUBJECT' | 'CLASS' | 'ASSIGNMENT' | null;

const Classes: React.FC = () => {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [staffList, setStaffList] = useState<Staff[]>([]);
    
    // New state for Timetable UI
    const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
    
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
            
            // Auto-select first class if available and none selected
            if (classesRes.data.length > 0 && !selectedClassId) {
                setSelectedClassId(classesRes.data[0].id);
            }
            
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [selectedClassId]);

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
        // Pre-fill class ID in assignment modal if a class is selected
        if (type === 'ASSIGNMENT' && !item && selectedClassId) {
            setFormState({ class_id: selectedClassId });
        } else {
            setFormState(item || {});
        }
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
            loadData(); // Ensure UI refreshes
        }
        setSaving(false);
    };
    
    const handleDelete = async (table: string, id: number) => {
        if(window.confirm('Are you sure you want to delete this item?')){
            await supabase.from(table).delete().eq('id', id);
            loadData();
        }
    }

    const formatTime = (timeString: string | undefined) => {
        if (!timeString) return '';
        const [hours, minutes] = timeString.split(':');
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes));
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    const renderModalContent = () => {
        switch (modal) {
            case 'SUBJECT':
                return (
                    <div className="form-group full-width">
                        <label htmlFor="subject_name" className="block text-sm font-medium text-gray-700">Subject Name</label>
                        <input type="text" id="subject_name" name="subject_name" value={formState.subject_name || ''} onChange={handleFormChange} required className="mt-1 input-field"/>
                    </div>
                );
            case 'CLASS':
                return (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-group">
                            <label htmlFor="class_name" className="block text-sm font-medium text-gray-700">Class Name</label>
                            <input type="text" id="class_name" name="class_name" value={formState.class_name || ''} onChange={handleFormChange} required className="mt-1 input-field"/>
                        </div>
                        <div className="form-group">
                            <label htmlFor="school_fees" className="block text-sm font-medium text-gray-700">Monthly Tuition Fee</label>
                            <input type="number" id="school_fees" name="school_fees" value={formState.school_fees || ''} onChange={handleFormChange} placeholder="e.g., 500" className="mt-1 input-field"/>
                        </div>
                         <div className="form-group md:col-span-2">
                            <label htmlFor="staff_id" className="block text-sm font-medium text-gray-700">Class Teacher (Optional)</label>
                            <select id="staff_id" name="staff_id" value={formState.staff_id || ''} onChange={handleFormChange} className="mt-1 input-field">
                                <option value="">-- Select Teacher --</option>
                                {staffList.map(s => <option key={s.staff_id} value={s.staff_id}>{s.name} ({s.staff_id})</option>)}
                            </select>
                        </div>
                    </div>
                );
            case 'ASSIGNMENT':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-group md:col-span-2">
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
                        <div className="form-group">
                            <label htmlFor="staff_id" className="block text-sm font-medium text-gray-700">Teacher</label>
                            <select id="staff_id" name="staff_id" value={formState.staff_id || ''} onChange={handleFormChange} className="mt-1 input-field">
                                <option value="">-- Select Teacher --</option>
                                {staffList.map(s => <option key={s.staff_id} value={s.staff_id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="incoming_time" className="block text-sm font-medium text-gray-700">Start Time</label>
                            <input type="time" id="incoming_time" name="incoming_time" value={formState.incoming_time || ''} onChange={handleFormChange} className="mt-1 input-field"/>
                        </div>
                        <div className="form-group">
                            <label htmlFor="outgoing_time" className="block text-sm font-medium text-gray-700">End Time</label>
                            <input type="time" id="outgoing_time" name="outgoing_time" value={formState.outgoing_time || ''} onChange={handleFormChange} className="mt-1 input-field"/>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const getModalTitle = () => {
        const action = selectedItem ? 'Edit' : 'Add New';
        switch (modal) {
            case 'SUBJECT': return `${action} Subject`;
            case 'CLASS': return `${action} Class`;
            case 'ASSIGNMENT': return `${action} Period/Assignment`;
            default: return '';
        }
    };

    if(loading) return <div className="flex justify-center items-center h-screen bg-gray-50"><Spinner size="12" /></div>;

    // Filter assignments for selected class and sort by time
    const classAssignments = assignments
        .filter(a => a.class_id === selectedClassId)
        .sort((a, b) => (a.incoming_time || '').localeCompare(b.incoming_time || ''));

    const selectedClassData = classes.find(c => c.id === selectedClassId);
    const selectedClassTeacher = selectedClassData && staffList.find(s => s.staff_id === selectedClassData.staff_id);

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Academic Management</h1>

            {/* --- Section 1: Configuration (Subjects & Classes) --- */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                
                {/* Subjects Config */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-full">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">Subjects</h2>
                        </div>
                        <button onClick={() => openModal('SUBJECT')} className="btn-icon bg-purple-50 text-purple-600 hover:bg-purple-100"><PlusIcon /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto max-h-[300px] pr-2">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {subjects.map(s => (
                                <div key={s.id} className="group relative bg-gray-50 hover:bg-purple-50 rounded-xl p-3 border border-transparent hover:border-purple-200 transition-all">
                                    <h3 className="font-semibold text-gray-700 group-hover:text-purple-700 truncate" title={s.subject_name}>{s.subject_name}</h3>
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity bg-white/80 rounded-md p-0.5 shadow-sm">
                                        <button onClick={() => openModal('SUBJECT', s)} className="text-blue-500 hover:bg-blue-50 p-1 rounded"><EditIcon className="w-3 h-3"/></button>
                                        <button onClick={() => handleDelete('subjects', s.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><DeleteIcon className="w-3 h-3"/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Classes Config */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-full">
                    <div className="flex justify-between items-center mb-6">
                         <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                <ClassesIcon />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">Classes</h2>
                        </div>
                        <button onClick={() => openModal('CLASS')} className="btn-icon bg-blue-50 text-blue-600 hover:bg-blue-100"><PlusIcon /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto max-h-[300px] pr-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {classes.map(c => {
                                const teacher = staffList.find(s => s.staff_id === c.staff_id);
                                return (
                                    <div key={c.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all relative group">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-800">{c.class_name}</h3>
                                                <p className="text-sm text-gray-500 mt-0.5">Fee: <span className="font-semibold text-green-600">₹{c.school_fees}</span></p>
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => openModal('CLASS', c)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-full"><EditIcon className="w-4 h-4"/></button>
                                                <button onClick={() => handleDelete('classes', c.id)} className="text-red-600 hover:bg-red-50 p-1.5 rounded-full"><DeleteIcon className="w-4 h-4"/></button>
                                            </div>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
                                            {teacher?.photo_url ? (
                                                <img src={teacher.photo_url} className="w-6 h-6 rounded-full object-cover" alt=""/>
                                            ) : (
                                                <UserCircleIcon className="w-6 h-6 text-gray-300"/>
                                            )}
                                            <span className="text-xs text-gray-600 font-medium truncate">{teacher?.name || 'No Teacher Assigned'}</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Section 2: Timetable Management (Master-Detail) --- */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
                
                {/* Sidebar: Class List */}
                <div className="w-full md:w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
                    <div className="p-5 border-b border-gray-200 bg-white">
                        <h2 className="text-lg font-bold text-gray-800">Academic Routine</h2>
                        <p className="text-xs text-gray-500 mt-1">Select a class to view schedule</p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                         {classes.map(c => (
                            <button 
                                key={c.id} 
                                onClick={() => setSelectedClassId(c.id)}
                                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-between group
                                    ${selectedClassId === c.id 
                                        ? 'bg-indigo-600 text-white shadow-md' 
                                        : 'bg-white text-gray-700 hover:bg-indigo-50 border border-transparent hover:border-indigo-100'
                                    }`}
                            >
                                <span>{c.class_name}</span>
                                {selectedClassId === c.id && <div className="w-2 h-2 bg-white rounded-full"></div>}
                            </button>
                        ))}
                        {classes.length === 0 && <p className="text-center text-sm text-gray-400 py-4">No classes added</p>}
                    </div>
                </div>

                {/* Main Content: Timetable Details */}
                <div className="flex-1 flex flex-col bg-white">
                    {selectedClassId ? (
                        <>
                            {/* Class Header */}
                            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white sticky top-0 z-10">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-lg">{selectedClassData?.class_name}</span>
                                        Timetable
                                    </h2>
                                    {selectedClassTeacher && (
                                        <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                                            <span className="font-semibold text-gray-700">Class Teacher:</span> 
                                            <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-full">
                                                {selectedClassTeacher.name}
                                            </span>
                                        </p>
                                    )}
                                </div>
                                <button onClick={() => openModal('ASSIGNMENT')} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-all flex items-center gap-2 font-medium">
                                    <PlusIcon className="w-5 h-5"/> Add Period
                                </button>
                            </div>

                            {/* Schedule List */}
                            <div className="p-6 flex-1 overflow-y-auto bg-gray-50/30">
                                {classAssignments.length > 0 ? (
                                    <div className="relative border-l-2 border-indigo-200 ml-4 space-y-8 py-2">
                                        {classAssignments.map((assign, index) => {
                                            const subjectName = subjects.find(s => s.id === assign.subject_id)?.subject_name;
                                            const teacherName = staffList.find(s => s.staff_id === assign.staff_id)?.name;
                                            
                                            return (
                                                <div key={assign.id} className="relative pl-8 group">
                                                    {/* Timeline Dot */}
                                                    <div className="absolute -left-[9px] top-4 w-4 h-4 bg-white border-4 border-indigo-500 rounded-full group-hover:scale-125 transition-transform"></div>
                                                    
                                                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all group-hover:border-indigo-100">
                                                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                                                            <div>
                                                                <div className="flex items-center gap-3 mb-1">
                                                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                                                        {formatTime(assign.incoming_time || '')} - {formatTime(assign.outgoing_time || '')}
                                                                    </span>
                                                                </div>
                                                                <h3 className="text-lg font-bold text-gray-800">{subjectName}</h3>
                                                                <p className="text-sm text-gray-500 font-medium mt-1 flex items-center gap-1">
                                                                    <UserCircleIcon className="w-4 h-4" /> {teacherName || 'No Teacher Assigned'}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-2 self-start sm:self-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button onClick={() => openModal('ASSIGNMENT', assign)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"><EditIcon /></button>
                                                                <button onClick={() => handleDelete('assign_class', assign.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><DeleteIcon /></button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400 min-h-[300px]">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                            <ClassesIcon className="w-8 h-8 text-gray-300"/>
                                        </div>
                                        <p className="text-lg font-medium">No routine set for {selectedClassData?.class_name}</p>
                                        <p className="text-sm">Click "Add Period" to build the schedule.</p>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                            <p className="text-xl font-medium">Select a class from the list</p>
                            <p className="text-sm">to view or manage its timetable.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {modal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto animate-fade-in-up">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black text-gray-800 tracking-tight">{getModalTitle()}</h2>
                            <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                        
                        {error && <div className="p-4 mb-6 text-sm bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center gap-2"><svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>{error}</div>}
                        
                        <form onSubmit={handleSubmit}>
                            {renderModalContent()}
                            <div className="flex justify-end items-center gap-3 mt-8 pt-6 border-t border-gray-100">
                                <button type="button" onClick={closeModal} className="px-6 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
                                <button type="submit" disabled={saving} className="px-8 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all transform active:scale-95">
                                    {saving && <Spinner size="4" />} {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
             <style>{`
                .btn-icon {
                    padding: 0.5rem;
                    border-radius: 0.5rem;
                    transition: all 0.2s;
                }
                .input-field {
                    display: block;
                    width: 100%;
                    padding: 0.75rem 1rem;
                    border-radius: 0.75rem;
                    border-width: 1px;
                    border-color: #E5E7EB;
                    background-color: #F9FAFB;
                    font-size: 0.95rem;
                    transition: all 0.2s;
                }
                .input-field:focus {
                    border-color: #6366F1;
                    background-color: #ffffff;
                    outline: none;
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.3s ease-out forwards;
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(10px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
};

export default Classes;
