import React from 'react';
import { Student, OwnerProfile } from '../../../types';

interface DuesBillTemplateProps {
    student: Student;
    school: OwnerProfile;
    classFee: number;
    selectedMonthIndex: number;
}

const monthDisplayNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const monthKeys = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

export const DuesBillTemplateSimple: React.FC<DuesBillTemplateProps> = ({ student, school, classFee, selectedMonthIndex }) => {
    
    let totalDues = 0;
    const dueMonths = [];

    for (let i = 0; i <= selectedMonthIndex; i++) {
        const monthKey = monthKeys[i] as keyof Student;
        const status = student[monthKey];
        if (status === 'Dues' || status === 'undefined' || !status) {
            totalDues += classFee;
            dueMonths.push(monthDisplayNames[i]);
        }
    }

    return (
        <div style={styles.bill}>
            <div style={styles.header}>
                <h1 style={styles.schoolName}>{school.school_name}</h1>
                <p style={styles.schoolAddress}>{school.address}</p>
            </div>
            
            <h2 style={styles.title}>FEE REMINDER</h2>

            <div style={styles.section}>
                <p style={styles.detailItem}><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                <p style={styles.detailItem}><strong>Student Name:</strong> {student.name}</p>
                <p style={styles.detailItem}><strong>Class:</strong> {student.class}</p>
                <p style={styles.detailItem}><strong>Roll No:</strong> {student.roll_number}</p>
            </div>
            
            <div style={styles.section}>
                 <p style={styles.bodyText}>
                    This is a reminder regarding the outstanding school fees. As per our records, the following fees are due:
                </p>
            </div>

            <div style={styles.duesList}>
                {dueMonths.length > 0 ? (
                    <ul>
                        {dueMonths.map(month => <li key={month}>{month}</li>)}
                    </ul>
                ) : (
                    <p style={{textAlign: 'center', fontWeight: 'bold'}}>No dues pending.</p>
                )}
            </div>

            <div style={styles.totalSection}>
                <p>TOTAL AMOUNT DUE: <strong>₹{totalDues.toLocaleString()}</strong></p>
            </div>
            
            <div style={styles.footer}>
                <p>Please clear the dues at your earliest. Thank you.</p>
                <p>Office Contact: {school.mobile_number}</p>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    bill: {
        fontFamily: 'monospace',
        width: '105mm',
        height: '148.5mm',
        boxSizing: 'border-box',
        padding: '5mm',
        display: 'flex',
        flexDirection: 'column',
        fontSize: '10pt',
        backgroundColor: 'white',
        color: '#000',
        border: '1px solid #000',
    },
    header: {
        textAlign: 'center',
        paddingBottom: '3mm',
        borderBottom: '1px solid #000',
        overflow: 'hidden',
    },
    schoolName: { fontSize: '14pt', fontWeight: 'bold', margin: 0, textTransform: 'uppercase' },
    schoolAddress: { fontSize: '8pt', margin: '1mm 0 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    title: {
        textAlign: 'center',
        margin: '4mm 0',
        fontSize: '12pt',
        fontWeight: 'bold',
        textDecoration: 'underline',
    },
    section: {
        marginBottom: '3mm',
    },
    detailItem: { margin: '0.5mm 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    bodyText: {
        margin: '0',
        fontSize: '9pt',
        lineHeight: 1.4,
    },
    duesList: {
        border: '1px solid #000',
        padding: '2mm',
        minHeight: '30mm',
        fontSize: '10pt'
    },
    totalSection: {
        border: '1px solid #000',
        borderTop: 'none',
        padding: '3mm',
        textAlign: 'center',
        fontSize: '11pt',
    },
    footer: {
        marginTop: 'auto',
        textAlign: 'center',
        fontSize: '8pt',
        borderTop: '1px solid #000',
        paddingTop: '2mm',
    },
};