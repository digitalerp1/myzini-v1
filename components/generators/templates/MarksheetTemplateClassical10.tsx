
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Student, OwnerProfile, ExamResult } from '../../../types';

interface MarksheetTemplateProps {
    student: Student;
    school: OwnerProfile;
    result: ExamResult;
}

export const MarksheetTemplateClassical10: React.FC<MarksheetTemplateProps> = ({ student, school, result }) => {
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const { subjects } = result.subjects_marks;
    
    useEffect(() => {
        QRCode.toDataURL(`${student.roll_number}`, { width: 80, margin: 1 }).then(setQrCodeUrl);
    }, [student]);

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <div style={styles.head}>
                    <h1 style={styles.school}>{school.school_name}</h1>
                    <p style={styles.exam}>EXAMINATION RESULT {new Date().getFullYear()}</p>
                </div>

                <div style={styles.profile}>
                    <div style={styles.pLeft}>
                        <p>NAME: <strong>{student.name}</strong></p>
                        <p>CLASS: <strong>{student.class}</strong></p>
                    </div>
                    <div style={styles.pRight}>
                        {student.photo_url && <img src={student.photo_url} style={styles.photo} alt="Student" crossOrigin="anonymous"/>}
                    </div>
                </div>

                <div style={styles.marks}>
                    {subjects.map((s, i) => (
                        <div key={i} style={styles.row}>
                            <span style={styles.sub}>{s.subject_name}</span>
                            <span style={styles.dots}></span>
                            <span style={styles.score}>{s.obtained_marks}/{s.total_marks}</span>
                        </div>
                    ))}
                </div>

                <div style={styles.foot}>
                    {qrCodeUrl && <img src={qrCodeUrl} style={styles.qr} alt="QR"/>}
                    <div style={styles.sign}>
                        <div style={styles.line}></div>
                        <span>Principal</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    page: { width: '210mm', height: '297mm', backgroundColor: '#fff', padding: '15mm', boxSizing: 'border-box', fontFamily: '"Georgia", serif' },
    container: { border: '4px solid #000', height: '100%', padding: '10mm', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' },
    head: { textAlign: 'center', marginBottom: '10mm', borderBottom: '2px solid #000', paddingBottom: '5mm' },
    school: { fontSize: '22pt', margin: 0 },
    exam: { fontSize: '12pt', marginTop: '5px' },
    profile: { display: 'flex', justifyContent: 'space-between', marginBottom: '10mm' },
    pLeft: { fontSize: '14pt', lineHeight: 2 },
    pRight: {},
    photo: { width: '80px', height: '100px', border: '1px solid #000', objectFit: 'cover' },
    marks: { flex: 1 },
    row: { display: 'flex', alignItems: 'center', fontSize: '14pt', marginBottom: '5mm' },
    sub: { fontWeight: 'bold' },
    dots: { flex: 1, borderBottom: '2px dotted #000', margin: '0 10px', position: 'relative', top: '-5px' },
    score: { fontWeight: 'bold' },
    foot: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' },
    qr: { width: '60px' },
    sign: { textAlign: 'center', width: '50mm' },
    line: { borderBottom: '2px solid #000', marginBottom: '2mm' }
};
