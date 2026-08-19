import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import Menu from "../../layouts/Menu.jsx";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import logoReal from "../../assets/logo.jpeg";

const COLOR_DORADO = "#e0b034";
const COLOR_BRILLO_DORADO = "rgba(224, 176, 52, 0.5)";
const FONDO_PRINCIPAL = "#030509";
const FONDO_TARJETA = "linear-gradient(145deg, #0b1320 0%, #04070d 100%)";
const FONDO_BANNER_EXTRA = "linear-gradient(135deg, rgba(224, 176, 52, 0.15) 0%, rgba(11, 19, 32, 0.9) 100%)";
const BORDE_DORADO_FINO = "1px solid rgba(224, 176, 52, 0.4)";
const BORDE_DORADO_INTENSO = "1px solid rgba(224, 176, 52, 0.7)";
const SOMBRA_LUXURY = "0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 20px rgba(224, 176, 52, 0.12)";
const TEXTO_DORADO_BRILLO = { color: COLOR_DORADO, textShadow: "0 0 12px rgba(224, 176, 52, 0.6)" };

const datosGrafico = [
  { dia: 'Lun', inspecciones: 4 },
  { dia: 'Mar', inspecciones: 3 },
  { dia: 'Mié', inspecciones: 5 },
  { dia: 'Jue', inspecciones: 7 },
  { dia: 'Vie', inspecciones: 9 },
  { dia: 'Sáb', inspecciones: 6 },
  { dia: 'Dom', inspecciones: 8 },
];

export default function ClienteDashboard() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [numInspecciones, setNumInspecciones] = useState(0);
  const [numAlertas, setNumAlertas] = useState(0);
  const [numViviendas, setNumViviendas] = useState(0);
  const [nuevosExtras, setNuevosExtras] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarDatos() {
      if (!user) return;

      try {
        let { data: clienteData } = await supabase
          .from("clientes")
          .select("*")
          .eq("usuario_id", user.id)
          .maybeSingle();

        if (!clienteData) {
          const { data: clienteById } = await supabase
            .from("clientes")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();
          clienteData = clienteById;
        }

        if (clienteData) {
          const clienteId = clienteData.id;

          const [resInspecciones, resAlertas, resViviendas, resExtras] = await Promise.all([
            supabase.from("inspecciones").select("*", { count: "exact", head: true }).eq("cliente_id", clienteId),
            supabase.from("alertas").select("*", { count: "exact", head: true }).eq("cliente_id", clienteId).eq("estado", "pendiente"),
            supabase.from("viviendas").select("*", { count: "exact", head: true }).eq("cliente_id", clienteId),
            // CARGAMOS TODOS LOS EXTRAS SIN FILTRAR POR ESTADO PARA QUE APAREZCAN SEGURO
            supabase.from("extras").select("*").eq("cliente_id", clienteId).order("created_at", { ascending: false })
          ]);

          setNumInspecciones(resInspecciones.count || 0);
          setNumAlertas(resAlertas.count || 0);
          setNumViviendas(resViviendas.count || 0);
          setNuevosExtras(resExtras.data || []);
        }
      } catch (err) {
        console.error("Error en dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    cargarDatos();
  }, [user]);

  const estiloTarjetaDato = {
    background: FONDO_TARJETA,
    border: BORDE_DORADO_FINO,
    borderRadius: "16px",
    padding: "16px 12px",
    boxShadow: SOMBRA_LUXURY,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '105px',
    cursor: 'pointer',
  };

  if (loading) {
    return (
      <Menu>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', color: COLOR_DORADO, background: FONDO_PRINCIPAL }}>
          <h3 style={TEXTO_DORADO_BRILLO}>Cargando Panel...</h3>
        </div>
      </Menu>
    );
  }

  return (
    <Menu>
      <div style={{ width: "100%", minHeight: "100vh", background: FONDO_PRINCIPAL, padding: "16px", fontFamily: "'Inter', sans-serif", color: "#fff", paddingBottom: "110px", boxSizing: "border-box" }}>
        
        {/* CABECERA */}
        <div style={{ background: "linear-gradient(135deg, #0e1726 0%, #05080f 100%)", border: BORDE_DORADO_INTENSO, borderRadius: "20px", padding: "14px 18px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ padding: "4px", background: "rgba(224, 176, 52, 0.1)", borderRadius: "12px", border: BORDE_DORADO_FINO }}>
              <img src={logoReal} alt="Logo" style={{ height: "40px", width: "auto", objectFit: "contain" }} />
            </div>
            <div>
              <span style={{ fontSize: "10px", color: "#94a3b8", textTransform: "uppercase", fontWeight: "700" }}>Panel de Control</span>
              <h1 style={{ fontSize: "15px", fontWeight: "900", margin: 0, textTransform: "uppercase", ...TEXTO_DORADO_BRILLO }}>DASHBOARD CLIENTE</h1>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(16, 185, 129, 0.1)", padding: "6px 10px", borderRadius: "20px", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
            <div style={{ width: "7px", height: "7px", background: "#10b981", borderRadius: "50%" }}></div>
            <span style={{ color: "#34d399", fontSize: "10px", fontWeight: "700" }}>Operativo</span>
          </div>
        </div>

        {/* AVISO DE EXTRAS */}
        {nuevosExtras.length > 0 && (
          <div style={{ marginBottom: "20px", background: FONDO_BANNER_EXTRA, border: BORDE_DORADO_INTENSO, borderRadius: "20px", padding: "18px", boxShadow: "0 10px 30px rgba(224, 176, 52, 0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "rgba(224, 176, 52, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", border: BORDE_DORADO_FINO }}>
                <span>📥</span>
              </div>
              <div>
                <h3 style={{ fontSize: "13px", fontWeight: "900", ...TEXTO_DORADO_BRILLO, margin: 0 }}>¡Trabajos Extras Disponibles!</h3>
                <p style={{ fontSize: "11px", color: "#94a3b8", margin: 0 }}>Tienes {nuevosExtras.length} trabajos o informes extras registrados.</p>
              </div>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {nuevosExtras.map((extra) => (
                <div key={extra.id} onClick={() => navigate(`/cliente/inspeccion/${extra.id}`)} style={{ background: "rgba(5, 8, 15, 0.75)", border: "1px solid rgba(224, 176, 52, 0.35)", borderRadius: "12px", padding: "14px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: "#fff" }}>Trabajo Extra</div>
                    <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>{extra.descripcion || extra.observaciones || "Ver detalles completos"}</div>
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: "800", color: COLOR_DORADO }}>Ver →</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TARJETAS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "20px" }}>
          <div style={estiloTarjetaDato} onClick={() => navigate('/cliente/inspecciones')}>
            <span style={{ fontSize: "10px", fontWeight: "800", color: "#94a3b8" }}>INSPECCIONES</span>
            <span style={{ fontSize: "26px", fontWeight: "900", ...TEXTO_DORADO_BRILLO }}>{numInspecciones}</span>
          </div>
          <div style={estiloTarjetaDato} onClick={() => navigate('/cliente/alertas')}>
            <span style={{ fontSize: "10px", fontWeight: "800", color: numAlertas > 0 ? "#ef4444" : "#94a3b8" }}>ALERTAS</span>
            <span style={{ fontSize: "26px", fontWeight: "900", color: numAlertas > 0 ? "#ef4444" : COLOR_DORADO }}>{numAlertas}</span>
          </div>
          <div style={estiloTarjetaDato} onClick={() => navigate('/cliente/contratos')}>
            <span style={{ fontSize: "10px", fontWeight: "800", color: "#94a3b8" }}>VIVIENDAS</span>
            <span style={{ fontSize: "26px", fontWeight: "900", ...TEXTO_DORADO_BRILLO }}>{numViviendas}</span>
          </div>
        </div>

        {/* GRÁFICO */}
        <div style={{ background: FONDO_TARJETA, border: BORDE_DORADO_FINO, borderRadius: "20px", padding: "18px", marginBottom: "20px" }}>
          <h3 style={{ fontSize: "11px", color: "#cbd5e1", margin: "0 0 14px 0", fontWeight: "800" }}>📊 Inspecciones Diarias</h3>
          <div style={{ width: '100%', height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={datosGrafico} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                <XAxis dataKey="dia" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#070b14', border: BORDE_DORADO_FINO, borderRadius: '12px', color: COLOR_DORADO }} />
                <Line type="monotone" dataKey="inspecciones" stroke={COLOR_DORADO} strokeWidth={3.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CONFIGURACIÓN */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Link to="/cliente/configuracion" style={{ width: "100%", maxWidth: "420px", background: "linear-gradient(135deg, rgba(224, 176, 52, 0.18) 0%, rgba(11, 19, 32, 0.9) 100%)", border: BORDE_DORADO_INTENSO, borderRadius: "30px", padding: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", textDecoration: "none" }}>
            <span>⚙️</span>
            <span style={{ fontWeight: "800", ...TEXTO_DORADO_BRILLO, fontSize: "11px" }}>Configuración de Seguridad y Notificaciones</span>
          </Link>
        </div>

      </div>
    </Menu>
  );
}
