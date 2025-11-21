
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Student, OwnerProfile, ExamResult } from '../../../types';

interface MarksheetTemplateProps {
    student: Student;
    school: OwnerProfile;
    result: ExamResult;
}

export const MarksheetTemplateClassical2: React.FC<MarksheetTemplateProps> = ({ student, school, result }) => {
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const { subjects } = result.subjects_marks;
    const totalMarks = subjects.reduce((acc, s) => acc + Number(s.total_marks), 0);
    const obtainedMarks = subjects.reduce((acc, s) => acc + Number(s.obtained_marks), 0);
    
    useEffect(() => {
        QRCode.toDataURL(`${student.name}|${result.exam_name}`, { width: 80, margin: 1 }).then(setQrCodeUrl);
    }, [student]);

    return (
        <div style={styles.page}>
            <div style={styles.border}>
                <div style={styles.content}>
                    <div style={styles.header}>
                        <div style={{flex: 1}}>
                            {school.school_image_url && <img src={school.school_image_url} style={styles.logo} alt="Logo" crossOrigin="anonymous"/>}
                        </div>
                        <div style={{flex: 3, textAlign: 'center'}}>
                            <h1 style={styles.schoolName}>{school.school_name}</h1>
                            <p>{school.address}</p>
                        </div>
                        <div style={{flex: 1, textAlign: 'right'}}>
                            {student.photo_url && <img src={student.photo_url} style={styles.photo} alt="Student" crossOrigin="anonymous"/>}
                        </div>
                    </div>

                    <div style={styles.divider}></div>
                    <h2 style={styles.title}>STATEMENT OF MARKS</h2>
                    <p style={styles.examTitle}>{result.exam_name} ({new Date().getFullYear()})</p>

                    <div style={styles.details}>
                        <p><strong>Student Name:</strong> {student.name}</p>
                        <p><strong>Class:</strong> {student.class}</p>
                        <p><strong>Roll No:</strong> {student.roll_number}</p>
                        <p><strong>Date of Birth:</strong> {student.date_of_birth}</p>
                    </div>

                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>SUBJECTS</th>
                                <th style={styles.thCenter}>MAX MARKS</th>
                                <th style={styles.thCenter}>OBTAINED</th>
                                <th style={styles.thCenter}>REMARKS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subjects.map((s, i) => (
                                <tr key={i}>
                                    <td style={styles.td}>{s.subject_name}</td>
                                    <td style={styles.tdCenter}>{s.total_marks}</td>
                                    <td style={styles.tdCenter}>{s.obtained_marks}</td>
                                    <td style={styles.tdCenter}>{Number(s.obtained_marks) >= Number(s.pass_marks) ? 'Pass' : 'Fail'}</td>
                                </tr>
                            ))}
                            <tr style={{fontWeight: 'bold', backgroundColor: '#f5f5f5'}}>
                                <td style={styles.td}>GRAND TOTAL</td>
                                <td style={styles.tdCenter}>{totalMarks}</td>
                                <td style={styles.tdCenter}>{obtainedMarks}</td>
                                <td style={styles.tdCenter}></td>
                            </tr>
                        </tbody>
                    </table>

                    <div style={styles.footer}>
                        <div style={styles.sigBlock}>
                            <p>___________________</p>
                            <p>CHECKED BY</p>
                        </div>
                        <div style={{textAlign: 'center'}}>
                            {qrCodeUrl && <img src={qrCodeUrl} style={styles.qr} alt="QR"/>}
                        </div>
                        <div style={styles.sigBlock}>
                            <p>___________________</p>
                            <p>PRINCIPAL</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    page: { width: '210mm', height: '297mm', backgroundColor: '#fff', padding: '10mm', boxSizing: 'border-box', fontFamily: '"Georgia", serif' },
    border: { border: '5px double #333', height: '100%', padding: '5mm', boxSizing: 'border-box' },
    content: { border: '1px solid #ccc', height: '100%', padding: '10mm', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' },
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5mm' },
    logo: { width: '70px', height: '70px', objectFit: 'contain' },
    schoolName: { fontSize: '20pt', fontWeight: 'bold', margin: '0 0 5px 0', textTransform: 'uppercase' },
    photo: { width: '80px', height: '100px', border: '1px solid #333', objectFit: 'cover' },
    divider: { borderBottom: '2px solid #333', marginBottom: '5mm' },
    title: { textAlign: 'center', fontSize: '16pt', margin: '0 0 5px 0' },
    examTitle: { textAlign: 'center', fontSize: '12pt', margin: '0 0 10mm 0', fontStyle: 'italic' },
    details: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10mm', fontSize: '11pt' },
    table: { width: '100%', borderCollapse: 'collapse', marginBottom: 'auto', fontSize: '11pt' },
    th: { borderBottom: '2px solid #333', padding: '8px', textAlign: 'left' },
    thCenter: { borderBottom: '2px solid #333', padding: '8px', textAlign: 'center' },
    td: { borderBottom: '1px solid #ccc', padding: '8px' },
    tdCenter: { borderBottom: '1px solid #ccc', padding: '8px', textAlign: 'center' },
    footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '20mm' },
    sigBlock: { textAlign: 'center', fontSize: '10pt' },
    qr: { width: '60px', height: '60px' }
};
