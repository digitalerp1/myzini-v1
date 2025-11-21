
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Student, OwnerProfile, ExamResult } from '../../../types';

interface MarksheetTemplateProps {
    student: Student;
    school: OwnerProfile;
    result: ExamResult;
}

export const MarksheetTemplateClassical7: React.FC<MarksheetTemplateProps> = ({ student, school, result }) => {
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const { subjects } = result.subjects_marks;
    
    useEffect(() => {
        QRCode.toDataURL(`${student.name}`, { width: 80, margin: 1, color: { dark: '#1a202c' } }).then(setQrCodeUrl);
    }, [student]);

    return (
        <div style={styles.page}>
            <div style={styles.frame}>
                <div style={styles.header}>
                    {school.school_image_url && <img src={school.school_image_url} style={styles.logo} alt="Logo" crossOrigin="anonymous"/>}
                    <div>
                        <h1 style={styles.name}>{school.school_name}</h1>
                        <p>{school.address}</p>
                    </div>
                </div>

                <h2 style={styles.heading}>Mark Sheet</h2>

                <div style={styles.studentBar}>
                    {student.photo_url && <img src={student.photo_url} style={styles.photo} alt="Student" crossOrigin="anonymous"/>}
                    <div style={styles.info}>
                        <div style={styles.row}><span>Name:</span> <strong>{student.name}</strong></div>
                        <div style={styles.row}><span>Class:</span> <strong>{student.class}</strong></div>
                        <div style={styles.row}><span>Roll No:</span> <strong>{student.roll_number}</strong></div>
                    </div>
                    <div style={styles.qr}>
                        {qrCodeUrl && <img src={qrCodeUrl} style={{width:'100%'}} alt="QR"/>}
                    </div>
                </div>

                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th>Subject</th>
                            <th>Max</th>
                            <th>Obtained</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subjects.map((s, i) => (
                            <tr key={i}>
                                <td style={styles.td}>{s.subject_name}</td>
                                <td style={styles.tdNum}>{s.total_marks}</td>
                                <td style={styles.tdNum}>{s.obtained_marks}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div style={styles.footer}>
                    <div style={styles.signature}>
                        <p>Principal</p>
                    </div>
                    <div style={styles.signature}>
                        <p>Date</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    page: { width: '210mm', height: '297mm', backgroundColor: '#fff', padding: '10mm', boxSizing: 'border-box', fontFamily: '"Garamond", serif' },
    frame: { border: '1px solid #1a202c', height: '100%', padding: '10mm', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' },
    header: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginBottom: '10mm' },
    logo: { width: '50px', height: '50px', objectFit: 'contain' },
    name: { fontSize: '22pt', margin: 0, textTransform: 'uppercase' },
    heading: { textAlign: 'center', borderTop: '1px solid #000', borderBottom: '1px solid #000', padding: '2mm 0', margin: '0 0 10mm' },
    studentBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10mm' },
    photo: { width: '25mm', height: '30mm', objectFit: 'cover', border: '1px solid #000' },
    info: { flex: 1, marginLeft: '10mm', fontSize: '14pt' },
    row: { marginBottom: '2mm' },
    qr: { width: '25mm' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '12pt', marginBottom: 'auto' },
    td: { padding: '3mm', borderBottom: '1px solid #ccc' },
    tdNum: { padding: '3mm', borderBottom: '1px solid #ccc', textAlign: 'center' },
    footer: { display: 'flex', justifyContent: 'space-between', marginTop: '20mm' },
    signature: { borderTop: '1px solid #000', width: '50mm', textAlign: 'center', paddingTop: '2mm' }
};
