
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { OwnerProfile } from '../../../types';
import { QualifiedStudent } from '../../../services/pdfService';

interface CertificateTemplateProps extends QualifiedStudent {
    school: OwnerProfile;
    examName: string;
    sessionYear: string;
}

export const CertificateTemplateBlueGold: React.FC<CertificateTemplateProps> = ({ student, school, division, examName, sessionYear }) => {
    const [qrCodeUrl, setQrCodeUrl] = useState('');

    useEffect(() => {
        QRCode.toDataURL(`${student.name}`, { width: 100, margin: 1 }).then(setQrCodeUrl);
    }, [student]);

    return (
        <div style={styles.page}>
            {/* Corner Graphics */}
            <div style={styles.cornerTopLeft}></div>
            <div style={styles.cornerBottomRight}></div>
            <div style={styles.cornerTopRight}></div>
            <div style={styles.cornerBottomLeft}></div>

            <div style={styles.content}>
                <div style={styles.header}>
                    <h1 style={styles.title}>CERTIFICATE</h1>
                    <p style={styles.subtitle}>Of Achievement</p>
                    <p style={styles.present}>This Certificate is Proudly Presented To</p>
                </div>

                <h1 style={styles.name}>{student.name}</h1>

                <p style={styles.body}>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut 
                    labore et dolore magna aliqua. Secured <strong>{division}</strong> in <strong>{examName}</strong> ({sessionYear}).
                </p>

                <div style={styles.footer}>
                    <div style={styles.sig}>
                        <p style={styles.sigName}>{school.principal_name}</p>
                        <div style={styles.line}></div>
                        <p style={styles.label}>Principal</p>
                    </div>
                    
                    <div style={styles.badge}>
                        <div style={styles.ribbon}></div>
                        {qrCodeUrl && <img src={qrCodeUrl} style={styles.qr} alt="QR"/>}
                    </div>

                    <div style={styles.sig}>
                        <p style={styles.sigName}>Admin</p>
                        <div style={styles.line}></div>
                        <p style={styles.label}>Chairman</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    page: { width: '297mm', height: '210mm', backgroundColor: '#fff', position: 'relative', overflow: 'hidden', fontFamily: '"Cinzel", serif' },
    cornerTopLeft: { position: 'absolute', top: '-50px', left: '-50px', width: '150px', height: '150px', border: '20px solid #1e3a8a', borderRightColor: 'transparent', borderBottomColor: 'transparent', borderRadius: '50%' },
    cornerTopRight: { position: 'absolute', top: 0, right: 0, width: '0', height: '0', borderStyle: 'solid', borderWidth: '0 120px 120px 0', borderColor: 'transparent #b45309 transparent transparent' },
    cornerBottomLeft: { position: 'absolute', bottom: 0, left: 0, width: '200px', height: '150px', background: '#1e3a8a', clipPath: 'ellipse(100% 100% at 0% 100%)' },
    cornerBottomRight: { position: 'absolute', bottom: 0, right: 0, width: '300px', height: '200px', background: 'linear-gradient(135deg, transparent 30%, #1e3a8a 30%)' },
    content: { position: 'relative', zIndex: 1, width: '100%', height: '100%', padding: '20mm', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' },
    header: { marginBottom: '10mm' },
    title: { fontSize: '48pt', fontWeight: 'bold', color: '#1e3a8a', margin: 0, letterSpacing: '5px' },
    subtitle: { fontSize: '16pt', color: '#4b5563', margin: '2mm 0 10mm' },
    present: { fontSize: '12pt', color: '#6b7280' },
    name: { fontSize: '42pt', fontFamily: '"Great Vibes", cursive', color: '#1f2937', margin: '5mm 0 10mm' },
    body: { fontSize: '12pt', color: '#4b5563', maxWidth: '180mm', lineHeight: 1.6, marginBottom: 'auto' },
    footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '80%' },
    sig: { textAlign: 'center', width: '50mm' },
    sigName: { fontSize: '14pt', fontWeight: 'bold', marginBottom: '2mm' },
    line: { borderBottom: '2px solid #1e3a8a', marginBottom: '2mm' },
    label: { fontSize: '10pt', fontWeight: 'bold', color: '#1e3a8a' },
    badge: { position: 'relative', marginBottom: '5mm' },
    qr: { width: '60px', height: '60px', border: '2px solid #b45309', padding: '2px', borderRadius: '50%' },
    ribbon: { position: 'absolute', bottom: '-10px', left: '50%', transform: 'translateX(-50%)', width: '30px', height: '40px', backgroundColor: '#b45309', zIndex: -1 }
};
