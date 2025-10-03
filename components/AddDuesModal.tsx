
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Class } from '../types';
import Spinner from './Spinner';

interface AddDuesModalProps {
    onClose: () => void;
    onSuccess: (className: string, month: string) => void;
}

const monthNames = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

const AddDuesModal: React.FC<AddDuesModalProps> = ({ onClose, onSuccess }) => {
    const [classes, setClasses] = useState<Class[]>([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(monthNames[new Date().getMonth()]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchClasses = async () => {
            const { data, error } = await supabase.from('classes').select('*').order('class_name');
            if (error) {
                setError(error.message);
            } else {
                setClasses(data as Class[]);
                if (data.length > 0) {
                    setSelectedClass(data[0].class_name);
                }
            }
            setLoading(false);
        };
        fetchClasses();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClass || !selectedMonth) {
            setError("Please select both a class and a month.");
            return;
        }

        const confirmation = window.confirm(
            `Are you sure you want to add '${selectedMonth}' dues for all unpaid students in ${selectedClass}? This action cannot be undone.`
        );

        if (!confirmation) {
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

        const updatePayload = { [selectedMonth]: 'Dues' };

        // FIX: Scoped the update to the logged-in user and only for students who haven't paid.
        // This ensures one school owner cannot accidentally modify another's data and prevents overwriting paid fees.
        const { error } = await supabase
            .from('students')
            .update(updatePayload)
            .eq('uid', user.id) // Scope to the logged-in user
            .eq('class', selectedClass)
            .or(`${selectedMonth}.eq.undefined,${selectedMonth}.is.null`);

        if (error) {
            setError(`Failed to update student records: ${error.message}`);
        } else {
            onSuccess(selectedClass, selectedMonth);
        }
        setSaving(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Add Dues to a Class</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl">&times;</button>
                </div>

                {error && <div className="p-3 mb-4 text-sm bg-red-100 text-red-700 rounded-md">{error}</div>}
                
                {loading ? <div className="flex justify-center"><Spinner /></div> : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="class" className="block text-sm font-medium text-gray-700">Class</label>
                            <select id="class" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} required className="mt-1 input-field">
                                {classes.map(c => <option key={c.id} value={c.class_name}>{c.class_name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="month" className="block text-sm font-medium text-gray-700">Month</label>
                            <select id="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} required className="mt-1 input-field">
                                {monthNames.map(month => <option key={month} value={month} className="capitalize">{month}</option>)}
                            </select>
                        </div>
                        <p className="text-sm text-yellow-700 bg-yellow-50 p-3 rounded-md">
                            <strong>Warning:</strong> This will mark the selected month's fee as 'Dues' for all students in the chosen class who have not yet paid.
                        </p>
                        <div className="flex justify-end items-center gap-4 pt-4">
                            <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                                Cancel
                            </button>
                            <button type="submit" disabled={saving} className="px-6 py-2 bg-secondary text-white rounded-md hover:bg-green-600 disabled:bg-gray-400 flex items-center gap-2">
                                {saving && <Spinner size="5" />}
                                {saving ? 'Adding Dues...' : 'Confirm and Add Dues'}
                            </button>
                        </div>
                    </form>
                )}
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

export default AddDuesModal;
