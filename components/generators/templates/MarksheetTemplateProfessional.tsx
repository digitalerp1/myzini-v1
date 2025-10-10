import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Student, OwnerProfile, ExamResult } from '../../../types';

interface MarksheetTemplateProps {
    student: Student;
    school: OwnerProfile;
    result: ExamResult;
}

const defaultLogo = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzEwMWM0ZCI+PHBhdGggZD0iTTUgMTMuNWw3LTcgNyA3LTctNy03IDd2N2g3di03eiIvPjwvc3ZnPg==";

export const MarksheetTemplateProfessional: React.FC<MarksheetTemplateProps> = ({ student, school, result }) => {
    const schoolLogo = school.school_image_url || defaultLogo;
    const [qrCodeUrl, setQrCodeUrl] = useState('');

    const { subjects } = result.subjects_marks;
    const totalMarksPossible = subjects.reduce((sum, s) => sum + Number(s.total_marks), 0);
    const totalMarksObtained = subjects.reduce((sum, s) => sum + Number(s.obtained_marks), 0);
    const percentage = totalMarksPossible > 0 ? (totalMarksObtained / totalMarksPossible) * 100 : 0;
    const isPass = subjects.every(s => Number(s.obtained_marks) >= Number(s.pass_marks));
    const getGrade = (p: number) => {
        if (p >= 90) return 'A1'; if (p >= 80) return 'A2'; if (p >= 70) return 'B1';
        if (p >= 60) return 'B2'; if (p >= 50) return 'C1'; if (p >= 40) return 'C2';
        if (p >= 33) return 'D'; return 'E';
    };

    useEffect(() => {
        const generateQrCode = async () => {
            const data = { name: student.name, exam: result.exam_name, result: isPass ? 'Pass' : 'Fail' };
            try {
                setQrCodeUrl(await QRCode.toDataURL(JSON.stringify(data), { width: 100, margin: 1 }));
            } catch (err) { console.error(err); }
        };
        generateQrCode();
    }, [student.name, result.exam_name, isPass]);

    return (
        <div style={styles.page}>
            <div style={{...styles.watermark, backgroundImage: `url(${schoolLogo})`}}></div>
            <div style={styles.header}>
                <img src={schoolLogo} alt="School Logo" style={styles.logo} crossOrigin="anonymous"/>
                <div style={styles.schoolInfo}>
                    <h1 style={styles.schoolName}>{school.school_name}</h1>
                    <p style={styles.schoolAddress}>{school.address}</p>
                </div>
            </div>
            <h2 style={styles.title}>STATEMENT OF MARKS</h2>
            
            <table style={styles.infoTable}>
                <tbody>
                    <tr>
                        <td><strong>Student Name:</strong> {student.name}</td>
                        <td><strong>Class:</strong> {student.class}</td>
                    </tr>
                    <tr>
                        <td><strong>Roll Number:</strong> {student.roll_number}</td>
                        <td><strong>Exam:</strong> {result.exam_name}</td>
                    </tr>
                </tbody>
            </table>

            <table style={styles.marksTable}>
                <thead>
                    <tr>
                        <th style={styles.th}>Subject</th>
                        <th style={styles.th}>Max Marks</th>
                        <th style={styles.th}>Pass Marks</th>
                        <th style={styles.th}>Marks Obtained</th>
                        <th style={styles.th}>Grade</th>
                    </tr>
                </thead>
                <tbody>
                    {subjects.map(s => (
                        <tr key={s.subject_name}>
                            <td style={styles.td}>{s.subject_name}</td>
                            <td style={styles.tdCenter}>{s.total_marks}</td>
                            <td style={styles.tdCenter}>{s.pass_marks}</td>
                            <td style={styles.tdCenter}>{s.obtained_marks}</td>
                            <td style={styles.tdCenter}>{getGrade((Number(s.obtained_marks)/Number(s.total_marks)) * 100)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div style={styles.summaryContainer}>
                <div style={styles.gradingScale}>
                    <h4 style={styles.summaryTitle}>Grading Scale</h4>
                    <p>A1: 90-100 | A2: 80-89 | B1: 70-79 | B2: 60-69 | C1: 50-59 | C2: 40-49 | D: 33-39 | E: &lt;33</p>
                </div>
                <div style={styles.results}>
                    <p><strong>Total:</strong> {totalMarksObtained} / {totalMarksPossible}</p>
                    <p><strong>Percentage:</strong> {percentage.toFixed(2)}%</p>
                    <p><strong>Result:</strong> <span style={{color: isPass ? 'green' : 'red'}}>{isPass ? 'PASS' : 'FAIL'}</span></p>
                </div>
            </div>

            <div style={styles.footer}>
                {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" style={styles.qrCode} />}
                <p style={styles.signature}>Controller of Examinations</p>
                <p style={styles.signature}>Principal</p>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    page: { fontFamily: 'Arial, sans-serif', width: '210mm', height: '297mm', padding: '12mm', boxSizing: 'border-box', border: '1px solid #ddd', backgroundColor: '#fff', position: 'relative' },
    watermark: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.05, width: '150mm', height: '150mm', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', backgroundSize: 'contain', zIndex: 0 },
    header: { display: 'flex', alignItems: 'center', borderBottom: '3px solid #101c4d', paddingBottom: '10px', zIndex: 1 },
    logo: { width: '70px', height: '70px', objectFit: 'contain', marginRight: '20px' },
    schoolInfo: { flexGrow: 1, overflow: 'hidden' },
    schoolName: { fontSize: '22pt', fontWeight: 'bold', margin: 0, color: '#101c4d' },
    schoolAddress: { fontSize: '10pt', margin: '5px 0 0 0', color: '#555' },
    title: { textAlign: 'center', margin: '20px 0', color: '#101c4d', fontSize: '16pt', fontWeight: 'bold', zIndex: 1 },
    infoTable: { width: '100%', fontSize: '11pt', marginBottom: '20px', zIndex: 1 },
    marksTable: { width: '100%', borderCollapse: 'collapse', fontSize: '11pt', zIndex: 1, border: '1px solid #ccc' },
    th: { backgroundColor: '#101c4d', color: 'white', padding: '10px', fontWeight: 'bold', border: '1px solid #ccc' },
    td: { padding: '10px', border: '1px solid #ccc' },
    tdCenter: { padding: '10px', border: '1px solid #ccc', textAlign: 'center' },
    summaryContainer: { display: 'flex', justifyContent: 'space-between', marginTop: '20px', fontSize: '10pt', zIndex: 1 },
    gradingScale: { border: '1px solid #ccc', padding: '10px', width: '60%' },
    summaryTitle: { margin: '0 0 5px 0', fontWeight: 'bold' },
    results: { border: '1px solid #ccc', padding: '10px', width: '35%', fontWeight: 'bold' },
    footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #ccc', zIndex: 1 },
    qrCode: { width: '70px', height: '70px' },
    signature: { borderTop: '1px solid #555', paddingTop: '5px', width: '50mm', textAlign: 'center' },
};