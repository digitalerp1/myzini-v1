
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Student, OwnerProfile, ExamResult } from '../../../types';

interface MarksheetTemplateProps {
    student: Student;
    school: OwnerProfile;
    result: ExamResult;
}

export const MarksheetTemplateClassical8: React.FC<MarksheetTemplateProps> = ({ student, school, result }) => {
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const { subjects } = result.subjects_marks;
    
    useEffect(() => {
        QRCode.toDataURL(`${student.id}`, { width: 80, margin: 1 }).then(setQrCodeUrl);
    }, [student]);

    return (
        <div style={styles.page}>
            <div style={styles.border}>
                <div style={styles.top}>
                    <h1 style={styles.school}>{school.school_name}</h1>
                    <p>Academic Session {new Date().getFullYear()}</p>
                </div>

                <div style={styles.box}>
                    <div style={styles.photoArea}>
                        {student.photo_url && <img src={student.photo_url} style={styles.photo} alt="Student" crossOrigin="anonymous"/>}
                    </div>
                    <div style={styles.details}>
                        <p>NAME: {student.name}</p>
                        <p>CLASS: {student.class}</p>
                        <p>ROLL NO: {student.roll_number}</p>
                        <p>EXAM: {result.exam_name}</p>
                    </div>
                    <div style={styles.logoArea}>
                        {school.school_image_url && <img src={school.school_image_url} style={styles.logo} alt="Logo" crossOrigin="anonymous"/>}
                    </div>
                </div>

                <div style={styles.results}>
                    <div style={styles.headerRow}>
                        <span>SUBJECT</span>
                        <span>FULL MARKS</span>
                        <span>PASS MARKS</span>
                        <span>OBTAINED</span>
                    </div>
                    {subjects.map((s, i) => (
                        <div key={i} style={styles.row}>
                            <span>{s.subject_name}</span>
                            <span>{s.total_marks}</span>
                            <span>{s.pass_marks}</span>
                            <span style={{fontWeight:'bold'}}>{s.obtained_marks}</span>
                        </div>
                    ))}
                </div>

                <div style={styles.bottom}>
                    {qrCodeUrl && <img src={qrCodeUrl} style={styles.qr} alt="QR"/>}
                    <div style={styles.signs}>
                        <div style={styles.sign}>Controller of Exams</div>
                        <div style={styles.sign}>Principal</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    page: { width: '210mm', height: '297mm', backgroundColor: '#fff', padding: '10mm', boxSizing: 'border-box', fontFamily: '"Times New Roman", serif' },
    border: { border: '2px solid #444', height: '100%', padding: '5mm', display: 'flex', flexDirection: 'column' },
    top: { textAlign: 'center', borderBottom: '2px solid #444', paddingBottom: '5mm', marginBottom: '5mm' },
    school: { fontSize: '20pt', margin: 0, textTransform: 'uppercase' },
    box: { display: 'flex', border: '1px solid #444', padding: '5mm', marginBottom: '5mm' },
    photoArea: { width: '25mm', marginRight: '5mm' },
    photo: { width: '100%', border: '1px solid #ccc' },
    details: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-around', fontSize: '12pt', fontWeight: 'bold' },
    logoArea: { width: '25mm', display: 'flex', alignItems: 'center' },
    logo: { width: '100%', objectFit: 'contain' },
    results: { flex: 1, border: '1px solid #444' },
    headerRow: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', borderBottom: '1px solid #444', padding: '3mm', fontWeight: 'bold', backgroundColor: '#eee' },
    row: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', borderBottom: '1px solid #ccc', padding: '3mm' },
    bottom: { marginTop: '10mm', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    qr: { width: '60px' },
    signs: { display: 'flex', gap: '20mm' },
    sign: { borderTop: '1px solid #444', paddingTop: '2mm', width: '40mm', textAlign: 'center' }
};
