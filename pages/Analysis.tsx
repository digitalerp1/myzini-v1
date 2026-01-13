
import React from 'react';
import { User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import RupeeIcon from '../components/icons/RupeeIcon';
import StudentsIcon from '../components/icons/StudentsIcon';
import StaffIcon from '../components/icons/StaffIcon';
import AcademicCapIcon from '../components/icons/AcademicCapIcon';
import ChartBarIcon from '../components/icons/ChartBarIcon';
import DuesIcon from '../components/icons/DuesIcon';

interface AnalysisProps {
    user: User;
}

const Analysis: React.FC<AnalysisProps> = ({ user }) => {
    const navigate = useNavigate();

    const analysisModules = [
        {
            title: "Fees Analysis",
            description: "Detailed breakdown of revenue, pending dues, expense tracking, and profit margins.",
            icon: <RupeeIcon className="w-10 h-10 text-white" />,
            color: "bg-emerald-500",
            path: "/fees-analysis"
        },
        {
            title: "Student Attendance",
            description: "Daily presence trends, class-wise attendance consistency, and absenteeism reports.",
            icon: <StudentsIcon className="w-10 h-10 text-white" />,
            color: "bg-blue-500",
            path: "/analysis/attendance"
        },
        {
            title: "Staff Insights",
            description: "Staff attendance records, punctuality trends, and active workforce status.",
            icon: <StaffIcon className="w-10 h-10 text-white" />,
            color: "bg-purple-500",
            path: "/analysis/staff"
        },
        {
            title: "Salary & Payroll",
            description: "Monthly salary distribution, total payout history, and payroll vs revenue comparison.",
            icon: <DuesIcon className="w-10 h-10 text-white" />,
            color: "bg-rose-500",
            path: "/analysis/salary"
        },
        {
            title: "Admission & Demographics",
            description: "New admission growth, gender ratio, caste/category distribution, and total strength.",
            icon: <ChartBarIcon className="w-10 h-10 text-white" />,
            color: "bg-orange-500",
            path: "/analysis/admissions"
        },
        {
            title: "Exam Results",
            description: "Performance analysis, subject-wise averages, pass/fail ratios, and topper lists.",
            icon: <AcademicCapIcon className="w-10 h-10 text-white" />,
            color: "bg-indigo-500",
            path: "/analysis/results"
        }
    ];

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold text-gray-900">Analytics Hub</h1>
                <p className="text-lg text-gray-500 mt-2">Select a category to view detailed reports and charts.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {analysisModules.map((module, index) => (
                    <div 
                        key={index}
                        onClick={() => navigate(module.path)}
                        className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden group transform hover:-translate-y-1 border border-gray-100"
                    >
                        <div className={`h-32 ${module.color} flex items-center justify-center relative overflow-hidden`}>
                            <div className="absolute top-0 right-0 opacity-20 transform translate-x-4 -translate-y-4 scale-150">
                                {module.icon}
                            </div>
                            <div className="relative z-10 transform transition-transform group-hover:scale-110 duration-300">
                                {module.icon}
                            </div>
                        </div>
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-primary transition-colors">
                                {module.title}
                            </h3>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                {module.description}
                            </p>
                            <div className="mt-4 flex items-center text-sm font-semibold text-primary">
                                View Report 
                                <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Analysis;
