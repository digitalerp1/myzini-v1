
import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import Spinner from '../components/Spinner';
import DownloadIcon from '../components/icons/DownloadIcon';
import ArchiveIcon from '../components/icons/ArchiveIcon';
import PlusIcon from '../components/icons/PlusIcon';

interface EntityConfig {
    table: string;
    label: string;
    description: string;
    fields: string[];
    example: any;
}

const entities: EntityConfig[] = [
    { 
        table: 'students', 
        label: 'Students', 
        description: 'Complete student profiles and monthly fee statuses.', 
        fields: ['name', 'class', 'roll_number', 'mobile', 'father_name', 'registration_date', 'january...december (Status String)'],
        example: { name: "John Doe", class: "10-A", roll_number: "101", january: "Paid", february: "Dues" }
    },
    { 
        table: 'staff', 
        label: 'Staff', 
        description: 'Employee records and base salary configurations.', 
        fields: ['name', 'staff_id', 'mobile', 'salary_amount', 'joining_date', 'is_active'],
        example: { name: "Alice Smith", staff_id: "STAFF-001", salary_amount: 25000, is_active: true }
    },
    { 
        table: 'attendance', 
        label: 'Attendance', 
        description: 'Daily student presence logs.', 
        fields: ['class_id (Number)', 'date (YYYY-MM-DD)', 'present (Roll numbers string)', 'absent (Roll numbers string)'],
        example: { class_id: 12, date: "2024-05-20", present: "101,102,105", absent: "103,104" }
    },
    { 
        table: 'salary_records', 
        label: 'Salary Ledger', 
        description: 'Payment history of staff salaries.', 
        fields: ['staff_id', 'amount', 'date_time', 'notes'],
        example: { staff_id: "STAFF-001", amount: 25000, date_time: "2024-05-01T10:00:00Z" }
    },
    { 
        table: 'expenses', 
        label: 'Expenses', 
        description: 'General school overheads.', 
        fields: ['category', 'amount', 'date (YYYY-MM-DD)', 'notes'],
        example: { category: "Stationery", amount: 1200, date: "2024-05-15" }
    }
];

const DataCenter: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [activeDoc, setActiveDoc] = useState<string | null>(null);

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 8000);
    };

    const handleBulkExport = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Authentication failed.");

            const exportData: any = {};
            for (const entity of entities) {
                const { data, error } = await supabase.from(entity.table).select('*').eq('uid', user.id);
                if (!error && data) {
                    exportData[entity.table] = data.map(({ uid, id, created_at, ...rest }) => rest);
                }
            }

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `my_zini_full_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            showMessage('success', "Full school database exported successfully into one file.");
        } catch (err: any) {
            showMessage('error', `Export failed: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleBulkImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!window.confirm("CRITICAL: You are about to perform a bulk import. This will add new records to multiple tables. Continue?")) {
            e.target.value = '';
            return;
        }

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Auth failed.");

            const text = await file.text();
            const jsonData = JSON.parse(text);
            let summary = "";

            // Check if it's a multi-entity object or a single array
            const processTable = async (tableName: string, rows: any[]) => {
                const dataToInsert = rows.map(item => {
                    const { id, uid, created_at, ...rest } = item;
                    return { ...rest, uid: user.id };
                });
                const { error } = await supabase.from(tableName).insert(dataToInsert);
                if (error) throw new Error(`Error in ${tableName}: ${error.message}`);
                return dataToInsert.length;
            };

            if (Array.isArray(jsonData)) {
                // If it's a single array, we need to ask or assume table (default to students for safety)
                const count = await processTable('students', jsonData);
                summary = `Imported ${count} records into Students.`;
            } else {
                // It's a bulk object { students: [...], staff: [...] }
                for (const tableKey in jsonData) {
                    const rows = jsonData[tableKey];
                    if (Array.isArray(rows)) {
                        const count = await processTable(tableKey, rows);
                        summary += `[${tableKey}: ${count}] `;
                    }
                }
            }

            showMessage('success', `Bulk Import Complete: ${summary}`);
        } catch (err: any) {
            showMessage('error', `Import Interrupted: ${err.message}`);
        } finally {
            setLoading(false);
            e.target.value = '';
        }
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-20">
            {/* Main Header Card */}
            <div className="bg-gradient-to-r from-primary-dark to-indigo-900 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
                    <ArchiveIcon className="w-96 h-96" />
                </div>
                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-5xl font-black mb-4">Data Center</h1>
                    <p className="text-indigo-100 text-xl leading-relaxed mb-8">
                        The master hub for school migration. Export your entire database into a single file or import thousands of records instantly.
                    </p>
                    
                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={handleBulkExport}
                            disabled={loading}
                            className="flex items-center gap-3 px-8 py-4 bg-white text-primary-dark font-black rounded-2xl hover:bg-indigo-50 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                        >
                            {loading ? <Spinner size="6" /> : <DownloadIcon />}
                            EXPORT FULL BACKUP
                        </button>
                        
                        <div className="relative">
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleBulkImport}
                                className="absolute inset-0 opacity-0 cursor-pointer z-20"
                                disabled={loading}
                            />
                            <button
                                disabled={loading}
                                className="flex items-center gap-3 px-8 py-4 bg-indigo-500 text-white font-black rounded-2xl hover:bg-indigo-400 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                            >
                                <PlusIcon className="w-6 h-6" />
                                IMPORT MASTER FILE
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Individual Table Management & Documentation */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <ArchiveIcon className="w-6 h-6 text-primary" />
                        Entity Specific Management
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {entities.map((e) => (
                            <div key={e.table} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="font-bold text-lg text-gray-800 mb-1">{e.label}</h3>
                                <p className="text-sm text-gray-500 mb-4">{e.description}</p>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setActiveDoc(e.table)}
                                        className="text-xs font-bold text-primary hover:underline"
                                    >
                                        View Format Guide
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Data Format Documentation Section */}
                <div className="bg-gray-100 rounded-3xl p-6 border-2 border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        Format Dictionary
                    </h2>
                    <p className="text-xs text-gray-500 mb-6">Select an entity to see the required JSON schema for importing.</p>
                    
                    {activeDoc ? (
                        <div className="space-y-4 animate-fade-in">
                            <div className="flex justify-between items-center">
                                <h3 className="font-black text-primary uppercase text-sm">{activeDoc} Structure</h3>
                                <button onClick={() => setActiveDoc(null)} className="text-gray-400 hover:text-gray-600 font-bold">&times;</button>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-300 font-mono text-[11px] overflow-x-auto">
                                <p className="font-bold text-gray-400 mb-2">// REQUIRED FIELDS</p>
                                <ul className="list-disc list-inside space-y-1 mb-4 text-gray-700">
                                    {entities.find(e => e.table === activeDoc)?.fields.map(f => <li key={f}>{f}</li>)}
                                </ul>
                                <p className="font-bold text-gray-400 mb-2">// EXAMPLE ROW</p>
                                <pre className="text-indigo-600">
                                    {JSON.stringify(entities.find(e => e.table === activeDoc)?.example, null, 2)}
                                </pre>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <div className="text-gray-300 mb-2">Select a table to view its schema</div>
                            <svg className="w-12 h-12 text-gray-200 mx-auto" fill="currentColor" viewBox="0 0 20 20"><path d="M9 4.804A7.993 7.993 0 002 12a7.998 7.998 0 003 6.338V17a1 1 0 012 0v1.338A7.998 7.998 0 0013 18.338V17a1 1 0 012 0v1.338A7.998 7.998 0 0018 12a7.993 7.993 0 00-7-7.196V4a1 1 0 10-2 0v.804z"></path></svg>
                        </div>
                    )}
                </div>
            </div>

            {/* Status Feedback Notification */}
            {message && (
                <div className={`fixed bottom-10 left-1/2 transform -translate-x-1/2 px-8 py-5 rounded-3xl shadow-2xl z-50 flex items-center gap-4 animate-bounce
                    ${message.type === 'error' ? 'bg-rose-100 border-4 border-rose-500 text-rose-900' : 'bg-emerald-100 border-4 border-emerald-500 text-emerald-900'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl ${message.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'} text-white`}>
                        {message.type === 'error' ? '!' : '✓'}
                    </div>
                    <div>
                        <p className="font-black text-lg">System Message</p>
                        <p className="text-sm font-medium">{message.text}</p>
                    </div>
                </div>
            )}

            {/* Warning Box */}
            <div className="bg-amber-50 border-4 border-amber-200 rounded-3xl p-8 text-amber-900 shadow-sm">
                <h4 className="font-black flex items-center gap-3 text-xl mb-4">
                    <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    CRITICAL SAFETY RULES
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm leading-relaxed opacity-90 font-medium">
                    <ul className="list-disc list-inside space-y-2">
                        <li><strong>Backup First:</strong> Always perform an Export before an Import.</li>
                        <li><strong>Structure:</strong> The master file must be an object with keys matching table names (e.g., "students", "staff").</li>
                        <li><strong>Dates:</strong> Use <code>YYYY-MM-DD</code> or <code>ISO-8601</code> strings for all date fields.</li>
                    </ul>
                    <ul className="list-disc list-inside space-y-2">
                        <li><strong>No Overwrites:</strong> Import only ADDS data; it does not delete or update existing records.</li>
                        <li><strong>Duplicate Check:</strong> If you import the same file twice, you will have duplicate records.</li>
                        <li><strong>Class ID:</strong> Attendance requires a numeric <code>class_id</code> from your database.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default DataCenter;
