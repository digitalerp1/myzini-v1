
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Student, OwnerProfile, ExamResult } from '../../../types';

interface MarksheetTemplateProps {
    student: Student;
    school: OwnerProfile;
    result: ExamResult;
}

export const MarksheetTemplateClassical12: React.FC<MarksheetTemplateProps> = ({ student, school, result }) => {
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const { subjects } = result.subjects_marks;
    
    useEffect(() => {
        QRCode.toDataURL(`ID:${student.id}`, { width: 70, margin: 0 }).then(setQrCodeUrl);
    }, [student]);

    return (
        <div style={styles.page}>
            <div style={styles.header}>
                <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                    {school.school_image_url && <img src={school.school_image_url} style={styles.logo} alt="Logo" crossOrigin="anonymous"/>}
                    <h1 style={styles.schoolName}>{school.school_name}</h1>
                </div>
                <div style={styles.line}></div>
            </div>

            <div style={styles.meta}>
                <div style={styles.left}>
                    <p>STUDENT NAME: <strong>{student.name}</strong></p>
                    <p>CLASS: <strong>{student.class}</strong></p>
                    <p>ROLL NUMBER: <strong>{student.roll_number}</strong></p>
                </div>
                <div style={styles.right}>
                    {student.photo_url && <img src={student.photo_url} style={styles.photo} alt="Student" crossOrigin="anonymous"/>}
                </div>
            </div>

            <table style={styles.table}>
                <thead>
                    <tr style={styles.headRow}>
                        <th>SUBJECT</th>
                        <th>MARKS</th>
                    </tr>
                </thead>
                <tbody>
                    {subjects.map((s, i) => (
                        <tr key={i}>
                            <td style={styles.cell}>{s.subject_name}</td>
                            <td style={styles.cell}>{s.obtained_marks} / {s.total_marks}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div style={styles.footer}>
                {qrCodeUrl && <img src={qrCodeUrl} style={styles.qr} alt="QR"/>}
                <p style={styles.date}>Date: {new Date().toLocaleDateString()}</p>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    page: { width: '210mm', height: '297mm', backgroundColor: '#fff', padding: '15mm', boxSizing: 'border-box', fontFamily: '"Times New Roman", serif' },
    header: { marginBottom: '10mm' },
    schoolName: { fontSize: '18pt', margin: 0 },
    logo: { width: '40px', height: '40px', objectFit: 'contain' },
    line: { borderBottom: '2px solid #000', marginTop: '5mm' },
    meta: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10mm', fontSize: '12pt' },
    left: { lineHeight: 1.8 },
    photo: { width: '30mm', height: '35mm', objectFit: 'cover', border: '1px solid #000' },
    table: { width: '100%', borderCollapse: 'collapse', marginBottom: 'auto' },
    headRow: { backgroundColor: '#000', color: '#fff' },
    cell: { padding: '3mm', borderBottom: '1px solid #ccc' },
    footer: { marginTop: '10mm', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    qr: { width: '60px' },
    date: { fontSize: '12pt' }
};
