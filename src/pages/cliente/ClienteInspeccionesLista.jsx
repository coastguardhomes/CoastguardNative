import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import Menu from "../../layouts/Menu";

const COLOR_DORADO = "#e0b034";
const COLOR_BRILLO_DORADO = "rgba(224, 176, 52, 0.5)";
const FONDO_TARJETA = "linear-gradient(145deg, #0d1626 0%, #05080f 100%)";
const FONDO_PRINCIPAL = "#030509";
const BORDE_DORADO = `1px solid ${COLOR_DORADO}`;
const TEXTO_DORADO_BRILLO = { color: COLOR_DORADO, textShadow: `0 0 8px ${COLOR_BRILLO_DORADO}` };

export default function ClienteInspeccionesLista() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [inspecciones, setInspecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    async function cargarInspecciones() {
      if (!user) return;

      try {
        setLoading(true);
        setErrorMsg(null);

        // 1. Obtener ID del cliente (por usuario_id o directo por id)
        let { data: clienteData, error: errCliente } = await supabase
          .from("clientes")
          .select("id")
          .eq("usuario_id", user.id)
          .maybeSingle();

        if (!clienteData) {
          const { data: clienteById } = await supabase
            .from("clientes")
            .select("id")
            .eq("id", user.id)
            .maybeSingle();
          clienteData = clienteById;
        }

        if (!clienteData) {
          setErrorMsg("No se encontró el perfil de cliente asociado.");
          setLoading(false);
          return;
        }

        // 2. Cargar inspecciones asociadas al cliente_id
        const { data: dataInspecciones, error: errInspecciones } = await supabase
          .from("inspecciones")
          .select(`
            *,
            viviendas ( direccion, alias )
          `)
          .eq("cliente_id", clienteData.id)
          .order("created_at", { ascending: false });

        if (errInspecciones) {
          console.error("Error Supabase Inspecciones:", errInspecciones);
          // Si falla con la relación de viviendas, intentamos consulta simple sin relación
          const { data: dataSimple, error: errSimple } = await supabase
            .from("inspecciones")
            .select("*")
            .eq("cliente_id", clienteData.id);

          if (errSimple) throw errSimple;
          setInspecciones(dataSimple || []);
        } else {
          setInspecciones(dataInspecciones || []);
        }

      } catch (err) {
        console.error("Error al obtener inspecciones:", err);
        setErrorMsg("Error al consultar las inspecciones en la base de datos.");
      } finally {
        setLoading(false);
      }
    }

    cargarInspecciones();
  }, [user]);

  return (
    <Menu>
      <div
        style={{
          width: "100%",
          minHeight: "100vh",
          background: FONDO_PRINCIPAL,
          padding: "15px",
          fontFamily: "'Inter', sans-serif",
          color: "#fff",
          boxSizing: "border-box",
          paddingBottom: "110px"
        }}
      >
        {/* Cabecera */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: "800", ...TEXTO_DORADO_BRILLO, margin: 0 }}>
            MIS INSPECCIONES
          </h1>
        </div>

        {/* Carga */}
        {loading && (
          <div style={{ textAlign: "center", padding: "40px 0", color: COLOR_DORADO }}>
            <p>Cargando lista de inspecciones...</p>
          </div>
        )}

        {/* Error */}
        {!loading && errorMsg && (
          <div style={{ textAlign: "center", padding: "30px 15px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid #ef4444", borderRadius: "12px", margin: "10px 0" }}>
            <p style={{ color: "#ef4444", fontWeight: "700", margin: 0 }}>{errorMsg}</p>
          </div>
        )}

        {/* Lista vacía */}
        {!loading && !errorMsg && inspecciones.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <p style={{ color: "#94a3b8", fontSize: "14px" }}>No tienes inspecciones registradas actualmente.</p>
          </div>
        )}

        {/* Tarjetas de Inspección */}
        {!loading && !errorMsg && inspecciones.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {inspecciones.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/cliente/inspeccion/${item.id}`)}
                style={{
                  background: FONDO_TARJETA,
                  border: BORDE_DORADO,
                  borderRadius: "12px",
                  padding: "14px",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.5)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "13px", fontWeight: "700", color: "#e2e8f0" }}>
                    {item.viviendas?.alias || item.viviendas?.direccion || `Inspección #${item.id.substring(0, 6)}`}
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: "800",
                      padding: "3px 8px",
                      borderRadius: "12px",
                      textTransform: "uppercase",
                      background: item.estado === "completada" || item.estado === "finalizada" ? "rgba(16, 185, 129, 0.2)" : "rgba(224, 176, 52, 0.2)",
                      color: item.estado === "completada" || item.estado === "finalizada" ? "#10b981" : COLOR_DORADO,
                      border: `1px solid ${item.estado === "completada" || item.estado === "finalizada" ? "#10b981" : COLOR_DORADO}`
                    }}
                  >
                    {item.estado || "Pendiente"}
                  </span>
                </div>

                <div style={{ fontSize: "11px", color: "#94a3b8", display: "flex", justifyContent: "space-between" }}>
                  <span>Fecha: {item.created_at ? new Date(item.created_at).toLocaleDateString("es-ES") : "N/A"}</span>
                  <span style={{ color: COLOR_DORADO }}>Ver detalle →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Menu>
  );
}
