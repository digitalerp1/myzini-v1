
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Student, OwnerProfile, ExamResult } from '../../../types';

interface MarksheetTemplateProps {
    student: Student;
    school: OwnerProfile;
    result: ExamResult;
}

export const MarksheetTemplateClassical11: React.FC<MarksheetTemplateProps> = ({ student, school, result }) => {
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const { subjects } = result.subjects_marks;
    
    useEffect(() => {
        QRCode.toDataURL(`${student.name}-${result.exam_name}`, { width: 80, margin: 1 }).then(setQrCodeUrl);
    }, [student]);

    return (
        <div style={styles.page}>
            <div style={styles.border}>
                <div style={styles.header}>
                    <h1 style={styles.schoolName}>{school.school_name}</h1>
                    <div style={styles.emblem}>
                        {school.school_image_url && <img src={school.school_image_url} style={styles.logo} alt="Logo" crossOrigin="anonymous"/>}
                    </div>
                </div>

                <div style={styles.studentInfo}>
                    {student.photo_url && <img src={student.photo_url} style={styles.photo} alt="Student" crossOrigin="anonymous"/>}
                    <div style={styles.details}>
                        <p>Name: {student.name}</p>
                        <p>Class: {student.class}</p>
                        <p>Roll No: {student.roll_number}</p>
                    </div>
                </div>

                <h3 style={styles.subHeader}>Marks Statement</h3>

                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Subject</th>
                            <th style={styles.th}>Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subjects.map((s, i) => (
                            <tr key={i}>
                                <td style={styles.td}>{s.subject_name}</td>
                                <td style={styles.td}>{s.obtained_marks}/{s.total_marks}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div style={styles.footer}>
                    {qrCodeUrl && <img src={qrCodeUrl} style={styles.qr} alt="QR"/>}
                    <div style={styles.signature}>
                        <p>Principal</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    page: { width: '210mm', height: '297mm', backgroundColor: '#fff', padding: '10mm', boxSizing: 'border-box', fontFamily: '"Times New Roman", serif' },
    border: { border: '6px ridge #555', height: '100%', padding: '10mm', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' },
    header: { textAlign: 'center', marginBottom: '10mm' },
    schoolName: { fontSize: '20pt', margin: '0 0 5mm' },
    emblem: { display: 'flex', justifyContent: 'center' },
    logo: { width: '50px', height: '50px', objectFit: 'contain' },
    studentInfo: { display: 'flex', alignItems: 'center', gap: '10mm', marginBottom: '10mm', borderBottom: '1px solid #ccc', paddingBottom: '5mm' },
    photo: { width: '60px', height: '70px', border: '1px solid #999', objectFit: 'cover' },
    details: { fontSize: '12pt', lineHeight: 1.5 },
    subHeader: { textAlign: 'center', textDecoration: 'underline', marginBottom: '5mm' },
    table: { width: '100%', borderCollapse: 'collapse', marginBottom: 'auto' },
    th: { border: '1px solid #000', padding: '3mm', backgroundColor: '#eee' },
    td: { border: '1px solid #000', padding: '3mm', textAlign: 'center' },
    footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10mm' },
    qr: { width: '60px' },
    signature: { borderTop: '1px solid #000', width: '40mm', textAlign: 'center', paddingTop: '2mm' }
};
