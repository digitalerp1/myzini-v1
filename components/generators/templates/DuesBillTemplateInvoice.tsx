
import React from 'react';
import { Student, OwnerProfile } from '../../../types';

interface DuesBillTemplateProps {
    student: Student;
    school: OwnerProfile;
    classFee: number;
    selectedMonthIndex: number;
}

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const monthKeys = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

const parsePaidAmount = (status: string | undefined | null): number => {
    if (!status || status === 'undefined' || status === 'Dues') return 0;
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(status)) return Infinity;
    return status.split(';').reduce((total, p) => {
        const parts = p.split('=d=');
        return total + (parts.length === 2 ? parseFloat(parts[0]) || 0 : 0);
    }, 0);
};

export const DuesBillTemplateInvoice: React.FC<DuesBillTemplateProps> = ({ student, school, classFee, selectedMonthIndex }) => {
    let total = 0;
    const rows = [];

    for (let i = 0; i <= selectedMonthIndex; i++) {
        const key = monthKeys[i] as keyof Student;
        const status = student[key];
        
        let paidAmount = parsePaidAmount(String(status));
        if (paidAmount === Infinity) paidAmount = classFee;

        if (paidAmount < classFee) {
            const dueAmount = classFee - paidAmount;
            if (status === 'Dues' || !status || status === 'undefined' || dueAmount > 0) {
                total += dueAmount;
                const desc = dueAmount < classFee ? `${monthNames[i]} Balance Fee` : `${monthNames[i]} Tuition Fee`;
                rows.push(
                    <tr key={key} style={styles.tr}>
                        <td style={styles.td}>{desc}</td>
                        <td style={styles.tdRight}>1</td>
                        <td style={styles.tdRight}>₹{dueAmount}</td>
                        <td style={styles.tdRight}>₹{dueAmount}</td>
                    </tr>
                );
            }
        }
    }

    if (student.previous_dues && student.previous_dues > 0) {
        total += student.previous_dues;
        rows.push(
            <tr key="prev" style={styles.tr}>
                <td style={styles.td}>Previous Dues Arrears</td>
                <td style={styles.tdRight}>1</td>
                <td style={styles.tdRight}>₹{student.previous_dues}</td>
                <td style={styles.tdRight}>₹{student.previous_dues}</td>
            </tr>
        );
    }

    return (
        <div style={styles.page}>
            <div style={styles.header}>
                <div style={styles.logoSection}>
                    <h1 style={styles.logoText}>INVOICE</h1>
                    <p style={styles.invNum}>#INV-{student.roll_number}-{new Date().getMonth() + 1}</p>
                </div>
                <div style={styles.schoolDetails}>
                    <h2 style={styles.schoolName}>{school.school_name}</h2>
                    <p>{school.address}</p>
                    <p>Phone: {school.mobile_number}</p>
                </div>
            </div>

            <div style={styles.billTo}>
                <p style={styles.label}>Bill To:</p>
                <h3 style={styles.studentName}>{student.name}</h3>
                <div style={styles.row}>
                    <p>Class: {student.class} | Roll: {student.roll_number}</p>
                    <p>Father: {student.father_name}</p>
                </div>
            </div>

            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>Description</th>
                        <th style={styles.thRight}>Qty</th>
                        <th style={styles.thRight}>Price</th>
                        <th style={styles.thRight}>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.length > 0 ? rows : <tr><td colSpan={4} style={{...styles.td, textAlign:'center'}}>No dues pending.</td></tr>}
                </tbody>
            </table>

            <div style={styles.footer}>
                <div style={styles.totalSection}>
                    <p style={styles.totalLabel}>Total Amount Due</p>
                    <p style={styles.totalValue}>₹{total.toLocaleString()}</p>
                </div>
                <p style={styles.note}>Please pay within 7 days. Thank you for your business.</p>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    page: { width: '100%', height: '100%', padding: '8mm', boxSizing: 'border-box', backgroundColor: '#fff', fontFamily: 'Helvetica, Arial, sans-serif', display: 'flex', flexDirection: 'column', border: '1px solid #ddd' },
    header: { display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #333', paddingBottom: '5mm', marginBottom: '5mm' },
    logoText: { fontSize: '24pt', fontWeight: 'bold', color: '#333', margin: 0 },
    invNum: { fontSize: '10pt', color: '#666' },
    schoolDetails: { textAlign: 'right', fontSize: '9pt', color: '#555' },
    schoolName: { fontSize: '14pt', fontWeight: 'bold', color: '#000', margin: '0 0 2px 0' },
    billTo: { marginBottom: '5mm', fontSize: '10pt' },
    label: { fontSize: '9pt', color: '#888', textTransform: 'uppercase', marginBottom: '1mm' },
    studentName: { fontSize: '14pt', fontWeight: 'bold', margin: '0 0 1mm 0' },
    row: { display: 'flex', gap: '20px', color: '#333' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '10pt', marginBottom: 'auto' },
    th: { textAlign: 'left', padding: '3mm', borderBottom: '1px solid #333', fontWeight: 'bold' },
    thRight: { textAlign: 'right', padding: '3mm', borderBottom: '1px solid #333', fontWeight: 'bold' },
    tr: { borderBottom: '1px solid #eee' },
    td: { padding: '3mm' },
    tdRight: { padding: '3mm', textAlign: 'right' },
    footer: { marginTop: '5mm' },
    totalSection: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9f9f9', padding: '4mm', borderRadius: '4px' },
    totalLabel: { fontSize: '12pt', fontWeight: 'bold' },
    totalValue: { fontSize: '16pt', fontWeight: 'bold', color: '#333' },
    note: { fontSize: '9pt', color: '#777', marginTop: '3mm', textAlign: 'center' }
};
