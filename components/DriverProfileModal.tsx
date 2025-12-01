
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { Driver, Student, Class } from '../types';
import Spinner from './Spinner';
import UserCircleIcon from './icons/UserCircleIcon';
import PhoneIcon from './icons/PhoneIcon';
import LocationIcon from './icons/LocationIcon';
import EditIcon from './icons/EditIcon';
import DeleteIcon from './icons/DeleteIcon';

interface DriverProfileModalProps {
    driver: Driver;
    onClose: () => void;
    onEdit: (driver: Driver) => void;
}

const DriverProfileModal: React.FC<DriverProfileModalProps> = ({ driver: initialDriver, onClose, onEdit }) => {
    const [driver, setDriver] = useState<Driver>(initialDriver);
    const [isAdding, setIsAdding] = useState(false);
    const [classes, setClasses] = useState<Class[]>([]);
    const [studentsInClass, setStudentsInClass] = useState<Student[]>([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const channel = supabase.channel(`driver-profile-${initialDriver.id}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'driver', filter: `id=eq.${initialDriver.id}`},
                (payload) => setDriver(payload.new as Driver)
            ).subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [initialDriver.id]);

    const fetchClasses = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('classes').select('*').order('class_name');
        if (error) setError(error.message);
        else setClasses(data as Class[]);
        setLoading(false);
    }, []);

    useEffect(() => {
        if (isAdding) fetchClasses();
    }, [isAdding, fetchClasses]);

    const handleClassChange = async (className: string) => {
        setSelectedClass(className);
        setSelectedStudentIds([]);
        if (!className) {
            setStudentsInClass([]);
            return;
        }
        setLoading(true);
        const { data, error } = await supabase.from('students').select('*').eq('class', className).order('roll_number');
        if (error) setError(error.message);
        else setStudentsInClass(data as Student[]);
        setLoading(false);
    };

    const handleStudentToggle = (studentId: number) => {
        setSelectedStudentIds(prev => 
            prev.includes(studentId) 
                ? prev.filter(id => id !== studentId) 
                : [...prev, studentId]
        );
    };

    const toggleAllStudents = () => {
        if (selectedStudentIds.length === studentsInClass.length) {
            setSelectedStudentIds([]);
        } else {
            setSelectedStudentIds(studentsInClass.map(s => s.id));
        }
    };

    const handleAddStudents = async () => {
        if (selectedStudentIds.length === 0) return;
        setLoading(true);
        setError(null);
        
        // Filter the full student objects based on selected IDs
        const studentsToAdd = studentsInClass.filter(s => selectedStudentIds.includes(s.id));
        
        const currentList = driver.students_list || [];
        
        // Create a set of existing students for quick duplicate checking (combining class and roll number as unique key)
        const existingKeys = new Set(currentList.map(s => `${s.class}-${s.roll_number}`));
        
        const newEntries = studentsToAdd
            .filter(s => s.roll_number && s.class) // Ensure they have valid data
            .filter(s => !existingKeys.has(`${s.class}-${s.roll_number}`)) // Filter duplicates
            .map(s => ({ 
                name: s.name, 
                class: s.class!, 
                roll_number: s.roll_number! 
            }));

        if (newEntries.length === 0) {
            setError("Selected students are already assigned to this driver or have missing data.");
            setLoading(false);
            return;
        }
        
        const newList = [...currentList, ...newEntries];
        const { error: updateError } = await supabase.from('driver').update({ students_list: newList }).eq('id', driver.id);

        if (updateError) setError(updateError.message);
        else {
            setIsAdding(false);
            setSelectedClass('');
            setStudentsInClass([]);
            setSelectedStudentIds([]);
        }
        setLoading(false);
    };

    const handleRemoveStudent = async (studentToRemove: { class: string; roll_number: string }) => {
        setLoading(true);
        const newList = (driver.students_list || []).filter(s =>
            !(s.roll_number === studentToRemove.roll_number && s.class === studentToRemove.class)
        );
        const { error: updateError } = await supabase.from('driver').update({ students_list: newList }).eq('id', driver.id);
        if (updateError) setError(updateError.message);
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-gray-50 p-8 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col">
                <div className="flex justify-between items-center mb-6 flex-shrink-0">
                    <h2 className="text-3xl font-bold text-gray-800">Driver Profile</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-4xl leading-none">&times;</button>
                </div>
                {error && <div className="p-3 mb-4 text-sm bg-red-100 text-red-700 rounded-md">{error}</div>}
                
                <div className="overflow-y-auto pr-4 -mr-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white p-6 rounded-xl shadow-md text-center">
                                <img src={driver.photo_url || `https://ui-avatars.com/api/?name=${driver.name}`} alt={driver.name} className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-primary-dark shadow-lg"/>
                                <h3 className="text-2xl font-bold text-gray-900 mt-4">{driver.name}</h3>
                                <p className="text-sm text-gray-500 font-mono">{driver.driver_id}</p>
                            </div>
                             <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
                                <h4 className="info-header"><PhoneIcon /> Contact & Vehicle</h4>
                                <InfoItem label="Mobile" value={driver.mobile} />
                                <InfoItem label="Aadhar" value={driver.aadhar} />
                                <InfoItem label="Driving Licence" value={driver.driving_licence} />
                                <InfoItem label="Van Number" value={driver.van_number} />
                                <InfoItem label="Address" value={driver.address} fullWidth/>
                            </div>
                             <button onClick={() => onEdit(driver)} className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                                <EditIcon /> Edit Driver Details
                            </button>
                        </div>
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white p-6 rounded-xl shadow-md">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="info-header" style={{border: 'none', margin: 0, padding: 0}}>Assigned Students ({driver.students_list?.length || 0})</h4>
                                    {!isAdding && <button onClick={() => setIsAdding(true)} className="px-4 py-2 bg-primary text-white text-sm rounded-md hover:bg-primary-dark">Add Students</button>}
                                </div>
                                
                                {isAdding && (
                                    <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-3 border border-gray-200">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
                                            <select value={selectedClass} onChange={e => handleClassChange(e.target.value)} className="input-field">
                                                <option value="">-- Choose Class --</option>
                                                {classes.map(c => <option key={c.id} value={c.class_name}>{c.class_name}</option>)}
                                            </select>
                                        </div>

                                        <div className={!selectedClass ? 'opacity-50 pointer-events-none' : ''}>
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="block text-sm font-medium text-gray-700">Select Students</label>
                                                <button type="button" onClick={toggleAllStudents} className="text-xs text-primary font-semibold hover:underline">
                                                    {selectedStudentIds.length === studentsInClass.length && studentsInClass.length > 0 ? 'Deselect All' : 'Select All'}
                                                </button>
                                            </div>
                                            <div className="border border-gray-300 rounded-md h-48 overflow-y-auto bg-white p-2">
                                                {loading && studentsInClass.length === 0 ? <div className="flex justify-center p-4"><Spinner size="6"/></div> : 
                                                 studentsInClass.length === 0 ? <p className="text-center text-gray-500 text-sm p-4">No students found in this class.</p> : (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                        {studentsInClass.map(s => {
                                                            const isAlreadyAssigned = (driver.students_list || []).some(ds => ds.class === s.class && ds.roll_number === s.roll_number);
                                                            return (
                                                                <label key={s.id} className={`flex items-center space-x-2 p-2 rounded-md border ${selectedStudentIds.includes(s.id) ? 'border-primary bg-indigo-50' : 'border-gray-100 hover:bg-gray-50'} cursor-pointer`}>
                                                                    <input 
                                                                        type="checkbox" 
                                                                        checked={selectedStudentIds.includes(s.id)} 
                                                                        onChange={() => handleStudentToggle(s.id)}
                                                                        disabled={isAlreadyAssigned}
                                                                        className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                                                                    />
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className={`text-sm font-medium truncate ${isAlreadyAssigned ? 'text-gray-400' : 'text-gray-900'}`}>
                                                                            {s.name}
                                                                        </p>
                                                                        <p className="text-xs text-gray-500">Roll: {s.roll_number} {isAlreadyAssigned && '(Assigned)'}</p>
                                                                    </div>
                                                                </label>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-2 pt-2">
                                            <button onClick={() => { setIsAdding(false); setSelectedClass(''); }} className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100">Cancel</button>
                                            <button onClick={handleAddStudents} disabled={loading || selectedStudentIds.length === 0} className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2">
                                                {loading ? <Spinner size="4"/> : `Add ${selectedStudentIds.length} Students`}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="h-96 overflow-y-auto border rounded-md">
                                    {(driver.students_list && driver.students_list.length > 0) ? (
                                        <table className="min-w-full text-sm">
                                            <thead className="bg-gray-100 sticky top-0"><tr>
                                                <th className="p-2 text-left">Name</th>
                                                <th className="p-2 text-left">Class</th>
                                                <th className="p-2 text-left">Roll No.</th>
                                                <th className="p-2 text-center">Action</th>
                                            </tr></thead>
                                            <tbody className="divide-y">
                                                {driver.students_list.map((s, i) => (
                                                    <tr key={i}>
                                                        <td className="p-2 font-medium">{s.name}</td>
                                                        <td className="p-2">{s.class}</td>
                                                        <td className="p-2">{s.roll_number}</td>
                                                        <td className="p-2 text-center">
                                                            <button onClick={() => handleRemoveStudent(s)} className="text-red-600 hover:text-red-800" disabled={loading}><DeleteIcon/></button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <p className="text-center text-gray-500 p-8">No students assigned to this driver.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
             <style>{`
                .info-header { display: flex; align-items: center; gap: 0.5rem; font-size: 1.125rem; font-weight: 700; color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.5rem; margin-bottom: 1rem; }
                .input-field { display: block; width: 100%; border-radius: 0.375rem; border: 1px solid #D1D5DB; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); padding: 0.5rem 0.75rem;}
            `}</style>
        </div>
    );
};

const InfoItem = ({ label, value, fullWidth = false }: { label: string, value?: string | null, fullWidth?: boolean }) => (
    <div className={fullWidth ? 'col-span-full' : ''}>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="mt-1 text-sm text-gray-900 break-words">{value || '-'}</p>
    </div>
);

export default DriverProfileModal;
