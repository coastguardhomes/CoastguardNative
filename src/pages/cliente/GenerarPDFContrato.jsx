import React, { useState } from "react";
import { jsPDF } from "jspdf";
import { supabase } from "../../supabaseClient";
import { PRICES } from "../../constants/prices";

export default function GenerarPDFContrato({ contrato, cliente }) {
  const [loading, setLoading] = useState(false);

  const generarPDF = async () => {
    setLoading(true);

    const doc = new jsPDF();

    // Encabezado
    doc.setFontSize(18);
    doc.text("Contrato de Servicio CoastGuard", 20, 20);

    doc.setFontSize(12);
    doc.text(`Nombre del cliente: ${cliente?.nombre || ""}`, 20, 40);
    doc.text(`Dirección: ${cliente?.direccion || ""}`, 20, 50);
    doc.text(`Teléfono: ${cliente?.telefono || ""}`, 20, 60);

    doc.text("Detalles del servicio:", 20, 80);
    doc.text(`Tipo de servicio: ${contrato?.tipoServicio || ""}`, 20, 90);
    doc.text(`Fecha de inicio: ${contrato?.fechaInicio || ""}`, 20, 100);
    doc.text(
      \`Precio mensual: \${PRICES[contrato?.tipoServicio] || "N/D"} €\`,
      20,
      110
    );

    doc.text("Condiciones generales:", 20, 130);
    doc.text(
      "El cliente acepta las condiciones del servicio CoastGuard según lo acordado.",
      20,
      140,
      { maxWidth: 170 }
    );

    // Firma del cliente si existe
    if (contrato?.firma) {
      const { data } = supabase.storage
        .from("firmas")
        .getPublicUrl(contrato.firma);

      const firmaImg = await fetch(data.publicUrl)
        .then((r) => r.blob())
        .then(
          (b) =>
            new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.readAsDataURL(b);
            })
        );

      doc.addImage(firmaImg, "PNG", 20, 160, 60, 30);
    } else {
      doc.text("Firma del cliente: ____________________", 20, 170);
    }

    // Guardar PDF en Supabase Storage
    const pdfBlob = doc.output("blob");
    const filePath = \`contratos/contrato_\${contrato.id}.pdf\`;

    const { error: uploadError } = await supabase.storage
      .from("contratos")
      .upload(filePath, pdfBlob, {
        upsert: true,
        contentType: "application/pdf",
      });

    if (uploadError) {
      console.error("Error subiendo PDF:", uploadError);
      setLoading(false);
      return;
    }

    // Guardar URL en la tabla contratos
    await supabase
      .from("contratos")
      .update({ pdf_url: filePath })
      .eq("id", contrato.id);

    setLoading(false);
    alert("PDF generado y guardado correctamente.");
  };

  return (
    <button
      onClick={generarPDF}
      disabled={loading}
      style={{
        padding: "10px 16px",
        backgroundColor: "#007bff",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        marginTop: "12px",
        opacity: loading ? 0.6 : 1,
      }}
    >
      {loading ? "Generando PDF..." : "Generar PDF del contrato"}
    </button>
  );
}
