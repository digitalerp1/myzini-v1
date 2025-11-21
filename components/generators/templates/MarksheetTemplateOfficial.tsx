
import React from 'react';
import { Student, OwnerProfile, ExamResult } from '../../../types';

interface MarksheetTemplateProps {
    student: Student;
    school: OwnerProfile;
    result: ExamResult;
}

export const MarksheetTemplateOfficial: React.FC<MarksheetTemplateProps> = ({ student, school, result }) => {
    const { subjects } = result.subjects_marks;
    const totalObtained = subjects.reduce((acc, curr) => acc + Number(curr.obtained_marks), 0);
    const totalMax = subjects.reduce((acc, curr) => acc + Number(curr.total_marks), 0);

    return (
        <div style={styles.page}>
            <div style={styles.topHeader}>
                <div style={styles.emblem}>
                    <div style={styles.circle}></div>
                </div>
                <div style={styles.titles}>
                    <h1 style={styles.mainTitle}>REPORT OF PROGRESS</h1>
                    <h2 style={styles.subTitle}>{school.school_name.toUpperCase()}</h2>
                    <p style={styles.address}>{school.address}</p>
                </div>
            </div>

            <div style={styles.studentDetails}>
                <div style={styles.detailRow}>
                    <span>Name of Student: <strong>{student.name}</strong></span>
                    <span>Roll No: <strong>{student.roll_number}</strong></span>
                </div>
                <div style={styles.detailRow}>
                    <span>Father's Name: <strong>{student.father_name}</strong></span>
                    <span>Class: <strong>{student.class}</strong></span>
                </div>
                <div style={styles.detailRow}>
                    <span>Examination: <strong>{result.exam_name}</strong></span>
                    <span>Date of Birth: <strong>{student.date_of_birth}</strong></span>
                </div>
            </div>

            <table style={styles.table}>
                <thead>
                    <tr>
                        <th rowSpan={2} style={styles.th}>CODE</th>
                        <th rowSpan={2} style={{...styles.th, width: '40%'}}>SUBJECT</th>
                        <th colSpan={2} style={styles.th}>MARKS</th>
                        <th rowSpan={2} style={styles.th}>TOTAL OBTAINED</th>
                        <th rowSpan={2} style={styles.th}>POSITIONAL GRADE</th>
                    </tr>
                    <tr>
                        <th style={styles.th}>MAX</th>
                        <th style={styles.th}>PASS</th>
                    </tr>
                </thead>
                <tbody>
                    {subjects.map((sub, i) => (
                        <tr key={i}>
                            <td style={styles.td}>0{i+1}</td>
                            <td style={{...styles.td, textAlign: 'left'}}>{sub.subject_name.toUpperCase()}</td>
                            <td style={styles.td}>{sub.total_marks}</td>
                            <td style={styles.td}>{sub.pass_marks}</td>
                            <td style={styles.td}>{sub.obtained_marks}</td>
                            <td style={styles.td}>
                                {Number(sub.obtained_marks) >= 0.9*Number(sub.total_marks) ? 'A1' : 
                                 Number(sub.obtained_marks) >= 0.8*Number(sub.total_marks) ? 'A2' : 
                                 Number(sub.obtained_marks) >= 0.7*Number(sub.total_marks) ? 'B1' : 'B2'}
                            </td>
                        </tr>
                    ))}
                    <tr style={{height: '30px'}}>
                        <td colSpan={6}></td>
                    </tr>
                    <tr style={{fontWeight: 'bold'}}>
                        <td colSpan={2} style={{...styles.td, textAlign: 'right'}}>GRAND TOTAL</td>
                        <td style={styles.td}>{totalMax}</td>
                        <td style={styles.td}></td>
                        <td style={styles.td}>{totalObtained}</td>
                        <td style={styles.td}></td>
                    </tr>
                </tbody>
            </table>

            <div style={styles.footer}>
                <p style={styles.disclaimer}>* This is a computer generated document.</p>
                <div style={styles.auth}>
                    <div style={styles.stamp}>SCHOOL STAMP</div>
                    <div style={styles.sign}>PRINCIPAL</div>
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    page: { width: '210mm', height: '297mm', padding: '20mm', boxSizing: 'border-box', backgroundColor: '#fff', fontFamily: '"Times New Roman", serif' },
    topHeader: { textAlign: 'center', marginBottom: '10mm', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    emblem: { marginBottom: '5mm' },
    circle: { width: '20mm', height: '20mm', borderRadius: '50%', border: '2px solid #000' },
    titles: {},
    mainTitle: { fontSize: '16pt', fontWeight: 'bold', margin: 0, letterSpacing: '1px' },
    subTitle: { fontSize: '14pt', fontWeight: 'bold', margin: '2mm 0' },
    address: { fontSize: '10pt', fontStyle: 'italic' },
    studentDetails: { border: '1px solid #000', padding: '5mm', marginBottom: '5mm', fontSize: '11pt' },
    detailRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '2mm' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '10pt', border: '2px solid #000' },
    th: { border: '1px solid #000', padding: '2mm', textAlign: 'center', fontWeight: 'bold' },
    td: { border: '1px solid #000', padding: '2mm', textAlign: 'center' },
    footer: { marginTop: 'auto' },
    disclaimer: { fontSize: '9pt', fontStyle: 'italic' },
    auth: { display: 'flex', justifyContent: 'space-between', marginTop: '20mm' },
    stamp: { width: '30mm', height: '30mm', border: '1px dashed #999', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8pt', color: '#999' },
    sign: { borderTop: '1px solid #000', width: '50mm', textAlign: 'center', paddingTop: '2mm', fontWeight: 'bold' }
};
