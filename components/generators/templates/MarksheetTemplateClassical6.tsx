
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Student, OwnerProfile, ExamResult } from '../../../types';

interface MarksheetTemplateProps {
    student: Student;
    school: OwnerProfile;
    result: ExamResult;
}

export const MarksheetTemplateClassical6: React.FC<MarksheetTemplateProps> = ({ student, school, result }) => {
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const { subjects } = result.subjects_marks;
    
    useEffect(() => {
        QRCode.toDataURL(`${student.roll_number}`, { width: 80, margin: 1 }).then(setQrCodeUrl);
    }, [student]);

    return (
        <div style={styles.page}>
            <div style={styles.header}>
                <div style={styles.logoSide}>
                    {school.school_image_url && <img src={school.school_image_url} style={styles.logo} alt="Logo" crossOrigin="anonymous"/>}
                </div>
                <div style={styles.titleSide}>
                    <h1 style={styles.mainTitle}>OFFICIAL TRANSCRIPT</h1>
                    <h2 style={styles.schoolName}>{school.school_name}</h2>
                </div>
            </div>

            <div style={styles.divider}></div>

            <div style={styles.studentSection}>
                <div style={styles.col}>
                    <p><strong>STUDENT:</strong> {student.name.toUpperCase()}</p>
                    <p><strong>FATHER:</strong> {student.father_name?.toUpperCase()}</p>
                </div>
                <div style={styles.col}>
                    <p><strong>CLASS:</strong> {student.class}</p>
                    <p><strong>ROLL NO:</strong> {student.roll_number}</p>
                </div>
                <div style={styles.photoCol}>
                    {student.photo_url && <img src={student.photo_url} style={styles.photo} alt="Student" crossOrigin="anonymous"/>}
                </div>
            </div>

            <div style={styles.examSection}>
                <h3>EXAMINATION: {result.exam_name.toUpperCase()}</h3>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={{textAlign: 'left'}}>SUBJECT</th>
                            <th>TOTAL</th>
                            <th>PASS</th>
                            <th>OBT</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subjects.map((s, i) => (
                            <tr key={i}>
                                <td style={{textAlign: 'left', fontWeight: 'bold'}}>{s.subject_name}</td>
                                <td>{s.total_marks}</td>
                                <td>{s.pass_marks}</td>
                                <td>{s.obtained_marks}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={styles.footer}>
                <div style={styles.qrBox}>
                    {qrCodeUrl && <img src={qrCodeUrl} style={styles.qr} alt="QR"/>}
                </div>
                <div style={styles.signBox}>
                    <p>ISSUED ON: {new Date().toLocaleDateString()}</p>
                    <div style={styles.line}></div>
                    <p>REGISTRAR</p>
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    page: { width: '210mm', height: '297mm', backgroundColor: '#fff', padding: '15mm', boxSizing: 'border-box', fontFamily: '"Courier New", Courier, monospace' },
    header: { display: 'flex', alignItems: 'center', marginBottom: '5mm' },
    logoSide: { marginRight: '20px' },
    logo: { width: '70px', height: '70px', objectFit: 'contain' },
    titleSide: { flex: 1 },
    mainTitle: { fontSize: '22pt', margin: 0, letterSpacing: '2px' },
    schoolName: { fontSize: '14pt', fontWeight: 'normal', margin: '5px 0 0' },
    divider: { borderBottom: '4px solid #000', marginBottom: '10mm' },
    studentSection: { display: 'flex', justifyContent: 'space-between', marginBottom: '10mm', fontSize: '11pt' },
    col: { flex: 1 },
    photoCol: { width: '30mm' },
    photo: { width: '100%', border: '1px solid #000' },
    examSection: { marginBottom: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '5mm', fontSize: '12pt' },
    footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '20mm' },
    qrBox: {},
    qr: { width: '70px', height: '70px' },
    signBox: { textAlign: 'right' },
    line: { borderBottom: '1px solid #000', width: '60mm', margin: '10mm 0 2mm auto' }
};
