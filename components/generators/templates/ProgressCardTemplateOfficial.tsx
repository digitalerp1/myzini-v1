
import React from 'react';
import { ProgressCardData } from '../../../services/pdfService';

const ProgressCardTemplateOfficial: React.FC<{ data: ProgressCardData }> = ({ data }) => {
    const { student, school, attendanceReport, examReport } = data;

    return (
        <div style={styles.page}>
            <div style={styles.border}>
                <div style={styles.header}>
                    {school.school_image_url && <img src={school.school_image_url} style={styles.logo} alt="Logo" crossOrigin="anonymous"/>}
                    <div style={styles.headerText}>
                        <h1 style={styles.schoolName}>{school.school_name.toUpperCase()}</h1>
                        <p style={styles.address}>{school.address}</p>
                        <h2 style={styles.reportName}>SCHOLASTIC RECORD</h2>
                    </div>
                </div>

                <table style={styles.infoTable}>
                    <tbody>
                        <tr>
                            <td style={styles.label}>Name of Student:</td>
                            <td style={styles.val}>{student.name}</td>
                            <td style={styles.label}>Roll No:</td>
                            <td style={styles.val}>{student.roll_number}</td>
                        </tr>
                        <tr>
                            <td style={styles.label}>Class & Section:</td>
                            <td style={styles.val}>{student.class}</td>
                            <td style={styles.label}>Session:</td>
                            <td style={styles.val}>{new Date().getFullYear()}</td>
                        </tr>
                    </tbody>
                </table>

                <div style={styles.section}>
                    <h3 style={styles.sectionHeader}>EXAMINATION RESULTS</h3>
                    <table style={styles.dataTable}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Examination</th>
                                <th style={styles.th}>Percentage</th>
                                <th style={styles.th}>Result</th>
                            </tr>
                        </thead>
                        <tbody>
                            {examReport.map((ex, i) => (
                                <tr key={i}>
                                    <td style={styles.td}>{ex.examName}</td>
                                    <td style={styles.tdCenter}>{ex.percentage.toFixed(2)}%</td>
                                    <td style={styles.tdCenter}>{ex.percentage >= 33 ? 'Passed' : 'Needs Improvement'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div style={styles.section}>
                    <h3 style={styles.sectionHeader}>ATTENDANCE RECORD</h3>
                    <table style={styles.dataTable}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Month</th>
                                <th style={styles.th}>Working Days</th>
                                <th style={styles.th}>Present</th>
                                <th style={styles.th}>Absent</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendanceReport.map((att, i) => {
                                const totalDays = att.present + att.absent; // Assuming holidays are excluded from 'Working Days' usually, or simplistic approach
                                return (
                                    <tr key={i}>
                                        <td style={styles.td}>{att.month}</td>
                                        <td style={styles.tdCenter}>{totalDays}</td>
                                        <td style={styles.tdCenter}>{att.present}</td>
                                        <td style={styles.tdCenter}>{att.absent}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                <div style={styles.signatures}>
                    <div style={styles.sigBlock}><div style={styles.line}></div>Class Teacher</div>
                    <div style={styles.sigBlock}><div style={styles.line}></div>Principal</div>
                    <div style={styles.sigBlock}><div style={styles.line}></div>Parent</div>
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    page: { width: '100%', height: '100%', backgroundColor: 'white', padding: '15mm', boxSizing: 'border-box', fontFamily: '"Times New Roman", serif' },
    border: { border: '2px solid black', padding: '10mm', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' },
    header: { display: 'flex', alignItems: 'center', borderBottom: '2px solid black', paddingBottom: '10px', marginBottom: '20px' },
    logo: { width: '70px', height: '70px', marginRight: '20px' },
    headerText: { flex: 1, textAlign: 'center' },
    schoolName: { fontSize: '18pt', fontWeight: 'bold', margin: 0 },
    address: { fontSize: '10pt', fontStyle: 'italic', margin: '5px 0' },
    reportName: { fontSize: '14pt', marginTop: '10px', textDecoration: 'underline' },
    infoTable: { width: '100%', marginBottom: '20px' },
    label: { fontWeight: 'bold', padding: '5px' },
    val: { borderBottom: '1px dotted black', padding: '5px' },
    section: { marginBottom: '20px' },
    sectionHeader: { fontSize: '12pt', backgroundColor: '#eee', padding: '5px', border: '1px solid black', borderBottom: 'none', margin: 0 },
    dataTable: { width: '100%', borderCollapse: 'collapse', border: '1px solid black' },
    th: { border: '1px solid black', padding: '5px', textAlign: 'left', fontSize: '10pt' },
    td: { border: '1px solid black', padding: '5px', fontSize: '10pt' },
    tdCenter: { border: '1px solid black', padding: '5px', textAlign: 'center', fontSize: '10pt' },
    signatures: { display: 'flex', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '30px' },
    sigBlock: { textAlign: 'center', width: '150px' },
    line: { borderBottom: '1px solid black', marginBottom: '5px' }
};

export { ProgressCardTemplateOfficial };
