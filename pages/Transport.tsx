import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { Driver as DriverType } from '../types';
import Spinner from '../components/Spinner';
import DriverModal from '../components/DriverModal';
import DriverProfileModal from '../components/DriverProfileModal';
import EditIcon from '../components/icons/EditIcon';
import DeleteIcon from '../components/icons/DeleteIcon';
import ViewIcon from '../components/icons/ViewIcon';

const Transport: React.FC = () => {
    const [drivers, setDrivers] = useState<DriverType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState<DriverType | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const fetchDrivers = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('driver')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            setError(error.message);
        } else {
            setDrivers(data as DriverType[]);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchDrivers();

        const channel = supabase.channel('public:driver')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'driver' }, () => {
                fetchDrivers();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchDrivers]);

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };

    const handleAdd = () => {
        setSelectedDriver(null);
        setIsModalOpen(true);
    };

    const handleEdit = (driver: DriverType) => {
        setSelectedDriver(driver);
        setIsModalOpen(true);
    };

    const handleViewProfile = (driver: DriverType) => {
        setSelectedDriver(driver);
        setIsProfileModalOpen(true);
    };

    const handleDelete = async (driverId: string) => {
        if (window.confirm('Are you sure you want to delete this driver record?')) {
            const { error } = await supabase.from('driver').delete().eq('driver_id', driverId);
            if (error) {
                showMessage('error', `Error deleting driver: ${error.message}`);
            } else {
                showMessage('success', 'Driver record deleted successfully.');
            }
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsProfileModalOpen(false);
        setSelectedDriver(null);
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Transport Management</h1>
                <button
                    onClick={handleAdd}
                    className="px-5 py-2.5 bg-primary text-white font-semibold rounded-md hover:bg-primary-dark transition-colors"
                >
                    Add New Driver
                </button>
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
            ) : drivers.length === 0 ? (
                <div className="text-center text-gray-500 h-96 flex flex-col justify-center items-center">
                    <h2 className="mt-4 text-xl font-semibold">No Drivers Found</h2>
                    <p className="mt-2">Get started by adding your first driver.</p>
                </div>
            ) : (
                 <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver Name</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver ID</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Van Number</th>
                                <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {drivers.map((driver) => (
                                <tr key={driver.id}>
                                    <td className="py-4 px-4 whitespace-nowrap text-sm font-medium text-gray-900">{driver.name}</td>
                                    <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500 font-mono">{driver.driver_id}</td>
                                    <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">{driver.mobile}</td>
                                    <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">{driver.van_number}</td>
                                    <td className="py-4 px-4 whitespace-nowrap text-sm font-medium text-center">
                                        <div className="flex justify-center items-center space-x-2">
                                            <button onClick={() => handleViewProfile(driver)} className="text-blue-600 hover:text-blue-900 transition-colors" title="View Profile"><ViewIcon /></button>
                                            <button onClick={() => handleEdit(driver)} className="text-indigo-600 hover:text-indigo-900 transition-colors" title="Edit"><EditIcon /></button>
                                            <button onClick={() => handleDelete(driver.driver_id)} className="text-red-600 hover:text-red-900 transition-colors" title="Delete"><DeleteIcon /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isModalOpen && (
                <DriverModal
                    driver={selectedDriver}
                    onClose={closeModal}
                    onSave={() => {
                        showMessage('success', `Driver ${selectedDriver ? 'updated' : 'added'} successfully.`);
                        closeModal();
                    }}
                />
            )}
             {isProfileModalOpen && selectedDriver && (
                <DriverProfileModal
                    driver={selectedDriver}
                    onClose={closeModal}
                    onEdit={() => {
                        closeModal();
                        handleEdit(selectedDriver);
                    }}
                />
            )}
        </div>
    );
};

export default Transport;