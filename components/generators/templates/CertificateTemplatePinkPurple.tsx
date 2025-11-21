
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { OwnerProfile } from '../../../types';
import { QualifiedStudent } from '../../../services/pdfService';

interface CertificateTemplateProps extends QualifiedStudent {
    school: OwnerProfile;
    examName: string;
    sessionYear: string;
}

export const CertificateTemplatePinkPurple: React.FC<CertificateTemplateProps> = ({ student, school, division, examName, sessionYear }) => {
    const [qrCodeUrl, setQrCodeUrl] = useState('');

    useEffect(() => {
        QRCode.toDataURL(`${student.name}`, { width: 100, margin: 1 }).then(setQrCodeUrl);
    }, [student]);

    return (
        <div style={styles.page}>
            <div style={styles.blobTop}></div>
            <div style={styles.blobBottom}></div>
            
            <div style={styles.container}>
                <div style={styles.header}>
                    <h1 style={styles.title}>CERTIFICATE</h1>
                    <div style={styles.badge}>OF RECOGNITION</div>
                </div>

                <div style={styles.content}>
                    <p style={styles.text}>The following award is given to</p>
                    <h1 style={styles.name}>{student.name}</h1>
                    <div style={styles.line}></div>
                    <p style={styles.body}>
                        This certificate is awarded to <strong>{student.name}</strong> for her achievement in the 
                        field of education and proves that she is competent in her field.
                    </p>
                </div>

                <div style={styles.footer}>
                    <div style={styles.signature}>
                        <div style={styles.sigImage}></div>
                        <div style={styles.sigLine}></div>
                        <p style={styles.sigName}>KYRIE PETRAKIS</p>
                        <p style={styles.sigTitle}>Company Founder</p>
                    </div>
                    
                    <div style={styles.seal}>
                        {qrCodeUrl && <img src={qrCodeUrl} style={{width:'100%'}} alt="QR"/>}
                    </div>
                </div>
                
                <div style={styles.icon}>🎓</div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    page: { width: '297mm', height: '210mm', backgroundColor: '#fff', position: 'relative', overflow: 'hidden', fontFamily: '"Arial", sans-serif' },
    blobTop: { position: 'absolute', top: '-50mm', right: '-50mm', width: '200mm', height: '200mm', borderRadius: '50%', background: 'linear-gradient(135deg, #2dd4bf 0%, #a855f7 100%)', zIndex: 0, opacity: 0.8 },
    blobBottom: { position: 'absolute', bottom: '-50mm', left: '-50mm', width: '150mm', height: '150mm', borderRadius: '50%', background: 'linear-gradient(135deg, #d946ef 0%, #8b5cf6 100%)', zIndex: 0, opacity: 0.8 },
    container: { position: 'relative', zIndex: 1, width: '100%', height: '100%', padding: '20mm', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' },
    header: { textAlign: 'right', marginBottom: '15mm' },
    title: { fontSize: '48pt', fontWeight: '900', color: '#2e1065', margin: 0, letterSpacing: '2px' },
    badge: { backgroundColor: '#a855f7', color: 'white', display: 'inline-block', padding: '5px 20px', fontSize: '16pt', fontWeight: 'bold', letterSpacing: '2px', transform: 'skewX(-10deg)' },
    content: { textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
    text: { fontSize: '14pt', color: '#701a75' },
    name: { fontSize: '42pt', fontFamily: '"Great Vibes", cursive', color: '#4c1d95', margin: '5mm 0' },
    line: { width: '100mm', height: '2px', backgroundColor: '#e879f9', margin: '0 auto 10mm' },
    body: { fontSize: '12pt', color: '#4b5563', maxWidth: '180mm', lineHeight: 1.6 },
    footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '80%', alignSelf: 'center' },
    signature: { textAlign: 'center' },
    sigImage: { height: '30px', marginBottom: '5px' }, // Placeholder for signature image
    sigLine: { width: '60mm', height: '1px', backgroundColor: '#000', marginBottom: '2mm' },
    sigName: { fontWeight: 'bold', fontSize: '12pt', margin: 0 },
    sigTitle: { fontSize: '10pt', color: '#666', margin: 0 },
    seal: { width: '70px', height: '70px', border: '4px solid #fbbf24', borderRadius: '50%', padding: '2px', backgroundColor: 'white' },
    icon: { position: 'absolute', bottom: '15mm', right: '15mm', fontSize: '24pt', color: '#fff', backgroundColor: '#333', borderRadius: '50%', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }
};
