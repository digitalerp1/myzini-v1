
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { OwnerProfile } from '../../../types';
import { QualifiedStudent } from '../../../services/pdfService';

interface CertificateTemplateProps extends QualifiedStudent {
    school: OwnerProfile;
    examName: string;
    sessionYear: string;
}

const defaultLogo = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2I4ODYwYiI+PHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgMTJjLTIuNzYgMC01LTIuMjQtNS01czIuMjQtNSA1LTUgNSAyLjI0IDUgNS0yLjI0IDUtNSA1eiIvPjwvc3ZnPg==";

export const CertificateTemplateProfessional1: React.FC<CertificateTemplateProps> = ({ student, school, division, examName, sessionYear }) => {
    const schoolLogo = school.school_image_url || defaultLogo;
    const [qrCodeUrl, setQrCodeUrl] = useState('');

    useEffect(() => {
        const generateQrCode = async () => {
            const data = { student: student.name, division, exam: examName, session: sessionYear, school: school.school_name };
            try {
                setQrCodeUrl(await QRCode.toDataURL(JSON.stringify(data), { width: 100, margin: 1, color: { dark: '#b8860b', light: '#fff' } }));
            } catch (err) { console.error(err); }
        };
        generateQrCode();
    }, [student, division, examName, sessionYear, school.school_name]);

    return (
        <div style={styles.page}>
            <div style={styles.border}>
                <div style={styles.innerBorder}>
                    <div style={styles.header}>
                        <img src={schoolLogo} alt="Logo" style={styles.logo} crossOrigin="anonymous"/>
                        <h1 style={styles.schoolName}>{school.school_name}</h1>
                    </div>
                    
                    <div style={styles.content}>
                        <h2 style={styles.title}>CERTIFICATE OF ACHIEVEMENT</h2>
                        <div style={styles.underline}></div>
                        
                        <p style={styles.text}>This is to certify that</p>
                        <h3 style={styles.studentName}>{student.name}</h3>
                        <p style={styles.text}>
                            of Class <strong>{student.class}</strong> has successfully completed the <strong>{examName}</strong> 
                            for the academic session <strong>{sessionYear}</strong>.
                        </p>
                        <p style={styles.text}>
                            He/She has secured the <strong>{division}</strong> with outstanding performance.
                        </p>
                    </div>

                    <div style={styles.footer}>
                        <div style={styles.signatureBlock}>
                            <div style={styles.line}></div>
                            <p>Principal</p>
                        </div>
                        <div style={styles.badgeContainer}>
                            {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" style={styles.qrCode} />}
                        </div>
                        <div style={styles.signatureBlock}>
                            <div style={styles.line}></div>
                            <p>Class Teacher</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    page: { width: '297mm', height: '210mm', backgroundColor: '#fff', padding: '10mm', boxSizing: 'border-box', fontFamily: '"Times New Roman", serif' },
    border: { width: '100%', height: '100%', border: '2px solid #b8860b', padding: '2mm', boxSizing: 'border-box' },
    innerBorder: { width: '100%', height: '100%', border: '10px double #b8860b', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10mm', boxSizing: 'border-box', position: 'relative' },
    header: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '5mm' },
    logo: { width: '60px', height: '60px', objectFit: 'contain', marginBottom: '2mm' },
    schoolName: { fontSize: '28pt', fontWeight: 'bold', color: '#1a1a1a', textTransform: 'uppercase', margin: 0, letterSpacing: '2px' },
    content: { textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' },
    title: { fontSize: '32pt', color: '#b8860b', margin: '5mm 0 2mm 0', fontWeight: 'bold' },
    underline: { width: '150mm', height: '2px', backgroundColor: '#b8860b', margin: '0 auto 10mm auto' },
    text: { fontSize: '16pt', color: '#4a4a4a', margin: '3mm 0', lineHeight: 1.5 },
    studentName: { fontSize: '36pt', fontFamily: '"Pinyon Script", cursive, "Times New Roman"', color: '#000', margin: '5mm 0', borderBottom: '1px solid #ccc', display: 'inline-block', minWidth: '100mm' },
    footer: { width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto' },
    signatureBlock: { textAlign: 'center', width: '60mm' },
    line: { borderBottom: '1px solid #000', marginBottom: '2mm' },
    badgeContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
    qrCode: { width: '80px', height: '80px' },
};
