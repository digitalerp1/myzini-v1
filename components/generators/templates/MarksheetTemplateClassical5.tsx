
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Student, OwnerProfile, ExamResult } from '../../../types';

interface MarksheetTemplateProps {
    student: Student;
    school: OwnerProfile;
    result: ExamResult;
}

export const MarksheetTemplateClassical5: React.FC<MarksheetTemplateProps> = ({ student, school, result }) => {
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const { subjects } = result.subjects_marks;
    
    useEffect(() => {
        QRCode.toDataURL(`S:${student.id}`, { width: 60, margin: 0 }).then(setQrCodeUrl);
    }, [student]);

    return (
        <div style={styles.page}>
            <div style={styles.header}>
                <h1 style={styles.schoolName}>{school.school_name}</h1>
                <p style={styles.address}>{school.address}</p>
                <div style={styles.line}></div>
            </div>

            <div style={styles.content}>
                <div style={styles.profile}>
                    <div style={styles.photoBox}>
                        {student.photo_url && <img src={student.photo_url} style={styles.photo} alt="Student" crossOrigin="anonymous"/>}
                    </div>
                    <div style={styles.details}>
                        <h2>{student.name}</h2>
                        <p>Class: {student.class}</p>
                        <p>Roll: {student.roll_number}</p>
                        <p>Father: {student.father_name}</p>
                    </div>
                    <div style={styles.logoBox}>
                        {school.school_image_url && <img src={school.school_image_url} style={styles.logo} alt="Logo" crossOrigin="anonymous"/>}
                    </div>
                </div>

                <h3 style={styles.examName}>{result.exam_name} Results</h3>

                <div style={styles.grid}>
                    {subjects.map((s, i) => (
                        <div key={i} style={styles.card}>
                            <p style={styles.subject}>{s.subject_name}</p>
                            <div style={styles.score}>
                                <span>{s.obtained_marks}</span>
                                <span style={styles.total}>/{s.total_marks}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={styles.footer}>
                    <div style={styles.qrContainer}>
                        {qrCodeUrl && <img src={qrCodeUrl} style={styles.qr} alt="QR"/>}
                    </div>
                    <div style={styles.sign}>
                        <p>Authorized Signature</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    page: { width: '210mm', height: '297mm', backgroundColor: '#fff', padding: '20mm', boxSizing: 'border-box', fontFamily: '"Times New Roman", serif' },
    header: { textAlign: 'center', marginBottom: '15mm' },
    schoolName: { fontSize: '24pt', fontWeight: 'normal', margin: 0, letterSpacing: '2px' },
    address: { fontSize: '10pt', color: '#666', marginTop: '2mm' },
    line: { width: '50px', height: '1px', backgroundColor: '#000', margin: '5mm auto' },
    content: { display: 'flex', flexDirection: 'column', height: '80%' },
    profile: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10mm', borderBottom: '1px solid #eee', paddingBottom: '5mm' },
    photoBox: { width: '80px' },
    photo: { width: '80px', height: '100px', objectFit: 'cover' },
    details: { textAlign: 'center' },
    logoBox: { width: '80px', textAlign: 'right' },
    logo: { width: '60px', height: '60px', objectFit: 'contain' },
    examName: { textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '5mm' },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10mm', marginBottom: 'auto' },
    card: { border: '1px solid #000', padding: '5mm', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    subject: { fontSize: '12pt', fontWeight: 'bold' },
    score: { fontSize: '14pt' },
    total: { fontSize: '10pt', color: '#666' },
    footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10mm' },
    qrContainer: { border: '1px solid #000', padding: '2px' },
    qr: { width: '50px', height: '50px' },
    sign: { borderTop: '1px solid #000', paddingTop: '2mm', width: '60mm', textAlign: 'center' }
};
