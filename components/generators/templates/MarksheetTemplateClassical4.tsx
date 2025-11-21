
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Student, OwnerProfile, ExamResult } from '../../../types';

interface MarksheetTemplateProps {
    student: Student;
    school: OwnerProfile;
    result: ExamResult;
}

export const MarksheetTemplateClassical4: React.FC<MarksheetTemplateProps> = ({ student, school, result }) => {
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const { subjects } = result.subjects_marks;
    
    useEffect(() => {
        QRCode.toDataURL(`${student.name}`, { width: 80, margin: 1 }).then(setQrCodeUrl);
    }, [student]);

    return (
        <div style={styles.page}>
            <div style={styles.headerBar}>
                {school.school_image_url && <img src={school.school_image_url} style={styles.logo} alt="Logo" crossOrigin="anonymous"/>}
                <div style={styles.headerText}>
                    <h1>{school.school_name}</h1>
                    <p>{school.address}</p>
                </div>
            </div>

            <div style={styles.container}>
                <div style={styles.subHeader}>
                    <h2>ACADEMIC PERFORMANCE REPORT</h2>
                    <p>{result.exam_name}</p>
                </div>

                <div style={styles.studentBlock}>
                    {student.photo_url && <img src={student.photo_url} style={styles.photo} alt="Student" crossOrigin="anonymous"/>}
                    <div style={styles.info}>
                        <p>Student Name: <strong>{student.name}</strong></p>
                        <p>Roll Number: <strong>{student.roll_number}</strong></p>
                        <p>Class: <strong>{student.class}</strong></p>
                    </div>
                    <div style={styles.qrBlock}>
                        {qrCodeUrl && <img src={qrCodeUrl} style={styles.qr} alt="QR"/>}
                    </div>
                </div>

                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th>Subject</th>
                            <th>Full Marks</th>
                            <th>Passing</th>
                            <th>Obtained</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subjects.map((s, i) => (
                            <tr key={i}>
                                <td>{s.subject_name}</td>
                                <td>{s.total_marks}</td>
                                <td>{s.pass_marks}</td>
                                <td style={{fontWeight: 'bold'}}>{s.obtained_marks}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div style={styles.footer}>
                    <div style={styles.signArea}>
                        <p>Date: {new Date().toLocaleDateString()}</p>
                    </div>
                    <div style={styles.signArea}>
                        <div style={styles.line}></div>
                        <p>Principal's Signature</p>
                    </div>
                </div>
            </div>
            <div style={styles.footerBar}></div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    page: { width: '210mm', height: '297mm', backgroundColor: '#fff', boxSizing: 'border-box', fontFamily: '"Palatino Linotype", serif', display: 'flex', flexDirection: 'column' },
    headerBar: { backgroundColor: '#2c3e50', color: 'white', padding: '10mm', display: 'flex', alignItems: 'center' },
    logo: { width: '60px', height: '60px', marginRight: '15px', backgroundColor: 'white', borderRadius: '50%', padding: '2px', objectFit: 'contain' },
    headerText: { flex: 1 },
    container: { padding: '15mm', flex: 1, display: 'flex', flexDirection: 'column' },
    subHeader: { textAlign: 'center', marginBottom: '10mm', borderBottom: '2px solid #2c3e50', paddingBottom: '5mm' },
    studentBlock: { display: 'flex', alignItems: 'center', marginBottom: '10mm', gap: '10mm' },
    photo: { width: '80px', height: '100px', border: '1px solid #ccc', objectFit: 'cover' },
    info: { flex: 1, fontSize: '12pt', lineHeight: 1.8 },
    qrBlock: { marginLeft: 'auto' },
    qr: { width: '70px', height: '70px' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '11pt', marginBottom: 'auto' },
    footer: { display: 'flex', justifyContent: 'space-between', marginTop: '20mm' },
    signArea: { textAlign: 'center', width: '60mm' },
    line: { borderBottom: '1px solid #000', marginBottom: '2mm' },
    footerBar: { height: '10mm', backgroundColor: '#2c3e50' }
};
