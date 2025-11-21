
import React, { useEffect, useState } from 'react';
import { ProgressCardData } from '../../../services/pdfService';
import QRCode from 'qrcode';

const ProgressCardTemplateClassic: React.FC<{ data: ProgressCardData }> = ({ data }) => {
    const { student, school, attendanceReport, examReport } = data;
    const [qrCodeUrl, setQrCodeUrl] = useState('');

    useEffect(() => {
        QRCode.toDataURL(`${student.name}|${student.class}|${student.roll_number}`).then(setQrCodeUrl);
    }, [student]);

    // Simple SVG Bar Chart Logic
    const maxPercentage = 100;
    const chartHeight = 150;
    const barWidth = 40;
    const gap = 20;
    const chartWidth = examReport.length * (barWidth + gap);

    return (
        <div style={styles.page}>
            <div style={styles.header}>
                <div style={styles.logoContainer}>
                    {school.school_image_url && <img src={school.school_image_url} style={styles.logo} alt="Logo" crossOrigin="anonymous"/>}
                </div>
                <div style={styles.schoolInfo}>
                    <h1 style={styles.schoolName}>{school.school_name}</h1>
                    <p style={styles.schoolAddress}>{school.address}</p>
                </div>
            </div>
            
            <div style={styles.divider}></div>
            <h2 style={styles.title}>ANNUAL PROGRESS REPORT</h2>

            <div style={styles.studentSection}>
                <div style={styles.photoContainer}>
                    {student.photo_url && <img src={student.photo_url} style={styles.photo} alt="Student" crossOrigin="anonymous"/>}
                </div>
                <div style={styles.details}>
                    <p><strong>Name:</strong> {student.name}</p>
                    <p><strong>Class:</strong> {student.class}</p>
                    <p><strong>Roll No:</strong> {student.roll_number}</p>
                    <p><strong>Father's Name:</strong> {student.father_name}</p>
                    <p><strong>DOB:</strong> {student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : ''}</p>
                </div>
                <div style={styles.qrContainer}>
                    {qrCodeUrl && <img src={qrCodeUrl} style={styles.qr} alt="QR" />}
                </div>
            </div>

            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>ATTENDANCE REPORT</h3>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Month</th>
                            <th style={styles.th}>Present</th>
                            <th style={styles.th}>Absent</th>
                            <th style={styles.th}>Holiday</th>
                        </tr>
                    </thead>
                    <tbody>
                        {attendanceReport.map((rec, i) => (
                            <tr key={i} style={i % 2 === 0 ? styles.trEven : {}}>
                                <td style={styles.td}>{rec.month}</td>
                                <td style={{...styles.td, color: 'green'}}>{rec.present}</td>
                                <td style={{...styles.td, color: 'red'}}>{rec.absent}</td>
                                <td style={styles.td}>{rec.holiday}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>ACADEMIC PERFORMANCE</h3>
                <div style={styles.chartContainer}>
                    <svg width="100%" height={chartHeight + 40} viewBox={`0 0 ${Math.max(chartWidth + 50, 400)} ${chartHeight + 40}`}>
                        {/* Y Axis Line */}
                        <line x1="40" y1="0" x2="40" y2={chartHeight} stroke="#000" strokeWidth="2" />
                        {/* X Axis Line */}
                        <line x1="40" y1={chartHeight} x2={Math.max(chartWidth + 50, 400)} y2={chartHeight} stroke="#000" strokeWidth="2" />
                        
                        {examReport.map((exam, i) => {
                            const barHeight = (exam.percentage / maxPercentage) * chartHeight;
                            const x = 60 + i * (barWidth + gap);
                            const y = chartHeight - barHeight;
                            return (
                                <g key={i}>
                                    <rect x={x} y={y} width={barWidth} height={barHeight} fill="#4f46e5" />
                                    <text x={x + barWidth / 2} y={y - 5} textAnchor="middle" fontSize="12" fill="#000">{exam.percentage.toFixed(0)}%</text>
                                    <text x={x + barWidth / 2} y={chartHeight + 15} textAnchor="middle" fontSize="10" fill="#000" style={{maxWidth: barWidth}}>{exam.examName.substring(0, 6)}</text>
                                </g>
                            );
                        })}
                    </svg>
                </div>
            </div>

            <div style={styles.footer}>
                <div style={styles.signature}>Class Teacher</div>
                <div style={styles.signature}>Principal</div>
                <div style={styles.signature}>Parent</div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    page: { padding: '20mm', fontFamily: '"Times New Roman", serif', color: '#000', width: '100%', height: '100%', boxSizing: 'border-box', border: '1px solid #ccc' },
    header: { display: 'flex', alignItems: 'center', marginBottom: '10px' },
    logoContainer: { width: '80px', height: '80px', marginRight: '20px' },
    logo: { width: '100%', height: '100%', objectFit: 'contain' },
    schoolInfo: { flex: 1, textAlign: 'center' },
    schoolName: { fontSize: '24pt', fontWeight: 'bold', margin: 0, textTransform: 'uppercase' },
    schoolAddress: { fontSize: '12pt', margin: '5px 0 0 0' },
    divider: { borderBottom: '2px solid #000', margin: '10px 0 20px 0' },
    title: { textAlign: 'center', fontSize: '18pt', fontWeight: 'bold', textDecoration: 'underline', marginBottom: '20px' },
    studentSection: { display: 'flex', border: '1px solid #000', padding: '10px', marginBottom: '20px' },
    photoContainer: { width: '100px', height: '120px', border: '1px solid #ccc', marginRight: '20px' },
    photo: { width: '100%', height: '100%', objectFit: 'cover' },
    details: { flex: 1, fontSize: '12pt', lineHeight: '1.5' },
    qrContainer: { width: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    qr: { width: '90px', height: '90px' },
    section: { marginBottom: '20px' },
    sectionTitle: { fontSize: '14pt', fontWeight: 'bold', borderBottom: '1px solid #ccc', marginBottom: '10px', paddingBottom: '5px' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '11pt' },
    th: { border: '1px solid #000', padding: '8px', backgroundColor: '#f0f0f0', textAlign: 'center' },
    td: { border: '1px solid #000', padding: '8px', textAlign: 'center' },
    trEven: { backgroundColor: '#f9f9f9' },
    chartContainer: { border: '1px solid #eee', padding: '20px', display: 'flex', justifyContent: 'center' },
    footer: { display: 'flex', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '40px' },
    signature: { borderTop: '1px solid #000', width: '150px', textAlign: 'center', paddingTop: '5px' }
};

export { ProgressCardTemplateClassic };
