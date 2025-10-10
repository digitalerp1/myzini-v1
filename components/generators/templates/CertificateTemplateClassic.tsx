import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Student, OwnerProfile } from '../../../types';
import { QualifiedStudent } from '../../../services/pdfService';

interface CertificateTemplateProps extends QualifiedStudent {
    school: OwnerProfile;
    examName: string;
    sessionYear: string;
}

const sealImage = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0OCIgZmlsbD0iI2I5MWMxYyIvPjxwYXRoIGQ9Ik01MCAxMEw1NSAzNUw4MCAzMEw2NSA1MEw4NSA2NUw1NSA3MEw1MCA5NUw0NSA3MEwxNSA2NUwzNSA1MEwxOSAzMEw0NSAzNVoiIGZpbGw9IiNjZjRhM2IiLz48L3N2Zz4=";

export const CertificateTemplateClassic: React.FC<CertificateTemplateProps> = ({ student, school, division, examName, sessionYear }) => {
    const studentPhoto = student.photo_url || `https://ui-avatars.com/api/?name=${student.name}&background=e8e8e8&color=555&size=128&bold=true`;
    const [qrCodeUrl, setQrCodeUrl] = useState('');

    useEffect(() => {
        const generateQrCode = async () => {
            const data = { student: student.name, division, exam: examName, session: sessionYear };
            try {
                setQrCodeUrl(await QRCode.toDataURL(JSON.stringify(data), { width: 120, margin: 1 }));
            } catch (err) { console.error(err); }
        };
        generateQrCode();
    }, [student.name, division, examName, sessionYear]);

    return (
        <div style={styles.page}>
            <div style={styles.borderTop}></div>
            <div style={styles.borderLeft}></div>
            <div style={styles.borderRight}></div>
            <div style={styles.borderBottom}></div>

            <div style={styles.content}>
                <p style={styles.subTitle}>Certificate of Academic Excellence</p>
                <h1 style={styles.title}>CERTIFICATE</h1>
                <p style={styles.presentedTo}>Is Hereby Awarded To</p>
                
                <img src={studentPhoto} alt="Student" style={styles.studentPhoto} crossOrigin="anonymous"/>
                <h2 style={styles.studentName}>{student.name}</h2>

                <p style={styles.bodyText}>
                    for outstanding performance and securing the <strong>{division}</strong> during the academic year {sessionYear}.
                </p>

                <div style={styles.footer}>
                    <div style={styles.signatureBlock}>
                        <p style={styles.signature}>{school.principal_name || 'Principal'}</p>
                        <p style={styles.signatureLabel}>Principal, {school.school_name}</p>
                    </div>
                     <div style={styles.sealContainer}>
                        <img src={sealImage} alt="Seal" style={styles.seal} />
                        {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" style={styles.qrCode} />}
                    </div>
                    <div style={styles.signatureBlock}>
                        <p style={styles.signature}>{new Date().toLocaleDateString()}</p>
                        <p style={styles.signatureLabel}>Date</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const borderStyle: React.CSSProperties = {
    position: 'absolute',
    backgroundColor: '#0c4a6e',
    zIndex: 0
};

const styles: { [key: string]: React.CSSProperties } = {
    page: { fontFamily: '"Playfair Display", serif', width: '297mm', height: '210mm', padding: '15mm', boxSizing: 'border-box', backgroundColor: '#f0f4f8', position: 'relative' },
    borderTop: { ...borderStyle, top: '15mm', left: '15mm', right: '15mm', height: '5px' },
    borderBottom: { ...borderStyle, bottom: '15mm', left: '15mm', right: '15mm', height: '5px' },
    borderLeft: { ...borderStyle, top: '15mm', left: '15mm', bottom: '15mm', width: '5px' },
    borderRight: { ...borderStyle, top: '15mm', right: '15mm', bottom: '15mm', width: '5px' },
    content: { border: '2px solid #a16207', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '8mm', boxSizing: 'border-box', position: 'relative', zIndex: 1 },
    subTitle: { fontSize: '14pt', color: '#374151', margin: 0 },
    title: { fontFamily: '"Cinzel", serif', fontSize: '36pt', letterSpacing: '4px', color: '#0c4a6e', margin: '3mm 0' },
    presentedTo: { fontSize: '12pt', color: '#374151', margin: '3mm 0' },
    studentPhoto: { width: '50px', height: '50px', objectFit: 'cover', borderRadius: '50%', border: '2px solid #a16207', marginTop: '2mm' },
    studentName: { fontSize: '28pt', fontWeight: 700, color: '#a16207', margin: '3mm 0' },
    bodyText: { fontSize: '12pt', color: '#374151', lineHeight: 1.5, maxWidth: '180mm', margin: '3mm 0' },
    footer: { display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', width: '100%', marginTop: 'auto', paddingTop: '3mm' },
    signatureBlock: { flex: 1 },
    signature: { fontFamily: '"Dancing Script", cursive', fontSize: '18pt', borderBottom: '1px solid #6b7280', paddingBottom: '1mm', margin: 0 },
    signatureLabel: { fontSize: '10pt', color: '#4b5563', margin: '2mm 0 0 0' },
    sealContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
    seal: { width: '60px', height: '60px' },
    qrCode: { width: '50px', height: '50px', marginTop: '2mm' },
};