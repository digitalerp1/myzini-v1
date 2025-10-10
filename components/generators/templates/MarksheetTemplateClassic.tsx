import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Student, OwnerProfile, ExamResult, SubjectMarks } from '../../../types';

interface MarksheetTemplateProps {
    student: Student;
    school: OwnerProfile;
    result: ExamResult;
}

const defaultLogo = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzE4MjI1MyI+PHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgMThjLTQuNDEgMC04LTMuNTktOC04czMuNTktOCA4LTggOCAzLjU5IDggOC0zLjU5IDgtOCA4em0tMS0xNGgydjZoLTJWM2gxdi0yaC0ydi0xaDJ2LTFoLTJ2LTFoMnYtMWgtMnYtMWgydi0xaC0ydjJoLTF2LTJoLTF2Mkg5djJoMXYtMmgydjJoMXYtMmgxdi0yaDF2MmgxVjZIMTB2MWgxdjFoMVY4aDF2MWgtMVY5aC0xdjFoMVY5aDF2MWgtMVY5aC0xdjFoMVY5aDF2MWgtMVY5aC0xdjFoMVY5aDF2MWgtMVY5aC0xdjFoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVYY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aCg==</path></svg>";

export const MarksheetTemplateClassic: React.FC<MarksheetTemplateProps> = ({ student, school, result }) => {
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
            const dataToEncode = {
                Student: student.name, Roll: student.roll_number, Class: student.class,
                Exam: result.exam_name, Percentage: `${percentage.toFixed(2)}%`, Result: isPass ? 'Pass' : 'Fail'
            };
            try {
                const url = await QRCode.toDataURL(JSON.stringify(dataToEncode), { width: 100, margin: 1 });
                setQrCodeUrl(url);
            } catch (err) { console.error(err); }
        };
        generateQrCode();
    }, [student, result, percentage, isPass]);

    return (
        <div style={styles.page}>
            <div style={styles.header}>
                <img src={schoolLogo} alt="School Logo" style={styles.logo} crossOrigin="anonymous"/>
                <div style={styles.schoolInfo}>
                    <h1 style={styles.schoolName}>{school.school_name}</h1>
                    <p style={styles.schoolAddress}>{school.address}</p>
                </div>
                <img src={studentPhoto} alt="Student" style={styles.studentPhoto} crossOrigin="anonymous"/>
            </div>
            
            <div style={styles.title}>
                <h2>ACADEMIC REPORT CARD</h2>
                <h3>{result.exam_name}</h3>
            </div>

            <table style={styles.studentInfoTable}>
                <tbody>
                    <tr>
                        <td style={styles.infoLabel}>Student's Name:</td>
                        <td style={styles.infoValue}>{student.name}</td>
                        <td style={styles.infoLabel}>Class:</td>
                        <td style={styles.infoValue}>{student.class}</td>
                    </tr>
                    <tr>
                        <td style={styles.infoLabel}>Father's Name:</td>
                        <td style={styles.infoValue}>{student.father_name}</td>
                        <td style={styles.infoLabel}>Roll No:</td>
                        <td style={styles.infoValue}>{student.roll_number}</td>
                    </tr>
                </tbody>
            </table>

            <table style={styles.marksTable}>
                <thead>
                    <tr style={styles.marksHeader}>
                        <th>SUBJECT</th>
                        <th>TOTAL MARKS</th>
                        <th>PASS MARKS</th>
                        <th>OBTAINED MARKS</th>
                    </tr>
                </thead>
                <tbody>
                    {subjects.map(s => (
                        <tr key={s.subject_name}>
                            <td style={styles.marksCell}>{s.subject_name}</td>
                            <td style={styles.marksCellCenter}>{s.total_marks}</td>
                            <td style={styles.marksCellCenter}>{s.pass_marks}</td>
                            <td style={styles.marksCellCenter}>{s.obtained_marks}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot style={styles.marksFooter}>
                    <tr>
                        <td>TOTAL</td>
                        <td style={styles.marksCellCenter}>{totalMarksPossible}</td>
                        <td></td>
                        <td style={styles.marksCellCenter}>{totalMarksObtained}</td>
                    </tr>
                </tfoot>
            </table>
            
            <div style={styles.summary}>
                <div style={styles.summaryBox}>
                    <p>Percentage: <strong>{percentage.toFixed(2)}%</strong></p>
                    <p>Result: <strong style={{color: isPass ? '#166534' : '#991B1B'}}>{isPass ? 'PASS' : 'FAIL'}</strong></p>
                </div>
                {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" style={styles.qrCode} />}
            </div>

            <div style={styles.footer}>
                <div>
                    <p style={styles.signatureLine}></p>
                    <p>Class Teacher's Signature</p>
                </div>
                <div>
                    <p style={styles.signatureLine}></p>
                    <p>Principal's Signature</p>
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    page: { fontFamily: '"Times New Roman", Times, serif', width: '210mm', height: '297mm', padding: '15mm', boxSizing: 'border-box', border: '1px solid black', display: 'flex', flexDirection: 'column' },
    header: { display: 'flex', alignItems: 'center', borderBottom: '2px solid black', paddingBottom: '10px' },
    logo: { width: '80px', height: '80px', objectFit: 'contain' },
    schoolInfo: { textAlign: 'center', flexGrow: 1, overflow: 'hidden' },
    schoolName: { fontSize: '24pt', fontWeight: 'bold', margin: 0, color: '#182253' },
    schoolAddress: { fontSize: '10pt', margin: '5px 0 0 0' },
    studentPhoto: { width: '80px', height: '100px', objectFit: 'cover', border: '2px solid #ccc' },
    title: { textAlign: 'center', margin: '15px 0' },
    studentInfoTable: { width: '100%', fontSize: '11pt', borderCollapse: 'collapse', marginBottom: '20px' },
    infoLabel: { fontWeight: 'bold', padding: '4px' },
    infoValue: { padding: '4px', borderBottom: '1px dotted #999',  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    marksTable: { width: '100%', borderCollapse: 'collapse', fontSize: '11pt', border: '1px solid black' },
    marksHeader: { backgroundColor: '#e0e0e0', fontWeight: 'bold' },
    marksFooter: { backgroundColor: '#e0e0e0', fontWeight: 'bold' },
    marksCell: { border: '1px solid black', padding: '8px' },
    marksCellCenter: { border: '1px solid black', padding: '8px', textAlign: 'center' },
    summary: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' },
    summaryBox: { border: '1px solid black', padding: '10px', fontSize: '12pt' },
    qrCode: { width: '80px', height: '80px' },
    footer: { display: 'flex', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '20px', fontSize: '11pt' },
    signatureLine: { borderBottom: '1px solid black', paddingBottom: '30px', marginBottom: '5px' },
};