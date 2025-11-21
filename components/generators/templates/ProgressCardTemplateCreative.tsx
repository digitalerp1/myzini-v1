
import React from 'react';
import { ProgressCardData } from '../../../services/pdfService';

const ProgressCardTemplateCreative: React.FC<{ data: ProgressCardData }> = ({ data }) => {
    const { student, school, attendanceReport, examReport } = data;

    // Chart Colors
    const colors = ['#f43f5e', '#8b5cf6', '#0ea5e9', '#10b981', '#f59e0b'];

    return (
        <div style={styles.page}>
            <div style={styles.topBar}></div>
            <div style={styles.container}>
                <header style={styles.header}>
                    <h1 style={styles.schoolName}>{school.school_name}</h1>
                    <div style={styles.tag}>Student Progress Profile</div>
                </header>

                <div style={styles.hero}>
                    {student.photo_url && <img src={student.photo_url} style={styles.photo} alt="Profile" crossOrigin="anonymous"/>}
                    <div style={styles.heroInfo}>
                        <h2 style={styles.name}>{student.name}</h2>
                        <p style={styles.classDetail}>{student.class} | Roll: {student.roll_number}</p>
                    </div>
                </div>

                <div style={styles.grid}>
                    {/* Exam Section */}
                    <div style={styles.card}>
                        <h3 style={styles.cardHeader}>Academic Milestones</h3>
                        <div style={styles.examList}>
                            {examReport.map((exam, i) => (
                                <div key={i} style={styles.examItem}>
                                    <div style={styles.examInfo}>
                                        <span>{exam.examName}</span>
                                        <strong>{exam.percentage.toFixed(1)}%</strong>
                                    </div>
                                    <div style={styles.progressBar}>
                                        <div style={{...styles.progressFill, width: `${exam.percentage}%`, backgroundColor: colors[i % colors.length]}}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Attendance Section */}
                    <div style={styles.card}>
                        <h3 style={styles.cardHeader}>Attendance Log</h3>
                        <div style={styles.attList}>
                            {attendanceReport.slice(0, 6).map((m, i) => ( // Show first 6 months to fit creative layout
                                <div key={i} style={styles.attItem}>
                                    <div style={styles.attMonth}>{m.month}</div>
                                    <div style={styles.attDots}>
                                        <span style={{color: '#10b981'}}>P:{m.present}</span>
                                        <span style={{color: '#ef4444'}}>A:{m.absent}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <footer style={styles.footer}>
                    <p>Keep pushing your limits!</p>
                </footer>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    page: { width: '100%', height: '100%', backgroundColor: '#fff1f2', fontFamily: '"Quicksand", sans-serif', boxSizing: 'border-box' },
    topBar: { height: '15mm', backgroundColor: '#be123c' },
    container: { padding: '20px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    schoolName: { fontSize: '22pt', fontWeight: 'bold', color: '#be123c', margin: 0 },
    tag: { backgroundColor: '#fb7185', color: 'white', padding: '5px 15px', borderRadius: '20px', fontWeight: 'bold' },
    hero: { display: 'flex', alignItems: 'center', backgroundColor: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '20px' },
    photo: { width: '80px', height: '80px', borderRadius: '15px', objectFit: 'cover', marginRight: '20px' },
    heroInfo: { flex: 1 },
    name: { margin: 0, fontSize: '20pt', color: '#111827' },
    classDetail: { margin: '5px 0 0 0', fontSize: '12pt', color: '#6b7280' },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
    card: { backgroundColor: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
    cardHeader: { margin: '0 0 15px 0', color: '#be123c', fontSize: '14pt' },
    examList: { display: 'flex', flexDirection: 'column', gap: '15px' },
    examItem: { display: 'flex', flexDirection: 'column', gap: '5px' },
    examInfo: { display: 'flex', justifyContent: 'space-between', fontSize: '11pt' },
    progressBar: { height: '8px', backgroundColor: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: '4px' },
    attList: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
    attItem: { backgroundColor: '#fff1f2', padding: '10px', borderRadius: '8px', textAlign: 'center' },
    attMonth: { fontWeight: 'bold', color: '#be123c', marginBottom: '5px' },
    attDots: { fontSize: '9pt', display: 'flex', justifyContent: 'space-around', fontWeight: 'bold' },
    footer: { marginTop: '30px', textAlign: 'center', color: '#9f1239', fontStyle: 'italic', fontSize: '12pt' }
};

export { ProgressCardTemplateCreative };
