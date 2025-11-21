
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { OwnerProfile } from '../../../types';
import { QualifiedStudent } from '../../../services/pdfService';

interface CertificateTemplateProps extends QualifiedStudent {
    school: OwnerProfile;
    examName: string;
    sessionYear: string;
}

export const CertificateTemplateCorporate: React.FC<CertificateTemplateProps> = ({ student, school, division, examName, sessionYear }) => {
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const studentPhoto = student.photo_url || `https://ui-avatars.com/api/?name=${student.name}&background=e8e8e8&color=555&size=128&bold=true`;
    const schoolLogo = school.school_image_url;

    useEffect(() => {
        QRCode.toDataURL(`${student.name}-${division}`, { width: 100, margin: 1 }).then(setQrCodeUrl);
    }, [student]);

    return (
        <div style={styles.page}>
            <div style={styles.sidebar}>
                {schoolLogo && <img src={schoolLogo} style={styles.logo} crossOrigin="anonymous" alt="Logo"/>}
                <div style={styles.qrContainer}>
                    {qrCodeUrl && <img src={qrCodeUrl} style={styles.qr} alt="QR"/>}
                </div>
            </div>
            <div style={styles.content}>
                <h1 style={styles.schoolName}>{school.school_name}</h1>
                <p style={styles.address}>{school.address}</p>
                
                <div style={styles.divider}></div>
                
                <h2 style={styles.title}>CERTIFICATE OF RECOGNITION</h2>
                
                <div style={styles.body}>
                    <p style={styles.text}>Presented to</p>
                    <div style={styles.studentRow}>
                        <img src={studentPhoto} style={styles.photo} crossOrigin="anonymous" alt="Student"/>
                        <h1 style={styles.name}>{student.name}</h1>
                    </div>
                    <p style={styles.text}>
                        For demonstrating excellence in <strong>{examName}</strong> and securing the <strong>{division}</strong>
                    </p>
                    <p style={styles.session}>Session: {sessionYear}</p>
                </div>

                <div style={styles.footer}>
                    <div style={styles.sig}>
                        <p style={styles.sigName}>Principal Signature</p>
                        <div style={styles.line}></div>
                    </div>
                    <div style={styles.sig}>
                        <p style={styles.sigName}>Date</p>
                        <div style={styles.line}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    page: { width: '297mm', height: '210mm', backgroundColor: '#fff', display: 'flex', fontFamily: '"Arial", sans-serif' },
    sidebar: { width: '60mm', height: '100%', backgroundColor: '#1e293b', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '10mm 0' },
    logo: { width: '80px', height: '80px', objectFit: 'contain', backgroundColor: 'white', padding: '5px', borderRadius: '5px' },
    qrContainer: { backgroundColor: 'white', padding: '5px' },
    qr: { width: '60px', height: '60px' },
    content: { flex: 1, padding: '15mm', display: 'flex', flexDirection: 'column' },
    schoolName: { fontSize: '24pt', fontWeight: 'bold', color: '#334155', margin: 0, textTransform: 'uppercase' },
    address: { fontSize: '10pt', color: '#64748b', margin: '2px 0 0 0' },
    divider: { width: '100%', height: '2px', backgroundColor: '#cbd5e1', margin: '10mm 0' },
    title: { fontSize: '28pt', fontWeight: 'bold', color: '#0f172a', marginBottom: '10mm' },
    body: { flex: 1 },
    text: { fontSize: '14pt', color: '#475569', margin: '2mm 0' },
    studentRow: { display: 'flex', alignItems: 'center', gap: '20px', margin: '10mm 0' },
    photo: { width: '70px', height: '70px', borderRadius: '50%', border: '2px solid #1e293b', objectFit: 'cover' },
    name: { fontSize: '32pt', fontWeight: 'bold', color: '#1e293b', margin: 0 },
    session: { fontSize: '12pt', color: '#64748b', marginTop: '5mm' },
    footer: { display: 'flex', justifyContent: 'space-between', marginTop: 'auto' },
    sig: { width: '60mm' },
    sigName: { fontSize: '10pt', color: '#64748b', marginBottom: '15mm' },
    line: { borderBottom: '1px solid #94a3b8' }
};
