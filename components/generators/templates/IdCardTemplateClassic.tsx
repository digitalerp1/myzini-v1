import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Student, OwnerProfile } from '../../../types';

interface IdCardTemplateProps {
    student: Student;
    school: OwnerProfile;
}

const defaultLogo = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2NmZDNkZCI+PHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgMThjLTQuNDEgMC04LTMuNTktOC04czMuNTktOCA4LTggOCAzLjU5IDggOC0zLjU5IDgtOCA4em0tMS0xNGgydjZoLTJWM2gxdi0yaC0ydi0xaDJ2LTFoLTJ2LTFoMnYtMWgtMnYtMWgydi0xaC0ydjJoLTF2LTJoLTF2Mkg5djJoMXYtMmgydjJoMXYtMmgxdi0yaDF2MmgxVjZIMTB2MWgxdjFoMVY4aDF2MWgtMVY5aC0xdjFoMVY5aDF2MWgtMVY5aC0xdjFoMVY5aDF2MWgtMVY5aC0xdjFoMVY5aDF2MWgtMVY5aC0xdjFoMVY5aDF2MWgtMVY5aC0xdjFoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC-xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVYY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aC0xdjJoMVY5aDF2MWgtMVY5aCg==</path></svg>";

export const IdCardTemplateClassic: React.FC<IdCardTemplateProps> = ({ student, school }) => {
    const studentPhoto = student.photo_url || `https://ui-avatars.com/api/?name=${student.name}&background=e8e8e8&color=555&size=128&bold=true`;
    const schoolLogo = school.school_image_url || defaultLogo;
    const [qrCodeUrl, setQrCodeUrl] = useState('');

    useEffect(() => {
        const generateQrCode = async () => {
            const studentInfo = {
                Name: student.name,
                Class: student.class,
                Roll: student.roll_number,
                "Father's Name": student.father_name,
                Mobile: student.mobile,
            };
            const qrData = JSON.stringify(studentInfo);
            try {
                const url = await QRCode.toDataURL(qrData, {
                    errorCorrectionLevel: 'M',
                    width: 80,
                    margin: 1,
                    color: { dark: '#000000', light: '#FFFFFF' }
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
                
                <div style={styles.detailsContainer}>
                    <div style={styles.qrSection}>
                        {qrCodeUrl ? <img src={qrCodeUrl} alt="QR Code" style={styles.qrCode} /> : <div style={styles.qrCodePlaceholder}></div>}
                    </div>
                    <div style={styles.infoSection}>
                        <DetailRow label="Class" value={student.class} />
                        <DetailRow label="Roll No" value={student.roll_number} />
                        <DetailRow label="D.O.B" value={student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : 'N/A'} />
                        <DetailRow label="Mobile" value={student.mobile} />
                        <DetailRow label="Father's Name" value={student.father_name} />
                    </div>
                </div>
            </div>
            <div style={styles.footer}>
                <p style={styles.footerText}>Student Identity Card</p>
                <p style={styles.websiteText}>{school.website || ''}</p>
            </div>
        </div>
    );
};

const DetailRow: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => (
    <div style={styles.detailRow}>
        <p style={styles.detailLabel}>{label}</p>
        <p style={styles.detailValue}>: {value || 'N/A'}</p>
    </div>
);


const styles: { [key: string]: React.CSSProperties } = {
    card: {
        width: '85.6mm',
        height: '53.98mm',
        backgroundColor: '#fdfdff',
        border: '1px solid #dee2e6',
        borderRadius: '10px',
        fontFamily: '"Segoe UI", Arial, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxSizing: 'border-box',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    },
    header: {
        backgroundColor: '#4f46e5',
        color: 'white',
        padding: '5px 8px',
        display: 'flex',
        alignItems: 'center',
        borderBottom: '2px solid #4338ca',
    },
    logo: {
        width: '35px',
        height: '35px',
        borderRadius: '50%',
        marginRight: '8px',
        objectFit: 'cover',
        backgroundColor: 'white',
        padding: '2px'
    },
    schoolInfo: { lineHeight: '1.2', flex: 1, overflow: 'hidden' },
    schoolName: { fontSize: '12px', fontWeight: 'bold', margin: 0, textShadow: '1px 1px 2px rgba(0,0,0,0.2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    schoolAddress: { fontSize: '7px', margin: 0, opacity: 0.9, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    content: {
        padding: '5px',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    studentPhoto: {
        width: '50px',
        height: '50px',
        borderRadius: '8px',
        border: '3px solid #4f46e5',
        objectFit: 'cover',
        marginTop: '2px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
    },
    studentName: {
        fontSize: '13px',
        fontWeight: 'bold',
        color: '#111827',
        margin: '3px 0',
        textAlign: 'center',
    },
    detailsContainer: {
        display: 'flex',
        width: '100%',
        marginTop: '2px',
        alignItems: 'center',
    },
    qrSection: {
        padding: '0 5px',
        flexShrink: 0,
    },
    qrCode: {
        width: '45px',
        height: '45px',
    },
    qrCodePlaceholder: {
        width: '45px',
        height: '45px',
        backgroundColor: '#f0f0f0',
    },
    infoSection: {
        flex: 1,
        paddingLeft: '5px',
        overflow: 'hidden',
    },
    detailRow: {
        display: 'flex',
        fontSize: '8px',
        lineHeight: 1.25,
        alignItems: 'flex-start',
    },
    detailLabel: {
        fontWeight: 'bold',
        color: '#4b5563',
        margin: 0,
        width: '50px',
        flexShrink: 0,
    },
    detailValue: {
        color: '#1f2937',
        margin: 0,
        flex: 1,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    footer: {
        backgroundColor: '#4f46e5',
        color: 'white',
        textAlign: 'center',
        padding: '2px',
        fontSize: '8px',
        fontWeight: '500',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerText: { margin: '0 0 0 8px' },
    websiteText: { margin: '0 8px 0 0', fontSize: '7px', opacity: 0.8 }
};