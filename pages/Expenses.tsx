
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { Expense as ExpenseType } from '../types';
import Spinner from '../components/Spinner';
import ExpenseModal from '../components/ExpenseModal';
import EditIcon from '../components/icons/EditIcon';
import DeleteIcon from '../components/icons/DeleteIcon';

const Expenses: React.FC = () => {
    const [expenses, setExpenses] = useState<ExpenseType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState<ExpenseType | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const fetchExpenses = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('expenses')
            .select('*')
            .order('date', { ascending: false });

        if (error) {
            setError(error.message);
        } else {
            setExpenses(data as ExpenseType[]);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchExpenses();

        const channel = supabase.channel('public:expenses')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, (payload) => {
                console.log('Expense change received!', payload);
                fetchExpenses();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchExpenses]);
    
    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };

    const handleAdd = () => {
        setSelectedExpense(null);
        setIsModalOpen(true);
    };

    const handleEdit = (expense: ExpenseType) => {
        setSelectedExpense(expense);
        setIsModalOpen(true);
    };

    const handleDelete = async (expenseId: number) => {
        if (window.confirm('Are you sure you want to delete this expense record?')) {
            const { error } = await supabase.from('expenses').delete().eq('id', expenseId);
            if (error) {
                showMessage('error', `Error deleting expense: ${error.message}`);
            } else {
                showMessage('success', 'Expense record deleted successfully.');
            }
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedExpense(null);
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Expense Management</h1>
                <button
                    onClick={handleAdd}
                    className="px-5 py-2.5 bg-primary text-white font-semibold rounded-md hover:bg-primary-dark transition-colors"
                >
                    Add New Expense
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
            ) : expenses.length === 0 ? (
                <div className="text-center text-gray-500 h-96 flex flex-col justify-center items-center">
                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    <h2 className="mt-4 text-xl font-semibold">No Expenses Found</h2>
                    <p className="mt-2">Get started by adding your first expense record.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                                <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {expenses.map((expense) => (
                                <tr key={expense.id}>
                                    <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">{new Date(expense.date).toLocaleDateString()}</td>
                                    <td className="py-4 px-4 whitespace-nowrap text-sm font-medium text-gray-900">{expense.category}</td>
                                    <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-700 font-mono text-right">₹{expense.amount.toLocaleString()}</td>
                                    <td className="py-4 px-4 text-sm text-gray-500 max-w-xs truncate">{expense.notes || 'N/A'}</td>
                                    <td className="py-4 px-4 whitespace-nowrap text-sm font-medium text-center">
                                        <div className="flex justify-center items-center space-x-2">
                                            <button onClick={() => handleEdit(expense)} className="text-indigo-600 hover:text-indigo-900 transition-colors" title="Edit"><EditIcon /></button>
                                            <button onClick={() => handleDelete(expense.id)} className="text-red-600 hover:text-red-900 transition-colors" title="Delete"><DeleteIcon /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isModalOpen && (
                <ExpenseModal 
                    expense={selectedExpense}
                    onClose={closeModal}
                    onSave={() => {
                        showMessage('success', `Expense ${selectedExpense ? 'updated' : 'added'} successfully.`);
                        closeModal();
                    }}
                />
            )}
        </div>
    );
};

export default Expenses;