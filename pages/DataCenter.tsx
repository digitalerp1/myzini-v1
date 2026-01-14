
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
        table: 'owner', 
        label: 'School Profile', 
        description: 'Basic school information and settings.', 
        fields: ['school_name', 'mobile_number', 'address', 'principal_name'],
        example: { school_name: "Bright Future School", mobile_number: "9876543210", address: "123 Main St", principal_name: "Dr. Smith" }
    },
    { 
        table: 'students', 
        label: 'Students Registry', 
        description: 'Student profiles, parent details, and monthly fee status.', 
        fields: ['name', 'class', 'roll_number', 'mobile', 'father_name', 'registration_date'],
        example: { name: "John Doe", class: "10-A", roll_number: "101", mobile: "9876543210", father_name: "Robert Doe" }
    },
    { 
        table: 'staff', 
        label: 'Staff Records', 
        description: 'Teacher and employee data with payroll configuration.', 
        fields: ['name', 'staff_id', 'mobile', 'salary_amount', 'joining_date'],
        example: { name: "Alice Prof", staff_id: "ST-001", salary_amount: 30000, mobile: "9988776655" }
    },
    { 
        table: 'classes', 
        label: 'Class Setup', 
        description: 'Class names and associated tuition fees.', 
        fields: ['class_name', 'school_fees', 'staff_id'],
        example: { class_name: "10-A", school_fees: 1500, staff_id: "ST-001" }
    },
    { 
        table: 'subjects', 
        label: 'Subjects List', 
        description: 'Academic subjects managed in the system.', 
        fields: ['subject_name'],
        example: { subject_name: "Mathematics" }
    },
    { 
        table: 'fees_types', 
        label: 'Other Fee Types', 
        description: 'Non-tuition fee categories like Bus or Exams.', 
        fields: ['fees_name', 'amount', 'frequency'],
        example: { fees_name: "Bus Fee", amount: 800, frequency: "Monthly" }
    },
    { 
        table: 'expenses', 
        label: 'Expense Ledger', 
        description: 'Operational school expenditures.', 
        fields: ['category', 'amount', 'date', 'notes'],
        example: { category: "Maintenance", amount: 2000, date: "2024-03-01", notes: "Plumbing repair" }
    },
    { 
        table: 'salary_records', 
        label: 'Salary Payments', 
        description: 'Historical records of salary disbursed to staff.', 
        fields: ['staff_id', 'amount', 'date_time', 'notes'],
        example: { staff_id: "ST-001", amount: 30000, date_time: "2024-03-01", notes: "Feb Salary" }
    }
];

const DataCenter: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [activeDoc, setActiveDoc] = useState<string | null>(null);
    const [importingTable, setImportingTable] = useState<string | null>(null);
    const [progress, setProgress] = useState<{current: number, total: number} | null>(null);

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 8000);
    };

    const cleanRecordForRLS = (record: any, userUid: string) => {
        const cleaned: any = { ...record };
        // Remove potentially conflicting metadata
        delete cleaned.created_at;
        delete cleaned.id; 
        
        // SECURE: Overwrite or inject current user UID
        cleaned['uid'] = userUid;
        
        // Handle empty strings to null for DB consistency
        Object.keys(cleaned).forEach(key => {
            if (cleaned[key] === "" || cleaned[key] === "undefined") cleaned[key] = null;
        });
        
        return cleaned;
    };

    const handleSingleImport = async (e: React.ChangeEvent<HTMLInputElement>, table: string, label: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setImportingTable(table);
        setProgress(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Authentication required.");

            const text = await file.text();
            const jsonData = JSON.parse(text);

            if (!Array.isArray(jsonData)) throw new Error("Invalid format: File must contain a JSON array.");

            let successCount = 0;
            let errorCount = 0;

            for (let i = 0; i < jsonData.length; i++) {
                setProgress({ current: i + 1, total: jsonData.length });
                const cleanedData = cleanRecordForRLS(jsonData[i], user.id);
                
                // We use individual upsert to ensure RLS policies are checked per record 
                // and to prevent one bad record from failing the entire block.
                const { error } = await supabase.from(table).upsert(cleanedData);
                
                if (error) {
                    console.error(`Error in record ${i}:`, error);
                    errorCount++;
                } else {
                    successCount++;
                }
            }

            showMessage('success', `Import Complete: ${successCount} successfully added/updated to ${label}. ${errorCount > 0 ? `${errorCount} failed.` : ''}`);
        } catch (err: any) {
            showMessage('error', `Import Failed: ${err.message}`);
        } finally {
            setLoading(false);
            setImportingTable(null);
            setProgress(null);
            e.target.value = '';
        }
    };

    const handleBulkExport = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Auth failed.");

            const exportData: any = {};
            for (const entity of entities) {
                const { data, error } = await supabase.from(entity.table).select('*').eq('uid', user.id);
                if (!error && data) exportData[entity.table] = data;
            }

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `full_school_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            showMessage('success', "Full database backup generated successfully.");
        } catch (err: any) {
            showMessage('error', `Export failed: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-20">
            {/* Header / Global Actions */}
            <div className="bg-slate-900 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4 scale-150">
                    <ArchiveIcon />
                </div>
                <div className="relative z-10">
                    <h1 className="text-4xl font-black mb-3">Data Center</h1>
                    <p className="text-slate-400 text-lg mb-8 max-w-2xl font-medium">
                        Secure bulk data management. Upload records individually to ensure policy compliance and data integrity.
                    </p>
                    <button onClick={handleBulkExport} disabled={loading} className="flex items-center gap-3 bg-white text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-slate-100 transition-all shadow-lg">
                        <DownloadIcon /> Download Full School Backup
                    </button>
                </div>
            </div>

            {loading && progress && (
                <div className="bg-indigo-600 text-white p-4 rounded-xl shadow-lg animate-pulse flex items-center justify-between px-8">
                    <div className="flex items-center gap-4">
                        <Spinner size="6" />
                        <span className="font-bold">Importing {importingTable}... Please do not close the window.</span>
                    </div>
                    <span className="font-mono">{progress.current} / {progress.total} Records</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {entities.map((e) => (
                        <div key={e.table} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-xl text-slate-800">{e.label}</h3>
                                <button onClick={() => setActiveDoc(e.table)} className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded font-bold uppercase tracking-wider hover:bg-slate-200">Format</button>
                            </div>
                            <p className="text-sm text-slate-500 mb-6 leading-relaxed">{e.description}</p>
                            
                            <div className="relative">
                                <input
                                    type="file" accept=".json"
                                    onChange={(ev) => handleSingleImport(ev, e.table, e.label)}
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                    disabled={loading}
                                />
                                <button
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl text-sm font-black hover:bg-primary-dark transition-all shadow-sm"
                                >
                                    {importingTable === e.table ? <Spinner size="4" /> : <><PlusIcon /> Bulk Upload {e.label}</>}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Docs Sidebar */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 h-fit sticky top-6 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        JSON Format Guide
                    </h2>
                    
                    {activeDoc ? (
                        <div className="animate-fade-in space-y-4">
                            <div className="flex justify-between items-center border-b pb-2">
                                <span className="font-black text-primary uppercase text-xs">{activeDoc}</span>
                                <button onClick={() => setActiveDoc(null)} className="text-slate-400 hover:text-red-500 font-bold">Close</button>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Required Schema</p>
                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <ul className="text-xs text-slate-600 space-y-1">
                                        {entities.find(e => e.table === activeDoc)?.fields.map(f => (
                                            <li key={f} className="flex items-center gap-2">
                                                <div className="w-1 h-1 bg-primary rounded-full"></div> {f}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Example Object</p>
                                <pre className="text-[10px] bg-slate-900 text-emerald-400 p-4 rounded-xl overflow-x-auto font-mono leading-relaxed">
                                    {JSON.stringify(entities.find(e => e.table === activeDoc)?.example, null, 2)}
                                </pre>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-slate-400">
                            <p className="text-sm italic font-medium">Click 'Format' on any card to see the required JSON structure.</p>
                        </div>
                    )}
                </div>
            </div>

            {message && (
                <div className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 px-8 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3 border-2 animate-bounce
                    ${message.type === 'error' ? 'bg-white border-red-500 text-red-600' : 'bg-white border-primary text-primary'}`}>
                    <span className="text-xl">{message.type === 'error' ? '⚠️' : '✅'}</span>
                    <span className="font-black">{message.text}</span>
                </div>
            )}
        </div>
    );
};

export default DataCenter;
