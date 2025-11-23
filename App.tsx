
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './services/supabase';
import { Session } from '@supabase/supabase-js';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Students from './pages/Students';
import Staff from './pages/Staff';
import Classes from './pages/Classes';
import Expenses from './pages/Expenses';
import FeesTypes from './pages/FeesTypes';
import QueryHelper from './pages/QueryHelper';
import DuesList from './pages/DuesList';
import Attendance from './pages/Attendance';
import AttendanceReport from './pages/AttendanceReport';
import Results from './pages/Results';
import Spinner from './components/Spinner';
import Layout from './components/Layout';
import ExternalPage from './pages/ExternalPage';
import { externalLinks } from './services/externalLinks';
import DataExport from './pages/DataExport';
import GeneratorTools from './pages/GeneratorTools';
import StaffAttendance from './pages/StaffAttendance';
import StaffAttendanceReport from './pages/StaffAttendanceReport';
import Transport from './pages/Transport';
import EmailConfirmationPage from './pages/EmailConfirmationPage';
import HowToUse from './pages/HowToUse';
import UpdatePassword from './pages/UpdatePassword';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check for confirmation URL on initial load.
  const isConfirmationFlow = useMemo(() => window.location.hash.includes('type=signup'), []);

  useEffect(() => {
    // If it's a confirmation flow, let EmailConfirmationPage handle it.
    if (isConfirmationFlow) {
      setLoading(false);
      return;
    }

    const getSession = async () => {
      // Manual hash check to help detect credentials if auto-detection lags
      if (window.location.hash && window.location.hash.includes('access_token')) {
          console.log("Detected OAuth/MagicLink credentials in URL...");
      }

      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      
      if (event === 'PASSWORD_RECOVERY') {
        navigate('/update-password');
      }

      // Clean up the URL if we have a session and a leftover hash
      if (session && window.location.hash && window.location.hash.includes('access_token')) {
          // Remove the hash without reloading the page
          window.history.replaceState(null, '', window.location.pathname);
      }

      if (!session && event !== 'PASSWORD_RECOVERY') {
        navigate('/');
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [navigate, isConfirmationFlow]);

  if (isConfirmationFlow) {
    return <EmailConfirmationPage />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-light-bg">
        <Spinner />
      </div>
    );
  }

  if (!session) {
    // If we are on the update password route, we might have a session from the reset link flow momentarily,
    // but if not, we show Login. The onAuthStateChange handles the redirection flow.
    // However, if the user directly navigates to /update-password without a session, they should probably login first 
    // OR we just show Login.
    return (
        <Routes>
            <Route path="/update-password" element={<UpdatePassword />} />
            <Route path="*" element={<Login />} />
        </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard user={session.user} />} />
        <Route path="/profile" element={<Profile user={session.user} />} />
        <Route path="/students" element={<Students />} />
        <Route path="/staff" element={<Staff />} />
        <Route path="/classes" element={<Classes />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/fees-types" element={<FeesTypes />} />
        <Route path="/dues-list" element={<DuesList />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/attendance-report" element={<AttendanceReport />} />
        <Route path="/staff-attendance" element={<StaffAttendance />} />
        <Route path="/staff-attendance-report" element={<StaffAttendanceReport />} />
        <Route path="/results" element={<Results />} />
        <Route path="/transport" element={<Transport />} />
        <Route path="/query-helper" element={<QueryHelper />} />
        <Route path="/data-export" element={<DataExport />} />
        <Route path="/generator-tools" element={<GeneratorTools />} />
        <Route path="/how-to-use" element={<HowToUse />} />
      </Route>
      
      <Route path="/update-password" element={<UpdatePassword />} />

      {externalLinks.map(link => (
        <Route key={link.path} path={`/${link.path}`} element={<ExternalPage />} />
      ))}
    </Routes>
  );
};

export default App;
