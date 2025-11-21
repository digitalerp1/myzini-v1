
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
        return Infinity; // Legacy full payment
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

export const DuesBillTemplateOfficial: React.FC<DuesBillTemplateProps> = ({ student, school, classFee, selectedMonthIndex }) => {
    const studentPhoto = student.photo_url || `https://ui-avatars.com/api/?name=${student.name}&background=e8e8e8&color=555&size=128&bold=true`;
    const schoolLogo = school.school_image_url || `https://ui-avatars.com/api/?name=${school.school_name}&background=4f46e5&color=fff&size=128`;

    const feeRecords = [];
    let totalPaid = 0;
    let totalDues = 0;

    for (let i = 0; i < 12; i++) { 
        const monthKey = monthKeys[i] as keyof Student;
        const status = student[monthKey];
        
        let paidAmount = parsePaidAmount(String(status));
        if (paidAmount === Infinity) paidAmount = classFee;

        let statusText = 'Pending';
        let statusStyle = styles.statusPending;
        let displayAmount = classFee;

        if (i <= selectedMonthIndex) {
            if (paidAmount === 0 && (status === 'Dues' || !status || status === 'undefined')) {
                statusText = 'Dues';
                statusStyle = styles.statusDues;
                totalDues += classFee;
            } else if (paidAmount < classFee) {
                statusText = `Partial Due (₹${classFee - paidAmount})`;
                statusStyle = styles.statusDues;
                totalDues += (classFee - paidAmount);
                totalPaid += paidAmount;
            } else {
                statusText = 'Paid';
                statusStyle = styles.statusPaid;
                totalPaid += paidAmount;
            }
        }
        
        feeRecords.push(
            <tr key={monthKey} style={i > selectedMonthIndex ? styles.futureRow : styles.tableRow}>
                <td style={styles.tableCell}>{monthDisplayNames[i]}</td>
                <td style={{...styles.tableCell, ...styles.textRight}}>₹{displayAmount.toLocaleString()}</td>
                <td style={{...styles.tableCell, ...styles.textCenter}}>
                    <span style={{...styles.statusBadge, ...statusStyle}}>{statusText}</span>
                </td>
            </tr>
        );
    }

    const previousDues = student.previous_dues || 0;
    totalDues += previousDues;

    return (
        <div style={styles.bill}>
            <div style={styles.header}>
                <img src={schoolLogo} alt="Logo" style={styles.logo} crossOrigin="anonymous"/>
                <div style={styles.schoolInfo}>
                    <h1 style={styles.schoolName}>{school.school_name}</h1>
                    <p style={styles.schoolAddress}>{school.address}</p>
                </div>
                <div style={styles.billTitle}>
                    <h2 style={styles.billTitleText}>FEE BILL</h2>
                    <p style={styles.billDate}>As of: {monthDisplayNames[selectedMonthIndex]} {new Date().getFullYear()}</p>
                </div>
            </div>

            <div style={styles.studentSection}>
                <img src={studentPhoto} alt="Student" style={styles.studentPhoto} crossOrigin="anonymous"/>
                <div style={styles.studentDetails}>
                    <div style={styles.detailRow}>
                        <p style={styles.detailItem}><strong style={styles.detailLabel}>Name:</strong> {student.name}</p>
                        <p style={styles.detailItem}><strong style={styles.detailLabel}>Father:</strong> {student.father_name}</p>
                    </div>
                    <div style={styles.detailRow}>
                        <p style={styles.detailItem}><strong style={styles.detailLabel}>Class:</strong> {student.class}</p>
                        <p style={styles.detailItem}><strong style={styles.detailLabel}>Roll No:</strong> {student.roll_number}</p>
                    </div>
                </div>
            </div>

            <div style={styles.feesTableContainer}>
                <table style={styles.feesTable}>
                    <thead style={styles.tableHead}>
                        <tr>
                            <th style={styles.tableHeader}>Month</th>
                            <th style={{...styles.tableHeader, ...styles.textRight}}>Fee Amount</th>
                            <th style={{...styles.tableHeader, ...styles.textCenter}}>Status</th>
                        </tr>
                    </thead>
                    <tbody style={styles.tableBody}>
                        {feeRecords}
                    </tbody>
                </table>
            </div>

            <div style={styles.summarySection}>
                 <div style={styles.summaryItem}>
                    <span>Total Paid (YTD):</span>
                    <span style={styles.summaryValue}>₹{totalPaid.toLocaleString()}</span>
                </div>
                {previousDues > 0 && (
                    <div style={styles.summaryItem}>
                        <span>Previous Dues:</span>
                        <span style={{...styles.summaryValue, color: '#dc2626'}}>₹{previousDues.toLocaleString()}</span>
                    </div>
                )}
                <div style={styles.summaryItem}>
                    <span>Total Dues (Net):</span>
                    <span style={{...styles.summaryValue, color: '#dc2626'}}>₹{totalDues.toLocaleString()}</span>
                </div>
            </div>
            
            <div style={styles.footer}>
                <div>
                    <p style={styles.signatureLine}></p>
                    <p style={styles.signatureText}>Cashier Signature</p>
                </div>
                 <div>
                    <p style={styles.signatureLine}></p>
                    <p style={styles.signatureText}>Principal Signature</p>
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    bill: {
        fontFamily: 'Arial, sans-serif',
        width: '100%', // Responsive width
        height: '100%', // Responsive height
        boxSizing: 'border-box',
        padding: '6mm',
        display: 'flex',
        flexDirection: 'column',
        fontSize: '10pt',
        border: '1px solid #e5e7eb',
        backgroundColor: 'white',
    },
    header: {
        display: 'flex',
        alignItems: 'flex-start',
        borderBottom: '2px solid #4f46e5',
        paddingBottom: '3mm',
    },
    logo: { width: '50px', height: '50px', objectFit: 'contain', marginRight: '5mm' },
    schoolInfo: { flexGrow: 1, overflow: 'hidden' },
    schoolName: { fontSize: '16pt', fontWeight: 'bold', margin: 0, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    schoolAddress: { fontSize: '9pt', margin: '2px 0 0 0', color: '#4b5563', wordBreak: 'break-word' },
    billTitle: { textAlign: 'right', flexShrink: 0, marginLeft: '4mm' },
    billTitleText: { fontSize: '14pt', fontWeight: 'bold', margin: 0, color: '#4f46e5' },
    billDate: { fontSize: '9pt', margin: '2px 0 0 0' },
    studentSection: {
        display: 'flex',
        padding: '4mm 0',
        borderBottom: '1px solid #d1d5db',
    },
    studentPhoto: {
        width: '55px',
        height: '55px',
        objectFit: 'cover',
        border: '2px solid #d1d5db',
        borderRadius: '4px',
        marginRight: '5mm',
    },
    studentDetails: { flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' },
    detailRow: { display: 'flex', justifyContent: 'space-between', width: '100%' },
    detailItem: { margin: 0, padding: '1px 0', fontSize: '10pt', width: '48%' },
    detailLabel: { color: '#374151', display: 'inline-block', width: '60px' },
    feesTableContainer: {
        flexGrow: 1,
        marginTop: '3mm',
        overflow: 'hidden',
    },
    feesTable: { width: '100%', borderCollapse: 'collapse' },
    tableHead: { backgroundColor: '#f3f4f6', fontSize: '9pt' },
    tableHeader: { padding: '6px', borderBottom: '1px solid #d1d5db', textAlign: 'left' },
    tableBody: {},
    tableRow: {},
    futureRow: { opacity: 0.5 },
    tableCell: { padding: '5px 6px', borderBottom: '1px dotted #e5e7eb', fontSize: '9.5pt' },
    textRight: { textAlign: 'right' },
    textCenter: { textAlign: 'center' },
    statusBadge: { padding: '2px 8px', borderRadius: '12px', fontSize: '8.5pt', fontWeight: 'bold' },
    statusPaid: { backgroundColor: '#dcfce7', color: '#166534' },
    statusDues: { backgroundColor: '#fee2e2', color: '#991b1b' },
    statusPending: { backgroundColor: '#f3f4f6', color: '#4b5563' },
    summarySection: {
        borderTop: '2px solid #4f46e5',
        paddingTop: '4mm',
        marginTop: 'auto',
    },
    summaryItem: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '11pt',
        fontWeight: 'bold',
        padding: '2px 0',
    },
    summaryValue: { color: '#1f2937' },
    footer: {
        display: 'flex',
        justifyContent: 'space-between',
        paddingTop: '8mm',
        fontSize: '9pt',
        color: '#4b5563',
        textAlign: 'center',
    },
    signatureLine: {
        borderTop: '1px solid #4b5563',
        width: '50mm',
        marginBottom: '2mm',
    },
    signatureText: {},
};
