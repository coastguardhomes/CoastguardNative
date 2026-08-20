import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext.jsx";

const COLOR_DORADO = "#e0b034";
const FONDO_PRINCIPAL = "#030509";
const FONDO_TARJETA = "linear-gradient(145deg, #0b1320 0%, #04070d 100%)";
const BORDE_DORADO_FINO = "1px solid rgba(224, 176, 52, 0.4)";
const SOMBRA_LUXURY = "0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 20px rgba(224, 176, 52, 0.2)";
const TEXTO_DORADO_BRILLO = { color: COLOR_DORADO, textShadow: "0 0 15px rgba(224, 176, 52, 0.7)" };

export default function ClienteFacturasLista() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargar() {
      if (!user) return;

      // RLS (facturas_select) ya limita esto a las facturas del cliente
      // logueado vía mi_cliente_id().
      const { data, error } = await supabase
        .from("facturas")
        .select("*")
        .order("fecha", { ascending: false });

      if (!error) setFacturas(data || []);
      setLoading(false);
    }

    cargar();
  }, [user]);

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
            fontSize: "28px",
            fontWeight: "900",
            marginBottom: "25px",
            ...TEXTO_DORADO_BRILLO,
            textAlign: "center",
            textTransform: "uppercase",
          }}
        >
          Mis Facturas
        </h1>

        {loading ? (
          <p style={{ textAlign: "center", ...TEXTO_DORADO_BRILLO }}>Cargando...</p>
        ) : facturas.length === 0 ? (
          <p style={{ textAlign: "center", color: "#94a3b8", fontSize: "14px" }}>
            No hay facturas registradas.
          </p>
        ) : (
          facturas.map((f) => (
            <div
              key={f.id}
              onClick={() => navigate(`/cliente/factura/${f.id}`)}
              style={{
                background: FONDO_TARJETA,
                padding: "18px",
                borderRadius: "16px",
                border: BORDE_DORADO_FINO,
                boxShadow: SOMBRA_LUXURY,
                marginBottom: "15px",
                cursor: "pointer",
              }}
            >
              <p style={{ marginBottom: 6 }}>
                <strong style={{ color: COLOR_DORADO }}>Nº Factura:</strong>{" "}
                {f.numero}
              </p>
              <p style={{ marginBottom: 6 }}>
                <strong style={{ color: COLOR_DORADO }}>Fecha:</strong> {f.fecha}
              </p>
              <p style={{ marginBottom: 6 }}>
                <strong style={{ color: COLOR_DORADO }}>Total:</strong>{" "}
                <span style={{ fontWeight: "700", color: COLOR_DORADO }}>{f.total != null ? `${f.total} €` : "—"}</span>
              </p>
              <p style={{ marginBottom: 0 }}>
                <strong style={{ color: COLOR_DORADO }}>Estado:</strong>{" "}
                <span style={{ color: "#34d399", fontWeight: "bold" }}>{f.estado}</span>
              </p>
            </div>
          ))
        )}
      </div>
    </Menu>
  );
}
