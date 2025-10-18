import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Staff } from '../types';
import Spinner from './Spinner';
import ImageUpload from './ImageUpload';
import { sanitizeForPath } from '../utils/textUtils';

interface StaffModalProps {
    staff: Staff | null;
    onClose: () => void;
    onSave: () => void;
}

// Function to generate a random 14-character alphanumeric string
const generateRandomId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 14; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `STAFF-${result}`;
};

// Simple cache to avoid refetching the school name repeatedly
let schoolNameCache: string | null = null;

const StaffModal: React.FC<StaffModalProps> = ({ staff, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<Staff>>({
        name: staff?.name || '',
        mobile: staff?.mobile || '',
        gmail: staff?.gmail || '',
        password: '',
        father_name: staff?.father_name || '',
        mother_name: staff?.mother_name || '',
        address: staff?.address || '',
        highest_qualification: staff?.highest_qualification || '',
        joining_date: staff?.joining_date || new Date().toISOString().split('T')[0],
        photo_url: staff?.photo_url || '',
        salary_amount: staff?.salary_amount || 0,
        is_active: staff?.is_active ?? true,
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [schoolName, setSchoolName] = useState<string | null>(schoolNameCache);

    useEffect(() => {
        const fetchSchoolName = async () => {
            if (schoolNameCache) {
                setSchoolName(schoolNameCache);
                return;
            }
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('owner')
                    .select('school_name')
                    .eq('uid', user.id)
                    .single();
                if (data) {
                    schoolNameCache = data.school_name;
                    setSchoolName(data.school_name);
                }
            }
        };
        fetchSchoolName();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handlePhotoUrlChange = (url: string) => {
        setFormData(prev => ({ ...prev, photo_url: url }));
    };

    const getStaffImagePath = async (fileName: string): Promise<string> => {
        if (!schoolName) {
            throw new Error("School name could not be determined. Please ensure the school profile is set up.");
        }
        if (!formData.name) {
            throw new Error("Staff name must be set before uploading an image.");
        }
        const sanitizedSchoolName = sanitizeForPath(schoolName);
        const sanitizedStaffName = sanitizeForPath(formData.name);
        const extension = fileName.split('.').pop() || 'png';
        const uniqueFileName = `staff_${sanitizedStaffName}_${Date.now()}.${extension}`;
        
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
            uid: user.id,
            salary_amount: Number(formData.salary_amount) || 0,
        };

        if (staff) { // Editing existing staff
            // Don't update password if it's empty
            if (!dataToSave.password) {
                delete dataToSave.password;
            }
            const { error } = await supabase.from('staff').update(dataToSave).eq('id', staff.id);
            if (error) setError(error.message);
            else onSave();
        } else { // Adding new staff
            if (!dataToSave.password) {
                setError("Password is required for new staff members.");
                setSaving(false);
                return;
            }
            const staff_id = generateRandomId();
            const { error } = await supabase.from('staff').insert([{ ...dataToSave, staff_id }]);
            if (error) setError(error.message);
            else onSave();
        }
        setSaving(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">{staff ? 'Edit Staff' : 'Add New Staff'}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">&times;</button>
                </div>
                {error && <div className="p-3 mb-4 text-sm bg-red-100 text-red-700 rounded-md">{error}</div>}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    {/* Form fields */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 input-field"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                        <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} required className="mt-1 input-field"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Gmail</label>
                        <input type="email" name="gmail" value={formData.gmail} onChange={handleChange} className="mt-1 input-field"/>
                    </div>
                    {!staff && ( // Only show password for new staff
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <input type="password" name="password" value={formData.password} onChange={handleChange} required className="mt-1 input-field"/>
                        </div>
                    )}
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
                        <textarea name="address" rows={3} value={formData.address} onChange={handleChange} className="mt-1 input-field"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Highest Qualification</label>
                        <input type="text" name="highest_qualification" value={formData.highest_qualification} onChange={handleChange} className="mt-1 input-field"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Joining Date</label>
                        <input type="date" name="joining_date" value={formData.joining_date} onChange={handleChange} required className="mt-1 input-field"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Monthly Salary</label>
                        <input type="number" name="salary_amount" value={formData.salary_amount} onChange={handleChange} required className="mt-1 input-field"/>
                    </div>

                    <ImageUpload 
                        label="Photo"
                        currentUrl={formData.photo_url}
                        onUrlChange={handlePhotoUrlChange}
                        getUploadPath={getStaffImagePath}
                    />
                    
                    <div className="md:col-span-2 flex items-center">
                        <input type="checkbox" name="is_active" id="is_active" checked={formData.is_active} onChange={handleChange} className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"/>
                        <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">Staff is Active</label>
                    </div>

                    <div className="md:col-span-2 flex justify-end items-center gap-4 mt-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={saving} className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:bg-gray-400 flex items-center gap-2 transition-colors">
                            {saving && <Spinner size="5" />}
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
             <style>{`
                .input-field {
                    display: block;
                    width: 100%;
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

export default StaffModal;
