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

export const DuesBillTemplateModern: React.FC<DuesBillTemplateProps> = ({ student, school, classFee, selectedMonthIndex }) => {
    
    const feeRecords = [];
    let totalPaid = 0;
    let totalDues = 0;

    for (let i = 0; i < 12; i++) {
        const monthKey = monthKeys[i] as keyof Student;
        const status = student[monthKey];
        let statusDotStyle = styles.dotPending;
        let remarks = 'Pending';
        
        let isDueInPeriod = false;
        if (i <= selectedMonthIndex && (status === 'Dues' || status === 'undefined' || !status)) {
            isDueInPeriod = true;
        }

        if (status === 'Dues' || isDueInPeriod) {
            statusDotStyle = styles.dotDues;
            remarks = 'Dues';
            totalDues += classFee;
        } else if (status && status !== 'undefined') {
            statusDotStyle = styles.dotPaid;
            remarks = 'Paid';
            totalPaid += classFee;
        }
        
        feeRecords.push(
            <div key={monthKey} style={styles.tableRow}>
                <div style={{...styles.statusDot, ...statusDotStyle}}></div>
                <span style={styles.monthName}>{monthDisplayNames[i]}</span>
                <span style={styles.monthStatus}>{remarks}</span>
                <span style={styles.monthAmount}>₹{classFee.toLocaleString()}</span>
            </div>
        );
    }

    return (
        <div style={styles.bill}>
            <div style={styles.mainContent}>
                <div style={styles.header}>
                    <div>
                        <h1 style={styles.schoolName}>{school.school_name}</h1>
                        <p style={styles.headerSubtitle}>Fee Statement</p>
                    </div>
                </div>
                 <div style={styles.studentDetails}>
                    <p style={{...styles.detailItem, margin: 0, color: '#6b7280' }}>Statement for:</p>
                    <p style={styles.studentName}>{student.name}</p>
                    <p style={styles.detailItem}>Class: {student.class} | Roll: {student.roll_number}</p>
                </div>
                 <div style={styles.feesTable}>
                    {feeRecords}
                </div>
            </div>
            <div style={styles.sidebar}>
                <div style={styles.sidebarSection}>
                    <p style={styles.sidebarLabel}>Statement Date</p>
                    <p style={styles.sidebarValue}>{new Date().toLocaleDateString()}</p>
                </div>
                 <div style={styles.sidebarSection}>
                    <p style={styles.sidebarLabel}>Total Paid (YTD)</p>
                    <p style={styles.sidebarValue}>₹{totalPaid.toLocaleString()}</p>
                </div>
                <div style={styles.sidebarTotalSection}>
                    <p style={styles.sidebarLabel}>Total Dues (YTD)</p>
                    <p style={styles.totalDueValue}>₹{totalDues.toLocaleString()}</p>
                </div>
                <div style={{...styles.sidebarSection, marginTop: 'auto'}}>
                    <p style={styles.sidebarNote}>Thank you for your timely payments.</p>
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    bill: {
        fontFamily: '"Inter", system-ui, sans-serif',
        width: '105mm',
        height: '148.5mm',
        boxSizing: 'border-box',
        display: 'flex',
        fontSize: '9pt',
        backgroundColor: '#fff',
        border: '1px solid #f3f4f6',
    },
    mainContent: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '5mm',
        overflow: 'hidden',
    },
    sidebar: {
        width: '35mm',
        backgroundColor: '#f9fafb',
        padding: '5mm',
        display: 'flex',
        flexDirection: 'column',
        borderLeft: '1px solid #f3f4f6',
    },
    header: {},
    schoolName: { fontSize: '14pt', fontWeight: 700, margin: 0, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    headerSubtitle: { fontSize: '9pt', margin: '1mm 0 0 0', color: '#6b7280' },
    studentDetails: { marginTop: '5mm', marginBottom: '4mm' },
    studentName: { fontSize: '11pt', fontWeight: 600, margin: '1mm 0', color: '#1f2937', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    detailItem: { margin: '0.5mm 0', fontSize: '8pt', color: '#4b5563' },
    feesTable: { flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    tableRow: { display: 'flex', alignItems: 'center', padding: '4px 0', borderBottom: '1px solid #f3f4f6' },
    statusDot: { width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, marginRight: '8px' },
    dotPaid: { backgroundColor: '#22c55e' },
    dotDues: { backgroundColor: '#ef4444' },
    dotPending: { backgroundColor: '#d1d5db' },
    monthName: { fontWeight: 500, color: '#374151', fontSize: '8.5pt' },
    monthStatus: { marginLeft: 'auto', color: '#6b7280', fontSize: '8pt' },
    monthAmount: { width: '50px', textAlign: 'right', fontWeight: 500, color: '#111827', fontSize: '8.5pt' },
    sidebarSection: { marginBottom: '5mm' },
    sidebarLabel: { fontSize: '8pt', color: '#6b7280', margin: 0, textTransform: 'uppercase' },
    sidebarValue: { fontSize: '10pt', fontWeight: 600, color: '#1f2937', margin: '1mm 0 0 0' },
    sidebarTotalSection: {
        padding: '3mm',
        borderRadius: '6px',
        backgroundColor: '#fee2e2',
        textAlign: 'center'
    },
    totalDueValue: {
        fontSize: '14pt',
        fontWeight: 700,
        color: '#b91c1c',
        margin: '1mm 0 0 0'
    },
    sidebarNote: {
        fontSize: '7pt',
        color: '#6b7280',
        lineHeight: 1.4
    }
};