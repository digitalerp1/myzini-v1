import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Student, OwnerProfile } from '../../../types';

interface IdCardTemplateProps {
    student: Student;
    school: OwnerProfile;
}

const defaultLogo = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2ZmZiI+PHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgMThjLTQuNDEgMC04LTMuNTktOC04czMuNTktOCA4LTggOCAzLjU5IDggOC0zLjU5IDgtOCA4em0tMS0xNGgydjZoLTJWM2gxdi0yaC0ydi0xaDJ2LTFoLTJ2LTFoMnYtMWgtMnYtMWgydi0xaC0ydjJoLTF2LTJoLTF2Mkg5djJoMXYtMmgydjJoMXYtMmgxdi0yaDF2MmgxVjZIMTB2MWgxdjFoMVY4aDF2MWgtMVY5aC0xdjFoMVY5aDF2MWgtMVY5aC0xdjFoMVY5aDF2MWgtMVY5aC0xdjFoMVY5aDF2MWgtMVY5aC0xdjFoMVY5aDF2MWgtMVY5aC0xdjFoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVYY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aCg==</path></svg>";

export const IdCardTemplateModern: React.FC<IdCardTemplateProps> = ({ student, school }) => {
    const studentPhoto = student.photo_url || `https://ui-avatars.com/api/?name=${student.name}&background=e8e8e8&color=555&size=128&bold=true`;
    const schoolLogo = school.school_image_url || defaultLogo;
    const [qrCodeUrl, setQrCodeUrl] = useState('');

    useEffect(() => {
        const generateQrCode = async () => {
            const qrData = `Student: ${student.name}, Class: ${student.class}, Roll: ${student.roll_number}`;
            try {
                const url = await QRCode.toDataURL(qrData, {
                    errorCorrectionLevel: 'M',
                    width: 120,
                    margin: 1,
                });
                setQrCodeUrl(url);
            } catch (err) {
                console.error('Failed to generate QR code', err);
            }
        };
        generateQrCode();
    }, [student]);

    return (
        <div style={styles.card}>
            <div style={styles.header}>
                <img src={schoolLogo} alt="School Logo" style={styles.logo} crossOrigin="anonymous"/>
                <div style={styles.schoolInfo}>
                    <h1 style={styles.schoolName}>{school.school_name}</h1>
                    <p style={styles.schoolAddress}>{school.address}</p>
                </div>
            </div>
            
            <div style={styles.content}>
                <img src={studentPhoto} alt="Student" style={styles.studentPhoto} crossOrigin="anonymous"/>
                <h2 style={styles.studentName}>{student.name}</h2>
                <p style={styles.studentClass}>
                    <span>Class: {student.class}</span>
                    <span style={{ margin: '0 8px' }}>|</span>
                    <span>Roll No: {student.roll_number}</span>
                </p>
                
                <div style={styles.infoSection}>
                    <DetailRow label="Father's Name" value={student.father_name} />
                    <DetailRow label="Mobile No" value={student.mobile} />
                    <DetailRow label="Date of Birth" value={student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : 'N/A'} />
                    <DetailRow label="Address" value={student.address} />
                </div>
            </div>
            
            <div style={styles.footer}>
                {qrCodeUrl ? <img src={qrCodeUrl} alt="QR Code" style={styles.qrCode} /> : <div style={styles.qrCodePlaceholder}></div>}
                <p style={styles.footerText}>This card is the property of the school and must be returned upon request.</p>
            </div>
        </div>
    );
};

const DetailRow: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => (
    <div style={styles.detailRow}>
        <p style={styles.detailLabel}>{label}</p>
        <p style={styles.detailValue}>{value || 'N/A'}</p>
    </div>
);

const styles: { [key: string]: React.CSSProperties } = {
    card: {
        width: '53.98mm',
        height: '85.6mm',
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '10px',
        fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxSizing: 'border-box',
    },
    header: {
        backgroundColor: '#4f46e5',
        color: 'white',
        padding: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    logo: {
        width: '30px',
        height: '30px',
        borderRadius: '50%',
        objectFit: 'cover',
        flexShrink: 0,
        backgroundColor: 'white',
        padding: '2px',
    },
    schoolInfo: {
        lineHeight: '1.2',
        overflow: 'hidden',
    },
    schoolName: {
        fontSize: '11px',
        fontWeight: 'bold',
        margin: 0,
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
    },
    schoolAddress: {
        fontSize: '7px',
        margin: 0,
        opacity: 0.9,
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
    },
    content: {
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '8px',
        textAlign: 'center',
    },
    studentPhoto: {
        width: '65px',
        height: '65px',
        borderRadius: '50%',
        border: '3px solid #4f46e5',
        objectFit: 'cover',
        marginTop: '5px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    },
    studentName: {
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#111827',
        margin: '8px 0 2px 0',
    },
    studentClass: {
        fontSize: '10px',
        color: '#4b5563',
        margin: '0 0 10px 0',
        fontWeight: '500'
    },
    infoSection: {
        width: '100%',
        textAlign: 'left',
        marginTop: 'auto',
    },
    detailRow: {
        fontSize: '8.5px',
        marginBottom: '4px',
    },
    detailLabel: {
        fontWeight: 'bold',
        color: '#374151',
        margin: '0',
    },
    detailValue: {
        color: '#4b5563',
        margin: '0',
        wordBreak: 'break-word',
    },
    footer: {
        backgroundColor: '#f3f4f6',
        padding: '5px',
        textAlign: 'center',
        marginTop: 'auto',
    },
    qrCode: {
        width: '45px',
        height: '45px',
        display: 'block',
        margin: '0 auto 4px auto'
    },
    qrCodePlaceholder: {
        width: '45px',
        height: '45px',
        backgroundColor: '#e5e7eb',
        margin: '0 auto 4px auto'
    },
    footerText: {
        fontSize: '6px',
        color: '#6b7280',
        lineHeight: 1.3,
        margin: 0
    },
};