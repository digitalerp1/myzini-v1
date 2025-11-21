
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Student, OwnerProfile, Class, ExamResult } from '../types';
import { sanitizeForPath } from '../utils/textUtils';

// Import ID card templates
import { IdCardTemplateClassic } from '../components/generators/templates/IdCardTemplateClassic';
import { IdCardTemplateModern } from '../components/generators/templates/IdCardTemplateModern';
import { IdCardTemplateVibrant } from '../components/generators/templates/IdCardTemplateVibrant';
import { IdCardTemplateOfficial } from '../components/generators/templates/IdCardTemplateOfficial';
import { IdCardTemplateMinimalist } from '../components/generators/templates/IdCardTemplateMinimalist';
import { IdCardTemplateCorporate } from '../components/generators/templates/IdCardTemplateCorporate';
import { IdCardTemplateCreative } from '../components/generators/templates/IdCardTemplateCreative';
import { IdCardTemplateElegant } from '../components/generators/templates/IdCardTemplateElegant';

// Import Dues Bill templates
import { DuesBillTemplateOfficial } from '../components/generators/templates/DuesBillTemplateOfficial';
import { DuesBillTemplateCompact } from '../components/generators/templates/DuesBillTemplateCompact';
import { DuesBillTemplateDetailed } from '../components/generators/templates/DuesBillTemplateDetailed';
import { DuesBillTemplateSimple } from '../components/generators/templates/DuesBillTemplateSimple';
import { DuesBillTemplateModern } from '../components/generators/templates/DuesBillTemplateModern';
import { DuesBillTemplateInvoice } from '../components/generators/templates/DuesBillTemplateInvoice';
import { DuesBillTemplateStatement } from '../components/generators/templates/DuesBillTemplateStatement';
import { DuesBillTemplateClassic } from '../components/generators/templates/DuesBillTemplateClassic';
import { DuesBillTemplateFullRecord } from '../components/generators/templates/DuesBillTemplateFullRecord';

// Import Marksheet templates
import { MarksheetTemplateClassic } from '../components/generators/templates/MarksheetTemplateClassic';
import { MarksheetTemplateModern } from '../components/generators/templates/MarksheetTemplateModern';
import { MarksheetTemplateProfessional } from '../components/generators/templates/MarksheetTemplateProfessional';
import { MarksheetTemplateMinimalist } from '../components/generators/templates/MarksheetTemplateMinimalist';
import { MarksheetTemplateCreative } from '../components/generators/templates/MarksheetTemplateCreative';
import { MarksheetTemplateGrid } from '../components/generators/templates/MarksheetTemplateGrid';
import { MarksheetTemplateOfficial } from '../components/generators/templates/MarksheetTemplateOfficial';

// Import Certificate templates
import { CertificateTemplateFormal } from '../components/generators/templates/CertificateTemplateFormal';
import { CertificateTemplateModern } from '../components/generators/templates/CertificateTemplateModern';
import { CertificateTemplateClassic } from '../components/generators/templates/CertificateTemplateClassic';
import { CertificateTemplateArtistic } from '../components/generators/templates/CertificateTemplateArtistic';
import { CertificateTemplateAchievement } from '../components/generators/templates/CertificateTemplateAchievement';
import { CertificateTemplateProfessional1 } from '../components/generators/templates/CertificateTemplateProfessional1';
import { CertificateTemplateProfessional2 } from '../components/generators/templates/CertificateTemplateProfessional2';
import { CertificateTemplateProfessional3 } from '../components/generators/templates/CertificateTemplateProfessional3';

// Import Progress Card templates
import { ProgressCardTemplateClassic } from '../components/generators/templates/ProgressCardTemplateClassic';
import { ProgressCardTemplateModern } from '../components/generators/templates/ProgressCardTemplateModern';
import { ProgressCardTemplateCreative } from '../components/generators/templates/ProgressCardTemplateCreative';
import { ProgressCardTemplateOfficial } from '../components/generators/templates/ProgressCardTemplateOfficial';
import { ProgressCardTemplateVibrant } from '../components/generators/templates/ProgressCardTemplateVibrant';
import { ProgressCardTemplateDetailed } from '../components/generators/templates/ProgressCardTemplateDetailed';

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

// Configuration maps
const ID_CARD_TEMPLATES: { [key: string]: any } = {
    classic: { component: IdCardTemplateClassic, cardsPerPage: 8, orientation: 'h' },
    modern: { component: IdCardTemplateModern, cardsPerPage: 10, orientation: 'v' },
    vibrant: { component: IdCardTemplateVibrant, cardsPerPage: 10, orientation: 'v' },
    official: { component: IdCardTemplateOfficial, cardsPerPage: 8, orientation: 'h' },
    minimalist: { component: IdCardTemplateMinimalist, cardsPerPage: 8, orientation: 'h' },
    corporate: { component: IdCardTemplateCorporate, cardsPerPage: 8, orientation: 'h' },
    creative: { component: IdCardTemplateCreative, cardsPerPage: 10, orientation: 'v' },
    elegant: { component: IdCardTemplateElegant, cardsPerPage: 8, orientation: 'h' },
};

const DUES_BILL_TEMPLATES: { [key: string]: any } = {
    official: { component: DuesBillTemplateOfficial },
    compact: { component: DuesBillTemplateCompact },
    detailed: { component: DuesBillTemplateDetailed },
    simple: { component: DuesBillTemplateSimple },
    modern: { component: DuesBillTemplateModern },
    invoice: { component: DuesBillTemplateInvoice },
    statement: { component: DuesBillTemplateStatement },
    classic: { component: DuesBillTemplateClassic },
    full_record: { component: DuesBillTemplateFullRecord },
};

const MARKSHEET_TEMPLATES: { [key: string]: any } = {
    classic: { component: MarksheetTemplateClassic },
    modern: { component: MarksheetTemplateModern },
    professional: { component: MarksheetTemplateProfessional },
    minimalist: { component: MarksheetTemplateMinimalist },
    creative: { component: MarksheetTemplateCreative },
    grid: { component: MarksheetTemplateGrid },
    official: { component: MarksheetTemplateOfficial },
};

const CERTIFICATE_TEMPLATES: { [key: string]: any } = {
    formal: { component: CertificateTemplateFormal },
    modern: { component: CertificateTemplateModern },
    classic: { component: CertificateTemplateClassic },
    artistic: { component: CertificateTemplateArtistic },
    achievement: { component: CertificateTemplateAchievement },
    professional1: { component: CertificateTemplateProfessional1 },
    professional2: { component: CertificateTemplateProfessional2 },
    professional3: { component: CertificateTemplateProfessional3 },
};

const PROGRESS_CARD_TEMPLATES: { [key: string]: any } = {
    classic: { component: ProgressCardTemplateClassic },
    modern: { component: ProgressCardTemplateModern },
    creative: { component: ProgressCardTemplateCreative },
    official: { component: ProgressCardTemplateOfficial },
    vibrant: { component: ProgressCardTemplateVibrant },
    detailed: { component: ProgressCardTemplateDetailed },
};

const renderComponentToCanvas = async (container: HTMLElement, component: React.ReactElement): Promise<HTMLCanvasElement> => {
    const element = document.createElement('div');
    element.style.width = '100%';
    element.style.height = '100%';
    container.appendChild(element);
    const root = ReactDOM.createRoot(element);
    
    await new Promise<void>(resolve => {
        root.render(React.createElement(React.StrictMode, null, component));
        setTimeout(resolve, 1500); // Wait for images and fonts
    });

    const canvas = await html2canvas(element, { 
        scale: 2, // Higher scale for better quality
        useCORS: true, 
        logging: false,
        backgroundColor: '#ffffff'
    });
    
    root.unmount();
    container.removeChild(element);
    
    return canvas;
};


export const generateIdCardsPdf = async (
    students: Student[],
    school: OwnerProfile,
    templateName: string,
    onProgress: (progress: number) => void
): Promise<void> => {
    if (!students || students.length === 0) {
        throw new Error("No students provided for ID card generation.");
    }
    const templateConfig = ID_CARD_TEMPLATES[templateName];
    if (!templateConfig) throw new Error(`ID Card template "${templateName}" not found.`);

    onProgress(0);
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    document.body.appendChild(container);

    const { component: TemplateComponent, cardsPerPage, orientation } = templateConfig;
    const isVertical = orientation === 'v';
    
    const CARD_WIDTH_MM = 85.6;
    const CARD_HEIGHT_MM = 53.98;
    
    const renderCardWidth = isVertical ? CARD_HEIGHT_MM : CARD_WIDTH_MM;
    const renderCardHeight = isVertical ? CARD_WIDTH_MM : CARD_HEIGHT_MM;

    const colGap = 10; 
    const rowGap = 10;
    const cols = 2;
    const rows = isVertical ? 5 : 4;
    
    const marginLeft = (A4_WIDTH_MM - (cols * renderCardWidth + (cols - 1) * colGap)) / 2;
    const marginTop = 15;

    const studentChunks = [];
    const itemsPerPage = cols * rows;
    for (let i = 0; i < students.length; i += itemsPerPage) {
        studentChunks.push(students.slice(i, i + itemsPerPage));
    }

    for (let i = 0; i < studentChunks.length; i++) {
        const chunk = studentChunks[i];
        
        const pageComponent = React.createElement(
            'div', 
            { 
                style: { 
                    width: `${A4_WIDTH_MM}mm`, 
                    height: `${A4_HEIGHT_MM}mm`, 
                    backgroundColor: 'white',
                    paddingTop: `${marginTop}mm`,
                    paddingLeft: `${marginLeft}mm`,
                    boxSizing: 'border-box',
                    display: 'grid',
                    gridTemplateColumns: `repeat(${cols}, ${renderCardWidth}mm)`,
                    gridAutoRows: `${renderCardHeight}mm`,
                    columnGap: `${colGap}mm`,
                    rowGap: `${rowGap}mm`,
                } 
            },
            ...chunk.map(student => 
                React.createElement(
                    'div', 
                    { style: { width: '100%', height: '100%', overflow: 'hidden' } }, 
                    React.createElement(TemplateComponent, { key: student.id, student, school })
                )
            )
        );

        const canvas = await renderComponentToCanvas(container, pageComponent);
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM);

        onProgress(Math.round(((i + 1) / studentChunks.length) * 100));
    }
    
    document.body.removeChild(container);
    pdf.save(`id_cards_${sanitizeForPath(students[0].class || 'all')}_${templateName}.pdf`);
};

const monthNames = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

export const generateDuesBillPdf = async (
    students: Student[], school: OwnerProfile, allClasses: Class[], selectedMonth: string,
    templateName: string, onProgress: (progress: number) => void
): Promise<void> => {
    if (!students || students.length === 0) throw new Error("No students provided for bill generation.");
    const templateConfig = DUES_BILL_TEMPLATES[templateName];
    if (!templateConfig) throw new Error(`Dues Bill template "${templateName}" not found.`);

    onProgress(0);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    document.body.appendChild(container);

    const { component: TemplateComponent } = templateConfig;
    const billsPerPage = 2;
    const studentChunks = Array.from({ length: Math.ceil(students.length / billsPerPage) }, (_, i) =>
        students.slice(i * billsPerPage, i * billsPerPage + billsPerPage)
    );
    
    const classFeesMap = new Map(allClasses.map(c => [c.class_name, c.school_fees || 0]));
    const selectedMonthIndex = monthNames.indexOf(selectedMonth);
    if (selectedMonthIndex === -1) throw new Error("Invalid month selected.");

    const pagePadding = 5;
    const gap = 5;
    const billHeight = 140; 
    const billWidth = 200;

    for (let i = 0; i < studentChunks.length; i++) {
        const chunk = studentChunks[i];
        
        const pageComponent = React.createElement(
            'div', { style: {
                width: `${A4_WIDTH_MM}mm`, height: `${A4_HEIGHT_MM}mm`, 
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', gap: `${gap}mm`,
                backgroundColor: 'white', boxSizing: 'border-box', paddingTop: `${pagePadding}mm`, paddingBottom: `${pagePadding}mm`
            }},
            ...chunk.map(student => React.createElement(
                'div', { style: { width: `${billWidth}mm`, height: `${billHeight}mm`, overflow: 'hidden' } },
                React.createElement(TemplateComponent, {
                    key: student.id, student, school,
                    classFee: classFeesMap.get(student.class || '') || 0,
                    selectedMonthIndex: selectedMonthIndex,
                })
            ))
        );

        const canvas = await renderComponentToCanvas(container, pageComponent);
        const imgData = canvas.toDataURL('image/jpeg', 0.85);

        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM);
        onProgress(Math.round(((i + 1) / studentChunks.length) * 100));
    }
    
    document.body.removeChild(container);
    pdf.save(`dues_bills_${sanitizeForPath(students[0].class || 'class')}_${selectedMonth}.pdf`);
};


export interface ResultWithStudent extends ExamResult {
    student: Student;
}

export const generateMarksheetsPdf = async (
    results: ResultWithStudent[], school: OwnerProfile,
    templateName: string, onProgress: (progress: number) => void
): Promise<void> => {
    if (!results || results.length === 0) throw new Error("No results provided for marksheet generation.");
    const templateConfig = MARKSHEET_TEMPLATES[templateName];
    if (!templateConfig) throw new Error(`Marksheet template "${templateName}" not found.`);

    onProgress(0);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    document.body.appendChild(container);

    const { component: TemplateComponent } = templateConfig;

    for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const marksheetComponent = React.createElement(
            'div', { style: { width: `${A4_WIDTH_MM}mm`, height: `${A4_HEIGHT_MM}mm`, backgroundColor: 'white' } },
            React.createElement(TemplateComponent, { result, school, student: result.student })
        );

        const canvas = await renderComponentToCanvas(container, marksheetComponent);
        const imgData = canvas.toDataURL('image/jpeg', 0.9);

        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM);
        onProgress(Math.round(((i + 1) / results.length) * 100));
    }
    
    document.body.removeChild(container);
    const { exam_name, class: className } = results[0];
    pdf.save(`marksheets_${sanitizeForPath(className)}_${sanitizeForPath(exam_name)}.pdf`);
};

export interface QualifiedStudent {
    student: Student;
    division: string;
    percentage: number;
}

export const generateCertificatesPdf = async (
    qualifiedStudents: QualifiedStudent[], school: OwnerProfile,
    examName: string, sessionYear: string, templateName: string,
    onProgress: (progress: number) => void
): Promise<void> => {
    if (!qualifiedStudents || qualifiedStudents.length === 0) throw new Error("No qualified students for certificate generation.");
    const templateConfig = CERTIFICATE_TEMPLATES[templateName];
    if (!templateConfig) throw new Error(`Certificate template "${templateName}" not found.`);

    onProgress(0);
    const pdf = new jsPDF('l', 'mm', 'a4'); 
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    document.body.appendChild(container);

    const { component: TemplateComponent } = templateConfig;

    for (let i = 0; i < qualifiedStudents.length; i++) {
        const { student, division, percentage } = qualifiedStudents[i];
        const certificateComponent = React.createElement(
            'div', { style: { width: `${A4_HEIGHT_MM}mm`, height: `${A4_WIDTH_MM}mm`, backgroundColor: 'white' } },
            React.createElement(TemplateComponent, { student, school, division, percentage, examName, sessionYear })
        );

        const canvas = await renderComponentToCanvas(container, certificateComponent);
        const imgData = canvas.toDataURL('image/jpeg', 0.9);

        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, 0, A4_HEIGHT_MM, A4_WIDTH_MM);
        onProgress(Math.round(((i + 1) / qualifiedStudents.length) * 100));
    }
    
    document.body.removeChild(container);
    const className = qualifiedStudents[0]?.student.class || 'certificates';
    pdf.save(`certificates_${sanitizeForPath(className)}_${sanitizeForPath(sessionYear)}.pdf`);
};

export interface ProgressCardData {
    student: Student;
    school: OwnerProfile;
    attendanceReport: { month: string, present: number, absent: number, holiday: number }[];
    examReport: { examName: string, percentage: number }[];
}

export const generateProgressCardsPdf = async (
    data: ProgressCardData[],
    templateName: string,
    onProgress: (progress: number) => void
): Promise<void> => {
    if (!data || data.length === 0) throw new Error("No data provided for progress card generation.");
    const templateConfig = PROGRESS_CARD_TEMPLATES[templateName];
    if (!templateConfig) throw new Error(`Progress Card template "${templateName}" not found.`);

    onProgress(0);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    document.body.appendChild(container);

    const { component: TemplateComponent } = templateConfig;

    for (let i = 0; i < data.length; i++) {
        const cardData = data[i];
        const cardComponent = React.createElement(
            'div', { style: { width: `${A4_WIDTH_MM}mm`, height: `${A4_HEIGHT_MM}mm`, backgroundColor: 'white' } },
            React.createElement(TemplateComponent, { data: cardData })
        );

        const canvas = await renderComponentToCanvas(container, cardComponent);
        const imgData = canvas.toDataURL('image/jpeg', 0.9);

        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM);
        onProgress(Math.round(((i + 1) / data.length) * 100));
    }
    
    document.body.removeChild(container);
    const className = data[0]?.student.class || 'progress';
    pdf.save(`progress_cards_${sanitizeForPath(className)}.pdf`);
};
