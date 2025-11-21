
import React from 'react';
import { ProgressCardData } from '../../../services/pdfService';

const commonStyles: {[key:string]: React.CSSProperties} = {
    page: { width: '210mm', height: '297mm', padding: '10mm', boxSizing: 'border-box', backgroundColor: '#fff', fontFamily: 'Arial, sans-serif' },
};

// --- Template 6: Creative Splash ---
export const ProgressTemplate6: React.FC<{ data: ProgressCardData }> = ({ data }) => {
    const { student, school, detailedExams } = data;
    return (
        <div style={commonStyles.page}>
            <div style={{position: 'relative', overflow: 'hidden', height: '100%', border: '4px solid #f472b6', padding: '20px', borderRadius: '15px'}}>
                <div style={{textAlign: 'center', color: '#db2777'}}>
                    <h1 style={{fontSize: '24pt', margin: 0, fontFamily: 'Comic Sans MS, cursive'}}>{school.school_name}</h1>
                    <p>Student Progress Report</p>
                </div>
                
                <div style={{textAlign: 'center', margin: '20px 0'}}>
                    {student.photo_url && <img src={student.photo_url} style={{width: '100px', height: '100px', borderRadius: '50%', border: '4px solid #fbcfe8', objectFit: 'cover'}} crossOrigin="anonymous" alt="Student"/>}
                    <h2 style={{color: '#be185d', margin: '5px 0'}}>{student.name}</h2>
                    <p style={{backgroundColor: '#fce7f3', display: 'inline-block', padding: '5px 15px', borderRadius: '15px', color: '#db2777'}}>Class: {student.class}</p>
                </div>

                <div style={{display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center'}}>
                    {detailedExams?.map((exam, i) => (
                        <div key={i} style={{width: '45%', border: '2px dashed #f472b6', borderRadius: '10px', padding: '10px', backgroundColor: '#fff1f2'}}>
                            <h3 style={{textAlign: 'center', color: '#db2777', margin: '0 0 10px'}}>{exam.examName}</h3>
                            <div style={{textAlign: 'center', fontSize: '24pt', fontWeight: 'bold', color: '#be185d'}}>{exam.percentage.toFixed(0)}%</div>
                            <p style={{textAlign: 'center', margin: 0, fontSize: '9pt'}}>Aggregate Score</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- Template 7: Kids Joy ---
export const ProgressTemplate7: React.FC<{ data: ProgressCardData }> = ({ data }) => {
    const { student, school, detailedExams } = data;
    const colors = ['#fee2e2', '#fef3c7', '#dcfce7', '#dbeafe'];
    
    return (
        <div style={commonStyles.page}>
            <div style={{border: '5px solid #f59e0b', borderRadius: '20px', height: '100%', padding: '20px', boxSizing: 'border-box'}}>
                <div style={{display: 'flex', alignItems: 'center', marginBottom: '20px'}}>
                    <div style={{fontSize: '40px'}}>🌟</div>
                    <div style={{flex: 1, textAlign: 'center'}}>
                        <h1 style={{color: '#d97706', margin: 0}}>{school.school_name}</h1>
                        <p>My Learning Journey</p>
                    </div>
                    <div style={{fontSize: '40px'}}>🌟</div>
                </div>

                <div style={{display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px', backgroundColor: '#fffbeb', padding: '10px', borderRadius: '10px'}}>
                    {student.photo_url && <img src={student.photo_url} style={{width: '80px', height: '80px', borderRadius: '10px', border: '2px solid #f59e0b', objectFit: 'cover'}} crossOrigin="anonymous" alt="Student"/>}
                    <div>
                        <h2 style={{margin: 0, color: '#b45309'}}>{student.name}</h2>
                        <p style={{margin: 0}}>Class: {student.class}</p>
                    </div>
                </div>

                {detailedExams?.map((exam, i) => (
                    <div key={i} style={{marginBottom: '15px', backgroundColor: colors[i % colors.length], padding: '10px', borderRadius: '10px'}}>
                        <h3 style={{margin: '0 0 5px'}}>{exam.examName}</h3>
                        <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                            {exam.subjects.map((s, j) => (
                                <div key={j} style={{backgroundColor: 'white', padding: '5px 10px', borderRadius: '5px', fontSize: '10pt', boxShadow: '0 1px 2px rgba(0,0,0,0.1)'}}>
                                    <strong>{s.name}</strong>: {s.obtained}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Template 8: Sunny Orange ---
export const ProgressTemplate8: React.FC<{ data: ProgressCardData }> = ({ data }) => {
    const { student, school, detailedExams } = data;
    return (
        <div style={commonStyles.page}>
            <div style={{backgroundColor: '#ffedd5', height: '150px', padding: '20px', display: 'flex', alignItems: 'center'}}>
                <div style={{flex: 1}}>
                    <h1 style={{color: '#c2410c', margin: 0}}>{school.school_name}</h1>
                    <p style={{color: '#9a3412'}}>Academic Performance Report</p>
                </div>
            </div>
            <div style={{padding: '20px', marginTop: '-50px'}}>
                <div style={{backgroundColor: 'white', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '20px'}}>
                    {student.photo_url && <img src={student.photo_url} style={{width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover'}} crossOrigin="anonymous" alt="Student"/>}
                    <div>
                        <h2 style={{margin: 0}}>{student.name}</h2>
                        <p style={{margin: 0, color: '#666'}}>{student.class} | Roll No: {student.roll_number}</p>
                    </div>
                </div>

                <div style={{marginTop: '30px'}}>
                    <table style={{width: '100%', borderCollapse: 'collapse'}}>
                        <thead>
                            <tr style={{backgroundColor: '#fdba74', color: '#fff'}}>
                                <th style={{padding: '10px', textAlign: 'left'}}>Exam / Subject</th>
                                <th style={{padding: '10px', textAlign: 'center'}}>Total</th>
                                <th style={{padding: '10px', textAlign: 'center'}}>Obtained</th>
                            </tr>
                        </thead>
                        <tbody>
                            {detailedExams?.map((exam, i) => (
                                <React.Fragment key={i}>
                                    <tr style={{backgroundColor: '#fff7ed'}}>
                                        <td colSpan={3} style={{padding: '10px', fontWeight: 'bold', color: '#c2410c'}}>{exam.examName}</td>
                                    </tr>
                                    {exam.subjects.map((s, j) => (
                                        <tr key={j} style={{borderBottom: '1px solid #eee'}}>
                                            <td style={{padding: '8px 20px'}}>{s.name}</td>
                                            <td style={{padding: '8px', textAlign: 'center'}}>{s.total}</td>
                                            <td style={{padding: '8px', textAlign: 'center'}}>{s.obtained}</td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// --- Template 9: Purple Haze ---
export const ProgressTemplate9: React.FC<{ data: ProgressCardData }> = ({ data }) => {
    const { student, school, examReport } = data;
    return (
        <div style={{...commonStyles.page, backgroundColor: '#faf5ff'}}>
            <div style={{textAlign: 'center', padding: '20px'}}>
                <h1 style={{color: '#6b21a8', textTransform: 'uppercase', letterSpacing: '2px'}}>{school.school_name}</h1>
                <div style={{width: '50px', height: '3px', backgroundColor: '#d8b4fe', margin: '10px auto'}}></div>
                <h2>Student Report Card</h2>
            </div>

            <div style={{display: 'flex', justifyContent: 'center', margin: '20px 0'}}>
                <div style={{textAlign: 'center'}}>
                    {student.photo_url && <img src={student.photo_url} style={{width: '120px', height: '120px', borderRadius: '50%', border: '5px solid #e9d5ff', objectFit: 'cover'}} crossOrigin="anonymous" alt="Student"/>}
                    <h2 style={{margin: '10px 0', color: '#581c87'}}>{student.name}</h2>
                    <p style={{color: '#7e22ce'}}>Class: {student.class}</p>
                </div>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '0 40px'}}>
                {examReport.map((ex, i) => (
                    <div key={i} style={{backgroundColor: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(107, 33, 168, 0.1)', textAlign: 'center'}}>
                        <h3 style={{color: '#6b21a8', margin: '0 0 10px'}}>{ex.examName}</h3>
                        <div style={{width: '80px', height: '80px', borderRadius: '50%', border: '5px solid #d8b4fe', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: '16pt', fontWeight: 'bold', color: '#581c87'}}>
                            {ex.percentage.toFixed(0)}%
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Template 10: Teal Waves ---
export const ProgressTemplate10: React.FC<{ data: ProgressCardData }> = ({ data }) => {
    const { student, school, detailedExams } = data;
    return (
        <div style={commonStyles.page}>
            <div style={{height: '100%', borderLeft: '10px solid #0d9488', paddingLeft: '20px', display: 'flex', flexDirection: 'column'}}>
                <div style={{borderBottom: '2px solid #0d9488', paddingBottom: '20px', marginBottom: '20px'}}>
                    <h1 style={{color: '#0f766e', margin: 0}}>{school.school_name}</h1>
                    <p style={{color: '#115e59'}}>Comprehensive Progress Report</p>
                </div>

                <div style={{display: 'flex', gap: '30px', marginBottom: '30px'}}>
                    <div style={{flex: 1}}>
                        <p style={{fontSize: '10pt', color: '#999', margin: 0}}>STUDENT NAME</p>
                        <h2 style={{margin: '5px 0', color: '#333'}}>{student.name}</h2>
                        <p style={{fontSize: '10pt', color: '#999', margin: '15px 0 0'}}>CLASS & ROLL</p>
                        <h3 style={{margin: '5px 0', color: '#333'}}>{student.class} / {student.roll_number}</h3>
                    </div>
                    {student.photo_url && <img src={student.photo_url} style={{width: '100px', height: '120px', objectFit: 'cover', boxShadow: '5px 5px 0 #ccfbf1'}} crossOrigin="anonymous" alt="Student"/>}
                </div>

                <div style={{flex: 1}}>
                    {detailedExams?.map((exam, i) => (
                        <div key={i} style={{marginBottom: '20px'}}>
                            <h3 style={{backgroundColor: '#0d9488', color: 'white', padding: '5px 10px', display: 'inline-block', borderRadius: '5px 5px 0 0', margin: 0}}>{exam.examName}</h3>
                            <div style={{borderTop: '2px solid #0d9488', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', paddingTop: '10px'}}>
                                {exam.subjects.map((s, j) => (
                                    <div key={j} style={{backgroundColor: '#f0fdfa', padding: '8px', borderLeft: '3px solid #2dd4bf'}}>
                                        <div style={{fontSize: '9pt', color: '#666'}}>{s.name}</div>
                                        <div style={{fontWeight: 'bold', color: '#0f766e'}}>{s.obtained} / {s.total}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
