
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Student, OwnerProfile, ExamResult } from '../../../types';

interface MarksheetTemplateProps {
    student: Student;
    school: OwnerProfile;
    result: ExamResult;
}

export const MarksheetTemplateClassical1: React.FC<MarksheetTemplateProps> = ({ student, school, result }) => {
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const { subjects } = result.subjects_marks;
    const totalMarks = subjects.reduce((acc, s) => acc + Number(s.total_marks), 0);
    const obtainedMarks = subjects.reduce((acc, s) => acc + Number(s.obtained_marks), 0);
    const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;
    const schoolLogo = school.school_image_url;
    const studentPhoto = student.photo_url;

    useEffect(() => {
        QRCode.toDataURL(`${student.name}-${result.exam_name}`, { width: 80, margin: 1 }).then(setQrCodeUrl);
    }, [student]);

    return (
        <div style={styles.page}>
            <div style={styles.border}>
                <div style={styles.header}>
                    {schoolLogo && <img src={schoolLogo} style={styles.logo} alt="Logo" crossOrigin="anonymous"/>}
                    <div style={styles.schoolInfo}>
                        <h1 style={styles.schoolName}>{school.school_name.toUpperCase()}</h1>
                        <p style={styles.address}>{school.address}</p>
                    </div>
                </div>
                
                <h2 style={styles.title}>REPORT CARD</h2>
                
                <div style={styles.studentInfo}>
                    <div style={styles.infoText}>
                        <p><strong>Name:</strong> {student.name}</p>
                        <p><strong>Father's Name:</strong> {student.father_name}</p>
                        <p><strong>Class:</strong> {student.class} | <strong>Roll No:</strong> {student.roll_number}</p>
                        <p><strong>Exam:</strong> {result.exam_name}</p>
                    </div>
                    {studentPhoto && <img src={studentPhoto} style={styles.photo} alt="Student" crossOrigin="anonymous"/>}
                </div>

                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Subject</th>
                            <th style={styles.th}>Max Marks</th>
                            <th style={styles.th}>Min Marks</th>
                            <th style={styles.th}>Obtained</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subjects.map((s, i) => (
                            <tr key={i}>
                                <td style={styles.td}>{s.subject_name}</td>
                                <td style={styles.tdCenter}>{s.total_marks}</td>
                                <td style={styles.tdCenter}>{s.pass_marks}</td>
                                <td style={styles.tdCenter}>{s.obtained_marks}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td style={styles.footerTd}>Total</td>
                            <td style={styles.footerTdCenter}>{totalMarks}</td>
                            <td></td>
                            <td style={styles.footerTdCenter}>{obtainedMarks}</td>
                        </tr>
                    </tfoot>
                </table>

                <div style={styles.summary}>
                    <p><strong>Percentage:</strong> {percentage.toFixed(2)}%</p>
                    <p><strong>Result:</strong> {percentage >= 33 ? 'PASSED' : 'FAILED'}</p>
                </div>

                <div style={styles.footer}>
                    <div style={styles.sig}>
                        <div style={styles.line}></div>
                        <p>Class Teacher</p>
                    </div>
                    {qrCodeUrl && <img src={qrCodeUrl} style={styles.qr} alt="QR"/>}
                    <div style={styles.sig}>
                        <div style={styles.line}></div>
                        <p>Principal</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    page: { width: '210mm', height: '297mm', backgroundColor: '#fff', padding: '10mm', boxSizing: 'border-box', fontFamily: '"Times New Roman", serif' },
    border: { border: '3px solid #000', height: '100%', padding: '10mm', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' },
    header: { display: 'flex', alignItems: 'center', borderBottom: '2px solid #000', paddingBottom: '5mm', marginBottom: '5mm' },
    logo: { width: '60px', height: '60px', marginRight: '20px', objectFit: 'contain' },
    schoolInfo: { textAlign: 'center', flex: 1 },
    schoolName: { fontSize: '22pt', fontWeight: 'bold', margin: 0 },
    address: { fontSize: '10pt', marginTop: '2mm' },
    title: { textAlign: 'center', fontSize: '18pt', textDecoration: 'underline', marginBottom: '10mm' },
    studentInfo: { display: 'flex', justifyContent: 'space-between', marginBottom: '10mm', fontSize: '12pt' },
    infoText: { lineHeight: 1.6 },
    photo: { width: '100px', height: '120px', border: '1px solid #000', objectFit: 'cover' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '11pt', border: '1px solid #000', marginBottom: '5mm' },
    th: { border: '1px solid #000', padding: '3mm', backgroundColor: '#f0f0f0', textAlign: 'left' },
    td: { border: '1px solid #000', padding: '3mm' },
    tdCenter: { border: '1px solid #000', padding: '3mm', textAlign: 'center' },
    footerTd: { border: '1px solid #000', padding: '3mm', fontWeight: 'bold' },
    footerTdCenter: { border: '1px solid #000', padding: '3mm', fontWeight: 'bold', textAlign: 'center' },
    summary: { fontSize: '12pt', marginBottom: 'auto' },
    footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '10mm' },
    sig: { textAlign: 'center', width: '50mm' },
    line: { borderBottom: '1px solid #000', marginBottom: '2mm' },
    qr: { width: '60px', height: '60px' }
};
