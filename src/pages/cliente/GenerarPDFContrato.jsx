import React, { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

export default function GenerarPDFContrato({
  contrato,
  cliente,
  onGenerado,
}) {
  const { t, changeLanguage } = useLanguage();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const generarPDF = async () => {
    if (loading) return;

    if (!user) {
      alert(t("clienteAccesoDenegado"));
      return;
    }

    if (!contrato?.id) {
      alert("No se puede generar el PDF: falta el identificador del contrato.");
      return;
    }

    setLoading(true);

    try {
      if (cliente?.idioma) {
        changeLanguage(cliente.idioma);
      }

      // El PDF contractual se genera exclusivamente en Supabase.
      // La función comprueba la sesión, el rol y la titularidad del contrato.
      const { data, error } = await supabase.functions.invoke(
        "contrato-pdf",
        {
          body: {
            contratoId: contrato.id,
          },
        }
      );

      if (error) {
        const mensajeServidor =
          data && typeof data.error === "string" ? data.error : "";

        throw new Error(
          mensajeServidor ||
            error.message ||
            "No se pudo generar el PDF del contrato."
        );
      }

      if (!data?.ok || !data?.url) {
        throw new Error(
          data?.error ||
            "Supabase no ha devuelto un enlace válido para el contrato."
        );
      }

      // La URL es temporal y la emite Supabase para el documento autorizado.
      if (typeof onGenerado === "function") {
        onGenerado(data.url);
      } else {
        window.open(data.url, "_blank", "noopener,noreferrer");
      }

      alert(t("pdfGenerado"));
    } catch (err) {
      console.error("Error solicitando el PDF contractual:", err);

      alert(
        t("errorGenerarPdf") +
          (err?.message || "Error desconocido")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={generarPDF}
      disabled={loading}
      style={{
        width: "100%",
        padding: "12px",
        backgroundColor: "#4db8ff",
        color: "#000",
        border: "none",
        borderRadius: "8px",
        cursor: loading ? "wait" : "pointer",
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
