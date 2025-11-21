
import React from 'react';
import { ProgressCardData } from '../../../services/pdfService';

// Common types and helpers
const commonStyles: {[key:string]: React.CSSProperties} = {
    page: { width: '210mm', height: '297mm', padding: '10mm', boxSizing: 'border-box', backgroundColor: '#fff', fontFamily: 'Arial, sans-serif' },
    header: { display: 'flex', alignItems: 'center', marginBottom: '5mm' },
    logo: { width: '60px', height: '60px', objectFit: 'contain', marginRight: '15px' },
    title: { fontSize: '24pt', fontWeight: 'bold', margin: 0 },
    subTitle: { fontSize: '12pt', color: '#555' },
    studentBox: { display: 'flex', border: '1px solid #ccc', padding: '5mm', marginBottom: '5mm' },
    photo: { width: '80px', height: '100px', objectFit: 'cover', marginRight: '15px' },
    info: { flex: 1, fontSize: '11pt', lineHeight: 1.6 },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '10pt', marginBottom: '5mm' },
    th: { border: '1px solid #999', padding: '5px', backgroundColor: '#eee', textAlign: 'left' },
    td: { border: '1px solid #999', padding: '5px' },
    chartContainer: { height: '150px', display: 'flex', alignItems: 'flex-end', gap: '10px', borderLeft: '2px solid #000', borderBottom: '2px solid #000', padding: '10px' },
    bar: { width: '40px', backgroundColor: '#4f46e5', textAlign: 'center', color: 'white', fontSize: '10px' }
};

// --- Template 1: Corporate Blue ---
export const ProgressTemplate1: React.FC<{ data: ProgressCardData }> = ({ data }) => {
    const { student, school, detailedExams } = data;
    return (
        <div style={commonStyles.page}>
            <div style={{...commonStyles.header, borderBottom: '4px solid #1e3a8a', paddingBottom: '10px'}}>
                {school.school_image_url && <img src={school.school_image_url} style={commonStyles.logo} crossOrigin="anonymous" alt="Logo"/>}
                <div>
                    <h1 style={{...commonStyles.title, color: '#1e3a8a'}}>{school.school_name}</h1>
                    <p style={commonStyles.subTitle}>{school.address}</p>
                </div>
            </div>
            <h2 style={{textAlign: 'center', color: '#1e3a8a', margin: '10px 0'}}>ANNUAL PROGRESS REPORT</h2>
            
            <div style={{...commonStyles.studentBox, backgroundColor: '#eff6ff', borderColor: '#1e3a8a'}}>
                {student.photo_url && <img src={student.photo_url} style={{...commonStyles.photo, borderColor: '#1e3a8a', border: '2px solid'}} crossOrigin="anonymous" alt="Student"/>}
                <div style={commonStyles.info}>
                    <p><strong>Name:</strong> {student.name}</p>
                    <p><strong>Class:</strong> {student.class} | <strong>Roll No:</strong> {student.roll_number}</p>
                    <p><strong>Father:</strong> {student.father_name}</p>
                    <p><strong>DOB:</strong> {student.date_of_birth}</p>
                </div>
            </div>

            {detailedExams && detailedExams.map((exam, i) => (
                <div key={i} style={{marginBottom: '10px'}}>
                    <h3 style={{backgroundColor: '#1e3a8a', color: 'white', padding: '5px', margin: 0, fontSize: '12pt'}}>{exam.examName}</h3>
                    <table style={commonStyles.table}>
                        <thead>
                            <tr>
                                <th style={commonStyles.th}>Subject</th>
                                <th style={commonStyles.th}>Max</th>
                                <th style={commonStyles.th}>Obtained</th>
                            </tr>
                        </thead>
                        <tbody>
                            {exam.subjects.map((sub, j) => (
                                <tr key={j}>
                                    <td style={commonStyles.td}>{sub.name}</td>
                                    <td style={commonStyles.td}>{sub.total}</td>
                                    <td style={commonStyles.td}>{sub.obtained}</td>
                                </tr>
                            ))}
                            <tr style={{fontWeight: 'bold', backgroundColor: '#e0e7ff'}}>
                                <td style={commonStyles.td}>Total</td>
                                <td style={commonStyles.td}>{exam.maxTotal}</td>
                                <td style={commonStyles.td}>{exam.totalObtained} ({exam.percentage.toFixed(2)}%)</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
    );
};

// --- Template 2: Formal Grayscale ---
export const ProgressTemplate2: React.FC<{ data: ProgressCardData }> = ({ data }) => {
    const { student, school, detailedExams } = data;
    return (
        <div style={{...commonStyles.page, fontFamily: '"Times New Roman", serif'}}>
            <div style={{textAlign: 'center', borderBottom: '2px double #000', paddingBottom: '10px', marginBottom: '10px'}}>
                <h1 style={{fontSize: '26pt', textTransform: 'uppercase', margin: 0}}>{school.school_name}</h1>
                <p style={{fontSize: '12pt', fontStyle: 'italic'}}>{school.address}</p>
            </div>
            
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #000', paddingBottom: '10px', marginBottom: '15px'}}>
                <div style={{fontSize: '12pt', lineHeight: 1.8}}>
                    <div>Name of Student: <strong>{student.name}</strong></div>
                    <div>Class: <strong>{student.class}</strong></div>
                    <div>Roll Number: <strong>{student.roll_number}</strong></div>
                </div>
                {student.photo_url && <img src={student.photo_url} style={{width:'80px', height:'100px', border:'1px solid black', objectFit:'cover'}} crossOrigin="anonymous" alt="Student"/>}
            </div>

            <h3 style={{textAlign: 'center', textDecoration: 'underline'}}>SCHOLASTIC ACHIEVEMENT</h3>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                {detailedExams && detailedExams.map((exam, i) => (
                    <div key={i} style={{border: '1px solid #000', padding: '10px'}}>
                        <h4 style={{textAlign: 'center', margin: '0 0 5px', borderBottom: '1px solid #000'}}>{exam.examName}</h4>
                        <table style={{width: '100%', fontSize: '10pt', borderCollapse: 'collapse'}}>
                            <tbody>
                                {exam.subjects.map((sub, j) => (
                                    <tr key={j}>
                                        <td style={{padding: '4px', borderBottom: '1px dotted #ccc'}}>{sub.name}</td>
                                        <td style={{padding: '4px', borderBottom: '1px dotted #ccc', textAlign: 'right'}}>{sub.obtained}/{sub.total}</td>
                                    </tr>
                                ))}
                                <tr style={{fontWeight: 'bold'}}>
                                    <td style={{padding: '4px'}}>Percentage</td>
                                    <td style={{padding: '4px', textAlign: 'right'}}>{exam.percentage.toFixed(1)}%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Template 3: Academic Green ---
export const ProgressTemplate3: React.FC<{ data: ProgressCardData }> = ({ data }) => {
    const { student, school, examReport, detailedExams } = data;
    return (
        <div style={{...commonStyles.page, border: '5px solid #15803d'}}>
            <div style={{backgroundColor: '#15803d', color: 'white', padding: '15px', textAlign: 'center'}}>
                <h1 style={{margin: 0, fontSize: '22pt'}}>{school.school_name}</h1>
                <p style={{margin: 0}}>{school.address}</p>
            </div>
            
            <div style={{padding: '15px', display: 'flex', gap: '20px', alignItems: 'center', borderBottom: '2px solid #15803d'}}>
                {student.photo_url && <img src={student.photo_url} style={{width: '80px', height: '80px', borderRadius: '50%', border: '3px solid #15803d', objectFit: 'cover'}} crossOrigin="anonymous" alt="Student"/>}
                <div>
                    <h2 style={{margin: 0, color: '#15803d'}}>{student.name}</h2>
                    <p style={{margin: 0}}>Class: {student.class} | Roll: {student.roll_number}</p>
                </div>
            </div>

            <div style={{padding: '15px'}}>
                <h3 style={{color: '#15803d', borderBottom: '1px solid #15803d'}}>Performance Overview</h3>
                <div style={{height: '150px', display: 'flex', alignItems: 'flex-end', gap: '15px', marginBottom: '20px'}}>
                    {examReport.map((ex, i) => (
                        <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1}}>
                            <div style={{width: '100%', height: `${ex.percentage}px`, backgroundColor: '#4ade80', display: 'flex', alignItems: 'end', justifyContent: 'center'}}>
                                <span style={{fontSize: '10px', marginBottom: '5px'}}>{ex.percentage.toFixed(0)}%</span>
                            </div>
                            <span style={{fontSize: '9px', marginTop: '5px', textAlign: 'center'}}>{ex.examName}</span>
                        </div>
                    ))}
                </div>

                <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '10pt'}}>
                    <thead style={{backgroundColor: '#dcfce7'}}>
                        <tr>
                            <th style={{padding: '8px', border: '1px solid #15803d', textAlign: 'left'}}>Exam / Subject</th>
                            <th style={{padding: '8px', border: '1px solid #15803d'}}>Marks</th>
                            <th style={{padding: '8px', border: '1px solid #15803d'}}>Percentage</th>
                        </tr>
                    </thead>
                    <tbody>
                        {detailedExams?.map((exam, i) => (
                            <tr key={i}>
                                <td style={{padding: '8px', border: '1px solid #15803d', fontWeight: 'bold'}}>{exam.examName}</td>
                                <td style={{padding: '8px', border: '1px solid #15803d', textAlign: 'center'}}>{exam.totalObtained}/{exam.maxTotal}</td>
                                <td style={{padding: '8px', border: '1px solid #15803d', textAlign: 'center'}}>{exam.percentage.toFixed(2)}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- Template 4: Modern Minimal ---
export const ProgressTemplate4: React.FC<{ data: ProgressCardData }> = ({ data }) => {
    const { student, school, detailedExams } = data;
    return (
        <div style={{...commonStyles.page, fontFamily: '"Segoe UI", sans-serif', color: '#333'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px'}}>
                <div>
                    <h1 style={{fontSize: '18pt', fontWeight: 900, letterSpacing: '1px'}}>{school.school_name.toUpperCase()}</h1>
                    <p style={{fontSize: '9pt', color: '#888'}}>STUDENT PERFORMANCE REPORT</p>
                </div>
                <div style={{textAlign: 'right'}}>
                    <h2 style={{margin: 0}}>{student.name}</h2>
                    <p style={{margin: 0, color: '#666'}}>{student.class} / {student.roll_number}</p>
                </div>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px'}}>
                {detailedExams?.map((exam, i) => (
                    <div key={i} style={{backgroundColor: '#f9fafb', padding: '15px', borderRadius: '8px'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                            <h3 style={{margin: 0, fontSize: '12pt'}}>{exam.examName}</h3>
                            <span style={{fontWeight: 'bold', fontSize: '14pt', color: '#2563eb'}}>{exam.percentage.toFixed(0)}%</span>
                        </div>
                        <div style={{fontSize: '9pt'}}>
                            {exam.subjects.map((s, j) => (
                                <div key={j} style={{display: 'flex', justifyContent: 'space-between', marginBottom: '4px'}}>
                                    <span>{s.name}</span>
                                    <span><strong>{s.obtained}</strong> <span style={{color: '#999'}}>/{s.total}</span></span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <div style={{marginTop: 'auto', borderTop: '1px solid #eee', paddingTop: '10px', textAlign: 'center', fontSize: '8pt', color: '#999'}}>
                Generated on {new Date().toLocaleDateString()}
            </div>
        </div>
    );
};

// --- Template 5: Tech Dark (Print Friendly Inverted) ---
// Note: Actual dark background consumes too much ink, so we simulate "Tech" with sharp lines and monospaced fonts.
export const ProgressTemplate5: React.FC<{ data: ProgressCardData }> = ({ data }) => {
    const { student, school, detailedExams } = data;
    return (
        <div style={{...commonStyles.page, fontFamily: '"Courier New", monospace'}}>
            <div style={{border: '2px solid #000', padding: '10px', height: '100%', boxSizing: 'border-box'}}>
                <div style={{borderBottom: '2px solid #000', paddingBottom: '10px', marginBottom: '10px', textAlign: 'center'}}>
                    <h1 style={{margin: 0}}>{school.school_name}</h1>
                    <p style={{margin: 0}}>// PROGRESS_REPORT_SYSTEM_V1.0</p>
                </div>

                <div style={{display: 'flex', borderBottom: '1px dashed #000', paddingBottom: '10px', marginBottom: '10px'}}>
                    <div style={{flex: 1}}>
                        <p>ID: {student.roll_number}</p>
                        <p>NAME: {student.name.toUpperCase()}</p>
                        <p>CLASS: {student.class.toUpperCase()}</p>
                    </div>
                    <div>
                        {student.photo_url && <img src={student.photo_url} style={{width: '60px', height: '70px', filter: 'grayscale(100%)'}} crossOrigin="anonymous" alt="Student"/>}
                    </div>
                </div>

                {detailedExams?.map((exam, i) => (
                    <div key={i} style={{marginBottom: '15px'}}>
                        <p style={{backgroundColor: '#000', color: '#fff', padding: '2px 5px', margin: 0}}>> {exam.examName.toUpperCase()}</p>
                        <table style={{width: '100%', fontSize: '9pt'}}>
                            <tbody>
                                {exam.subjects.map((s, j) => (
                                    <tr key={j}>
                                        <td style={{padding: '2px'}}>{s.name}</td>
                                        <td style={{padding: '2px', textAlign: 'right'}}>
                                            {Array(Math.round((s.obtained/s.total)*10)).fill('█').join('')}
                                            {Array(10 - Math.round((s.obtained/s.total)*10)).fill('░').join('')} {s.obtained}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>
        </div>
    );
};
