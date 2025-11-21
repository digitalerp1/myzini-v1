
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { OwnerProfile } from '../../../types';
import { QualifiedStudent } from '../../../services/pdfService';

interface CertificateTemplateProps extends QualifiedStudent {
    school: OwnerProfile;
    examName: string;
    sessionYear: string;
}

export const CertificateTemplateModernRed: React.FC<CertificateTemplateProps> = ({ student, school, division, examName, sessionYear }) => {
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const studentPhoto = student.photo_url || `https://ui-avatars.com/api/?name=${student.name}&background=e8e8e8&color=555&size=128&bold=true`;
    const schoolLogo = school.school_image_url;

    useEffect(() => {
        QRCode.toDataURL(`${student.name}-${division}`, { width: 100, margin: 1 }).then(setQrCodeUrl);
    }, [student]);

    return (
        <div style={styles.page}>
            <div style={styles.barTop}></div>
            <div style={styles.container}>
                <div style={styles.header}>
                    <div style={{flex:1}}>
                        <h1 style={styles.schoolName}>{school.school_name}</h1>
                        <p style={styles.address}>{school.address}</p>
                    </div>
                    {schoolLogo && <img src={schoolLogo} style={styles.logo} crossOrigin="anonymous" alt="Logo"/>}
                </div>

                <div style={styles.body}>
                    <h2 style={styles.title}>CERTIFICATE</h2>
                    <p style={styles.subtitle}>OF EXCELLENCE</p>
                    
                    <div style={styles.studentSection}>
                        <img src={studentPhoto} style={styles.photo} crossOrigin="anonymous" alt="Student"/>
                        <div>
                            <p style={styles.label}>Awarded to</p>
                            <h1 style={styles.name}>{student.name}</h1>
                        </div>
                    </div>

                    <p style={styles.text}>
                        In recognition of outstanding success in <strong>{examName}</strong><br/>
                        securing <strong>{division}</strong> ({sessionYear}).
                    </p>
                </div>

                <div style={styles.footer}>
                    <div style={styles.sig}>
                        <div style={styles.line}></div>
                        <p>Principal</p>
                    </div>
                    {qrCodeUrl && <img src={qrCodeUrl} style={styles.qr} alt="QR"/>}
                    <div style={styles.sig}>
                        <div style={styles.line}></div>
                        <p>Date</p>
                    </div>
                </div>
            </div>
            <div style={styles.barBottom}></div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    page: { width: '297mm', height: '210mm', backgroundColor: '#fff', position: 'relative', fontFamily: '"Arial", sans-serif', display: 'flex', flexDirection: 'column' },
    barTop: { height: '15mm', backgroundColor: '#dc2626', width: '100%' },
    barBottom: { height: '15mm', backgroundColor: '#dc2626', width: '100%', marginTop: 'auto' },
    container: { padding: '10mm 20mm', flex: 1, display: 'flex', flexDirection: 'column' },
    header: { display: 'flex', alignItems: 'center', marginBottom: '10mm' },
    schoolName: { fontSize: '20pt', fontWeight: 'bold', color: '#dc2626', margin: 0 },
    address: { fontSize: '10pt', color: '#666' },
    logo: { width: '50px', height: '50px', objectFit: 'contain' },
    body: { textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' },
    title: { fontSize: '36pt', fontWeight: '900', letterSpacing: '5px', margin: 0, color: '#111' },
    subtitle: { fontSize: '14pt', letterSpacing: '3px', color: '#dc2626', marginBottom: '10mm' },
    studentSection: { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '10mm' },
    photo: { width: '70px', height: '70px', borderRadius: '50%', border: '3px solid #dc2626', objectFit: 'cover' },
    label: { fontSize: '12pt', color: '#666', margin: 0, textAlign: 'left' },
    name: { fontSize: '30pt', fontWeight: 'bold', color: '#111', margin: 0 },
    text: { fontSize: '14pt', color: '#333', lineHeight: 1.5 },
    footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto' },
    sig: { width: '60mm', textAlign: 'center' },
    line: { borderBottom: '1px solid #000', marginBottom: '2mm' },
    qr: { width: '60px', height: '60px' }
};
