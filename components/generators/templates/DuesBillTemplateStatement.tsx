
import React from 'react';
import { Student, OwnerProfile } from '../../../types';

interface DuesBillTemplateProps {
    student: Student;
    school: OwnerProfile;
    classFee: number;
    selectedMonthIndex: number;
}

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const monthKeys = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

const parsePaidAmount = (status: string | undefined | null): number => {
    if (!status || status === 'undefined' || status === 'Dues') return 0;
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(status)) return Infinity;
    return status.split(';').reduce((total, p) => {
        const parts = p.split('=d=');
        return total + (parts.length === 2 ? parseFloat(parts[0]) || 0 : 0);
    }, 0);
};

export const DuesBillTemplateStatement: React.FC<DuesBillTemplateProps> = ({ student, school, classFee, selectedMonthIndex }) => {
    let balance = student.previous_dues || 0;
    const rows = [];

    if (balance > 0) {
        rows.push(
            <tr key="opening" style={styles.tr}>
                <td style={styles.td}>-</td>
                <td style={styles.td}>Opening Balance</td>
                <td style={styles.tdRight}>{balance}</td>
                <td style={styles.tdRight}>0</td>
                <td style={styles.tdRight}>{balance}</td>
            </tr>
        );
    }

    for (let i = 0; i <= selectedMonthIndex; i++) {
        const key = monthKeys[i] as keyof Student;
        const status = student[key];
        
        const feeDebit = classFee;
        
        let paidCredit = parsePaidAmount(String(status));
        if (paidCredit === Infinity) paidCredit = classFee;
        
        balance = balance + feeDebit - paidCredit;

        rows.push(
            <tr key={key} style={i % 2 === 0 ? styles.trEven : styles.tr}>
                <td style={styles.td}>{monthNames[i]} 01</td>
                <td style={styles.td}>{monthNames[i]} Fee</td>
                <td style={styles.tdRight}>{feeDebit}</td>
                <td style={styles.tdRight}>{paidCredit}</td>
                <td style={styles.tdRight}>{balance}</td>
            </tr>
        );
    }

    return (
        <div style={styles.page}>
            <div style={styles.topBar}>
                <h1 style={styles.headerTitle}>STATEMENT OF ACCOUNT</h1>
            </div>
            <div style={styles.infoSection}>
                <div style={styles.box}>
                    <p style={styles.label}>From</p>
                    <p style={styles.value}>{school.school_name}</p>
                    <p style={styles.subValue}>{school.mobile_number}</p>
                </div>
                <div style={styles.box}>
                    <p style={styles.label}>To Student</p>
                    <p style={styles.value}>{student.name}</p>
                    <p style={styles.subValue}>{student.class} - {student.roll_number}</p>
                </div>
                <div style={styles.box}>
                    <p style={styles.label}>Summary</p>
                    <p style={styles.value}>Due: ₹{balance.toLocaleString()}</p>
                    <p style={styles.subValue}>Date: {new Date().toLocaleDateString()}</p>
                </div>
            </div>

            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>Date</th>
                        <th style={styles.th}>Description</th>
                        <th style={styles.thRight}>Debit (Fee)</th>
                        <th style={styles.thRight}>Credit (Paid)</th>
                        <th style={styles.thRight}>Balance</th>
                    </tr>
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </table>
            
            <div style={styles.footer}>
                <p>Please verify the transactions. If you have any questions, please contact the accounts department.</p>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    page: { width: '100%', height: '100%', padding: '0', boxSizing: 'border-box', backgroundColor: '#fff', fontFamily: '"Courier New", Courier, monospace', display: 'flex', flexDirection: 'column', border: '1px solid #ccc' },
    topBar: { backgroundColor: '#333', color: '#fff', padding: '4mm 6mm' },
    headerTitle: { fontSize: '16pt', margin: 0, fontWeight: 'normal', letterSpacing: '2px' },
    infoSection: { display: 'flex', borderBottom: '1px solid #ccc', padding: '6mm' },
    box: { flex: 1, fontSize: '10pt' },
    label: { color: '#888', marginBottom: '2mm' },
    value: { fontWeight: 'bold', marginBottom: '1mm' },
    subValue: { color: '#555' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '10pt' },
    th: { textAlign: 'left', padding: '3mm 6mm', borderBottom: '1px solid #000', backgroundColor: '#f0f0f0' },
    thRight: { textAlign: 'right', padding: '3mm 6mm', borderBottom: '1px solid #000', backgroundColor: '#f0f0f0' },
    tr: { borderBottom: '1px solid #eee' },
    trEven: { borderBottom: '1px solid #eee', backgroundColor: '#fafafa' },
    td: { padding: '3mm 6mm' },
    tdRight: { padding: '3mm 6mm', textAlign: 'right' },
    footer: { marginTop: 'auto', padding: '6mm', fontSize: '9pt', color: '#666', textAlign: 'center' }
};
