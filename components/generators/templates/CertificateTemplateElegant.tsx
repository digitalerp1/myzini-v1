
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { OwnerProfile } from '../../../types';
import { QualifiedStudent } from '../../../services/pdfService';

interface CertificateTemplateProps extends QualifiedStudent {
    school: OwnerProfile;
    examName: string;
    sessionYear: string;
}

export const CertificateTemplateElegant: React.FC<CertificateTemplateProps> = ({ student, school, division, examName, sessionYear }) => {
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const studentPhoto = student.photo_url || `https://ui-avatars.com/api/?name=${student.name}&background=e8e8e8&color=555&size=128&bold=true`;
    const schoolLogo = school.school_image_url;

    useEffect(() => {
        QRCode.toDataURL(`${student.name}-${division}`, { width: 100, margin: 1, color: { dark: '#fff', light: '#000' } }).then(setQrCodeUrl);
    }, [student]);

    return (
        <div style={styles.page}>
            <div style={styles.border}>
                <div style={styles.header}>
                    <h1 style={styles.schoolName}>{school.school_name}</h1>
                    <div style={styles.line}></div>
                </div>

                <div style={styles.content}>
                    <h2 style={styles.title}>Certificate of Achievement</h2>
                    <p style={styles.text}>Presented to</p>
                    
                    <div style={styles.student}>
                        <img src={studentPhoto} style={styles.photo} crossOrigin="anonymous" alt="Student"/>
                        <h1 style={styles.name}>{student.name}</h1>
                    </div>

                    <p style={styles.text}>
                        For outstanding performance in <strong>{examName}</strong>,<br/>
                        achieving <strong>{division}</strong> in {sessionYear}.
                    </p>
                </div>

                <div style={styles.footer}>
                    <div style={styles.sig}>
                        <div style={styles.sigLine}></div>
                        <p>Principal</p>
                    </div>
                    <div style={styles.qrBox}>
                        {qrCodeUrl && <img src={qrCodeUrl} style={styles.qr} alt="QR"/>}
                    </div>
                    <div style={styles.sig}>
                        <div style={styles.sigLine}></div>
                        <p>Date</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    page: { width: '297mm', height: '210mm', backgroundColor: '#000', padding: '15mm', boxSizing: 'border-box', fontFamily: '"Didot", serif', color: '#fff' },
    border: { width: '100%', height: '100%', border: '2px solid #fbbf24', padding: '10mm', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    header: { textAlign: 'center', marginBottom: '10mm', width: '100%' },
    schoolName: { fontSize: '24pt', fontWeight: 'bold', color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 5mm' },
    line: { width: '50px', height: '2px', backgroundColor: '#fbbf24', margin: '0 auto' },
    content: { flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    title: { fontSize: '32pt', fontStyle: 'italic', color: '#fff', margin: '0 0 10mm' },
    text: { fontSize: '14pt', color: '#d1d5db', margin: '2mm 0' },
    student: { margin: '10mm 0', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    photo: { width: '80px', height: '80px', borderRadius: '50%', border: '2px solid #fbbf24', marginBottom: '5mm', objectFit: 'cover' },
    name: { fontSize: '36pt', color: '#fbbf24', margin: 0 },
    footer: { width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto' },
    sig: { textAlign: 'center', width: '50mm' },
    sigLine: { borderBottom: '1px solid #fbbf24', marginBottom: '2mm' },
    qrBox: { border: '1px solid #fbbf24', padding: '2px' },
    qr: { width: '50px', height: '50px' }
};
