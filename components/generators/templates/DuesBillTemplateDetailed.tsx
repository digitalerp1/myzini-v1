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

export const DuesBillTemplateDetailed: React.FC<DuesBillTemplateProps> = ({ student, school, classFee, selectedMonthIndex }) => {
    
    const feeRecords = [];
    let runningBalance = 0;

    for (let i = 0; i < 12; i++) {
        const monthKey = monthKeys[i] as keyof Student;
        const status = student[monthKey];
        let charge = classFee;
        let payment = 0;
        let remarks = '';

        if (status === 'Dues') {
            payment = 0;
            remarks = 'DUE';
        } else if (status && status !== 'undefined') {
            payment = classFee;
            remarks = 'Paid';
        } else {
            charge = 0; // No charge for future/pending months in this view
            remarks = 'Pending';
        }

        if (i <= selectedMonthIndex) {
            if (status === 'undefined' || !status) { // If month is pending but within billing period, it's a due
                charge = classFee;
                remarks = 'DUE';
            }
             runningBalance += (charge - payment);
        } else {
             charge = 0;
             remarks = '';
        }

        feeRecords.push(
            <tr key={monthKey} style={i > selectedMonthIndex ? styles.futureRow : {}}>
                <td style={styles.tableCell}>{i + 1}</td>
                <td style={styles.tableCell}>{monthDisplayNames[i]}</td>
                <td style={{...styles.tableCell, textAlign: 'right'}}>₹{charge > 0 ? charge.toLocaleString() : '-'}</td>
                <td style={{...styles.tableCell, textAlign: 'right', color: '#16a34a'}}>₹{payment > 0 ? payment.toLocaleString() : '-'}</td>
                <td style={{...styles.tableCell, textAlign: 'right', fontWeight: 600}}>₹{i <= selectedMonthIndex ? runningBalance.toLocaleString() : '-'}</td>
                <td style={{...styles.tableCell, textAlign: 'center'}}>{remarks}</td>
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
        width: '105mm',
        height: '148.5mm',
        boxSizing: 'border-box',
        padding: '5mm',
        display: 'flex',
        flexDirection: 'column',
        fontSize: '8.5pt',
        backgroundColor: 'white',
        border: '0.5px solid #e5e7eb',
    },
    header: { display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #9ca3af', paddingBottom: '2mm' },
    schoolInfo: { flexGrow: 1, overflow: 'hidden' },
    schoolName: { fontSize: '12pt', fontWeight: 600, margin: 0, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    schoolAddress: { fontSize: '8pt', margin: '2px 0 0 0', color: '#4b5563', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    billTitle: { textAlign: 'right', flexShrink: 0 },
    billTitleText: { fontSize: '10pt', fontWeight: 600, margin: 0, color: '#374151' },
    billDate: { fontSize: '8pt', margin: '2px 0 0 0', color: '#6b7280' },
    studentSection: { padding: '2mm 0', display: 'flex', justifyContent: 'space-between', fontSize: '8pt' },
    feesTableContainer: { flexGrow: 1, border: '1px solid #d1d5db', borderRadius: '4px', overflow: 'hidden' },
    feesTable: { width: '100%', borderCollapse: 'collapse' },
    tableHead: { backgroundColor: '#f9fafb', fontSize: '8pt' },
    tableHeader: { padding: '4px', borderBottom: '1px solid #d1d5db', textAlign: 'left', fontWeight: 600, color: '#374151' },
    tableCell: { padding: '4px', borderBottom: '1px solid #e5e7eb', fontSize: '8pt' },
    futureRow: { color: '#9ca3af', backgroundColor: '#f9fafb' },
    footer: { marginTop: 'auto', paddingTop: '3mm' },
    summary: { display: 'flex', justifyContent: 'space-between', padding: '3mm', backgroundColor: '#374151', color: 'white', borderRadius: '4px' },
    totalDue: { fontSize: '11pt', fontWeight: 'bold' },
    note: { fontSize: '7pt', textAlign: 'center', color: '#6b7280', marginTop: '2mm' },
};