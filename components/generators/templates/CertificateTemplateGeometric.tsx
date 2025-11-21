
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { OwnerProfile } from '../../../types';
import { QualifiedStudent } from '../../../services/pdfService';

interface CertificateTemplateProps extends QualifiedStudent {
    school: OwnerProfile;
    examName: string;
    sessionYear: string;
}

export const CertificateTemplateGeometric: React.FC<CertificateTemplateProps> = ({ student, school, division, examName, sessionYear }) => {
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const studentPhoto = student.photo_url || `https://ui-avatars.com/api/?name=${student.name}&background=e8e8e8&color=555&size=128&bold=true`;
    const schoolLogo = school.school_image_url;

    useEffect(() => {
        QRCode.toDataURL(`${student.name}-${division}`, { width: 100, margin: 1 }).then(setQrCodeUrl);
    }, [student]);

    return (
        <div style={styles.page}>
            <div style={styles.polyLeft}></div>
            <div style={styles.polyRight}></div>
            
            <div style={styles.content}>
                <div style={styles.header}>
                    {schoolLogo && <img src={schoolLogo} style={styles.logo} crossOrigin="anonymous" alt="School"/>}
                    <h1 style={styles.schoolName}>{school.school_name}</h1>
                </div>

                <div style={styles.main}>
                    <h2 style={styles.title}>CERTIFICATE OF EXCELLENCE</h2>
                    <p style={styles.text}>PROUDLY PRESENTED TO</p>
                    
                    <div style={styles.profile}>
                        <img src={studentPhoto} style={styles.photo} crossOrigin="anonymous" alt="Student"/>
                        <h1 style={styles.name}>{student.name}</h1>
                    </div>

                    <p style={styles.desc}>
                        For their brilliant performance in <strong>{examName}</strong>,<br/>
                        securing the <strong>{division}</strong> in the year {sessionYear}.
                    </p>
                </div>

                <div style={styles.footer}>
                    <div style={styles.sig}>
                        <div style={styles.line}></div>
                        <span>Principal</span>
                    </div>
                    <div style={styles.qrBox}>
                        {qrCodeUrl && <img src={qrCodeUrl} style={styles.qr} alt="QR"/>}
                    </div>
                    <div style={styles.sig}>
                        <div style={styles.line}></div>
                        <span>Date</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    page: { width: '297mm', height: '210mm', backgroundColor: '#f3f4f6', padding: '0', boxSizing: 'border-box', fontFamily: '"Segoe UI", sans-serif', position: 'relative', overflow: 'hidden' },
    polyLeft: { position: 'absolute', top: 0, left: 0, width: '100mm', height: '100%', background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', clipPath: 'polygon(0 0, 100% 0, 60% 100%, 0% 100%)', zIndex: 0 },
    polyRight: { position: 'absolute', bottom: 0, right: 0, width: '80mm', height: '80mm', background: '#fbbf24', clipPath: 'polygon(100% 0, 0% 100%, 100% 100%)', zIndex: 0 },
    content: { position: 'relative', zIndex: 1, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '15mm' },
    header: { display: 'flex', alignItems: 'center', marginBottom: '10mm', color: 'white' },
    logo: { width: '50px', height: '50px', backgroundColor: 'white', borderRadius: '50%', padding: '2px', marginRight: '10px' },
    schoolName: { fontSize: '20pt', fontWeight: 'bold', margin: 0, textTransform: 'uppercase' },
    main: { flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: '32pt', fontWeight: '900', color: '#1e3a8a', letterSpacing: '2px', margin: '0 0 5mm' },
    text: { fontSize: '12pt', color: '#6b7280', letterSpacing: '4px' },
    profile: { margin: '10mm 0', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    photo: { width: '80px', height: '80px', borderRadius: '50%', border: '4px solid #fbbf24', marginBottom: '5mm' },
    name: { fontSize: '36pt', color: '#111827', margin: 0, borderBottom: '3px solid #fbbf24' },
    desc: { fontSize: '14pt', color: '#4b5563', lineHeight: 1.6, maxWidth: '200mm' },
    footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '80%', alignSelf: 'center', marginBottom: '5mm' },
    sig: { textAlign: 'center', width: '50mm' },
    line: { borderBottom: '2px solid #1e3a8a', marginBottom: '2mm' },
    qrBox: { padding: '5px', backgroundColor: 'white', borderRadius: '5px' },
    qr: { width: '60px', height: '60px' }
};
