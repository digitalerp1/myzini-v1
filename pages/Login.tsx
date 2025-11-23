
import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import Spinner from '../components/Spinner';

const Login: React.FC = () => {
    const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

    const resetForm = () => {
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setMessage(null);
    };

    const handleModeChange = (newMode: 'signIn' | 'signUp') => {
        setMode(newMode);
        resetForm();
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin,
            },
        });

        if (error) {
            setMessage({ type: 'error', text: error.message });
            setLoading(false);
        }
        // If no error, Supabase will handle the redirect.
    };

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setMessage({ type: 'error', text: error.message });
        }
        // On success, the onAuthStateChange listener in App.tsx will handle navigation.
        setLoading(false);
    };

    const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setMessage({ type: 'error', text: "Passwords do not match." });
            return;
        }
        setLoading(true);
        setMessage(null);

        const { error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            setMessage({ type: 'error', text: error.message });
        } else {
            setMessage({ type: 'success', text: 'Signup successful! Please check your email to verify your account.' });
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-light-bg flex items-center justify-center p-4 relative">
            <div className="w-full max-w-5xl flex rounded-2xl shadow-2xl overflow-hidden bg-white relative z-10">
                {/* Branding Panel */}
                <div className="w-1/2 bg-primary p-12 text-white hidden md:flex flex-col justify-between">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight">My Zini</h1>
                        <p className="mt-4 text-indigo-100 opacity-90">
                            The complete school management solution. Streamline operations, empower educators, and engage students like never before.
                        </p>
                    </div>
                    <div className="text-sm opacity-70">
                         &copy; {new Date().getFullYear()} My Zini. All rights reserved.
                    </div>
                </div>

                {/* Form Panel */}
                <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">
                        {mode === 'signIn' ? 'Welcome Back!' : 'Create Your Account'}
                    </h2>

                    {/* Tabs */}
                    <div className="flex justify-center mb-6">
                        <button onClick={() => handleModeChange('signIn')} className={`px-6 py-2 font-semibold rounded-l-md transition-colors duration-300 w-1/2 ${mode === 'signIn' ? 'bg-primary text-white shadow-md' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>
                            Sign In
                        </button>
                        <button onClick={() => handleModeChange('signUp')} className={`px-6 py-2 font-semibold rounded-r-md transition-colors duration-300 w-1/2 ${mode === 'signUp' ? 'bg-primary text-white shadow-md' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>
                            Sign Up
                        </button>
                    </div>
                    
                    {message && (
                        <div className={`p-4 mb-4 text-sm rounded-md ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {message.text}
                        </div>
                    )}

                    {/* Google Login Button */}
                    <div className="mb-6">
                        <button 
                            onClick={handleGoogleLogin} 
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 transition-colors duration-200 font-medium text-gray-700"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.0