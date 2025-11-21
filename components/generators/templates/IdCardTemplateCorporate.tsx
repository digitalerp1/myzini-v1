
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Student, OwnerProfile } from '../../../types';

interface IdCardTemplateProps {
    student: Student;
    school: OwnerProfile;
}

const defaultLogo = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzRmNDZlNSI+PHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgMTJjLTIuNzYgMC01LTIuMjQtNS01czIuMjQtNSA1LTUgNSAyLjI0IDUgNS0yLjI0IDUtNSA1eiIvPjwvc3ZnPg==";

export const IdCardTemplateCorporate: React.FC<IdCardTemplateProps> = ({ student, school }) => {
    const studentPhoto = student.photo_url || `https://ui-avatars.com/api/?name=${student.name}&background=e8e8e8&color=555&size=128&bold=true`;
    const schoolLogo = school.school_image_url || defaultLogo;
    const [qrCodeUrl, setQrCodeUrl] = useState('');

    useEffect(() => {
        QRCode.toDataURL(`ID:${student.id},Roll:${student.roll_number}`, { width: 60, margin: 0 }).then(setQrCodeUrl);
    }, [student]);

    return (
        <div style={styles.card}>
            <div style={styles.sidebar}>
                <img src={studentPhoto} alt="Student" style={styles.photo} crossOrigin="anonymous"/>
                <div style={styles.qrContainer}>
                    {qrCodeUrl && <img src={qrCodeUrl} style={styles.qrCode} />}
                </div>
            </div>
            <div style={styles.mainContent}>
                <div style={styles.header}>
                    <img src={schoolLogo} style={styles.logo} alt="Logo" crossOrigin="anonymous"/>
                    <div style={styles.headerText}>
                        <h1 style={styles.schoolName}>{school.school_name}</h1>
                        <p style={styles.idLabel}>STUDENT ID CARD</p>
                    </div>
                </div>
                <div style={styles.details}>
                    <h2 style={styles.name}>{student.name}</h2>
                    <p style={styles.role}>{student.class} | Roll: {student.roll_number}</p>
                    <div style={styles.divider}></div>
                    <div style={styles.infoGrid}>
                        <Info label="DOB" value={student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : 'N/A'} />
                        <Info label="Phone" value={student.mobile} />
                        <Info label="Father" value={student.father_name} full />
                    </div>
                </div>
                <div style={styles.footer}>
                    <p>{school.address}</p>
                </div>
            </div>
        </div>
    );
};

const Info: React.FC<{ label: string, value?: string | null, full?: boolean }> = ({ label, value, full }) => (
    <div style={{ ...styles.infoItem, gridColumn: full ? 'span 2' : 'span 1' }}>
        <span style={styles.label}>{label}:</span> <span style={styles.value}>{value}</span>
    </div>
);

const styles: { [key: string]: React.CSSProperties } = {
    card: {
        width: '85.6mm',
        height: '53.98mm',
        display: 'flex',
        backgroundColor: 'white',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        fontFamily: '"Roboto", sans-serif',
        border: '1px solid #e2e8f0'
    },
    sidebar: {
        width: '30mm',
        backgroundColor: '#1e293b',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4mm',
        boxSizing: 'border-box',
    },
    photo: {
        width: '22mm',
        height: '22mm',
        borderRadius: '4px',
        objectFit: 'cover',
        border: '2px solid white',
        marginBottom: '4mm'
    },
    qrContainer: {
        padding: '2px',
        backgroundColor: 'white',
        borderRadius: '2px'
    },
    qrCode: {
        width: '18mm',
        height: '18mm',
    },
    mainContent: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '4mm',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '3mm',
    },
    logo: {
        width: '8mm',
        height: '8mm',
        objectFit: 'contain',
        marginRight: '3mm'
    },
    headerText: {
        flex: 1,
    },
    schoolName: {
        fontSize: '9pt',
        fontWeight: 'bold',
        margin: 0,
        color: '#0f172a',
        lineHeight: 1.1,
        textTransform: 'uppercase'
    },
    idLabel: {
        fontSize: '6pt',
        color: '#64748b',
        margin: 0,
        letterSpacing: '1px',
        fontWeight: 'bold'
    },
    details: {
        flex: 1,
    },
    name: {
        fontSize: '12pt',
        fontWeight: 'bold',
        color: '#0f172a',
        margin: '0 0 1mm 0'
    },
    role: {
        fontSize: '8pt',
        color: '#3b82f6',
        fontWeight: 'bold',
        margin: 0,
        textTransform: 'uppercase'
    },
    divider: {
        height: '1px',
        backgroundColor: '#e2e8f0',
        margin: '2mm 0'
    },
    infoGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1mm 2mm',
    },
    infoItem: {
        fontSize: '7pt',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    },
    label: {
        color: '#64748b',
        fontWeight: 'bold',
        marginRight: '2px'
    },
    value: {
        color: '#334155'
    },
    footer: {
        marginTop: 'auto',
        fontSize: '5pt',
        color: '#94a3b8',
        textAlign: 'center',
        borderTop: '1px solid #f1f5f9',
        paddingTop: '2px'
    }
};
