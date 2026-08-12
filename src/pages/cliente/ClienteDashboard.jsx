import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

// Estética táctica CoastGuard (Dorados y Azul Marino Profundo)
const COLOR_DORADO = "#e0b034";
const COLOR_BRILLO = "rgba(224, 176, 52, 0.4)";
const FONDO_PRINCIPAL = "#070b14";
const FONDO_TARJETA = "linear-gradient(145deg, #0f172a 0%, #090d16 100%)";
const BORDE_DORADO = `1px solid ${COLOR_DORADO}`;
const SOMBRA_PROFUNDA = "0 8px 20px rgba(0, 0, 0, 0.6)";

export default function ClienteDashboard() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarCliente() {
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: clienteData, error } = await supabase
        .from("clientes")
        .select("*")
        .eq("usuario_id", user.id)
        .single();

      if (!error) {
        setCliente(clienteData);
      }

      setLoading(false);
    }

    cargarCliente();
  }, [user]);

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: COLOR_DORADO, background: FONDO_PRINCIPAL, minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
        <h3 style={{ textShadow: `0 0 8px ${COLOR_BRILLO}` }}>{t("clienteDashboardCargando")}</h3>
      </div>
    );
  }

  if (!cliente) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#fff", background: FONDO_PRINCIPAL, minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
        <h3>{t("clienteDashboardNoEncontrado")}</h3>
      </div>
    );
  }

  return (
    <div
      style={{
        background: FONDO_PRINCIPAL,
        minHeight: "100vh",
        padding: "20px",
        color: "#fff",
        fontFamily: "Inter, sans-serif",
        boxSizing: "border-box",
      }}
    >
      {/* Cabecera del Dashboard */}
      <div
        style={{
          background: "linear-gradient(90deg, #0d1626 0%, #142036 100%)",
          border: BORDE_DORADO,
          borderRadius: "14px",
          padding: "16px 20px",
          marginBottom: "20px",
          boxShadow: SOMBRA_PROFUNDA,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h2
            style={{
              color: COLOR_DORADO,
              margin: "0 0 4px 0",
              fontSize: "18px",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              textShadow: `0 0 8px ${COLOR_BRILLO}`,
            }}
          >
            {t("clienteDashboardTitulo")}
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "13px", margin: 0 }}>
            {cliente.nombre}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: COLOR_DORADO }}>
          <span style={{ fontSize: '18px' }}>⚓</span>
          <span style={{ fontSize: '12px', fontWeight: '800', letterSpacing: '1px', textShadow: `0 0 6px ${COLOR_BRILLO}` }}>COASTGUARD</span>
        </div>
      </div>

      {/* Tarjeta de Información del Cliente */}
      <div
        style={{
          background: FONDO_TARJETA,
          border: BORDE_DORADO,
          padding: "18px",
          borderRadius: "14px",
          marginBottom: "20px",
          boxShadow: SOMBRA_PROFUNDA,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            background: `linear-gradient(90deg, transparent, ${COLOR_DORADO}, transparent)`,
          }}
        />
        <Linea clave={t("clienteDashboardNombre")} valor={cliente.nombre} />
        <Linea clave={t("clienteDashboardEmail")} valor={cliente.email} />
        <Linea clave={t("clienteDashboardTelefono")} valor={cliente.telefono} />
        {cliente.direccion && (
          <Linea clave={t("clienteContratoDireccion")} valor={cliente.direccion} />
        )}
      </div>

      {/* Botones de Navegación con Estilo Táctico y Efectos */}
      <button
        onClick={() => navigate("/cliente/contratos")}
        style={estilosCliente.boton}
        onMouseOver={(e) => {
          e.currentTarget.style.boxShadow = `0 0 15px ${COLOR_BRILLO}`;
          e.currentTarget.style.transform = "translateY(-2px)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.boxShadow = "none";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        {t("clienteListaTitulo")}
      </button>

      <button
        onClick={() => navigate("/cliente/perfil")}
        style={estilosCliente.botonSec}
        onMouseOver={(e) => {
          e.currentTarget.style.borderColor = COLOR_DORADO;
          e.currentTarget.style.color = COLOR_DORADO;
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.borderColor = "rgba(224, 176, 52, 0.3)";
          e.currentTarget.style.color = "#fff";
        }}
      >
        {t("clientePerfilTitulo")}
      </button>

      <button
        onClick={logout}
        style={estilosCliente.botonLogout}
      >
        {t("logout")}
      </button>
    </div>
  );
}

function Linea({ clave, valor }) {
  if (!valor) return null;
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
        padding: "8px 0",
        borderBottom: "1px solid rgba(224, 176, 52, 0.15)",
      }}
    >
      <span style={{ color: "#94a3b8", fontSize: "13px" }}>{clave}</span>
      <span style={{ fontWeight: 600, fontSize: "14px", textAlign: "right", color: "#e2e8f0" }}>
        {valor}
      </span>
    </div>
  );
}

const estilosCliente = {
  boton: {
    width: "100%",
    background: `linear-gradient(135deg, #e0b034 0%, #b88d22 100%)`,
    color: "#070b14",
    padding: "14px",
    border: "none",
    borderRadius: "10px",
    fontWeight: 700,
    fontSize: "15px",
    cursor: "pointer",
    marginBottom: "12px",
    boxShadow: "0 4px 12px rgba(224, 176, 52, 0.3)",
    transition: "all 0.2s ease",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  botonSec: {
    width: "100%",
    background: "linear-gradient(145deg, #0f172a 0%, #090d16 100%)",
    color: "#fff",
    padding: "13px",
    border: "1px solid rgba(224, 176, 52, 0.3)",
    borderRadius: "10px",
    fontWeight: 600,
    fontSize: "14px",
    cursor: "pointer",
    marginBottom: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
    transition: "all 0.2s ease",
  },
  botonLogout: {
    width: "100%",
    background: "transparent",
    color: "#ef4444",
    padding: "12px",
    border: "1px solid rgba(239, 68, 68, 0.5)",
    borderRadius: "10px",
    fontWeight: 600,
    fontSize: "14px",
    cursor: "pointer",
    marginBottom: "10px",
    boxShadow: "0 0 10px rgba(239, 68, 68, 0.15)",
    transition: "all 0.2s ease",
  },
};
