
import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { externalLinks } from '../services/externalLinks';
import DashboardIcon from './icons/DashboardIcon';
import ProfileIcon from './icons/ProfileIcon';
import StudentsIcon from './icons/StudentsIcon';
import StaffIcon from './icons/StaffIcon';
import ClassesIcon from './icons/ClassesIcon';
import ExpensesIcon from './icons/ExpensesIcon';
import FeesIcon from './icons/FeesIcon';
import DuesIcon from './icons/DuesIcon';
import AttendanceIcon from './icons/AttendanceIcon';
import QueryIcon from './icons/QueryIcon';
import ReportIcon from './icons/ReportIcon';
import ResultsIcon from './icons/ResultsIcon';
import LogoutIcon from './icons/LogoutIcon';
import ExternalLinkIcon from './icons/ExternalLinkIcon';
import ArchiveIcon from './icons/ArchiveIcon';
import ToolsIcon from './icons/ToolsIcon';
import TransportIcon from './icons/TransportIcon';
import HelpIcon from './icons/HelpIcon';
import HostelIcon from './icons/HostelIcon';
import ChartBarIcon from './icons/ChartBarIcon';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        onClose();
        navigate('/');
    };

    const linkClasses = "flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200";
    const activeLinkClasses = "bg-primary text-white";

    const sidebarContainerClasses = `
        bg-dark-nav text-white flex flex-col h-screen flex-shrink-0
        w-64 fixed md:relative md:translate-x-0
        transition-transform duration-300 ease-in-out z-40
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `;

    return (
        <div className={sidebarContainerClasses}>
            <div className="flex items-center justify-center h-20 border-b border-gray-700 flex-shrink-0 md:h-16">
                <h1 className="text-2xl font-bold">My Zini</h1>
            </div>
            <div className="flex-1 flex flex-col overflow-y-hidden">
                <nav className="flex-grow px-4 py-6 space-y-2 overflow-y-auto">
                    <NavLink to="/dashboard" onClick={onClose} className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                        <DashboardIcon />
                        <span className="mx-4">Dashboard</span>
                    </NavLink>
                    <NavLink to="/analysis" onClick={onClose} className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                        <ChartBarIcon />
                        <span className="mx-4">Analysis</span>
                    </NavLink>
                    <NavLink to="/profile" onClick={onClose} className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                        <ProfileIcon />
                        <span className="mx-4">My Profile</span>
                    </NavLink>
                    <NavLink to="/students" onClick={onClose} className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                        <StudentsIcon />
                        <span className="mx-4">Students</span>
                    </NavLink>
                    <NavLink to="/hostel" onClick={onClose} className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                        <HostelIcon />
                        <span className="mx-4">Hostel</span>
                    </NavLink>
                    <NavLink to="/staff" onClick={onClose} className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                        <StaffIcon />
                        <span className="mx-4">Staff</span>
                    </NavLink>
                    <NavLink to="/classes" onClick={onClose} className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                        <ClassesIcon />
                        <span className="mx-4">Classes</span>
                    </NavLink>
                    <NavLink to="/expenses" onClick={onClose} className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                        <ExpensesIcon />
                        <span className="mx-4">Expenses</span>
                    </NavLink>
                    <NavLink to="/fees-types" onClick={onClose} className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                        <FeesIcon />
                        <span className="mx-4">Fee Management</span>
                    </NavLink>
                    <NavLink to="/dues-list" onClick={onClose} className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                        <DuesIcon />
                        <span className="mx-4">Dues List</span>
                    </NavLink>
                    <NavLink to="/attendance" onClick={onClose} className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                        <AttendanceIcon />
                        <span className="mx-4">Attendance</span>
                    </NavLink>
                    <NavLink to="/attendance-report" onClick={onClose} className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                        <ReportIcon />
                        <span className="mx-4">Attendance Report</span>
                    </NavLink>
                    <NavLink to="/staff-attendance" onClick={onClose} className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                        <AttendanceIcon />
                        <span className="mx-4">Staff Attendance</span>
                    </NavLink>
                    <NavLink to="/staff-attendance-report" onClick={onClose} className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                        <ReportIcon />
                        <span className="mx-4">Staff Attendance Report</span>
                    </NavLink>
                    <NavLink to="/results" onClick={onClose} className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                        <ResultsIcon />
                        <span className="mx-4">Results</span>
                    </NavLink>
                     <NavLink to="/transport" onClick={onClose} className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                        <TransportIcon />
                        <span className="mx-4">Transport</span>
                    </NavLink>
                    <NavLink to="/generator-tools" onClick={onClose} className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                        <ToolsIcon />
                        <span className="mx-4">Generator Tools</span>
                    </NavLink>
                    <NavLink to="/query-helper" onClick={onClose} className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                        <QueryIcon />
                        <span className="mx-4">AI Query Helper</span>
                    </NavLink>
                    <NavLink to="/data-export" onClick={onClose} className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                        <ArchiveIcon />
                        <span className="mx-4">Data Export</span>
                    </NavLink>
                    <NavLink to="/how-to-use" onClick={onClose} className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                        <HelpIcon />
                        <span className="mx-4">How to Use</span>
                    </NavLink>

                     <div className="pt-4 mt-4 border-t border-gray-700">
                        <h3 className="px-2 mb-2 text-xs font-semibold tracking-wider text-gray-400 uppercase">
                            Quick Links
                        </h3>
                        <div className="space-y-2">
                            {externalLinks.map(link => (
                                <Link
                                    key={link.path}
                                    to={`/${link.path}`}
                                    onClick={onClose}
                                    className={linkClasses}
                                >
                                    <ExternalLinkIcon />
                                    <span className="mx-4">{link.name}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </nav>
            </div>
            <div className="px-4 py-6 border-t border-gray-700 flex-shrink-0">
                <button onClick={handleLogout} className={linkClasses + " w-full"}>
                    <LogoutIcon />
                    <span className="mx-4">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
