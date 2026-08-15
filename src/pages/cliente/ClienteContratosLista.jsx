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
  const [cargando, setCargando] = useState(true);

  const cargarContratos = async () => {
    if (!user) return;
    setCargando(true);

    try {
      // 1. Obtenemos el perfil del cliente logueado
      const { data: clienteData, error: clienteError } = await supabase
        .from("clientes")
        .select("id, nombre, direccion")
        .eq("usuario_id", user.id);

      if (clienteError) throw clienteError;

      const cliente = clienteData && clienteData.length > 0 ? clienteData[0] : null;

      // 2. Cargamos los contratos filtrados por el cliente encontrado
      let query = supabase.from("contratos").select("*").order("id", { ascending: false });

      if (cliente) {
        query = query.eq("cliente_id", cliente.id);
      }

      const { data: contratosData, error: contratosError } = await query;

      if (contratosError) throw contratosError;

      // 3. Mapeamos los datos para mostrarlos en la vista
      const contratosConCliente = (contratosData || []).map((contrato) => ({
        ...contrato,
        clienteNombre: cliente ? cliente.nombre : "Cliente",
        clienteDireccion: cliente ? cliente.direccion : "Dirección no disponible",
      }));

      setContratos(contratosConCliente);
    } catch (err) {
      console.error("Error cargando contratos del cliente:", err);
      setContratos([]);
    } finally {
      setCargando(false);
    }
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
          paddingBottom: "80px",
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
          {t("clienteListaTitulo") || "Mis Contratos"}
        </h2>

        {cargando && (
          <p style={{ textAlign: "center", opacity: 0.8 }}>Cargando contratos...</p>
        )}

        {!cargando && contratos.length === 0 && (
          <p style={{ textAlign: "center", opacity: 0.8, fontSize: "16px" }}>
            {t("clienteListaVacio") || "No tienes contratos registrados."}
          </p>
        )}

        {!cargando &&
          contratos.map((c) => {
            const esFirmado = c.estado === "firmado" || Boolean(c.firma_url);

            return (
              <div
                key={c.id}
                onClick={() => navigate(`/cliente/contrato/${c.id}`)}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  padding: "18px",
                  borderRadius: "14px",
                  border: `1px solid ${esFirmado ? "rgba(76, 217, 100, 0.3)" : "rgba(255, 184, 77, 0.3)"}`,
                  boxShadow: "0 0 12px rgba(0,153,255,0.15)",
                  marginBottom: "15px",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <span style={{ fontSize: "16px", fontWeight: "bold", color: "#ffffff" }}>
                    Contrato #{c.id}
                  </span>
                  
                  {/* Badge de Estado del contrato */}
                  <span
                    style={{
                      background: esFirmado ? "rgba(76, 217, 100, 0.2)" : "rgba(255, 184, 77, 0.2)",
                      color: esFirmado ? "#4cd964" : "#ffb84d",
                      border: `1px solid ${esFirmado ? "#4cd964" : "#ffb84d"}`,
                      padding: "4px 10px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    {esFirmado ? "✅ Firmado" : "⏳ Pendiente"}
                  </span>
                </div>

                <p style={{ marginBottom: 6, fontSize: "14px" }}>
                  <strong style={{ color: "#4db8ff" }}>{t("clienteListaCliente") || "Cliente"}:</strong>{" "}
                  {c.clienteNombre}
                </p>

                <p style={{ marginBottom: 6, fontSize: "14px" }}>
                  <strong style={{ color: "#4db8ff" }}>{t("clienteListaDireccion") || "Dirección"}:</strong>{" "}
                  {c.clienteDireccion}
                </p>

                <p style={{ marginBottom: 6, fontSize: "14px" }}>
                  <strong style={{ color: "#4db8ff" }}>{t("clienteListaServicio") || "Servicio"}:</strong>{" "}
                  {c.frecuencia ? `${t("contratoCadaDias") || "Cada"} ${c.frecuencia} días` : "—"}
                </p>

                <p style={{ margin: 0, fontSize: "14px" }}>
                  <strong style={{ color: "#4db8ff" }}>{t("clienteListaPrecio") || "Precio"}:</strong>{" "}
                  {c.precio != null ? `${c.precio} €` : "—"}
                </p>
              </div>
            );
          })}
      </div>
    </Menu>
  );
}
