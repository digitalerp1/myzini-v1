
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
        <div className="min-h-screen bg-light-bg flex items-center justify-center p-4">
            <div className="w-full max-w-5xl flex rounded-2xl shadow-2xl overflow-hidden bg-white">
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
                <div className="w-full md:w-1/2 p-8 sm:p-12">
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

                    {mode === 'signIn' ? (
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label htmlFor="email-address" className="sr-only">Email address</label>
                                <input id="email-address" name="email" type="email" autoComplete="email" required className="input-field" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                            <div>
                                <label htmlFor="password-input" className="sr-only">Password</label>
                                <input id="password-input" name="password" type="password" autoComplete="current-password" required className="input-field" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                            </div>
                             <button type="submit" disabled={loading} className="w-full btn-submit">
                                {loading ? <Spinner size="5" /> : 'Sign In'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleSignUp} className="space-y-6">
                             <div>
                                <label htmlFor="signup-email" className="sr-only">Email address</label>
                                <input id="signup-email" name="email" type="email" autoComplete="email" required className="input-field" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                            <div>
                                <label htmlFor="signup-password" className="sr-only">Password</label>
                                <input id="signup-password" name="password" type="password" autoComplete="new-password" required className="input-field" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                            </div>
                            <div>
                                <label htmlFor="confirm-password" className="sr-only">Confirm Password</label>
                                <input id="confirm-password" name="confirm-password" type="password" autoComplete="new-password" required className="input-field" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                            </div>
                             <button type="submit" disabled={loading} className="w-full btn-submit">
                                {loading ? <Spinner size="5" /> : 'Sign Up'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
             <style>{`
                .input-field {
                    appearance: none;
                    position: relative;
                    display: block;
                    width: 100%;
                    padding: 0.75rem 1rem;
                    border: 1px solid #d1d5db;
                    placeholder-color: #6b7280;
                    color: #111827;
                    border-radius: 0.375rem;
                    outline: none;
                    transition: border-color 0.2s;
                }
                .input-field:focus {
                    z-index: 10;
                    border-color: #4f46e5;
                    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
                }
                .btn-submit {
                    position: relative;
                    display: flex;
                    justify-content: center;
                    width: 100%;
                    padding: 0.75rem 1rem;
                    border: 1px solid transparent;
                    font-size: 0.875rem;
                    font-weight: 500;
                    border-radius: 0.375rem;
                    color: white;
                    background-color: #4f46e5;
                    transition: background-color 0.2s;
                }
                .btn-submit:hover {
                    background-color: #4338ca;
                }
                 .btn-submit:disabled {
                    background-color: #9ca3af;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
};

export default Login;
