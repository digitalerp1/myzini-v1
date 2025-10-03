
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { FeeType } from '../types';
import Spinner from '../components/Spinner';
import FeeTypeModal from '../components/FeeTypeModal';
import AddDuesModal from '../components/AddDuesModal';
import EditIcon from '../components/icons/EditIcon';
import DeleteIcon from '../components/icons/DeleteIcon';

const FeesTypes: React.FC = () => {
    const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDuesModalOpen, setIsDuesModalOpen] = useState(false);
    const [selectedFeeType, setSelectedFeeType] = useState<FeeType | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const fetchFeeTypes = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('fees_types')
            .select('*')
            .order('fees_name', { ascending: true });

        if (error) {
            setError(error.message);
        } else {
            setFeeTypes(data as FeeType[]);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchFeeTypes();

        const channel = supabase.channel('public:fees_types')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'fees_types' }, () => {
                fetchFeeTypes();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchFeeTypes]);

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };

    const handleAdd = () => {
        setSelectedFeeType(null);
        setIsModalOpen(true);
    };

    const handleEdit = (feeType: FeeType) => {
        setSelectedFeeType(feeType);
        setIsModalOpen(true);
    };

    const handleDelete = async (feeTypeId: number, feeName: string) => {
        if (window.confirm(`Are you sure you want to delete the fee type "${feeName}"?`)) {
            const { error } = await supabase.from('fees_types').delete().eq('id', feeTypeId);
            if (error) {
                showMessage('error', `Error deleting fee type: ${error.message}`);
            } else {
                showMessage('success', 'Fee type deleted successfully.');
            }
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsDuesModalOpen(false);
        setSelectedFeeType(null);
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Fee Management</h1>
                <div className="flex gap-4">
                     <button
                        onClick={() => setIsDuesModalOpen(true)}
                        className="px-5 py-2.5 bg-secondary text-white font-semibold rounded-md hover:bg-green-600 transition-colors"
                    >
                        Add School Dues
                    </button>
                    <button
                        onClick={handleAdd}
                        className="px-5 py-2.5 bg-primary text-white font-semibold rounded-md hover:bg-primary-dark transition-colors"
                    >
                        Add New Fee Type
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
            ) : feeTypes.length === 0 ? (
                <div className="text-center text-gray-500 h-96 flex flex-col justify-center items-center">
                    <h2 className="mt-4 text-xl font-semibold">No Fee Types Found</h2>
                    <p className="mt-2">Get started by creating your first fee type.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee Name</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                                <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {feeTypes.map((fee) => (
                                <tr key={fee.id}>
                                    <td className="py-4 px-4 whitespace-nowrap text-sm font-medium text-gray-900">{fee.fees_name}</td>
                                    <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">{fee.frequency}</td>
                                    <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-700 font-mono text-right">₹{fee.amount.toLocaleString()}</td>
                                    <td className="py-4 px-4 whitespace-nowrap text-sm font-medium text-center">
                                        <div className="flex justify-center items-center space-x-2">
                                            <button onClick={() => handleEdit(fee)} className="text-indigo-600 hover:text-indigo-900 transition-colors" title="Edit"><EditIcon /></button>
                                            <button onClick={() => handleDelete(fee.id, fee.fees_name)} className="text-red-600 hover:text-red-900 transition-colors" title="Delete"><DeleteIcon /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isModalOpen && (
                <FeeTypeModal
                    feeType={selectedFeeType}
                    onClose={closeModal}
                    onSave={() => {
                        showMessage('success', `Fee type ${selectedFeeType ? 'updated' : 'added'} successfully.`);
                        closeModal();
                    }}
                />
            )}
             {isDuesModalOpen && (
                <AddDuesModal
                    onClose={closeModal}
                    onSuccess={(className, month) => {
                        showMessage('success', `Dues for ${month} have been added to all students in ${className}.`);
                        closeModal();
                    }}
                />
            )}
        </div>
    );
};

export default FeesTypes;
