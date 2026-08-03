import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function PerfilCliente() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarCliente() {
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .eq("usuario_id", user.id)
        .single();

      if (!error) {
        setCliente(data);
      }

      setLoading(false);
    }

    cargarCliente();
  }, [user]);

  if (loading) {
    return (
      <Menu>
        <div
          style={{
            height: "100%",
            background: "#0a0f1a",
            color: "#fff",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontFamily: "Inter, sans-serif",
            fontSize: "18px",
          }}
        >
          {t("clienteDashboardCargando")}
        </div>
      </Menu>
    );
  }

  if (!cliente) {
    return (
      <Menu>
        <div
          style={{
            height: "100%",
            background: "#0a0f1a",
            color: "#fff",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontFamily: "Inter, sans-serif",
            fontSize: "18px",
          }}
        >
          {t("clienteDashboardNoEncontrado")}
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
        <h2
          style={{
            color: "#4db8ff",
            marginBottom: "20px",
            fontSize: "28px",
            fontWeight: "700",
            textShadow: "0 0 8px rgba(0,153,255,0.6)",
            textAlign: "center",
          }}
        >
          {t("clientePerfilTitulo")}
        </h2>

        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            padding: "18px",
            borderRadius: "14px",
            marginBottom: "18px",
            boxShadow: "0 0 12px rgba(0,153,255,0.15)",
          }}
        >
          <Linea clave={t("clienteDashboardNombre")} valor={cliente.nombre} />
          <Linea clave={t("clienteDashboardEmail")} valor={cliente.email} />
          <Linea clave={t("clienteDashboardTelefono")} valor={cliente.telefono} />
          <Linea clave={t("clienteContratoDireccion")} valor={cliente.direccion} />
        </div>

        <button
          onClick={() => logout()}
          style={{
            width: "100%",
            background: "#dc3545",
            color: "#fff",
            padding: "14px",
            border: "none",
            borderRadius: "10px",
            fontWeight: 700,
            fontSize: 16,
            cursor: "pointer",
            marginTop: "10px",
          }}
        >
          {t("logout")}
        </button>
      </div>
    </Menu>
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
