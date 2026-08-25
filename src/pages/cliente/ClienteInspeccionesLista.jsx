import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext.jsx";
import Menu from "../../layouts/Menu.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";

const COLOR_DORADO = "#e0b034";
const FONDO_PRINCIPAL = "#030509";
const FONDO_TARJETA = "linear-gradient(145deg, #0b1320 0%, #04070d 100%)";
const BORDE_DORADO_FINO = "1px solid rgba(224, 176, 52, 0.4)";
const SOMBRA_LUXURY = "0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 20px rgba(224, 176, 52, 0.12)";
const TEXTO_DORADO_BRILLO = { color: COLOR_DORADO, textShadow: "0 0 12px rgba(224, 176, 52, 0.6)" };

export default function ClienteInspeccionesLista() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [elementos, setElementos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    async function cargarTodo() {
      if (!user) return;

      try {
        setLoading(true);
        setErrorMsg(null);

        // 1. Obtener ID del cliente
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
          setErrorMsg(t("errorPerfilClienteAsociado"));
          setLoading(false);
          return;
        }

        const clienteId = clienteData.id;

        // 2. Cargar inspecciones y extras
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

        const combinados = [...listaInspecciones, ...listaExtras].sort((a, b) => b.fechaOrden - a.fechaOrden);
        setElementos(combinados);

      } catch (err) {
        console.error("Error:", err);
        setErrorMsg(t("errorCargarDatos"));
      } finally {
        setLoading(false);
      }
    }

    cargarTodo();
  }, [user, t]);

  if (loading) {
    return (
      <Menu>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', color: COLOR_DORADO, background: FONDO_PRINCIPAL }}>
          <h3 style={TEXTO_DORADO_BRILLO}>{t("cargandoListado")}</h3>
        </div>
      </Menu>
    );
  }

  return (
    <Menu>
      <div style={{ padding: "16px", background: FONDO_PRINCIPAL, minHeight: "100vh", color: "#fff", fontFamily: "Inter", paddingBottom: "110px", boxSizing: "border-box" }}>
        
        <h1 style={{ fontSize: "16px", fontWeight: "900", ...TEXTO_DORADO_BRILLO, marginBottom: "20px", textTransform: "uppercase" }}>
          {t("misInspeccionesInformesTitulo")}
        </h1>

        {errorMsg && <div style={{ color: "#ef4444", marginBottom: "15px", fontSize: "12px" }}>{errorMsg}</div>}

        {elementos.length === 0 ? (
          <div style={{ color: "#94a3b8", fontSize: "13px", textAlign: "center", marginTop: "40px" }}>
            {t("noHayInspeccionesInformes")}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {elementos.map((item) => {
              const esExtra = item.tipo === 'extra';
              
              const textoCrudo = item.observaciones || item.comentarios || item.descripcion || item.detalle || item.nota || "";
              const descripcionLimpia = textoCrudo ? textoCrudo.replace(/Factura\s*[^:]*:\s*/i, "") : t("informeDisponible");

              const tituloItem = esExtra ? t("servicioExtraTrabajo") : (item.titulo || item.nombre || t("inspeccionLabel"));
              const fechaFormateada = item.created_at ? new Date(item.created_at).toLocaleDateString() : (item.fecha ? new Date(item.fecha).toLocaleDateString() : "Reciente");

              return (
                <div
                  key={item.id}
                  onClick={() => navigate(`/cliente/inspeccion/${item.id}`)}
                  style={{
                    background: FONDO_TARJETA,
                    border: BORDE_DORADO_FINO,
                    borderRadius: "16px",
                    padding: "16px",
                    cursor: "pointer",
                    boxShadow: SOMBRA_LUXURY,
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "14px", fontWeight: "800", color: "#fff" }}>{tituloItem}</span>
                    
                    {/* Etiqueta visual clara */}
                    <span style={{ 
                      fontSize: "10px", 
                      fontWeight: "800", 
                      padding: "4px 10px", 
                      borderRadius: "10px", 
                      background: esExtra ? "rgba(224, 176, 52, 0.2)" : "rgba(16, 185, 129, 0.15)", 
                      color: esExtra ? COLOR_DORADO : "#34d399", 
                      border: esExtra ? BORDE_DORADO_FINO : "1px solid rgba(16, 185, 129, 0.4)" 
                    }}>
                      {esExtra ? t("extraBadge") : (item.estado || t("estadoAprobado"))}
                    </span>
                  </div>

                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                    <strong style={{ color: "#cbd5e1" }}>{t("detalleLabel")}</strong> {descripcionLimpia.substring(0, 70)}...
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px", fontSize: "11px", color: "#64748b" }}>
                    <span>{t("fecha")}: {fechaFormateada}</span>
                    <span style={{ color: COLOR_DORADO, fontWeight: "700" }}>{t("verDetalleFlecha")}</span>
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
