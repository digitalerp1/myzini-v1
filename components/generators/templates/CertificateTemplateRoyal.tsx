
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { OwnerProfile } from '../../../types';
import { QualifiedStudent } from '../../../services/pdfService';

interface CertificateTemplateProps extends QualifiedStudent {
    school: OwnerProfile;
    examName: string;
    sessionYear: string;
}

export const CertificateTemplateRoyal: React.FC<CertificateTemplateProps> = ({ student, school, division, examName, sessionYear }) => {
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const studentPhoto = student.photo_url || `https://ui-avatars.com/api/?name=${student.name}&background=e8e8e8&color=555&size=128&bold=true`;
    const schoolLogo = school.school_image_url || "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzQzMzhjYSI+PHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6Ii8+PC9zdmc+";

    useEffect(() => {
        QRCode.toDataURL(`${student.name}-${division}`, { width: 100, margin: 1, color: { dark: '#b8860b' } }).then(setQrCodeUrl);
    }, [student]);

    return (
        <div style={styles.page}>
            <div style={styles.border}>
                <div style={styles.cornerTL}></div><div style={styles.cornerTR}></div>
                <div style={styles.cornerBL}></div><div style={styles.cornerBR}></div>
                
                <div style={styles.header}>
                    <img src={schoolLogo} style={styles.logo} crossOrigin="anonymous" alt="School"/>
                    <h1 style={styles.schoolName}>{school.school_name}</h1>
                </div>

                <h2 style={styles.title}>Certificate of Merit</h2>
                
                <div style={styles.content}>
                    <p style={styles.text}>This honor is bestowed upon</p>
                    
                    <div style={styles.studentBox}>
                        <img src={studentPhoto} style={styles.photo} crossOrigin="anonymous" alt="Student"/>
                        <h1 style={styles.studentName}>{student.name}</h1>
                    </div>

                    <p style={styles.text}>
                        For outstanding academic performance in <strong>{examName}</strong>,<br/>
                        achieving the <strong>{division}</strong><br/>
                        during the academic year {sessionYear}.
                    </p>
                </div>

                <div style={styles.footer}>
                    <div style={styles.sigBox}>
                        <div style={styles.line}></div>
                        <p>Principal</p>
                    </div>
                    {qrCodeUrl && <img src={qrCodeUrl} style={styles.qr} alt="QR"/>}
                    <div style={styles.sigBox}>
                        <div style={styles.line}></div>
                        <p>Class Teacher</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    page: { width: '297mm', height: '210mm', backgroundColor: '#fff', padding: '10mm', boxSizing: 'border-box', fontFamily: '"Times New Roman", serif' },
    border: { width: '100%', height: '100%', border: '3px solid #b8860b', padding: '10mm', boxSizing: 'border-box', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    cornerTL: { position: 'absolute', top: '5px', left: '5px', width: '30px', height: '30px', borderTop: '5px solid #b8860b', borderLeft: '5px solid #b8860b' },
    cornerTR: { position: 'absolute', top: '5px', right: '5px', width: '30px', height: '30px', borderTop: '5px solid #b8860b', borderRight: '5px solid #b8860b' },
    cornerBL: { position: 'absolute', bottom: '5px', left: '5px', width: '30px', height: '30px', borderBottom: '5px solid #b8860b', borderLeft: '5px solid #b8860b' },
    cornerBR: { position: 'absolute', bottom: '5px', right: '5px', width: '30px', height: '30px', borderBottom: '5px solid #b8860b', borderRight: '5px solid #b8860b' },
    header: { textAlign: 'center', marginBottom: '5mm' },
    logo: { width: '60px', height: '60px', objectFit: 'contain' },
    schoolName: { fontSize: '24pt', color: '#1f2937', textTransform: 'uppercase', margin: '5px 0 0' },
    title: { fontSize: '36pt', fontFamily: '"Pinyon Script", cursive, serif', color: '#b8860b', margin: '5mm 0' },
    content: { textAlign: 'center', flex: 1 },
    text: { fontSize: '16pt', color: '#4b5563', margin: '5mm 0', lineHeight: 1.5 },
    studentBox: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', margin: '10mm 0' },
    photo: { width: '80px', height: '80px', borderRadius: '50%', border: '3px solid #b8860b', objectFit: 'cover' },
    studentName: { fontSize: '32pt', fontWeight: 'bold', color: '#111827', borderBottom: '2px solid #b8860b' },
    footer: { width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto' },
    sigBox: { textAlign: 'center', width: '60mm' },
    line: { borderBottom: '1px solid #000', marginBottom: '2mm' },
    qr: { width: '70px', height: '70px' }
};
