
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { OwnerProfile } from '../../../types';
import { QualifiedStudent } from '../../../services/pdfService';

interface CertificateTemplateProps extends QualifiedStudent {
    school: OwnerProfile;
    examName: string;
    sessionYear: string;
}

export const CertificateTemplateVintage: React.FC<CertificateTemplateProps> = ({ student, school, division, examName, sessionYear }) => {
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const studentPhoto = student.photo_url || `https://ui-avatars.com/api/?name=${student.name}&background=e8e8e8&color=555&size=128&bold=true`;
    const schoolLogo = school.school_image_url;

    useEffect(() => {
        QRCode.toDataURL(`${student.name}-${division}`, { width: 100, margin: 1 }).then(setQrCodeUrl);
    }, [student]);

    return (
        <div style={styles.page}>
            <div style={styles.frame}>
                <div style={styles.content}>
                    <h1 style={styles.schoolName}>{school.school_name}</h1>
                    <div style={styles.divider}></div>
                    <h2 style={styles.certTitle}>Certificate of Completion</h2>
                    
                    <div style={styles.mainInfo}>
                        <img src={studentPhoto} style={styles.photo} crossOrigin="anonymous" alt="Student"/>
                        <div>
                            <p style={styles.text}>This is to certify that</p>
                            <h1 style={styles.studentName}>{student.name}</h1>
                            <p style={styles.text}>
                                has successfully completed the requirements for <strong>{examName}</strong><br/>
                                and is awarded the division of<br/>
                                <span style={styles.division}>{division}</span>
                            </p>
                        </div>
                    </div>

                    <div style={styles.bottom}>
                        <div style={styles.seal}>
                            {schoolLogo && <img src={schoolLogo} style={styles.logo} crossOrigin="anonymous" alt="Logo"/>}
                        </div>
                        <div style={styles.sigBlock}>
                            <div style={styles.line}></div>
                            <p>Principal Signature</p>
                        </div>
                        <div style={styles.qrBlock}>
                            {qrCodeUrl && <img src={qrCodeUrl} style={styles.qr} alt="QR"/>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    page: { width: '297mm', height: '210mm', backgroundColor: '#fdf6e3', padding: '10mm', boxSizing: 'border-box', fontFamily: '"Georgia", serif' },
    frame: { width: '100%', height: '100%', border: '8px double #5d4037', padding: '2mm', boxSizing: 'border-box' },
    content: { width: '100%', height: '100%', border: '2px solid #5d4037', padding: '10mm', boxSizing: 'border-box', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    schoolName: { fontSize: '26pt', color: '#3e2723', textTransform: 'uppercase', margin: '0 0 5mm' },
    divider: { width: '100px', height: '2px', backgroundColor: '#5d4037', margin: '0 auto 5mm' },
    certTitle: { fontSize: '30pt', fontStyle: 'italic', color: '#5d4037', margin: '0 0 10mm' },
    mainInfo: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '30px', margin: '5mm 0' },
    photo: { width: '90px', height: '110px', border: '4px solid #5d4037', padding: '2px', backgroundColor: '#fff' },
    text: { fontSize: '16pt', color: '#4e342e', lineHeight: 1.6 },
    studentName: { fontSize: '32pt', color: '#212121', borderBottom: '1px solid #5d4037', display: 'inline-block', margin: '5mm 0' },
    division: { fontSize: '20pt', fontWeight: 'bold', color: '#3e2723', display: 'block', marginTop: '2mm' },
    bottom: { width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto' },
    seal: { width: '80px', height: '80px', borderRadius: '50%', border: '2px solid #5d4037', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    logo: { width: '60px', height: '60px', objectFit: 'contain' },
    sigBlock: { textAlign: 'center', width: '60mm' },
    line: { borderBottom: '1px solid #5d4037', marginBottom: '2mm' },
    qrBlock: { border: '1px solid #5d4037', padding: '2px' },
    qr: { width: '60px', height: '60px' }
};
