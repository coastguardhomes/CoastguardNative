import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { resolverUrlPdfSegura } from "../../lib/urlPdf";

async function obtenerUrlPdfSegura(valor) {
  if (!valor || typeof valor !== "string") {
    return null;
  }

  const ruta = valor.trim();

  if (!ruta) {
    return null;
  }

  // Para URL antiguas de Supabase, el helper detecta el bucket
  // original y genera un enlace temporal.
  if (/^https?:\/\//i.test(ruta)) {
    return resolverUrlPdfSegura(ruta, "pdfs", 3600);
  }

  const rutaLimpia = ruta.replace(/^\/+/, "");

  // Si la ruta identifica explícitamente el bucket histórico,
  // usar ese bucket en lugar de asumir que es "pdfs".
  if (rutaLimpia.startsWith("pdf_inspecciones/")) {
    return resolverUrlPdfSegura(
      rutaLimpia,
      "pdf_inspecciones",
      3600
    );
  }

  // Intentar primero el bucket actual.
  const urlActual = await resolverUrlPdfSegura(
    rutaLimpia,
    "pdfs",
    3600
  );

  if (urlActual) {
    return urlActual;
  }

  // Compatibilidad con rutas relativas de archivos históricos.
  return resolverUrlPdfSegura(
    rutaLimpia,
    "pdf_inspecciones",
    3600
  );
}

export default function VerPDF() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    let cancelado = false;

    async function cargarPDF() {
      setLoading(true);
      setPdfUrl(null);
      setMensaje("");

      try {
        let query = supabase
          .from("inspecciones")
          .select("id, pdf_url");

        // Si se recibe un ID, cargar esa inspección.
        // Si no, buscar la inspección más reciente que tenga PDF.
        if (id) {
          query = query.eq("id", id).maybeSingle();
        } else {
          query = query
            .not("pdf_url", "is", null)
            .order("id", { ascending: false })
            .limit(1)
            .maybeSingle();
        }

        const { data, error } = await query;

        if (error) {
          console.error("Error cargando PDF:", error);

          throw new Error(
            "No se pudo consultar el informe. Comprueba tus permisos e inténtalo de nuevo."
          );
        }

        if (cancelado) return;

        if (!data) {
          setMensaje(
            id
              ? "No se encontró la inspección solicitada."
              : "Todavía no hay ningún informe PDF disponible."
          );
          return;
        }

        if (!data.pdf_url) {
          setMensaje(
            "Todavía no hay ningún informe PDF generado para esta inspección."
          );
          return;
        }

        // Resolver URL públicas antiguas, rutas relativas y
        // archivos guardados en buckets históricos o actuales.
        const url = await obtenerUrlPdfSegura(data.pdf_url);

        if (cancelado) return;

        if (!url) {
          throw new Error(
            "No se pudo abrir el PDF. Puede que el archivo no exista o que tu usuario no tenga permiso para acceder a él."
          );
        }

        setPdfUrl(url);
      } catch (error) {
        if (cancelado) return;

        console.error("Error cargando PDF de inspección:", error);

        setMensaje(
          error?.message ||
            "Se produjo un error al cargar el PDF."
        );
      } finally {
        if (!cancelado) {
          setLoading(false);
        }
      }
    }

    cargarPDF();

    return () => {
      cancelado = true;
    };
  }, [id]);

  return (
    <Menu>
      <div
        style={{
          padding: "20px",
          background: "#0a0f1a",
          minHeight: "100vh",
          color: "#fff",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "700",
            marginBottom: "25px",
            color: "#4db8ff",
            textShadow: "0 0 8px rgba(0,153,255,0.6)",
            textAlign: "center",
          }}
        >
          PDF de Inspección {id ? `#${id}` : ""}
        </h1>

        {mensaje && (
          <p
            role="alert"
            style={{
              marginBottom: "15px",
              color: "#4db8ff",
              fontWeight: "600",
              textAlign: "center",
              lineHeight: 1.6,
            }}
          >
            {mensaje}
          </p>
        )}

        {loading ? (
          <p
            style={{
              opacity: 0.8,
              textAlign: "center",
            }}
          >
            Cargando PDF...
          </p>
        ) : !pdfUrl ? (
          <p
            style={{
              opacity: 0.8,
              textAlign: "center",
            }}
          >
            No hay ningún PDF disponible para mostrar.
          </p>
        ) : (
          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              padding: "20px",
              borderRadius: "14px",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 0 12px rgba(0,153,255,0.2)",
              marginBottom: "25px",
            }}
          >
            <iframe
              src={pdfUrl}
              title="PDF Inspección"
              style={{
                width: "100%",
                height: "500px",
                border: "2px solid #4db8ff",
                borderRadius: "12px",
                background: "#fff",
              }}
            />

            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                marginTop: "20px",
                padding: "14px",
                width: "100%",
                display: "block",
                boxSizing: "border-box",
                background: "#4db8ff",
                color: "#000",
                borderRadius: "10px",
                textAlign: "center",
                textDecoration: "none",
                fontWeight: "700",
                fontSize: "17px",
                cursor: "pointer",
                boxShadow: "0 0 10px rgba(0,153,255,0.4)",
              }}
            >
              Abrir o descargar PDF
            </a>
          </div>
        )}

        {id && (
          <button
            type="button"
            onClick={() => navigate(`/inspecciones/${id}`)}
            style={{
              marginTop: "10px",
              padding: "14px",
              width: "100%",
              background: "transparent",
              color: "#4db8ff",
              borderRadius: "10px",
              border: "1px solid #4db8ff",
              fontWeight: "700",
              fontSize: "15px",
              cursor: "pointer",
            }}
          >
            ← Volver a la inspección
          </button>
        )}
      </div>
    </Menu>
  );
}
