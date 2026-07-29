import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function ClienteDashboard() {
  const { t } = useLanguage();

  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarCliente() {
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      if (!session) {
        setLoading(false);
        return;
      }

      const { data: clienteData, error } = await supabase
        .from("clientes")
        .select("*")
        .eq("usuario_id", session.user.id)
        .single();

      if (!error) {
        setCliente(clienteData);
      }

      setLoading(false);
    }

    cargarCliente();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h3>{t("clienteDashboardCargando")}</h3>
      </div>
    );
  }

  if (!cliente) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h3>{t("clienteDashboardNoEncontrado")}</h3>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "#fff",
        padding: "20px",
        borderRadius: "8px",
        maxWidth: "600px",
        margin: "0 auto",
        marginTop: "20px",
        boxShadow: "0px 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ marginBottom: "10px" }}>{t("clienteDashboardTitulo")}</h2>

      <p><strong>{t("clienteDashboardNombre")}:</strong> {cliente.nombre}</p>
      <p><strong>{t("clienteDashboardEmail")}:</strong> {cliente.email}</p>
      <p><strong>{t("clienteDashboardTelefono")}:</strong> {cliente.telefono}</p>

      <div style={{ marginTop: "20px" }}>
        <button
          style={{
            background: "#007bff",
            color: "#fff",
            padding: "10px 15px",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          {t("clienteDashboardVerViviendas")}
        </button>
      </div>
    </div>
  );
}
