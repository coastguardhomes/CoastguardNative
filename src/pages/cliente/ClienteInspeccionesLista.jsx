import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext.jsx";
import Menu from "../../layouts/Menu.jsx";

// --- CONSTANTES DE ESTILO PREMIUM ---
const COLOR_DORADO = "#e0b034";
const COLOR_BRILLO_DORADO = "rgba(224, 176, 52, 0.5)";
const FONDO_PRINCIPAL = "#030509";
const FONDO_TARJETA = "linear-gradient(145deg, #0b1320 0%, #04070d 100%)";
const BORDE_DORADO_FINO = "1px solid rgba(224, 176, 52, 0.4)";
const BORDE_DORADO_INTENSO = "1px solid rgba(224, 176, 52, 0.7)";
const SOMBRA_LUXURY = "0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 20px rgba(224, 176, 52, 0.12)";
const TEXTO_DORADO_BRILLO = { color: COLOR_DORADO, textShadow: "0 0 12px rgba(224, 176, 52, 0.6)" };

export default function ClienteInspeccionesLista() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [elementos, setElementos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    async function cargarInspeccionesYExtras() {
      if (!user) return;

      try {
        setLoading(true);
        setErrorMsg(null);

        let { data: clienteData } = await supabase
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

        const clienteId = clienteData.id;

        // 1. Cargar inspecciones normales y trabajos extras en paralelo
        const [resInspecciones, resExtras] = await Promise.all([
          supabase.from("inspecciones").select("*").eq("cliente_id", clienteId),
          supabase.from("extras").select("*").eq("cliente_id", clienteId)
        ]);

        const listaInspecciones = (resInspecciones.data || []).map(item => ({
          ...item,
          tipo: 'inspeccion',
          fechaOrden: new Date(item.created_at || item.fecha || 0)
        }));

        const listaExtras = (resExtras.data || []).map(item => ({
          ...item,
          tipo: 'extra',
          fechaOrden: new Date(item.created_at || 0)
        }));

        // Combinar y ordenar por fecha descendente (lo más nuevo primero)
        const combinados = [...listaInspecciones, ...listaExtras].sort((a, b) => b.fechaOrden - a.fechaOrden);

        setElementos(combinados);

      } catch (err) {
        console.error("Error cargando inspecciones y extras:", err);
        setErrorMsg("Hubo un error al cargar los datos.");
      } finally {
        setLoading(false);
      }
    }

    cargarInspeccionesYExtras();
  }, [user]);

  if (loading) {
    return (
      <Menu>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', color: COLOR_DORADO, background: FONDO_PRINCIPAL, fontFamily: "Inter" }}>
          <h3 style={TEXTO_DORADO_BRILLO}>Cargando Listado...</h3>
        </div>
      </Menu>
    );
  }

  return (
    <Menu>
      <div style={{ padding: "16px", background: FONDO_PRINCIPAL, minHeight: "100vh", color: "#fff", fontFamily: "Inter", paddingBottom: "110px", boxSizing: "border-box" }}>
        
        <h1 style={{ fontSize: "16px", fontWeight: "900", ...TEXTO_DORADO_BRILLO, marginBottom: "20px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          Mis Inspecciones e Informes
        </h1>

        {errorMsg && <div style={{ color: "#ef4444", marginBottom: "15px", fontSize: "12px" }}>{errorMsg}</div>}

        {elementos.length === 0 ? (
          <div style={{ color: "#94a3b8", fontSize: "13px", textAlign: "center", marginTop: "40px" }}>
            No hay inspecciones ni informes disponibles.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {elementos.map((item) => {
              const esExtra = item.tipo === 'extra';
              
              // Limpiar la descripción eliminando códigos de factura si los tuviera
              const descripcionLimpia = item.descripcion 
                ? item.descripcion.replace(/Factura\s*[^:]*:\s*/i, "") 
                : (item.detalle || "No especificada");

              const fechaFormateada = item.created_at 
                ? new Date(item.created_at).toLocaleDateString() 
                : (item.fecha || "Reciente");

              return (
                <div
                  key={item.id}
                  onClick={() => navigate(esExtra ? `/cliente/inspeccion/${item.id}` : `/cliente/inspecciones/${item.id}`)}
                  style={{
                    background: FONDO_TARJETA,
                    border: BORDE_DORADO_FINO,
                    borderRadius: "16px",
                    padding: "16px",
                    cursor: "pointer",
                    boxShadow: SOMBRA_LUXURY,
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    transition: "transform 0.2s ease"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "14px", fontWeight: "800", color: "#fff" }}>
                      {esExtra ? "Trabajo Extra" : (item.titulo || `Inspección`)}
                    </span>
                    <span style={{ 
                      fontSize: "10px", 
                      fontWeight: "800", 
                      padding: "4px 10px", 
                      borderRadius: "10px", 
                      background: esExtra ? "rgba(224, 176, 52, 0.2)" : "rgba(16, 185, 129, 0.15)",
                      color: esExtra ? COLOR_DORADO : "#34d399",
                      border: esExtra ? BORDE_DORADO_FINO : "1px solid rgba(16, 185, 129, 0.4)"
                    }}>
                      {esExtra ? "COMPLETADO" : (item.estado || "APROBADA")}
                    </span>
                  </div>

                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                    <strong style={{ color: "#cbd5e1" }}>Detalle:</strong> {descripcionLimpia.substring(0, 60)}...
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px", fontSize: "11px", color: "#64748b" }}>
                    <span>Fecha: {fechaFormateada}</span>
                    <span style={{ color: COLOR_DORADO, fontWeight: "700" }}>Ver detalle →</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Menu>
  );
}
