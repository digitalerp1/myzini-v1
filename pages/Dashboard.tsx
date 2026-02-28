import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement,
    LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler
);

interface DashboardProps {
    user?: any;
}

const EDGE_FUNCTION_URL = 'https://fatch.digitalerp.shop/api/dashboardload';

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
    // State Management
    const [jwtToken, setJwtToken] = useState('');
    const [refreshToken, setRefreshToken] = useState('');
    const [view, setView] = useState<'token' | 'dashboard'>('token');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Data States matching new JSON format
    const [overview, setOverview] = useState<any>(null);
    const [financialSummary, setFinancialSummary] = useState<any>(null);
    const [chartsData, setChartsData] = useState<any>(null);

    // Initial check for tokens
    useEffect(() => {
        const checkTokens = async () => {
            const savedToken = localStorage.getItem('manual_jwt_token');
            const savedRefresh = localStorage.getItem('manual_refresh_token');

            if (savedToken) {
                setJwtToken(savedToken);
                if (savedRefresh) setRefreshToken(savedRefresh);
                fetchDashboardData(savedToken);
                return;
            }

            const { data: { session } } = await supabase.auth.getSession();
            if (session?.access_token) {
                setJwtToken(session.access_token);
                setRefreshToken(session.refresh_token || '');
                fetchDashboardData(session.access_token);
            }
        };
        checkTokens();
    }, []);

    const fetchDashboardData = async (token: string) => {
        setLoading(true);
        setView('dashboard');
        setError(null);
        try {
            const response = await fetch(EDGE_FUNCTION_URL, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || errData.message || `API Error: Status ${response.status}`);
            }

            const data = await response.json();

            // Map according to the new backend format
            setOverview(data.overview);
            setFinancialSummary(data.financial_summary);
            setChartsData(data.charts_data);
        } catch (err: any) {
            console.error("Dashboard Fetch Error:", err);
            setError(err.message || 'Data fetch failed! Your token might be expired or invalid.');
            setView('token');
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!jwtToken) {
            setError("Please enter a valid Access Token.");
            return;
        }

        setError(null);
        localStorage.setItem('manual_jwt_token', jwtToken);
        if (refreshToken) localStorage.setItem('manual_refresh_token', refreshToken);

        fetchDashboardData(jwtToken);
    };

    const handleLogout = () => {
        localStorage.removeItem('manual_jwt_token');
        localStorage.removeItem('manual_refresh_token');
        setJwtToken('');
        setRefreshToken('');
        setOverview(null);
        setFinancialSummary(null);
        setChartsData(null);
        setView('token');
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency', currency: 'INR', maximumFractionDigits: 0
        }).format(amount || 0);
    };

    const classNames = chartsData?.classAnalytics ? Object.keys(chartsData.classAnalytics).sort() : [];
    const monthNames = chartsData?.monthlyTrends ? Object.keys(chartsData.monthlyTrends) : [];

    // Modernized Chart Colors and Configurations
    const feesChartData = {
        labels: classNames,
        datasets: [
            {
                label: 'Paid Fees (₹)',
                data: classNames.map(c => chartsData?.classAnalytics?.[c]?.currentMonthPaid || 0),
                backgroundColor: 'rgba(16, 185, 129, 0.95)',
                borderRadius: 4,
                barPercentage: 0.6
            },
            {
                label: 'Pending Dues (₹)',
                data: classNames.map(c => chartsData?.classAnalytics?.[c]?.currentMonthDues || 0),
                backgroundColor: 'rgba(244, 63, 94, 0.95)',
                borderRadius: 4,
                barPercentage: 0.6
            }
        ]
    };

    const monthlyTrendsChartData = {
        labels: monthNames.map(m => m.charAt(0).toUpperCase() + m.slice(1)),
        datasets: [
            {
                label: 'Total Paid',
                data: monthNames.map(m => chartsData?.monthlyTrends?.[m]?.totalPaid || 0),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 2.5,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: '#10b981',
                pointBorderWidth: 2,
                pointRadius: 4,
            },
            {
                label: 'Total Dues',
                data: monthNames.map(m => chartsData?.monthlyTrends?.[m]?.totalDues || 0),
                borderColor: '#f43f5e',
                backgroundColor: 'rgba(244, 63, 94, 0.05)',
                borderWidth: 2.5,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: '#f43f5e',
                pointBorderWidth: 2,
                pointRadius: 4,
            }
        ]
    };

    const admissionsChartData = {
        labels: classNames,
        datasets: [{
            label: 'New Students',
            data: classNames.map(c => chartsData?.classAnalytics?.[c]?.admissionsThisMonth || 0),
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.12)',
            borderWidth: 2.5,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#ffffff',
            pointBorderColor: '#6366f1',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
        }]
    };

    const genderChartData = {
        labels: classNames,
        datasets: [
            {
                label: 'Boys',
                data: classNames.map(c => chartsData?.classGenderDistribution?.[c]?.boys || 0),
                backgroundColor: '#3b82f6',
                borderRadius: 4,
                barPercentage: 0.6
            },
            {
                label: 'Girls',
                data: classNames.map(c => chartsData?.classGenderDistribution?.[c]?.girls || 0),
                backgroundColor: '#ec4899',
                borderRadius: 4,
                barPercentage: 0.6
            }
        ]
    };

    const casteLabels = chartsData ? Object.keys(chartsData.casteDistribution || {}) : [];
    const casteValues = chartsData ? Object.values(chartsData.casteDistribution || {}) : [];

    const casteChartData = {
        labels: casteLabels as string[],
        datasets: [{
            data: casteValues as number[],
            backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4', '#8b5cf6'],
            borderWidth: 0,
            hoverOffset: 4
        }]
    };

    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                padding: { top: 12, bottom: 12, left: 16, right: 16 },
                cornerRadius: 12,
                titleFont: { size: 13, family: "'Plus Jakarta Sans', sans-serif", weight: 'bold' as const },
                bodyFont: { size: 13, family: "'Plus Jakarta Sans', sans-serif" },
                displayColors: true,
                boxPadding: 4,
            },
            legend: {
                labels: {
                    usePointStyle: true,
                    boxWidth: 8,
                    font: { family: "'Plus Jakarta Sans', sans-serif", size: 12 }
                }
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 }, color: '#64748b' },
                border: { display: false }
            },
            y: {
                grid: { color: '#f1f5f9' },
                ticks: { font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 }, color: '#64748b' },
                border: { display: false },
                beginAtZero: true
            }
        }
    };

    const stats = [
        { title: 'Total Students', value: overview?.totalStudents || 0, icon: 'fa-users', color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100' },
        { title: 'Active Classes', value: overview?.totalClasses || 0, icon: 'fa-chalkboard-user', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
        { title: 'Total Staff', value: overview?.totalStaff || 0, icon: 'fa-user-tie', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
        { title: 'Gender Ratio', value: `${overview?.totalBoys || 0}B / ${overview?.totalGirls || 0}G`, icon: 'fa-children', color: 'text-rose-600', bg: 'bg-rose-50 border-rose-100' },
    ];

    return (
        <div className="w-full min-h-full font-sans text-slate-800 animate-fade-in pb-10">
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
                
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob { animation: blob 7s infinite; }
                .animation-delay-2000 { animation-delay: 2s; }
                
                .glass-card { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }
            `}</style>

            {view === 'token' && (
                <div className="flex items-center justify-center min-h-[70vh]">
                    <div className="w-full max-w-lg bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 sm:p-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-50 mix-blend-multiply animate-blob"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-50 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 opacity-50 mix-blend-multiply animate-blob animation-delay-2000"></div>

                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-3xl flex items-center justify-center text-white text-2xl mx-auto mb-8 shadow-lg shadow-indigo-500/30">
                                <i className="fa-solid fa-server mt-0.5"></i>
                            </div>
                            <div className="text-center mb-10">
                                <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Connect Analytics</h2>
                                <p className="text-slate-500 text-sm mt-3 font-medium">Enter your secure API tokens to synchronize the live dashboard data engine.</p>
                            </div>

                            <form onSubmit={handleFormSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Access Token (JWT) <span className="text-rose-500">*</span></label>
                                    <textarea required rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-mono text-sm resize-none placeholder-slate-400" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." value={jwtToken} onChange={e => setJwtToken(e.target.value)}></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Refresh Token <span className="text-slate-400 font-normal">(Optional)</span></label>
                                    <textarea rows={2} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-mono text-sm resize-none placeholder-slate-400" placeholder="Paste your refresh token here..." value={refreshToken} onChange={e => setRefreshToken(e.target.value)}></textarea>
                                </div>

                                {error && (
                                    <div className="p-4 bg-red-50 text-red-600 text-sm font-semibold rounded-2xl border border-red-100 flex items-start shadow-sm">
                                        <i className="fa-solid fa-circle-exclamation mt-0.5 mr-2.5 text-base"></i> <span>{error}</span>
                                    </div>
                                )}

                                <button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-bold py-4 px-4 rounded-2xl transition-all shadow-[0_8px_16px_rgb(0,0,0,0.1)] active:scale-[0.98] flex justify-center items-center gap-2.5 mt-2">
                                    {loading ? <i className="fa-solid fa-circle-notch fa-spin text-lg"></i> : <i className="fa-solid fa-bolt text-lg text-amber-300"></i>}
                                    {loading ? 'Initializing...' : 'Launch Dashboard'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {view === 'dashboard' && (
                <div className="space-y-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center min-h-[60vh]">
                            <div className="relative w-24 h-24 mb-8">
                                <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                                <i className="fa-solid fa-chart-pie absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl text-indigo-600"></i>
                            </div>
                            <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">Processing Analytics</h3>
                            <p className="text-indigo-500 font-semibold text-sm mt-3 animate-pulse bg-indigo-50 px-4 py-1.5 rounded-full border border-indigo-100">Aggregating real-time data from secure engine...</p>
                        </div>
                    ) : (
                        <>
                            {/* Premium Header Section */}
                            <div className="bg-white rounded-[2rem] p-8 sm:p-10 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-80 pointer-events-none"></div>

                                <div className="relative z-10 flex-1">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="px-4 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-100/50 flex items-center gap-1.5">
                                            <i className="fa-solid fa-calendar-alt text-indigo-400"></i>
                                            {overview?.currentMonth || 'Current Month'} Report
                                        </span>
                                        <span className="flex items-center text-xs text-emerald-600 font-bold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100/50">
                                            <span className="relative flex h-2 w-2 mr-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                            </span>
                                            Live Sync
                                        </span>
                                    </div>
                                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight">Data Intelligence Center</h1>
                                    <p className="text-slate-500 mt-3 font-medium text-base sm:text-lg max-w-2xl">Complete operational clarity. View metrics, track revenue, and monitor student demographics in real-time.</p>
                                </div>
                                <div className="relative z-10 flex shrink-0">
                                    <button onClick={handleLogout} className="px-6 py-3.5 bg-white border border-slate-200 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 text-slate-600 font-bold rounded-2xl transition-all shadow-sm focus:ring-4 focus:ring-rose-50 flex items-center justify-center gap-2.5 w-full md:w-auto">
                                        <i className="fa-solid fa-power-off"></i> Disconnect Engine
                                    </button>
                                </div>
                            </div>

                            {/* Main Metrics Row */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                                {stats.map((stat, i) => (
                                    <div key={i} className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 transform hover:-translate-y-1 group relative overflow-hidden">
                                        <div className={`absolute -right-4 -top-4 w-24 h-24 ${stat.bg} rounded-full opacity-50 transition-transform duration-500 group-hover:scale-150 pointer-events-none`}></div>
                                        <div className="relative z-10">
                                            <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center text-2xl mb-5 shadow-sm border`}>
                                                <i className={`fa-solid ${stat.icon}`}></i>
                                            </div>
                                            <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">{stat.title}</p>
                                            <h4 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">{stat.value}</h4>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Expanded Financial Summary Section */}
                            <div className="mb-4">
                                <h2 className="text-xl font-extrabold text-slate-800 mb-4 px-2">Financial Overview</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                                    {/* Total Expected/Paid Income */}
                                    <div className="p-6 rounded-3xl bg-emerald-600 text-white relative overflow-hidden shadow-lg border border-emerald-500 group cursor-pointer hover:bg-emerald-700 transition">
                                        <div className="absolute -right-6 -bottom-6 opacity-10 transform pointer-events-none">
                                            <i className="fa-solid fa-vault text-[8rem]"></i>
                                        </div>
                                        <div className="relative z-10">
                                            <p className="text-emerald-100 font-bold uppercase tracking-wider text-xs mb-2">Total School Revenue</p>
                                            <h3 className="text-3xl sm:text-4xl font-black tracking-tighter mb-1">{formatCurrency(financialSummary?.schoolTotalPaidAllMonths || 0)}</h3>
                                            <p className="text-emerald-200 text-xs font-semibold mt-2">All Months Paid Fees</p>
                                        </div>
                                    </div>

                                    {/* Total Dues */}
                                    <div className="p-6 rounded-3xl bg-rose-500 text-white relative overflow-hidden shadow-lg border border-rose-400 group cursor-pointer hover:bg-rose-600 transition">
                                        <div className="absolute -right-6 -bottom-6 opacity-10 transform pointer-events-none">
                                            <i className="fa-solid fa-hand-holding-dollar text-[8rem]"></i>
                                        </div>
                                        <div className="relative z-10">
                                            <p className="text-rose-100 font-bold uppercase tracking-wider text-xs mb-2">Total Outstanding Dues</p>
                                            <h3 className="text-3xl sm:text-4xl font-black tracking-tighter mb-1">{formatCurrency(financialSummary?.schoolTotalDuesAllMonths || 0)}</h3>
                                            <p className="text-rose-200 text-xs font-semibold mt-2">All Months Pending Fees</p>
                                        </div>
                                    </div>

                                    {/* Total Staff Paid */}
                                    <div className="p-6 rounded-3xl bg-slate-800 text-white relative overflow-hidden shadow-lg border border-slate-700 group cursor-pointer hover:bg-slate-900 transition">
                                        <div className="absolute -right-6 -bottom-6 opacity-10 transform pointer-events-none">
                                            <i className="fa-solid fa-money-check-dollar text-[8rem]"></i>
                                        </div>
                                        <div className="relative z-10">
                                            <p className="text-slate-300 font-bold uppercase tracking-wider text-xs mb-2">Staff Salary Dispursed</p>
                                            <h3 className="text-3xl sm:text-4xl font-black tracking-tighter mb-1">{formatCurrency(financialSummary?.totalStaffPaidSalary || 0)}</h3>
                                            <p className="text-slate-400 text-xs font-semibold mt-2">Paid to Employees</p>
                                        </div>
                                    </div>

                                    {/* Total Expenses */}
                                    <div className="p-6 rounded-3xl bg-indigo-600 text-white relative overflow-hidden shadow-lg border border-indigo-500 group cursor-pointer hover:bg-indigo-700 transition">
                                        <div className="absolute -right-6 -bottom-6 opacity-10 transform pointer-events-none">
                                            <i className="fa-solid fa-file-invoice-dollar text-[8rem]"></i>
                                        </div>
                                        <div className="relative z-10">
                                            <p className="text-indigo-200 font-bold uppercase tracking-wider text-xs mb-2">Operational Expenses</p>
                                            <h3 className="text-3xl sm:text-4xl font-black tracking-tighter mb-1">{formatCurrency(financialSummary?.totalOtherExpenses || 0)}</h3>
                                            <p className="text-indigo-200 text-xs font-semibold mt-2">Other Total Expenses</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Financial Stats */}
                                <div className="mt-4 flex flex-wrap gap-4">
                                    <div className="bg-white border text-sm font-semibold rounded-full px-5 py-2.5 text-slate-700 shadow-sm flex items-center">
                                        <i className="fa-solid fa-piggy-bank text-emerald-500 mr-2"></i>
                                        Other Fees Paid: <span className="ml-2 font-black text-slate-900">{formatCurrency(financialSummary?.schoolTotalOtherFeesPaid || 0)}</span>
                                    </div>
                                    <div className="bg-white border text-sm font-semibold rounded-full px-5 py-2.5 text-slate-700 shadow-sm flex items-center">
                                        <i className="fa-solid fa-clock-rotate-left text-amber-500 mr-2"></i>
                                        Previous Dues: <span className="ml-2 font-black text-slate-900">{formatCurrency(financialSummary?.schoolTotalPreviousDues || 0)}</span>
                                    </div>
                                    <div className="bg-white border text-sm font-semibold rounded-full px-5 py-2.5 text-slate-700 shadow-sm flex items-center">
                                        <i className="fa-solid fa-check-double text-blue-500 mr-2"></i>
                                        Previous Dues Collected: <span className="ml-2 font-black text-slate-900">{formatCurrency(financialSummary?.schoolTotalPreviousDuesPaid || 0)}</span>
                                    </div>
                                    <div className="bg-emerald-50 border border-emerald-200 text-sm font-semibold rounded-full px-5 py-2.5 text-emerald-800 shadow-sm flex items-center">
                                        <i className="fa-solid fa-percent text-emerald-600 mr-2"></i>
                                        Collection Efficiency: <span className="ml-2 font-black text-emerald-900">{financialSummary?.netCollectionEfficiency || "0%"}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Main Data Charts */}
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pt-4">
                                {/* Monthly Trends */}
                                <div className="bg-white p-6 sm:p-10 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] xl:col-span-2">
                                    <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
                                        <h3 className="text-xl font-extrabold text-slate-800 flex items-center tracking-tight">
                                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mr-3.5"><i className="fa-solid fa-chart-area text-lg"></i></div>
                                            Yearly Revenue Trends
                                        </h3>
                                        <span className="bg-slate-50 text-slate-600 text-xs font-bold px-4 py-2 rounded-xl border border-slate-200/60 shadow-sm">
                                            Month over Month
                                        </span>
                                    </div>
                                    <div className="h-[380px] w-full">
                                        <Line data={monthlyTrendsChartData} options={{ ...commonOptions, plugins: { ...commonOptions.plugins, legend: { position: 'top', align: 'end' } } }} />
                                    </div>
                                </div>

                                <div className="bg-white p-6 sm:p-10 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                                    <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
                                        <h3 className="text-xl font-extrabold text-slate-800 flex items-center tracking-tight">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mr-3.5"><i className="fa-solid fa-coins text-lg"></i></div>
                                            Class-wise Revenue Flow
                                        </h3>
                                        <span className="bg-slate-50 text-slate-600 text-xs font-bold px-4 py-2 rounded-xl border border-slate-200/60 shadow-sm">
                                            Current Month Analytics
                                        </span>
                                    </div>
                                    <div className="h-[360px] w-full">
                                        <Bar data={feesChartData} options={{ ...commonOptions, plugins: { ...commonOptions.plugins, legend: { position: 'top', align: 'end' } } }} />
                                    </div>
                                </div>

                                <div className="bg-white p-6 sm:p-10 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                                    <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
                                        <h3 className="text-xl font-extrabold text-slate-800 flex items-center tracking-tight">
                                            <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center mr-3.5"><i className="fa-solid fa-venus-mars text-lg"></i></div>
                                            Gender Distribution
                                        </h3>
                                        <span className="bg-slate-50 text-slate-600 text-xs font-bold px-4 py-2 rounded-xl border border-slate-200/60 shadow-sm">
                                            Per Class Breakdown
                                        </span>
                                    </div>
                                    <div className="h-[360px] w-full">
                                        <Bar data={genderChartData} options={{ ...commonOptions, scales: { x: { stacked: true, grid: { display: false }, border: { display: false } }, y: { stacked: true, grid: { color: '#f1f5f9' }, border: { display: false } } }, plugins: { ...commonOptions.plugins, legend: { position: 'top', align: 'end' } } }} />
                                    </div>
                                </div>
                            </div>

                            {/* Secondary Data Charts */}
                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                                <div className="bg-white p-6 sm:p-10 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] xl:col-span-2">
                                    <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
                                        <h3 className="text-xl font-extrabold text-slate-800 flex items-center tracking-tight">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mr-3.5"><i className="fa-solid fa-user-plus text-lg"></i></div>
                                            Admissions Velocity
                                        </h3>
                                        <span className="bg-slate-50 text-slate-600 text-xs font-bold px-4 py-2 rounded-xl border border-slate-200/60 shadow-sm">
                                            Current Month
                                        </span>
                                    </div>
                                    <div className="h-[360px] w-full">
                                        <Line data={admissionsChartData} options={{ ...commonOptions, plugins: { ...commonOptions.plugins, legend: { display: false } } }} />
                                    </div>
                                </div>

                                <div className="bg-white p-6 sm:p-10 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col">
                                    <h3 className="text-xl font-extrabold text-slate-800 flex items-center tracking-tight mb-8">
                                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mr-3.5"><i className="fa-solid fa-chart-pie text-lg"></i></div>
                                        Category Diversity
                                    </h3>
                                    <div className="flex-1 h-[320px] w-full flex justify-center items-center">
                                        <Doughnut data={casteChartData} options={{ ...commonOptions, cutout: '78%', plugins: { ...commonOptions.plugins, legend: { position: 'bottom', labels: { usePointStyle: true, padding: 24, font: { family: "'Plus Jakarta Sans', sans-serif", size: 12 } } } } }} />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
