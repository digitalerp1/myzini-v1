import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Student, OwnerProfile, ExamResult } from '../../../types';

interface MarksheetTemplateProps {
    student: Student;
    school: OwnerProfile;
    result: ExamResult;
}

const defaultLogo = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2ZmZiI+PHBhdGggZD0iTTcgMjFoMnYtMmgxMHYtMmgtMXYtMmgtMXYtMmgtMnYtMmgxdi0yaDJ2LTJoLTJ2LTJoLTF2LTJoLTJ2Mkg5djJoMXYyaDF2Mkg5djJoMXYyaDJ6bS0xIDFINnYtMmgtMnYtMmgtMXYtNmgyVjdoMXYyZzJ2MmgxdjJoMVY5aDJWN2gxVjVoMnYyaDF2MmgydjZoLTJ2MmgxVjdoLTF2LTJoLTJ2LTJoLTF2LTJoLTJ2Mkg5djJoMXYyaDF2Mkg5djJoMXYyaDJ6Ii8+PC9zdmc+";

const SubjectProgress: React.FC<{ subject: any }> = ({ subject }) => {
    const percentage = (Number(subject.obtained_marks) / Number(subject.total_marks)) * 100;
    const isPass = Number(subject.obtained_marks) >= Number(subject.pass_marks);
    const circumference = 2 * Math.PI * 25; // radius = 25
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div style={styles.progressBox}>
            <svg width="60" height="60" viewBox="0 0 60 60" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="30" cy="30" r="25" stroke="#e5e7eb" strokeWidth="6" fill="transparent" />
                <circle cx="30" cy="30" r="25" stroke={isPass ? "#10b981" : "#ef4444"} strokeWidth="6" fill="transparent"
                    strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
            </svg>
            <div style={styles.progressText}>
                <strong>{percentage.toFixed(0)}%</strong>
            </div>
            <p style={styles.subjectName}>{subject.subject_name}</p>
        </div>
    );
};

export const MarksheetTemplateCreative: React.FC<MarksheetTemplateProps> = ({ student, school, result }) => {
    const schoolLogo = school.school_image_url || defaultLogo;
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const { subjects } = result.subjects_marks;

    useEffect(() => {
        const qrData = `${student.name}, ${result.exam_name}`;
        QRCode.toDataURL(qrData, { width: 80, margin: 1 }).then(setQrCodeUrl);
    }, [student.name, result.exam_name]);

    return (
        <div style={styles.page}>
            <div style={styles.header}>
                <img src={schoolLogo} alt="School Logo" style={styles.logo} crossOrigin="anonymous"/>
                <div style={styles.headerText}>
                    <p style={styles.reportTitle}>PERFORMANCE REPORT</p>
                    <h1 style={styles.schoolName}>{school.school_name}</h1>
                </div>
            </div>

            <div style={styles.studentInfo}>
                <h2 style={styles.studentName}>{student.name}</h2>
                <p style={styles.studentDetails}>
                    <strong>Class:</strong> {student.class} | <strong>Roll No:</strong> {student.roll_number} | <strong>Exam:</strong> {result.exam_name}
                </p>
            </div>
            
            <div style={styles.subjectsGrid}>
                {subjects.map(s => <SubjectProgress key={s.subject_name} subject={s} />)}
            </div>
            
            <div style={styles.footer}>
                <p style={styles.footerText}>This report is a reflection of the student's hard work and dedication. We encourage continued effort and growth.</p>
                {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" style={styles.qrCode} />}
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    page: { fontFamily: '"Montserrat", "Segoe UI", sans-serif', width: '210mm', height: '297mm', padding: '12mm', boxSizing: 'border-box', backgroundColor: '#f9fafb', position: 'relative', overflow: 'hidden' },
    header: { display: 'flex', alignItems: 'center', gap: '15px', paddingBottom: '15px', borderBottom: '2px solid #ddd' },
    logo: { width: '60px', height: '60px', objectFit: 'contain' },
    headerText: {},
    reportTitle: { fontSize: '11pt', color: '#6b7280', margin: 0, fontWeight: 600, letterSpacing: '1px' },
    schoolName: { fontSize: '20pt', fontWeight: 700, margin: 0, color: '#1f2937' },
    studentInfo: { textAlign: 'center', margin: '30px 0' },
    studentName: { fontSize: '24pt', fontWeight: 700, margin: 0, color: '#1d4ed8' },
    studentDetails: { fontSize: '11pt', color: '#4b5563', margin: '5px 0 0 0' },
    subjectsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '25px', padding: '20px', flexGrow: 1, alignItems: 'center' },
    progressBox: { position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
    progressText: { position: 'absolute', textAlign: 'center', fontSize: '11pt' },
    subjectName: { fontSize: '10pt', fontWeight: 600, color: '#374151', marginTop: '10px' },
    footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '15px', borderTop: '2px solid #ddd' },
    footerText: { fontSize: '9pt', color: '#6b7280', width: '70%' },
    qrCode: { width: '60px', height: '60px', border: '4px solid white', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
};