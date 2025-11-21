
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { OwnerProfile } from '../../../types';
import { QualifiedStudent } from '../../../services/pdfService';

interface CertificateTemplateProps extends QualifiedStudent {
    school: OwnerProfile;
    examName: string;
    sessionYear: string;
}

export const CertificateTemplateGeometricPurple: React.FC<CertificateTemplateProps> = ({ student, school, division, examName, sessionYear }) => {
    const [qrCodeUrl, setQrCodeUrl] = useState('');

    useEffect(() => {
        QRCode.toDataURL(`${student.name}-${division}`, { width: 100, margin: 1, color: { dark: '#1e1b4b' } }).then(setQrCodeUrl);
    }, [student]);

    return (
        <div style={styles.page}>
            <div style={styles.bg}>
                <div style={styles.corner}></div>
                <div style={styles.border}>
                    <div style={styles.content}>
                        <h1 style={styles.title}>CERTIFICATE</h1>
                        <p style={styles.subtitle}>OF PARTICIPATION</p>

                        <p style={styles.text}>WE ARE PROUDLY PRESENT THIS TO</p>

                        <h1 style={styles.name}>{student.name}</h1>
                        <div style={styles.divider}></div>

                        <p style={styles.body}>
                            We give this certificate because <strong>{student.name}</strong> has demonstrated excellence in <strong>{examName}</strong> 
                            securing <strong>{division}</strong> for the year {sessionYear}.
                        </p>

                        <div style={styles.footer}>
                            <div style={styles.sig}>
                                <p style={styles.sigName}>{school.principal_name}</p>
                                <div style={styles.line}></div>
                                <p style={styles.label}>President</p>
                            </div>
                            
                            <div style={styles.sealContainer}>
                                <div style={styles.seal}>
                                    {qrCodeUrl && <img src={qrCodeUrl} style={styles.qr} alt="QR"/>}
                                </div>
                            </div>

                            <div style={styles.sig}>
                                <p style={styles.sigName}>{new Date().toLocaleDateString()}</p>
                                <div style={styles.line}></div>
                                <p style={styles.label}>Date</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    page: { width: '297mm', height: '210mm', backgroundColor: '#e2e8f0', padding: '10mm', boxSizing: 'border-box', fontFamily: '"Montserrat", sans-serif' },
    bg: { backgroundColor: '#fff', width: '100%', height: '100%', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' },
    corner: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(135deg, #1e1b4b 15%, transparent 15%, transparent 85%, #1e1b4b 85%)', zIndex: 0 },
    border: { position: 'absolute', top: '15mm', left: '15mm', right: '15mm', bottom: '15mm', border: '2px solid #94a3b8', zIndex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' },
    content: { textAlign: 'center', width: '80%' },
    title: { fontSize: '42pt', letterSpacing: '5px', margin: 0, color: '#1e1b4b', fontWeight: '300' },
    subtitle: { fontSize: '12pt', letterSpacing: '3px', margin: '5px 0 15mm', color: '#64748b' },
    text: { fontSize: '10pt', letterSpacing: '2px', fontWeight: 'bold', color: '#1e1b4b', marginBottom: '5mm' },
    name: { fontSize: '36pt', fontFamily: '"Great Vibes", cursive', color: '#1e1b4b', margin: '5mm 0' },
    divider: { width: '100px', height: '2px', backgroundColor: '#1e1b4b', margin: '0 auto 10mm' },
    body: { fontSize: '12pt', color: '#475569', lineHeight: 1.6, marginBottom: '15mm' },
    footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
    sig: { textAlign: 'center', width: '50mm' },
    sigName: { fontSize: '12pt', fontWeight: 'bold', color: '#1e1b4b', marginBottom: '2mm' },
    line: { borderBottom: '1px solid #1e1b4b', marginBottom: '2mm' },
    label: { fontSize: '9pt', color: '#64748b' },
    sealContainer: { position: 'relative' },
    seal: { width: '70px', height: '70px', borderRadius: '50%', backgroundColor: '#1e1b4b', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
    qr: { width: '50px', height: '50px', backgroundColor: '#fff', padding: '2px' }
};
