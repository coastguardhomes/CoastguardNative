import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";

async function urlToBase64(url) {
  try {
    const blob = await fetch(url).then(r => r.blob());
    return await new Promise(resolve => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function generarPDFCliente(inspeccion) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageHeight = doc.internal.pageSize.getHeight();

  // LOGO
  if (inspeccion.logoBase64) {
    doc.addImage(inspeccion.logoBase64, "PNG", 40, 30, 120, 60);
  }

  doc.setFontSize(22);
  doc.setTextColor("#007BFF");
  doc.text("Informe de Inspección", 200, 60);

  // Línea decorativa
  doc.setLineWidth(2);
  doc.setDrawColor(0, 123, 255);
  doc.line(40, 95, 550, 95);

  // TABLA
  autoTable(doc, {
    startY: 120,
    head: [["Campo", "Valor"]],
    body: [
      ["ID Inspección", inspeccion.id],
      ["Contrato", inspeccion.contrato_id],
      ["Fecha", inspeccion.fecha],
      ["Inspector", inspeccion.inspector || "No especificado"],
      ["Notas", inspeccion.notas || "Sin notas"],
    ],
    theme: "grid",
    headStyles: { fillColor: [0, 123, 255] },
  });

  let y = doc.lastAutoTable.finalY + 30;

  // FOTOS
  if (inspeccion.fotos?.length > 0) {
    doc.setFontSize(16);
    doc.text("Fotos de la inspección:", 40, y);
    y += 20;

    for (const url of inspeccion.fotos) {
      const base64 = await urlToBase64(url);
      if (!base64) continue;

      if (y + 180 > pageHeight - 40) {
        doc.addPage();
        y = 40;
      }

      doc.addImage(base64, "JPEG", 40, y, 220, 160, undefined, "FAST");

      // Marco azul CoastGuard
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

    doc.addImage(inspeccion.firmaBase64, "PNG", 40, y, 200, 100);
    y += 130;
  }

  // QR
  let qrData;
  try {
    qrData = await QRCode.toDataURL(
      inspeccion.pdf_url || `https://coastguard.es/inspeccion/${inspeccion.id}`
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

  // FOOTER
  doc.setFontSize(10);
  doc.setTextColor("#555");
  doc.text(
    "CoastGuard — Protección y supervisión de viviendas",
    40,
    pageHeight - 30
  );

  // Fecha de generación
  doc.text(`Generado: ${new Date().toLocaleString()}`, 40, pageHeight - 45);

  // Numeración de páginas
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(`Página ${i} de ${pageCount}`, 500, pageHeight - 20);
  }

  const pdfArray = doc.output("arraybuffer");
  return new Blob([pdfArray], { type: "application/pdf" });
}
