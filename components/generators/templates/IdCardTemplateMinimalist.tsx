import React from 'react';
import { Student, OwnerProfile } from '../../../types';

interface IdCardTemplateProps {
    student: Student;
    school: OwnerProfile;
}

export const IdCardTemplateMinimalist: React.FC<IdCardTemplateProps> = ({ student, school }) => {
    const studentPhoto = student.photo_url || `https://ui-avatars.com/api/?name=${student.name}&background=e8e8e8&color=555&size=128&bold=true`;

    return (
        <div style={styles.card}>
            <div style={styles.content}>
                <div style={styles.leftPanel}>
                    <img src={studentPhoto} alt="Student" style={styles.studentPhoto} crossOrigin="anonymous"/>
                </div>
                <div style={styles.rightPanel}>
                    <h1 style={styles.schoolName}>{school.school_name}</h1>
                    <h2 style={styles.studentName}>{student.name}</h2>
                    <div style={styles.details}>
                        <DetailItem label="Class" value={student.class} />
                        <DetailItem label="Roll Number" value={student.roll_number} />
                        <DetailItem label="Contact" value={student.mobile} />
                        <DetailItem label="Father's Name" value={student.father_name} />
                    </div>
                </div>
            </div>
            <div style={styles.footer}>
                <p>STUDENT ID</p>
            </div>
        </div>
    );
};

const DetailItem: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => (
    <div>
        <p style={styles.detailLabel}>{label}</p>
        <p style={styles.detailValue}>{value || 'N/A'}</p>
    </div>
);

const styles: { [key: string]: React.CSSProperties } = {
    card: {
        width: '85.6mm',
        height: '53.98mm',
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '4px',
        fontFamily: '"Inter", "Segoe UI", sans-serif',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxSizing: 'border-box',
    },
    content: {
        flexGrow: 1,
        display: 'flex',
    },
    leftPanel: {
        width: '28mm',
        backgroundColor: '#111827',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    studentPhoto: {
        width: '24mm',
        height: '32mm',
        objectFit: 'cover',
    },
    rightPanel: {
        flex: 1,
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
    },
    schoolName: {
        fontSize: '10px',
        fontWeight: 600,
        color: '#6b7280',
        margin: 0,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    studentName: {
        fontSize: '18px',
        fontWeight: 700,
        color: '#111827',
        margin: '8px 0',
        lineHeight: 1.2,
    },
    details: {
        marginTop: 'auto',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '6px',
    },
    detailLabel: {
        fontSize: '7px',
        color: '#6b7280',
        margin: 0,
        textTransform: 'uppercase',
    },
    detailValue: {
        fontSize: '10px',
        color: '#111827',
        margin: 0,
        fontWeight: 500,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    footer: {
        backgroundColor: '#111827',
        color: 'white',
        textAlign: 'center',
        padding: '3px',
        fontSize: '8px',
        fontWeight: 'bold',
        letterSpacing: '2px',
    },
};