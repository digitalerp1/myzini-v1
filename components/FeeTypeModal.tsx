
import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { FeeType } from '../types';
import Spinner from './Spinner';

interface FeeTypeModalProps {
    feeType: FeeType | null;
    onClose: () => void;
    onSave: () => void;
}

const frequencyOptions = [
    'One-Time',
    'Monthly',
    'Quarterly (Every 3 months)',
    'Half-Yearly (Every 6 months)',
    'Yearly'
];

const FeeTypeModal: React.FC<FeeTypeModalProps> = ({ feeType, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<FeeType>>({
        fees_name: feeType?.fees_name || '',
        amount: feeType?.amount || undefined,
        frequency: feeType?.frequency || 'Monthly',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.amount || Number(formData.amount) <= 0) {
            setError("Please enter a valid amount.");
            return;
        }
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
            amount: Number(formData.amount),
        };

        if (feeType) { // Editing
            const { error } = await supabase.from('fees_types').update(dataToSave).eq('id', feeType.id);
            if (error) setError(error.message);
            else onSave();
        } else { // Adding
            const { error } = await supabase.from('fees_types').insert([dataToSave]);
            if (error) setError(error.message);
            else onSave();
        }
        setSaving(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">{feeType ? 'Edit Fee Type' : 'Add New Fee Type'}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl">&times;</button>
                </div>
                {error && <div className="p-3 mb-4 text-sm bg-red-100 text-red-700 rounded-md">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="fees_name" className="block text-sm font-medium text-gray-700">Fee Name</label>
                        <input type="text" id="fees_name" name="fees_name" value={formData.fees_name} onChange={handleChange} required placeholder="e.g., Tution Fee, Exam Fee" className="mt-1 input-field"/>
                    </div>
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
                        <input type="number" id="amount" name="amount" value={formData.amount || ''} onChange={handleChange} required placeholder="e.g., 1500" className="mt-1 input-field"/>
                    </div>
                     <div>
                        <label htmlFor="frequency" className="block text-sm font-medium text-gray-700">Frequency</label>
                        <select id="frequency" name="frequency" value={formData.frequency} onChange={handleChange} required className="mt-1 input-field">
                            {frequencyOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>

                    <div className="flex justify-end items-center gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                            Cancel
                        </button>
                        <button type="submit" disabled={saving} className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:bg-gray-400 flex items-center gap-2">
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

export default FeeTypeModal;
