import React from 'react';
import { Student, OwnerProfile } from '../../../types';

interface IdCardTemplateProps {
    student: Student;
    school: OwnerProfile;
}

export const IdCardTemplateVibrant: React.FC<IdCardTemplateProps> = ({ student, school }) => {
    const studentPhoto = student.photo_url || `https://ui-avatars.com/api/?name=${student.name}&background=e8e8e8&color=555&size=128&bold=true`;
    const schoolLogo = school.school_image_url || `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2ZmZiI+PHBhdGggZD0iTTEyIDE1bC04LTUgOC01IDggNSA0LTIuNS0xMi03LjUtMTIgNy41djEwbDEyIDcuNSA0LTIuNWwtNC0yLjV6Ii8+PC9zdmc+`;

    return (
        <div style={styles.card}>
            <div style={styles.backgroundShape}></div>
            <div style={styles.header}>
                <img src={schoolLogo} alt="School Logo" style={styles.logo} crossOrigin="anonymous"/>
                <div style={styles.schoolInfo}>
                    <h1 style={styles.schoolName}>{school.school_name}</h1>
                </div>
            </div>
            
            <div style={styles.content}>
                <img src={studentPhoto} alt="Student" style={styles.studentPhoto} crossOrigin="anonymous"/>
                <h2 style={styles.studentName}>{student.name}</h2>
                <p style={styles.studentRole}>STUDENT</p>

                <div style={styles.infoGrid}>
                    <InfoBox label="Class" value={student.class} />
                    <InfoBox label="Roll No." value={student.roll_number} />
                    <InfoBox label="D.O.B." value={student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : 'N/A'} />
                    <InfoBox label="Mobile" value={student.mobile} />
                </div>
            </div>
            
            <div style={styles.footer}>
                <p>SESSION 2024-2025</p>
            </div>
        </div>
    );
};

const InfoBox: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => (
    <div>
        <p style={styles.infoLabel}>{label}</p>
        <p style={styles.infoValue}>{value || 'N/A'}</p>
    </div>
);

const styles: { [key: string]: React.CSSProperties } = {
    card: {
        width: '53.98mm',
        height: '85.6mm',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        fontFamily: '"Poppins", "Segoe UI", sans-serif',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxSizing: 'border-box',
        position: 'relative',
        boxShadow: '0 6px 12px rgba(0,0,0,0.1)',
    },
    backgroundShape: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '90px',
        background: 'linear-gradient(135deg, #6d28d9, #be185d)',
        borderBottomLeftRadius: '50% 20%',
        borderBottomRightRadius: '50% 20%',
        zIndex: 0,
    },
    header: {
        padding: '10px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        zIndex: 1,
    },
    logo: {
        width: '30px',
        height: '30px',
        objectFit: 'contain',
    },
    schoolInfo: { flex: 1, overflow: 'hidden' },
    schoolName: {
        fontSize: '12px',
        fontWeight: 600,
        color: '#ffffff',
        margin: 0,
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
    },
    content: {
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '0 10px',
        textAlign: 'center',
        zIndex: 1,
    },
    studentPhoto: {
        width: '75px',
        height: '75px',
        borderRadius: '50%',
        border: '4px solid white',
        objectFit: 'cover',
        boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
        marginTop: '5px',
    },
    studentName: {
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#1f2937',
        margin: '10px 0 2px 0',
    },
    studentRole: {
        fontSize: '9px',
        fontWeight: 500,
        color: '#be185d',
        margin: '0 0 15px 0',
        letterSpacing: '1px',
    },
    infoGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px',
        width: '100%',
        marginTop: 'auto',
    },
    infoLabel: {
        fontSize: '8px',
        color: '#6b7280',
        margin: 0,
        fontWeight: 500,
    },
    infoValue: {
        fontSize: '10px',
        color: '#1f2937',
        margin: 0,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    footer: {
        background: 'linear-gradient(135deg, #6d28d9, #be185d)',
        padding: '5px',
        textAlign: 'center',
        color: 'white',
        fontSize: '8px',
        fontWeight: 500,
        marginTop: '10px',
        zIndex: 1,
    },
};