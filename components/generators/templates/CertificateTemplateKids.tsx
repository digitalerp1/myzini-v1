
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { OwnerProfile } from '../../../types';
import { QualifiedStudent } from '../../../services/pdfService';

interface CertificateTemplateProps extends QualifiedStudent {
    school: OwnerProfile;
    examName: string;
    sessionYear: string;
}

export const CertificateTemplateKids: React.FC<CertificateTemplateProps> = ({ student, school, division, examName, sessionYear }) => {
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const studentPhoto = student.photo_url || `https://ui-avatars.com/api/?name=${student.name}&background=e8e8e8&color=555&size=128&bold=true`;
    const schoolLogo = school.school_image_url;

    useEffect(() => {
        QRCode.toDataURL(`${student.name}-${division}`, { width: 100, margin: 1 }).then(setQrCodeUrl);
    }, [student]);

    return (
        <div style={styles.page}>
            <div style={styles.border}>
                <div style={styles.header}>
                    {schoolLogo && <img src={schoolLogo} style={styles.logo} crossOrigin="anonymous" alt="Logo"/>}
                    <h1 style={styles.schoolName}>{school.school_name}</h1>
                </div>

                <h1 style={styles.congrats}>Congratulations!</h1>
                
                <div style={styles.content}>
                    <div style={styles.starBox}>
                        <img src={studentPhoto} style={styles.photo} crossOrigin="anonymous" alt="Student"/>
                    </div>
                    <h2 style={styles.name}>{student.name}</h2>
                    <p style={styles.text}>You are a Super Star!</p>
                    <p style={styles.desc}>
                        For achieving <strong>{division}</strong> in {examName} ({sessionYear}).
                    </p>
                </div>

                <div style={styles.footer}>
                    <div style={styles.sig}>
                        <div style={styles.line}></div>
                        <p>Teacher</p>
                    </div>
                    {qrCodeUrl && <img src={qrCodeUrl} style={styles.qr} alt="QR"/>}
                    <div style={styles.sig}>
                        <div style={styles.line}></div>
                        <p>Principal</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    page: { width: '297mm', height: '210mm', backgroundColor: '#fff', padding: '10mm', boxSizing: 'border-box', fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif' },
    border: { width: '100%', height: '100%', border: '5px dashed #f59e0b', borderRadius: '20px', padding: '10mm', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#fffbeb' },
    header: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5mm' },
    logo: { width: '50px', height: '50px', objectFit: 'contain' },
    schoolName: { fontSize: '20pt', color: '#d97706', margin: 0 },
    congrats: { fontSize: '40pt', color: '#ef4444', margin: '0 0 5mm 0', textShadow: '2px 2px #fcd34d' },
    content: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
    starBox: { width: '100px', height: '100px', backgroundColor: '#fcd34d', clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '5mm' },
    photo: { width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' },
    name: { fontSize: '32pt', color: '#059669', margin: '0 0 2mm 0' },
    text: { fontSize: '18pt', color: '#3b82f6', margin: '0 0 5mm 0' },
    desc: { fontSize: '14pt', color: '#4b5563', textAlign: 'center', maxWidth: '200mm' },
    footer: { width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto' },
    sig: { width: '50mm', textAlign: 'center' },
    line: { borderBottom: '2px solid #d97706', marginBottom: '2mm' },
    qr: { width: '60px', height: '60px' }
};
