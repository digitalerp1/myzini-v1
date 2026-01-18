
import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import Spinner from '../components/Spinner';

interface SettingsProps {
    user: User;
}

const Settings: React.FC<SettingsProps> = ({ user }) => {
    const [activeTab, setActiveTab] = useState<'display' | 'app' | 'security'>('display');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Settings States
    const [desktopMode, setDesktopMode] = useState(localStorage.getItem('force_desktop_mode') === 'true');
    const [theme, setTheme] = useState(localStorage.getItem('theme_mode') || 'light');
    const [autoBackup, setAutoBackup] = useState(localStorage.getItem('auto_backup') === 'true');

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 4000);
    };

    const handleToggleDesktopMode = () => {
        const newValue = !desktopMode;
        setDesktopMode(newValue);
        localStorage.setItem('force_desktop_mode', String(newValue));
        // Refresh to apply viewport change
        window.location.reload();
    };

    const handleThemeChange = (newTheme: 'light' | 'dark') => {
        setTheme(newTheme);
        localStorage.setItem('theme_mode', newTheme);
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        showMessage('success', `Theme switched to ${newTheme} mode.`);
    };

    const handleClearCache = () => {
        if (window.confirm("This will clear your local preferences (Theme, Desktop Mode). Continue?")) {
            localStorage.removeItem('force_desktop_mode');
            localStorage.removeItem('theme_mode');
            window.location.reload();
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
            <div className="flex justify-between items-end border-b border-gray-200 dark:border-slate-800 pb-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">System Settings</h1>
                    <p className="text-gray-500 dark:text-slate-400 mt-1 font-medium">Customize your My Zini experience and interface behavior.</p>
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-3 animate-bounce ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    <span>{message.type === 'success' ? '✅' : '⚠️'}</span>
                    {message.text}
                </div>
            )}

            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-slate-800 flex flex-col md:flex-row min-h-[500px]">
                {/* Tabs Sidebar */}
                <div className="w-full md:w-64 bg-gray-50 dark:bg-slate-950 border-r border-gray-100 dark:border-slate-800 p-4 space-y-2">
                    <button 
                        onClick={() => setActiveTab('display')}
                        className={`w-full text-left px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'display' ? 'bg-primary text-white shadow-lg shadow-indigo-200 dark:shadow-none' : 'text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-900'}`}
                    >
                        🖥️ Display Mode
                    </button>
                    <button 
                        onClick={() => setActiveTab('app')}
                        className={`w-full text-left px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'app' ? 'bg-primary text-white shadow-lg shadow-indigo-200 dark:shadow-none' : 'text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-900'}`}
                    >
                        📱 App Preferences
                    </button>
                    <button 
                        onClick={() => setActiveTab('security')}
                        className={`w-full text-left px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'security' ? 'bg-primary text-white shadow-lg shadow-indigo-200 dark:shadow-none' : 'text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-900'}`}
                    >
                        🔒 Account & Security
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 p-8 sm:p-12">
                    {activeTab === 'display' && (
                        <div className="space-y-8 animate-fade-in">
                            <h2 className="text-2xl font-black text-gray-800 dark:text-white">Interface Settings</h2>
                            
                            {/* Desktop Mode Toggle */}
                            <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                                <div>
                                    <h3 className="font-bold text-gray-800 dark:text-white">Always Desktop Size</h3>
                                    <p className="text-sm text-gray-500 dark:text-slate-400">Forces the app to stay in desktop layout even on small mobile screens.</p>
                                </div>
                                <button 
                                    onClick={handleToggleDesktopMode}
                                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${desktopMode ? 'bg-indigo-600' : 'bg-gray-300'}`}
                                >
                                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${desktopMode ? 'translate-x-7' : 'translate-x-1'}`} />
                                </button>
                            </div>

                            {/* Theme Toggle */}
                            <div>
                                <h3 className="font-bold text-gray-800 dark:text-white mb-4">Color Theme</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <button 
                                        onClick={() => handleThemeChange('light')}
                                        className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${theme === 'light' ? 'border-primary bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-100 dark:border-slate-800 hover:border-gray-200'}`}
                                    >
                                        <span className="text-4xl">☀️</span>
                                        <span className="font-bold dark:text-slate-300">Light Mode</span>
                                    </button>
                                    <button 
                                        onClick={() => handleThemeChange('dark')}
                                        className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${theme === 'dark' ? 'border-primary bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-100 dark:border-slate-800 hover:border-gray-200'}`}
                                    >
                                        <span className="text-4xl">🌙</span>
                                        <span className="font-bold dark:text-slate-300">Dark Mode</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'app' && (
                        <div className="space-y-8 animate-fade-in">
                            <h2 className="text-2xl font-black text-gray-800 dark:text-white">App Preferences</h2>
                            
                            <div className="space-y-4">
                                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                                    <h3 className="font-bold text-gray-800 dark:text-white">About My Zini</h3>
                                    <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-slate-400">
                                        <div className="flex justify-between"><span>Version</span><span className="font-mono">2.4.0-build.782</span></div>
                                        <div className="flex justify-between"><span>Environment</span><span className="font-mono">Production</span></div>
                                        <div className="flex justify-between"><span>Storage Tier</span><span className="font-mono">Premium Cloud</span></div>
                                    </div>
                                </div>

                                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                                    <h3 className="font-bold text-gray-800 dark:text-white">Data Maintenance</h3>
                                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">If you encounter UI issues, try clearing your local session cache.</p>
                                    <button 
                                        onClick={handleClearCache}
                                        className="mt-6 px-6 py-2 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900 text-red-600 rounded-xl text-sm font-bold hover:bg-red-50 transition-all"
                                    >
                                        Reset Local Cache
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-8 animate-fade-in text-center py-12">
                            <div className="w-20 h-20 bg-indigo-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-3xl">🛡️</div>
                            <div>
                                <h2 className="text-2xl font-black text-gray-800 dark:text-white">Account Management</h2>
                                <p className="text-gray-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">Update your school profile or administrative password in the profile section.</p>
                            </div>
                            <div className="flex flex-col gap-3 max-w-xs mx-auto">
                                <a href="/profile" className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all shadow-lg">Manage School Profile</a>
                                <a href="/update-password" className="w-full py-3 bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-white rounded-xl font-bold hover:bg-gray-200 transition-all">Reset Password</a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
