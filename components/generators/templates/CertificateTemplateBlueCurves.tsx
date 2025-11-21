
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { OwnerProfile } from '../../../types';
import { QualifiedStudent } from '../../../services/pdfService';

interface CertificateTemplateProps extends QualifiedStudent {
    school: OwnerProfile;
    examName: string;
    sessionYear: string;
}

export const CertificateTemplateBlueCurves: React.FC<CertificateTemplateProps> = ({ student, school, division, examName, sessionYear }) => {
    const [qrCodeUrl, setQrCodeUrl] = useState('');

    useEffect(() => {
        QRCode.toDataURL(`${student.name}`, { width: 100, margin: 1 }).then(setQrCodeUrl);
    }, [student]);

    return (
        <div style={styles.page}>
            <div style={styles.curveLeft}></div>
            <div style={styles.curveRight}></div>
            <div style={styles.curveTopRight}></div>

            <div style={styles.content}>
                <h1 style={styles.header}>CERTIFICATE</h1>
                <p style={styles.subHeader}>OF COMPLETION</p>
                
                <p style={styles.text}>This certificate is awarded to</p>
                <h1 style={styles.name}>{student.name}</h1>

                <div style={styles.line}></div>

                <p style={styles.desc}>
                    For successfully completing the course in<br/>
                    <strong>{examName}</strong><br/>
                    at {school.school_name}.
                </p>

                <div style={styles.footer}>
                    <div style={styles.sign}>
                        <p style={styles.signName}>{school.principal_name}</p>
                        <div style={styles.signLine}></div>
                        <p style={styles.signLabel}>CEO & FOUNDER</p>
                    </div>
                    
                    {qrCodeUrl && <img src={qrCodeUrl} style={styles.qr} alt="QR"/>}

                    <div style={styles.sign}>
                        <p style={styles.signName}>Instructor</p>
                        <div style={styles.signLine}></div>
                        <p style={styles.signLabel}>TRAINER</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    page: { width: '297mm', height: '210mm', backgroundColor: '#fff', position: 'relative', overflow: 'hidden', fontFamily: '"Arial", sans-serif' },
    curveLeft: { position: 'absolute', top: 0, left: 0, width: '40%', height: '100%', background: 'linear-gradient(120deg, #0284c7 0%, #bae6fd 100%)', clipPath: 'ellipse(60% 100% at 0% 50%)', zIndex: 0 },
    curveRight: { position: 'absolute', bottom: 0, right: 0, width: '30%', height: '50%', background: 'linear-gradient(135deg, #bae6fd 0%, #0ea5e9 100%)', clipPath: 'ellipse(100% 100% at 100% 100%)', zIndex: 0 },
    curveTopRight: { position: 'absolute', top: 0, right: 0, width: '200px', height: '200px', border: '20px solid #e0f2fe', borderRadius: '50%', transform: 'translate(30%, -30%)', zIndex: 0 },
    content: { position: 'relative', zIndex: 1, width: '100%', height: '100%', padding: '20mm', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' },
    header: { fontSize: '48pt', fontWeight: '900', margin: 0, letterSpacing: '3px', color: '#0f172a' },
    subHeader: { fontSize: '16pt', fontWeight: 'bold', letterSpacing: '5px', color: '#64748b', marginBottom: '10mm' },
    text: { fontSize: '14pt', color: '#475569', margin: '5mm 0' },
    name: { fontSize: '48pt', fontFamily: '"Pinyon Script", cursive', color: '#0f172a', margin: '0' },
    line: { width: '150mm', height: '2px', backgroundColor: '#cbd5e1', margin: '5mm 0 10mm' },
    desc: { fontSize: '14pt', color: '#334155', lineHeight: 1.6 },
    footer: { width: '80%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto' },
    sign: { width: '50mm', textAlign: 'center' },
    signName: { fontSize: '12pt', fontWeight: 'bold', marginBottom: '2mm' },
    signLine: { borderBottom: '2px solid #0f172a', marginBottom: '2mm' },
    signLabel: { fontSize: '9pt', color: '#64748b', letterSpacing: '1px' },
    qr: { width: '60px', height: '60px', border: '2px solid #fff', borderRadius: '5px' }
};
