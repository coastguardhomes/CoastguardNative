import React, { useState } from "react";
import { jsPDF } from "jspdf";
import { supabase } from "../../lib/supabase";
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
      `Precio mensual: ${PRICES[contrato?.tipoServicio] || "N/D"} €`,
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
    const filePath = `contratos/contrato_${contrato.id}.pdf`;

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
        width: "100%",
        padding: "12px",
        backgroundColor: "#4db8ff",
        color: "#000",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        marginTop: "20px",
        fontWeight: "700",
        fontSize: "16px",
        boxShadow: "0 0 10px rgba(0,153,255,0.4)",
        opacity: loading ? 0.7 : 1,
      }}
    >
      {loading ? "Generando PDF..." : "Generar PDF del contrato"}
    </button>
  );
}
