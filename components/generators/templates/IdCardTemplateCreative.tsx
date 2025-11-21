
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Student, OwnerProfile } from '../../../types';

interface IdCardTemplateProps {
    student: Student;
    school: OwnerProfile;
}

const defaultLogo = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2ZmZiI+PHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgMTJjLTIuNzYgMC01LTIuMjQtNS01czIuMjQtNSA1LTUgNSAyLjI0IDUgNS0yLjI0IDUtNSA1eiIvPjwvc3ZnPg==";

export const IdCardTemplateCreative: React.FC<IdCardTemplateProps> = ({ student, school }) => {
    const studentPhoto = student.photo_url || `https://ui-avatars.com/api/?name=${student.name}&background=e8e8e8&color=555&size=128&bold=true`;
    const schoolLogo = school.school_image_url || defaultLogo;
    const [qrCodeUrl, setQrCodeUrl] = useState('');

    useEffect(() => {
        QRCode.toDataURL(`ID:${student.id}`, { width: 60, margin: 0, color: { dark: '#000', light: '#fff' } }).then(setQrCodeUrl);
    }, [student]);

    return (
        <div style={styles.card}>
            <div style={styles.bgCircle1}></div>
            <div style={styles.bgCircle2}></div>
            
            <div style={styles.content}>
                <div style={styles.header}>
                    <img src={schoolLogo} style={styles.logo} alt="Logo" crossOrigin="anonymous"/>
                    <h1 style={styles.schoolName}>{school.school_name}</h1>
                </div>
                
                <div style={styles.photoContainer}>
                    <img src={studentPhoto} alt="Student" style={styles.photo} crossOrigin="anonymous"/>
                </div>
                
                <h2 style={styles.name}>{student.name}</h2>
                <div style={styles.badge}>{student.class}</div>
                
                <div style={styles.details}>
                    <div style={styles.row}><span style={styles.label}>Roll No:</span> {student.roll_number}</div>
                    <div style={styles.row}><span style={styles.label}>DOB:</span> {student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : 'N/A'}</div>
                    <div style={styles.row}><span style={styles.label}>Contact:</span> {student.mobile}</div>
                </div>
                
                <div style={styles.footer}>
                    {qrCodeUrl && <img src={qrCodeUrl} style={styles.qr} />}
                    <div style={styles.footerText}>
                        <p>Valid for 2024-25</p>
                        <p>Principal Sign</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    card: {
        width: '53.98mm',
        height: '85.6mm',
        backgroundColor: '#fff',
        borderRadius: '12px',
        overflow: 'hidden',
        position: 'relative',
        fontFamily: '"Poppins", sans-serif',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid #f0f0f0'
    },
    bgCircle1: {
        position: 'absolute',
        top: '-30mm',
        left: '-10mm',
        width: '80mm',
        height: '80mm',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
        zIndex: 0
    },
    bgCircle2: {
        position: 'absolute',
        bottom: '-10mm',
        right: '-10mm',
        width: '40mm',
        height: '40mm',
        borderRadius: '50%',
        backgroundColor: '#f3e8ff',
        zIndex: 0
    },
    content: {
        position: 'relative',
        zIndex: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '4mm',
        boxSizing: 'border-box'
    },
    header: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '4mm',
        width: '100%'
    },
    logo: {
        width: '10mm',
        height: '10mm',
        objectFit: 'contain',
        backgroundColor: 'white',
        borderRadius: '50%',
        padding: '1mm',
        marginBottom: '1mm'
    },
    schoolName: {
        color: 'white',
        fontSize: '8pt',
        fontWeight: 'bold',
        textAlign: 'center',
        margin: 0,
        textTransform: 'uppercase',
        width: '100%',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    },
    photoContainer: {
        padding: '1mm',
        backgroundColor: 'white',
        borderRadius: '50%',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    photo: {
        width: '25mm',
        height: '25mm',
        borderRadius: '50%',
        objectFit: 'cover',
        display: 'block'
    },
    name: {
        fontSize: '12pt',
        fontWeight: '800',
        color: '#1f2937',
        margin: '3mm 0 1mm 0',
        textAlign: 'center'
    },
    badge: {
        backgroundColor: '#8b5cf6',
        color: 'white',
        fontSize: '8pt',
        padding: '1mm 4mm',
        borderRadius: '10mm',
        fontWeight: 'bold',
        marginBottom: '4mm'
    },
    details: {
        width: '100%',
        textAlign: 'center',
        marginBottom: 'auto'
    },
    row: {
        fontSize: '8pt',
        marginBottom: '1mm',
        color: '#4b5563'
    },
    label: {
        fontWeight: 'bold',
        color: '#6b7280'
    },
    footer: {
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: '1px dashed #d1d5db',
        paddingTop: '2mm'
    },
    qr: {
        width: '12mm',
        height: '12mm'
    },
    footerText: {
        fontSize: '6pt',
        textAlign: 'right',
        color: '#6b7280'
    }
};
