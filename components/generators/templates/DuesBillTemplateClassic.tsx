
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

export const DuesBillTemplateClassic: React.FC<DuesBillTemplateProps> = ({ student, school, classFee, selectedMonthIndex }) => {
    let totalDues = 0;
    const items = [];

    for (let i = 0; i <= selectedMonthIndex; i++) {
        const key = monthKeys[i] as keyof Student;
        const status = student[key];
        
        let paidAmount = parsePaidAmount(String(status));
        if (paidAmount === Infinity) paidAmount = classFee;

        if (paidAmount < classFee) {
            const dueAmount = classFee - paidAmount;
            if (status === 'Dues' || !status || status === 'undefined' || dueAmount > 0) {
                totalDues += dueAmount;
                items.push(`${monthNames[i]} (₹${dueAmount})`);
            }
        }
    }

    const previousDues = student.previous_dues || 0;
    if (previousDues > 0) {
        totalDues += previousDues;
        items.push(`Prev. Arrears (₹${previousDues})`);
    }

    return (
        <div style={styles.page}>
            <div style={styles.border}>
                <div style={styles.header}>
                    <h1 style={styles.title}>{school.school_name}</h1>
                    <p style={styles.subtitle}>FEE DEMAND NOTE</p>
                </div>
                
                <div style={styles.row}>
                    <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                    <p><strong>Roll No:</strong> {student.roll_number}</p>
                </div>
                
                <div style={styles.lineItem}>
                    <p><strong>Name of Student:</strong> {student.name}</p>
                </div>
                <div style={styles.lineItem}>
                    <p><strong>Class:</strong> {student.class}</p>
                </div>
                <div style={styles.lineItem}>
                    <p><strong>Father's Name:</strong> {student.father_name}</p>
                </div>

                <div style={styles.box}>
                    <p style={styles.boxHeader}>PARTICULARS OF DUES</p>
                    <p style={styles.duesText}>
                        Outstanding Fees Details:<br/>
                        <span style={{fontWeight: 'bold', display: 'block', marginTop: '5px'}}>{items.length > 0 ? items.join(', ') : 'No Dues Pending'}</span>
                    </p>
                    <div style={styles.totalRow}>
                        <span>TOTAL PAYABLE:</span>
                        <span>₹ {totalDues}/-</span>
                    </div>
                </div>

                <div style={styles.footer}>
                    <div style={styles.sign}>
                        <p>Accountant</p>
                    </div>
                    <div style={styles.sign}>
                        <p>Parent's Sig.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    page: { width: '100%', height: '100%', padding: '5mm', boxSizing: 'border-box', backgroundColor: '#fffdf5', fontFamily: 'Times New Roman, serif', display: 'flex' },
    border: { border: '2px solid #8b4513', padding: '5mm', width: '100%', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' },
    header: { textAlign: 'center', marginBottom: '5mm', borderBottom: '1px solid #8b4513', paddingBottom: '2mm' },
    title: { fontSize: '16pt', fontWeight: 'bold', color: '#8b4513', margin: 0, textTransform: 'uppercase' },
    subtitle: { fontSize: '11pt', fontStyle: 'italic', margin: '2px 0' },
    row: { display: 'flex', justifyContent: 'space-between', fontSize: '11pt', marginBottom: '3mm' },
    lineItem: { fontSize: '11pt', borderBottom: '1px dotted #999', marginBottom: '3mm', paddingBottom: '1mm' },
    box: { border: '1px solid #8b4513', padding: '4mm', marginTop: '2mm', flexGrow: 1, display: 'flex', flexDirection: 'column' },
    boxHeader: { textAlign: 'center', fontWeight: 'bold', textDecoration: 'underline', marginBottom: '3mm', fontSize: '11pt' },
    duesText: { fontSize: '11pt', lineHeight: 1.4, flexGrow: 1 },
    totalRow: { display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14pt', borderTop: '1px solid #8b4513', paddingTop: '3mm', marginTop: 'auto' },
    footer: { display: 'flex', justifyContent: 'space-between', marginTop: '5mm' },
    sign: { borderTop: '1px solid #000', width: '40mm', textAlign: 'center', fontSize: '10pt', paddingTop: '1mm' }
};
