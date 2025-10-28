import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { Driver as DriverType } from '../types';
import Spinner from '../components/Spinner';
import DriverModal from '../components/DriverModal';
import EditIcon from '../components/icons/EditIcon';
import DeleteIcon from '../components/icons/DeleteIcon';

const Transport: React.FC = () => {
    const [drivers, setDrivers] = useState<DriverType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {drivers.map((driver) => (
                        <div key={driver.id} className="bg-gray-50 rounded-lg shadow-md overflow-hidden">
                            <div className="p-5">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <img src={driver.photo_url || `https://ui-avatars.com/api/?name=${driver.name}`} alt={driver.name} className="w-16 h-16 rounded-full object-cover border-2 border-primary"/>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">{driver.name}</h3>
                                            <p className="text-sm text-gray-500 font-mono">{driver.driver_id}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button onClick={() => handleEdit(driver)} className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-100" title="Edit"><EditIcon /></button>
                                        <button onClick={() => handleDelete(driver.driver_id)} className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100" title="Delete"><DeleteIcon /></button>
                                    </div>
                                </div>
                                <div className="mt-4 space-y-2 text-sm text-gray-700">
                                     <p><strong>Mobile:</strong> {driver.mobile}</p>
                                     <p><strong>Van Number:</strong> {driver.van_number}</p>
                                     <p><strong>Address:</strong> {driver.address || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    ))}
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
        </div>
    );
};

export default Transport;