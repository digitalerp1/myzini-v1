import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { Staff } from '../types';
import Spinner from '../components/Spinner';

const StaffAttendance: React.FC = () => {
    const [allStaff, setAllStaff] = useState<Staff[]>([]);
    const [presentStaffIds, setPresentStaffIds] = useState<Set<string>>(new Set());
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            const { data: staffData, error: staffError } = await supabase
                .from('staff')
                .select('*')
                .eq('is_active', true)
                .order('name');
            
            if (staffError) throw staffError;
            
            const activeStaff = (staffData as Staff[]).filter(s => s.staff_id);
            setAllStaff(activeStaff);

            const today = new Date().toISOString().split('T')[0];
            const { data: attendanceData, error: attendanceError } = await supabase
                .from('staff_attendence')
                .select('staff_id')
                .eq('date', today)
                .single();

            if (attendanceError && attendanceError.code !== 'PGRST116') { // Ignore 'No rows found'
                throw attendanceError;
            }

            if (attendanceData && attendanceData.staff_id) {
                const presentIds = new Set(attendanceData.staff_id.split(','));
                setPresentStaffIds(presentIds);
            } else {
                // If no record, mark all active staff as present by default
                // FIX: Explicitly type the Set to resolve a TypeScript inference issue where the constructor was returning Set<unknown>.
                const allIds = new Set<string>(activeStaff.map(s => s.staff_id));
                setPresentStaffIds(allIds);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleTogglePresence = (staffId: string) => {
        setPresentStaffIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(staffId)) {
                newSet.delete(staffId);
            } else {
                newSet.add(staffId);
            }
            return newSet;
        });
    };

    const markAll = (present: boolean) => {
        if (present) {
            const allIds = new Set<string>(allStaff.map(s => s.staff_id));
            setPresentStaffIds(allIds);
        } else {
            setPresentStaffIds(new Set());
        }
    };

    const handleSubmit = async () => {
        setSaving(true);
        setError(null);
        setMessage(null);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setError("You must be logged in to perform this action.");
            setSaving(false);
            return;
        }

        const presentIdsString = Array.from(presentStaffIds).join(',');
        const today = new Date().toISOString().split('T')[0];

        try {
            // Check if a record already exists for today. RLS automatically scopes this to the user.
            const { data: existingRecord, error: fetchError } = await supabase
                .from('staff_attendence')
                .select('id')
                .eq('date', today)
                .single();

            // PGRST116 means no rows found, which is an expected outcome for a new day.
            if (fetchError && fetchError.code !== 'PGRST116') {
                throw fetchError;
            }

            if (existingRecord) {
                // If record exists, update it.
                const { error: updateError } = await supabase
                    .from('staff_attendence')
                    .update({ staff_id: presentIdsString })
                    .eq('id', existingRecord.id);
                
                if (updateError) throw updateError;
            } else {
                // If no record exists, insert a new one.
                const { error: insertError } = await supabase
                    .from('staff_attendence')
                    .insert({
                        uid: user.id,
                        date: today,
                        staff_id: presentIdsString,
                    });
                
                if (insertError) throw insertError;
            }
            
            setMessage('Attendance saved successfully!');
            setTimeout(() => setMessage(null), 3000);

        } catch (err: any) {
            setError(`Failed to save attendance: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Staff Attendance</h1>
                    <p className="text-gray-600">Date: {new Date().toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => markAll(true)} className="px-4 py-2 bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition-colors">Mark All Present</button>
                    <button onClick={() => markAll(false)} className="px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors">Mark All Absent</button>
                </div>
            </div>
            
            {message && <div className="p-4 mb-4 text-sm rounded-md bg-green-100 text-green-700">{message}</div>}
            {error && <div className="p-4 mb-4 text-sm rounded-md bg-red-100 text-red-700">{error}</div>}

            {loading ? <div className="flex justify-center items-center h-96"><Spinner size="12" /></div> :
            allStaff.length === 0 ? <p className="text-gray-500 text-center">No active staff found. Please add staff members first.</p> :
            (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {allStaff.map(staff => (
                        <label key={staff.id} className="relative block border-2 rounded-lg p-3 cursor-pointer transition-all"
                            style={{borderColor: presentStaffIds.has(staff.staff_id) ? '#4f46e5' : '#e5e7eb'}}>
                            <input 
                                type="checkbox"
                                checked={presentStaffIds.has(staff.staff_id)}
                                onChange={() => handleTogglePresence(staff.staff_id)}
                                className="absolute top-2 right-2 h-5 w-5 text-primary rounded border-gray-300 focus:ring-primary"
                            />
                            <img src={staff.photo_url || `https://ui-avatars.com/api/?name=${staff.name}&background=random`} alt={staff.name} className="w-full h-32 object-cover rounded-md mb-2"/>
                            <p className="font-bold text-gray-800 truncate">{staff.name}</p>
                            <p className="text-sm text-gray-500">{staff.staff_id}</p>
                        </label>
                    ))}
                </div>
            )}
            
            <div className="mt-8 flex justify-end">
                <button 
                    onClick={handleSubmit} 
                    disabled={saving || loading}
                    className="px-8 py-3 bg-primary text-white font-semibold rounded-md hover:bg-primary-dark disabled:bg-gray-400 flex items-center gap-2 transition-colors">
                    {saving && <Spinner size="5" />}
                    {saving ? 'Saving...' : 'Submit Attendance'}
                </button>
            </div>
        </div>
    );
};

export default StaffAttendance;