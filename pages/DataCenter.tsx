
import React, { useState, useCallback } from 'react';
import { supabase } from '../services/supabase';
import Spinner from '../components/Spinner';
import DownloadIcon from '../components/icons/DownloadIcon';
import ArchiveIcon from '../components/icons/ArchiveIcon';

interface EntityConfig {
    table: string;
    label: string;
    description: string;
    format: string;
}

const entities: EntityConfig[] = [
    { table: 'students', label: 'Students', description: 'Student profiles, admission details, and fees status.', format: '{ "name": "string", "class": "string", "roll_number": "string", ... }' },
    { table: 'staff', label: 'Staff', description: 'Teacher and employee records including salary amounts.', format: '{ "name": "string", "staff_id": "string", "salary_amount": number, ... }' },
    { table: 'attendance', label: 'Student Attendance', description: 'Daily attendance logs for all classes.', format: '{ "class_id": number, "date": "YYYY-MM-DD", "present": "string", ... }' },
    { table: 'staff_attendence', label: 'Staff Attendance', description: 'Daily staff attendance logs.', format: '{ "date": "YYYY-MM-DD", "staff_id": "comma,separated,ids" }' },
    { table: 'salary_records', label: 'Salary Payments', description: 'Transaction history of salaries paid to staff.', format: '{ "staff_id": "string", "amount": number, "date_time": "ISO_DATE" }' },
    { table: 'expenses', label: 'General Expenses', description: 'School overhead costs and other expenses.', format: '{ "category": "string", "amount": number, "date": "YYYY-MM-DD" }' },
];

const DataCenter: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [importingTable, setImportingTable] = useState<string | null>(null);

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 10000);
    };

    const handleExport = async (table: string, label: string) => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Authentication failed.");

            const { data, error } = await supabase.from(table).select('*').eq('uid', user.id);
            if (error) throw error;

            if (!data || data.length === 0) {
                showMessage('error', `No records found in ${label} to export.`);
                return;
            }

            // Remove internal metadata
            const cleanData = data.map(({ uid, id, created_at, ...rest }) => rest);

            const blob = new Blob([JSON.stringify(cleanData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `zini_${table}_export_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            showMessage('success', `${label} data exported successfully.`);
        } catch (err: any) {
            showMessage('error', `Export failed: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>, table: string, label: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!window.confirm(`Warning: You are about to import data into ${label}. This will add new records. Ensure the format is correct. Proceed?`)) {
            e.target.value = '';
            return;
        }

        setImportingTable(table);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Authentication required.");

            const text = await file.text();
            const jsonData = JSON.parse(text);

            if (!Array.isArray(jsonData)) {
                throw new Error("Invalid file format. Data must be a JSON array.");
            }

            // Prepare data by injecting current user UID and removing any existing IDs to avoid conflicts
            const dataToInsert = jsonData.map(item => {
                const { id, uid, ...rest } = item;
                return { ...rest, uid: user.id };
            });

            const { error } = await supabase.from(table).insert(dataToInsert);
            if (error) throw error;

            showMessage('success', `Successfully imported ${dataToInsert.length} records into ${label}.`);
        } catch (err: any) {
            showMessage('error', `Import failed: ${err.message}`);
        } finally {
            setImportingTable(null);
            e.target.value = '';
        }
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-12">
            <div className="bg-indigo-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
                    <ArchiveIcon className="w-64 h-64" />
                </div>
                <div className="relative z-10">
                    <h1 className="text-4xl font-black mb-2">School Data Center</h1>
                    <p className="text-indigo-200 text-lg">Central hub for manual data migration, backup, and imports.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {entities.map((entity) => (
                    <div key={entity.table} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">{entity.label}</h3>
                                <p className="text-sm text-gray-500 mt-1">{entity.description}</p>
                            </div>
                            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                <ArchiveIcon className="w-6 h-6" />
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3 mb-6 font-mono text-[10px] text-gray-600 border border-gray-100">
                            <p className="font-bold text-indigo-700 mb-1 uppercase tracking-widest">Required Structure</p>
                            {entity.format}
                        </div>

                        <div className="mt-auto grid grid-cols-2 gap-4">
                            <button
                                onClick={() => handleExport(entity.table, entity.label)}
                                disabled={loading}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border-2 border-indigo-600 text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 disabled:opacity-50 transition-colors"
                            >
                                <DownloadIcon /> Export
                            </button>
                            
                            <div className="relative">
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={(e) => handleImport(e, entity.table, entity.label)}
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                                    disabled={!!importingTable}
                                />
                                <button
                                    disabled={!!importingTable}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:bg-gray-400 transition-colors"
                                >
                                    {importingTable === entity.table ? <Spinner size="5" /> : 'Import JSON'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {message && (
                <div className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 p-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3 animate-bounce
                    ${message.type === 'error' ? 'bg-rose-100 border-2 border-rose-500 text-rose-800' : 'bg-emerald-100 border-2 border-emerald-500 text-emerald-800'}`}>
                    <span className="font-bold text-lg">{message.type === 'error' ? '✖' : '✔'}</span>
                    <span className="font-medium">{message.text}</span>
                </div>
            )}

            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 text-amber-800">
                <h4 className="font-bold flex items-center gap-2 text-lg mb-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    Safety Instructions
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm opacity-90">
                    <li>Always <strong>Export</strong> your current data as a backup before performing an <strong>Import</strong>.</li>
                    <li>Imports <strong>do not delete</strong> existing records; they only add new rows to the database.</li>
                    <li>If you import duplicate data (same roll numbers, same dates), it may create duplicate entries.</li>
                    <li>Ensure all date fields follow the <code>YYYY-MM-DD</code> format for proper indexing.</li>
                </ul>
            </div>
        </div>
    );
};

export default DataCenter;
