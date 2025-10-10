import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Student, OwnerProfile, ExamResult } from '../../../types';

interface MarksheetTemplateProps {
    student: Student;
    school: OwnerProfile;
    result: ExamResult;
}

const defaultLogo = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzRmNDZlNSI+PHBhdGggZD0iTTEyIDE1bC04LTUgOC01IDggNSA0LTIuNS0xMi03LjUtMTIgNy41djEwbDEyIDcuNSA0LTIuNWwtNC0yLjV6Ii8+PC9zdmc+";

export const MarksheetTemplateModern: React.FC<MarksheetTemplateProps> = ({ student, school, result }) => {
    const schoolLogo = school.school_image_url || defaultLogo;
    const studentPhoto = student.photo_url || `https://ui-avatars.com/api/?name=${student.name}&background=e8e8e8&color=555&size=128&bold=true`;
    const [qrCodeUrl, setQrCodeUrl] = useState('');

    const { subjects } = result.subjects_marks;
    const totalMarksPossible = subjects.reduce((sum, s) => sum + Number(s.total_marks), 0);
    const totalMarksObtained = subjects.reduce((sum, s) => sum + Number(s.obtained_marks), 0);
    const percentage = totalMarksPossible > 0 ? (totalMarksObtained / totalMarksPossible) * 100 : 0;
    const isPass = subjects.every(s => Number(s.obtained_marks) >= Number(s.pass_marks));

    useEffect(() => {
        const generateQrCode = async () => {
            const dataToEncode = { name: student.name, exam: result.exam_name, percentage: percentage.toFixed(2), result: isPass ? 'Pass' : 'Fail' };
            try {
                const url = await QRCode.toDataURL(JSON.stringify(dataToEncode), { width: 100, margin: 1 });
                setQrCodeUrl(url);
            } catch (err) { console.error(err); }
        };
        generateQrCode();
    }, [student.name, result.exam_name, percentage, isPass]);

    return (
        <div style={styles.page}>
            <div style={styles.sidebar}>
                <img src={schoolLogo} alt="School Logo" style={styles.logo} crossOrigin="anonymous"/>
                <h1 style={styles.schoolName}>{school.school_name}</h1>
                <p style={styles.schoolAddress}>{school.address}</p>
                <div style={styles.separator}></div>
                <img src={studentPhoto} alt="Student" style={styles.studentPhoto} crossOrigin="anonymous"/>
                <h2 style={styles.studentName}>{student.name}</h2>
                <p style={styles.studentDetail}>Class: {student.class}</p>
                <p style={styles.studentDetail}>Roll No: {student.roll_number}</p>
                <p style={styles.studentDetail}>Father: {student.father_name}</p>
                {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" style={styles.qrCode} />}
            </div>
            <div style={styles.mainContent}>
                <div style={styles.mainHeader}>
                    <h1>Report Card</h1>
                    <h2>{result.exam_name}</h2>
                </div>
                
                <table style={styles.marksTable}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Subject</th>
                            <th style={styles.th}>Total</th>
                            <th style={styles.th}>Obtained</th>
                            <th style={styles.th}>Grade</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subjects.map(s => {
                            const subjectPercentage = (Number(s.obtained_marks) / Number(s.total_marks)) * 100;
                            const getGrade = (p: number) => {
                                if (p >= 90) return 'A+'; if (p >= 80) return 'A'; if (p >= 70) return 'B+';
                                if (p >= 60) return 'B'; if (p >= 50) return 'C'; if (p >= 33) return 'D'; return 'F';
                            };
                            return(
                                <tr key={s.subject_name}>
                                    <td style={styles.td}>{s.subject_name}</td>
                                    <td style={styles.tdCenter}>{s.total_marks}</td>
                                    <td style={styles.tdCenter}>{s.obtained_marks}</td>
                                    <td style={styles.tdCenter}>{getGrade(subjectPercentage)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                
                <div style={styles.summaryGrid}>
                    <div style={styles.summaryBox}>
                        <p style={styles.summaryLabel}>Total Marks</p>
                        <p style={styles.summaryValue}>{totalMarksObtained} / {totalMarksPossible}</p>
                    </div>
                     <div style={styles.summaryBox}>
                        <p style={styles.summaryLabel}>Percentage</p>
                        <p style={styles.summaryValue}>{percentage.toFixed(2)}%</p>
                    </div>
                     <div style={{...styles.summaryBox, backgroundColor: isPass ? '#dcfce7' : '#fee2e2'}}>
                        <p style={styles.summaryLabel}>Final Result</p>
                        <p style={{...styles.summaryValue, color: isPass ? '#166534' : '#991b1b'}}>{isPass ? 'PASS' : 'FAIL'}</p>
                    </div>
                </div>

                 <div style={styles.footer}>
                    <p><strong>Principal's Signature</strong></p>
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    page: { fontFamily: '"Poppins", "Segoe UI", sans-serif', width: '210mm', height: '297mm', display: 'flex', backgroundColor: 'white' },
    sidebar: { width: '65mm', backgroundColor: '#111827', color: 'white', padding: '20px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' },
    mainContent: { flex: 1, padding: '25px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' },
    logo: { width: '60px', height: '60px', objectFit: 'contain', marginBottom: '10px' },
    schoolName: { fontSize: '14pt', fontWeight: 600, margin: 0, lineHeight: 1.2 },
    schoolAddress: { fontSize: '8pt', opacity: 0.7, margin: '5px 0 0 0' },
    separator: { width: '50%', height: '2px', backgroundColor: '#4f46e5', margin: '20px 0' },
    studentPhoto: { width: '100px', height: '100px', objectFit: 'cover', borderRadius: '50%', border: '4px solid #4f46e5' },
    studentName: { fontSize: '16pt', fontWeight: 600, margin: '15px 0 5px 0' },
    studentDetail: { fontSize: '10pt', margin: '2px 0', opacity: 0.8 },
    qrCode: { width: '80px', height: '80px', marginTop: 'auto', backgroundColor: 'white', padding: '5px' },
    mainHeader: { textAlign: 'center', marginBottom: '30px' },
    marksTable: { width: '100%', borderCollapse: 'collapse', fontSize: '11pt' },
    th: { padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb', color: '#6b7280', textTransform: 'uppercase', fontSize: '9pt' },
    td: { padding: '12px', borderBottom: '1px solid #f3f4f6' },
    tdCenter: { padding: '12px', borderBottom: '1px solid #f3f4f6', textAlign: 'center' },
    summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '30px' },
    summaryBox: { backgroundColor: '#f3f4f6', padding: '15px', borderRadius: '8px', textAlign: 'center' },
    summaryLabel: { fontSize: '9pt', color: '#6b7280', margin: 0 },
    summaryValue: { fontSize: '16pt', fontWeight: 600, color: '#1f2937', margin: '5px 0 0 0' },
    footer: { marginTop: 'auto', paddingTop: '30px', borderTop: '1px solid #e5e7eb', textAlign: 'right', fontSize: '10pt' },
};