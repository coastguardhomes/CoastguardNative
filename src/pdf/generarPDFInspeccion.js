import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/**
 * Genera un PDF PRO de una inspección CoastGuard
 * @param {HTMLElement} elementoHTML - El contenedor HTML del informe
 * @returns {Promise<Blob>} PDF listo para subir a Supabase
 */
export async function generarInspeccion(elementoHTML) {
  try {
    // 🔥 Asegurar que todo está visible antes de capturar
    window.scrollTo(0, 0);

    // 🔥 Esperar a que todas las imágenes carguen
    const imgs = Array.from(elementoHTML.querySelectorAll("img"));
    await Promise.all(
      imgs.map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete) resolve();
            img.onload = resolve;
            img.onerror = resolve;
          })
      )
    );

    // 🔥 Captura HTML → Canvas
    const canvas = await html2canvas(elementoHTML, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#ffffff",
      logging: false,
      imageTimeout: 2000,
      scrollX: 0,
      scrollY: 0,
      windowWidth: elementoHTML.scrollWidth,
      windowHeight: elementoHTML.scrollHeight,
    });

    const imgData = canvas.toDataURL("image/png");

    // 🔥 Crear PDF A4
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let y = 0;

    // 🔥 Primera página
    pdf.addImage(imgData, "PNG", 0, y, imgWidth, imgHeight);

    // 🔥 Paginación automática
    let heightLeft = imgHeight - pageHeight;

    while (heightLeft > 0) {
      pdf.addPage();
      y = heightLeft * -1;
      pdf.addImage(imgData, "PNG", 0, y, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // 🔥 Numeración de páginas
    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(10);
      pdf.text(`Página ${i} de ${totalPages}`, pageWidth - 40, pageHeight - 10);
    }

    // 🔥 Footer CoastGuard
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

    // 🔥 Fallback CoastGuard: PDF válido aunque falle html2canvas
    const pdf = new jsPDF();
    pdf.setFontSize(16);
    pdf.text("Error generando PDF de la inspección.", 20, 20);

    pdf.setFontSize(12);
    pdf.text("CoastGuard — Protección y supervisión de viviendas", 20, 40);

    return pdf.output("blob");
  }
}
