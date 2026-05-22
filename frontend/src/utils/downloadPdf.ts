import { jsPDF } from 'jspdf';

interface PDFMetadata {
  title: string;
  type?: string;
  clientName?: string;
  date?: string;
  [key: string]: any;
}

/**
 * Utility function to generate and download a clean legal PDF document.
 * Filters out non-ASCII characters to prevent rendering errors in standard jsPDF fonts.
 */
export const downloadPdf = (content: string, filename: string, metadata?: PDFMetadata) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20; // 20mm margins
  const maxLineWidth = pageWidth - (margin * 2); // 170mm printable width

  let y = margin;

  // 1. Title/Header
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(27, 58, 107); // Navy blue brand color (#1B3A6B)
  
  // Strip non-ASCII characters for standard jsPDF fonts
  const cleanTitle = (metadata?.title || 'Legal Document').replace(/[^\x00-\x7F]/g, '');
  doc.text(cleanTitle, pageWidth / 2, y, { align: 'center' });
  y += 12;

  // 2. Metadata Block
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);

  if (metadata) {
    if (metadata.type) {
      doc.text(`Document Type: ${metadata.type.replace(/[^\x00-\x7F]/g, '')}`, margin, y);
      y += 5;
    }
    if (metadata.clientName) {
      doc.text(`Client Name: ${metadata.clientName.replace(/[^\x00-\x7F]/g, '')}`, margin, y);
      y += 5;
    }
    if (metadata.date) {
      doc.text(`Date Created: ${metadata.date.replace(/[^\x00-\x7F]/g, '')}`, margin, y);
      y += 5;
    }
  }

  // Horizontal divider
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y + 2, pageWidth - margin, y + 2);
  y += 12;

  // 3. Document Body Content
  doc.setFont('Courier', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(33, 37, 41);

  // Clean Unicode/Devanagari characters since standard PDF Courier/Helvetica fonts only support ASCII
  const cleanContent = content.replace(/[^\x00-\x7F]/g, '');
  const lines = doc.splitTextToSize(cleanContent, maxLineWidth);
  const lineHeight = 5.5; // spacing in mm

  for (let i = 0; i < lines.length; i++) {
    // If the next line exceeds the printable page height, add a new page
    if (y + lineHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(lines[i], margin, y);
    y += lineHeight;
  }

  // 4. Trigger download
  const cleanFilename = filename.replace(/[^a-zA-Z0-9-_]/g, '_');
  doc.save(`${cleanFilename}.pdf`);
};

/** Named export matching Task 4 specification */
export const downloadLegalDocument = (
  title: string,
  content: string,
  documentType: string
): void => {
  const date = new Date().toISOString().slice(0, 10);
  downloadPdf(content, `${documentType}_${date}`, {
    title,
    type: documentType,
    date,
  });
};
