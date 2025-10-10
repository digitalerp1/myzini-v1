import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Student, OwnerProfile } from '../../../types';
import { QualifiedStudent } from '../../../services/pdfService';

interface CertificateTemplateProps extends QualifiedStudent {
    school: OwnerProfile;
    examName: string;
    sessionYear: string;
}

const backgroundImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='0%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23ddf4ff;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23faf2ff;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23g)' /%3E%3C/svg%3E";

export const CertificateTemplateArtistic: React.FC<CertificateTemplateProps> = ({ student, school, division, examName, sessionYear }) => {
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
            <div style={styles.leftBlob}></div>
            <div style={styles.rightBlob}></div>
            
            <div style={styles.content}>
                <h1 style={styles.title}>Bravo!</h1>
                <p style={styles.subTitle}>This certificate of excellence is awarded to</p>

                <img src={studentPhoto} alt="Student" style={styles.studentPhoto} crossOrigin="anonymous"/>
                <h2 style={styles.studentName}>{student.name}</h2>

                <p style={styles.bodyText}>
                    for their brilliant achievement of securing the <strong>{division}</strong>.
                    Your hard work and dedication are truly inspiring!
                </p>

                <div style={styles.footer}>
                    <div style={styles.signatureBlock}>
                        <p style={styles.signature}>{school.principal_name || 'School Principal'}</p>
                        <p style={styles.signatureLabel}>Principal</p>
                    </div>
                    {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" style={styles.qrCode} />}
                     <div style={styles.signatureBlock}>
                        <p style={styles.signature}>{new Date().toLocaleDateString()}</p>
                        <p style={styles.signatureLabel}>Date of Issue</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const blobBase: React.CSSProperties = {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(60px)',
    zIndex: 0,
};

const styles: { [key: string]: React.CSSProperties } = {
    page: { fontFamily: '"Quicksand", "Segoe UI", sans-serif', width: '297mm', height: '210mm', boxSizing: 'border-box', backgroundColor: '#fff', position: 'relative', overflow: 'hidden', backgroundImage: `url("${backgroundImage}")` },
    leftBlob: { ...blobBase, width: '150mm', height: '150mm', top: '-50mm', left: '-50mm', background: 'rgba(139, 92, 246, 0.15)' },
    rightBlob: { ...blobBase, width: '180mm', height: '180mm', bottom: '-80mm', right: '-60mm', background: 'rgba(236, 72, 153, 0.15)' },
    content: { position: 'relative', zIndex: 1, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '15mm', boxSizing: 'border-box' },
    title: { fontFamily: '"Pacifico", cursive', fontSize: '46pt', margin: 0, color: '#5b21b6' },
    subTitle: { fontSize: '12pt', color: '#4b5563', margin: '3mm 0' },
    studentPhoto: { width: '60px', height: '60px', objectFit: 'cover', borderRadius: '50%', border: '3px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.15)', marginTop: '3mm' },
    studentName: { fontFamily: '"Pacifico", cursive', fontSize: '32pt', margin: '4mm 0', color: '#be185d' },
    bodyText: { fontSize: '12pt', color: '#374151', lineHeight: 1.6, maxWidth: '170mm', margin: '3mm 0' },
    footer: { display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', width: '100%', marginTop: 'auto' },
    signatureBlock: { width: '80mm' },
    signature: { fontFamily: '"Caveat", cursive', fontSize: '20pt', borderBottom: '1.5px solid #d1d5db', paddingBottom: '1mm', margin: 0, color: '#1f2937' },
    signatureLabel: { fontSize: '10pt', color: '#6b7280', margin: '2mm 0 0 0' },
    qrCode: { width: '70px', height: '70px' }
};