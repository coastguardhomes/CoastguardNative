import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import { supabase } from "../../lib/supabase";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

export default function GenerarPDFContrato({ contrato, cliente, onGenerado }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function comprobarContrato() {
      if (!user || !contrato?.id) return;

      const { data, error } = await supabase
        .from("contratos")
        .select("cliente_id")
        .eq("id", contrato.id)
        .single();

      if (error || !data) {
        alert(t("clienteAccesoDenegado"));
      }
    }

    comprobarContrato();
  }, [user, contrato?.id, t]);

  const generarPDF = async () => {
    setLoading(true);

    try {
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text(t("pdfTitulo"), 20, 20);

      doc.setFontSize(12);
      doc.text(`${t("pdfNombreCliente")}: ${cliente?.nombre || ""}`, 20, 40);
      doc.text(`${t("pdfDireccion")}: ${cliente?.direccion || ""}`, 20, 50);
      doc.text(`${t("pdfTelefono")}: ${cliente?.telefono || ""}`, 20, 60);

      doc.text(t("pdfDetallesServicio"), 20, 80);
      doc.text(
        `${t("pdfTipoServicio")}: ${
          contrato?.frecuencia ? `${t("contratoCadaDias")} ${contrato.frecuencia}` : "N/D"
        }`,
        20,
        90
      );
      doc.text(`${t("pdfFechaInicio")}: ${contrato?.fecha_inicio || "N/D"}`, 20, 100);
      doc.text(
        `${t("pdfPrecioMensual")}: ${
          contrato?.precio != null ? contrato.precio : "N/D"
        } €`,
        20,
        110
      );

      doc.text(t("pdfCondiciones"), 20, 130);
      doc.text(t("pdfCondicionesTexto"), 20, 140, { maxWidth: 170 });

      // Firma del cliente
      if (contrato?.firma) {
        try {
          const { data, error } = await supabase.storage
            .from("firmas")
            .download(contrato.firma);

          if (!error && data) {
            const reader = new FileReader();
            const base64 = await new Promise((resolve) => {
              reader.onload = () => resolve(reader.result);
              reader.readAsDataURL(data);
            });

            doc.addImage(base64, "PNG", 20, 160, 60, 30);
          } else {
            doc.text(`${t("pdfFirmaCliente")}: ____________________`, 20, 170);
          }
        } catch {
          doc.text(`${t("pdfFirmaCliente")}: ____________________`, 20, 170);
        }
      } else {
        doc.text(`${t("pdfFirmaCliente")}: ____________________`, 20, 170);
      }

      // Guardar PDF en Supabase Storage
      const pdfBlob = doc.output("blob");
      const fileName = `contrato_${contrato.id}.pdf`;

      const { error: uploadError } = await supabase.storage
        .from("contratos")
        .upload(fileName, pdfBlob, {
          upsert: true,
          contentType: "application/pdf",
        });

      if (uploadError) {
        console.error("Error subiendo PDF:", uploadError);
        alert("Error al subir el PDF a Storage.");
        setLoading(false);
        return;
      }

      // Obtener URL pública completa
      const { data: publicData } = supabase.storage
        .from("contratos")
        .getPublicUrl(fileName);

      const fullPdfUrl = publicData.publicUrl;

      // Actualizar registro en base de datos con la URL pública completa
      await supabase
        .from("contratos")
        .update({
          pdf_url: fullPdfUrl,
          fecha_pdf: new Date().toISOString(),
          estado_pdf: "generado",
        })
        .eq("id", contrato.id);

      alert(t("pdfGenerado"));

      if (onGenerado) onGenerado();
    } catch (err) {
      console.error("Error generando PDF:", err);
      alert("Error al generar el PDF: " + err.message);
    } finally {
      setLoading(false);
    }
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
