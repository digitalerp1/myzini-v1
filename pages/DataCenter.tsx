
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
        description: 'Student profiles, roll numbers, and monthly fee records.', 
        fields: ['name', 'class', 'roll_number', 'mobile', 'father_name', 'registration_date', 'january...december'],
        example: { name: "Rahul", class: "10-A", roll_number: "101", mobile: "9876543210", january: "Paid" }
    },
    { 
        table: 'staff', 
        label: 'Staff', 
        description: 'Teachers and employee profiles with salary details.', 
        fields: ['name', 'staff_id', 'mobile', 'salary_amount', 'joining_date', 'is_active'],
        example: { name: "Amit Sir", staff_id: "STAFF-001", salary_amount: 25000, mobile: "9988776655" }
    },
    { 
        table: 'classes', 
        label: 'Classes', 
        description: 'Class definitions and default tuition fees.', 
        fields: ['class_name', 'school_fees', 'staff_id (Class Teacher ID)'],
        example: { class_name: "10-A", school_fees: 1200, staff_id: "STAFF-001" }
    },
    { 
        table: 'subjects', 
        label: 'Subjects', 
        description: 'List of academic subjects taught.', 
        fields: ['subject_name'],
        example: { subject_name: "Mathematics" }
    },
    { 
        table: 'attendance', 
        label: 'Student Attendance', 
        description: 'Daily attendance logs for students.', 
        fields: ['class_id', 'date', 'present (comma separated rolls)', 'absent'],
        example: { class_id: 15, date: "2024-05-20", present: "101,102,105", absent: "103,104" }
    },
    { 
        table: 'staff_attendence', 
        label: 'Staff Attendance', 
        description: 'Daily attendance logs for employees.', 
        fields: ['date', 'staff_id (comma separated present IDs)'],
        example: { date: "2024-05-20", staff_id: "STAFF-001,STAFF-002" }
    },
    { 
        table: 'fees_types', 
        label: 'Fee Structures', 
        description: 'Definitions for extra fees like Transport, Exams, etc.', 
        fields: ['fees_name', 'amount', 'frequency'],
        example: { fees_name: "Annual Charge", amount: 5000, frequency: "Yearly" }
    },
    { 
        table: 'salary_records', 
        label: 'Salary Ledger', 
        description: 'History of salary payments made to staff.', 
        fields: ['staff_id', 'amount', 'date_time', 'notes'],
        example: { staff_id: "STAFF-001", amount: 25000, date_time: "2024-05-01", notes: "May Salary" }
    },
    { 
        table: 'expenses', 
        label: 'Expenses', 
        description: 'School operational expenses.', 
        fields: ['category', 'amount', 'date', 'notes'],
        example: { category: "Electricity", amount: 4500, date: "2024-05-15" }
    },
    { 
        table: 'driver', 
        label: 'Transport Drivers', 
        description: 'Driver profiles and vehicle details.', 
        fields: ['name', 'mobile', 'van_number', 'driver_id'],
        example: { name: "Rajesh", mobile: "9876543210", van_number: "UP-16-AB-1234", driver_id: "DRV-001" }
    },
    { 
        table: 'assign_class', 
        label: 'Class Routine', 
        description: 'Subject teacher assignments and timings.', 
        fields: ['class_id', 'subject_id', 'staff_id', 'incoming_time', 'outgoing_time'],
        example: { class_id: 1, subject_id: 5, staff_id: "STAFF-001", incoming_time: "09:00", outgoing_time: "10:00" }
    }
];

const DataCenter: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [activeDoc, setActiveDoc] = useState<string | null>(null);
    const [importingTable, setImportingTable] = useState<string | null>(null);

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 8000);
    };

    // --- Bulk Operations ---

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

            downloadJSON(exportData, `my_zini_full_backup_${new Date().toISOString().split('T')[0]}`);
            showMessage('success', "Full school database exported successfully.");
        } catch (err: any) {
            showMessage('error', `Export failed: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleBulkImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!window.confirm("CRITICAL: Bulk import will add records to multiple tables. Continue?")) {
            e.target.value = ''; return;
        }

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Auth failed.");

            const text = await file.text();
            const jsonData = JSON.parse(text);
            let summary = "";

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
                const count = await processTable('students', jsonData); // Default assumption
                summary = `Imported ${count} records into Students.`;
            } else {
                for (const tableKey in jsonData) {
                    const rows = jsonData[tableKey];
                    if (Array.isArray(rows) && rows.length > 0) {
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

    // --- Individual Operations ---

    const handleSingleExport = async (table: string, label: string) => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Auth failed.");

            const { data, error } = await supabase.from(table).select('*').eq('uid', user.id);
            if (error) throw error;

            if (!data || data.length === 0) {
                showMessage('error', `No records found in ${label} to export.`);
                return;
            }

            const cleanData = data.map(({ uid, id, created_at, ...rest }) => rest);
            downloadJSON(cleanData, `${label.toLowerCase().replace(/\s/g, '_')}_export`);
            showMessage('success', `${label} exported successfully.`);
        } catch (err: any) {
            showMessage('error', `Export failed: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSingleImport = async (e: React.ChangeEvent<HTMLInputElement>, table: string, label: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!window.confirm(`Importing into ${label}. This adds new records. Continue?`)) {
            e.target.value = ''; return;
        }

        setImportingTable(table);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Auth required.");

            const text = await file.text();
            const jsonData = JSON.parse(text);

            if (!Array.isArray(jsonData)) throw new Error("File must contain a JSON array of records.");

            const dataToInsert = jsonData.map(item => {
                const { id, uid, created_at, ...rest } = item;
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

    const downloadJSON = (data: any, filename: string) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-20">
            {/* Header / Bulk Actions */}
            <div className="bg-gradient-to-r from-gray-900 to-indigo-900 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
                    <ArchiveIcon className="w-96 h-96" />
                </div>
                <div className="relative z-10">
                    <h1 className="text-4xl font-black mb-3">Data Center</h1>
                    <p className="text-indigo-200 text-lg mb-8 max-w-2xl">
                        Manage your school's database directly. Perform bulk backups or granular updates for specific entities like Students, Staff, and Fees.
                    </p>
                    
                    <div className="flex flex-wrap gap-4">
                        <button onClick={handleBulkExport} disabled={loading} className="btn-bulk bg-white text-indigo-900 hover:bg-indigo-50">
                            {loading ? <Spinner size="5" /> : <DownloadIcon />}
                            Download Full Backup
                        </button>
                        
                        <div className="relative">
                            <input type="file" accept=".json" onChange={handleBulkImport} className="absolute inset-0 opacity-0 cursor-pointer z-20" disabled={loading} />
                            <button disabled={loading} className="btn-bulk bg-indigo-600 text-white hover:bg-indigo-500 border border-indigo-500">
                                <PlusIcon className="w-5 h-5" />
                                Restore Full Backup
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Entity Grid */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <span className="bg-indigo-100 text-indigo-700 p-1 rounded">
                            <ArchiveIcon className="w-6 h-6" />
                        </span>
                        Individual Entity Management
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {entities.map((e) => (
                            <div key={e.table} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all group">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="font-bold text-lg text-gray-800">{e.label}</h3>
                                    <button 
                                        onClick={() => setActiveDoc(e.table)} 
                                        className="text-xs text-indigo-500 font-semibold hover:text-indigo-700 bg-indigo-50 px-2 py-1 rounded"
                                    >
                                        Schema ?
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mb-6 min-h-[32px]">{e.description}</p>
                                
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => handleSingleExport(e.table, e.label)}
                                        disabled={loading || !!importingTable}
                                        className="flex items-center justify-center gap-2 py-2 px-3 bg-white border border-gray-300 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-50 transition-colors"
                                    >
                                        <DownloadIcon /> Export
                                    </button>
                                    
                                    <div className="relative">
                                        <input
                                            type="file" accept=".json"
                                            onChange={(ev) => handleSingleImport(ev, e.table, e.label)}
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                            disabled={loading || !!importingTable}
                                        />
                                        <button
                                            disabled={loading || !!importingTable}
                                            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors"
                                        >
                                            {importingTable === e.table ? <Spinner size="3" /> : 'Import'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Schema Documentation Sidebar */}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 h-fit sticky top-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        Schema Guide
                    </h2>
                    
                    {activeDoc ? (
                        <div className="animate-fade-in">
                            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
                                <h3 className="font-black text-indigo-600 uppercase text-sm">{activeDoc}</h3>
                                <button onClick={() => setActiveDoc(null)} className="text-gray-400 hover:text-red-500">&times;</button>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">Required Fields</p>
                                    <ul className="text-xs text-gray-700 space-y-1 bg-white p-3 rounded border border-gray-200">
                                        {entities.find(e => e.table === activeDoc)?.fields.map(f => (
                                            <li key={f} className="flex items-start gap-2">
                                                <span className="text-indigo-400">•</span> {f}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">Sample JSON Object</p>
                                    <pre className="text-[10px] bg-gray-900 text-green-400 p-3 rounded border border-gray-800 overflow-x-auto font-mono leading-relaxed">
                                        {JSON.stringify(entities.find(e => e.table === activeDoc)?.example, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-400">
                            <p className="text-sm">Select 'Schema ?' on any card to view the required JSON format for importing data.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Notifications */}
            {message && (
                <div className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center gap-3 animate-bounce border-2
                    ${message.type === 'error' ? 'bg-white border-red-500 text-red-600' : 'bg-white border-green-500 text-green-600'}`}>
                    <span className="text-xl">{message.type === 'error' ? '⚠️' : '✅'}</span>
                    <span className="font-bold">{message.text}</span>
                </div>
            )}

            <style>{`
                .btn-bulk {
                    display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1.5rem;
                    font-weight: 700; border-radius: 0.75rem; transition: all 0.2s;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
                .btn-bulk:active { transform: scale(0.98); }
            `}</style>
        </div>
    );
};

export default DataCenter;
