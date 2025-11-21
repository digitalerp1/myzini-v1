
import React, { useEffect, useState } from 'react';
import { ProgressCardData } from '../../../services/pdfService';
import QRCode from 'qrcode';

const ProgressCardTemplateModern: React.FC<{ data: ProgressCardData }> = ({ data }) => {
    const { student, school, attendanceReport, examReport } = data;
    const [qrCodeUrl, setQrCodeUrl] = useState('');

    useEffect(() => {
        QRCode.toDataURL(`${student.name}-${student.roll_number}`).then(setQrCodeUrl);
    }, [student]);

    // SVG Circle Chart for Attendance Summary
    const totalDays = attendanceReport.reduce((acc, curr) => acc + curr.present + curr.absent + curr.holiday, 0);
    const totalPresent = attendanceReport.reduce((acc, curr) => acc + curr.present, 0);
    const presentPercentage = totalDays > 0 ? (totalPresent / totalDays) * 100 : 0;
    
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (presentPercentage / 100) * circumference;

    return (
        <div style={styles.page}>
            <div style={styles.sidebar}>
                <div style={styles.profileSection}>
                    {student.photo_url && <img src={student.photo_url} style={styles.photo} alt="Student" crossOrigin="anonymous"/>}
                    <h2 style={styles.studentName}>{student.name}</h2>
                    <p style={styles.studentClass}>{student.class}</p>
                    <div style={styles.infoGrid}>
                        <p>Roll: {student.roll_number}</p>
                        <p>Phone: {student.mobile}</p>
                        <p>DOB: {student.date_of_birth}</p>
                    </div>
                </div>
                
                <div style={styles.attendanceSummary}>
                    <h3>Attendance</h3>
                    <svg width="100" height="100" viewBox="0 0 100 100" style={{transform: 'rotate(-90deg)'}}>
                        <circle cx="50" cy="50" r={radius} stroke="#e5e7eb" strokeWidth="10" fill="none" />
                        <circle cx="50" cy="50" r={radius} stroke="#10b981" strokeWidth="10" fill="none" 
                            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
                    </svg>
                    <p style={styles.attPercent}>{presentPercentage.toFixed(0)}%</p>
                    <p style={{fontSize: '10pt', color: '#fff'}}>Present</p>
                </div>

                <div style={styles.qrBox}>
                    {qrCodeUrl && <img src={qrCodeUrl} style={styles.qr} alt="QR" />}
                </div>
            </div>

            <div style={styles.mainContent}>
                <div style={styles.header}>
                    {school.school_image_url && <img src={school.school_image_url} style={styles.logo} alt="Logo" crossOrigin="anonymous"/>}
                    <div>
                        <h1 style={styles.schoolName}>{school.school_name}</h1>
                        <p style={styles.reportTitle}>Progress Report Card</p>
                    </div>
                </div>

                <div style={styles.card}>
                    <h3 style={styles.cardTitle}>Performance Overview</h3>
                    <div style={styles.chartWrapper}>
                         {/* SVG Line Chart */}
                         <svg width="100%" height="200" viewBox={`0 0 ${examReport.length * 100} 200`}>
                            <defs>
                                <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" style={{stopColor:'#3b82f6', stopOpacity:0.5}} />
                                    <stop offset="100%" style={{stopColor:'#3b82f6', stopOpacity:0}} />
                                </linearGradient>
                            </defs>
                            {/* Points */}
                            <polyline 
                                fill="url(#grad)" 
                                stroke="#3b82f6" 
                                strokeWidth="3" 
                                points={
                                    `0,200 ` + 
                                    examReport.map((ex, i) => `${i * 100 + 50},${200 - (ex.percentage * 2)}`).join(' ') + 
                                    ` ${examReport.length * 100},200`
                                } 
                            />
                            {examReport.map((ex, i) => (
                                <g key={i}>
                                    <circle cx={i * 100 + 50} cy={200 - (ex.percentage * 2)} r="4" fill="#fff" stroke="#3b82f6" strokeWidth="2" />
                                    <text x={i * 100 + 50} y={200 - (ex.percentage * 2) - 10} textAnchor="middle" fontSize="12" fill="#111">{ex.percentage}%</text>
                                    <text x={i * 100 + 50} y={220} textAnchor="middle" fontSize="10" fill="#666">{ex.examName}</text>
                                </g>
                            ))}
                         </svg>
                    </div>
                </div>

                <div style={styles.card}>
                    <h3 style={styles.cardTitle}>Monthly Attendance</h3>
                    <div style={styles.attendanceGrid}>
                        {attendanceReport.map((m, i) => (
                            <div key={i} style={styles.attBox}>
                                <p style={styles.monthName}>{m.month}</p>
                                <div style={styles.attBar}><div style={{...styles.attFill, width: `${(m.present/30)*100}%`}}></div></div>
                                <p style={{fontSize:'8pt'}}>{m.present} Days</p>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div style={styles.footer}>
                    <p>{school.address} | {school.mobile_number}</p>
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    page: { width: '100%', height: '100%', display: 'flex', fontFamily: '"Inter", sans-serif', backgroundColor: '#f3f4f6' },
    sidebar: { width: '30%', backgroundColor: '#1e293b', color: 'white', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    mainContent: { width: '70%', padding: '30px', display: 'flex', flexDirection: 'column' },
    profileSection: { textAlign: 'center', marginBottom: '30px' },
    photo: { width: '100px', height: '100px', borderRadius: '50%', border: '4px solid #3b82f6', objectFit: 'cover', marginBottom: '10px' },
    studentName: { fontSize: '18pt', margin: '5px 0' },
    studentClass: { color: '#94a3b8', fontSize: '12pt' },
    infoGrid: { marginTop: '20px', textAlign: 'left', width: '100%', fontSize: '10pt', lineHeight: '1.6' },
    attendanceSummary: { textAlign: 'center', position: 'relative', marginBottom: 'auto' },
    attPercent: { position: 'absolute', top: '50px', left: '50%', transform: 'translateX(-50%)', fontSize: '16pt', fontWeight: 'bold' },
    qrBox: { backgroundColor: 'white', padding: '10px', borderRadius: '8px', marginTop: '20px' },
    qr: { width: '80px', height: '80px' },
    header: { display: 'flex', alignItems: 'center', marginBottom: '20px' },
    logo: { width: '50px', height: '50px', marginRight: '15px', objectFit: 'contain' },
    schoolName: { fontSize: '20pt', fontWeight: 'bold', margin: 0, color: '#1e293b' },
    reportTitle: { color: '#64748b', margin: 0 },
    card: { backgroundColor: 'white', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
    cardTitle: { fontSize: '14pt', margin: '0 0 15px 0', color: '#334155' },
    chartWrapper: { padding: '10px', overflowX: 'hidden' },
    attendanceGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' },
    attBox: { textAlign: 'center', padding: '5px' },
    monthName: { fontWeight: 'bold', fontSize: '10pt', marginBottom: '5px' },
    attBar: { height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden', marginBottom: '5px' },
    attFill: { height: '100%', backgroundColor: '#3b82f6' },
    footer: { marginTop: 'auto', textAlign: 'center', color: '#94a3b8', fontSize: '9pt' }
};

export { ProgressCardTemplateModern };
