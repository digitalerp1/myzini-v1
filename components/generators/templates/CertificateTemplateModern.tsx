import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Student, OwnerProfile } from '../../../types';
import { QualifiedStudent } from '../../../services/pdfService';

interface CertificateTemplateProps extends QualifiedStudent {
    school: OwnerProfile;
    examName: string;
    sessionYear: string;
}

const defaultLogo = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2ZmZiI+PHBhdGggZD0iTTEyIDE1bC04LTUgOC01IDggNSA0LTIuNS0xMi03LjUtMTIgNy41djEwbDEyIDcuNSA0LTIuNWwtNC0yLjV6Ii8+PC9zdmc+";

export const CertificateTemplateModern: React.FC<CertificateTemplateProps> = ({ student, school, division, percentage, examName, sessionYear }) => {
    const schoolLogo = school.school_image_url || defaultLogo;
    const studentPhoto = student.photo_url || `https://ui-avatars.com/api/?name=${student.name}&background=e8e8e8&color=555&size=128&bold=true`;
    const [qrCodeUrl, setQrCodeUrl] = useState('');

    useEffect(() => {
        const generateQrCode = async () => {
            const data = { student: student.name, division, exam: examName, session: sessionYear };
            try {
                setQrCodeUrl(await QRCode.toDataURL(JSON.stringify(data), { width: 120, margin: 1, color: { dark: '#111827', light: '#f3f4f6' } }));
            } catch (err) { console.error(err); }
        };
        generateQrCode();
    }, [student.name, division, examName, sessionYear]);

    return (
        <div style={styles.page}>
            <div style={styles.leftPanel}>
                <img src={schoolLogo} alt="School Logo" style={styles.logo} crossOrigin="anonymous"/>
                <h1 style={styles.schoolName}>{school.school_name}</h1>
                <p style={styles.awardTitle}>AWARD OF EXCELLENCE</p>
                 <img src={studentPhoto} alt="Student" style={styles.studentPhoto} crossOrigin="anonymous"/>
                <div style={styles.footer}>
                    <div style={styles.signatureBlock}>
                        <p style={styles.signatureLine}></p>
                        <p style={styles.signatureLabel}>Principal</p>
                    </div>
                     <div style={styles.signatureBlock}>
                        <p style={styles.signatureLine}></p>
                        <p style={styles.signatureLabel}>Date</p>
                    </div>
                </div>
            </div>
            <div style={styles.rightPanel}>
                 <div style={styles.content}>
                    <p style={styles.presentedTo}>THIS CERTIFICATE IS PRESENTED TO</p>
                    <h2 style={styles.studentName}>{student.name}</h2>
                    <p style={styles.bodyText}>
                        In recognition of outstanding academic achievement, having secured the <strong>{division}</strong> with an aggregate of <strong>{percentage.toFixed(2)}%</strong>.
                    </p>
                    {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" style={styles.qrCode} />}
                 </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    page: { fontFamily: '"Inter", "Segoe UI", sans-serif', width: '297mm', height: '210mm', display: 'flex', backgroundColor: '#fff' },
    leftPanel: { width: '100mm', backgroundColor: '#111827', color: 'white', padding: '12mm', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' },
    rightPanel: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12mm', boxSizing: 'border-box', 
        backgroundImage: 'radial-gradient(#f3f4f6 1px, transparent 1px)', backgroundSize: '15px 15px' },
    logo: { width: '50px', height: '50px', objectFit: 'contain' },
    schoolName: { fontSize: '18pt', fontWeight: 700, margin: '6mm 0', lineHeight: 1.3 },
    awardTitle: { fontSize: '14pt', fontWeight: 500, color: '#9ca3af', letterSpacing: '1px' },
    studentPhoto: { width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #4f46e5', marginTop: '8mm' },
    content: { textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    presentedTo: { fontSize: '11pt', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '2px' },
    studentName: { fontSize: '32pt', fontWeight: 800, color: '#111827', margin: '4mm 0', lineHeight: 1.1 },
    bodyText: { fontSize: '12pt', color: '#4b5563', lineHeight: 1.6, maxWidth: '150mm' },
    qrCode: { width: '80px', height: '80px', marginTop: '8mm' },
    footer: { marginTop: 'auto', paddingTop: '10mm', width: '100%' },
    signatureBlock: { marginBottom: '6mm' },
    signatureLine: { borderBottom: '1.5px solid #4b5563', width: '100%' },
    signatureLabel: { fontSize: '10pt', color: '#9ca3af', marginTop: '2mm' },
};