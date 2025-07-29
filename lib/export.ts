import Papa from 'papaparse';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportToCSV = (data: any[], filename: string) => {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    // Temporarily modify styles for better PDF rendering
    const originalOverflow = element.style.overflow; // Store original overflow

    // Add a small delay before setting overflow to visible
    await new Promise(resolve => setTimeout(resolve, 100));
    element.style.overflow = 'visible';
    
    // Wait for any animations to complete and for the DOM to settle
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true,
      backgroundColor: '#ffffff',
      width: element.scrollWidth,
      height: element.scrollHeight,
      scrollX: 0,
      scrollY: 0,
      allowTaint: true,
      foreignObjectRendering: true
    });

    // Restore original styles
    element.style.overflow = originalOverflow;
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = 297; // A4 landscape width in mm
    const pdfHeight = 210; // A4 landscape height in mm
    const margin = 10; // 10mm margin on all sides
    const contentWidth = pdfWidth - (margin * 2);
    const contentHeight = pdfHeight - (margin * 2);
    
    // Calculate proper scaling to fit content
    const imgWidth = contentWidth;
    const imgHeight = (canvas.height * contentWidth) / canvas.width;
    const scaledHeight = (canvas.height * contentWidth) / canvas.width;

    // If content fits on one page, center it
    if (scaledHeight <= contentHeight) {
      const yOffset = margin + (contentHeight - scaledHeight) / 2;
      pdf.addImage(imgData, 'PNG', margin, yOffset, contentWidth, scaledHeight);
    } else {
      // Multiple pages needed
      let remainingHeight = scaledHeight;
      let sourceY = 0;
      let pageNumber = 0;

      while (remainingHeight > 0) {
        if (pageNumber > 0) {
          pdf.addPage();
        }

        const currentPageHeight = Math.min(contentHeight, remainingHeight);
        const sourceHeight = (currentPageHeight * canvas.height) / scaledHeight;
        
        // Create a temporary canvas for this page section
        const pageCanvas = document.createElement('canvas');
        const pageCtx = pageCanvas.getContext('2d');
        pageCanvas.width = canvas.width;
        pageCanvas.height = sourceHeight;
        
        if (pageCtx) {
          pageCtx.drawImage(
            canvas,
            0, sourceY, canvas.width, sourceHeight,
            0, 0, canvas.width, sourceHeight
          );
          
          const pageImgData = pageCanvas.toDataURL('image/png');
          pdf.addImage(pageImgData, 'PNG', margin, margin, contentWidth, currentPageHeight);
        }
        
        sourceY += sourceHeight;
        remainingHeight -= currentPageHeight;
        pageNumber++;
      }
    }

    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw error;
  }
}