import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Student, OwnerProfile } from '../../../types';
import { QualifiedStudent } from '../../../services/pdfService';

interface CertificateTemplateProps extends QualifiedStudent {
    school: OwnerProfile;
    sessionYear: string;
    examName: string;
}

const ribbonImage = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBkPSJNNTAgMEM3Ny42IDAgMTAwIDIyLjQgMTAwIDUwUzc3LjYgMTAwIDUwIDEwMCAwIDc3LjYgMCA1MCAyMi40IDAgNTAgMFoiIGZpbGw9IiNkYzI2MjYiLz48cGF0aCBkPSJNNTAgMTBMNTUgMzVMODAgMzBMNjUgNTBMODUgNjVMNTUgNzBMNTAgOTVMNDUgNzBMMTUgNjVMMzUgNTBMMTkgMzBMMDQ1IDM1WiIgZmlsbD0iI2ZkZTg5ZiIvPjwvc3ZnPg==";

export const CertificateTemplateAchievement: React.FC<CertificateTemplateProps> = ({ student, school, division, sessionYear, examName }) => {
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
            <div style={styles.content}>
                <div style={styles.header}>
                    <div style={styles.headerText}>
                        <h1 style={styles.schoolName}>{school.school_name}</h1>
                        <p style={styles.session}>Academic Session: {sessionYear}</p>
                    </div>
                </div>

                <div style={styles.main}>
                    <div style={styles.left}>
                        <p style={styles.proudlyPresented}>PROUDLY PRESENTED TO</p>
                        <h2 style={styles.studentName}>{student.name}</h2>
                        <p style={styles.bodyText}>
                            For exceptional performance and achieving the
                        </p>
                        <p style={styles.division}>{division}</p>
                    </div>
                    <div style={styles.right}>
                        <img src={studentPhoto} alt="Student" style={styles.studentPhoto} crossOrigin="anonymous"/>
                        <img src={ribbonImage} alt="Ribbon" style={styles.ribbon}/>
                    </div>
                </div>

                <div style={styles.footer}>
                    <div style={styles.signatureBlock}>
                        <p style={styles.signatureLine}></p>
                        <p style={styles.signatureLabel}>Principal</p>
                    </div>
                    {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" style={styles.qrCode} />}
                    <div style={styles.signatureBlock}>
                        <p style={styles.signatureLine}></p>
                        <p style={styles.signatureLabel}>Date</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    page: { fontFamily: '"Montserrat", "Segoe UI", sans-serif', width: '297mm', height: '210mm', padding: '10mm', boxSizing: 'border-box', backgroundColor: '#f8fafc' },
    content: { border: '1px solid #d1d5db', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '12mm', boxSizing: 'border-box', backgroundColor: 'white' },
    header: { borderBottom: '4px solid #b91c1c', paddingBottom: '4mm' },
    headerText: { textAlign: 'center' },
    schoolName: { fontSize: '24pt', fontWeight: 800, margin: 0, color: '#111827', textTransform: 'uppercase' },
    session: { fontSize: '11pt', margin: '1mm 0 0 0', color: '#6b7280' },
    main: { display: 'flex', flexGrow: 1, alignItems: 'center' },
    left: { flex: 2, paddingRight: '10mm' },
    right: { flex: 1, textAlign: 'center', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    proudlyPresented: { fontSize: '12pt', color: '#6b7280', margin: 0, fontWeight: 500 },
    studentName: { fontSize: '36pt', fontWeight: 800, margin: '4mm 0', color: '#b91c1c', lineHeight: 1.1 },
    bodyText: { fontSize: '14pt', margin: 0, color: '#374151', lineHeight: 1.5 },
    division: { fontSize: '20pt', fontWeight: 700, margin: '2mm 0 0 0', color: '#111827' },
    studentPhoto: { width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #fde89f' },
    ribbon: { width: '100px', height: '100px', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.8 },
    footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '5mm' },
    signatureBlock: {},
    signatureLine: { borderBottom: '1.5px solid #374151', width: '60mm' },
    signatureLabel: { fontSize: '10pt', color: '#4b5563', margin: '2mm 0 0 0' },
    qrCode: { width: '70px', height: '70px' },
};