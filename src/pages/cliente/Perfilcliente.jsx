import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";

const COLOR_DORADO = "#e0b034";
const FONDO_PRINCIPAL = "#030509";
const FONDO_TARJETA = "linear-gradient(145deg, #0b1320 0%, #04070d 100%)";
const BORDE_DORADO_FINO = "1px solid rgba(224, 176, 52, 0.4)";
const SOMBRA_LUXURY = "0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 20px rgba(224, 176, 52, 0.12)";
const TEXTO_DORADO_BRILLO = { color: COLOR_DORADO, textShadow: "0 0 12px rgba(224, 176, 52, 0.6)" };

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
            height: "100vh",
            background: FONDO_PRINCIPAL,
            color: COLOR_DORADO,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontFamily: "Inter, sans-serif",
            fontSize: "18px",
          }}
        >
          <h3 style={TEXTO_DORADO_BRILLO}>{t("clienteDashboardCargando")}</h3>
        </div>
      </Menu>
    );
  }

  if (!cliente) {
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
            fontSize: "18px",
            textAlign: "center",
            padding: "20px",
          }}
        >
          <h3 style={TEXTO_DORADO_BRILLO}>{t("clienteDashboardNoEncontrado")}</h3>
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
        }}
      >
        <h2
          style={{
            ...TEXTO_DORADO_BRILLO,
            marginBottom: "25px",
            fontSize: "24px",
            fontWeight: "900",
            textTransform: "uppercase",
            textAlign: "center",
          }}
        >
          {t("clientePerfilTitulo")}
        </h2>

        <div
          style={{
            background: FONDO_TARJETA,
            border: BORDE_DORADO_FINO,
            padding: "20px",
            borderRadius: "16px",
            marginBottom: "20px",
            boxShadow: SOMBRA_LUXURY,
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
            background: "linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%)",
            color: "#fff",
            padding: "14px",
            border: BORDE_DORADO_FINO,
            borderRadius: "16px",
            fontWeight: 900,
            fontSize: 15,
            cursor: "pointer",
            marginTop: "10px",
            boxShadow: "0 4px 15px rgba(127, 29, 29, 0.4)",
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
        padding: "10px 0",
        borderBottom: "1px solid rgba(224, 176, 52, 0.15)",
      }}
    >
      <span style={{ color: "#94a3b8", fontSize: 13, fontWeight: "600" }}>{clave}</span>
      <span style={{ fontWeight: 700, fontSize: 14, textAlign: "right", color: COLOR_DORADO }}>
        {valor}
      </span>
    </div>
  );
}
