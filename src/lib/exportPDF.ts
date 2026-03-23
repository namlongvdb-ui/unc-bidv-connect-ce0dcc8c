import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function exportUNCToPDF() {
  const element = document.getElementById('unc-paper');
  if (!element) return;

  // Force element to exact A4 dimensions before capture
  const originalWidth = element.style.width;
  const originalMinHeight = element.style.minHeight;
  element.style.width = '210mm';
  element.style.minHeight = '297mm';

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    width: element.scrollWidth,
    height: element.scrollHeight,
  });

  // Restore original styles
  element.style.width = originalWidth;
  element.style.minHeight = originalMinHeight;

  const imgData = canvas.toDataURL('image/jpeg', 0.95);

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = 210;
  const pdfHeight = 297;

  const imgWidth = canvas.width;
  const imgHeight = canvas.height;

  // Scale to fit A4 width, then paginate if content exceeds one page
  const scale = pdfWidth / imgWidth;
  const scaledHeight = imgHeight * scale;

  if (scaledHeight <= pdfHeight) {
    // Fits on one page
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, scaledHeight);
  } else {
    // Multi-page: slice the canvas into A4-height chunks
    const pageCanvasHeight = pdfHeight / scale;
    let remainingHeight = imgHeight;
    let srcY = 0;
    let pageIndex = 0;

    while (remainingHeight > 0) {
      const sliceHeight = Math.min(pageCanvasHeight, remainingHeight);
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = imgWidth;
      pageCanvas.height = sliceHeight;
      const ctx = pageCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(canvas, 0, srcY, imgWidth, sliceHeight, 0, 0, imgWidth, sliceHeight);
      }

      const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.95);

      if (pageIndex > 0) {
        pdf.addPage('a4', 'portrait');
      }
      pdf.addImage(pageImgData, 'JPEG', 0, 0, pdfWidth, sliceHeight * scale);

      srcY += sliceHeight;
      remainingHeight -= sliceHeight;
      pageIndex++;
    }
  }

  pdf.save(`UNC_${new Date().toISOString().slice(0, 10)}.pdf`);
}
