
import React from 'react';
import { ProgressCardData } from '../../../services/pdfService';

const ProgressCardTemplateVibrant: React.FC<{ data: ProgressCardData }> = ({ data }) => {
    const { student, school, attendanceReport, examReport } = data;

    const avgScore = examReport.length > 0 
        ? (examReport.reduce((a, b) => a + b.percentage, 0) / examReport.length).toFixed(1) 
        : '0';

    return (
        <div style={styles.page}>
            <div style={styles.leftPanel}>
                <div style={styles.profileCircle}>
                    {student.photo_url && <img src={student.photo_url} style={styles.photo} alt="Profile" crossOrigin="anonymous"/>}
                </div>
                <h2 style={styles.name}>{student.name}</h2>
                <p style={styles.details}>{student.class}</p>
                <p style={styles.details}>Roll: {student.roll_number}</p>
                
                <div style={styles.scoreCard}>
                    <p style={styles.scoreLabel}>AVG SCORE</p>
                    <p style={styles.scoreVal}>{avgScore}%</p>
                </div>
            </div>
            
            <div style={styles.rightPanel}>
                <div style={styles.header}>
                    <h1 style={styles.school}>{school.school_name}</h1>
                </div>

                <div style={styles.grid}>
                    <div style={styles.box}>
                        <h3 style={styles.boxTitle}>Exam Performance</h3>
                        <div style={styles.chart}>
                            {examReport.map((ex, i) => (
                                <div key={i} style={styles.barRow}>
                                    <span style={styles.barLabel}>{ex.examName}</span>
                                    <div style={styles.track}>
                                        <div style={{...styles.fill, width: `${ex.percentage}%`}}></div>
                                    </div>
                                    <span style={styles.barVal}>{ex.percentage}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={styles.box}>
                        <h3 style={styles.boxTitle}>Monthly Attendance</h3>
                        <div style={styles.attGrid}>
                            {attendanceReport.map((att, i) => (
                                <div key={i} style={styles.attCell}>
                                    <span style={styles.attMonth}>{att.month}</span>
                                    <span style={styles.attVal}>{att.present} Days</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    page: { width: '100%', height: '100%', display: 'flex', fontFamily: 'Arial, sans-serif', backgroundColor: '#fff' },
    leftPanel: { width: '30%', backgroundColor: '#22c55e', padding: '30px', boxSizing: 'border-box', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' },
    profileCircle: { width: '120px', height: '120px', backgroundColor: 'white', borderRadius: '50%', padding: '5px', marginBottom: '20px' },
    photo: { width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' },
    name: { fontSize: '20pt', margin: '0 0 10px 0' },
    details: { fontSize: '12pt', margin: '0 0 5px 0', opacity: 0.9 },
    scoreCard: { marginTop: '50px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '20px', borderRadius: '10px', width: '100%' },
    scoreLabel: { fontSize: '10pt', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 },
    scoreVal: { fontSize: '36pt', fontWeight: 'bold', margin: '10px 0 0 0' },
    rightPanel: { width: '70%', padding: '30px', boxSizing: 'border-box' },
    header: { borderBottom: '2px solid #f0f0f0', paddingBottom: '20px', marginBottom: '30px' },
    school: { margin: 0, color: '#333', fontSize: '24pt' },
    grid: { display: 'flex', flexDirection: 'column', gap: '30px' },
    box: { border: '1px solid #f0f0f0', borderRadius: '10px', padding: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' },
    boxTitle: { margin: '0 0 20px 0', color: '#22c55e', textTransform: 'uppercase', fontSize: '12pt' },
    chart: { display: 'flex', flexDirection: 'column', gap: '15px' },
    barRow: { display: 'flex', alignItems: 'center', gap: '10px' },
    barLabel: { width: '100px', fontSize: '10pt', color: '#555' },
    track: { flex: 1, height: '10px', backgroundColor: '#f0fdf4', borderRadius: '5px' },
    fill: { height: '100%', backgroundColor: '#22c55e', borderRadius: '5px' },
    barVal: { width: '40px', textAlign: 'right', fontSize: '10pt', fontWeight: 'bold', color: '#333' },
    attGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' },
    attCell: { textAlign: 'center', padding: '10px', backgroundColor: '#f0fdf4', borderRadius: '8px' },
    attMonth: { display: 'block', fontWeight: 'bold', color: '#166534', marginBottom: '5px' },
    attVal: { fontSize: '9pt', color: '#333' }
};

export { ProgressCardTemplateVibrant };
