import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabase';
import Spinner from '../components/Spinner';

type LoginView = 'signIn' | 'signUp' | 'magicLink' | 'forgotPassword';

// Add type definition for window.turnstile
declare global {
    interface Window {
        turnstile: any;
    }
}

const Login: React.FC = () => {
    const [view, setView] = useState<LoginView>('signIn');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
    
    // Captcha state
    const [captchaToken, setCaptchaToken] = useState<string>('');
    const turnstileWidgetId = useRef<string | null>(null);

    const resetForm = () => {
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setMessage(null);
        setCaptchaToken('');
        // We rely on useEffect to re-render widget on view change
    };

    const handleViewChange = (newView: LoginView) => {
        setView(newView);
        resetForm();
    };

    // Initialize Turnstile when view changes
    useEffect(() => {
        setCaptchaToken(''); // Reset token on view change
        
        const renderWidget = () => {
            if (window.turnstile) {
                // If a widget already exists, remove it first to prevent duplicates or errors
                if (turnstileWidgetId.current) {
                    try {
                        window.turnstile.remove(turnstileWidgetId.current);
                    } catch (e) {
                        console.warn("Failed to remove old turnstile widget", e);
                    }
                }

                try {
                    const id = window.turnstile.render('#turnstile-widget', {
                        sitekey: '0x4AAAAAACCibNfWff6NAVmg',
                        callback: (token: string) => {
                            setCaptchaToken(token);
                        },
                        'expired-callback': () => {
                            setCaptchaToken('');
                        },
                    });
                    turnstileWidgetId.current = id;
                } catch (e) {
                    console.error("Error rendering Turnstile widget:", e);
                }
            }
        };

        // Short delay to ensure DOM element exists
        const timer = setTimeout(renderWidget, 100);

        return () => clearTimeout(timer);
    }, [view]);

    const getRedirectUrl = () => {
        // Dynamic redirect URL based on current origin.
        // This ensures compatibility with both localhost and deployed environments (Vercel, Custom Domain).
        // IMPORTANT: Ensure this URL (and localhost) is added to Supabase Authentication -> URL Configuration -> Redirect URLs.
        return window.location.origin;
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            const redirectUrl = getRedirectUrl();
            console.log("Initiating Google Login with redirect:", redirectUrl);

            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectUrl,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            });

            if (error) {
                setMessage({ type: 'error', text: error.message });
                setLoading(false);
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'An unexpected error occurred.' });
            setLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!captchaToken) {
            setMessage({ type: 'error', text: "Please complete the CAPTCHA verification." });
            return;
        }
        setLoading(true);
        setMessage(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
            options: {
                captchaToken,
            }
        });

        if (error) {
            setMessage({ type: 'error', text: error.message });
            // Reset captcha on error
            if (window.turnstile) window.turnstile.reset(turnstileWidgetId.current);
            setCaptchaToken('');
            setLoading(false);
        }
    };

    const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setMessage({ type: 'error', text: "Passwords do not match." });
            return;
        }
        if (!captchaToken) {
            setMessage({ type: 'error', text: "Please complete the CAPTCHA verification." });
            return;
        }
        setLoading(true);
        setMessage(null);

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: getRedirectUrl(),
                captchaToken,
            }
        });

        if (error) {
            setMessage({ type: 'error', text: error.message });
            if (window.turnstile) window.turnstile.reset(turnstileWidgetId.current);
            setCaptchaToken('');
        } else {
            setMessage({ type: 'success', text: 'Signup successful! Please check your email to verify your account.' });
        }
        setLoading(false);
    };

    const handleMagicLink = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!captchaToken) {
            setMessage({ type: 'error', text: "Please complete the CAPTCHA verification." });
            return;
        }
        setLoading(true);
        setMessage(null);

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: getRedirectUrl(),
                captchaToken,
            },
        });

        if (error) {
            setMessage({ type: 'error', text: error.message });
            if (window.turnstile) window.turnstile.reset(turnstileWidgetId.current);
            setCaptchaToken('');
        } else {
            setMessage({ type: 'success', text: 'Magic link sent! Check your email to sign in.' });
        }
        setLoading(false);
    };

    const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!captchaToken) {
            setMessage({ type: 'error', text: "Please complete the CAPTCHA verification." });
            return;
        }
        setLoading(true);
        setMessage(null);

        const redirectUrl = `${getRedirectUrl()}/update-password`; 

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: redirectUrl,
            captchaToken,
        });

        if (error) {
            setMessage({ type: 'error', text: error.message });
            if (window.turnstile) window.turnstile.reset(turnstileWidgetId.current);
            setCaptchaToken('');
        } else {
            setMessage({ type: 'success', text: 'Password reset link sent! Check your email.' });
        }
        setLoading(false);
    };

    const TurnstileWidget = () => (
        <div className="flex justify-center my-4">
            <div id="turnstile-widget"></div>
        </div>
    );

    const renderForm = () => {
        switch (view) {
            case 'signUp':
                return (
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
                        
                        <TurnstileWidget />

                        <button type="submit" disabled={loading} className="w-full btn-submit">
                            {loading ? <Spinner size="5" /> : 'Sign Up'}
                        </button>
                        <div className="text-center text-sm">
                            <span className="text-gray-500">Already have an account? </span>
                            <button type="button" onClick={() => handleViewChange('signIn')} className="text-primary font-semibold hover:underline">Sign In</button>
                        </div>
                    </form>
                );
            case 'magicLink':
                return (
                    <form onSubmit={handleMagicLink} className="space-y-6">
                        <div className="text-center text-sm text-gray-600 mb-4">
                            Enter your email and we'll send you a link to sign in instantly.
                        </div>
                        <div>
                            <label htmlFor="magic-email" className="sr-only">Email address</label>
                            <input id="magic-email" name="email" type="email" autoComplete="email" required className="input-field" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>

                        <TurnstileWidget />

                        <button type="submit" disabled={loading} className="w-full btn-submit">
                            {loading ? <Spinner size="5" /> : 'Send Magic Link'}
                        </button>
                        <div className="text-center text-sm">
                            <button type="button" onClick={() => handleViewChange('signIn')} className="text-primary font-semibold hover:underline">Back to Sign In</button>
                        </div>
                    </form>
                );
            case 'forgotPassword':
                return (
                    <form onSubmit={handleResetPassword} className="space-y-6">
                        <div className="text-center text-sm text-gray-600 mb-4">
                            Enter your email address and we'll send you a link to reset your password.
                        </div>
                        <div>
                            <label htmlFor="reset-email" className="sr-only">Email address</label>
                            <input id="reset-email" name="email" type="email" autoComplete="email" required className="input-field" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>

                        <TurnstileWidget />

                        <button type="submit" disabled={loading} className="w-full btn-submit">
                            {loading ? <Spinner size="5" /> : 'Send Reset Link'}
                        </button>
                        <div className="text-center text-sm">
                            <button type="button" onClick={() => handleViewChange('signIn')} className="text-primary font-semibold hover:underline">Back to Sign In</button>
                        </div>
                    </form>
                );
            case 'signIn':
            default:
                return (
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label htmlFor="email-address" className="sr-only">Email address</label>
                            <input id="email-address" name="email" type="email" autoComplete="email" required className="input-field" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div>
                            <label htmlFor="password-input" className="sr-only">Password</label>
                            <input id="password-input" name="password" type="password" autoComplete="current-password" required className="input-field" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                            <button type="button" onClick={() => handleViewChange('magicLink')} className="text-primary hover:text-primary-dark font-medium">
                                Sign in with Magic Link
                            </button>
                            <button type="button" onClick={() => handleViewChange('forgotPassword')} className="text-gray-600 hover:text-gray-900">
                                Forgot Password?
                            </button>
                        </div>

                        <TurnstileWidget />

                        <button type="submit" disabled={loading} className="w-full btn-submit">
                            {loading ? <Spinner size="5" /> : 'Sign In'}
                        </button>
                        
                        <div className="text-center text-sm">
                            <span className="text-gray-500">Don't have an account? </span>
                            <button type="button" onClick={() => handleViewChange('signUp')} className="text-primary font-semibold hover:underline">Sign Up</button>
                        </div>
                    </form>
                );
        }
    };

    const getTitle = () => {
        switch(view) {
            case 'signUp': return 'Create Account';
            case 'magicLink': return 'Magic Link Login';
            case 'forgotPassword': return 'Reset Password';
            default: return 'Welcome Back!';
        }
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
                    <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                        {getTitle()}
                    </h2>
                    
                    {message && (
                        <div className={`p-4 mb-4 text-sm rounded-md ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {message.text}
                        </div>
                    )}

                    {/* Google Login Button - Only show on Sign In/Sign Up views */}
                    {(view === 'signIn' || view === 'signUp') && (
                        <>
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
                        </>
                    )}

                    {renderForm()}
                    
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