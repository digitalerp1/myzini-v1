
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
import Hostel from './pages/Hostel';
import EmailConfirmationPage from './pages/EmailConfirmationPage';
import HowToUse from './pages/HowToUse';
import UpdatePassword from './pages/UpdatePassword';
import Analysis from './pages/Analysis';
import FeesAnalysis from './pages/FeesAnalysis';
import DataCenter from './pages/DataCenter';
import Settings from './pages/Settings';

// Individual Analysis Pages
import AnalysisAttendance from './pages/AnalysisAttendance';
import AnalysisStaff from './pages/AnalysisStaff';
import AnalysisSalary from './pages/AnalysisSalary';
import AnalysisAdmissions from './pages/AnalysisAdmissions';
import AnalysisResults from './pages/AnalysisResults';
import StudentDashboard from './pages/StudentDashboard';
import InstallPWA from './components/InstallPWA'; // Import the PWA button

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [studentSession, setStudentSession] = useState<any>(null); // For Student Login
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const isConfirmationFlow = useMemo(() => window.location.hash.includes('type=signup'), []);

  useEffect(() => {
    // 1. Application Logic for Display Modes
    const applyDisplaySettings = () => {
      // Force Desktop Mode Logic
      const desktopMode = localStorage.getItem('force_desktop_mode') === 'true';
      let viewport = document.querySelector('meta[name="viewport"]');
      if (desktopMode) {
        if (viewport) {
          viewport.setAttribute('content', 'width=1280, initial-scale=0.3, maximum-scale=5.0, user-scalable=yes');
        }
      } else {
        if (viewport) {
          viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
        }
      }

      // Dark Mode Logic
      const darkMode = localStorage.getItem('theme_mode') === 'dark';
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyDisplaySettings();
    
    // Watch for local storage changes from Settings page
    window.addEventListener('storage', applyDisplaySettings);

    if (isConfirmationFlow) {
      setLoading(false);
      return;
    }

    const checkSessions = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const storedStudent = localStorage.getItem('student_session');
      const storedToken = localStorage.getItem('student_token');
      
      if (session) {
        setSession(session);
      } else if (storedStudent) {
        setStudentSession(JSON.parse(storedStudent));
      } else if (storedToken) {
          try {
              const { data, error } = await supabase.rpc('student_login_by_token', { token_input: storedToken });
              if (data && Array.isArray(data) && data.length > 0) {
                   setStudentSession(data);
                   localStorage.setItem('student_session', JSON.stringify(data));
              } else {
                   localStorage.removeItem('student_token');
              }
          } catch (e) {
              console.error("Auto login failed", e);
              localStorage.removeItem('student_token');
          }
      }
      
      setLoading(false);
    };
    
    checkSessions();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === 'PASSWORD_RECOVERY') navigate('/update-password');
      if (session && window.location.hash && window.location.hash.includes('access_token')) {
          window.history.replaceState(null, '', window.location.pathname);
      }
      if (event === 'SIGNED_OUT') {
         setSession(null);
         setStudentSession(null);
         localStorage.removeItem('student_session');
         localStorage.removeItem('student_token');
         navigate('/');
      }
    });

    return () => {
      subscription?.unsubscribe();
      window.removeEventListener('storage', applyDisplaySettings);
    };
  }, [navigate, isConfirmationFlow]);

  if (isConfirmationFlow) return <EmailConfirmationPage />;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-light-bg dark:bg-slate-900">
        <Spinner />
      </div>
    );
  }

  if (studentSession) {
    return (
        <>
            <InstallPWA />
            <Routes>
                <Route path="/student-dashboard" element={<StudentDashboard student={studentSession} onLogout={() => {
                    localStorage.removeItem('student_session');
                    localStorage.removeItem('student_token'); 
                    setStudentSession(null);
                    navigate('/');
                }} />} />
                <Route path="*" element={<Navigate to="/student-dashboard" replace />} />
            </Routes>
        </>
    );
  }

  if (!session) {
    return (
        <>
            <InstallPWA />
            <Routes>
                <Route path="/update-password" element={<UpdatePassword />} />
                <Route path="*" element={<Login onStudentLogin={(student) => {
                    localStorage.setItem('student_session', JSON.stringify(student));
                    setStudentSession(student);
                    navigate('/student-dashboard');
                }} />} />
            </Routes>
        </>
    );
  }

  return (
    <>
        <InstallPWA />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard user={session.user} />} />
            <Route path="/analysis" element={<Analysis user={session.user} />} />
            <Route path="/fees-analysis" element={<FeesAnalysis user={session.user} />} />
            <Route path="/analysis/attendance" element={<AnalysisAttendance />} />
            <Route path="/analysis/staff" element={<AnalysisStaff />} />
            <Route path="/analysis/salary" element={<AnalysisSalary />} />
            <Route path="/analysis/admissions" element={<AnalysisAdmissions />} />
            <Route path="/analysis/results" element={<AnalysisResults />} />
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
            <Route path="/hostel" element={<Hostel />} />
            <Route path="/query-helper" element={<QueryHelper />} />
            <Route path="/data-center" element={<DataCenter />} />
            <Route path="/generator-tools" element={<GeneratorTools />} />
            <Route path="/how-to-use" element={<HowToUse />} />
            <Route path="/settings" element={<Settings user={session.user} />} />
          </Route>
          <Route path="/update-password" element={<UpdatePassword />} />
          {externalLinks.map(link => (
            <Route key={link.path} path={`/${link.path}`} element={<ExternalPage />} />
          ))}
        </Routes>
    </>
  );
};

export default App;
