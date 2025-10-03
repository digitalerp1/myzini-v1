
import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Student, Class } from '../types';
import Spinner from './Spinner';

interface StudentModalProps {
    student: Student | null;
    classes: Class[];
    onClose: () => void;
    onSave: () => void;
}

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

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
        previous_school_name: student?.previous_school_name || ''
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
        
        // Sanitize data before saving
        const dataToSave = Object.fromEntries(
            Object.entries(formData).map(([key, value]) => [key, value === '' ? null : value])
        );

        if (student) { // Editing existing student
            if (!dataToSave.password) {
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
                        <select name="class" value={formData.class} onChange={handleChange} className="mt-1 input-field">
                            <option value="">Select Class</option>
                            {classes.map(c => <option key={c.id} value={c.class_name}>{c.class_name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Roll Number</label>
                        <input type="text" name="roll_number" value={formData.roll_number} onChange={handleChange} className="mt-1 input-field"/>
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
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Photo URL</label>
                        <input type="url" name="photo_url" value={formData.photo_url} onChange={handleChange} placeholder="https://..." className="mt-1 input-field"/>
                    </div>
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
            `}</style>
        </div>
    );
};

export default StudentModal;
