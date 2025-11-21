
import React from 'react';
import { ProgressCardData } from '../../../services/pdfService';

const commonStyles: {[key:string]: React.CSSProperties} = {
    page: { width: '210mm', height: '297mm', padding: '10mm', boxSizing: 'border-box', backgroundColor: '#fff', fontFamily: 'Arial, sans-serif' },
};

// --- Template 11: Data Grid ---
export const ProgressTemplate11: React.FC<{ data: ProgressCardData }> = ({ data }) => {
    const { student, school, detailedExams } = data;
    return (
        <div style={commonStyles.page}>
            <h1 style={{textAlign: 'center', borderBottom: '1px solid #000', paddingBottom: '10px'}}>{school.school_name}</h1>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', margin: '20px 0', border: '1px solid #000', padding: '10px'}}>
                <div>Name: <strong>{student.name}</strong></div>
                <div>Class: <strong>{student.class}</strong></div>
                <div>Roll: <strong>{student.roll_number}</strong></div>
                <div>Father: <strong>{student.father_name}</strong></div>
            </div>

            <table style={{width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontSize: '10pt'}}>
                <thead>
                    <tr style={{backgroundColor: '#eee'}}>
                        <th style={{border: '1px solid #000', padding: '5px'}}>Subject</th>
                        {detailedExams?.map((ex, i) => (
                            <th key={i} style={{border: '1px solid #000', padding: '5px'}}>{ex.examName}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {/* Gather all unique subjects */}
                    {Array.from(new Set(detailedExams?.flatMap(e => e.subjects.map(s => s.name)))).map((subName, i) => (
                        <tr key={i}>
                            <td style={{border: '1px solid #000', padding: '5px', fontWeight: 'bold'}}>{subName}</td>
                            {detailedExams?.map((ex, j) => {
                                const sub = ex.subjects.find(s => s.name === subName);
                                return (
                                    <td key={j} style={{border: '1px solid #000', padding: '5px', textAlign: 'center'}}>
                                        {sub ? `${sub.obtained}/${sub.total}` : '-'}
                                    </td>
                                )
                            })}
                        </tr>
                    ))}
                    <tr style={{fontWeight: 'bold', backgroundColor: '#f9f9f9'}}>
                        <td style={{border: '1px solid #000', padding: '5px'}}>Percentage</td>
                        {detailedExams?.map((ex, i) => (
                            <td key={i} style={{border: '1px solid #000', padding: '5px', textAlign: 'center'}}>{ex.percentage.toFixed(1)}%</td>
                        ))}
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

// --- Template 12: Classic Ledger ---
export const ProgressTemplate12: React.FC<{ data: ProgressCardData }> = ({ data }) => {
    const { student, school, detailedExams } = data;
    return (
        <div style={{...commonStyles.page, backgroundColor: '#fffbeb', fontFamily: '"Courier New", Courier, monospace'}}>
            <div style={{border: '2px solid #78350f', padding: '20px', height: '100%', boxSizing: 'border-box'}}>
                <div style={{textAlign: 'center', marginBottom: '20px'}}>
                    <h1 style={{color: '#78350f', margin: 0}}>{school.school_name}</h1>
                    <p>ACADEMIC RECORD SHEET</p>
                </div>
                
                <div style={{marginBottom: '20px', borderBottom: '1px dashed #78350f', paddingBottom: '10px'}}>
                    Student: {student.name} | Class: {student.class} | Roll: {student.roll_number}
                </div>

                {detailedExams?.map((exam, i) => (
                    <div key={i} style={{marginBottom: '20px'}}>
                        <div style={{backgroundColor: '#78350f', color: '#fffbeb', padding: '5px'}}>:: {exam.examName} ::</div>
                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', border: '1px solid #78350f'}}>
                            {exam.subjects.map((s, j) => (
                                <div key={j} style={{padding: '5px', borderBottom: '1px dotted #78350f', borderRight: j % 2 === 0 ? '1px solid #78350f' : 'none'}}>
                                    {s.name.padEnd(15, '.')} {s.obtained}/{s.total}
                                </div>
                            ))}
                        </div>
                        <div style={{textAlign: 'right', padding: '5px', fontWeight: 'bold'}}>
                            Result: {exam.percentage.toFixed(2)}%
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Template 13: Report Style ---
export const ProgressTemplate13: React.FC<{ data: ProgressCardData }> = ({ data }) => {
    const { student, school, detailedExams } = data;
    return (
        <div style={commonStyles.page}>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '3px solid #333', paddingBottom: '10px'}}>
                {school.school_image_url && <img src={school.school_image_url} style={{width: '50px', height: '50px', objectFit: 'contain'}} crossOrigin="anonymous" alt="Logo"/>}
                <h1 style={{margin: 0, fontSize: '18pt'}}>{school.school_name}</h1>
            </div>
            
            <div style={{margin: '20px 0', padding: '15px', backgroundColor: '#f3f4f6', borderRadius: '5px'}}>
                <h2 style={{margin: '0 0 10px'}}>{student.name}</h2>
                <div style={{display: 'flex', gap: '20px'}}>
                    <span><strong>Class:</strong> {student.class}</span>
                    <span><strong>Roll:</strong> {student.roll_number}</span>
                    <span><strong>DOB:</strong> {student.date_of_birth}</span>
                </div>
            </div>

            {detailedExams?.map((exam, i) => (
                <div key={i} style={{marginBottom: '20px'}}>
                    <h3 style={{borderBottom: '1px solid #ccc', paddingBottom: '5px'}}>{exam.examName}</h3>
                    <div style={{display: 'flex', flexWrap: 'wrap', gap: '10px'}}>
                        {exam.subjects.map((s, j) => (
                            <div key={j} style={{border: '1px solid #ddd', padding: '10px', width: '120px', textAlign: 'center', borderRadius: '5px'}}>
                                <div style={{fontSize: '9pt', color: '#666'}}>{s.name}</div>
                                <div style={{fontSize: '14pt', fontWeight: 'bold'}}>{s.obtained}</div>
                                <div style={{fontSize: '8pt', color: '#999'}}>Max: {s.total}</div>
                            </div>
                        ))}
                        <div style={{border: '1px solid #333', padding: '10px', width: '120px', textAlign: 'center', borderRadius: '5px', backgroundColor: '#333', color: 'white'}}>
                            <div style={{fontSize: '9pt', opacity: 0.8}}>Percentage</div>
                            <div style={{fontSize: '14pt', fontWeight: 'bold'}}>{exam.percentage.toFixed(1)}%</div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// --- Template 14: Summary Focus ---
export const ProgressTemplate14: React.FC<{ data: ProgressCardData }> = ({ data }) => {
    const { student, school, examReport } = data;
    return (
        <div style={commonStyles.page}>
            <div style={{textAlign: 'center', padding: '20px', backgroundColor: '#e0f2fe'}}>
                <h1 style={{margin: 0, color: '#0369a1'}}>{school.school_name}</h1>
            </div>
            
            <div style={{textAlign: 'center', margin: '30px 0'}}>
                {student.photo_url && <img src={student.photo_url} style={{width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover'}} crossOrigin="anonymous" alt="Student"/>}
                <h2 style={{margin: '10px 0'}}>{student.name}</h2>
                <p>Performance Summary</p>
            </div>

            <div style={{display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap'}}>
                {examReport.map((ex, i) => {
                    const radius = 40;
                    const circumference = 2 * Math.PI * radius;
                    const offset = circumference - (ex.percentage / 100) * circumference;
                    return (
                        <div key={i} style={{textAlign: 'center'}}>
                            <svg width="100" height="100" style={{transform: 'rotate(-90deg)'}}>
                                <circle cx="50" cy="50" r={radius} stroke="#e0f2fe" strokeWidth="8" fill="none" />
                                <circle cx="50" cy="50" r={radius} stroke="#0ea5e9" strokeWidth="8" fill="none" strokeDasharray={circumference} strokeDashoffset={offset} />
                            </svg>
                            <div style={{fontWeight: 'bold', marginTop: '-60px', marginBottom: '40px'}}>{ex.percentage.toFixed(0)}%</div>
                            <p>{ex.examName}</p>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

// --- Template 15: Performance Line ---
export const ProgressTemplate15: React.FC<{ data: ProgressCardData }> = ({ data }) => {
    const { student, school, examReport } = data;
    return (
        <div style={commonStyles.page}>
            <div style={{borderBottom: '2px solid red', paddingBottom: '10px', marginBottom: '20px'}}>
                <h1 style={{margin: 0}}>{school.school_name}</h1>
            </div>
            
            <div style={{marginBottom: '30px'}}>
                <h2>{student.name}</h2>
                <p>{student.class} ({student.roll_number})</p>
            </div>

            <div style={{marginBottom: '20px'}}>
                <h3>Exam Trajectory</h3>
                <div style={{display: 'flex', alignItems: 'flex-end', height: '200px', borderLeft: '2px solid #333', borderBottom: '2px solid #333', padding: '10px', gap: '30px'}}>
                    {examReport.map((ex, i) => (
                        <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                            <div style={{width: '10px', height: '10px', backgroundColor: 'red', borderRadius: '50%', marginBottom: `${ex.percentage * 1.5}px`}}></div>
                            <div style={{height: `${ex.percentage * 1.5}px`, borderLeft: '1px dashed red', position: 'absolute', marginTop: '10px'}}></div>
                            <span style={{marginTop: '5px', fontSize: '9pt'}}>{ex.examName}</span>
                            <span style={{fontWeight: 'bold'}}>{ex.percentage.toFixed(0)}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
