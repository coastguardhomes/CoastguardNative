import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

export default function ClienteContratosLista() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [contratos, setContratos] = useState([]);

  const cargarContratos = async () => {
    if (!user) return;

    // 1. Cargamos todos los contratos (RLS debería filtrar solo los del cliente)
    const { data: contratosData, error: contratosError } = await supabase
      .from("contratos")
      .select("*")
      .order("id", { ascending: false });

    if (contratosError) {
      console.error("Error cargando contratos:", contratosError);
      setContratos([]);
      return;
    }

    // 2. Cargamos el perfil de cliente sin usar .single() para evitar bloqueos
    const { data: clienteData } = await supabase
      .from("clientes")
      .select("*")
      .eq("usuario_id", user.id);

    // Si encontramos al cliente, tomamos sus datos, si no, dejamos valores por defecto
    const cliente = clienteData && clienteData.length > 0 ? clienteData[0] : null;

    // 3. Mapeamos los datos
    const contratosConCliente = (contratosData || []).map((contrato) => ({
      ...contrato,
      clienteNombre: cliente ? cliente.nombre : "Cliente",
      clienteDireccion: cliente ? cliente.direccion : "Dirección no disponible",
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
          minHeight: "100vh",
          background: "#0a0f1a",
          padding: "20px",
          color: "#fff",
          fontFamily: "Inter, sans-serif",
          paddingBottom: "80px"
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
