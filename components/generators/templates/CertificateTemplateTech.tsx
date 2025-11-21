
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { OwnerProfile } from '../../../types';
import { QualifiedStudent } from '../../../services/pdfService';

interface CertificateTemplateProps extends QualifiedStudent {
    school: OwnerProfile;
    examName: string;
    sessionYear: string;
}

export const CertificateTemplateTech: React.FC<CertificateTemplateProps> = ({ student, school, division, examName, sessionYear }) => {
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const studentPhoto = student.photo_url || `https://ui-avatars.com/api/?name=${student.name}&background=e8e8e8&color=555&size=128&bold=true`;
    const schoolLogo = school.school_image_url;

    useEffect(() => {
        QRCode.toDataURL(`${student.name}-${division}`, { width: 100, margin: 1, color: { dark: '#0891b2' } }).then(setQrCodeUrl);
    }, [student]);

    return (
        <div style={styles.page}>
            <div style={styles.gridBg}></div>
            <div style={styles.content}>
                <div style={styles.header}>
                    {schoolLogo && <img src={schoolLogo} style={styles.logo} crossOrigin="anonymous" alt="Logo"/>}
                    <h1 style={styles.schoolName}>{school.school_name}</h1>
                </div>

                <h2 style={styles.title}>CERTIFICATE OF ACHIEVEMENT</h2>
                
                <div style={styles.card}>
                    <div style={styles.row}>
                        <img src={studentPhoto} style={styles.photo} crossOrigin="anonymous" alt="Student"/>
                        <div>
                            <p style={styles.label}>NAME</p>
                            <h1 style={styles.name}>{student.name}</h1>
                        </div>
                    </div>
                    <div style={styles.details}>
                        <div style={styles.item}>
                            <p style={styles.label}>EXAM</p>
                            <p style={styles.val}>{examName}</p>
                        </div>
                        <div style={styles.item}>
                            <p style={styles.label}>RESULT</p>
                            <p style={styles.val}>{division}</p>
                        </div>
                        <div style={styles.item}>
                            <p style={styles.label}>SESSION</p>
                            <p style={styles.val}>{sessionYear}</p>
                        </div>
                    </div>
                </div>

                <div style={styles.footer}>
                    <div style={styles.sig}>
                        <p style={styles.sigLine}>AUTHORIZED SIGNATURE</p>
                    </div>
                    {qrCodeUrl && <img src={qrCodeUrl} style={styles.qr} alt="QR"/>}
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    page: { width: '297mm', height: '210mm', backgroundColor: '#0f172a', padding: '15mm', boxSizing: 'border-box', fontFamily: '"Roboto Mono", monospace', color: '#e2e8f0', position: 'relative' },
    gridBg: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: 'linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)', backgroundSize: '20px 20px', zIndex: 0 },
    content: { position: 'relative', zIndex: 1, border: '2px solid #0891b2', height: '100%', padding: '10mm', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' },
    header: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10mm' },
    logo: { width: '40px', height: '40px', objectFit: 'contain', backgroundColor: '#fff', borderRadius: '4px' },
    schoolName: { fontSize: '20pt', color: '#22d3ee', margin: 0 },
    title: { fontSize: '28pt', color: '#fff', textAlign: 'center', margin: '5mm 0 10mm' },
    card: { backgroundColor: '#1e293b', padding: '10mm', borderRadius: '8px', border: '1px solid #334155' },
    row: { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '10mm' },
    photo: { width: '70px', height: '70px', borderRadius: '4px', objectFit: 'cover' },
    label: { fontSize: '10pt', color: '#94a3b8', margin: 0 },
    name: { fontSize: '28pt', color: '#fff', margin: '5px 0 0' },
    details: { display: 'flex', justifyContent: 'space-between' },
    item: { textAlign: 'left' },
    val: { fontSize: '14pt', color: '#22d3ee', margin: '5px 0 0', fontWeight: 'bold' },
    footer: { marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    sig: { borderTop: '2px solid #0891b2', paddingTop: '5px', width: '80mm', textAlign: 'center' },
    sigLine: { margin: 0, color: '#94a3b8', fontSize: '10pt' },
    qr: { width: '60px', height: '60px', backgroundColor: '#fff', padding: '2px' }
};
