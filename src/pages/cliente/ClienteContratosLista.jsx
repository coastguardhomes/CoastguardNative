import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

export default function ClienteContratosLista() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();   // ← NECESARIO
  const [contratos, setContratos] = useState([]);

  const cargarContratos = async () => {
    if (!user) return;

    // FILTRAR SOLO LOS CONTRATOS DEL CLIENTE LOGUEADO
    const { data: contratosData, error: contratosError } = await supabase
      .from("contratos")
      .select("*")
      .eq("cliente_id", user.id)   // ← ARREGLA TODO
      .order("id", { ascending: false });

    if (contratosError) {
      console.error("Error cargando contratos:", contratosError);
      return;
    }

    const { data: clienteData, error: clienteError } = await supabase
      .from("clientes")
      .select("*")
      .eq("id", user.id)           // ← SOLO SU PROPIO PERFIL
      .single();

    if (clienteError) {
      console.error("Error cargando cliente:", clienteError);
      return;
    }

    const contratosConCliente = contratosData.map((contrato) => ({
      ...contrato,
      clienteNombre: clienteData.nombre,
      clienteDireccion: clienteData.direccion,
    }));

    setContratos(contratosConCliente);
  };

  useEffect(() => {
    cargarContratos();
  }, [user]);

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
