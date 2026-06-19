import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/**
 * Genera un PDF PRO de una inspección
 * @param {string} idInspeccion
 * @param {HTMLElement} elementoHTML - El contenedor HTML del PDF
 * @returns {Promise<Blob>} PDF listo para guardar o subir
 */
export async function generarPDFInspeccion(idInspeccion, elementoHTML) {
  try {
    const canvas = await html2canvas(elementoHTML, {
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);

    // Si la imagen es más larga que una página, añadir páginas
    let heightLeft = imgHeight - pageHeight;

    while (heightLeft > 0) {
      pdf.addPage();
      position = heightLeft - imgHeight;
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    return pdf.output("blob");
  } catch (error) {
    console.error("Error generando PDF:", error);
    throw error;
  }
}
