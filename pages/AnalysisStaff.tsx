
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import Spinner from '../components/Spinner';
import { DonutChart, SimpleBarChart } from '../components/ChartComponents';
import StatCard from '../components/StatCard';
import StaffIcon from '../components/icons/StaffIcon';

const AnalysisStaff: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { data: staff } = await supabase.from('staff').select('*');
            const today = new Date().toISOString().split('T')[0];
            const { data: attendance } = await supabase.from('staff_attendence').select('*').eq('date', today).single();

            if (staff) {
                const totalStaff = staff.length;
                const activeStaff = staff.filter(s => s.is_active).length;
                
                let presentCount = 0;
                if (attendance && attendance.staff_id) {
                    presentCount = attendance.staff_id.split(',').length;
                }

                // Salary distribution buckets
                const salaryRanges = { '0-10k': 0, '10k-20k': 0, '20k-50k': 0, '50k+': 0 };
                staff.forEach(s => {
                    if (s.salary_amount < 10000) salaryRanges['0-10k']++;
                    else if (s.salary_amount < 20000) salaryRanges['10k-20k']++;
                    else if (s.salary_amount < 50000) salaryRanges['20k-50k']++;
                    else salaryRanges['50k+']++;
                });

                const salaryData = Object.entries(salaryRanges).map(([label, value]) => ({ label, value }));
                
                const statusData = [
                    { label: 'Active', value: activeStaff, color: '#10b981' },
                    { label: 'Inactive', value: totalStaff - activeStaff, color: '#ef4444' }
                ];

                const attendanceData = [
                    { label: 'Present', value: presentCount, color: '#3b82f6' },
                    { label: 'Absent', value: activeStaff - presentCount, color: '#f59e0b' }
                ];

                setData({
                    totalStaff,
                    activeStaff,
                    presentToday: presentCount,
                    salaryData,
                    statusData,
                    attendanceData
                });
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    if (loading) return <div className="h-screen flex items-center justify-center"><Spinner size="12"/></div>;

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <h1 className="text-3xl font-bold text-gray-800 border-b pb-4">Staff Analysis</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Staff" value={data.totalStaff} icon={<StaffIcon className="text-white w-6 h-6"/>} color="bg-indigo-500" />
                <StatCard title="Active Staff" value={data.activeStaff} icon={<StaffIcon className="text-white w-6 h-6"/>} color="bg-green-500" />
                <StatCard title="Present Today" value={data.presentToday} icon={<StaffIcon className="text-white w-6 h-6"/>} color="bg-blue-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <DonutChart title="Staff Status Ratio" data={data.statusData} />
                <DonutChart title="Today's Attendance" data={data.attendanceData} />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
                <SimpleBarChart title="Salary Bracket Distribution" data={data.salaryData} color="bg-purple-500" />
            </div>
        </div>
    );
};

export default AnalysisStaff;
