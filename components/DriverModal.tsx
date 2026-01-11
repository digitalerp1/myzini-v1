
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Driver } from '../types';
import Spinner from './Spinner';
import ImageUpload from './ImageUpload';
import { uploadImage } from '../services/githubService';

interface DriverModalProps {
    driver: Driver | null;
    onClose: () => void;
    onSave: () => void;
}

const generateRandomId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'DRV-';
    for (let i = 0; i < 10; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

let schoolNameCache: string | null = null;

const DriverModal: React.FC<DriverModalProps> = ({ driver, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<Driver>>({
        name: driver?.name || '',
        mobile: driver?.mobile || '',
        aadhar: driver?.aadhar || '',
        photo_url: driver?.photo_url || '',
        address: driver?.address || '',
        van_number: driver?.van_number || '',
        van_image_url: driver?.van_image_url || '',
        driving_licence: driver?.driving_licence || '',
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handlePhotoUrlChange = (url: string) => setFormData(prev => ({ ...prev, photo_url: url }));
    const handleVanImageUrlChange = (url: string) => setFormData(prev => ({ ...prev, van_image_url: url }));

    const handleUploadImage = async (file: File) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !schoolName) {
            throw new Error("Missing school information or authentication.");
        }
        return await uploadImage(file, schoolName, user.id);
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setError("You must be logged in.");
            setSaving(false);
            return;
        }

        const dataToSave = { ...formData, uid: user.id };

        let upsertError: any = null;

        if (driver) { // Editing existing driver
            const dataToUpsert = { ...dataToSave, id: driver.id };
            const { error } = await supabase.from('driver').upsert(dataToUpsert);
            upsertError = error;
        } else { // Adding new driver
            const driver_id = generateRandomId();
            const dataToUpsert = { ...dataToSave, driver_id };
            const { error } = await supabase.from('driver').upsert(dataToUpsert);
            upsertError = error;
        }

        if (upsertError) {
            setError(upsertError.message);
        } else {
            onSave();
        }
        
        setSaving(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">{driver ? 'Edit Driver' : 'Add New Driver'}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">&times;</button>
                </div>
                {error && <div className="p-3 mb-4 text-sm bg-red-100 text-red-700 rounded-md">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
                        <InputField label="Mobile Number" name="mobile" value={formData.mobile} onChange={handleChange} required />
                        <InputField label="Aadhar Number" name="aadhar" value={formData.aadhar} onChange={handleChange} />
                        <InputField label="Driving Licence" name="driving_licence" value={formData.driving_licence} onChange={handleChange} />
                        <div className="md:col-span-2">
                             <label className="block text-sm font-medium text-gray-700">Address</label>
                             <textarea name="address" rows={3} value={formData.address} onChange={handleChange} className="mt-1 input-field"/>
                        </div>
                        <InputField label="Van Number" name="van_number" value={formData.van_number} onChange={handleChange} required />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t">
                         <ImageUpload 
                            label="Driver's Photo"
                            currentUrl={formData.photo_url}
                            onUrlChange={handlePhotoUrlChange}
                            onUpload={handleUploadImage}
                        />
                        <ImageUpload 
                            label="Van's Photo"
                            currentUrl={formData.van_image_url}
                            onUrlChange={handleVanImageUrlChange}
                            onUpload={handleUploadImage}
                        />
                    </div>

                    <div className="flex justify-end items-center gap-4 pt-4 border-t">
                        <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">Cancel</button>
                        <button type="submit" disabled={saving} className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:bg-gray-400 flex items-center gap-2">
                            {saving && <Spinner size="5" />}
                            {saving ? 'Saving...' : 'Save Driver'}
                        </button>
                    </div>
                </form>
            </div>
             <style>{`.input-field { display: block; width: 100%; border-radius: 0.375rem; border: 1px solid #D1D5DB; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); }`}</style>
        </div>
    );
};

const InputField: React.FC<any> = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <input type="text" {...props} className="mt-1 input-field"/>
    </div>
);

export default DriverModal;
