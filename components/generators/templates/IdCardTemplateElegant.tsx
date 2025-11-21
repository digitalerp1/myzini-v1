
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Student, OwnerProfile } from '../../../types';

interface IdCardTemplateProps {
    student: Student;
    school: OwnerProfile;
}

const defaultLogo = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2I0NTMwOSI+PHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgMTJjLTIuNzYgMC01LTIuMjQtNS01czIuMjQtNSA1LTUgNSAyLjI0IDUgNS0yLjI0IDUtNSA1eiIvPjwvc3ZnPg==";

export const IdCardTemplateElegant: React.FC<IdCardTemplateProps> = ({ student, school }) => {
    const studentPhoto = student.photo_url || `https://ui-avatars.com/api/?name=${student.name}&background=e8e8e8&color=555&size=128&bold=true`;
    const schoolLogo = school.school_image_url || defaultLogo;
    const [qrCodeUrl, setQrCodeUrl] = useState('');

    useEffect(() => {
        QRCode.toDataURL(`ID:${student.id}`, { width: 60, margin: 0, color: { dark: '#b45309', light: '#fff' } }).then(setQrCodeUrl);
    }, [student]);

    return (
        <div style={styles.card}>
            <div style={styles.border}>
                <div style={styles.header}>
                    <div style={styles.logoContainer}>
                        <img src={schoolLogo} style={styles.logo} alt="Logo" crossOrigin="anonymous"/>
                    </div>
                    <div style={styles.schoolInfo}>
                        <h1 style={styles.schoolName}>{school.school_name}</h1>
                    </div>
                </div>
                <div style={styles.body}>
                    <div style={styles.photoFrame}>
                        <img src={studentPhoto} alt="Student" style={styles.photo} crossOrigin="anonymous"/>
                    </div>
                    <div style={styles.details}>
                        <h2 style={styles.name}>{student.name}</h2>
                        <p style={styles.designation}>Student</p>
                        <div style={styles.infoTable}>
                            <div style={styles.row}><span style={styles.label}>Class</span>: {student.class}</div>
                            <div style={styles.row}><span style={styles.label}>Roll No</span>: {student.roll_number}</div>
                            <div style={styles.row}><span style={styles.label}>Phone</span>: {student.mobile}</div>
                        </div>
                    </div>
                    <div style={styles.qrSection}>
                        {qrCodeUrl && <img src={qrCodeUrl} style={styles.qr} />}
                    </div>
                </div>
                <div style={styles.footer}>
                    <p>{school.address}</p>
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    card: {
        width: '85.6mm',
        height: '53.98mm',
        backgroundColor: '#ffffff',
        borderRadius: '4px',
        fontFamily: '"Georgia", serif',
        boxSizing: 'border-box',
        padding: '2mm',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    border: {
        width: '100%',
        height: '100%',
        border: '1px solid #b45309',
        borderRadius: '2px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
    },
    header: {
        backgroundColor: '#fff7ed',
        padding: '2mm 4mm',
        display: 'flex',
        alignItems: 'center',
        borderBottom: '1px solid #fdba74'
    },
    logoContainer: { marginRight: '3mm' },
    logo: { width: '8mm', height: '8mm', objectFit: 'contain' },
    schoolInfo: { flex: 1 },
    schoolName: { fontSize: '10pt', fontWeight: 'bold', color: '#7c2d12', margin: 0, textTransform: 'uppercase' },
    body: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        padding: '3mm 4mm'
    },
    photoFrame: {
        padding: '1px',
        border: '1px solid #b45309',
        marginRight: '4mm'
    },
    photo: {
        width: '20mm',
        height: '24mm',
        objectFit: 'cover',
        display: 'block'
    },
    details: { flex: 1 },
    name: { fontSize: '12pt', color: '#1f2937', margin: '0 0 1mm 0', fontWeight: 'bold' },
    designation: { fontSize: '8pt', color: '#b45309', margin: '0 0 3mm 0', textTransform: 'uppercase', letterSpacing: '1px' },
    infoTable: { fontSize: '7pt', color: '#374151' },
    row: { marginBottom: '1mm' },
    label: { fontWeight: 'bold', color: '#4b5563' },
    qrSection: { marginLeft: '2mm' },
    qr: { width: '14mm', height: '14mm' },
    footer: {
        backgroundColor: '#7c2d12',
        color: '#fff',
        fontSize: '5pt',
        textAlign: 'center',
        padding: '1mm',
        textTransform: 'uppercase'
    }
};
