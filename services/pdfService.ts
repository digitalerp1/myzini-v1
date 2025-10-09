import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Student, OwnerProfile } from '../types';
import { IdCardTemplate } from '../components/generators/IdCardTemplate';
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
    const pdf = new jsPDF('p', 'mm', 'a4');

    // Create a temporary, off-screen container for rendering
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    document.body.appendChild(container);

    const studentChunks = [];
    for (let i = 0; i < students.length; i += 4) {
        studentChunks.push(students.slice(i, i + 4));
    }

    for (let i = 0; i < studentChunks.length; i++) {
        const chunk = studentChunks[i];

        // Create a page container to hold 4 cards
        const pageContainer = document.createElement('div');
        pageContainer.style.width = `${A4_WIDTH_MM}mm`;
        pageContainer.style.height = `${A4_HEIGHT_MM}mm`;
        pageContainer.style.display = 'grid';
        pageContainer.style.gridTemplateColumns = `repeat(2, ${CARD_WIDTH_MM}mm)`;
        pageContainer.style.gridTemplateRows = `repeat(2, ${CARD_HEIGHT_MM}mm)`;
        pageContainer.style.justifyContent = 'center';
        pageContainer.style.alignContent = 'center';
        pageContainer.style.gap = '10mm';
        pageContainer.style.padding = '10mm';
        pageContainer.style.backgroundColor = 'white';
        container.appendChild(pageContainer);

        // FIX: The original code used a single React root for the parent container, which is incorrect for rendering multiple pages.
        // This has been corrected to create a new root for each page to ensure proper, isolated rendering before canvas capture.
        // This logical fix also resolves the cascade of syntax and scope errors reported by the compiler.
        const pageRoot = ReactDOM.createRoot(pageContainer);

        // Render the chunk of cards into the page container
        await new Promise<void>(resolve => {
            pageRoot.render(
                <React.StrictMode>
                    {chunk.map(student => (
                        <IdCardTemplate key={student.id} student={student} school={school} />
                    ))}
                </React.StrictMode>
            );
            // Allow time for images to potentially load
            setTimeout(resolve, 500);
        });

        const canvas = await html2canvas(pageContainer, {
            scale: 2, // Increase scale for better quality
            useCORS: true, // Important for external images
            logging: true,
        });

        const imgData = canvas.toDataURL('image/png');
        
        if (i > 0) {
            pdf.addPage();
        }
        pdf.addImage(imgData, 'PNG', 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM);

        // Clean up the rendered page container and its root
        pageRoot.unmount();
        container.removeChild(pageContainer);
    }
    
    // Clean up the main container
    document.body.removeChild(container);

    // FIX: Add a safeguard to prevent errors if the students array is empty.
    const fileName = `id_cards_${sanitizeForPath(students[0]?.class || 'all')}.pdf`;
    pdf.save(fileName);
};
