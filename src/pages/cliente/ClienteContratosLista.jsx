import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const COLOR_DORADO = "#e0b034";
const FONDO_PRINCIPAL = "#030509";
const FONDO_TARJETA = "linear-gradient(145deg, #0b1320 0%, #04070d 100%)";
const BORDE_DORADO_FINO = "1px solid rgba(224, 176, 52, 0.4)";
const SOMBRA_LUXURY = "0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 20px rgba(224, 176, 52, 0.12)";
const TEXTO_DORADO_BRILLO = { color: COLOR_DORADO, textShadow: "0 0 12px rgba(224, 176, 52, 0.6)" };

export default function ClienteContratosLista() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let mounted = true;

    async function cargarContratos() {
      setLoading(true);
      setErrorMsg("");

      try {
        if (!user) {
          setErrorMsg("Usuario no autenticado.");
          setContratos([]);
          setLoading(false);
          return;
        }

        // Obtener cliente asociado al usuario (si existe)
        const { data: clienteData, error: clienteError } = await supabase
          .from("clientes")
          .select("id")
          .eq("usuario_id", user.id)
          .maybeSingle();

        if (clienteError) {
          console.error("Error cargando cliente:", clienteError);
          setErrorMsg("No se pudo identificar el cliente asociado.");
          setContratos([]);
          setLoading(false);
          return;
        }

        const clienteId = clienteData?.id || user.id;

        const { data: contratosData, error: contratosError } = await supabase
          .from("contratos")
          .select("*")
          .eq("cliente_id", clienteId)
          .order("id", { ascending: false });

        if (contratosError) {
          console.error("Error cargando contratos:", contratosError);
          setErrorMsg("Error cargando contratos.");
          setContratos([]);
          setLoading(false);
          return;
        }

        if (mounted) {
          setContratos(contratosData || []);
        }
      } catch (e) {
        console.error("Excepción al cargar contratos:", e);
        if (mounted) {
          setErrorMsg("Error inesperado cargando contratos.");
          setContratos([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    cargarContratos();

    return () => {
      mounted = false;
    };
  }, [user]);

  const abrirContrato = (id) => {
    navigate(`/cliente/contrato/${id}`);
  };

  return (
    <Menu>
      <div
        style={{
          minHeight: "100vh",
          background: FONDO_PRINCIPAL,
          padding: "20px",
          color: "#fff",
          fontFamily: "Inter, sans-serif",
          paddingBottom: "80px",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            ...TEXTO_DORADO_BRILLO,
            marginBottom: "25px",
            fontSize: "28px",
            fontWeight: "900",
          }}
        >
          {t("clienteListaTitulo") || "Mis Contratos"}
        </h2>

        {loading ? (
          <p style={{ textAlign: "center", color: "#94a3b8" }}>Cargando contratos...</p>
        ) : errorMsg ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <p style={{ color: "#ff6b6b", marginBottom: 8 }}>{errorMsg}</p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "10px 16px",
                borderRadius: 8,
                background: "rgba(255,255,255,0.06)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.08)",
                cursor: "pointer",
              }}
            >
              Reintentar
            </button>
          </div>
        ) : contratos.length === 0 ? (
          <p style={{ textAlign: "center", color: "#94a3b8" }}>
            {t("clienteListaVacio") || "No tienes contratos registrados."}
          </p>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {contratos.map((c) => (
              <div
                key={c.id}
                onClick={() => abrirContrato(c.id)}
                style={{
                  background: FONDO_TARJETA,
                  padding: "16px",
                  borderRadius: 12,
                  border: BORDE_DORADO_FINO,
                  boxShadow: SOMBRA_LUXURY,
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 6 }}>
                    {c.modalidad ? `${c.modalidad}` : `Contrato #${c.id}`}
                  </div>
                  <div style={{ color: "#9fb3c8", fontSize: 14 }}>
                    {c.descripcion || c.notas || "Servicio contratado"}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 900, color: "#fff", marginBottom: 6 }}>
                    {c.precio != null ? `${c.precio} €` : "—"}
                  </div>
                  <div style={{ color: c.estado === "firmado" ? "#34d399" : "#94a3b8", fontSize: 13 }}>
                    {c.estado ? c.estado.replace("_", " ") : "Pendiente"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Menu>
  );
}
