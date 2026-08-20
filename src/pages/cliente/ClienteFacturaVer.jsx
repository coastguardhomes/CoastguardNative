import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";

const COLOR_DORADO = "#e0b034";
const FONDO_PRINCIPAL = "#030509";
const FONDO_TARJETA = "linear-gradient(145deg, #0b1320 0%, #04070d 100%)";
const BORDE_DORADO_FINO = "1px solid rgba(224, 176, 52, 0.4)";
const BORDE_DORADO_INTENSO = "1px solid rgba(224, 176, 52, 0.8)";
const SOMBRA_LUXURY = "0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 20px rgba(224, 176, 52, 0.2)";
const TEXTO_DORADO_BRILLO = { color: COLOR_DORADO, textShadow: "0 0 15px rgba(224, 176, 52, 0.7)" };
const DEGRADADO_AZUL_BOTON = "linear-gradient(135deg, #38bdf8 0%, #1e3a8a 100%)";

export default function ClienteFacturaVer() {
  const { id } = useParams();
  const [factura, setFactura] = useState(null);
  const [lineas, setLineas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    async function cargar() {
      const { data, error } = await supabase
        .from("facturas")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error || !data) {
        setMensaje("No se encontró la factura");
        setLoading(false);
        return;
      }

      setFactura(data);

      const { data: lineasData } = await supabase
        .from("facturas_lineas")
        .select("*")
        .eq("factura_id", id);

      setLineas(lineasData || []);
      setLoading(false);
    }

    cargar();
  }, [id]);

  if (loading) {
    return (
      <Menu>
        <div style={{ padding: 20, color: COLOR_DORADO, textAlign: "center", background: FONDO_PRINCIPAL, height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <h3 style={TEXTO_DORADO_BRILLO}>Cargando...</h3>
        </div>
      </Menu>
    );
  }

  if (!factura) {
    return (
      <Menu>
        <div style={{ padding: 20, color: "#fff", textAlign: "center", background: FONDO_PRINCIPAL, minHeight: "100vh" }}>
          <h1 style={{ ...TEXTO_DORADO_BRILLO, fontSize: "22px", marginBottom: "15px" }}>{mensaje}</h1>
          <Link to="/cliente/facturas" style={{ color: COLOR_DORADO, textDecoration: "none", fontWeight: "700" }}>
            Volver
          </Link>
        </div>
      </Menu>
    );
  }

  return (
    <Menu>
      <div
        style={{
          padding: "20px",
          background: FONDO_PRINCIPAL,
          minHeight: "100vh",
          color: "#fff",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "900",
            marginBottom: "20px",
            ...TEXTO_DORADO_BRILLO,
            textTransform: "uppercase",
          }}
        >
          Factura {factura.numero}
        </h1>

        <div style={{ background: FONDO_TARJETA, border: BORDE_DORADO_FINO, borderRadius: "16px", padding: "16px", marginBottom: "20px", boxShadow: SOMBRA_LUXURY }}>
          <p style={{ marginBottom: 8 }}>
            <strong style={{ color: COLOR_DORADO }}>Fecha:</strong> {factura.fecha}
          </p>
          <p style={{ marginBottom: 8 }}>
            <strong style={{ color: COLOR_DORADO }}>Descripción:</strong>{" "}
            {factura.descripcion || "—"}
          </p>
          <p style={{ marginBottom: 0 }}>
            <strong style={{ color: COLOR_DORADO }}>Estado:</strong>{" "}
            <span style={{ color: "#34d399", fontWeight: "bold" }}>{factura.estado}</span>
          </p>
        </div>

        {lineas.length > 0 && (
          <div style={{ margin: "20px 0" }}>
            <h2 style={{ ...TEXTO_DORADO_BRILLO, fontSize: 18, marginBottom: 12, fontWeight: "800" }}>
              Detalle
            </h2>
            {lineas.map((l) => (
              <div
                key={l.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  background: FONDO_TARJETA,
                  border: BORDE_DORADO_FINO,
                  padding: "12px 16px",
                  borderRadius: "12px",
                  marginBottom: "8px",
                  boxShadow: SOMBRA_LUXURY,
                }}
              >
                <span>{l.descripcion}</span>
                <span style={{ fontWeight: "700", color: COLOR_DORADO }}>{l.total != null ? `${l.total} €` : ""}</span>
              </div>
            ))}
          </div>
        )}

        <div
          style={{
            background: FONDO_TARJETA,
            border: BORDE_DORADO_FINO,
            padding: "18px",
            borderRadius: "16px",
            marginBottom: "20px",
            boxShadow: SOMBRA_LUXURY,
          }}
        >
          <p style={{ marginBottom: 6 }}>Base: {factura.base} €</p>
          <p style={{ marginBottom: 8 }}>IVA: {factura.iva} €</p>
          <p style={{ fontWeight: 900, fontSize: "18px", color: COLOR_DORADO, textShadow: "0 0 10px rgba(224,176,52,0.5)" }}>
            Total: {factura.total} €
          </p>
        </div>

        {factura.pdf_url ? (
          <a
            href={factura.pdf_url}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "block",
              textAlign: "center",
              padding: "14px",
              background: DEGRADADO_AZUL_BOTON,
              border: BORDE_DORADO_INTENSO,
              color: "#ffffff",
              borderRadius: "16px",
              fontWeight: "900",
              textDecoration: "none",
              boxShadow: "0 6px 20px rgba(56, 189, 248, 0.4), 0 0 15px rgba(224, 176, 52, 0.3)",
              textShadow: "0 1px 3px rgba(0,0,0,0.6)",
            }}
          >
            Ver PDF
          </a>
        ) : (
          <p style={{ opacity: 0.8, textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
            Aún no hay PDF generado para esta factura.
          </p>
        )}
      </div>
    </Menu>
  );
}
