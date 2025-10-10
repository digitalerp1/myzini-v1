import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Student, OwnerProfile } from '../../../types';
import { QualifiedStudent } from '../../../services/pdfService';

interface CertificateTemplateProps extends QualifiedStudent {
    school: OwnerProfile;
    examName: string;
    sessionYear: string;
}

const defaultLogo = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzQwNTQ2ZCI+PHBhdGggZD0iTTEyIDJsLTggNGw4IDQgOC00LTgtNHptMCAxOEw0IDE2djRsOCA0IDgtNHYtNGwtOCA0eiIvPjwvc3ZnPg==";

export const CertificateTemplateFormal: React.FC<CertificateTemplateProps> = ({ student, school, division, examName, sessionYear }) => {
    const schoolLogo = school.school_image_url || defaultLogo;
    const studentPhoto = student.photo_url || `https://ui-avatars.com/api/?name=${student.name}&background=e8e8e8&color=555&size=128&bold=true`;
    const [qrCodeUrl, setQrCodeUrl] = useState('');

    useEffect(() => {
        const generateQrCode = async () => {
            const data = {
                student: student.name,
                class: student.class,
                division: division,
                exam: examName,
                session: sessionYear,
                school: school.school_name,
            };
            try {
                setQrCodeUrl(await QRCode.toDataURL(JSON.stringify(data), { width: 120, margin: 1 }));
            } catch (err) { console.error(err); }
        };
        generateQrCode();
    }, [student, division, examName, sessionYear, school.school_name]);

    return (
        <div style={styles.page}>
            <div style={styles.border}>
                <div style={styles.content}>
                    <div style={styles.header}>
                        <img src={schoolLogo} alt="School Logo" style={styles.logo} crossOrigin="anonymous"/>
                        <div>
                            <h1 style={styles.schoolName}>{school.school_name}</h1>
                            <p style={styles.schoolAddress}>{school.address}</p>
                        </div>
                    </div>

                    <h2 style={styles.title}>Certificate of Achievement</h2>

                    <p style={styles.body}>This certificate is proudly presented to</p>
                    
                    <div style={styles.studentSection}>
                        <img src={studentPhoto} alt="Student" style={styles.studentPhoto} crossOrigin="anonymous"/>
                        <h3 style={styles.studentName}>{student.name}</h3>
                    </div>

                    <p style={styles.body}>
                        for securing the <strong>{division}</strong> in the {examName} for the academic session {sessionYear}.
                    </p>
                    
                    <div style={styles.footer}>
                        <div style={styles.signature}>
                            <p style={styles.signatureLine}></p>
                            <p>Class Teacher</p>
                        </div>
                        {qrCodeUrl ? <img src={qrCodeUrl} alt="QR Code" style={styles.qrCode} /> : <div style={styles.qrCodePlaceholder}></div>}
                        <div style={styles.signature}>
                             <p style={styles.signatureLine}></p>
                            <p>Principal</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    page: { fontFamily: '"Garamond", "Times New Roman", serif', width: '297mm', height: '210mm', padding: '10mm', boxSizing: 'border-box', backgroundColor: '#fdfbf6' },
    border: { border: '8px double #40546d', width: '100%', height: '100%', padding: '5mm', boxSizing: 'border-box' },
    content: { border: '1px solid #b38968', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '10mm', boxSizing: 'border-box' },
    header: { display: 'flex', alignItems: 'center', gap: '5mm', marginBottom: '5mm' },
    logo: { width: '50px', height: '50px', objectFit: 'contain' },
    schoolName: { fontSize: '22pt', fontWeight: 'bold', margin: 0, color: '#40546d' },
    schoolAddress: { fontSize: '10pt', margin: '1mm 0 0 0', color: '#666' },
    title: { fontSize: '26pt', color: '#b38968', margin: '2mm 0', fontStyle: 'italic' },
    body: { fontSize: '14pt', margin: '4mm 0', color: '#333' },
    studentSection: { display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '2mm 0' },
    studentPhoto: { width: '60px', height: '60px', objectFit: 'cover', borderRadius: '50%', border: '3px solid #b38968', marginBottom: '2mm' },
    studentName: { fontSize: '24pt', fontWeight: 'bold', color: '#40546d', margin: 0, borderBottom: '2px solid #b38968', paddingBottom: '2mm' },
    footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%', marginTop: 'auto' },
    signature: { fontSize: '11pt', color: '#333' },
    signatureLine: { borderBottom: '1px solid #333', width: '50mm', marginBottom: '2mm' },
    qrCode: { width: '70px', height: '70px' },
    qrCodePlaceholder: { width: '70px', height: '70px', backgroundColor: '#eee' },
};