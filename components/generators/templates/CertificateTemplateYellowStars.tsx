
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { OwnerProfile } from '../../../types';
import { QualifiedStudent } from '../../../services/pdfService';

interface CertificateTemplateProps extends QualifiedStudent {
    school: OwnerProfile;
    examName: string;
    sessionYear: string;
}

export const CertificateTemplateYellowStars: React.FC<CertificateTemplateProps> = ({ student, school, division, examName, sessionYear }) => {
    const [qrCodeUrl, setQrCodeUrl] = useState('');

    useEffect(() => {
        QRCode.toDataURL(`${student.name}`, { width: 100, margin: 1 }).then(setQrCodeUrl);
    }, [student]);

    return (
        <div style={styles.page}>
            <div style={styles.border}>
                <div style={styles.starsLeft}>★ ★ ★ ★</div>
                <div style={styles.starsRight}>★ ★ ★ ★</div>
                
                <div style={styles.content}>
                    <h3 style={styles.schoolName}>{school.school_name.toUpperCase()}</h3>
                    
                    <div style={styles.badgeBox}>
                        <h1 style={styles.title}>CHARACTER</h1>
                        <h2 style={styles.subtitle}>ACHIEVEMENT AWARD</h2>
                    </div>

                    <p style={styles.text}>Awarded to:</p>
                    
                    <h1 style={styles.name}>{student.name}</h1>
                    <div style={styles.line}></div>

                    <div style={styles.footer}>
                        <div style={styles.sign}>
                            <div style={styles.signLine}></div>
                            <p>Principal</p>
                        </div>
                        <div style={styles.sign}>
                            <div style={styles.signLine}></div>
                            <p>Teacher</p>
                        </div>
                    </div>
                    
                    <div style={styles.icon}>🎓</div>
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    page: { width: '297mm', height: '210mm', backgroundColor: '#fff', padding: '5mm', boxSizing: 'border-box', fontFamily: '"Arial Rounded MT Bold", "Arial", sans-serif' },
    border: { width: '100%', height: '100%', border: '10px solid #fcd34d', borderRadius: '20px', position: 'relative', overflow: 'hidden', backgroundColor: '#fffbeb' },
    starsLeft: { position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%) rotate(-90deg)', fontSize: '30pt', color: '#fbbf24', letterSpacing: '20px' },
    starsRight: { position: 'absolute', top: '50%', right: '10px', transform: 'translateY(-50%) rotate(90deg)', fontSize: '30pt', color: '#fbbf24', letterSpacing: '20px' },
    content: { height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10mm 20mm' },
    schoolName: { fontSize: '16pt', color: '#4b5563', marginBottom: '5mm' },
    badgeBox: { textAlign: 'center', marginBottom: '10mm', border: '4px solid #1f2937', padding: '10px 40px', borderRadius: '10px', backgroundColor: '#fff' },
    title: { fontSize: '48pt', color: '#d97706', margin: 0, textShadow: '2px 2px 0px #000' },
    subtitle: { fontSize: '20pt', color: '#1f2937', margin: 0 },
    text: { fontSize: '18pt', color: '#4b5563', marginBottom: '5mm' },
    name: { fontSize: '36pt', color: '#000', margin: 0, fontFamily: '"Comic Sans MS", cursive, sans-serif' },
    line: { width: '60%', height: '4px', backgroundColor: '#000', marginBottom: '20mm' },
    footer: { width: '80%', display: 'flex', justifyContent: 'space-between' },
    sign: { textAlign: 'center', width: '60mm' },
    signLine: { height: '2px', backgroundColor: '#000', marginBottom: '2mm' },
    icon: { position: 'absolute', bottom: '20px', right: '20px', fontSize: '40pt', color: '#4b5563' }
};
