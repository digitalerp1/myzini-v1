
import React from 'react';
import { ProgressCardData } from '../../../services/pdfService';

const commonStyles: {[key:string]: React.CSSProperties} = {
    page: { width: '210mm', height: '297mm', padding: '10mm', boxSizing: 'border-box', backgroundColor: '#fff', fontFamily: 'Arial, sans-serif' },
};

// --- Template 16: Elegant Gold ---
export const ProgressTemplate16: React.FC<{ data: ProgressCardData }> = ({ data }) => {
    const { student, school, detailedExams } = data;
    return (
        <div style={{...commonStyles.page, border: '2px solid #b45309', padding: '15px'}}>
            <div style={{border: '1px solid #b45309', height: '100%', padding: '15px', display: 'flex', flexDirection: 'column'}}>
                <div style={{textAlign: 'center', marginBottom: '20px'}}>
                    <h1 style={{color: '#b45309', fontFamily: '"Times New Roman", serif', fontSize: '24pt'}}>{school.school_name}</h1>
                    <div style={{width: '100px', height: '1px', backgroundColor: '#b45309', margin: '10px auto'}}></div>
                    <p>Progress Report</p>
                </div>

                <div style={{textAlign: 'center', marginBottom: '20px'}}>
                    <h2 style={{fontFamily: '"Times New Roman", serif', fontSize: '20pt'}}>{student.name}</h2>
                    <p>Class: {student.class} &nbsp;&bull;&nbsp; Roll No: {student.roll_number}</p>
                </div>

                <div style={{flex: 1}}>
                    {detailedExams?.map((exam, i) => (
                        <table key={i} style={{width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '10pt'}}>
                            <thead>
                                <tr style={{borderBottom: '1px solid #b45309'}}>
                                    <th style={{textAlign: 'left', color: '#b45309', padding: '5px'}} colSpan={3}>{exam.examName}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {exam.subjects.map((s, j) => (
                                    <tr key={j}>
                                        <td style={{padding: '5px'}}>{s.name}</td>
                                        <td style={{padding: '5px', textAlign: 'right'}}>{s.obtained}</td>
                                        <td style={{padding: '5px', textAlign: 'right', color: '#78350f'}}>/{s.total}</td>
                                    </tr>
                                ))}
                                <tr style={{borderTop: '1px solid #ccc'}}>
                                    <td style={{padding: '5px', fontWeight: 'bold'}}>Percentage</td>
                                    <td colSpan={2} style={{padding: '5px', textAlign: 'right', fontWeight: 'bold'}}>{exam.percentage.toFixed(2)}%</td>
                                </tr>
                            </tbody>
                        </table>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- Template 17: Red Badge ---
export const ProgressTemplate17: React.FC<{ data: ProgressCardData }> = ({ data }) => {
    const { student, school, detailedExams } = data;
    return (
        <div style={commonStyles.page}>
            <div style={{display: 'flex', alignItems: 'start', gap: '15px', marginBottom: '20px'}}>
                <div style={{backgroundColor: '#dc2626', color: 'white', padding: '20px', borderRadius: '0 0 10px 10px', width: '50px', textAlign: 'center', height: '80px'}}>
                    <div style={{writingMode: 'vertical-rl', textOrientation: 'upright', fontWeight: 'bold'}}>REPORT</div>
                </div>
                <div style={{flex: 1, paddingTop: '10px'}}>
                    <h1 style={{margin: 0, color: '#dc2626'}}>{school.school_name}</h1>
                    <p>Student: <strong>{student.name}</strong> ({student.class})</p>
                </div>
                {student.photo_url && <img src={student.photo_url} style={{width: '80px', height: '80px', objectFit: 'cover'}} crossOrigin="anonymous" alt="Student"/>}
            </div>

            <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px'}}>
                {detailedExams?.map((exam, i) => (
                    <div key={i} style={{border: '1px solid #fee2e2', borderRadius: '10px', padding: '15px', backgroundColor: '#fff1f2'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                            <h3 style={{margin: 0, color: '#b91c1c'}}>{exam.examName}</h3>
                            <span style={{backgroundColor: '#dc2626', color: 'white', borderRadius: '10px', padding: '2px 8px', fontSize: '9pt'}}>{exam.percentage.toFixed(0)}%</span>
                        </div>
                        <ul style={{listStyle: 'none', padding: 0, margin: 0, fontSize: '10pt'}}>
                            {exam.subjects.map((s, j) => (
                                <li key={j} style={{display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #fecaca', padding: '3px 0'}}>
                                    <span>{s.name}</span>
                                    <span>{s.obtained}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Template 18: Double Column ---
export const ProgressTemplate18: React.FC<{ data: ProgressCardData }> = ({ data }) => {
    const { student, school, detailedExams } = data;
    return (
        <div style={{...commonStyles.page, display: 'flex', flexDirection: 'column'}}>
            <header style={{backgroundColor: '#333', color: 'white', padding: '20px', textAlign: 'center'}}>
                <h1 style={{margin: 0, fontSize: '18pt'}}>{school.school_name}</h1>
            </header>
            
            <div style={{display: 'flex', padding: '20px', gap: '20px', borderBottom: '1px solid #ccc'}}>
                <div style={{flex: 1}}>
                    <h2 style={{margin: 0}}>{student.name}</h2>
                    <p>{student.class}</p>
                </div>
                <div style={{flex: 1, textAlign: 'right'}}>
                    <p>Roll: {student.roll_number}</p>
                    <p>Session: {new Date().getFullYear()}</p>
                </div>
            </div>

            <div style={{padding: '20px', columnCount: 2, columnGap: '20px', flex: 1}}>
                {detailedExams?.map((exam, i) => (
                    <div key={i} style={{breakInside: 'avoid', marginBottom: '20px', border: '1px solid #ddd', padding: '10px'}}>
                        <h3 style={{margin: '0 0 10px', borderBottom: '2px solid #333'}}>{exam.examName}</h3>
                        <table style={{width: '100%', fontSize: '10pt'}}>
                            <tbody>
                                {exam.subjects.map((s, j) => (
                                    <tr key={j}>
                                        <td>{s.name}</td>
                                        <td style={{textAlign: 'right'}}>{s.obtained}</td>
                                    </tr>
                                ))}
                                <tr style={{fontWeight: 'bold', borderTop: '1px solid #ddd'}}>
                                    <td>Total</td>
                                    <td style={{textAlign: 'right'}}>{exam.totalObtained}/{exam.maxTotal}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Template 19: Compact One ---
export const ProgressTemplate19: React.FC<{ data: ProgressCardData }> = ({ data }) => {
    const { student, school, detailedExams } = data;
    return (
        <div style={commonStyles.page}>
            <div style={{display: 'flex', borderBottom: '1px solid #000', paddingBottom: '10px'}}>
                <div style={{width: '100px', fontSize: '30pt', fontWeight: 'bold', color: '#ddd'}}>RPT</div>
                <div style={{flex: 1}}>
                    <h1 style={{margin: 0}}>{school.school_name}</h1>
                    <p style={{margin: 0}}>{student.name} - {student.class}</p>
                </div>
            </div>

            <div style={{marginTop: '20px'}}>
                {detailedExams?.map((exam, i) => (
                    <div key={i} style={{display: 'flex', alignItems: 'center', marginBottom: '10px', border: '1px solid #eee', padding: '10px'}}>
                        <div style={{width: '150px', fontWeight: 'bold'}}>{exam.examName}</div>
                        <div style={{flex: 1, display: 'flex', gap: '10px', overflowX: 'auto'}}>
                            {exam.subjects.map((s, j) => (
                                <div key={j} style={{textAlign: 'center', fontSize: '9pt'}}>
                                    <div style={{fontWeight: 'bold'}}>{s.obtained}</div>
                                    <div style={{color: '#666', fontSize: '8pt'}}>{s.name.substring(0,3)}</div>
                                </div>
                            ))}
                        </div>
                        <div style={{width: '60px', textAlign: 'right', fontWeight: 'bold', color: '#4f46e5'}}>
                            {exam.percentage.toFixed(0)}%
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Template 20: Official Seal ---
export const ProgressTemplate20: React.FC<{ data: ProgressCardData }> = ({ data }) => {
    const { student, school, detailedExams } = data;
    return (
        <div style={{...commonStyles.page, backgroundImage: 'radial-gradient(#f3f4f6 2px, transparent 2px)', backgroundSize: '20px 20px'}}>
            <div style={{border: '2px solid #000', height: '100%', padding: '20px', backgroundColor: 'white', display: 'flex', flexDirection: 'column'}}>
                <div style={{textAlign: 'center', marginBottom: '30px'}}>
                    {school.school_image_url && <img src={school.school_image_url} style={{width: '50px'}} crossOrigin="anonymous" alt="Logo"/>}
                    <h1 style={{fontSize: '20pt', textTransform: 'uppercase', letterSpacing: '2px', margin: '10px 0'}}>{school.school_name}</h1>
                    <div style={{fontSize: '14pt', borderTop: '1px solid black', borderBottom: '1px solid black', padding: '5px', display: 'inline-block'}}>OFFICIAL TRANSCRIPT</div>
                </div>

                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '11pt'}}>
                    <div>
                        <p>Student: <strong>{student.name}</strong></p>
                        <p>ID: <strong>{student.roll_number}</strong></p>
                    </div>
                    <div style={{textAlign: 'right'}}>
                        <p>Class: <strong>{student.class}</strong></p>
                        <p>Date: <strong>{new Date().toLocaleDateString()}</strong></p>
                    </div>
                </div>

                <table style={{width: '100%', borderCollapse: 'collapse', border: '1px solid #000', marginBottom: 'auto'}}>
                    <thead style={{backgroundColor: '#000', color: '#fff'}}>
                        <tr>
                            <th style={{padding: '10px', textAlign: 'left'}}>Subject</th>
                            {detailedExams?.map((ex, i) => <th key={i} style={{padding: '10px'}}>{ex.examName}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {/* Pivot table: Subjects as rows */}
                        {Array.from(new Set(detailedExams?.flatMap(e => e.subjects.map(s => s.name)))).map((sub, i) => (
                            <tr key={i} style={{borderBottom: '1px solid #ccc'}}>
                                <td style={{padding: '10px', fontWeight: 'bold'}}>{sub}</td>
                                {detailedExams?.map((ex, j) => {
                                    const s = ex.subjects.find(subj => subj.name === sub);
                                    return <td key={j} style={{padding: '10px', textAlign: 'center'}}>{s ? s.obtained : '-'}</td>
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div style={{marginTop: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end'}}>
                    <div style={{width: '100px', height: '100px', border: '2px dashed #ccc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', transform: 'rotate(-15deg)'}}>
                        SCHOOL SEAL
                    </div>
                    <div style={{textAlign: 'center'}}>
                        <div style={{borderBottom: '1px solid #000', width: '200px', marginBottom: '5px'}}></div>
                        Principal Signature
                    </div>
                </div>
            </div>
        </div>
    );
};
