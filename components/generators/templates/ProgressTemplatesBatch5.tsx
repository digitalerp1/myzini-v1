
import React from 'react';
import { ProgressCardData } from '../../../services/pdfService';

const commonStyles: {[key:string]: React.CSSProperties} = {
    page: { width: '210mm', height: '297mm', padding: '10mm', boxSizing: 'border-box', backgroundColor: '#fff', fontFamily: 'Arial, sans-serif', display: 'flex', flexDirection: 'column' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '9pt', marginBottom: '10px' },
    th: { padding: '5px', border: '1px solid #ccc', backgroundColor: '#f3f4f6', textAlign: 'left' },
    td: { padding: '5px', border: '1px solid #ccc' },
    sectionTitle: { fontSize: '12pt', fontWeight: 'bold', borderBottom: '1px solid #000', marginBottom: '5px', marginTop: '10px' }
};

// Helper for rendering exam tables
const ExamTable = ({ detailedExams }: { detailedExams: any }) => (
    <>
        {detailedExams?.map((exam: any, i: number) => (
            <div key={i} style={{marginBottom: '10px'}}>
                <div style={{fontWeight: 'bold', fontSize: '10pt', backgroundColor: '#e5e7eb', padding: '2px 5px'}}>{exam.examName} - {exam.percentage.toFixed(1)}%</div>
                <table style={commonStyles.table}>
                    <thead><tr><th>Subject</th><th>Max</th><th>Obt</th></tr></thead>
                    <tbody>
                        {exam.subjects.map((s: any, j: number) => (
                            <tr key={j}><td>{s.name}</td><td>{s.total}</td><td>{s.obtained}</td></tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ))}
    </>
);

// Helper for Attendance
const AttendanceTable = ({ report }: { report: any }) => (
    <table style={commonStyles.table}>
        <thead><tr><th>Month</th><th>Present</th><th>Absent</th><th>Total</th></tr></thead>
        <tbody>
            {report.map((r: any, i: number) => (
                <tr key={i}><td>{r.month}</td><td>{r.present}</td><td>{r.absent}</td><td>{r.present + r.absent + r.holiday}</td></tr>
            ))}
        </tbody>
    </table>
);

export const ProgressTemplate21: React.FC<{ data: ProgressCardData }> = ({ data }) => (
    <div style={{...commonStyles.page, border: '2px solid #1e40af'}}>
        <div style={{backgroundColor: '#1e40af', color: 'white', padding: '15px', textAlign: 'center'}}>
            <h1 style={{margin: 0}}>{data.school.school_name}</h1>
            <p>{data.school.address}</p>
        </div>
        <div style={{padding: '10px', display: 'flex', gap: '15px', borderBottom: '2px solid #1e40af', marginBottom: '10px'}}>
            {data.student.photo_url && <img src={data.student.photo_url} style={{width: '80px', height: '100px', objectFit: 'cover'}} crossOrigin="anonymous"/>}
            <div>
                <h2>{data.student.name}</h2>
                <p>Class: {data.student.class} | Roll: {data.student.roll_number}</p>
                <p>Father: {data.student.father_name}</p>
            </div>
        </div>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', flex: 1}}>
            <div><h3 style={commonStyles.sectionTitle}>Academics</h3><ExamTable detailedExams={data.detailedExams} /></div>
            <div><h3 style={commonStyles.sectionTitle}>Attendance</h3><AttendanceTable report={data.attendanceReport} /></div>
        </div>
    </div>
);

export const ProgressTemplate22: React.FC<{ data: ProgressCardData }> = ({ data }) => (
    <div style={commonStyles.page}>
        <div style={{display: 'flex', alignItems: 'center', borderBottom: '4px solid #059669', paddingBottom: '10px', marginBottom: '10px'}}>
            {data.school.school_image_url && <img src={data.school.school_image_url} style={{width: '60px', marginRight: '10px'}} crossOrigin="anonymous"/>}
            <div style={{flex: 1}}>
                <h1 style={{margin: 0, color: '#059669'}}>{data.school.school_name}</h1>
                <p>REPORT CARD {new Date().getFullYear()}</p>
            </div>
        </div>
        <div style={{backgroundColor: '#ecfdf5', padding: '10px', borderRadius: '8px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between'}}>
            <div><p><strong>Student:</strong> {data.student.name}</p><p><strong>Class:</strong> {data.student.class}</p></div>
            <div><p><strong>Roll No:</strong> {data.student.roll_number}</p><p><strong>DOB:</strong> {data.student.date_of_birth}</p></div>
            {data.student.photo_url && <img src={data.student.photo_url} style={{width: '60px', height: '70px', borderRadius: '5px'}} crossOrigin="anonymous"/>}
        </div>
        <h3 style={{color: '#059669', borderBottom: '1px solid #059669'}}>Academic Performance</h3>
        <div style={{columnCount: 2, columnGap: '20px'}}><ExamTable detailedExams={data.detailedExams} /></div>
        <h3 style={{color: '#059669', borderBottom: '1px solid #059669', marginTop: '10px'}}>Attendance Record</h3>
        <AttendanceTable report={data.attendanceReport} />
    </div>
);

export const ProgressTemplate23: React.FC<{ data: ProgressCardData }> = ({ data }) => (
    <div style={{...commonStyles.page, backgroundColor: '#fafafa'}}>
        <div style={{border: '1px solid #ccc', height: '100%', padding: '15px', backgroundColor: 'white', display: 'flex', flexDirection: 'column'}}>
            <div style={{textAlign: 'center', marginBottom: '20px'}}>
                <h1 style={{textTransform: 'uppercase', letterSpacing: '2px', fontSize: '20pt'}}>{data.school.school_name}</h1>
                <p style={{fontSize: '10pt', color: '#666'}}>PROGRESS REPORT</p>
            </div>
            <div style={{display: 'flex', gap: '20px', marginBottom: '20px'}}>
                <div style={{flex: 1}}>
                    <p style={{borderBottom: '1px dotted #999'}}>Name: <strong>{data.student.name}</strong></p>
                    <p style={{borderBottom: '1px dotted #999'}}>Father: <strong>{data.student.father_name}</strong></p>
                    <p style={{borderBottom: '1px dotted #999'}}>Class: <strong>{data.student.class}</strong></p>
                </div>
                {data.student.photo_url && <img src={data.student.photo_url} style={{width: '80px', height: '100px', border: '1px solid #eee'}} crossOrigin="anonymous"/>}
            </div>
            <div style={{flex: 1}}>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px'}}>
                    {data.detailedExams?.map((exam: any, i: number) => (
                        <div key={i} style={{border: '1px solid #000', padding: '5px'}}>
                            <div style={{textAlign: 'center', fontWeight: 'bold', borderBottom: '1px solid #000'}}>{exam.examName}</div>
                            {exam.subjects.map((s:any, j:number) => (
                                <div key={j} style={{display: 'flex', justifyContent: 'space-between', fontSize: '9pt'}}>
                                    <span>{s.name}</span><span>{s.obtained}/{s.total}</span>
                                </div>
                            ))}
                            <div style={{textAlign: 'right', fontWeight: 'bold', borderTop: '1px solid #000'}}>Total: {exam.percentage.toFixed(0)}%</div>
                        </div>
                    ))}
                </div>
            </div>
            <div style={{marginTop: '10px'}}>
                <h4>Attendance Summary</h4>
                <div style={{display: 'flex', flexWrap: 'wrap', gap: '5px'}}>
                    {data.attendanceReport.map((r:any, i:number) => (
                        <div key={i} style={{border: '1px solid #ddd', padding: '2px 5px', fontSize: '8pt'}}>{r.month}: {r.present}P</div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

export const ProgressTemplate24: React.FC<{ data: ProgressCardData }> = ({ data }) => (
    <div style={{...commonStyles.page, fontFamily: '"Courier New", monospace'}}>
        <div style={{borderBottom: '2px dashed #000', paddingBottom: '10px', marginBottom: '10px'}}>
            <h1 style={{margin: 0}}>{data.school.school_name}</h1>
            <p>STUDENT_PERFORMANCE_SHEET_V2.0</p>
        </div>
        <div style={{display: 'flex', marginBottom: '10px'}}>
            <div style={{flex: 1}}>
                <p>ID: {data.student.roll_number}</p>
                <p>NAME: {data.student.name.toUpperCase()}</p>
                <p>CLASS: {data.student.class.toUpperCase()}</p>
            </div>
            {data.student.photo_url && <img src={data.student.photo_url} style={{width: '60px', height: '70px', filter: 'grayscale(100%)'}} crossOrigin="anonymous"/>}
        </div>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
            {data.detailedExams?.map((exam: any, i: number) => (
                <div key={i}>
                    <div style={{backgroundColor: '#000', color: '#fff', padding: '2px'}}>{exam.examName}</div>
                    <table style={{width: '100%', fontSize: '9pt', border: '1px solid #000'}}>
                        {exam.subjects.map((s:any, j:number) => (
                            <tr key={j}><td style={{padding: '2px'}}>{s.name}</td><td style={{textAlign: 'right'}}>{s.obtained}</td></tr>
                        ))}
                        <tr style={{fontWeight: 'bold'}}><td style={{padding: '2px'}}>AVG</td><td style={{textAlign: 'right'}}>{exam.percentage.toFixed(1)}%</td></tr>
                    </table>
                </div>
            ))}
        </div>
        <div style={{marginTop: '20px', borderTop: '1px dashed #000', paddingTop: '5px'}}>
            <p>ATTENDANCE_LOG:</p>
            <div style={{fontSize: '8pt', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)'}}>
                {data.attendanceReport.map((r:any, i:number) => <span key={i}>{r.month.substring(0,3)}:{r.present}</span>)}
            </div>
        </div>
    </div>
);

export const ProgressTemplate25: React.FC<{ data: ProgressCardData }> = ({ data }) => (
    <div style={{...commonStyles.page, color: '#4b5563'}}>
        <div style={{display: 'flex', gap: '20px', alignItems: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: '20px', marginBottom: '20px'}}>
            <div style={{width: '5px', height: '50px', backgroundColor: '#f59e0b'}}></div>
            <div style={{flex: 1}}>
                <h1 style={{margin: 0, color: '#111827', fontSize: '20pt'}}>{data.school.school_name}</h1>
                <p style={{margin: 0}}>Academic Progress Profile</p>
            </div>
            {data.school.school_image_url && <img src={data.school.school_image_url} style={{width: '50px'}} crossOrigin="anonymous"/>}
        </div>
        <div style={{display: 'flex', gap: '20px', marginBottom: '20px'}}>
            {data.student.photo_url && <img src={data.student.photo_url} style={{width: '100px', height: '100px', objectFit: 'cover', borderRadius: '50%'}} crossOrigin="anonymous"/>}
            <div style={{flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center'}}>
                <div style={{fontSize: '18pt', fontWeight: 'bold', color: '#111827', gridColumn: 'span 2'}}>{data.student.name}</div>
                <div>Class: {data.student.class}</div>
                <div>Roll No: {data.student.roll_number}</div>
                <div>Phone: {data.student.mobile}</div>
                <div>Father: {data.student.father_name}</div>
            </div>
        </div>
        <div style={{backgroundColor: '#f3f4f6', padding: '15px', borderRadius: '10px', marginBottom: '20px'}}>
            <h3 style={{margin: '0 0 10px 0', color: '#1f2937'}}>Examination Summary</h3>
            <div style={{display: 'flex', justifyContent: 'space-around'}}>
                {data.examReport.map((ex, i) => (
                    <div key={i} style={{textAlign: 'center'}}>
                        <div style={{fontSize: '16pt', fontWeight: 'bold', color: '#f59e0b'}}>{ex.percentage.toFixed(0)}%</div>
                        <div style={{fontSize: '9pt'}}>{ex.examName}</div>
                    </div>
                ))}
            </div>
        </div>
        <div style={{flex: 1}}>
            <h3 style={{color: '#1f2937'}}>Detailed Report</h3>
            <ExamTable detailedExams={data.detailedExams} />
        </div>
    </div>
);

export const ProgressTemplate26: React.FC<{ data: ProgressCardData }> = ({ data }) => (
    <div style={{...commonStyles.page, background: 'linear-gradient(to bottom right, #fff, #f0f9ff)'}}>
        <div style={{textAlign: 'center', padding: '20px', border: '2px solid #0ea5e9', borderRadius: '15px', height: '100%', boxSizing: 'border-box'}}>
            <h1 style={{color: '#0369a1', margin: 0}}>{data.school.school_name}</h1>
            <p style={{color: '#0ea5e9'}}>Student Evaluation Report</p>
            <hr style={{borderColor: '#0ea5e9', margin: '15px 0'}}/>
            <div style={{display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px'}}>
                {data.student.photo_url && <img src={data.student.photo_url} style={{width: '80px', height: '100px', border: '1px solid #0ea5e9'}} crossOrigin="anonymous"/>}
                <div style={{textAlign: 'left'}}>
                    <p><strong>Name:</strong> {data.student.name}</p>
                    <p><strong>Class:</strong> {data.student.class}</p>
                    <p><strong>Roll No:</strong> {data.student.roll_number}</p>
                </div>
            </div>
            <div style={{textAlign: 'left'}}>
                <ExamTable detailedExams={data.detailedExams} />
                <h4 style={{color: '#0369a1', marginTop: '20px'}}>Attendance</h4>
                <AttendanceTable report={data.attendanceReport} />
            </div>
        </div>
    </div>
);

export const ProgressTemplate27: React.FC<{ data: ProgressCardData }> = ({ data }) => (
    <div style={commonStyles.page}>
        <div style={{display: 'flex', height: '100%'}}>
            <div style={{width: '30%', backgroundColor: '#374151', color: 'white', padding: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                {data.student.photo_url && <img src={data.student.photo_url} style={{width: '80px', height: '80px', borderRadius: '50%', marginBottom: '10px'}} crossOrigin="anonymous"/>}
                <h2 style={{textAlign: 'center', fontSize: '14pt'}}>{data.student.name}</h2>
                <p>{data.student.class}</p>
                <hr style={{width: '100%', borderColor: '#4b5563'}}/>
                <div style={{width: '100%', fontSize: '9pt'}}>
                    <p>Roll: {data.student.roll_number}</p>
                    <p>Phone: {data.student.mobile}</p>
                    <p>DOB: {data.student.date_of_birth}</p>
                </div>
                <div style={{marginTop: 'auto', textAlign: 'center'}}>
                    <p>Attendance</p>
                    <div style={{fontSize: '20pt', fontWeight: 'bold'}}>{data.attendanceReport.reduce((a,c)=>a+c.present,0)}</div>
                    <p style={{fontSize: '8pt'}}>Days Present</p>
                </div>
            </div>
            <div style={{flex: 1, padding: '15px'}}>
                <div style={{borderBottom: '2px solid #374151', paddingBottom: '10px', marginBottom: '15px'}}>
                    <h1 style={{margin: 0, fontSize: '18pt'}}>{data.school.school_name}</h1>
                    <p>{data.school.address}</p>
                </div>
                <ExamTable detailedExams={data.detailedExams} />
            </div>
        </div>
    </div>
);

export const ProgressTemplate28: React.FC<{ data: ProgressCardData }> = ({ data }) => (
    <div style={{...commonStyles.page, fontFamily: '"Georgia", serif'}}>
        <div style={{border: '5px double #57534e', height: '100%', padding: '10mm', boxSizing: 'border-box'}}>
            <div style={{textAlign: 'center', marginBottom: '10mm'}}>
                <h1 style={{fontSize: '22pt', color: '#57534e', margin: 0}}>{data.school.school_name}</h1>
                <div style={{width: '50px', height: '2px', backgroundColor: '#57534e', margin: '5px auto'}}></div>
                <p style={{fontStyle: 'italic'}}>Annual Academic Report</p>
            </div>
            
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '10mm', borderBottom: '1px solid #ccc', paddingBottom: '5mm'}}>
                <div>
                    <p>Student: <strong>{data.student.name}</strong></p>
                    <p>Class: <strong>{data.student.class}</strong></p>
                    <p>Roll No: <strong>{data.student.roll_number}</strong></p>
                </div>
                {data.student.photo_url && <img src={data.student.photo_url} style={{width: '70px', height: '80px', border: '1px solid #57534e', padding: '2px'}} crossOrigin="anonymous"/>}
            </div>

            <div style={{marginBottom: '10mm'}}>
                {data.detailedExams?.map((exam: any, i: number) => (
                    <div key={i} style={{marginBottom: '15px'}}>
                        <h3 style={{borderBottom: '1px dotted #57534e'}}>{exam.examName}</h3>
                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px'}}>
                            {exam.subjects.map((s:any, j:number) => (
                                <div key={j} style={{fontSize: '10pt'}}>{s.name}: <strong>{s.obtained}</strong>/{s.total}</div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            
            <div style={{marginTop: 'auto', borderTop: '1px solid #57534e', paddingTop: '5mm', display: 'flex', justifyContent: 'space-between'}}>
                <p>Principal Signature</p>
                <p>Class Teacher Signature</p>
                <p>Parent Signature</p>
            </div>
        </div>
    </div>
);
