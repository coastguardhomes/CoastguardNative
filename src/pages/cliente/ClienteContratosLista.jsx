import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function ClienteContratosLista() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [contratos, setContratos] = useState([]);

  const cargarContratos = async () => {
    const { data: contratosData, error: contratosError } = await supabase
      .from("contratos")
      .select("*")
      .order("id", { ascending: false });

    if (contratosError) {
      console.error("Error cargando contratos:", contratosError);
      return;
    }

    const { data: clientesData, error: clientesError } = await supabase
      .from("clientes")
      .select("*");

    if (clientesError) {
      console.error("Error cargando clientes:", clientesError);
      return;
    }

    const contratosConCliente = contratosData.map((contrato) => {
      const cliente = clientesData.find((c) => c.id === contrato.cliente_id);
      return {
        ...contrato,
        clienteNombre: cliente?.nombre || t("clienteDesconocido"),
        clienteDireccion: cliente?.direccion || t("clienteSinDireccion"),
      };
    });

    setContratos(contratosConCliente);
  };

  useEffect(() => {
    cargarContratos();
  }, []);

  return (
    <Menu>
    <div
      style={{
        height: "100%",
        background: "#0a0f1a",
        padding: "20px",
        color: "#fff",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          color: "#4db8ff",
          marginBottom: "25px",
          fontSize: "28px",
          fontWeight: "700",
          textShadow: "0 0 8px rgba(0,153,255,0.6)",
        }}
      >
        {t("clienteListaTitulo")}
      </h2>

      {contratos.length === 0 && (
        <p
          style={{
            textAlign: "center",
            opacity: 0.8,
            fontSize: "16px",
          }}
        >
          {t("clienteListaVacio")}
        </p>
      )}

      {contratos.map((c) => (
        <div
          key={c.id}
          onClick={() => navigate(`/cliente/contrato/${c.id}`)}
          style={{
            background: "rgba(255,255,255,0.05)",
            padding: "18px",
            borderRadius: "14px",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 0 12px rgba(0,153,255,0.2)",
            marginBottom: "15px",
            cursor: "pointer",
            transition: "transform 0.15s",
          }}
        >
          <p style={{ marginBottom: 6 }}>
            <strong style={{ color: "#4db8ff" }}>{t("clienteListaCliente")}:</strong>{" "}
            {c.clienteNombre}
          </p>

          <p style={{ marginBottom: 6 }}>
            <strong style={{ color: "#4db8ff" }}>{t("clienteListaDireccion")}:</strong>{" "}
            {c.clienteDireccion}
          </p>

          {/* La tabla contratos no tiene ninguna columna `tipoServicio`: el
              servicio se describe con `frecuencia` (días entre visitas) y el
              importe está en `precio`. Antes ambas líneas salían vacías. */}
          <p style={{ marginBottom: 6 }}>
            <strong style={{ color: "#4db8ff" }}>{t("clienteListaServicio")}:</strong>{" "}
            {c.frecuencia ? `${t("contratoCadaDias")} ${c.frecuencia}` : "—"}
          </p>

          <p>
            <strong style={{ color: "#4db8ff" }}>{t("clienteListaPrecio")}:</strong>{" "}
            {c.precio != null ? `${c.precio} €` : "—"}
          </p>
        </div>
      ))}
    </div>
    </Menu>
  );
}
