
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { OwnerProfile } from '../../../types';
import { QualifiedStudent } from '../../../services/pdfService';

interface CertificateTemplateProps extends QualifiedStudent {
    school: OwnerProfile;
    examName: string;
    sessionYear: string;
}

const ornament = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0iI2Q0YWYzNyI+PHBhdGggZD0iTTAgMGw1MCAwIDAgNTAgLTUuMiAtNS4yIDAgLTM5LjYgLTM5LjYgMCAwIC01LjIgeiIvPjwvc3ZnPg==";

export const CertificateTemplateOrnateGold: React.FC<CertificateTemplateProps> = ({ student, school, division, examName, sessionYear }) => {
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const studentPhoto = student.photo_url;
    const schoolLogo = school.school_image_url;

    useEffect(() => {
        QRCode.toDataURL(`${student.name}-${division}`, { width: 100, margin: 1, color: { dark: '#b45309' } }).then(setQrCodeUrl);
    }, [student]);

    return (
        <div style={styles.page}>
            <div style={styles.border}>
                <div style={styles.innerBorder}>
                    {/* Corners */}
                    <img src={ornament} style={styles.cornerTL} alt="" />
                    <img src={ornament} style={styles.cornerTR} alt="" />
                    <img src={ornament} style={styles.cornerBL} alt="" />
                    <img src={ornament} style={styles.cornerBR} alt="" />

                    <div style={styles.header}>
                        <h1 style={styles.title}>CERTIFICATE</h1>
                        <p style={styles.subtitle}>OF APPRECIATION</p>
                    </div>

                    <p style={styles.text}>This certificate is proudly awarded to</p>

                    <h1 style={styles.name}>{student.name}</h1>

                    <div style={styles.line}></div>

                    <p style={styles.body}>
                        This certificate is given to {student.name} for outstanding achievement in <strong>{examName}</strong>, 
                        securing <strong>{division}</strong> during the academic session {sessionYear}.
                    </p>

                    <div style={styles.footer}>
                        <div style={styles.sig}>
                            <p style={styles.sigText}>{school.principal_name || 'Principal'}</p>
                            <div style={styles.sigLine}></div>
                            <p style={styles.sigLabel}>Principal</p>
                        </div>
                        
                        <div style={styles.sealBox}>
                            {qrCodeUrl && <img src={qrCodeUrl} style={styles.qr} alt="QR"/>}
                            {/* Simulated Gold Seal */}
                            <div style={styles.goldSeal}>
                                <div style={styles.sealInner}></div>
                            </div>
                        </div>

                        <div style={styles.sig}>
                            <p style={styles.sigText}>{new Date().toLocaleDateString()}</p>
                            <div style={styles.sigLine}></div>
                            <p style={styles.sigLabel}>Date</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    page: { width: '297mm', height: '210mm', backgroundColor: '#fff', padding: '10mm', boxSizing: 'border-box', fontFamily: '"Playfair Display", serif', color: '#1f2937' },
    border: { border: '4px double #d4af37', height: '100%', padding: '2mm', boxSizing: 'border-box' },
    innerBorder: { border: '1px solid #d4af37', height: '100%', padding: '15mm', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' },
    cornerTL: { position: 'absolute', top: '-1px', left: '-1px', width: '40px', height: '40px' },
    cornerTR: { position: 'absolute', top: '-1px', right: '-1px', width: '40px', height: '40px', transform: 'scaleX(-1)' },
    cornerBL: { position: 'absolute', bottom: '-1px', left: '-1px', width: '40px', height: '40px', transform: 'scaleY(-1)' },
    cornerBR: { position: 'absolute', bottom: '-1px', right: '-1px', width: '40px', height: '40px', transform: 'scale(-1)' },
    header: { textAlign: 'center', marginBottom: '10mm' },
    title: { fontSize: '48pt', fontWeight: 'normal', margin: 0, letterSpacing: '5px', color: '#1f2937' },
    subtitle: { fontSize: '14pt', letterSpacing: '8px', color: '#d4af37', margin: '5mm 0 0', textTransform: 'uppercase' },
    text: { fontSize: '14pt', fontStyle: 'italic', margin: '10mm 0 5mm' },
    name: { fontSize: '40pt', fontFamily: '"Great Vibes", cursive', margin: '5mm 0', color: '#d4af37' },
    line: { width: '60%', height: '1px', backgroundColor: '#e5e7eb', marginBottom: '10mm' },
    body: { fontSize: '14pt', textAlign: 'center', maxWidth: '200mm', lineHeight: 1.6, color: '#4b5563' },
    footer: { width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto' },
    sig: { textAlign: 'center', width: '60mm' },
    sigText: { fontFamily: '"Great Vibes", cursive', fontSize: '18pt', marginBottom: '2mm' },
    sigLine: { borderTop: '1px solid #d4af37', marginBottom: '2mm' },
    sigLabel: { fontSize: '10pt', textTransform: 'uppercase', letterSpacing: '1px' },
    sealBox: { position: 'relative', width: '80px', height: '80px', display: 'flex', justifyContent: 'center', alignItems: 'center' },
    qr: { width: '60px', height: '60px', position: 'absolute', zIndex: 2 },
    goldSeal: { position: 'absolute', width: '80px', height: '80px', backgroundColor: '#d4af37', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: 0.2 },
    sealInner: { width: '60px', height: '60px', border: '2px dashed #fff', borderRadius: '50%' }
};
