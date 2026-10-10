import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { resolverUrlPdfSegura } from "../../lib/urlPdf";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

export default function VerPDFContrato() {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [pdfURL, setPdfURL] = useState("");
  const [loading, setLoading] = useState(true);

  // Comprobar que el usuario puede acceder al contrato mediante RLS.
  useEffect(() => {
    let cancelado = false;

    async function comprobarContrato() {
      if (!user) {
        if (!cancelado) {
          setLoading(false);
          setPdfURL("");
        }
        return;
      }

      const { data, error } = await supabase
        .from("contratos")
        .select("id")
        .eq("id", id)
        .maybeSingle();

      if (!cancelado && (error || !data)) {
        navigate("/cliente/dashboard");
      }
    }

    comprobarContrato();

    return () => {
      cancelado = true;
    };
  }, [user, id, navigate]);

  useEffect(() => {
    let cancelado = false;

    async function cargarPDF() {
      setLoading(true);
      setPdfURL("");

      try {
        if (!user || !id) {
          return;
        }

        const { data, error } = await supabase
          .from("contratos")
          .select("pdf_url")
          .eq("id", id)
          .maybeSingle();

        if (error) {
          console.error(
            "Error consultando el PDF del contrato:",
            error
          );
          return;
        }

        if (!data?.pdf_url) {
          console.info(
            "El contrato todavía no tiene PDF generado."
          );
          return;
        }

        const valor = data.pdf_url.trim();

        if (!valor) {
          return;
        }

        let url;

        // Compatibilidad con contratos antiguos cuyo PDF se
        // guardó directamente como Data URI.
        if (/^data:/i.test(valor)) {
          url = valor;
        } else {
          // Resuelve rutas internas y URL antiguas de Storage,
          // incluidas las públicas, firmadas o autenticadas.
          // Genera una URL temporal válida durante una hora.
          url = await resolverUrlPdfSegura(
            valor,
            "contratos",
            3600
          );
        }

        if (cancelado) {
          return;
        }

        if (!url) {
          console.error(
            "No se pudo generar el enlace temporal del contrato."
          );
          return;
        }

        setPdfURL(url);
      } catch (err) {
        if (!cancelado) {
          console.error(
            "Error cargando PDF del contrato:",
            err
          );
          setPdfURL("");
        }
      } finally {
        if (!cancelado) {
          setLoading(false);
        }
      }
    }

    if (user && id) {
      cargarPDF();
    } else {
      setPdfURL("");
      setLoading(false);
    }

    return () => {
      cancelado = true;
    };
  }, [user, id]);

  if (loading) {
    return (
      <Menu>
        <div
          style={{
            height: "100vh",
            background: "#0a0f1a",
            color: "#fff",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontFamily: "Inter, sans-serif",
            fontSize: "18px",
          }}
        >
          {t("pdfCargando")}
        </div>
      </Menu>
    );
  }

  if (!pdfURL) {
    return (
      <Menu>
        <div
          style={{
            height: "100vh",
            background: "#0a0f1a",
            color: "#fff",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontFamily: "Inter, sans-serif",
            fontSize: "18px",
            textAlign: "center",
            padding: "20px",
          }}
        >
          {t("pdfNoGenerado")}
        </div>
      </Menu>
    );
  }

  return (
    <Menu>
      <div
        style={{
          minHeight: "100vh",
          background: "#0a0f1a",
          padding: "20px",
          color: "#fff",
          fontFamily: "Inter, sans-serif",
          paddingBottom: "80px",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            color: "#4db8ff",
            marginBottom: "25px",
            fontSize: "28px",
            fontWeight: "700",
            textShadow: "0 0 8px rgba(0,153,255,0.6)",
          }}
        >
          {t("pdfTituloVista")} #{id}
        </h2>

        <button
          onClick={() => navigate(-1)}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "#6c757d",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            marginBottom: "20px",
            fontWeight: "600",
            fontSize: "15px",
          }}
        >
          {t("pdfVolver")}
        </button>

        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            padding: "10px",
            borderRadius: "14px",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 0 12px rgba(0,153,255,0.2)",
            marginBottom: "20px",
          }}
        >
          <iframe
            src={pdfURL}
            title={t("pdfTituloIframe")}
            style={{
              width: "100%",
              height: "70vh",
              border: "none",
              borderRadius: "10px",
              background: "#fff",
            }}
          />
        </div>

        <button
          onClick={() => {
            window.open(pdfURL, "_blank", "noopener,noreferrer");
          }}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "#28a745",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "700",
            fontSize: "16px",
            boxShadow: "0 0 10px rgba(0,153,255,0.4)",
          }}
        >
          {t("pdfAbrirNuevaPestana")}
        </button>
      </div>
    </Menu>
  );
}
