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

export const DuesBillTemplateOfficial: React.FC<DuesBillTemplateProps> = ({ student, school, classFee, selectedMonthIndex }) => {
    const studentPhoto = student.photo_url || `https://ui-avatars.com/api/?name=${student.name}&background=e8e8e8&color=555&size=128&bold=true`;
    const schoolLogo = school.school_image_url || `https://ui-avatars.com/api/?name=${school.school_name}&background=4f46e5&color=fff&size=128`;

    const feeRecords = [];
    let totalPaid = 0;
    let totalDues = 0;

    for (let i = 0; i < 12; i++) { // Always show all 12 months
        const monthKey = monthKeys[i] as keyof Student;
        const status = student[monthKey];
        let statusText = 'Pending';
        let statusStyle = styles.statusPending;

        if (status === 'Dues') {
            statusText = 'Dues';
            statusStyle = styles.statusDues;
            totalDues += classFee;
        } else if (status && status !== 'undefined') {
            statusText = 'Paid';
            statusStyle = styles.statusPaid;
            totalPaid += classFee;
        }
        
        feeRecords.push(
            <tr key={monthKey} style={i > selectedMonthIndex ? styles.futureRow : styles.tableRow}>
                <td style={styles.tableCell}>{monthDisplayNames[i]}</td>
                <td style={{...styles.tableCell, ...styles.textRight}}>₹{classFee.toLocaleString()}</td>
                <td style={{...styles.tableCell, ...styles.textCenter}}>
                    <span style={{...styles.statusBadge, ...statusStyle}}>{statusText}</span>
                </td>
            </tr>
        );
    }

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
                    <p style={styles.detailItem}><strong style={styles.detailLabel}>Name:</strong> {student.name}</p>
                    <p style={styles.detailItem}><strong style={styles.detailLabel}>Class:</strong> {student.class}</p>
                    <p style={styles.detailItem}><strong style={styles.detailLabel}>Roll No:</strong> {student.roll_number}</p>
                    <p style={styles.detailItem}><strong style={styles.detailLabel}>Father:</strong> {student.father_name}</p>
                </div>
            </div>

            <div style={styles.feesTableContainer}>
                <table style={styles.feesTable}>
                    <thead style={styles.tableHead}>
                        <tr>
                            <th style={styles.tableHeader}>Month</th>
                            <th style={{...styles.tableHeader, ...styles.textRight}}>Amount</th>
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
                <div style={styles.summaryItem}>
                    <span>Total Dues (YTD):</span>
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
        width: '105mm',
        height: '148.5mm',
        boxSizing: 'border-box',
        padding: '5mm',
        display: 'flex',
        flexDirection: 'column',
        fontSize: '9pt',
        border: '0.5px solid #e5e7eb',
        backgroundColor: 'white',
    },
    header: {
        display: 'flex',
        alignItems: 'flex-start',
        borderBottom: '1.5px solid #4f46e5',
        paddingBottom: '3mm',
    },
    logo: { width: '40px', height: '40px', objectFit: 'contain', marginRight: '4mm' },
    schoolInfo: { flexGrow: 1, overflow: 'hidden' },
    schoolName: { fontSize: '14pt', fontWeight: 'bold', margin: 0, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    schoolAddress: { fontSize: '8pt', margin: '2px 0 0 0', color: '#4b5563', wordBreak: 'break-word' },
    billTitle: { textAlign: 'right', flexShrink: 0 },
    billTitleText: { fontSize: '12pt', fontWeight: 'bold', margin: 0, color: '#4f46e5' },
    billDate: { fontSize: '8pt', margin: '2px 0 0 0' },
    studentSection: {
        display: 'flex',
        padding: '3mm 0',
        borderBottom: '1px solid #d1d5db',
    },
    studentPhoto: {
        width: '45px',
        height: '45px',
        objectFit: 'cover',
        border: '2px solid #d1d5db',
        borderRadius: '4px',
        marginRight: '4mm',
    },
    studentDetails: { flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' },
    detailItem: { margin: 0, padding: '1px 0', fontSize: '9pt', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    detailLabel: { color: '#374151', display: 'inline-block', width: '50px' },
    feesTableContainer: {
        flexGrow: 1,
        marginTop: '2mm',
        overflow: 'hidden',
    },
    feesTable: { width: '100%', borderCollapse: 'collapse' },
    tableHead: { backgroundColor: '#f3f4f6', fontSize: '8pt' },
    tableHeader: { padding: '4px', borderBottom: '1px solid #d1d5db', textAlign: 'left' },
    tableBody: {},
    tableRow: {},
    futureRow: { opacity: 0.6 },
    tableCell: { padding: '4px', borderBottom: '1px dotted #e5e7eb', fontSize: '8.5pt' },
    textRight: { textAlign: 'right' },
    textCenter: { textAlign: 'center' },
    statusBadge: { padding: '2px 6px', borderRadius: '10px', fontSize: '7.5pt', fontWeight: '500' },
    statusPaid: { backgroundColor: '#d1fae5', color: '#065f46' },
    statusDues: { backgroundColor: '#fee2e2', color: '#991b1b' },
    statusPending: { backgroundColor: '#e5e7eb', color: '#374151' },
    summarySection: {
        borderTop: '1.5px solid #4f46e5',
        paddingTop: '3mm',
        marginTop: 'auto',
    },
    summaryItem: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '10pt',
        fontWeight: 'bold',
        padding: '2px 0',
    },
    summaryValue: { color: '#1f2937' },
    footer: {
        display: 'flex',
        justifyContent: 'space-between',
        paddingTop: '6mm',
        fontSize: '8pt',
        color: '#4b5563',
        textAlign: 'center',
    },
    signatureLine: {
        borderTop: '1px solid #4b5563',
        width: '40mm',
        marginBottom: '1mm',
    },
    signatureText: {},
};