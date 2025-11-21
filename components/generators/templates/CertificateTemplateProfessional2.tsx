
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { OwnerProfile } from '../../../types';
import { QualifiedStudent } from '../../../services/pdfService';

interface CertificateTemplateProps extends QualifiedStudent {
    school: OwnerProfile;
    examName: string;
    sessionYear: string;
}

const defaultLogo = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2ZmZiI+PHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgMTJjLTIuNzYgMC01LTIuMjQtNS01czIuMjQtNSA1LTUgNSAyLjI0IDUgNS0yLjI0IDUtNSA1eiIvPjwvc3ZnPg==";

export const CertificateTemplateProfessional2: React.FC<CertificateTemplateProps> = ({ student, school, division, examName, sessionYear }) => {
    const schoolLogo = school.school_image_url || defaultLogo;
    const [qrCodeUrl, setQrCodeUrl] = useState('');

    useEffect(() => {
        const generateQrCode = async () => {
            const data = { student: student.name, division, exam: examName, session: sessionYear };
            try {
                setQrCodeUrl(await QRCode.toDataURL(JSON.stringify(data), { width: 100, margin: 1 }));
            } catch (err) { console.error(err); }
        };
        generateQrCode();
    }, [student, division, examName, sessionYear]);

    return (
        <div style={styles.page}>
            <div style={styles.sidebar}>
                <img src={schoolLogo} alt="Logo" style={styles.logo} crossOrigin="anonymous"/>
                <div style={styles.sidebarText}>
                    <h1>{sessionYear}</h1>
                    <p>ACADEMIC YEAR</p>
                </div>
            </div>
            <div style={styles.main}>
                <div style={styles.header}>
                    <h1 style={styles.schoolName}>{school.school_name}</h1>
                    <p style={styles.schoolAddress}>{school.address}</p>
                </div>
                
                <div style={styles.content}>
                    <h2 style={styles.title}>CERTIFICATE OF COMPLETION</h2>
                    <p style={styles.subtitle}>THIS CERTIFICATE IS AWARDED TO</p>
                    
                    <h1 style={styles.studentName}>{student.name}</h1>
                    
                    <p style={styles.body}>
                        In recognition of their hard work and dedication in completing the <strong>{examName}</strong> with a securing of
                    </p>
                    <h3 style={styles.division}>{division}</h3>
                </div>

                <div style={styles.footer}>
                    <div style={styles.signBlock}>
                        <p style={styles.signName}>{school.principal_name || 'Principal'}</p>
                        <p style={styles.signTitle}>Principal</p>
                    </div>
                    {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" style={styles.qrCode} />}
                    <div style={styles.signBlock}>
                        <p style={styles.signName}>{new Date().toLocaleDateString()}</p>
                        <p style={styles.signTitle}>Date</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    page: { width: '297mm', height: '210mm', backgroundColor: '#fff', display: 'flex', fontFamily: '"Segoe UI", sans-serif' },
    sidebar: { width: '70mm', height: '100%', backgroundColor: '#1e3a8a', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '20mm 0' },
    logo: { width: '80px', height: '80px', objectFit: 'contain' },
    sidebarText: { textAlign: 'center', fontSize: '14pt', fontWeight: 'bold' },
    main: { flex: 1, padding: '15mm', display: 'flex', flexDirection: 'column' },
    header: { borderBottom: '2px solid #e5e7eb', paddingBottom: '5mm', marginBottom: '10mm' },
    schoolName: { fontSize: '24pt', fontWeight: 'bold', color: '#1e3a8a', margin: 0 },
    schoolAddress: { fontSize: '10pt', color: '#6b7280', margin: '2mm 0 0 0' },
    content: { textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' },
    title: { fontSize: '28pt', fontWeight: 900, color: '#111827', margin: 0, letterSpacing: '1px' },
    subtitle: { fontSize: '10pt', color: '#6b7280', letterSpacing: '3px', margin: '5mm 0' },
    studentName: { fontSize: '40pt', color: '#1e3a8a', margin: '10mm 0', fontWeight: 'bold' },
    body: { fontSize: '14pt', color: '#374151', maxWidth: '160mm', margin: '0 auto', lineHeight: 1.5 },
    division: { fontSize: '20pt', color: '#059669', marginTop: '5mm', fontWeight: 'bold' },
    footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '10mm' },
    signBlock: { textAlign: 'center' },
    signName: { fontSize: '12pt', borderBottom: '1px solid #374151', paddingBottom: '2mm', minWidth: '50mm', fontWeight: 600 },
    signTitle: { fontSize: '9pt', color: '#6b7280', marginTop: '2mm' },
    qrCode: { width: '60px', height: '60px' },
};
