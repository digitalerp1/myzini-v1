
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

const parsePaidAmount = (status: string | undefined | null): number => {
    if (!status || status === 'undefined' || status === 'Dues') return 0;
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(status)) return Infinity;
    return status.split(';').reduce((total, p) => {
        const parts = p.split('=d=');
        return total + (parts.length === 2 ? parseFloat(parts[0]) || 0 : 0);
    }, 0);
};

export const DuesBillTemplateSimple: React.FC<DuesBillTemplateProps> = ({ student, school, classFee, selectedMonthIndex }) => {
    
    let totalDues = 0;
    const dueItems = [];

    // Check monthly dues
    for (let i = 0; i <= selectedMonthIndex; i++) {
        const monthKey = monthKeys[i] as keyof Student;
        const status = student[monthKey];
        let paidAmount = parsePaidAmount(String(status));
        if (paidAmount === Infinity) paidAmount = classFee;

        if (paidAmount < classFee) {
            const due = classFee - paidAmount;
            // Consider due if explicit Dues, or undefined/blank in past, or partial
            if (status === 'Dues' || !status || status === 'undefined' || due > 0) {
                totalDues += due;
                dueItems.push(`${monthDisplayNames[i]} (₹${due})`);
            }
        }
    }

    // Check previous dues
    if (student.previous_dues && student.previous_dues > 0) {
        totalDues += student.previous_dues;
        dueItems.push(`Previous Balance (₹${student.previous_dues})`);
    }

    return (
        <div style={styles.bill}>
            <div style={styles.header}>
                <h1 style={styles.schoolName}>{school.school_name}</h1>
                <p style={styles.schoolAddress}>{school.address}</p>
            </div>
            
            <h2 style={styles.title}>FEE REMINDER</h2>

            <div style={styles.section}>
                <div style={styles.row}>
                    <p style={styles.detailItem}><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                    <p style={styles.detailItem}><strong>Class:</strong> {student.class}</p>
                </div>
                <div style={styles.row}>
                    <p style={styles.detailItem}><strong>Student:</strong> {student.name}</p>
                    <p style={styles.detailItem}><strong>Roll No:</strong> {student.roll_number}</p>
                </div>
            </div>
            
            <div style={styles.section}>
                 <p style={styles.bodyText}>
                    This is a reminder regarding outstanding school fees. As per our records, the following dues are pending:
                </p>
            </div>

            <div style={styles.duesList}>
                {dueItems.length > 0 ? (
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px'}}>
                        {dueItems.map((item, i) => <span key={i}>• {item}</span>)}
                    </div>
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
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        padding: '6mm',
        display: 'flex',
        flexDirection: 'column',
        fontSize: '11pt',
        backgroundColor: 'white',
        color: '#000',
        border: '1px solid #000',
    },
    header: {
        textAlign: 'center',
        paddingBottom: '3mm',
        borderBottom: '1px solid #000',
    },
    schoolName: { fontSize: '16pt', fontWeight: 'bold', margin: 0, textTransform: 'uppercase' },
    schoolAddress: { fontSize: '10pt', margin: '1mm 0 0 0' },
    title: {
        textAlign: 'center',
        margin: '4mm 0',
        fontSize: '14pt',
        fontWeight: 'bold',
        textDecoration: 'underline',
    },
    section: {
        marginBottom: '3mm',
    },
    row: { display: 'flex', justifyContent: 'space-between' },
    detailItem: { margin: '0.5mm 0' },
    bodyText: {
        margin: '0',
        fontSize: '10pt',
        lineHeight: 1.4,
    },
    duesList: {
        border: '1px solid #000',
        padding: '3mm',
        flexGrow: 1,
        fontSize: '11pt',
        overflow: 'hidden'
    },
    totalSection: {
        border: '1px solid #000',
        borderTop: 'none',
        padding: '3mm',
        textAlign: 'center',
        fontSize: '13pt',
    },
    footer: {
        marginTop: 'auto',
        textAlign: 'center',
        fontSize: '9pt',
        borderTop: '1px solid #000',
        paddingTop: '2mm',
    },
};
