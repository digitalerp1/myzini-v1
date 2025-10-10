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

export const DuesBillTemplateCompact: React.FC<DuesBillTemplateProps> = ({ student, school, classFee, selectedMonthIndex }) => {
    
    let totalDues = 0;
    const feeRecords = [];

    // Filter for only months with Dues
    for (let i = 0; i <= selectedMonthIndex; i++) {
        const monthKey = monthKeys[i] as keyof Student;
        const status = student[monthKey];
        
        if (status === 'Dues') {
            totalDues += classFee;
            feeRecords.push(
                <tr key={monthKey}>
                    <td style={styles.tableCell}>{monthDisplayNames[i]}</td>
                    <td style={{...styles.tableCell, textAlign: 'right'}}>₹{classFee.toLocaleString()}</td>
                </tr>
            );
        }
    }

    return (
        <div style={styles.bill}>
            <div style={styles.header}>
                <div>
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
                <p style={styles.detailItem}><strong>{student.name}</strong></p>
                <p style={styles.detailItem}>Class: {student.class} (Roll: {student.roll_number})</p>
                <p style={styles.detailItem}>Father's Name: {student.father_name}</p>
            </div>
            
            <div style={{...styles.section, flexGrow: 1}}>
                 <h3 style={styles.sectionTitle}>Outstanding Fees:</h3>
                 {feeRecords.length > 0 ? (
                    <table style={styles.feesTable}>
                        <thead style={styles.tableHead}>
                            <tr>
                                <th style={styles.tableHeader}>Month</th>
                                <th style={{...styles.tableHeader, textAlign: 'right'}}>Amount</th>
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
        width: '105mm',
        height: '148.5mm',
        boxSizing: 'border-box',
        padding: '6mm',
        display: 'flex',
        flexDirection: 'column',
        fontSize: '9pt',
        backgroundColor: 'white',
        border: '0.5px solid #e5e7eb',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingBottom: '4mm',
        marginBottom: '4mm',
        borderBottom: '2px solid #111827',
    },
    schoolName: { fontSize: '14pt', fontWeight: 600, margin: 0, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    schoolAddress: { fontSize: '8pt', margin: '2px 0 0 0', color: '#4b5563', wordBreak: 'break-word' },
    billTitleText: { fontSize: '11pt', fontWeight: 600, margin: 0, color: '#111827' },
    billDate: { fontSize: '8pt', margin: '2px 0 0 0', color: '#4b5563' },
    section: { marginBottom: '4mm' },
    sectionTitle: {
        fontSize: '8pt',
        fontWeight: 600,
        textTransform: 'uppercase',
        color: '#6b7280',
        borderBottom: '1px solid #e5e7eb',
        paddingBottom: '1mm',
        marginBottom: '2mm',
    },
    detailItem: { margin: 0, padding: '1px 0', fontSize: '9pt', color: '#374151', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    feesTable: { width: '100%', borderCollapse: 'collapse' },
    tableHead: {},
    tableHeader: {
        padding: '1.5mm',
        borderBottom: '1px solid #6b7280',
        textAlign: 'left',
        fontSize: '8pt',
        fontWeight: 600,
    },
    tableCell: { padding: '1.5mm', borderBottom: '1px dotted #d1d5db', fontSize: '9pt' },
    noDuesText: {
        fontSize: '9pt',
        color: '#166534',
        backgroundColor: '#f0fdf4',
        padding: '2mm',
        borderRadius: '4px',
        textAlign: 'center',
    },
    totalSection: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '12pt',
        fontWeight: 'bold',
        padding: '3mm',
        marginTop: 'auto',
        backgroundColor: '#e5e7eb',
        color: '#111827',
        borderRadius: '4px',
    },
    footer: {
        fontSize: '7pt',
        color: '#6b7280',
        textAlign: 'center',
        paddingTop: '3mm',
        lineHeight: 1.4,
    },
};