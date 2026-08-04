import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

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
      <div style={{ padding: "20px", textAlign: "center", color: "#fff" }}>
        <h3>{t("clienteDashboardCargando")}</h3>
      </div>
    );
  }

  if (!cliente) {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "#fff" }}>
        <h3>{t("clienteDashboardNoEncontrado")}</h3>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "#0a0f1a",
        minHeight: "100vh",
        padding: "20px",
        color: "#fff",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <h2 style={{ color: "#4db8ff", marginBottom: 6 }}>
        {t("clienteDashboardTitulo")}
      </h2>
      <p style={{ opacity: 0.7, fontSize: 14, marginBottom: 20 }}>
        {cliente.nombre}
      </p>

      <div style={estilosCliente.tarjeta}>
        <Linea clave={t("clienteDashboardNombre")} valor={cliente.nombre} />
        <Linea clave={t("clienteDashboardEmail")} valor={cliente.email} />
        <Linea clave={t("clienteDashboardTelefono")} valor={cliente.telefono} />
        {cliente.direccion && (
          <Linea clave={t("clienteContratoDireccion")} valor={cliente.direccion} />
        )}
      </div>

      <button
        onClick={() => navigate("/cliente/contratos")}
        style={estilosCliente.boton}
      >
        {t("clienteListaTitulo")}
      </button>

      <button
        onClick={() => navigate("/cliente/perfil")}
        style={estilosCliente.botonSec}
      >
        {t("clientePerfilTitulo")}
      </button>

      <button
        onClick={logout}
        style={estilosCliente.botonSec}
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
        padding: "7px 0",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <span style={{ color: "#9fb3c8", fontSize: 14 }}>{clave}</span>
      <span style={{ fontWeight: 600, fontSize: 14.5, textAlign: "right" }}>
        {valor}
      </span>
    </div>
  );
}

const estilosCliente = {
  tarjeta: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    padding: "18px",
    borderRadius: "14px",
    marginBottom: "18px",
    boxShadow: "0 0 12px rgba(0,153,255,0.15)",
  },
  boton: {
    width: "100%",
    background: "#4db8ff",
    color: "#04263f",
    padding: "14px",
    border: "none",
    borderRadius: "10px",
    fontWeight: 700,
    fontSize: 16,
    cursor: "pointer",
    marginBottom: 10,
  },
  botonSec: {
    width: "100%",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    padding: "12px",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: "10px",
    fontWeight: 600,
    fontSize: 14.5,
    cursor: "pointer",
    marginBottom: 10,
  },
};
