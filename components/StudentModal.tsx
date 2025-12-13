
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Student, Class, HostelBuilding } from '../types';
import Spinner from './Spinner';
import ImageUpload from './ImageUpload';
import { sanitizeForPath } from '../utils/textUtils';

interface StudentModalProps {
    student: Student | null;
    classes: Class[];
    onClose: () => void;
    onSave: () => void;
}

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Simple cache to avoid refetching the school name repeatedly
let schoolNameCache: string | null = null;

const StudentModal: React.FC<StudentModalProps> = ({ student, classes, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<Student>>({
        name: student?.name || '',
        class: student?.class || '',
        roll_number: student?.roll_number || '',
        mobile: student?.mobile || '',
        gmail: student?.gmail || '',
        password: '',
        father_name: student?.father_name || '',
        mother_name: student?.mother_name || '',
        address: student?.address || '',
        date_of_birth: student?.date_of_birth || '',
        gender: student?.gender || undefined,
        aadhar: student?.aadhar || '',
        blood_group: student?.blood_group || '',
        caste: student?.caste || '',
        photo_url: student?.photo_url || '',
        previous_school_name: student?.previous_school_name || '',
        previous_dues: student?.previous_dues || 0,
        building_name: student?.building_name || '',
        floor_name: student?.floor_name || '',
        room_no: student?.room_no || '',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [schoolName, setSchoolName] = useState<string | null>(schoolNameCache);
    const [isSuggestingRoll, setIsSuggestingRoll] = useState(false);
    
    // Infrastructure state
    const [hostelData, setHostelData] = useState<HostelBuilding[]>([]);
    const [availableFloors, setAvailableFloors] = useState<{id: string, name: string}[]>([]);
    const [availableRooms, setAvailableRooms] = useState<string[]>([]);

    useEffect(() => {
        const fetchSchoolData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('owner')
                    .select('school_name, hostel_managment')
                    .eq('uid', user.id)
                    .single();
                
                if (data) {
                    if (!schoolNameCache) {
                        schoolNameCache = data.school_name;
                        setSchoolName(data.school_name);
                    } else {
                        setSchoolName(schoolNameCache);
                    }

                    // Load Hostel Data from JSON column
                    if (data.hostel_managment) {
                        setHostelData(data.hostel_managment as HostelBuilding[]);
                    }
                }
            }
        };
        fetchSchoolData();
    }, []);

    // Effect to update available floors when building changes
    useEffect(() => {
        if (formData.building_name) {
            const selectedBuilding = hostelData.find(b => b.name === formData.building_name);
            if (selectedBuilding) {
                setAvailableFloors(selectedBuilding.floors.map(f => ({id: f.id, name: f.name})));
            } else {
                setAvailableFloors([]);
            }
        } else {
            setAvailableFloors([]);
        }
        // When building changes, floor and room might become invalid if not cleared, 
        // but we keep them unless the user changes them or we can clear them here if strict.
        // For better UX, if building changes, we should probably verify if floor still exists or clear it.
        // Let's rely on the user to pick new ones for simplicity, or:
        if (!hostelData.find(b => b.name === formData.building_name)) {
             // If building is invalid/changed, existing floor selection is likely invalid for new building
             // We can optionally clear floor/room here, but let's just update the lists.
        }
    }, [formData.building_name, hostelData]);

    // Effect to update available rooms when floor changes
    useEffect(() => {
        if (formData.building_name && formData.floor_name) {
            const selectedBuilding = hostelData.find(b => b.name === formData.building_name);
            if (selectedBuilding) {
                const selectedFloor = selectedBuilding.floors.find(f => f.name === formData.floor_name);
                if (selectedFloor) {
                    setAvailableRooms(selectedFloor.rooms);
                } else {
                    setAvailableRooms([]);
                }
            } else {
                setAvailableRooms([]);
            }
        } else {
            setAvailableRooms([]);
        }
    }, [formData.floor_name, formData.building_name, hostelData]);


    useEffect(() => {
        // Only suggest roll number for new students when a class is selected
        if (!student && formData.class) {
            const suggestRollNumber = async () => {
                setIsSuggestingRoll(true);
                const { data, error: fetchError } = await supabase
                    .from('students')
                    .select('roll_number')
                    .eq('class', formData.class)
                    .neq('roll_number', null);

                if (fetchError) {
                    // Don't block the user, just log it. They can enter manually.
                    console.error("Error fetching roll numbers:", fetchError);
                } else if (data) {
                    const maxRollNumber = data.reduce((max, s) => {
                        const currentRoll = parseInt(s.roll_number!, 10);
                        return !isNaN(currentRoll) && currentRoll > max ? currentRoll : max;
                    }, 0);

                    setFormData(prev => ({
                        ...prev,
                        roll_number: (maxRollNumber + 1).toString()
                    }));
                }
                setIsSuggestingRoll(false);
            };
            suggestRollNumber();
        } else if (!student && !formData.class) {
            // Clear roll number if class is deselected for a new student
            setFormData(prev => ({ ...prev, roll_number: '' }));
        }
    }, [formData.class, student]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            
            // Logic to clear dependent fields
            if (name === 'building_name') {
                newData.floor_name = '';
                newData.room_no = '';
            } else if (name === 'floor_name') {
                newData.room_no = '';
            }
            
            return newData;
        });
    };

    const handlePhotoUrlChange = (url: string) => {
        setFormData(prev => ({ ...prev, photo_url: url }));
    };

    const getStudentImagePath = async (fileName: string): Promise<string> => {
        if (!schoolName) {
            throw new Error("School name could not be determined. Please set up the school profile first.");
        }
        if (!formData.name) {
            throw new Error("Student name must be set before uploading an image.");
        }
        
        const sanitizedSchoolName = sanitizeForPath(schoolName);
        const sanitizedStudentName = sanitizeForPath(formData.name);
        const extension = fileName.split('.').pop() || 'png';
        const uniqueFileName = `student_${sanitizedStudentName}_${Date.now()}.${extension}`;

        return `${sanitizedSchoolName}/${uniqueFileName}`;
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setError("You must be logged in to perform this action.");
            setSaving(false);
            return;
        }
        
        const dataToSave = { 
            ...formData,
            previous_dues: Number(formData.previous_dues) || 0,
        };

        if (student) { // Editing existing student
            if (!dataToSave.password || dataToSave.password === '') {
                delete dataToSave.password;
            }
            const { error } = await supabase.from('students').update(dataToSave).eq('id', student.id);
            if (error) setError(error.message);
            else onSave();
        } else { // Adding new student
            if (!dataToSave.password) {
                setError("Password is required for new students.");
                setSaving(false);
                return;
            }
            const { error } = await supabase.from('students').insert([{ ...dataToSave, uid: user.id }]);
            if (error) setError(error.message);
            else onSave();
        }
        setSaving(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">{student ? 'Edit Student' : 'Add New Student'}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl">&times;</button>
                </div>
                {error && <div className="p-3 mb-4 text-sm bg-red-100 text-red-700 rounded-md">{error}</div>}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 input-field"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Class</label>
                        <select name="class" value={formData.class} onChange={handleChange} required className="mt-1 input-field">
                            <option value="">Select Class</option>
                            {classes.map(c => <option key={c.id} value={c.class_name}>{c.class_name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Roll Number</label>
                        <div className="relative mt-1">
                            <input
                                type="text"
                                name="roll_number"
                                value={formData.roll_number}
                                onChange={handleChange}
                                className="input-field"
                                disabled={isSuggestingRoll}
                                placeholder={isSuggestingRoll ? "Suggesting..." : ""}
                            />
                            {isSuggestingRoll && (
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <Spinner size="5" />
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Mobile</label>
                        <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} className="mt-1 input-field"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Gmail</label>
                        <input type="email" name="gmail" value={formData.gmail} onChange={handleChange} className="mt-1 input-field"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder={student ? "Leave blank to keep unchanged" : ""} required={!student} className="mt-1 input-field"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Father's Name</label>
                        <input type="text" name="father_name" value={formData.father_name} onChange={handleChange} className="mt-1 input-field"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Mother's Name</label>
                        <input type="text" name="mother_name" value={formData.mother_name} onChange={handleChange} className="mt-1 input-field"/>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Address</label>
                        <textarea name="address" rows={2} value={formData.address} onChange={handleChange} className="mt-1 input-field"/>
                    </div>
                    
                    {/* Hostel / Infrastructure Section */}
                    {hostelData.length > 0 && (
                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-100 pt-4 mt-2 bg-gray-50 p-4 rounded-lg">
                            <h3 className="md:col-span-3 text-sm font-bold text-gray-700 mb-1">Hostel Room Assignment</h3>
                            
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Building</label>
                                <select name="building_name" value={formData.building_name} onChange={handleChange} className="input-field text-sm">
                                    <option value="">Select Building</option>
                                    {hostelData.map((b) => (
                                        <option key={b.id} value={b.name}>{b.name}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Floor</label>
                                <select name="floor_name" value={formData.floor_name} onChange={handleChange} className="input-field text-sm" disabled={!formData.building_name}>
                                    <option value="">Select Floor</option>
                                    {availableFloors.map((f) => (
                                        <option key={f.id} value={f.name}>{f.name}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Room No</label>
                                <select name="room_no" value={formData.room_no} onChange={handleChange} className="input-field text-sm" disabled={!formData.floor_name}>
                                    <option value="">Select Room</option>
                                    {availableRooms.map((r, i) => (
                                        <option key={i} value={r}>{r}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                        <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} className="mt-1 input-field"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Gender</label>
                        <select name="gender" value={formData.gender} onChange={handleChange} className="mt-1 input-field">
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Aadhar Number</label>
                        <input type="text" name="aadhar" value={formData.aadhar} onChange={handleChange} className="mt-1 input-field"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                        <select name="blood_group" value={formData.blood_group} onChange={handleChange} className="mt-1 input-field">
                            <option value="">Select Blood Group</option>
                            {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Caste</label>
                        <input type="text" name="caste" value={formData.caste} onChange={handleChange} className="mt-1 input-field"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Previous School</label>
                        <input type="text" name="previous_school_name" value={formData.previous_school_name} onChange={handleChange} className="mt-1 input-field"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Previous Dues (₹)</label>
                        <input type="number" name="previous_dues" value={formData.previous_dues ?? ''} onChange={handleChange} placeholder="e.g. 1500" className="mt-1 input-field"/>
                    </div>

                    <ImageUpload
                        label="Photo"
                        currentUrl={formData.photo_url}
                        onUrlChange={handlePhotoUrlChange}
                        getUploadPath={getStudentImagePath}
                    />

                    <div className="md:col-span-2 flex justify-end items-center gap-4 mt-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={saving} className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:bg-gray-400 flex items-center gap-2 transition-colors">
                            {saving && <Spinner size="5" />}
                            {saving ? 'Saving...' : 'Save Student'}
                        </button>
                    </div>
                </form>
            </div>
             <style>{`
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
                .input-field:disabled {
                    background-color: #f3f4f6;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
};

export default StudentModal;
