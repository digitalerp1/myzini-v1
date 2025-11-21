
import React from 'react';
import { Student, OwnerProfile, ExamResult } from '../../../types';

interface MarksheetTemplateProps {
    student: Student;
    school: OwnerProfile;
    result: ExamResult;
}

export const MarksheetTemplateGrid: React.FC<MarksheetTemplateProps> = ({ student, school, result }) => {
    const { subjects } = result.subjects_marks;
    const totalObtained = subjects.reduce((acc, curr) => acc + Number(curr.obtained_marks), 0);
    const totalMax = subjects.reduce((acc, curr) => acc + Number(curr.total_marks), 0);
    const percentage = ((totalObtained / totalMax) * 100).toFixed(2);

    return (
        <div style={styles.page}>
            <div style={styles.header}>
                <h1 style={styles.schoolName}>{school.school_name}</h1>
                <p style={styles.examTitle}>{result.exam_name}</p>
            </div>
            
            <div style={styles.infoGrid}>
                <div style={styles.infoCell}><strong>Name:</strong> {student.name}</div>
                <div style={styles.infoCell}><strong>Class:</strong> {student.class}</div>
                <div style={styles.infoCell}><strong>Roll No:</strong> {student.roll_number}</div>
                <div style={styles.infoCell}><strong>Session:</strong> {new Date().getFullYear()}</div>
            </div>

            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>Subject</th>
                        <th style={styles.th}>Max Marks</th>
                        <th style={styles.th}>Pass Marks</th>
                        <th style={styles.th}>Theory</th>
                        <th style={styles.th}>Practical</th>
                        <th style={styles.th}>Total</th>
                        <th style={styles.th}>Grade</th>
                    </tr>
                </thead>
                <tbody>
                    {subjects.map((sub, i) => (
                        <tr key={i}>
                            <td style={styles.tdLeft}>{sub.subject_name}</td>
                            <td style={styles.td}>{sub.total_marks}</td>
                            <td style={styles.td}>{sub.pass_marks}</td>
                            <td style={styles.td}>{Number(sub.obtained_marks) > 0 ? sub.obtained_marks : '-'}</td>
                            <td style={styles.td}>-</td>
                            <td style={styles.tdBold}>{sub.obtained_marks}</td>
                            <td style={styles.td}>{Number(sub.obtained_marks) >= Number(sub.pass_marks) ? 'P' : 'F'}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td style={styles.footerTd}>GRAND TOTAL</td>
                        <td style={styles.footerTd}>{totalMax}</td>
                        <td colSpan={3} style={styles.footerTd}></td>
                        <td style={styles.footerTd}>{totalObtained}</td>
                        <td style={styles.footerTd}>{percentage}%</td>
                    </tr>
                </tfoot>
            </table>

            <div style={styles.remarksBox}>
                <p><strong>Result:</strong> {Number(percentage) >= 33 ? 'PASSED' : 'FAILED'}</p>
                <p><strong>Remarks:</strong> {Number(percentage) >= 80 ? 'Excellent Performance!' : 'Good, keep it up.'}</p>
            </div>

            <div style={styles.signatures}>
                <div style={styles.signLine}>Class Teacher</div>
                <div style={styles.signLine}>Principal</div>
                <div style={styles.signLine}>Parent</div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    page: { width: '210mm', height: '297mm', padding: '15mm', boxSizing: 'border-box', backgroundColor: '#fff', fontFamily: 'Arial, sans-serif', border: '2px solid #000' },
    header: { textAlign: 'center', marginBottom: '10mm', borderBottom: '2px solid #000', paddingBottom: '5mm' },
    schoolName: { fontSize: '20pt', fontWeight: 'bold', textTransform: 'uppercase', margin: 0 },
    examTitle: { fontSize: '14pt', margin: '5px 0 0 0' },
    infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', border: '1px solid #000', marginBottom: '5mm' },
    infoCell: { padding: '3mm', border: '1px solid #000', fontSize: '10pt' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '10pt', marginBottom: '5mm' },
    th: { border: '1px solid #000', padding: '3mm', backgroundColor: '#eee', fontWeight: 'bold' },
    td: { border: '1px solid #000', padding: '3mm', textAlign: 'center' },
    tdLeft: { border: '1px solid #000', padding: '3mm', textAlign: 'left' },
    tdBold: { border: '1px solid #000', padding: '3mm', textAlign: 'center', fontWeight: 'bold' },
    footerTd: { border: '1px solid #000', padding: '3mm', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#eee' },
    remarksBox: { border: '1px solid #000', padding: '5mm', marginBottom: '20mm' },
    signatures: { display: 'flex', justifyContent: 'space-between' },
    signLine: { borderTop: '1px solid #000', width: '40mm', textAlign: 'center', paddingTop: '2mm' }
};
