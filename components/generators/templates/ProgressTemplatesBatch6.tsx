
import React from 'react';
import { ProgressCardData } from '../../../services/pdfService';

const commonStyles: {[key:string]: React.CSSProperties} = {
    page: { width: '210mm', height: '297mm', padding: '10mm', boxSizing: 'border-box', backgroundColor: '#fff', fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif' },
    title: { fontSize: '18pt', fontWeight: 'bold', margin: '0 0 5px 0' },
    box: { border: '2px solid #000', borderRadius: '15px', padding: '10px', marginBottom: '10px', backgroundColor: '#fff' },
    row: { display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }
};

const SubjectPill = ({ name, marks, total }: { name: string, marks: number, total: number }) => (
    <div style={{backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '10px', padding: '5px 10px', margin: '2px', display: 'inline-block', fontSize: '9pt'}}>
        <strong>{name}</strong>: {marks}/{total}
    </div>
);

export const ProgressTemplate29: React.FC<{ data: ProgressCardData }> = ({ data }) => (
    <div style={{...commonStyles.page, backgroundColor: '#fff7ed'}}>
        <div style={{border: '4px dashed #f97316', height: '100%', padding: '15px', borderRadius: '20px', boxSizing: 'border-box'}}>
            <div style={{textAlign: 'center', marginBottom: '20px'}}>
                <h1 style={{color: '#ea580c', margin: 0}}>{data.school.school_name}</h1>
                <p style={{color: '#c2410c'}}>🌟 My Progress Report 🌟</p>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px'}}>
                {data.student.photo_url && <img src={data.student.photo_url} style={{width: '90px', height: '90px', borderRadius: '50%', border: '4px solid #f97316'}} crossOrigin="anonymous"/>}
                <div style={{backgroundColor: '#ffedd5', padding: '10px', borderRadius: '10px', flex: 1}}>
                    <h2 style={{margin: 0, color: '#c2410c'}}>{data.student.name}</h2>
                    <p style={{margin: 0}}>Class: {data.student.class}</p>
                </div>
            </div>
            {data.detailedExams?.map((exam: any, i: number) => (
                <div key={i} style={{backgroundColor: '#fff', borderRadius: '15px', padding: '10px', marginBottom: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'}}>
                    <h3 style={{margin: '0 0 5px', color: '#ea580c'}}>{exam.examName}</h3>
                    <div>
                        {exam.subjects.map((s:any, j:number) => <SubjectPill key={j} name={s.name} marks={s.obtained} total={s.total} />)}
                    </div>
                    <div style={{textAlign: 'right', fontWeight: 'bold', color: '#c2410c'}}>Score: {exam.percentage.toFixed(0)}%</div>
                </div>
            ))}
        </div>
    </div>
);

export const ProgressTemplate30: React.FC<{ data: ProgressCardData }> = ({ data }) => (
    <div style={{...commonStyles.page, background: 'linear-gradient(to bottom, #e0f2fe, #fff)'}}>
        <div style={{textAlign: 'center', padding: '20px'}}>
            <h1 style={{color: '#0284c7', textShadow: '2px 2px 0px white'}}>{data.school.school_name}</h1>
        </div>
        <div style={{display: 'flex', justifyContent: 'center', marginBottom: '20px'}}>
            <div style={{textAlign: 'center', backgroundColor: 'white', padding: '15px', borderRadius: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '80%'}}>
                {data.student.photo_url && <img src={data.student.photo_url} style={{width: '80px', height: '80px', borderRadius: '50%', marginBottom: '5px'}} crossOrigin="anonymous"/>}
                <h2 style={{margin: 0, color: '#0369a1'}}>{data.student.name}</h2>
                <p style={{margin: 0}}>{data.student.class}</p>
            </div>
        </div>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
            {data.detailedExams?.map((exam: any, i: number) => (
                <div key={i} style={{backgroundColor: 'white', padding: '15px', borderRadius: '15px', border: '2px solid #bae6fd'}}>
                    <h3 style={{textAlign: 'center', color: '#0284c7', margin: '0 0 10px'}}>{exam.examName}</h3>
                    <ul style={{listStyle: 'none', padding: 0, fontSize: '10pt'}}>
                        {exam.subjects.map((s:any, j:number) => (
                            <li key={j} style={{display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #bae6fd'}}>
                                <span>{s.name}</span><span>{s.obtained}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    </div>
);

export const ProgressTemplate31: React.FC<{ data: ProgressCardData }> = ({ data }) => (
    <div style={{...commonStyles.page, fontFamily: 'Arial, sans-serif', border: '10px solid #fcd34d'}}>
        <div style={{backgroundColor: '#fef3c7', padding: '20px', textAlign: 'center', marginBottom: '20px'}}>
            <h1 style={{margin: 0, color: '#b45309'}}>{data.school.school_name}</h1>
        </div>
        <div style={{display: 'flex', alignItems: 'flex-start', gap: '20px'}}>
            {data.student.photo_url && <img src={data.student.photo_url} style={{width: '100px', height: '120px', border: '2px solid #b45309'}} crossOrigin="anonymous"/>}
            <div style={{flex: 1}}>
                <div style={{borderBottom: '1px solid #b45309', padding: '5px'}}>Name: <strong>{data.student.name}</strong></div>
                <div style={{borderBottom: '1px solid #b45309', padding: '5px'}}>Class: <strong>{data.student.class}</strong></div>
                <div style={{borderBottom: '1px solid #b45309', padding: '5px'}}>Roll: <strong>{data.student.roll_number}</strong></div>
            </div>
        </div>
        <h3 style={{marginTop: '20px', backgroundColor: '#b45309', color: 'white', padding: '5px'}}>Scholastic Performance</h3>
        <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '10pt'}}>
            <thead><tr style={{backgroundColor: '#fef3c7'}}><th>Subject</th>{data.detailedExams?.map((e:any, i:number) => <th key={i}>{e.examName}</th>)}</tr></thead>
            <tbody>
                {Array.from(new Set(data.detailedExams?.flatMap((e:any) => e.subjects.map((s:any) => s.name)))).map((sub, i) => (
                    <tr key={i}>
                        <td style={{border: '1px solid #b45309', padding: '5px', fontWeight: 'bold'}}>{sub}</td>
                        {data.detailedExams?.map((e:any, j:number) => {
                            const s = e.subjects.find((sb:any) => sb.name === sub);
                            return <td key={j} style={{border: '1px solid #b45309', padding: '5px', textAlign: 'center'}}>{s ? s.obtained : '-'}</td>
                        })}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export const ProgressTemplate32: React.FC<{ data: ProgressCardData }> = ({ data }) => (
    <div style={{...commonStyles.page, backgroundColor: '#111827', color: '#f3f4f6', fontFamily: '"Courier New", monospace'}}>
        <div style={{border: '1px solid #374151', height: '100%', padding: '20px', boxSizing: 'border-box'}}>
            <h1 style={{color: '#22d3ee', textAlign: 'center', marginBottom: '20px'}}>{data.school.school_name}</h1>
            <div style={{display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #374151', paddingBottom: '10px', marginBottom: '20px'}}>
                <div>
                    <p>STUDENT: {data.student.name.toUpperCase()}</p>
                    <p>CLASS: {data.student.class}</p>
                </div>
                <div>
                    <p>ID: {data.student.roll_number}</p>
                    <p>SESSION: {new Date().getFullYear()}</p>
                </div>
            </div>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px'}}>
                {data.detailedExams?.map((exam: any, i: number) => (
                    <div key={i} style={{backgroundColor: '#1f2937', padding: '15px', borderRadius: '5px', border: '1px solid #374151'}}>
                        <h3 style={{color: '#22d3ee', margin: '0 0 10px', borderBottom: '1px solid #374151'}}>{exam.examName}</h3>
                        {exam.subjects.map((s:any, j:number) => (
                            <div key={j} style={{display: 'flex', justifyContent: 'space-between', fontSize: '9pt'}}>
                                <span>{s.name}</span>
                                <span style={{color: '#22d3ee'}}>{s.obtained}</span>
                            </div>
                        ))}
                        <div style={{textAlign: 'center', marginTop: '10px', fontSize: '12pt', fontWeight: 'bold', color: '#22d3ee'}}>{exam.percentage.toFixed(0)}%</div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export const ProgressTemplate33: React.FC<{ data: ProgressCardData }> = ({ data }) => (
    <div style={{...commonStyles.page, fontFamily: 'Arial, sans-serif'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px'}}>
            <div style={{backgroundColor: '#ec4899', width: '10px', height: '50px'}}></div>
            <div>
                <h1 style={{margin: 0, color: '#be185d'}}>{data.school.school_name}</h1>
                <p style={{margin: 0, color: '#9ca3af'}}>Student Progress Report</p>
            </div>
        </div>
        <div style={{display: 'flex', gap: '20px', marginBottom: '20px'}}>
            {data.student.photo_url && <img src={data.student.photo_url} style={{width: '100px', height: '100px', borderRadius: '10px', objectFit: 'cover'}} crossOrigin="anonymous"/>}
            <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                <h2 style={{margin: 0}}>{data.student.name}</h2>
                <div style={{display: 'flex', gap: '20px', marginTop: '5px', color: '#4b5563'}}>
                    <span>Class: {data.student.class}</span>
                    <span>Roll: {data.student.roll_number}</span>
                </div>
            </div>
        </div>
        {data.detailedExams?.map((exam: any, i: number) => (
            <div key={i} style={{marginBottom: '15px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <h3 style={{margin: 0}}>{exam.examName}</h3>
                    <div style={{flex: 1, height: '1px', backgroundColor: '#e5e7eb'}}></div>
                    <span style={{fontWeight: 'bold', color: '#be185d'}}>{exam.percentage.toFixed(1)}%</span>
                </div>
                <div style={{display: 'flex', gap: '5px', marginTop: '5px', flexWrap: 'wrap'}}>
                    {exam.subjects.map((s:any, j:number) => (
                        <div key={j} style={{backgroundColor: '#fce7f3', padding: '5px 10px', borderRadius: '5px', fontSize: '9pt'}}>
                            {s.name}: <strong>{s.obtained}</strong>
                        </div>
                    ))}
                </div>
            </div>
        ))}
    </div>
);

export const ProgressTemplate34: React.FC<{ data: ProgressCardData }> = ({ data }) => (
    <div style={{...commonStyles.page, backgroundColor: '#f0fdf4'}}>
        <div style={{border: '2px dashed #16a34a', padding: '15px', height: '100%', boxSizing: 'border-box', borderRadius: '15px'}}>
            <div style={{textAlign: 'center', marginBottom: '20px'}}>
                <h1 style={{color: '#15803d', margin: 0}}>{data.school.school_name}</h1>
            </div>
            <div style={{textAlign: 'center', marginBottom: '20px'}}>
                {data.student.photo_url && <img src={data.student.photo_url} style={{width: '90px', height: '90px', borderRadius: '50%', border: '3px solid #16a34a', padding: '2px'}} crossOrigin="anonymous"/>}
                <h2 style={{color: '#166534', margin: '5px 0'}}>{data.student.name}</h2>
            </div>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px'}}>
                {data.detailedExams?.map((exam: any, i: number) => (
                    <div key={i} style={{backgroundColor: '#fff', padding: '10px', borderRadius: '10px', border: '1px solid #bbf7d0'}}>
                        <div style={{textAlign: 'center', fontWeight: 'bold', color: '#16a34a', marginBottom: '5px'}}>{exam.examName}</div>
                        <div style={{textAlign: 'center', fontSize: '20pt', fontWeight: 'bold'}}>{exam.percentage.toFixed(0)}%</div>
                        <div style={{fontSize: '8pt', color: '#666', textAlign: 'center'}}>Score</div>
                    </div>
                ))}
            </div>
            <div style={{marginTop: '20px', backgroundColor: '#fff', padding: '10px', borderRadius: '10px'}}>
                <h3 style={{color: '#15803d', marginTop: 0}}>Attendance</h3>
                <div style={{display: 'flex', flexWrap: 'wrap', gap: '5px'}}>
                    {data.attendanceReport.map((r:any, i:number) => (
                        <div key={i} style={{border: '1px solid #dcfce7', padding: '3px 6px', borderRadius: '4px', fontSize: '8pt', backgroundColor: '#f0fdf4'}}>
                            {r.month}: {r.present}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

export const ProgressTemplate35: React.FC<{ data: ProgressCardData }> = ({ data }) => (
    <div style={{...commonStyles.page, fontFamily: 'Georgia, serif', border: '15px solid #7c2d12'}}>
        <div style={{padding: '20px', textAlign: 'center', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column'}}>
            <h1 style={{fontSize: '24pt', color: '#7c2d12', textTransform: 'uppercase'}}>{data.school.school_name}</h1>
            <p style={{fontStyle: 'italic', marginTop: '5px'}}>Official Transcript</p>
            
            <div style={{margin: '30px 0', borderTop: '1px solid #7c2d12', borderBottom: '1px solid #7c2d12', padding: '15px 0'}}>
                <h2 style={{margin: 0}}>{data.student.name}</h2>
                <p>Class: {data.student.class} | Roll No: {data.student.roll_number}</p>
            </div>

            <div style={{flex: 1}}>
                {data.detailedExams?.map((exam: any, i: number) => (
                    <div key={i} style={{marginBottom: '20px'}}>
                        <h3 style={{textAlign: 'left', borderBottom: '1px solid #ccc'}}>{exam.examName}</h3>
                        <table style={{width: '100%', fontSize: '11pt'}}>
                            <tbody>
                                {exam.subjects.map((s:any, j:number) => (
                                    <tr key={j}>
                                        <td style={{textAlign: 'left'}}>{s.name}</td>
                                        <td style={{textAlign: 'right'}}>{s.obtained} / {s.total}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>
            
            <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 'auto'}}>
                <div>Principal</div>
                <div>Class Teacher</div>
            </div>
        </div>
    </div>
);

export const ProgressTemplate36: React.FC<{ data: ProgressCardData }> = ({ data }) => (
    <div style={commonStyles.page}>
        <div style={{backgroundColor: '#8b5cf6', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'}}>
            <h1 style={{fontSize: '30pt', margin: 0}}>{data.student.name.charAt(0)}</h1>
        </div>
        <div style={{padding: '20px', marginTop: '-40px', backgroundColor: 'white', borderRadius: '20px 20px 0 0', position: 'relative'}}>
            <h1 style={{textAlign: 'center', margin: 0}}>{data.student.name}</h1>
            <p style={{textAlign: 'center', color: '#6b7280'}}>{data.school.school_name}</p>
            
            <div style={{marginTop: '20px'}}>
                {data.detailedExams?.map((exam: any, i: number) => (
                    <div key={i} style={{marginBottom: '15px', border: '1px solid #ddd', borderRadius: '10px', padding: '10px'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 'bold'}}>
                            <span>{exam.examName}</span>
                            <span style={{color: '#8b5cf6'}}>{exam.percentage.toFixed(1)}%</span>
                        </div>
                        <div style={{marginTop: '5px', fontSize: '9pt', color: '#4b5563'}}>
                            {exam.subjects.map((s:any) => s.name).join(', ')}
                        </div>
                    </div>
                ))}
            </div>
            <div style={{marginTop: '20px', textAlign: 'center', color: '#9ca3af', fontSize: '10pt'}}>
                <p>Generated on {new Date().toLocaleDateString()}</p>
            </div>
        </div>
    </div>
);
