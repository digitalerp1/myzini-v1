import React from 'react';
import { Student, OwnerProfile } from '../../../types';

interface IdCardTemplateProps {
    student: Student;
    school: OwnerProfile;
}

const defaultLogo = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzAzMDcyYyI+PHBhdGggZD0iTTEyIDJsLTggNGw4IDQgOC00LTgtNHptMCAxOEw0IDE2djRsOCA0IDgtNHYtNGwtOCA0eiIvPjwvc3ZnPg==";
const guillochePattern = "data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e0e7ff' fill-opacity='0.4'%3E%3Cpath d='M80 0v80H0V0h80zM40 0c22.09 0 40 17.91 40 40S62.09 80 40 80 0 62.09 0 40 17.91 0 40 0z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E";

export const IdCardTemplateOfficial: React.FC<IdCardTemplateProps> = ({ student, school }) => {
    const studentPhoto = student.photo_url || `https://ui-avatars.com/api/?name=${student.name}&background=e8e8e8&color=555&size=128&bold=true`;
    const schoolLogo = school.school_image_url || defaultLogo;

    return (
        <div style={styles.card}>
            <div style={styles.header}>
                <img src={schoolLogo} alt="School Logo" style={styles.logo} crossOrigin="anonymous"/>
                <div style={styles.schoolInfo}>
                    <h1 style={styles.schoolName}>{school.school_name}</h1>
                    <p style={styles.schoolAddress}>{school.address}</p>
                </div>
            </div>
            
            <div style={styles.content}>
                <div style={styles.leftPanel}>
                     <img src={studentPhoto} alt="Student" style={styles.studentPhoto} crossOrigin="anonymous"/>
                     <div style={styles.signatureBox}>
                         <p style={styles.signaturePlaceholder}>Principal's Signature</p>
                     </div>
                </div>
                <div style={styles.rightPanel}>
                    <h2 style={styles.studentName}>{student.name}</h2>
                    <hr style={styles.divider} />
                    <div style={styles.detailsGrid}>
                        <DetailItem label="Class" value={student.class} />
                        <DetailItem label="Roll No" value={student.roll_number} />
                        <DetailItem label="Father's Name" value={student.father_name} />
                        <DetailItem label="D.O.B." value={student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : 'N/A'} />
                        <DetailItem label="Contact" value={student.mobile} />
                        <DetailItem label="Address" value={student.address} />
                    </div>
                </div>
            </div>
            
            <div style={styles.footer}>
                <p>STUDENT IDENTITY CARD</p>
            </div>
        </div>
    );
};

const DetailItem: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => (
    <div>
        <p style={styles.detailLabel}>{label}</p>
        <p style={styles.detailValue}>{value || 'N/A'}</p>
    </div>
);

const styles: { [key: string]: React.CSSProperties } = {
    card: {
        width: '85.6mm',
        height: '53.98mm',
        backgroundColor: '#f8fafc',
        border: '1px solid #9ca3af',
        borderRadius: '8px',
        fontFamily: '"Times New Roman", Times, serif',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxSizing: 'border-box',
        backgroundImage: `url("${guillochePattern}")`,
    },
    header: {
        backgroundColor: '#1e293b',
        color: 'white',
        padding: '4px 8px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        borderBottom: '2px solid #eab308'
    },
    logo: {
        width: '32px',
        height: '32px',
        objectFit: 'contain',
        backgroundColor: 'white',
        borderRadius: '4px',
        padding: '2px'
    },
    schoolInfo: { lineHeight: '1.2', flex: 1, overflow: 'hidden' },
    schoolName: { fontSize: '12px', fontWeight: 'bold', margin: 0, textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    schoolAddress: { fontSize: '7px', margin: 0, opacity: 0.8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    content: {
        flexGrow: 1,
        display: 'flex',
    },
    leftPanel: {
        width: '25mm',
        padding: '4px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRight: '1px solid #e2e8f0',
    },
    studentPhoto: {
        width: '22mm',
        height: '28mm',
        objectFit: 'cover',
        border: '2px solid #1e293b',
    },
    signatureBox: {
        borderTop: '1px solid #64748b',
        width: '100%',
        paddingTop: '2px',
        marginTop: '2px',
    },
    signaturePlaceholder: {
        fontSize: '6px',
        textAlign: 'center',
        margin: 0,
        color: '#475569'
    },
    rightPanel: {
        flex: 1,
        padding: '5px 8px',
    },
    studentName: {
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#020617',
        margin: 0,
        textAlign: 'center',
    },
    divider: {
        border: 0,
        borderTop: '1.5px solid #eab308',
        margin: '3px 0',
    },
    detailsGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1px 8px',
        marginTop: '3px',
    },
    detailLabel: {
        fontSize: '7px',
        color: '#475569',
        margin: 0,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    detailValue: {
        fontSize: '9px',
        color: '#1e293b',
        margin: 0,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    footer: {
        backgroundColor: '#1e293b',
        color: '#eab308',
        textAlign: 'center',
        padding: '2px',
        fontSize: '8px',
        fontWeight: 'bold',
        letterSpacing: '1px',
    },
};