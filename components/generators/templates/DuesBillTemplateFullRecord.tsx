
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
    if (!status || status === 'undefined' || status === 'Dues') {
        return 0;
    }
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
    if (isoDateRegex.test(status)) {
        return Infinity; // Represents a legacy full payment, handled in context
    }
    const payments = status.split(';');
    return payments.reduce((total, payment) => {
        const parts = payment.split('=d=');
        if (parts.length === 2) {
            const amount = parseFloat(parts[0]);
            return total + (isNaN(amount) ? 0 : amount);
        }
        return total;
    }, 0);
};

export const DuesBillTemplateFullRecord: React.FC<DuesBillTemplateProps> = ({ student, school, classFee, selectedMonthIndex }) => {
    const schoolLogo = school.school_image_url || `https://ui-avatars.com/api/?name=${school.school_name}&background=4f46e5&color=fff&size=128`;
    
    let totalPaidYTD = 0;
    let totalDueYTD = 0;
    const rows = [];

    for (let i = 0; i < 12; i++) {
        const monthKey = monthKeys[i] as keyof Student;
        const status = student[monthKey];
        
        let paidAmount = parsePaidAmount(String(status));
        if (paidAmount === Infinity) paidAmount = classFee;

        let dueAmount = 0;
        let statusText = 'Pending';
        let statusColor = '#9ca3af'; // Gray

        if (i <= selectedMonthIndex) {
            // Logic: If parsed amount is 0, and status is 'Dues' OR status is undefined (implied due for past month), then due = classFee
            if (paidAmount === 0 && (status === 'Dues' || !status || status === 'undefined')) {
                dueAmount = classFee;
                statusText = 'DUE';
                statusColor = '#dc2626'; // Red
            } else if (paidAmount < classFee) {
                // Partial payment
                dueAmount = classFee - paidAmount;
                statusText = 'Partial';
                statusColor = '#ea580c'; // Orange
            } else {
                // Fully paid
                statusText = 'Paid';
                statusColor = '#16a34a'; // Green
            }
        } else {
            // Future months
            statusText = '-';
        }

        if (i <= selectedMonthIndex) {
            totalPaidYTD += paidAmount;
            totalDueYTD += dueAmount;
        }

        rows.push(
            <tr key={monthKey} style={i > selectedMonthIndex ? styles.futureRow : styles.tr}>
                <td style={styles.td}>{monthDisplayNames[i]}</td>
                <td style={styles.tdRight}>₹{classFee}</td>
                <td style={styles.tdRight}>₹{paidAmount > 0 ? paidAmount : '-'}</td>
                <td style={{...styles.tdRight, fontWeight: 'bold', color: dueAmount > 0 ? '#dc2626' : 'inherit'}}>
                    {dueAmount > 0 ? `₹${dueAmount}` : '-'}
                </td>
                <td style={{...styles.tdCenter, color: statusColor, fontWeight: 'bold'}}>{statusText}</td>
            </tr>
        );
    }

    const previousDues = student.previous_dues || 0;
    const finalTotalDue = totalDueYTD + previousDues;

    return (
        <div style={styles.bill}>
            <div style={styles.header}>
                <img src={schoolLogo} alt="Logo" style={styles.logo} crossOrigin="anonymous"/>
                <div style={styles.schoolInfo}>
                    <h1 style={styles.schoolName}>{school.school_name}</h1>
                    <p style={styles.schoolAddress}>{school.address}</p>
                    <p style={styles.schoolContact}>Phone: {school.mobile_number}</p>
                </div>
                <div style={styles.meta}>
                    <h2 style={styles.title}>ANNUAL FEE RECORD</h2>
                    <p>Date: {new Date().toLocaleDateString()}</p>
                </div>
            </div>

            <div style={styles.studentSection}>
                <div style={styles.row}>
                    <span><strong>Student:</strong> {student.name}</span>
                    <span><strong>Class:</strong> {student.class}</span>
                </div>
                <div style={styles.row}>
                    <span><strong>Father:</strong> {student.father_name}</span>
                    <span><strong>Roll No:</strong> {student.roll_number}</span>
                </div>
            </div>

            <table style={styles.table}>
                <thead>
                    <tr style={styles.thRow}>
                        <th style={styles.th}>Month</th>
                        <th style={styles.thRight}>Fee</th>
                        <th style={styles.thRight}>Paid</th>
                        <th style={styles.thRight}>Balance</th>
                        <th style={styles.thCenter}>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </table>

            <div style={styles.summarySection}>
                <div style={styles.summaryBox}>
                    <div style={styles.summaryRow}>
                        <span>Current Year Dues:</span>
                        <span>₹{totalDueYTD.toLocaleString()}</span>
                    </div>
                    <div style={styles.summaryRow}>
                        <span>Previous Dues:</span>
                        <span>₹{previousDues.toLocaleString()}</span>
                    </div>
                    <div style={{...styles.summaryRow, borderTop: '1px solid #ccc', marginTop: '2mm', paddingTop: '2mm', fontSize: '11pt', color: '#dc2626'}}>
                        <span>NET AMOUNT DUE:</span>
                        <span>₹{finalTotalDue.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div style={styles.footer}>
                <p>Computer generated report.</p>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    bill: {
        width: '100%',
        height: '100%',
        padding: '8mm',
        boxSizing: 'border-box',
        backgroundColor: '#fff',
        fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        fontSize: '9pt',
        border: '1px solid #ccc'
    },
    header: {
        display: 'flex',
        borderBottom: '2px solid #3b82f6',
        paddingBottom: '4mm',
        marginBottom: '4mm',
        alignItems: 'center'
    },
    logo: { width: '12mm', height: '12mm', objectFit: 'contain', marginRight: '4mm' },
    schoolInfo: { flex: 1 },
    schoolName: { fontSize: '14pt', fontWeight: 'bold', margin: 0, color: '#1e3a8a' },
    schoolAddress: { margin: '1mm 0 0 0', color: '#555' },
    schoolContact: { margin: 0, color: '#555' },
    meta: { textAlign: 'right' },
    title: { fontSize: '12pt', fontWeight: 'bold', margin: 0, color: '#3b82f6' },
    studentSection: { marginBottom: '4mm', backgroundColor: '#f8fafc', padding: '4mm', borderRadius: '4px' },
    row: { display: 'flex', justifyContent: 'space-between', marginBottom: '1mm', fontSize: '10pt' },
    table: { width: '100%', borderCollapse: 'collapse', marginBottom: 'auto' },
    thRow: { backgroundColor: '#e2e8f0' },
    th: { padding: '2mm', textAlign: 'left', fontWeight: 'bold', borderBottom: '1px solid #94a3b8' },
    thRight: { padding: '2mm', textAlign: 'right', fontWeight: 'bold', borderBottom: '1px solid #94a3b8' },
    thCenter: { padding: '2mm', textAlign: 'center', fontWeight: 'bold', borderBottom: '1px solid #94a3b8' },
    tr: { borderBottom: '1px solid #e5e7eb' },
    futureRow: { borderBottom: '1px solid #e5e7eb', opacity: 0.5 },
    td: { padding: '1.5mm 2mm' },
    tdRight: { padding: '1.5mm 2mm', textAlign: 'right' },
    tdCenter: { padding: '1.5mm 2mm', textAlign: 'center' },
    summarySection: { display: 'flex', justifyContent: 'flex-end', marginTop: '4mm' },
    summaryBox: { width: '50%', backgroundColor: '#f1f5f9', padding: '4mm', borderRadius: '4px' },
    summaryRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '1mm', fontWeight: 'bold' },
    footer: { textAlign: 'center', color: '#9ca3af', fontSize: '8pt', marginTop: '4mm' }
};
