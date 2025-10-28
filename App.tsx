import React, { useState, useEffect } from 'react';
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

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate('/');
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-light-bg">
        <Spinner />
      </div>
    );
  }

  if (!session) {
    return <Login />;
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
      </Route>

      {externalLinks.map(link => (
        <Route key={link.path} path={`/${link.path}`} element={<ExternalPage />} />
      ))}
    </Routes>
  );
};

export default App;