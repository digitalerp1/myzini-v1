import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Student, OwnerProfile, ExamResult } from '../../../types';

interface MarksheetTemplateProps {
    student: Student;
    school: OwnerProfile;
    result: ExamResult;
}

export const MarksheetTemplateMinimalist: React.FC<MarksheetTemplateProps> = ({ student, school, result }) => {
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const { subjects } = result.subjects_marks;
    const totalMarksPossible = subjects.reduce((sum, s) => sum + Number(s.total_marks), 0);
    const totalMarksObtained = subjects.reduce((sum, s) => sum + Number(s.obtained_marks), 0);
    const percentage = totalMarksPossible > 0 ? (totalMarksObtained / totalMarksPossible) * 100 : 0;
    const isPass = subjects.every(s => Number(s.obtained_marks) >= Number(s.pass_marks));
    
    useEffect(() => {
        const qrData = `${student.name}, ${result.exam_name}, ${percentage.toFixed(2)}%`;
        QRCode.toDataURL(qrData, { width: 80, margin: 1 }).then(setQrCodeUrl);
    }, [student.name, result.exam_name, percentage]);

    return (
        <div style={styles.page}>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.schoolName}>{school.school_name}</h1>
                    <p style={styles.examName}>{result.exam_name}</p>
                </div>
                <p style={styles.reportTitle}>Performance Report</p>
            </div>
            
            <div style={styles.studentInfo}>
                <div style={styles.infoBlock}>
                    <p style={styles.label}>Student</p>
                    <p style={styles.value}>{student.name}</p>
                </div>
                <div style={styles.infoBlock}>
                    <p style={styles.label}>Class</p>
                    <p style={styles.value}>{student.class}</p>
                </div>
                 <div style={styles.infoBlock}>
                    <p style={styles.label}>Roll Number</p>
                    <p style={styles.value}>{student.roll_number}</p>
                </div>
            </div>

            <table style={styles.marksTable}>
                <thead>
                    <tr>
                        <th style={styles.th}>Subject</th>
                        <th style={styles.thRight}>Marks Obtained</th>
                        <th style={styles.thRight}>Total Marks</th>
                    </tr>
                </thead>
                <tbody>
                    {subjects.map(s => (
                        <tr key={s.subject_name}>
                            <td style={styles.td}>{s.subject_name}</td>
                            <td style={styles.tdRight}>{s.obtained_marks}</td>
                            <td style={styles.tdRight}>{s.total_marks}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            <div style={styles.summary}>
                <div style={styles.summaryBlock}>
                    <p style={styles.label}>Total</p>
                    <p style={styles.value}>{totalMarksObtained}/{totalMarksPossible}</p>
                </div>
                <div style={styles.summaryBlock}>
                    <p style={styles.label}>Percentage</p>
                    <p style={styles.value}>{percentage.toFixed(2)}%</p>
                </div>
                 <div style={styles.summaryBlock}>
                    <p style={styles.label}>Result</p>
                    <p style={styles.value}>{isPass ? 'Pass' : 'Fail'}</p>
                </div>
            </div>

            <div style={styles.footer}>
                {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" />}
                <p>Issued on: {new Date().toLocaleDateString()}</p>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    page: { fontFamily: '"Inter", -apple-system, sans-serif', width: '210mm', height: '297mm', padding: '18mm', boxSizing: 'border-box', backgroundColor: '#fff', color: '#111827', display: 'flex', flexDirection: 'column' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid #d1d5db', paddingBottom: '10px' },
    schoolName: { fontSize: '18pt', fontWeight: 600, margin: 0 },
    examName: { fontSize: '10pt', color: '#6b7280', margin: '4px 0 0 0' },
    reportTitle: { fontSize: '12pt', fontWeight: 500, color: '#374151' },
    studentInfo: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '20px', margin: '25px 0' },
    infoBlock: {},
    label: { fontSize: '9pt', color: '#6b7280', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' },
    value: { fontSize: '12pt', fontWeight: 500, margin: '4px 0 0 0' },
    marksTable: { width: '100%', borderCollapse: 'collapse', fontSize: '11pt' },
    th: { padding: '10px 0', textAlign: 'left', borderBottom: '1px solid #111827', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '9pt' },
    thRight: { padding: '10px 0', textAlign: 'right', borderBottom: '1px solid #111827', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '9pt' },
    td: { padding: '12px 0', borderBottom: '1px solid #e5e7eb' },
    tdRight: { padding: '12px 0', borderBottom: '1px solid #e5e7eb', textAlign: 'right', fontWeight: 500 },
    summary: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '20px', marginTop: '25px', backgroundColor: '#f9fafb', padding: '20px', borderRadius: '8px' },
    summaryBlock: {},
    footer: { marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #d1d5db', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '9pt', color: '#6b7280' },
};