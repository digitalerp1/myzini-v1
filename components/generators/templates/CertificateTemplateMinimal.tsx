
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { OwnerProfile } from '../../../types';
import { QualifiedStudent } from '../../../services/pdfService';

interface CertificateTemplateProps extends QualifiedStudent {
    school: OwnerProfile;
    examName: string;
    sessionYear: string;
}

export const CertificateTemplateMinimal: React.FC<CertificateTemplateProps> = ({ student, school, division, examName, sessionYear }) => {
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
                    <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                        {schoolLogo && <img src={schoolLogo} style={styles.logo} crossOrigin="anonymous" alt="Logo"/>}
                        <h1 style={styles.schoolName}>{school.school_name}</h1>
                    </div>
                    <p style={styles.date}>{new Date().toLocaleDateString()}</p>
                </div>

                <div style={styles.body}>
                    <div style={styles.leftCol}>
                        <img src={studentPhoto} style={styles.photo} crossOrigin="anonymous" alt="Student"/>
                        {qrCodeUrl && <img src={qrCodeUrl} style={styles.qr} alt="QR"/>}
                    </div>
                    <div style={styles.rightCol}>
                        <h2 style={styles.title}>Certificate of Achievement</h2>
                        <p style={styles.text}>This certifies that</p>
                        <h1 style={styles.name}>{student.name}</h1>
                        <p style={styles.text}>
                            of Class {student.class} has secured the <strong>{division}</strong>
                        </p>
                        <p style={styles.subText}>
                            in the {examName} ({sessionYear}).
                        </p>
                    </div>
                </div>

                <div style={styles.footer}>
                    <div style={styles.sig}>
                        <div style={styles.line}></div>
                        <span>Principal</span>
                    </div>
                    <div style={styles.sig}>
                        <div style={styles.line}></div>
                        <span>Coordinator</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    page: { width: '297mm', height: '210mm', backgroundColor: '#fff', padding: '15mm', boxSizing: 'border-box', fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' },
    border: { width: '100%', height: '100%', border: '1px solid #000', padding: '15mm', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '5mm', marginBottom: '10mm' },
    logo: { width: '40px', height: '40px', objectFit: 'contain' },
    schoolName: { fontSize: '16pt', fontWeight: 'bold', margin: 0 },
    date: { color: '#666', fontSize: '10pt' },
    body: { flex: 1, display: 'flex', gap: '20mm', alignItems: 'center' },
    leftCol: { display: 'flex', flexDirection: 'column', gap: '10mm', alignItems: 'center' },
    photo: { width: '120px', height: '150px', objectFit: 'cover', filter: 'grayscale(100%)' },
    qr: { width: '60px', height: '60px' },
    rightCol: { flex: 1 },
    title: { fontSize: '24pt', fontWeight: '300', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 10mm 0' },
    text: { fontSize: '14pt', color: '#333', margin: '5mm 0' },
    name: { fontSize: '40pt', fontWeight: 'bold', margin: '5mm 0', borderBottom: '4px solid #000', display: 'inline-block' },
    subText: { fontSize: '12pt', color: '#666' },
    footer: { display: 'flex', justifyContent: 'flex-end', gap: '20mm', marginTop: 'auto' },
    sig: { width: '60mm', textAlign: 'center' },
    line: { borderBottom: '1px solid #000', marginBottom: '2mm' }
};
