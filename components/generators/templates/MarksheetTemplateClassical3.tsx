
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Student, OwnerProfile, ExamResult } from '../../../types';

interface MarksheetTemplateProps {
    student: Student;
    school: OwnerProfile;
    result: ExamResult;
}

export const MarksheetTemplateClassical3: React.FC<MarksheetTemplateProps> = ({ student, school, result }) => {
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const { subjects } = result.subjects_marks;
    
    useEffect(() => {
        QRCode.toDataURL(student.roll_number || 'N/A', { width: 70, margin: 0, color: { dark: '#5d4037' } }).then(setQrCodeUrl);
    }, [student]);

    return (
        <div style={styles.page}>
            <div style={styles.innerPage}>
                <div style={styles.header}>
                    {school.school_image_url && <img src={school.school_image_url} style={styles.logo} alt="Logo" crossOrigin="anonymous"/>}
                    <h1 style={styles.schoolName}>{school.school_name}</h1>
                    <p style={styles.address}>{school.address}</p>
                </div>

                <h2 style={styles.reportTitle}>PROGRESS REPORT</h2>

                <div style={styles.infoBox}>
                    <div style={styles.infoRow}>
                        <span>Name: <strong>{student.name}</strong></span>
                        <span>Class: <strong>{student.class}</strong></span>
                    </div>
                    <div style={styles.infoRow}>
                        <span>Roll No: <strong>{student.roll_number}</strong></span>
                        <span>Session: <strong>{new Date().getFullYear()}</strong></span>
                    </div>
                </div>

                {student.photo_url && <img src={student.photo_url} style={styles.photo} alt="Student" crossOrigin="anonymous"/>}

                <table style={styles.table}>
                    <thead>
                        <tr style={styles.thRow}>
                            <th style={styles.th}>Subject</th>
                            <th style={styles.th}>Max</th>
                            <th style={styles.th}>Obtained</th>
                            <th style={styles.th}>Grade</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subjects.map((s, i) => {
                            const percent = (Number(s.obtained_marks) / Number(s.total_marks)) * 100;
                            let grade = 'F';
                            if(percent >= 90) grade = 'A+';
                            else if(percent >= 75) grade = 'A';
                            else if(percent >= 60) grade = 'B';
                            else if(percent >= 40) grade = 'C';
                            
                            return (
                                <tr key={i}>
                                    <td style={styles.td}>{s.subject_name}</td>
                                    <td style={styles.td}>{s.total_marks}</td>
                                    <td style={styles.td}>{s.obtained_marks}</td>
                                    <td style={styles.td}>{grade}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                <div style={styles.footer}>
                    <div style={styles.signatures}>
                        <div style={styles.sign}>Class Teacher</div>
                        <div style={styles.sign}>Principal</div>
                    </div>
                    {qrCodeUrl && <img src={qrCodeUrl} style={styles.qr} alt="QR"/>}
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    page: { width: '210mm', height: '297mm', backgroundColor: '#fdf6e3', padding: '15mm', boxSizing: 'border-box', fontFamily: '"Garamond", serif', color: '#3e2723' },
    innerPage: { border: '2px solid #5d4037', height: '100%', padding: '10mm', boxSizing: 'border-box', position: 'relative', display: 'flex', flexDirection: 'column' },
    header: { textAlign: 'center', marginBottom: '5mm' },
    logo: { width: '50px', height: '50px', marginBottom: '2mm', objectFit: 'contain' },
    schoolName: { fontSize: '24pt', fontWeight: 'bold', margin: 0, textTransform: 'uppercase' },
    address: { fontSize: '11pt', fontStyle: 'italic' },
    reportTitle: { textAlign: 'center', fontSize: '18pt', letterSpacing: '2px', borderBottom: '1px solid #5d4037', paddingBottom: '2mm', marginBottom: '10mm' },
    infoBox: { display: 'flex', flexDirection: 'column', gap: '5mm', marginBottom: '10mm', fontSize: '14pt' },
    infoRow: { display: 'flex', justifyContent: 'space-between' },
    photo: { position: 'absolute', top: '45mm', right: '10mm', width: '30mm', height: '35mm', border: '1px solid #5d4037', objectFit: 'cover' },
    table: { width: '100%', borderCollapse: 'collapse', border: '1px solid #5d4037', marginBottom: 'auto' },
    thRow: { backgroundColor: '#efebe9' },
    th: { border: '1px solid #5d4037', padding: '3mm', textAlign: 'center' },
    td: { border: '1px solid #5d4037', padding: '3mm', textAlign: 'center' },
    footer: { marginTop: '10mm', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' },
    signatures: { display: 'flex', gap: '20mm' },
    sign: { borderTop: '1px solid #5d4037', width: '40mm', textAlign: 'center', paddingTop: '2mm' },
    qr: { width: '60px', height: '60px' }
};
