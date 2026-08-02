import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/**
 * Genera un PDF PRO de una inspección (versión optimizada CoastGuard)
 * @param {string} idInspeccion
 * @param {HTMLElement} elementoHTML - El contenedor HTML del PDF
 * @returns {Promise<Blob>} PDF listo para guardar o subir
 */
export async function generarPDFInspeccion(idInspeccion, elementoHTML) {
  try {
    // Evita capturas parciales en móviles
    window.scrollTo(0, 0);

    // Render HTML → Canvas
    const canvas = await html2canvas(elementoHTML, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: "#ffffff",
      imageTimeout: 2000,
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let y = 0;

    // Primera página
    pdf.addImage(imgData, "PNG", 0, y, imgWidth, imgHeight);

    // Paginación automática
    let heightLeft = imgHeight - pageHeight;

    while (heightLeft > 0) {
      pdf.addPage();
      y = heightLeft * -1;
      pdf.addImage(imgData, "PNG", 0, y, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Numeración de páginas
    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(10);
      pdf.text(`Página ${i} de ${totalPages}`, pageWidth - 40, pageHeight - 10);
    }

    // Footer CoastGuard
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(10);
      pdf.text(
        "CoastGuard — Protección y supervisión de viviendas",
        20,
        pageHeight - 10
      );
    }

    return pdf.output("blob");

  } catch (error) {
    console.error("Error generando PDF:", error);

    // Fallback CoastGuard: PDF válido aunque falle html2canvas
    const pdf = new jsPDF();
    pdf.setFontSize(16);
    pdf.text("Error generando PDF de la inspección.", 20, 20);

    pdf.setFontSize(12);
    pdf.text("CoastGuard — Protección y supervisión de viviendas", 20, 40);

    return pdf.output("blob");
  }
}
