
import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Expense } from '../types';
import Spinner from './Spinner';

interface ExpenseModalProps {
    expense: Expense | null;
    onClose: () => void;
    onSave: () => void;
}

const ExpenseModal: React.FC<ExpenseModalProps> = ({ expense, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<Expense>>({
        date: expense?.date || new Date().toISOString().split('T')[0],
        category: expense?.category || '',
        amount: expense?.amount || undefined,
        notes: expense?.notes || '',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.amount || formData.amount <= 0) {
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

        if (expense) { // Editing
            const { error } = await supabase.from('expenses').update(dataToSave).eq('id', expense.id);
            if (error) setError(error.message);
            else onSave();
        } else { // Adding
            const { error } = await supabase.from('expenses').insert([dataToSave]);
            if (error) setError(error.message);
            else onSave();
        }
        setSaving(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">{expense ? 'Edit Expense' : 'Add New Expense'}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl">&times;</button>
                </div>
                {error && <div className="p-3 mb-4 text-sm bg-red-100 text-red-700 rounded-md">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                        <input type="date" id="date" name="date" value={formData.date} onChange={handleChange} required className="mt-1 input-field"/>
                    </div>
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                        <input type="text" id="category" name="category" value={formData.category} onChange={handleChange} required placeholder="e.g., Office Supplies, Utilities" className="mt-1 input-field"/>
                    </div>
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
                        <input type="number" id="amount" name="amount" value={formData.amount || ''} onChange={handleChange} required placeholder="e.g., 1500" className="mt-1 input-field"/>
                    </div>
                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
                        <textarea id="notes" name="notes" rows={3} value={formData.notes} onChange={handleChange} className="mt-1 input-field" placeholder="Add any relevant details..."/>
                    </div>
                    <div className="flex justify-end items-center gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                            Cancel
                        </button>
                        <button type="submit" disabled={saving} className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:bg-gray-400 flex items-center gap-2">
                            {saving && <Spinner size="5" />}
                            {saving ? 'Saving...' : 'Save Expense'}
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

export default ExpenseModal;