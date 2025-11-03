import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import Spinner from '../components/Spinner';

const EmailConfirmationPage: React.FC = () => {
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            // We are only interested in the first SIGNED_IN event for this flow.
            if (event === 'SIGNED_IN' && session) {
                setStatus('success');
                setTimeout(() => {
                    navigate('/dashboard', { replace: true });
                }, 3000);
            }
        });

        // The Supabase client handles token verification from the URL hash automatically.
        // onAuthStateChange will fire. If it doesn't fire in time, something is wrong.
        const timer = setTimeout(() => {
            setStatus(currentStatus => {
                if (currentStatus === 'verifying') {
                    setError('Verification timed out. The link might be expired. Please try logging in.');
                    return 'error';
                }
                return currentStatus;
            });
        }, 10000); // 10 seconds timeout

        return () => {
            subscription.unsubscribe();
            clearTimeout(timer);
        };
    }, [navigate]);

    return (
        <div className="flex items-center justify-center h-screen bg-light-bg">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md mx-4">
                {status === 'verifying' && (
                    <>
                        <Spinner size="12" />
                        <h1 className="text-2xl font-bold text-gray-800 mt-4">Verifying your email...</h1>
                        <p className="text-gray-600 mt-2">Please wait a moment while we confirm your email address.</p>
                    </>
                )}
                {status === 'success' && (
                    <>
                        <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <h1 className="text-2xl font-bold text-gray-800 mt-4">Email Confirmed!</h1>
                        <p className="text-gray-600 mt-2">Your email has been successfully verified. You will be redirected to the dashboard shortly.</p>
                    </>
                )}
                {status === 'error' && (
                     <>
                        <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <h1 className="text-2xl font-bold text-gray-800 mt-4">Verification Failed</h1>
                        <p className="text-red-600 mt-2">{error || 'An unknown error occurred.'}</p>
                        <a href="/#/" className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded-md">Go to Login</a>
                    </>
                )}
            </div>
        </div>
    );
};

export default EmailConfirmationPage;