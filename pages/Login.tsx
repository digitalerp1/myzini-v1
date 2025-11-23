
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
        try {
            // Construct the redirect URL explicitly to ensure it is absolute.
            // window.location.origin typically includes the protocol (e.g., https://example.com)
            // We fallback to window.location.href for robustness if origin is somehow misbehaving in specific webviews.
            const redirectUrl = window.location.origin || window.location.href.split('/').slice(0, 3).join('/');
            
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectUrl,
                },
            });

            if (error) {
                setMessage({ type: 'error', text: error.message });
                setLoading(false);
            }
            // If no error, Supabase will redirect the browser.
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'An unexpected error occurred.' });
            setLoading(false);
        }
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
            setLoading(false);
        }
        // On success, the onAuthStateChange listener in App.tsx will handle navigation.
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
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                            {loading ? 'Connecting...' : 'Sign in with Google'}
                        </button>
                    </div>

                    <div className="relative flex items-center justify-center mb-6">
                        <div className="border-t border-gray-300 w-full"></div>
                        <span className="bg-white px-3 text-sm text-gray-500 font-medium absolute">OR</span>
                    </div>

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
                    
                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <p className="text-sm text-gray-500 mb-1">Need help? Contact Support:</p>
                        <a href="mailto:contact@digitalerp.shop" className="text-primary font-semibold hover:underline">contact@digitalerp.shop</a>
                    </div>
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
