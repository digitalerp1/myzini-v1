
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { OwnerProfile } from '../../../types';
import { QualifiedStudent } from '../../../services/pdfService';

interface CertificateTemplateProps extends QualifiedStudent {
    school: OwnerProfile;
    examName: string;
    sessionYear: string;
}

const sealImage = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0NSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjY2Y0YTNiIiBzdHJva2Utd2lkdGg9IjMiLz48cGF0aCBkPSJNNTAgMTVMNTUgNDBMODAgMzVMNjAgNTVMODAgODBMNTUgNzVMNTAgOTVMNDUgNzVMMjAgODBMMzUgNTVMMjAgMzVMNDUgNDBaIiBmaWxsPSIjY2Y0YTNiIi8+PC9zdmc+";

export const CertificateTemplateProfessional3: React.FC<CertificateTemplateProps> = ({ student, school, division, examName, sessionYear }) => {
    const [qrCodeUrl, setQrCodeUrl] = useState('');

    useEffect(() => {
        const generateQrCode = async () => {
            const data = { student: student.name, division, exam: examName, session: sessionYear };
            try {
                setQrCodeUrl(await QRCode.toDataURL(JSON.stringify(data), { width: 90, margin: 1 }));
            } catch (err) { console.error(err); }
        };
        generateQrCode();
    }, [student, division, examName, sessionYear]);

    return (
        <div style={styles.page}>
            <div style={styles.frame}>
                <div style={styles.content}>
                    <div style={styles.topDecor}>
                        <img src={sealImage} style={styles.topIcon} alt="Seal" />
                    </div>
                    <h1 style={styles.schoolName}>{school.school_name}</h1>
                    <h2 style={styles.title}>CERTIFICATE OF EXCELLENCE</h2>
                    
                    <p style={styles.text}>This is to certify that</p>
                    <h1 style={styles.studentName}>{student.name}</h1>
                    
                    <p style={styles.text}>
                        has demonstrated outstanding academic performance in<br/>
                        <strong>{examName}</strong>
                    </p>
                    
                    <p style={styles.text}>and is hereby awarded the</p>
                    <h3 style={styles.division}>{division}</h3>
                    <p style={styles.session}>Academic Session {sessionYear}</p>

                    <div style={styles.footer}>
                        <div style={styles.signature}>
                            <p style={styles.sigLine}></p>
                            <p>Principal</p>
                        </div>
                        <div style={styles.qrContainer}>
                            {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" />}
                        </div>
                        <div style={styles.signature}>
                            <p style={styles.sigLine}></p>
                            <p>Class Teacher</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    page: { width: '297mm', height: '210mm', backgroundColor: '#fff', padding: '10mm', boxSizing: 'border-box', fontFamily: '"Georgia", serif', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    frame: { width: '100%', height: '100%', border: '4px solid #1f2937', padding: '2mm', boxSizing: 'border-box', borderRadius: '10px' },
    content: { width: '100%', height: '100%', border: '1px solid #1f2937', borderRadius: '8px', padding: '10mm', boxSizing: 'border-box', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundImage: 'radial-gradient(#f3f4f6 2px, transparent 2px)', backgroundSize: '20px 20px' },
    topDecor: { marginBottom: '5mm' },
    topIcon: { width: '50px', height: '50px', opacity: 0.8 },
    schoolName: { fontSize: '22pt', fontWeight: 'bold', color: '#374151', margin: '0 0 5mm 0', textTransform: 'uppercase' },
    title: { fontSize: '30pt', color: '#b45309', margin: '0 0 10mm 0', letterSpacing: '2px', borderBottom: '2px solid #b45309', paddingBottom: '2mm', display: 'inline-block' },
    text: { fontSize: '14pt', color: '#4b5563', margin: '3mm 0' },
    studentName: { fontSize: '38pt', color: '#111827', margin: '5mm 0', fontFamily: '"Great Vibes", cursive, "Georgia"', fontWeight: 'normal' },
    division: { fontSize: '24pt', color: '#047857', margin: '5mm 0', fontWeight: 'bold' },
    session: { fontSize: '12pt', color: '#6b7280', margin: '0 0 10mm 0' },
    footer: { width: '100%', display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', marginTop: 'auto' },
    signature: { textAlign: 'center', width: '60mm' },
    sigLine: { borderBottom: '1px solid #374151', marginBottom: '2mm' },
    qrContainer: { border: '2px solid #e5e7eb', padding: '2mm', borderRadius: '4px' }
};
