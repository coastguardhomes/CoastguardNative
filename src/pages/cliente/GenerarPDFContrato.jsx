import React, { useState } from "react";
import { jsPDF } from "jspdf";
import { supabase } from "../../lib/supabase";
import { PRICES } from "../../constants/prices";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function GenerarPDFContrato({ contrato, cliente }) {
  const { t, lang } = useLanguage();
  const [loading, setLoading] = useState(false);

  const generarPDF = async () => {
    setLoading(true);

    const doc = new jsPDF();

    // Encabezado
    doc.setFontSize(18);
    doc.text(t("pdfTitulo"), 20, 20);

    doc.setFontSize(12);
    doc.text(`${t("pdfNombreCliente")}: ${cliente?.nombre || ""}`, 20, 40);
    doc.text(`${t("pdfDireccion")}: ${cliente?.direccion || ""}`, 20, 50);
    doc.text(`${t("pdfTelefono")}: ${cliente?.telefono || ""}`, 20, 60);

    doc.text(t("pdfDetallesServicio"), 20, 80);
    doc.text(`${t("pdfTipoServicio")}: ${contrato?.tipoServicio || ""}`, 20, 90);
    doc.text(`${t("pdfFechaInicio")}: ${contrato?.fechaInicio || ""}`, 20, 100);

    doc.text(
      `${t("pdfPrecioMensual")}: ${PRICES[contrato?.tipoServicio] || "N/D"} €`,
      20,
      110
    );

    doc.text(t("pdfCondiciones"), 20, 130);
    doc.text(t("pdfCondicionesTexto"), 20, 140, { maxWidth: 170 });

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
      doc.text(`${t("pdfFirmaCliente")}: ____________________`, 20, 170);
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
    alert(t("pdfGenerado"));
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
      {loading ? t("pdfGenerando") : t("pdfGenerar")}
    </button>
  );
}
