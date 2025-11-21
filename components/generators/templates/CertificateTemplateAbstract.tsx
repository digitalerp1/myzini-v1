
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { OwnerProfile } from '../../../types';
import { QualifiedStudent } from '../../../services/pdfService';

interface CertificateTemplateProps extends QualifiedStudent {
    school: OwnerProfile;
    examName: string;
    sessionYear: string;
}

export const CertificateTemplateAbstract: React.FC<CertificateTemplateProps> = ({ student, school, division, examName, sessionYear }) => {
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const studentPhoto = student.photo_url || `https://ui-avatars.com/api/?name=${student.name}&background=e8e8e8&color=555&size=128&bold=true`;
    const schoolLogo = school.school_image_url;

    useEffect(() => {
        QRCode.toDataURL(`${student.name}-${division}`, { width: 100, margin: 1 }).then(setQrCodeUrl);
    }, [student]);

    return (
        <div style={styles.page}>
            <div style={styles.blobTop}></div>
            <div style={styles.blobBottom}></div>
            
            <div style={styles.container}>
                <div style={styles.header}>
                    {schoolLogo && <img src={schoolLogo} style={styles.logo} crossOrigin="anonymous" alt="Logo"/>}
                    <h1 style={styles.schoolName}>{school.school_name}</h1>
                </div>

                <h2 style={styles.title}>CERTIFICATE</h2>
                <p style={styles.subtitle}>OF APPRECIATION</p>

                <div style={styles.body}>
                    <div style={styles.photoWrapper}>
                        <img src={studentPhoto} style={styles.photo} crossOrigin="anonymous" alt="Student"/>
                    </div>
                    <div style={styles.details}>
                        <p style={styles.present}>PRESENTED TO</p>
                        <h1 style={styles.name}>{student.name}</h1>
                        <p style={styles.desc}>
                            For exceptional performance in <strong>{examName}</strong> <br/>
                            securing <strong>{division}</strong> in {sessionYear}.
                        </p>
                    </div>
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
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    page: { width: '297mm', height: '210mm', backgroundColor: '#fff', position: 'relative', overflow: 'hidden', fontFamily: '"Open Sans", sans-serif' },
    blobTop: { position: 'absolute', top: '-50mm', left: '-50mm', width: '150mm', height: '150mm', backgroundColor: '#c4b5fd', borderRadius: '50%', zIndex: 0, opacity: 0.5 },
    blobBottom: { position: 'absolute', bottom: '-50mm', right: '-50mm', width: '200mm', height: '200mm', backgroundColor: '#a78bfa', borderRadius: '50%', zIndex: 0, opacity: 0.3 },
    container: { position: 'relative', zIndex: 1, width: '100%', height: '100%', padding: '15mm', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    header: { display: 'flex', alignItems: 'center', gap: '10px', alignSelf: 'flex-start', marginBottom: '10mm' },
    logo: { width: '40px', height: '40px', objectFit: 'contain' },
    schoolName: { fontSize: '16pt', fontWeight: 'bold', color: '#4c1d95', margin: 0 },
    title: { fontSize: '40pt', fontWeight: '900', letterSpacing: '5px', margin: 0, color: '#5b21b6' },
    subtitle: { fontSize: '14pt', letterSpacing: '3px', color: '#6d28d9', marginBottom: '10mm' },
    body: { display: 'flex', alignItems: 'center', gap: '20mm', width: '100%', justifyContent: 'center' },
    photoWrapper: { padding: '5px', border: '2px dashed #8b5cf6', borderRadius: '50%' },
    photo: { width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' },
    details: { textAlign: 'left' },
    present: { fontSize: '12pt', color: '#6b7280', margin: 0 },
    name: { fontSize: '32pt', fontWeight: 'bold', color: '#111827', margin: '5px 0' },
    desc: { fontSize: '14pt', color: '#374151', lineHeight: 1.5 },
    footer: { width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto' },
    sig: { width: '60mm', textAlign: 'center' },
    line: { borderBottom: '2px solid #4c1d95', marginBottom: '2mm' },
    qr: { width: '60px', height: '60px' }
};
