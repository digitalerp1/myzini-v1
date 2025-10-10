import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Student, OwnerProfile, Class, ExamResult } from '../types';
import { sanitizeForPath } from '../utils/textUtils';

// Import all ID card templates
import { IdCardTemplateClassic } from '../components/generators/templates/IdCardTemplateClassic';
import { IdCardTemplateModern } from '../components/generators/templates/IdCardTemplateModern';
import { IdCardTemplateVibrant } from '../components/generators/templates/IdCardTemplateVibrant';
import { IdCardTemplateOfficial } from '../components/generators/templates/IdCardTemplateOfficial';
import { IdCardTemplateMinimalist } from '../components/generators/templates/IdCardTemplateMinimalist';

// Import all Dues Bill templates
import { DuesBillTemplateOfficial } from '../components/generators/templates/DuesBillTemplateOfficial';
import { DuesBillTemplateCompact } from '../components/generators/templates/DuesBillTemplateCompact';
import { DuesBillTemplateDetailed } from '../components/generators/templates/DuesBillTemplateDetailed';
import { DuesBillTemplateSimple } from '../components/generators/templates/DuesBillTemplateSimple';
import { DuesBillTemplateModern } from '../components/generators/templates/DuesBillTemplateModern';

// Import all Marksheet templates
import { MarksheetTemplateClassic } from '../components/generators/templates/MarksheetTemplateClassic';
import { MarksheetTemplateModern } from '../components/generators/templates/MarksheetTemplateModern';
import { MarksheetTemplateProfessional } from '../components/generators/templates/MarksheetTemplateProfessional';
import { MarksheetTemplateMinimalist } from '../components/generators/templates/MarksheetTemplateMinimalist';
import { MarksheetTemplateCreative } from '../components/generators/templates/MarksheetTemplateCreative';

// Import all Certificate templates
import { CertificateTemplateFormal } from '../components/generators/templates/CertificateTemplateFormal';
import { CertificateTemplateModern } from '../components/generators/templates/CertificateTemplateModern';
import { CertificateTemplateClassic } from '../components/generators/templates/CertificateTemplateClassic';
import { CertificateTemplateArtistic } from '../components/generators/templates/CertificateTemplateArtistic';
import { CertificateTemplateAchievement } from '../components/generators/templates/CertificateTemplateAchievement';

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

// Configuration maps
const ID_CARD_TEMPLATES: { [key: string]: any } = {
    classic: { component: IdCardTemplateClassic, cardsPerPage: 8, orientation: 'h' },
    modern: { component: IdCardTemplateModern, cardsPerPage: 6, orientation: 'v' },
    vibrant: { component: IdCardTemplateVibrant, cardsPerPage: 6, orientation: 'v' },
    official: { component: IdCardTemplateOfficial, cardsPerPage: 8, orientation: 'h' },
    minimalist: { component: IdCardTemplateMinimalist, cardsPerPage: 8, orientation: 'h' },
};

const DUES_BILL_TEMPLATES: { [key: string]: any } = {
    official: { component: DuesBillTemplateOfficial },
    compact: { component: DuesBillTemplateCompact },
    detailed: { component: DuesBillTemplateDetailed },
    simple: { component: DuesBillTemplateSimple },
    modern: { component: DuesBillTemplateModern },
};

const MARKSHEET_TEMPLATES: { [key: string]: any } = {
    classic: { component: MarksheetTemplateClassic },
    modern: { component: MarksheetTemplateModern },
    professional: { component: MarksheetTemplateProfessional },
    minimalist: { component: MarksheetTemplateMinimalist },
    creative: { component: MarksheetTemplateCreative },
};

const CERTIFICATE_TEMPLATES: { [key: string]: any } = {
    formal: { component: CertificateTemplateFormal },
    modern: { component: CertificateTemplateModern },
    classic: { component: CertificateTemplateClassic },
    artistic: { component: CertificateTemplateArtistic },
    achievement: { component: CertificateTemplateAchievement },
};

const renderComponentToCanvas = async (container: HTMLElement, component: React.ReactElement): Promise<HTMLCanvasElement> => {
    const element = document.createElement('div');
    container.appendChild(element);
    const root = ReactDOM.createRoot(element);
    
    await new Promise<void>(resolve => {
        root.render(React.createElement(React.StrictMode, null, component));
        // Increased timeout for complex renders like marksheets and certificates with QR codes
        setTimeout(resolve, 2000);
    });

    const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false });
    
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
    document.body.appendChild(container);

    const { component: TemplateComponent, cardsPerPage, orientation } = templateConfig;
    const isVertical = orientation === 'v';
    const CARD_WIDTH_MM = 85.6, CARD_HEIGHT_MM = 53.98;
    const cardWidth = isVertical ? CARD_HEIGHT_MM : CARD_WIDTH_MM;
    const cardHeight = isVertical ? CARD_WIDTH_MM : CARD_HEIGHT_MM;
    const cols = isVertical ? 2 : 2, rows = isVertical ? 3 : 4;
    
    const studentChunks = [];
    for (let i = 0; i < students.length; i += cardsPerPage) {
        studentChunks.push(students.slice(i, i + cardsPerPage));
    }

    for (let i = 0; i < studentChunks.length; i++) {
        const chunk = studentChunks[i];
        const pageContainer = document.createElement('div');
        pageContainer.style.width = `${A4_WIDTH_MM}mm`;
        pageContainer.style.height = `${A4_HEIGHT_MM}mm`;
        pageContainer.style.display = 'grid';
        pageContainer.style.gridTemplateColumns = `repeat(${cols}, ${cardWidth}mm)`;
        pageContainer.style.gridTemplateRows = `repeat(${rows}, ${cardHeight}mm)`;
        pageContainer.style.justifyContent = 'center';
        pageContainer.style.alignContent = 'center';
        pageContainer.style.gap = '5mm';
        pageContainer.style.padding = '10mm';
        pageContainer.style.backgroundColor = 'white';
        pageContainer.style.boxSizing = 'border-box';

        const component = React.createElement(
            'div', { style: { display: 'contents' } },
            ...chunk.map(student => React.createElement(TemplateComponent, { key: student.id, student, school }))
        );

        const canvas = await renderComponentToCanvas(container, component);
        const imgData = canvas.toDataURL('image/png');
        
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM);

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
    const billsPerPage = 4;
    const studentChunks = Array.from({ length: Math.ceil(students.length / billsPerPage) }, (_, i) =>
        students.slice(i * billsPerPage, i * billsPerPage + billsPerPage)
    );
    
    const classFeesMap = new Map(allClasses.map(c => [c.class_name, c.school_fees || 0]));
    const selectedMonthIndex = monthNames.indexOf(selectedMonth);
    if (selectedMonthIndex === -1) throw new Error("Invalid month selected.");

    for (let i = 0; i < studentChunks.length; i++) {
        const chunk = studentChunks[i];
        
        const pageComponent = React.createElement(
            'div', { style: {
                width: `${A4_WIDTH_MM}mm`, height: `${A4_HEIGHT_MM}mm`, display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)', gridTemplateRows: 'repeat(2, 1fr)',
                backgroundColor: 'white', boxSizing: 'border-box'
            }},
            ...chunk.map(student => React.createElement(TemplateComponent, {
                key: student.id, student, school,
                classFee: classFeesMap.get(student.class || '') || 0,
                selectedMonthIndex: selectedMonthIndex,
            }))
        );

        const canvas = await renderComponentToCanvas(container, pageComponent);
        const imgData = canvas.toDataURL('image/png');

        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM);
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
        const imgData = canvas.toDataURL('image/png');

        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM);
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
    const pdf = new jsPDF('l', 'mm', 'a4'); // Landscape orientation
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
        const imgData = canvas.toDataURL('image/png');

        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, 0, A4_HEIGHT_MM, A4_WIDTH_MM); // Swap width/height for landscape
        onProgress(Math.round(((i + 1) / qualifiedStudents.length) * 100));
    }
    
    document.body.removeChild(container);
    const className = qualifiedStudents[0]?.student.class || 'certificates';
    pdf.save(`certificates_${sanitizeForPath(className)}_${sanitizeForPath(sessionYear)}.pdf`);
};