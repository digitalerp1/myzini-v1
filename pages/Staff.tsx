import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { Staff as StaffType, SalaryRecord } from '../types';
import Spinner from '../components/Spinner';
import StaffModal from '../components/StaffModal';
import StaffProfileModal from '../components/StaffProfileModal';
import EditIcon from '../components/icons/EditIcon';
import DeleteIcon from '../components/icons/DeleteIcon';
import ViewIcon from '../components/icons/ViewIcon';
import DownloadIcon from '../components/icons/DownloadIcon';

const Staff: React.FC = () => {
    const [staffList, setStaffList] = useState<StaffType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<StaffType | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const fetchStaff = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('staff')
            .select('*')
            .order('joining_date', { ascending: false });

        if (error) {
            setError(error.message);
        } else {
            setStaffList(data as StaffType[]);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchStaff();

        const channel = supabase.channel('public:staff')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'staff' }, (payload) => {
                console.log('Change received!', payload);
                fetchStaff(); // Refetch data on any change
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchStaff]);
    
    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };

    const handleDownloadData = async () => {
        setIsDownloading(true);
        showMessage('success', 'Fetching staff and salary data... This may take a moment.');

        try {
            // Fetch all staff and all salary records in parallel
            const [staffRes, salaryRes] = await Promise.all([
                supabase.from('staff').select('*').order('name', { ascending: true }),
                supabase.from('salary_records').select('*')
            ]);

            if (staffRes.error) throw staffRes.error;
            if (salaryRes.error) throw salaryRes.error;

            const staffData: StaffType[] = staffRes.data;
            const salaryData: SalaryRecord[] = salaryRes.data;

            // Group salary records by staff_id for efficient lookup
            const salaryMap = new Map<string, SalaryRecord[]>();
            for (const record of salaryData) {
                if (!salaryMap.has(record.staff_id)) {
                    salaryMap.set(record.staff_id, []);
                }
                salaryMap.get(record.staff_id)!.push(record);
            }

            // Combine staff data with their salary records
            const combinedData = staffData.map(staffMember => ({
                ...staffMember,
                salary_records: salaryMap.get(staffMember.staff_id) || []
            }));

            const jsonData = JSON.stringify(combinedData, null, 2);
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'staff_with_salaries_data.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

        } catch (err: any) {
            showMessage('error', `Failed to download data: ${err.message}`);
        } finally {
            setIsDownloading(false);
        }
    };

    const handleAdd = () => {
        setSelectedStaff(null);
        setIsModalOpen(true);
    };

    const handleEdit = (staff: StaffType) => {
        setSelectedStaff(staff);
        setIsModalOpen(true);
    };
    
    const handleViewProfile = (staff: StaffType) => {
        setSelectedStaff(staff);
        setIsProfileModalOpen(true);
    };

    const handleDelete = async (staffId: string) => {
        if (window.confirm('Are you sure you want to delete this staff member? This will also remove their salary records.')) {
            // First, delete related salary records
            const { error: salaryError } = await supabase.from('salary_records').delete().eq('staff_id', staffId);
            if(salaryError){
                showMessage('error', `Could not delete salary records: ${salaryError.message}`);
                return;
            }

            // Then, delete the staff member
            const { error } = await supabase.from('staff').delete().eq('staff_id', staffId);
            if (error) {
                showMessage('error', `Error deleting staff: ${error.message}`);
            } else {
                showMessage('success', 'Staff member deleted successfully.');
            }
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsProfileModalOpen(false);
        setSelectedStaff(null);
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Staff Management</h1>
                 <div className="flex items-center gap-4">
                     <button
                        onClick={handleDownloadData}
                        disabled={isDownloading}
                        className="px-5 py-2.5 bg-secondary text-white font-semibold rounded-md hover:bg-green-600 transition-colors flex items-center gap-2 disabled:bg-gray-400"
                    >
                        {isDownloading ? <Spinner size="5" /> : <DownloadIcon />}
                        {isDownloading ? 'Downloading...' : 'Download Data (JSON)'}
                    </button>
                    <button
                        onClick={handleAdd}
                        className="px-5 py-2.5 bg-primary text-white font-semibold rounded-md hover:bg-primary-dark transition-colors"
                    >
                        Add New Staff
                    </button>
                </div>
            </div>

            {message && (
                <div className={`p-4 mb-4 text-sm rounded-md ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {message.text}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center h-96"><Spinner size="12" /></div>
            ) : error ? (
                <div className="text-center text-red-500">{error}</div>
            ) : staffList.length === 0 ? (
                <div className="text-center text-gray-500 h-96 flex flex-col justify-center items-center">
                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    <h2 className="mt-4 text-xl font-semibold">No Staff Found</h2>
                    <p className="mt-2">Get started by adding your first staff member.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff ID</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qualification</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joining Date</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {staffList.map((staff) => (
                                <tr key={staff.staff_id}>
                                    <td className="py-4 px-4 whitespace-nowrap text-sm font-mono text-gray-600">{staff.staff_id}</td>
                                    <td className="py-4 px-4 whitespace-nowrap text-sm font-medium text-gray-900">{staff.name}</td>
                                    <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">{staff.mobile}</td>
                                    <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">{staff.highest_qualification}</td>
                                    <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">{new Date(staff.joining_date).toLocaleDateString()}</td>
                                    <td className="py-4 px-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${staff.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {staff.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 whitespace-nowrap text-sm font-medium text-center">
                                        <div className="flex justify-center items-center space-x-2">
                                            <button onClick={() => handleViewProfile(staff)} className="text-blue-600 hover:text-blue-900 transition-colors" title="View Profile"><ViewIcon /></button>
                                            <button onClick={() => handleEdit(staff)} className="text-indigo-600 hover:text-indigo-900 transition-colors" title="Edit"><EditIcon /></button>
                                            <button onClick={() => handleDelete(staff.staff_id)} className="text-red-600 hover:text-red-900 transition-colors" title="Delete"><DeleteIcon /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isModalOpen && (
                <StaffModal 
                    staff={selectedStaff}
                    onClose={closeModal}
                    onSave={() => {
                        showMessage('success', `Staff member ${selectedStaff ? 'updated' : 'added'} successfully.`);
                        closeModal();
                    }}
                />
            )}

            {isProfileModalOpen && selectedStaff && (
                 <StaffProfileModal 
                    staff={selectedStaff}
                    onClose={closeModal}
                    onPaymentSuccess={() => {
                        showMessage('success', 'Salary payment recorded successfully.');
                    }}
                 />
            )}
        </div>
    );
};

export default Staff;