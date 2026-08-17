import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

/**
 * Genera un PDF de inspección que funciona IGUAL en WEB y APP (CoastGuardNative)
 * Versión estable 2026 - Optimizada y unificada
 */
export async function generarPDFInspeccion(elementoHTML) {
  try {
    if (!elementoHTML) {
      throw new Error("El elemento HTML proporcionado es nulo o no existe.");
    }

    // 🔥 Asegurar que todo está visible antes de capturar
    window.scrollTo(0, 0);

    // 🔥 Forzar que el contenedor tenga tamaño real (evita recortes en WebView)
    elementoHTML.style.minHeight = elementoHTML.scrollHeight + "px";

    // 🔥 Esperar a que todas las imágenes carguen (web + app)
    const imagenes = Array.from(elementoHTML.querySelectorAll("img"));
    await Promise.all(
      imagenes.map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete) resolve();
            img.onload = resolve;
            img.onerror = resolve; // Evita que una imagen rota bloquee todo el PDF
          })
      )
    );

    // 🔥 Captura HTML → Canvas (configuración universal web + app)
    const canvas = await html2canvas(elementoHTML, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#ffffff",
      logging: false,
      scrollX: 0,
      scrollY: 0,
      windowWidth: elementoHTML.scrollWidth,
      windowHeight: elementoHTML.scrollHeight,
    });

    const imgData = canvas.toDataURL("image/png");

    // 🔥 Crear PDF A4 (unidades en milímetros)
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let y = 0;

    // 🔥 Primera página
    pdf.addImage(imgData, "PNG", 0, y, imgWidth, imgHeight);

    // 🔥 Paginación automática (web + app)
    let heightLeft = imgHeight - pageHeight;

    while (heightLeft > 0) {
      pdf.addPage();
      y = heightLeft * -1;
      pdf.addImage(imgData, "PNG", 0, y, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // 🔥 Numeración de páginas y Footer unificados en un solo bucle eficiente
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(10);
      pdf.setTextColor("#555555");
      
      // Footer a la izquierda
      pdf.text(
        "CoastGuard — Protección y supervisión de viviendas",
        20,
        pageHeight - 10
      );

      // Numeración a la derecha
      pdf.text(
        `Página ${i} de ${totalPages}`, 
        pageWidth - 40, 
        pageHeight - 10
      );
    }

    return pdf.output("blob");
  } catch (error) {
    console.error("Error generando PDF de inspección:", error);

    // 🔥 Fallback seguro en caso de error crítico
    const pdf = new jsPDF("p", "mm", "a4");
    pdf.setFontSize(16);
    pdf.text("Error generando PDF de la inspección.", 20, 20);

    pdf.setFontSize(12);
    pdf.text("CoastGuard — Protección y supervisión de viviendas", 20, 40);

    return pdf.output("blob");
  }
}
