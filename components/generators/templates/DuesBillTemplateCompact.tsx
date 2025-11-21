
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

export const DuesBillTemplateCompact: React.FC<DuesBillTemplateProps> = ({ student, school, classFee, selectedMonthIndex }) => {
    
    let totalDues = 0;
    const feeRecords = [];

    // Filter for only months with Dues
    for (let i = 0; i <= selectedMonthIndex; i++) {
        const monthKey = monthKeys[i] as keyof Student;
        const status = student[monthKey];
        
        let paidAmount = parsePaidAmount(String(status));
        if (paidAmount === Infinity) paidAmount = classFee;

        if (paidAmount < classFee) {
            const due = classFee - paidAmount;
            // Treat as due if specifically marked as Dues OR if undefined/null in the past
            if (status === 'Dues' || !status || status === 'undefined' || due > 0) {
                totalDues += due;
                feeRecords.push(
                    <tr key={monthKey}>
                        <td style={styles.tableCell}>{monthDisplayNames[i]}</td>
                        <td style={{...styles.tableCell, textAlign: 'right'}}>₹{due.toLocaleString()}</td>
                    </tr>
                );
            }
        }
    }

    const previousDues = student.previous_dues || 0;
    if (previousDues > 0) {
        totalDues += previousDues;
        feeRecords.push(
            <tr key="prev_dues">
                <td style={styles.tableCell}>Previous Balance</td>
                <td style={{...styles.tableCell, textAlign: 'right'}}>₹{previousDues.toLocaleString()}</td>
            </tr>
        );
    }

    return (
        <div style={styles.bill}>
            <div style={styles.header}>
                <div style={{flex: 1}}>
                    <h1 style={styles.schoolName}>{school.school_name}</h1>
                    <p style={styles.schoolAddress}>{school.address}</p>
                </div>
                <div style={{textAlign: 'right'}}>
                     <h2 style={styles.billTitleText}>Fee Dues Bill</h2>
                     <p style={styles.billDate}>As of: {monthDisplayNames[selectedMonthIndex]}</p>
                </div>
            </div>

            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Bill To:</h3>
                <div style={styles.row}>
                    <p style={styles.detailItem}><strong>{student.name}</strong></p>
                    <p style={styles.detailItem}>Father: {student.father_name}</p>
                </div>
                <div style={styles.row}>
                    <p style={styles.detailItem}>Class: {student.class}</p>
                    <p style={styles.detailItem}>Roll No: {student.roll_number}</p>
                </div>
            </div>
            
            <div style={{...styles.section, flexGrow: 1}}>
                 <h3 style={styles.sectionTitle}>Outstanding Fees:</h3>
                 {feeRecords.length > 0 ? (
                    <table style={styles.feesTable}>
                        <thead style={styles.tableHead}>
                            <tr>
                                <th style={styles.tableHeader}>Description</th>
                                <th style={{...styles.tableHeader, textAlign: 'right'}}>Due Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {feeRecords}
                        </tbody>
                    </table>
                 ) : (
                    <p style={styles.noDuesText}>No outstanding dues found up to {monthDisplayNames[selectedMonthIndex]}.</p>
                 )}
            </div>

            <div style={styles.totalSection}>
                <span>Total Amount Due</span>
                <span>₹{totalDues.toLocaleString()}</span>
            </div>

            <div style={styles.footer}>
                <p>Please pay the outstanding amount at the earliest convenience. Contact the school office for any queries.</p>
                <p><strong>{school.mobile_number}</strong></p>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    bill: {
        fontFamily: '"Helvetica Neue", Arial, sans-serif',
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        padding: '8mm',
        display: 'flex',
        flexDirection: 'column',
        fontSize: '10pt',
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingBottom: '4mm',
        marginBottom: '4mm',
        borderBottom: '2px solid #111827',
    },
    schoolName: { fontSize: '16pt', fontWeight: 600, margin: 0, color: '#111827' },
    schoolAddress: { fontSize: '9pt', margin: '2px 0 0 0', color: '#4b5563' },
    billTitleText: { fontSize: '14pt', fontWeight: 600, margin: 0, color: '#111827' },
    billDate: { fontSize: '9pt', margin: '2px 0 0 0', color: '#4b5563' },
    section: { marginBottom: '4mm' },
    sectionTitle: {
        fontSize: '9pt',
        fontWeight: 600,
        textTransform: 'uppercase',
        color: '#6b7280',
        borderBottom: '1px solid #e5e7eb',
        paddingBottom: '1mm',
        marginBottom: '2mm',
    },
    row: { display: 'flex', justifyContent: 'space-between', marginBottom: '1mm' },
    detailItem: { margin: 0, padding: '1px 0', fontSize: '10pt', color: '#374151' },
    feesTable: { width: '100%', borderCollapse: 'collapse' },
    tableHead: {},
    tableHeader: {
        padding: '2mm',
        borderBottom: '1px solid #6b7280',
        textAlign: 'left',
        fontSize: '9pt',
        fontWeight: 600,
    },
    tableCell: { padding: '2mm', borderBottom: '1px dotted #d1d5db', fontSize: '10pt' },
    noDuesText: {
        fontSize: '10pt',
        color: '#166534',
        backgroundColor: '#f0fdf4',
        padding: '4mm',
        borderRadius: '4px',
        textAlign: 'center',
    },
    totalSection: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '14pt',
        fontWeight: 'bold',
        padding: '4mm',
        marginTop: 'auto',
        backgroundColor: '#e5e7eb',
        color: '#111827',
        borderRadius: '4px',
    },
    footer: {
        fontSize: '8pt',
        color: '#6b7280',
        textAlign: 'center',
        paddingTop: '4mm',
        lineHeight: 1.4,
    },
};
