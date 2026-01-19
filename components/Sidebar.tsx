
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import DashboardIcon from './icons/DashboardIcon';
import ProfileIcon from './icons/ProfileIcon';
import StudentsIcon from './icons/StudentsIcon';
import StaffIcon from './icons/StaffIcon';
import ClassesIcon from './icons/ClassesIcon';
import ExpensesIcon from './icons/ExpensesIcon';
import FeesIcon from './icons/FeesIcon';
import DuesIcon from './icons/DuesIcon';
import AttendanceIcon from './icons/AttendanceIcon';
import ReportIcon from './icons/ReportIcon';
import ResultsIcon from './icons/ResultsIcon';
import LogoutIcon from './icons/LogoutIcon';
import ArchiveIcon from './icons/ArchiveIcon';
import ToolsIcon from './icons/ToolsIcon';
import TransportIcon from './icons/TransportIcon';
import HelpIcon from './icons/HelpIcon';
import HostelIcon from './icons/HostelIcon';
import ChartBarIcon from './icons/ChartBarIcon';
import RupeeIcon from './icons/RupeeIcon';
import DownloadIcon from './icons/DownloadIcon';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

    useEffect(() => {
        const handler = (e: any) => { e.preventDefault(); setDeferredPrompt(e); };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        onClose();
        navigate('/');
    };

    const linkClasses = "flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white";
    const activeLinkClasses = "bg-primary text-white dark:bg-indigo-600";

    return (
        <div className={`bg-dark-nav text-white flex flex-col h-screen w-64 fixed md:relative md:translate-x-0 transition-transform duration-300 ease-in-out z-40 ${isOpen ? 'translate-x-0' : '-translate-x-full'} dark:bg-slate-950`}>
            <div className="flex items-center justify-center h-20 border-b border-gray-700 dark:border-slate-800">
                <h1 className="text-2xl font-black tracking-tighter">My Zini</h1>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-6 space-y-2">
                <NavLink to="/dashboard" onClick={onClose} className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                    <DashboardIcon /><span className="mx-4">Dashboard</span>
                </NavLink>
                <NavLink to="/fees-analysis" onClick={onClose} className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                    <RupeeIcon className="w-6 h-6" /><span className="mx-4">Fees Analysis</span>
                </NavLink>
                <NavLink to="/analysis" onClick={onClose} className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                    <ChartBarIcon /><span className="mx-4">Analysis</span>
                </NavLink>
                <NavLink to="/students" onClick={onClose} className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                    <StudentsIcon /><span className="mx-4">Students</span>
                </NavLink>
                <NavLink to="/hostel" onClick={onClose} className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                    <HostelIcon /><span className="mx-4">Hostel</span>
                </NavLink>
                <NavLink to="/staff" onClick={onClose} className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                    <StaffIcon /><span className="mx-4">Staff</span>
                </NavLink>
                <NavLink to="/classes" onClick={onClose} className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                    <ClassesIcon /><span className="mx-4">Classes</span>
                </NavLink>
                <NavLink to="/expenses" onClick={onClose} className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                    <ExpensesIcon /><span className="mx-4">Expenses</span>
                </NavLink>
                <NavLink to="/fees-types" onClick={onClose} className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                    <FeesIcon /><span className="mx-4">Fee Management</span>
                </NavLink>
                <NavLink to="/dues-list" onClick={onClose} className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                    <DuesIcon /><span className="mx-4">Dues List</span>
                </NavLink>
                <NavLink to="/attendance" onClick={onClose} className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                    <AttendanceIcon /><span className="mx-4">Attendance</span>
                </NavLink>
                <NavLink to="/results" onClick={onClose} className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                    <ResultsIcon /><span className="mx-4">Results</span>
                </NavLink>
                <NavLink to="/transport" onClick={onClose} className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                    <TransportIcon /><span className="mx-4">Transport</span>
                </NavLink>
                <NavLink to="/generator-tools" onClick={onClose} className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                    <ToolsIcon /><span className="mx-4">Generator Tools</span>
                </NavLink>
                <NavLink to="/data-center" onClick={onClose} className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                    <ArchiveIcon /><span className="mx-4">Data Center</span>
                </NavLink>
                <NavLink to="/settings" onClick={onClose} className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path></svg>
                    <span className="mx-4">Settings</span>
                </NavLink>
            </div>
            <div className="px-4 py-6 border-t border-gray-700 dark:border-slate-800">
                <button onClick={handleLogout} className={linkClasses + " w-full"}>
                    <LogoutIcon /><span className="mx-4">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
