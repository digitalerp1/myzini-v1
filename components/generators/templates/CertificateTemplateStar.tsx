
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { OwnerProfile } from '../../../types';
import { QualifiedStudent } from '../../../services/pdfService';

interface CertificateTemplateProps extends QualifiedStudent {
    school: OwnerProfile;
    examName: string;
    sessionYear: string;
}

export const CertificateTemplateStar: React.FC<CertificateTemplateProps> = ({ student, school, division, examName, sessionYear }) => {
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const studentPhoto = student.photo_url || `https://ui-avatars.com/api/?name=${student.name}&background=e8e8e8&color=555&size=128&bold=true`;
    const schoolLogo = school.school_image_url;

    useEffect(() => {
        QRCode.toDataURL(`${student.name}-${division}`, { width: 100, margin: 1 }).then(setQrCodeUrl);
    }, [student]);

    return (
        <div style={styles.page}>
            <div style={styles.cornerStarTL}>★</div>
            <div style={styles.cornerStarTR}>★</div>
            <div style={styles.cornerStarBL}>★</div>
            <div style={styles.cornerStarBR}>★</div>

            <div style={styles.content}>
                <div style={styles.header}>
                    {schoolLogo && <img src={schoolLogo} style={styles.logo} crossOrigin="anonymous" alt="Logo"/>}
                    <h1 style={styles.schoolName}>{school.school_name}</h1>
                </div>

                <div style={styles.starBadge}>STAR PERFORMER</div>

                <div style={styles.body}>
                    <p style={styles.text}>Awarded To</p>
                    <div style={styles.student}>
                        <img src={studentPhoto} style={styles.photo} crossOrigin="anonymous" alt="Student"/>
                        <h1 style={styles.name}>{student.name}</h1>
                    </div>
                    <p style={styles.text}>
                        Congratulations on securing<br/>
                        <strong>{division}</strong><br/>
                        in {examName} ({sessionYear})
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
    page: { width: '297mm', height: '210mm', backgroundColor: '#f0f9ff', padding: '15mm', boxSizing: 'border-box', fontFamily: '"Verdana", sans-serif', position: 'relative', overflow: 'hidden' },
    cornerStarTL: { position: 'absolute', top: '5mm', left: '5mm', fontSize: '40pt', color: '#facc15' },
    cornerStarTR: { position: 'absolute', top: '5mm', right: '5mm', fontSize: '40pt', color: '#facc15' },
    cornerStarBL: { position: 'absolute', bottom: '5mm', left: '5mm', fontSize: '40pt', color: '#facc15' },
    cornerStarBR: { position: 'absolute', bottom: '5mm', right: '5mm', fontSize: '40pt', color: '#facc15' },
    content: { border: '4px solid #0ea5e9', height: '100%', borderRadius: '20px', padding: '10mm', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#fff' },
    header: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5mm' },
    logo: { width: '50px', height: '50px', objectFit: 'contain' },
    schoolName: { fontSize: '20pt', fontWeight: 'bold', color: '#0369a1', margin: 0 },
    starBadge: { backgroundColor: '#facc15', color: '#fff', padding: '5px 20px', borderRadius: '20px', fontSize: '16pt', fontWeight: 'bold', margin: '5mm 0', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
    body: { textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
    text: { fontSize: '16pt', color: '#555', margin: '5mm 0' },
    student: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' },
    photo: { width: '80px', height: '80px', borderRadius: '50%', border: '4px solid #0ea5e9', objectFit: 'cover' },
    name: { fontSize: '32pt', color: '#0ea5e9', margin: 0 },
    footer: { width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto' },
    sig: { width: '50mm', textAlign: 'center' },
    line: { borderBottom: '2px solid #0369a1', marginBottom: '2mm' },
    qr: { width: '60px', height: '60px' }
};
