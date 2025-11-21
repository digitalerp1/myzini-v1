
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { OwnerProfile } from '../../../types';
import { QualifiedStudent } from '../../../services/pdfService';

interface CertificateTemplateProps extends QualifiedStudent {
    school: OwnerProfile;
    examName: string;
    sessionYear: string;
}

export const CertificateTemplateWave: React.FC<CertificateTemplateProps> = ({ student, school, division, examName, sessionYear }) => {
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const studentPhoto = student.photo_url || `https://ui-avatars.com/api/?name=${student.name}&background=e8e8e8&color=555&size=128&bold=true`;
    const schoolLogo = school.school_image_url;

    useEffect(() => {
        QRCode.toDataURL(`${student.name}-${division}`, { width: 100, margin: 1 }).then(setQrCodeUrl);
    }, [student]);

    return (
        <div style={styles.page}>
            <div style={styles.wave}></div>
            
            <div style={styles.content}>
                <div style={styles.header}>
                    {schoolLogo && <img src={schoolLogo} style={styles.logo} crossOrigin="anonymous" alt="Logo"/>}
                    <h1 style={styles.schoolName}>{school.school_name}</h1>
                </div>

                <h2 style={styles.title}>CERTIFICATE OF MERIT</h2>
                
                <div style={styles.body}>
                    <img src={studentPhoto} style={styles.photo} crossOrigin="anonymous" alt="Student"/>
                    <p style={styles.text}>This certificate is proudly presented to</p>
                    <h1 style={styles.name}>{student.name}</h1>
                    <p style={styles.desc}>
                        For achieving <strong>{division}</strong> in <strong>{examName}</strong><br/>
                        Academic Year: {sessionYear}
                    </p>
                </div>

                <div style={styles.footer}>
                    <div style={styles.sig}>
                        <div style={styles.line}></div>
                        <p>Authorized Signature</p>
                    </div>
                    {qrCodeUrl && <img src={qrCodeUrl} style={styles.qr} alt="QR"/>}
                    <div style={styles.sig}>
                        <div style={styles.line}></div>
                        <p>Date</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    page: { width: '297mm', height: '210mm', backgroundColor: '#fff', position: 'relative', overflow: 'hidden', fontFamily: '"Trebuchet MS", sans-serif' },
    wave: { position: 'absolute', bottom: 0, left: 0, width: '100%', height: '30%', background: 'linear-gradient(180deg, rgba(6,182,212,0) 0%, rgba(6,182,212,0.2) 100%)', clipPath: 'polygon(0 20%, 100% 0, 100% 100%, 0% 100%)', zIndex: 0 },
    content: { position: 'relative', zIndex: 1, width: '100%', height: '100%', padding: '15mm', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    header: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '10mm' },
    logo: { width: '60px', height: '60px', objectFit: 'contain', marginBottom: '5px' },
    schoolName: { fontSize: '22pt', fontWeight: 'bold', color: '#0e7490', margin: 0 },
    title: { fontSize: '32pt', color: '#155e75', letterSpacing: '3px', marginBottom: '10mm', borderBottom: '2px solid #06b6d4', paddingBottom: '2mm' },
    body: { textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' },
    photo: { width: '90px', height: '90px', borderRadius: '50%', border: '4px solid #06b6d4', objectFit: 'cover', marginBottom: '5mm' },
    text: { fontSize: '14pt', color: '#666', margin: 0 },
    name: { fontSize: '36pt', fontWeight: 'bold', color: '#111', margin: '5mm 0' },
    desc: { fontSize: '16pt', color: '#444', lineHeight: 1.5 },
    footer: { width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto' },
    sig: { width: '60mm', textAlign: 'center' },
    line: { borderBottom: '1px solid #000', marginBottom: '2mm' },
    qr: { width: '60px', height: '60px', backgroundColor: 'white', padding: '2px' }
};
