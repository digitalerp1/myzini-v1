
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Student, OwnerProfile, ExamResult } from '../../../types';

interface MarksheetTemplateProps {
    student: Student;
    school: OwnerProfile;
    result: ExamResult;
}

export const MarksheetTemplateClassical9: React.FC<MarksheetTemplateProps> = ({ student, school, result }) => {
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const { subjects } = result.subjects_marks;
    
    useEffect(() => {
        QRCode.toDataURL(`Result:${student.id}`, { width: 70, margin: 0 }).then(setQrCodeUrl);
    }, [student]);

    return (
        <div style={styles.page}>
            <div style={styles.header}>
                {school.school_image_url && <img src={school.school_image_url} style={styles.logo} alt="Logo" crossOrigin="anonymous"/>}
                <h1 style={styles.title}>{school.school_name}</h1>
                <p>{school.address}</p>
            </div>

            <div style={styles.card}>
                <div style={styles.row}>
                    <div style={styles.field}>Name: {student.name}</div>
                    <div style={styles.field}>Class: {student.class}</div>
                </div>
                <div style={styles.row}>
                    <div style={styles.field}>Father: {student.father_name}</div>
                    <div style={styles.field}>Roll: {student.roll_number}</div>
                </div>
            </div>

            <h2 style={styles.subTitle}>Report Card</h2>

            <table style={styles.table}>
                <thead>
                    <tr>
                        <th>Subject</th>
                        <th>Max</th>
                        <th>Obt</th>
                    </tr>
                </thead>
                <tbody>
                    {subjects.map((s, i) => (
                        <tr key={i}>
                            <td>{s.subject_name}</td>
                            <td>{s.total_marks}</td>
                            <td>{s.obtained_marks}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div style={styles.footer}>
                <div style={styles.qr}>
                    {qrCodeUrl && <img src={qrCodeUrl} style={{width:'100%'}} alt="QR"/>}
                </div>
                <div style={styles.sig}>
                    <p>Principal's Signature</p>
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    page: { width: '210mm', height: '297mm', backgroundColor: '#fff', padding: '15mm', boxSizing: 'border-box', fontFamily: '"Times New Roman", serif', border: '1px solid #000' },
    header: { textAlign: 'center', marginBottom: '10mm' },
    logo: { width: '50px', marginBottom: '5px' },
    title: { fontSize: '20pt', margin: 0, fontWeight: 'bold' },
    card: { border: '1px solid #000', padding: '5mm', marginBottom: '5mm' },
    row: { display: 'flex', justifyContent: 'space-between', marginBottom: '2mm' },
    field: { fontSize: '12pt' },
    subTitle: { textAlign: 'center', textDecoration: 'underline', marginBottom: '5mm' },
    table: { width: '100%', borderCollapse: 'collapse', border: '1px solid #000', marginBottom: 'auto', fontSize: '12pt' },
    footer: { marginTop: '10mm', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    qr: { width: '60px' },
    sig: { borderTop: '1px solid #000', paddingTop: '2mm' }
};
