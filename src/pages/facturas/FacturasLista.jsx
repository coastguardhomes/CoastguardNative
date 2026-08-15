import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../supabaseClient";

export default function FacturasLista() {
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pdfCargandoId, setPdfCargandoId] = useState(null);

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

  const handleVerPDF = async (facturaId) => {
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
        <div style={{ padding: "20px", textAlign: "center" }}>
          <h3>Cargando lista de facturas...</h3>
        </div>
      </Menu>
    );
  }

  if (!facturas.length) {
    return (
      <Menu>
        <div style={{ padding: "20px", textAlign: "center" }}>
          <h3>No hay facturas registradas.</h3>
        </div>
      </Menu>
    );
  }

  return (
    <Menu>
      <div
        style={{
          background: "#0a0f1a",
          minHeight: "100vh",
          padding: "20px",
          color: "#fff",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <h2 style={{ color: "#4db8ff", marginBottom: 18 }}>Lista de Facturas</h2>

        {facturas.map((f) => (
          <div
            key={f.id}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              padding: "14px",
              borderRadius: "12px",
              marginBottom: "10px",
            }}
          >
            <p><strong style={{ color: "#9fb3c8" }}>Número:</strong> {f.numero || `#${f.id}`}</p>
            <p><strong style={{ color: "#9fb3c8" }}>Total:</strong> {Number(f.total || 0).toFixed(2)} €</p>
            <p><strong style={{ color: "#9fb3c8" }}>Estado:</strong> {f.estado}</p>
            <p><strong style={{ color: "#9fb3c8" }}>Fecha:</strong> {String(f.fecha || "").slice(0, 10)}</p>

            <button
              onClick={() => handleVerPDF(f.id)}
              disabled={pdfCargandoId === f.id}
              style={{
                marginTop: "10px",
                background: "#4db8ff",
                color: "#0a0f1a",
                border: "none",
                padding: "8px 14px",
                borderRadius: "6px",
                fontWeight: "bold",
                cursor: "pointer",
                opacity: pdfCargandoId === f.id ? 0.6 : 1,
              }}
            >
              {pdfCargandoId === f.id ? "Generando..." : "📄 Ver PDF"}
            </button>
          </div>
        ))}
      </div>
    </Menu>
  );
}
