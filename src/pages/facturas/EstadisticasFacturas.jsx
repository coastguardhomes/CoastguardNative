import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../supabaseClient";

const COLOR_DORADO = "#e0b034";
const FONDO_PRINCIPAL = "#030509";
const FONDO_TARJETA = "linear-gradient(145deg, #0b1320 0%, #04070d 100%)";
const BORDE_DORADO_FINO = "1px solid rgba(224, 176, 52, 0.4)";
const SOMBRA_LUXURY = "0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 20px rgba(224, 176, 52, 0.12)";
const TEXTO_DORADO_BRILLO = { color: COLOR_DORADO, textShadow: "0 0 12px rgba(224, 176, 52, 0.6)" };

export default function EstadisticasFacturas() {
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarFacturas() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setLoading(false);
        return;
      }

      // La tabla facturas no tiene `usuario_id` (se relaciona por
      // `cliente_id`), así que este filtro no devolvía nada nunca. No hace
      // falta filtrar aquí: la política RLS facturas_select ya limita el
      // resultado (el admin ve todas y el cliente sólo las suyas).
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
          Cargando estadísticas...
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
            No hay facturas para mostrar estadísticas.
          </p>
        </div>
      </Menu>
    );
  }

  const totalFacturas = facturas.length;
  // `importe` no existe en la tabla facturas: el importe está en `total`, así
  // que esta suma daba siempre 0.00 €.
  const totalImporte = facturas.reduce((acc, f) => acc + Number(f.total || 0), 0);
  const pagadas = facturas.filter((f) => f.estado === "pagada").length;
  const pendientes = facturas.filter((f) => f.estado === "pendiente").length;

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
          Estadísticas de Facturas
        </h1>

        <div
          style={{
            background: FONDO_TARJETA,
            padding: "20px",
            borderRadius: "16px",
            border: BORDE_DORADO_FINO,
            boxShadow: SOMBRA_LUXURY,
            marginBottom: "24px",
            fontSize: "13px",
            lineHeight: "1.8",
            boxSizing: "border-box",
          }}
        >
          <p style={{ margin: "0 0 8px 0" }}>
            <strong style={{ color: COLOR_DORADO }}>Total de facturas:</strong> {totalFacturas}
          </p>
          <p style={{ margin: "0 0 8px 0" }}>
            <strong style={{ color: COLOR_DORADO }}>Importe total:</strong> {totalImporte.toFixed(2)} €
          </p>
          <p style={{ margin: "0 0 8px 0" }}>
            <strong style={{ color: COLOR_DORADO }}>Facturas pagadas:</strong>{" "}
            <span style={{ color: "#34d399", fontWeight: "700" }}>{pagadas}</span>
          </p>
          <p style={{ margin: 0 }}>
            <strong style={{ color: COLOR_DORADO }}>Facturas pendientes:</strong>{" "}
            <span style={{ color: "#facc15", fontWeight: "700" }}>{pendientes}</span>
          </p>
        </div>

        <div style={{ marginTop: "24px" }}>
          <h2
            style={{
              fontSize: "14px",
              marginBottom: "12px",
              color: COLOR_DORADO,
              fontWeight: "900",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Últimas facturas
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {facturas.slice(0, 5).map((f) => (
              <div
                key={f.id}
                style={{
                  background: FONDO_TARJETA,
                  padding: "14px",
                  borderRadius: "14px",
                  border: BORDE_DORADO_FINO,
                  boxShadow: SOMBRA_LUXURY,
                  fontSize: "13px",
                  lineHeight: "1.6",
                  boxSizing: "border-box",
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
                      color: f.estado === "pagada" ? "#34d399" : "#facc15",
                      fontWeight: "700",
                    }}
                  >
                    {f.estado}
                  </span>
                </p>
                <p style={{ margin: 0, opacity: 0.7, fontSize: "12px" }}>
                  <strong style={{ color: COLOR_DORADO }}>Fecha:</strong> {String(f.fecha || "").slice(0, 10)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Menu>
  );
}
