
import React from 'react';
import { ProgressCardData } from '../../../services/pdfService';

const commonStyles: {[key:string]: React.CSSProperties} = {
    page: { width: '210mm', height: '297mm', padding: '10mm', boxSizing: 'border-box', backgroundColor: '#fff', fontFamily: 'Arial, sans-serif' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '10pt' },
    th: { border: '1px solid #000', padding: '5px', textAlign: 'center', backgroundColor: '#eee' },
    td: { border: '1px solid #000', padding: '5px', textAlign: 'center' },
};

export const ProgressTemplate37: React.FC<{ data: ProgressCardData }> = ({ data }) => (
    <div style={commonStyles.page}>
        <h1 style={{textAlign: 'center', marginBottom: '5px'}}>{data.school.school_name}</h1>
        <p style={{textAlign: 'center', marginBottom: '20px'}}>ATTENDANCE & PROGRESS REPORT</p>
        
        <div style={{border: '1px solid #000', padding: '10px', marginBottom: '20px'}}>
            <p>Student: <strong>{data.student.name}</strong></p>
            <p>Class: <strong>{data.student.class}</strong></p>
        </div>

        <h3 style={{borderBottom: '1px solid #000'}}>Academic Record</h3>
        {data.detailedExams?.map((exam: any, i: number) => (
            <div key={i} style={{marginBottom: '15px'}}>
                <p style={{fontWeight: 'bold', margin: '5px 0'}}>{exam.examName}</p>
                <table style={commonStyles.table}>
                    <thead><tr><th>Subject</th><th>Max Marks</th><th>Obtained Marks</th></tr></thead>
                    <tbody>
                        {exam.subjects.map((s:any, j:number) => (
                            <tr key={j}>
                                <td style={{...commonStyles.td, textAlign: 'left'}}>{s.name}</td>
                                <td style={commonStyles.td}>{s.total}</td>
                                <td style={commonStyles.td}>{s.obtained}</td>
                            </tr>
                        ))}
                        <tr style={{fontWeight: 'bold'}}>
                            <td style={commonStyles.td}>TOTAL</td>
                            <td style={commonStyles.td}>{exam.maxTotal}</td>
                            <td style={commonStyles.td}>{exam.totalObtained}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        ))}
    </div>
);

export const ProgressTemplate38: React.FC<{ data: ProgressCardData }> = ({ data }) => (
    <div style={{...commonStyles.page, backgroundColor: '#262626', color: '#fff'}}>
        <div style={{border: '1px solid #404040', padding: '20px', height: '100%', boxSizing: 'border-box'}}>
            <h1 style={{color: '#22c55e', margin: 0}}>{data.school.school_name}</h1>
            <p style={{color: '#a3a3a3'}}>STUDENT DASHBOARD</p>
            
            <div style={{margin: '20px 0', display: 'flex', gap: '20px'}}>
                {data.student.photo_url && <img src={data.student.photo_url} style={{width: '80px', height: '80px', borderRadius: '10px', objectFit: 'cover'}} crossOrigin="anonymous"/>}
                <div>
                    <h2 style={{margin: 0}}>{data.student.name}</h2>
                    <p style={{color: '#a3a3a3'}}>ID: {data.student.roll_number}</p>
                </div>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                {data.detailedExams?.map((exam: any, i: number) => (
                    <div key={i} style={{backgroundColor: '#404040', padding: '15px', borderRadius: '10px'}}>
                        <h3 style={{margin: '0 0 10px'}}>{exam.examName}</h3>
                        {exam.subjects.map((s:any, j:number) => (
                            <div key={j} style={{marginBottom: '5px', fontSize: '9pt'}}>
                                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                    <span>{s.name}</span>
                                    <span>{s.obtained}/{s.total}</span>
                                </div>
                                <div style={{height: '4px', backgroundColor: '#525252', borderRadius: '2px'}}>
                                    <div style={{height: '100%', width: `${(s.obtained/s.total)*100}%`, backgroundColor: '#22c55e', borderRadius: '2px'}}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export const ProgressTemplate39: React.FC<{ data: ProgressCardData }> = ({ data }) => (
    <div style={{...commonStyles.page, fontFamily: '"Times New Roman", serif'}}>
        <div style={{textAlign: 'center', textDecoration: 'underline'}}>
            <h1>{data.school.school_name}</h1>
        </div>
        <table style={{width: '100%', margin: '20px 0'}}>
            <tbody>
                <tr>
                    <td><strong>Student Name:</strong> {data.student.name}</td>
                    <td><strong>Roll No:</strong> {data.student.roll_number}</td>
                </tr>
                <tr>
                    <td><strong>Class:</strong> {data.student.class}</td>
                    <td><strong>Session:</strong> {new Date().getFullYear()}</td>
                </tr>
            </tbody>
        </table>
        
        <table style={{width: '100%', borderCollapse: 'collapse', border: '2px solid black'}}>
            <thead>
                <tr>
                    <th style={{border: '1px solid black', padding: '5px'}}>Subjects</th>
                    {data.detailedExams?.map((ex:any, i:number) => <th key={i} style={{border: '1px solid black', padding: '5px'}}>{ex.examName}</th>)}
                </tr>
            </thead>
            <tbody>
                {Array.from(new Set(data.detailedExams?.flatMap((e:any) => e.subjects.map((s:any) => s.name)))).map((sub, i) => (
                    <tr key={i}>
                        <td style={{border: '1px solid black', padding: '5px'}}>{sub}</td>
                        {data.detailedExams?.map((e:any, j:number) => {
                            const s = e.subjects.find((sb:any) => sb.name === sub);
                            return <td key={j} style={{border: '1px solid black', padding: '5px', textAlign: 'center'}}>{s ? s.obtained : '-'}</td>
                        })}
                    </tr>
                ))}
                <tr style={{fontWeight: 'bold'}}>
                    <td style={{border: '1px solid black', padding: '5px'}}>Percentage</td>
                    {data.detailedExams?.map((ex:any, i:number) => <td key={i} style={{border: '1px solid black', padding: '5px', textAlign: 'center'}}>{ex.percentage.toFixed(1)}%</td>)}
                </tr>
            </tbody>
        </table>
        
        <div style={{marginTop: '30px', display: 'flex', justifyContent: 'space-between'}}>
            <div style={{borderTop: '1px solid black', width: '150px', textAlign: 'center'}}>Class Teacher</div>
            <div style={{borderTop: '1px solid black', width: '150px', textAlign: 'center'}}>Principal</div>
        </div>
    </div>
);

export const ProgressTemplate40: React.FC<{ data: ProgressCardData }> = ({ data }) => (
    <div style={{...commonStyles.page, backgroundColor: '#fdf4ff'}}>
        <div style={{border: '2px solid #d946ef', borderRadius: '20px', padding: '20px', height: '100%', boxSizing: 'border-box', textAlign: 'center'}}>
            <h1 style={{color: '#c026d3', fontSize: '24pt'}}>{data.school.school_name}</h1>
            <div style={{display: 'inline-block', padding: '5px 20px', backgroundColor: '#f0abfc', borderRadius: '20px', color: 'white', fontWeight: 'bold', margin: '10px 0'}}>
                PROGRESS REPORT
            </div>
            
            <div style={{margin: '20px 0'}}>
                {data.student.photo_url && <img src={data.student.photo_url} style={{width: '100px', height: '100px', borderRadius: '50%', border: '4px solid #e879f9'}} crossOrigin="anonymous"/>}
                <h2 style={{color: '#86198f', margin: '10px 0'}}>{data.student.name}</h2>
                <p>Class: {data.student.class}</p>
            </div>

            <div style={{textAlign: 'left'}}>
                {data.detailedExams?.map((exam: any, i: number) => (
                    <div key={i} style={{marginBottom: '15px', backgroundColor: 'white', padding: '10px', borderRadius: '10px', border: '1px solid #f5d0fe'}}>
                        <h3 style={{color: '#c026d3', margin: '0 0 5px'}}>{exam.examName}</h3>
                        <div style={{display: 'flex', flexWrap: 'wrap', gap: '10px'}}>
                            {exam.subjects.map((s:any, j:number) => (
                                <span key={j} style={{fontSize: '10pt', backgroundColor: '#fdf4ff', padding: '3px 8px', borderRadius: '5px'}}>
                                    {s.name}: <b>{s.obtained}</b>
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export const ProgressTemplate41: React.FC<{ data: ProgressCardData }> = ({ data }) => (
    <div style={{...commonStyles.page, borderLeft: '20px solid #111827'}}>
        <div style={{paddingLeft: '20px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '2px solid #111827', paddingBottom: '10px', marginBottom: '20px'}}>
                <h1 style={{margin: 0, fontSize: '20pt'}}>{data.school.school_name}</h1>
                <span style={{fontWeight: 'bold'}}>REPORT CARD</span>
            </div>
            
            <div style={{display: 'flex', gap: '20px', marginBottom: '20px'}}>
                <div style={{flex: 1}}>
                    <p><strong>NAME:</strong> {data.student.name}</p>
                    <p><strong>CLASS:</strong> {data.student.class}</p>
                    <p><strong>ROLL NO:</strong> {data.student.roll_number}</p>
                </div>
                <div style={{flex: 1}}>
                    <p><strong>FATHER:</strong> {data.student.father_name}</p>
                    <p><strong>DOB:</strong> {data.student.date_of_birth}</p>
                    <p><strong>MOBILE:</strong> {data.student.mobile}</p>
                </div>
            </div>

            <table style={{width: '100%', borderCollapse: 'collapse', border: '1px solid #000'}}>
                <thead style={{backgroundColor: '#111827', color: 'white'}}>
                    <tr>
                        <th style={{padding: '10px', textAlign: 'left'}}>Subject / Exam</th>
                        {data.detailedExams?.map((e:any, i:number) => <th key={i} style={{padding: '10px'}}>{e.examName}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {Array.from(new Set(data.detailedExams?.flatMap((e:any) => e.subjects.map((s:any) => s.name)))).map((sub, i) => (
                        <tr key={i} style={{borderBottom: '1px solid #ccc'}}>
                            <td style={{padding: '10px'}}>{sub}</td>
                            {data.detailedExams?.map((e:any, j:number) => {
                                const s = e.subjects.find((sb:any) => sb.name === sub);
                                return <td key={j} style={{padding: '10px', textAlign: 'center'}}>{s ? s.obtained : '-'}</td>
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

export const ProgressTemplate42: React.FC<{ data: ProgressCardData }> = ({ data }) => (
    <div style={{...commonStyles.page, backgroundColor: '#fff'}}>
        <div style={{textAlign: 'center', marginBottom: '20px'}}>
            <img src={data.school.school_image_url} style={{width: '60px'}} crossOrigin="anonymous"/>
            <h1 style={{margin: '5px 0'}}>{data.school.school_name}</h1>
        </div>
        <div style={{border: '1px solid #ccc', padding: '10px', borderRadius: '5px', marginBottom: '20px'}}>
            <h2 style={{margin: 0, textAlign: 'center'}}>{data.student.name}</h2>
            <p style={{textAlign: 'center', margin: 0}}>{data.student.class}</p>
        </div>
        
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
            {data.detailedExams?.map((exam: any, i: number) => (
                <div key={i} style={{border: '1px solid #000', borderRadius: '5px', overflow: 'hidden'}}>
                    <div style={{backgroundColor: '#000', color: 'white', padding: '5px', textAlign: 'center', fontWeight: 'bold'}}>{exam.examName}</div>
                    <div style={{padding: '10px'}}>
                        {exam.subjects.map((s:any, j:number) => (
                            <div key={j} style={{display: 'flex', justifyContent: 'space-between', borderBottom: '1px dotted #ccc', padding: '2px 0'}}>
                                <span>{s.name}</span><span>{s.obtained}</span>
                            </div>
                        ))}
                        <div style={{textAlign: 'right', marginTop: '5px', fontWeight: 'bold'}}>Total: {exam.totalObtained}</div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const ProgressTemplate43: React.FC<{ data: ProgressCardData }> = ({ data }) => (
    <div style={{...commonStyles.page, borderTop: '20px solid #047857', borderBottom: '20px solid #047857'}}>
        <div style={{padding: '20px'}}>
            <h1 style={{color: '#047857', textTransform: 'uppercase'}}>{data.school.school_name}</h1>
            <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '20px', borderBottom: '2px solid #047857', paddingBottom: '10px'}}>
                <div>
                    <strong>Student:</strong> {data.student.name}<br/>
                    <strong>Class:</strong> {data.student.class}
                </div>
                <div>
                    <strong>Session:</strong> {new Date().getFullYear()}<br/>
                    <strong>Roll No:</strong> {data.student.roll_number}
                </div>
            </div>
            <div style={{marginTop: '20px'}}>
                {data.detailedExams?.map((exam: any, i: number) => (
                    <div key={i} style={{marginBottom: '20px'}}>
                        <h3 style={{color: '#047857'}}>{exam.examName} ({exam.percentage.toFixed(1)}%)</h3>
                        <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                            {exam.subjects.map((s:any, j:number) => (
                                <div key={j} style={{border: '1px solid #047857', padding: '5px 10px', borderRadius: '4px'}}>
                                    {s.name}: <b>{s.obtained}</b>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export const ProgressTemplate44: React.FC<{ data: ProgressCardData }> = ({ data }) => (
    <div style={{...commonStyles.page, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '5px double #000'}}>
        <h1 style={{fontSize: '26pt', margin: '0 0 20px'}}>{data.school.school_name}</h1>
        <div style={{width: '80%', textAlign: 'center', border: '1px solid #000', padding: '20px', marginBottom: '20px'}}>
            <h2 style={{margin: '0 0 10px'}}>{data.student.name}</h2>
            <p>Class: {data.student.class} | Roll: {data.student.roll_number}</p>
        </div>
        <table style={{width: '80%', borderCollapse: 'collapse', border: '1px solid #000'}}>
            <thead>
                <tr style={{backgroundColor: '#000', color: '#fff'}}>
                    <th style={{padding: '10px'}}>Exam</th>
                    <th style={{padding: '10px'}}>Percentage</th>
                    <th style={{padding: '10px'}}>Result</th>
                </tr>
            </thead>
            <tbody>
                {data.examReport.map((ex, i) => (
                    <tr key={i}>
                        <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>{ex.examName}</td>
                        <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>{ex.percentage.toFixed(2)}%</td>
                        <td style={{padding: '10px', border: '1px solid #000', textAlign: 'center'}}>{ex.percentage >= 33 ? 'Pass' : 'Fail'}</td>
                    </tr>
                ))}
            </tbody>
        </table>
        <div style={{marginTop: '30px', width: '80%', display: 'flex', justifyContent: 'space-between'}}>
            <div style={{borderTop: '1px solid #000', width: '100px', textAlign: 'center'}}>Principal</div>
            <div style={{borderTop: '1px solid #000', width: '100px', textAlign: 'center'}}>Teacher</div>
        </div>
    </div>
);
