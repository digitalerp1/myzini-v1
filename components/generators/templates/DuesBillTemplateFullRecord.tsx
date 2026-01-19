
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

export const DuesBillTemplateFullRecord: React.FC<DuesBillTemplateProps> = ({ student, school, classFee, selectedMonthIndex }) => {
    const schoolLogo = school.school_image_url;
    const discount = student.discount || 0;
    const netFee = classFee - (classFee * discount / 100);
    
    let totalDueYTD = 0;
    const rows = [];

    for (let i = 0; i < 12; i++) {
        const monthKey = monthKeys[i] as keyof Student;
        const status = student[monthKey];
        let paid = parsePaidAmount(String(status));
        if (paid === Infinity) paid = netFee;

        let due = 0;
        let statusText = '-';
        if (i <= selectedMonthIndex) {
            due = Math.max(0, netFee - paid);
            totalDueYTD += due;
            statusText = paid >= netFee ? 'PAID' : (paid > 0 ? 'PARTIAL' : 'DUE');
        }

        rows.push(
            <tr key={monthKey} style={{ borderBottom: '1px solid #eee', opacity: i > selectedMonthIndex ? 0.4 : 1 }}>
                <td style={{ padding: '2mm' }}>{monthDisplayNames[i]}</td>
                <td style={{ padding: '2mm', textAlign: 'right' }}>₹{classFee}</td>
                <td style={{ padding: '2mm', textAlign: 'right' }}>{discount}%</td>
                <td style={{ padding: '2mm', textAlign: 'right' }}>₹{paid.toFixed(0)}</td>
                <td style={{ padding: '2mm', textAlign: 'right', fontWeight: 'bold', color: due > 0 ? 'red' : 'inherit' }}>₹{due.toFixed(0)}</td>
            </tr>
        );
    }

    return (
        <div style={{ width: '100%', height: '100%', padding: '5mm', backgroundColor: '#fff', border: '1px solid #eee', fontFamily: 'sans-serif', fontSize: '9pt' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #1e3a8a', paddingBottom: '2mm', marginBottom: '2mm' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '14pt', color: '#1e3a8a' }}>{school.school_name}</h1>
                    <p style={{ margin: 0, fontSize: '8pt' }}>{school.address}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <h2 style={{ margin: 0, fontSize: '10pt' }}>FEE RECORD 2024-25</h2>
                    <p style={{ margin: 0, fontSize: '8pt' }}>ID: {student.roll_number}</p>
                </div>
            </div>
            
            <div style={{ marginBottom: '2mm', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <span>Student: {student.name}</span>
                <span>Class: {student.class}</span>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f3f4f6' }}>
                    <tr>
                        <th style={{ textAlign: 'left', padding: '1mm' }}>Month</th>
                        <th style={{ textAlign: 'right', padding: '1mm' }}>Base</th>
                        <th style={{ textAlign: 'right', padding: '1mm' }}>Disc.</th>
                        <th style={{ textAlign: 'right', padding: '1mm' }}>Paid</th>
                        <th style={{ textAlign: 'right', padding: '1mm' }}>Bal</th>
                    </tr>
                </thead>
                <tbody>{rows}</tbody>
            </table>

            <div style={{ marginTop: 'auto', textAlign: 'right', borderTop: '2px solid #eee', paddingTop: '2mm' }}>
                <p style={{ margin: 0 }}>Arrears: ₹{student.previous_dues || 0}</p>
                <p style={{ margin: 0, fontSize: '12pt', fontWeight: 'bold', color: '#1e3a8a' }}>Total Payable: ₹{(totalDueYTD + (student.previous_dues || 0)).toFixed(0)}</p>
            </div>
        </div>
    );
};
