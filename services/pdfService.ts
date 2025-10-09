import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Student, OwnerProfile, Class } from '../types';
import { IdCardTemplate } from '../components/generators/IdCardTemplate';
import { DuesBillTemplate } from '../components/generators/DuesBillTemplate';
import { sanitizeForPath } from '../utils/textUtils';

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const CARD_WIDTH_MM = 85.6;
const CARD_HEIGHT_MM = 53.98;

/**
 * Generates a PDF of ID cards for a list of students.
 * Renders the cards off-screen, captures them with html2canvas, and adds them to a jsPDF instance.
 * @param students The list of students to generate cards for.
 * @param school The school's profile information.
 */
export const generateIdCardsPdf = async (students: Student[], school: OwnerProfile): Promise<void> => {
    if (!students || students.length === 0) {
        console.warn("generateIdCardsPdf called with no students. Aborting PDF generation.");
        return;
    }

    const pdf = new jsPDF('p', 'mm', 'a4');

    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    document.body.appendChild(container);

    const studentChunks = [];
    for (let i = 0; i < students.length; i += 8) {
        studentChunks.push(students.slice(i, i + 8));
    }

    for (let i = 0; i < studentChunks.length; i++) {
        const chunk = studentChunks[i];

        const pageContainer = document.createElement('div');
        pageContainer.style.width = `${A4_WIDTH_MM}mm`;
        pageContainer.style.height = `${A4_HEIGHT_MM}mm`;
        pageContainer.style.display = 'grid';
        pageContainer.style.gridTemplateColumns = `repeat(2, ${CARD_WIDTH_MM}mm)`;
        pageContainer.style.gridTemplateRows = `repeat(4, ${CARD_HEIGHT_MM}mm)`;
        pageContainer.style.justifyContent = 'center';
        pageContainer.style.alignContent = 'center';
        pageContainer.style.gap = '5mm';
        pageContainer.style.padding = '10mm';
        pageContainer.style.backgroundColor = 'white';
        pageContainer.style.boxSizing = 'border-box';
        container.appendChild(pageContainer);

        const pageRoot = ReactDOM.createRoot(pageContainer);

        await new Promise<void>(resolve => {
            pageRoot.render(
                React.createElement(
                    React.StrictMode,
                    null,
                    ...chunk.map(student =>
                        React.createElement(IdCardTemplate, {
                            key: student.id,
                            student: student,
                            school: school,
                        })
                    )
                )
            );
            setTimeout(resolve, 1000); // Increased timeout for QR code generation
        });

        const canvas = await html2canvas(pageContainer, {
            scale: 2,
            useCORS: true,
            logging: false,
        });

        const imgData = canvas.toDataURL('image/png');
        
        if (i > 0) {
            pdf.addPage();
        }
        pdf.addImage(imgData, 'PNG', 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM);

        pageRoot.unmount();
        container.removeChild(pageContainer);
    }
    
    document.body.removeChild(container);

    const fileName = `id_cards_${sanitizeForPath(students[0].class || 'all')}.pdf`;
    pdf.save(fileName);
};


const monthNames = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

/**
 * Generates a PDF of fee dues bills for a list of students.
 * Renders 4 bills per A4 page.
 * @param students List of students for the selected class.
 * @param school The school's profile information.
 * @param allClasses A list of all classes to find fee information.
 * @param selectedMonth The month for which the bill is being generated (e.g., "july").
 */
export const generateDuesBillPdf = async (
    students: Student[],
    school: OwnerProfile,
    allClasses: Class[],
    selectedMonth: string
): Promise<void> => {
    if (!students || students.length === 0) {
        console.warn("generateDuesBillPdf called with no students.");
        return;
    }

    const pdf = new jsPDF('p', 'mm', 'a4');
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    document.body.appendChild(container);

    const studentChunks = [];
    for (let i = 0; i < students.length; i += 4) {
        studentChunks.push(students.slice(i, i + 4));
    }
    
    const classFeesMap = new Map(allClasses.map(c => [c.class_name, c.school_fees || 0]));
    const selectedMonthIndex = monthNames.indexOf(selectedMonth);

    if (selectedMonthIndex === -1) {
        throw new Error("Invalid month selected for dues bill generation.");
    }

    for (let i = 0; i < studentChunks.length; i++) {
        const chunk = studentChunks[i];
        
        const pageContainer = document.createElement('div');
        pageContainer.style.width = `${A4_WIDTH_MM}mm`;
        pageContainer.style.height = `${A4_HEIGHT_MM}mm`;
        pageContainer.style.display = 'grid';
        pageContainer.style.gridTemplateColumns = 'repeat(2, 1fr)';
        pageContainer.style.gridTemplateRows = 'repeat(2, 1fr)';
        pageContainer.style.backgroundColor = 'white';
        pageContainer.style.boxSizing = 'border-box';
        container.appendChild(pageContainer);

        const pageRoot = ReactDOM.createRoot(pageContainer);

        await new Promise<void>(resolve => {
            pageRoot.render(
                React.createElement(
                    React.StrictMode,
                    null,
                    ...chunk.map(student =>
                        React.createElement(DuesBillTemplate, {
                            key: student.id,
                            student: student,
                            school: school,
                            classFee: classFeesMap.get(student.class || '') || 0,
                            selectedMonthIndex: selectedMonthIndex,
                        })
                    )
                )
            );
            setTimeout(resolve, 1000);
        });

        const canvas = await html2canvas(pageContainer, { scale: 2, useCORS: true, logging: false });
        const imgData = canvas.toDataURL('image/png');

        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM);

        pageRoot.unmount();
        container.removeChild(pageContainer);
    }
    
    document.body.removeChild(container);

    const fileName = `dues_bills_${sanitizeForPath(students[0].class || 'class')}_${selectedMonth}.pdf`;
    pdf.save(fileName);
};