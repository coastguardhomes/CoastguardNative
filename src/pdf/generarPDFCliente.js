import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";

/**
 * Convierte una URL o Base64 existente a formato Base64 seguro (WEB + APP)
 */
async function urlToBase64(input) {
  if (!input) return null;
  
  // Si ya viene en formato base64, lo devolvemos directamente sin hacer fetch (evita errores en móvil)
  if (typeof input === "string" && input.startsWith("data:image")) {
    return input;
  }

  try {
    const res = await fetch(input, { mode: "cors" });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const blob = await res.blob();

    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.warn("Error convirtiendo imagen a base64:", e);
    return null;
  }
}

/**
 * Genera el PDF del cliente (WEB + APP)
 */
export async function generarPDFCliente(inspeccion) {
  const doc = new jsPDF({
    unit: "pt",
    format: "a4",
    compress: true, // 🔥 evita PDFs corruptos en APP
  });

  const pageHeight = doc.internal.pageSize.getHeight();

  // LOGO
  if (inspeccion.logoBase64) {
    try {
      doc.addImage(inspeccion.logoBase64, "PNG", 40, 30, 120, 60);
    } catch {
      console.warn("Logo no válido");
    }
  }

  doc.setFontSize(22);
  doc.setTextColor("#007BFF");
  doc.text("Informe de Inspección", 200, 60);

  // Línea decorativa
  doc.setLineWidth(2);
  doc.setDrawColor(0, 123, 255);
  doc.line(40, 95, 550, 95);

  // Fecha real
  const fechaReal = inspeccion.creado_en
    ? new Date(inspeccion.creado_en).toLocaleString()
    : "Sin fecha";

  // TABLA (versión estable para APP)
  autoTable(doc, {
    startY: 120,
    head: [["Campo", "Valor"]],
    body: [
      ["ID Inspección", inspeccion.id || "N/A"],
      ["Contrato", inspeccion.contrato_id || "Sin contrato"],
      ["Fecha", fechaReal],
      ["Inspector", inspeccion.inspector || "No especificado"],
      ["Notas", inspeccion.notas || "Sin notas"],
    ],
    theme: "grid",
    headStyles: { fillColor: [0, 123, 255] },
    styles: { fontSize: 11, cellPadding: 4 },
    margin: { left: 40, right: 40 },
  });

  let y = doc.lastAutoTable.finalY + 30;

  // Control por si la tabla cae muy abajo en la página
  if (y > pageHeight - 100) {
    doc.addPage();
    y = 40;
  }

  // FOTOS
  if (inspeccion.fotos && inspeccion.fotos.length > 0) {
    doc.setFontSize(16);
    doc.text("Fotos de la inspección:", 40, y);
    y += 20;

    for (const item of inspeccion.fotos) {
      const imageUrl = typeof item === "string" ? item : item.url;
      const base64 = await urlToBase64(imageUrl);
      if (!base64) continue;

      if (y + 180 > pageHeight - 40) {
        doc.addPage();
        y = 40;
      }

      try {
        doc.addImage(base64, "JPEG", 40, y, 220, 160);
      } catch {
        try {
          doc.addImage(base64, "PNG", 40, y, 220, 160);
        } catch {
          console.warn("No se pudo añadir una de las fotos al PDF");
        }
      }

      doc.setDrawColor(0, 123, 255);
      doc.setLineWidth(1);
      doc.rect(40, y, 220, 160);

      y += 180;
    }
  }

  // FIRMA
  if (inspeccion.firmaBase64) {
    if (y + 130 > pageHeight - 40) {
      doc.addPage();
      y = 40;
    }

    doc.setFontSize(16);
    doc.text("Firma del cliente:", 40, y);
    y += 20;

    try {
      doc.addImage(inspeccion.firmaBase64, "PNG", 40, y, 200, 100);
    } catch {
      console.warn("Firma no válida");
    }

    y += 130;
  }

  // QR
  let qrData;
  try {
    qrData = await QRCode.toDataURL(
      inspeccion.pdf_url ||
        `https://coastguard.es/inspeccion/${inspeccion.id || "generada"}`
    );
  } catch {
    qrData = await QRCode.toDataURL("https://coastguard.es");
  }

  if (y + 140 > pageHeight - 40) {
    doc.addPage();
    y = 40;
  }

  doc.setFontSize(16);
  doc.text("Código QR del informe:", 40, y);
  y += 20;

  doc.addImage(qrData, "PNG", 40, y, 120, 120);
  y += 140;

  // FOOTER Y NUMERACIÓN (Se aplica al final en todas las páginas)
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor("#555");
    doc.text(
      "CoastGuard — Protección y supervisión de viviendas",
      40,
      pageHeight - 30
    );
    doc.text(`Generado: ${new Date().toLocaleString()}`, 40, pageHeight - 45);
    doc.text(`Página ${i} de ${pageCount}`, 500, pageHeight - 20);
  }

  const pdfArray = doc.output("arraybuffer");
  return new Blob([pdfArray], { type: "application/pdf" });
}
