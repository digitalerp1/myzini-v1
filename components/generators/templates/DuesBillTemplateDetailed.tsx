
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

export const DuesBillTemplateDetailed: React.FC<DuesBillTemplateProps> = ({ student, school, classFee, selectedMonthIndex }) => {
    
    const feeRecords = [];
    let runningBalance = student.previous_dues || 0;

    // Add opening balance row if applicable
    if (runningBalance > 0) {
        feeRecords.push(
            <tr key="opening" style={styles.tableRow}>
                <td style={styles.tableCell}>-</td>
                <td style={styles.tableCell}>Opening Balance (Prev. Dues)</td>
                <td style={{...styles.tableCell, textAlign: 'right'}}>₹{runningBalance.toLocaleString()}</td>
                <td style={{...styles.tableCell, textAlign: 'right'}}>-</td>
                <td style={{...styles.tableCell, textAlign: 'right', fontWeight: 600}}>₹{runningBalance.toLocaleString()}</td>
                <td style={{...styles.tableCell, textAlign: 'center'}}>DUE</td>
            </tr>
        );
    }

    for (let i = 0; i < 12; i++) {
        const monthKey = monthKeys[i] as keyof Student;
        const status = student[monthKey];
        
        let charge = 0;
        let payment = 0;
        let remarks = '';
        let paidAmount = parsePaidAmount(String(status));
        if (paidAmount === Infinity) paidAmount = classFee;

        if (i <= selectedMonthIndex) {
            charge = classFee;
            payment = paidAmount;
            
            if (paidAmount < classFee) {
                remarks = 'DUE';
            } else {
                remarks = 'PAID';
            }
            runningBalance += (charge - payment);
        } else {
            charge = 0;
            payment = 0;
            remarks = '-';
        }

        feeRecords.push(
            <tr key={monthKey} style={i > selectedMonthIndex ? styles.futureRow : {}}>
                <td style={styles.tableCell}>{i + 1}</td>
                <td style={styles.tableCell}>{monthDisplayNames[i]}</td>
                <td style={{...styles.tableCell, textAlign: 'right'}}>₹{charge > 0 ? charge.toLocaleString() : '-'}</td>
                <td style={{...styles.tableCell, textAlign: 'right', color: '#16a34a'}}>₹{payment > 0 ? payment.toLocaleString() : '-'}</td>
                <td style={{...styles.tableCell, textAlign: 'right', fontWeight: 600}}>₹{i <= selectedMonthIndex ? runningBalance.toLocaleString() : '-'}</td>
                <td style={{...styles.tableCell, textAlign: 'center', fontSize: '9pt'}}>{remarks}</td>
            </tr>
        );
    }

    return (
        <div style={styles.bill}>
            <div style={styles.header}>
                <div style={styles.schoolInfo}>
                    <h1 style={styles.schoolName}>{school.school_name}</h1>
                    <p style={styles.schoolAddress}>{school.address}</p>
                </div>
                <div style={styles.billTitle}>
                    <h2 style={styles.billTitleText}>Student Fee Ledger</h2>
                    <p style={styles.billDate}>As of: {monthDisplayNames[selectedMonthIndex]}</p>
                </div>
            </div>

            <div style={styles.studentSection}>
                <p><strong>Student Name:</strong> {student.name}</p>
                <p><strong>Class:</strong> {student.class}</p>
                <p><strong>Roll No:</strong> {student.roll_number}</p>
            </div>

            <div style={styles.feesTableContainer}>
                <table style={styles.feesTable}>
                    <thead style={styles.tableHead}>
                        <tr>
                            <th style={styles.tableHeader}>#</th>
                            <th style={styles.tableHeader}>Month</th>
                            <th style={{...styles.tableHeader, textAlign: 'right'}}>Charge</th>
                            <th style={{...styles.tableHeader, textAlign: 'right'}}>Payment</th>
                            <th style={{...styles.tableHeader, textAlign: 'right'}}>Balance</th>
                            <th style={{...styles.tableHeader, textAlign: 'center'}}>Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {feeRecords}
                    </tbody>
                </table>
            </div>

            <div style={styles.footer}>
                <div style={styles.summary}>
                    <span>Current Balance Due:</span>
                    <span style={styles.totalDue}>₹{runningBalance.toLocaleString()}</span>
                </div>
                <p style={styles.note}>This is a computer-generated statement and does not require a signature.</p>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    bill: {
        fontFamily: 'system-ui, sans-serif',
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        padding: '6mm',
        display: 'flex',
        flexDirection: 'column',
        fontSize: '10pt',
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
    },
    header: { display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #9ca3af', paddingBottom: '3mm' },
    schoolInfo: { flexGrow: 1, overflow: 'hidden' },
    schoolName: { fontSize: '14pt', fontWeight: 600, margin: 0, color: '#111827' },
    schoolAddress: { fontSize: '9pt', margin: '2px 0 0 0', color: '#4b5563' },
    billTitle: { textAlign: 'right', flexShrink: 0 },
    billTitleText: { fontSize: '12pt', fontWeight: 600, margin: 0, color: '#374151' },
    billDate: { fontSize: '9pt', margin: '2px 0 0 0', color: '#6b7280' },
    studentSection: { padding: '3mm 0', display: 'flex', justifyContent: 'space-between', fontSize: '10pt' },
    feesTableContainer: { flexGrow: 1, border: '1px solid #d1d5db', borderRadius: '4px', overflow: 'hidden' },
    feesTable: { width: '100%', borderCollapse: 'collapse' },
    tableHead: { backgroundColor: '#f9fafb', fontSize: '9pt' },
    tableHeader: { padding: '6px', borderBottom: '1px solid #d1d5db', textAlign: 'left', fontWeight: 600, color: '#374151' },
    tableCell: { padding: '5px 6px', borderBottom: '1px solid #e5e7eb', fontSize: '9.5pt' },
    futureRow: { color: '#9ca3af', backgroundColor: '#f9fafb' },
    footer: { marginTop: 'auto', paddingTop: '3mm' },
    summary: { display: 'flex', justifyContent: 'space-between', padding: '3mm', backgroundColor: '#374151', color: 'white', borderRadius: '4px' },
    totalDue: { fontSize: '12pt', fontWeight: 'bold' },
    note: { fontSize: '8pt', textAlign: 'center', color: '#6b7280', marginTop: '2mm' },
};
