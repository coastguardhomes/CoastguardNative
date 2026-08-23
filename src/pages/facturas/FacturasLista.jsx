import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { supabase } from "../../supabaseClient";

const COLOR_DORADO = "#e0b034";
const FONDO_PRINCIPAL = "#030509";
const FONDO_TARJETA = "linear-gradient(145deg, #0b1320 0%, #04070d 100%)";
const BORDE_DORADO_FINO = "1px solid rgba(224, 176, 52, 0.4)";
const SOMBRA_LUXURY = "0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 20px rgba(224, 176, 52, 0.12)";
const TEXTO_DORADO_BRILLO = { color: COLOR_DORADO, textShadow: "0 0 12px rgba(224, 176, 52, 0.6)" };

export default function FacturasLista() {
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pdfCargandoId, setPdfCargandoId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function cargarFacturas() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.from("facturas").select("*");

      if (error) {
        console.error("Error cargando facturas:", error);
      } else {
        setFacturas(data || []);
      }

      setLoading(false);
    }

    cargarFacturas();
  }, []);

  const handleVerPDF = async (facturaId, e) => {
    e.stopPropagation(); // Evita que se abra la tarjeta al pulsar el PDF
    setPdfCargandoId(facturaId);
    try {
      const { data, error } = await supabase.functions.invoke("factura-pdf", {
        body: { facturaId },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
      } else {
        alert("No se devolvió la URL del PDF.");
      }
    } catch (err) {
      console.error("Error al generar PDF:", err);
      alert("Error al generar el documento PDF.");
    } finally {
      setPdfCargandoId(null);
    }
  };

  if (loading) {
    return (
      <Menu>
        <div
          style={{
            height: "100vh",
            background: FONDO_PRINCIPAL,
            color: COLOR_DORADO,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontFamily: "Inter, sans-serif",
            fontSize: "16px",
            fontWeight: "700",
          }}
        >
          Cargando lista de facturas...
        </div>
      </Menu>
    );
  }

  if (!facturas.length) {
    return (
      <Menu>
        <div
          style={{
            height: "100vh",
            background: FONDO_PRINCIPAL,
            color: "#fff",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontFamily: "Inter, sans-serif",
            padding: "20px",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "14px", color: "#aaa", margin: 0 }}>
            No hay facturas registradas.
          </p>
        </div>
      </Menu>
    );
  }

  return (
    <Menu>
      <div
        style={{
          background: FONDO_PRINCIPAL,
          minHeight: "100vh",
          padding: "20px",
          color: "#fff",
          fontFamily: "Inter, sans-serif",
          paddingBottom: "100px",
          boxSizing: "border-box",
        }}
      >
        <h1
          style={{
            ...TEXTO_DORADO_BRILLO,
            fontSize: "20px",
            fontWeight: "900",
            marginBottom: "20px",
            textAlign: "center",
            textTransform: "uppercase",
          }}
        >
          Lista de Facturas
        </h1>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {facturas.map((f) => (
            <div
              key={f.id}
              onClick={() => navigate(`/facturas/${f.id}`)}
              style={{
                background: FONDO_TARJETA,
                border: BORDE_DORADO_FINO,
                padding: "16px",
                borderRadius: "16px",
                boxShadow: SOMBRA_LUXURY,
                boxSizing: "border-box",
                fontSize: "13px",
                lineHeight: "1.6",
                cursor: "pointer",
                transition: "transform 0.1s ease",
              }}
            >
              <p style={{ margin: "0 0 6px 0" }}>
                <strong style={{ color: COLOR_DORADO }}>Número:</strong> {f.numero || `#${f.id}`}
              </p>
              <p style={{ margin: "0 0 6px 0" }}>
                <strong style={{ color: COLOR_DORADO }}>Total:</strong> {Number(f.total || 0).toFixed(2)} €
              </p>
              <p style={{ margin: "0 0 6px 0" }}>
                <strong style={{ color: COLOR_DORADO }}>Estado:</strong>{" "}
                <span
                  style={{
                    color: f.estado === "pagada" || f.estado === "finalizado" ? "#34d399" : COLOR_DORADO,
                    fontWeight: "700",
                    textTransform: "uppercase"
                  }}
                >
                  {f.estado}
                </span>
              </p>
              <p style={{ margin: "0 0 12px 0", opacity: 0.7, fontSize: "12px" }}>
                <strong style={{ color: COLOR_DORADO }}>Fecha:</strong> {String(f.fecha || "").slice(0, 10)}
              </p>

              <button
                onClick={(e) => handleVerPDF(f.id, e)}
                disabled={pdfCargandoId === f.id}
                style={{
                  width: "100%",
                  background: "linear-gradient(135deg, #38bdf8 0%, #1e3a8a 100%)",
                  color: "#fff",
                  border: BORDE_DORADO_FINO,
                  padding: "12px",
                  borderRadius: "12px",
                  fontWeight: "900",
                  fontSize: "12px",
                  cursor: pdfCargandoId === f.id ? "not-allowed" : "pointer",
                  opacity: pdfCargandoId === f.id ? 0.6 : 1,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  boxShadow: "0 4px 15px rgba(56, 189, 248, 0.3)",
                  boxSizing: "border-box",
                }}
              >
                {pdfCargandoId === f.id ? "Generando..." : "📄 Ver PDF"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </Menu>
  );
}
