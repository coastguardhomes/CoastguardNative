import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";

async function urlToBase64(url) {
  const blob = await fetch(url).then(r => r.blob());
  return await new Promise(resolve => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

export async function generarPDFCliente(inspeccion) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  if (inspeccion.logoBase64) {
    doc.addImage(inspeccion.logoBase64, "PNG", 40, 30, 120, 60);
  }

  doc.setFontSize(22);
  doc.setTextColor("#007BFF");
  doc.text("Informe de Inspección", 200, 60);

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

  if (inspeccion.fotos && inspeccion.fotos.length > 0) {
    doc.setFontSize(16);
    doc.text("Fotos de la inspección:", 40, y);
    y += 20;

    for (let url of inspeccion.fotos) {
      try {
        const base64 = await urlToBase64(url);
        doc.addImage(base64, "JPEG", 40, y, 220, 160);
        y += 180;
      } catch (e) {}
    }
  }

  if (inspeccion.firmaBase64) {
    doc.setFontSize(16);
    doc.text("Firma del cliente:", 40, y);
    y += 20;

    doc.addImage(inspeccion.firmaBase64, "PNG", 40, y, 200, 100);
    y += 130;
  }

  const qrData = await QRCode.toDataURL(
    inspeccion.pdf_url || \`https://coastguard.es/inspeccion/\${inspeccion.id}\`
  );

  doc.setFontSize(16);
  doc.text("Código QR del informe:", 40, y);
  y += 20;

  doc.addImage(qrData, "PNG", 40, y, 120, 120);

  doc.setFontSize(10);
  doc.setTextColor("#555");
  doc.text(
    "CoastGuard — Protección y supervisión de viviendas",
    40,
    820
  );

  const pdfArray = doc.output("arraybuffer");
  return new Blob([pdfArray], { type: "application/pdf" });
}
