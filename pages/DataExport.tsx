import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import Spinner from '../components/Spinner';
import DownloadIcon from '../components/icons/DownloadIcon';

const DataExport: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const tables = [
        'owner', 'staff', 'students', 'classes', 'subjects', 
        'assign_class', 'attendance', 'expenses', 'fees_types', 'salary_records', 'driver'
    ];

    const removeUidFromRecords = (records: any[]) => {
        if (!records) return [];
        return records.map(record => {
            const { uid, ...rest } = record;
            return rest;
        });
    };

    const handleDownload = async () => {
        setLoading(true);
        setMessage(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                throw new Error("You must be logged in to export data.");
            }

            const fetchPromises = tables.map(table => supabase.from(table).select('*').eq('uid', user.id));
            const responses = await Promise.all(fetchPromises);

            const schoolData: { [key: string]: any[] } = {};
            let hasError = false;

            responses.forEach((res, index) => {
                const tableName = tables[index];
                if (res.error) {
                    console.error(`Error fetching ${tableName}:`, res.error);
                    // Ignore "no rows found" error, as some tables might be empty
                    if (res.error.code !== 'PGRST116') { 
                       hasError = true;
                    }
                    schoolData[tableName] = [];
                } else {
                    schoolData[tableName] = removeUidFromRecords(res.data);
                }
            });

            if (hasError) {
                 throw new Error("An error occurred while fetching some of the data. The downloaded file may be incomplete.");
            }
            
            const schoolName = schoolData.owner[0]?.school_name || 'school';
            const fileName = `${schoolName.toLowerCase().replace(/\s+/g, '_')}_data_export_${new Date().toISOString().split('T')[0]}.json`;

            const jsonData = JSON.stringify(schoolData, null, 2);
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setMessage({ type: 'success', text: 'Data export started successfully!' });

        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'An unknown error occurred during data export.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800">Data Export</h1>
            <p className="mt-2 text-gray-600">Download a complete backup of all your school's data in a single JSON file. This includes profiles, students, staff, classes, expenses, and more.</p>

            <div className="mt-8 p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
                <p className="text-yellow-700 bg-yellow-50 p-3 rounded-md mb-6">
                    <strong>Note:</strong> The downloaded file will not contain user IDs (`uid`) for privacy and security reasons.
                </p>
                
                <button
                    onClick={handleDownload}
                    disabled={loading}
                    className="px-8 py-4 bg-primary text-white text-lg font-semibold rounded-md hover:bg-primary-dark disabled:bg-gray-400 flex items-center justify-center gap-3 transition-colors w-full md:w-auto mx-auto"
                >
                    {loading ? <Spinner size="6" /> : <DownloadIcon />}
                    {loading ? 'Exporting Data...' : 'Download All School Data'}
                </button>
            </div>
            
            {message && (
                <div className={`mt-6 p-4 text-sm rounded-md ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {message.text}
                </div>
            )}
        </div>
    );
};

export default DataExport;