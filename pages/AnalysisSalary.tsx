
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import Spinner from '../components/Spinner';
import { LineChart, SimpleBarChart } from '../components/ChartComponents';
import StatCard from '../components/StatCard';
import RupeeIcon from '../components/icons/RupeeIcon';

const AnalysisSalary: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const currentYear = new Date().getFullYear();
            const { data: records } = await supabase.from('salary_records').select('*');
            const { data: staff } = await supabase.from('staff').select('salary_amount, is_active');

            if (records && staff) {
                const totalMonthlyLiability = staff.filter(s => s.is_active).reduce((sum, s) => sum + s.salary_amount, 0);
                const totalPaidAllTime = records.reduce((sum, r) => sum + r.amount, 0);
                
                const monthlyPayouts = new Array(12).fill(0);
                let currentMonthPaid = 0;
                const currentMonthIdx = new Date().getMonth();

                records.forEach(r => {
                    const d = new Date(r.date_time);
                    if (d.getFullYear() === currentYear) {
                        monthlyPayouts[d.getMonth()] += r.amount;
                        if (d.getMonth() === currentMonthIdx) currentMonthPaid += r.amount;
                    }
                });

                const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                const trendData = monthlyPayouts.map((val, i) => ({ label: monthLabels[i], value: val }));

                const liabilityVsPaid = [
                    { label: 'Expected Payout', value: totalMonthlyLiability },
                    { label: 'Paid This Month', value: currentMonthPaid }
                ];

                setData({
                    totalPaidAllTime,
                    monthlyLiability: totalMonthlyLiability,
                    currentMonthPaid,
                    trendData,
                    liabilityVsPaid
                });
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    if (loading) return <div className="h-screen flex items-center justify-center"><Spinner size="12"/></div>;

    const format = (n: number) => `₹${n.toLocaleString('en-IN')}`;

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <h1 className="text-3xl font-bold text-gray-800 border-b pb-4">Payroll & Salary Analysis</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Monthly Liability (Est.)" value={format(data.monthlyLiability)} icon={<RupeeIcon className="text-white w-6 h-6"/>} color="bg-orange-500" />
                <StatCard title="Paid This Month" value={format(data.currentMonthPaid)} icon={<RupeeIcon className="text-white w-6 h-6"/>} color="bg-green-500" />
                <StatCard title="Total Salaries Paid (YTD)" value={format(data.trendData.reduce((a:number,b:any)=>a+b.value,0))} icon={<RupeeIcon className="text-white w-6 h-6"/>} color="bg-blue-600" />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
                <LineChart title="Monthly Salary Payout Trend" data={data.trendData} color="#4f46e5" />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md max-w-2xl mx-auto">
                <SimpleBarChart title="Current Month: Liability vs Paid" data={data.liabilityVsPaid} color="bg-teal-500" />
            </div>
        </div>
    );
};

export default AnalysisSalary;
