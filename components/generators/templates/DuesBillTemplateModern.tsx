
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

export const DuesBillTemplateModern: React.FC<DuesBillTemplateProps> = ({ student, school, classFee, selectedMonthIndex }) => {
    
    const feeRecords = [];
    let totalPaid = 0;
    let totalDues = 0;

    for (let i = 0; i < 12; i++) {
        const monthKey = monthKeys[i] as keyof Student;
        const status = student[monthKey];
        let statusDotStyle = styles.dotPending;
        let remarks = 'Pending';
        let displayAmount = classFee;
        
        let paidAmount = parsePaidAmount(String(status));
        if (paidAmount === Infinity) paidAmount = classFee;

        if (i <= selectedMonthIndex) {
            if (paidAmount < classFee) {
                if (status === 'Dues' || !status || status === 'undefined' || paidAmount === 0) {
                    statusDotStyle = styles.dotDues;
                    remarks = 'Dues';
                    totalDues += classFee;
                } else {
                    statusDotStyle = styles.dotDues;
                    remarks = `Bal: ₹${classFee - paidAmount}`;
                    totalDues += (classFee - paidAmount);
                    totalPaid += paidAmount;
                }
            } else {
                statusDotStyle = styles.dotPaid;
                remarks = 'Paid';
                totalPaid += paidAmount;
            }
        } else {
            if (paidAmount > 0) {
                statusDotStyle = styles.dotPaid;
                remarks = 'Adv. Paid';
                totalPaid += paidAmount;
            }
        }
        
        feeRecords.push(
            <div key={monthKey} style={styles.tableRow}>
                <div style={{...styles.statusDot, ...statusDotStyle}}></div>
                <span style={styles.monthName}>{monthDisplayNames[i]}</span>
                <span style={styles.monthStatus}>{remarks}</span>
                <span style={styles.monthAmount}>₹{displayAmount.toLocaleString()}</span>
            </div>
        );
    }

    const previousDues = student.previous_dues || 0;
    totalDues += previousDues;

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
                {previousDues > 0 && (
                    <div style={styles.sidebarSection}>
                        <p style={styles.sidebarLabel}>Prev. Dues</p>
                        <p style={{...styles.sidebarValue, color: '#b91c1c'}}>₹{previousDues.toLocaleString()}</p>
                    </div>
                )}
                <div style={styles.sidebarTotalSection}>
                    <p style={styles.sidebarLabel}>Total Dues (Net)</p>
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
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        fontSize: '10pt',
        backgroundColor: '#fff',
        border: '1px solid #f3f4f6',
    },
    mainContent: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '6mm',
        overflow: 'hidden',
    },
    sidebar: {
        width: '45mm',
        backgroundColor: '#f9fafb',
        padding: '6mm',
        display: 'flex',
        flexDirection: 'column',
        borderLeft: '1px solid #f3f4f6',
    },
    header: {},
    schoolName: { fontSize: '16pt', fontWeight: 700, margin: 0, color: '#111827' },
    headerSubtitle: { fontSize: '10pt', margin: '1mm 0 0 0', color: '#6b7280' },
    studentDetails: { marginTop: '5mm', marginBottom: '4mm' },
    studentName: { fontSize: '12pt', fontWeight: 600, margin: '1mm 0', color: '#1f2937' },
    detailItem: { margin: '0.5mm 0', fontSize: '9pt', color: '#4b5563' },
    feesTable: { flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    tableRow: { display: 'flex', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid #f3f4f6' },
    statusDot: { width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, marginRight: '8px' },
    dotPaid: { backgroundColor: '#22c55e' },
    dotDues: { backgroundColor: '#ef4444' },
    dotPending: { backgroundColor: '#d1d5db' },
    monthName: { fontWeight: 500, color: '#374151', fontSize: '9.5pt' },
    monthStatus: { marginLeft: 'auto', color: '#6b7280', fontSize: '9pt' },
    monthAmount: { width: '60px', textAlign: 'right', fontWeight: 500, color: '#111827', fontSize: '9.5pt' },
    sidebarSection: { marginBottom: '6mm' },
    sidebarLabel: { fontSize: '9pt', color: '#6b7280', margin: 0, textTransform: 'uppercase' },
    sidebarValue: { fontSize: '11pt', fontWeight: 600, color: '#1f2937', margin: '1mm 0 0 0' },
    sidebarTotalSection: {
        padding: '4mm',
        borderRadius: '6px',
        backgroundColor: '#fee2e2',
        textAlign: 'center'
    },
    totalDueValue: {
        fontSize: '16pt',
        fontWeight: 700,
        color: '#b91c1c',
        margin: '1mm 0 0 0'
    },
    sidebarNote: {
        fontSize: '8pt',
        color: '#6b7280',
        lineHeight: 1.4
    }
};
