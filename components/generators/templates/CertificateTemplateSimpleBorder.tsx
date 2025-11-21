
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { OwnerProfile } from '../../../types';
import { QualifiedStudent } from '../../../services/pdfService';

interface CertificateTemplateProps extends QualifiedStudent {
    school: OwnerProfile;
    examName: string;
    sessionYear: string;
}

export const CertificateTemplateSimpleBorder: React.FC<CertificateTemplateProps> = ({ student, school, division, examName, sessionYear }) => {
    const [qrCodeUrl, setQrCodeUrl] = useState('');

    useEffect(() => {
        QRCode.toDataURL(`${student.name}`, { width: 100, margin: 1 }).then(setQrCodeUrl);
    }, [student]);

    return (
        <div style={styles.page}>
            <div style={styles.outerBorder}>
                <div style={styles.innerBorder}>
                    <div style={styles.content}>
                        <h1 style={styles.header}>CERTIFICATE</h1>
                        <p style={styles.subHeader}>OF APPRECIATION</p>
                        
                        <p style={styles.smallText}>proudly presented to</p>
                        
                        <h2 style={styles.name}>{student.name.toUpperCase()}</h2>
                        
                        <div style={styles.divider}></div>
                        
                        <p style={styles.body}>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                            Awarded for <strong>{division}</strong>.
                        </p>

                        <div style={styles.footer}>
                            <div style={styles.sig}>
                                <div style={styles.line}></div>
                                <p>JOHN ANDREAS<br/>Founder</p>
                            </div>
                            
                            {qrCodeUrl && <div style={styles.seal}><img src={qrCodeUrl} style={{width:'100%'}} alt="QR"/></div>}

                            <div style={styles.sig}>
                                <div style={styles.line}></div>
                                <p>MARINA OLIVIA<br/>Manager</p>
                            </div>
                        </div>
                        <div style={styles.icon}>🎓</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    page: { width: '210mm', height: '297mm', backgroundColor: '#fff', padding: '10mm', boxSizing: 'border-box', fontFamily: '"Garamond", serif' },
    outerBorder: { border: '1px solid #000', height: '100%', padding: '2mm', boxSizing: 'border-box', borderRadius: '5px' },
    innerBorder: { border: '3px double #000', height: '100%', padding: '10mm', boxSizing: 'border-box', borderRadius: '5px' },
    content: { height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' },
    header: { fontSize: '36pt', fontWeight: 'normal', margin: 0, letterSpacing: '5px' },
    subHeader: { fontSize: '14pt', letterSpacing: '3px', marginTop: '5px', marginBottom: '15mm' },
    smallText: { fontSize: '12pt', fontStyle: 'italic', color: '#555' },
    name: { fontSize: '28pt', fontWeight: 'normal', margin: '5mm 0 2mm', letterSpacing: '2px' },
    divider: { width: '80%', height: '1px', backgroundColor: '#000', marginBottom: '10mm' },
    body: { fontSize: '11pt', lineHeight: 1.6, color: '#444', maxWidth: '80%', marginBottom: '20mm' },
    footer: { width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' },
    sig: { textAlign: 'center', width: '40mm', fontSize: '8pt' },
    line: { borderTop: '1px solid #000', marginBottom: '2mm' },
    seal: { width: '60px', height: '60px', borderRadius: '50%', border: '1px solid #ccc', padding: '5px' },
    icon: { position: 'absolute', bottom: '20mm', right: '20mm', fontSize: '20pt' } // Adjusted absolute positioning inside relative container if needed, simplistic here
};
