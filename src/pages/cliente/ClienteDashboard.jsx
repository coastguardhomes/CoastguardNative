import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import Menu from "../../layouts/Menu.jsx";

// Gráfico de inspecciones
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import logoReal from "../../assets/logo.jpeg";

// --- CONSTANTES DE ESTILO PREMIUM ---
const COLOR_DORADO = "#e0b034";
const COLOR_BRILLO_DORADO = "rgba(224, 176, 52, 0.5)";
const FONDO_PRINCIPAL = "#030509";
const FONDO_TARJETA = "linear-gradient(145deg, #0b1320 0%, #04070d 100%)";
const FONDO_BANNER_EXTRA = "linear-gradient(135deg, rgba(224, 176, 52, 0.15) 0%, rgba(11, 19, 32, 0.9) 100%)";
const BORDE_DORADO_FINO = "1px solid rgba(224, 176, 52, 0.4)";
const BORDE_DORADO_INTENSO = "1px solid rgba(224, 176, 52, 0.7)";
const SOMBRA_LUXURY = "0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 20px rgba(224, 176, 52, 0.12)";
const TEXTO_DORADO_BRILLO = { color: COLOR_DORADO, textShadow: "0 0 12px rgba(224, 176, 52, 0.6)" };

// Datos de ejemplo para el gráfico
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

  const [cliente, setCliente] = useState(null);
  const [numInspecciones, setNumInspecciones] = useState(0);
  const [numAlertas, setNumAlertas] = useState(0);
  const [numViviendas, setNumViviendas] = useState(0);
  const [nuevosExtras, setNuevosExtras] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarDatos() {
      if (!user) return;

      try {
        let { data: clienteData, error: clienteError } = await supabase
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
          setCliente(clienteData);
          const clienteId = clienteData.id;

          const [resInspecciones, resAlertas, resViviendas, resExtras] = await Promise.all([
            supabase
              .from("inspecciones")
              .select("*", { count: "exact", head: true })
              .eq("cliente_id", clienteId),
            supabase
              .from("alertas")
              .select("*", { count: "exact", head: true })
              .eq("cliente_id", clienteId)
              .eq("estado", "pendiente"),
            supabase
              .from("viviendas")
              .select("*", { count: "exact", head: true })
              .eq("cliente_id", clienteId),
            supabase
              .from("extras")
              .select("*")
              .eq("cliente_id", clienteId)
              .eq("estado", "enviado_cliente")
              .order("created_at", { ascending: false })
          ]);

          setNumInspecciones(resInspecciones.count || 0);
          setNumAlertas(resAlertas.count || 0);
          setNumViviendas(resViviendas.count || 0);
          setNuevosExtras(resExtras.data || []);

        } else if (clienteError) {
          console.error("Error cargando cliente:", clienteError);
        }
      } catch (err) {
        console.error("Error inesperado en dashboard cliente:", err);
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
    minWidth: 0,
    cursor: 'pointer',
    transition: 'transform 0.2s ease, border-color 0.2s ease',
  };

  if (loading) {
    return (
      <Menu>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', color: COLOR_DORADO, background: FONDO_PRINCIPAL, fontFamily: "Inter" }}>
          <h3 style={TEXTO_DORADO_BRILLO}>{t("clienteDashboardCargando") || "Cargando Panel..."}</h3>
        </div>
      </Menu>
    );
  }

  return (
    <Menu>
      <div
        style={{
          width: "100%",
          maxWidth: "100%",
          minHeight: "100vh",
          background: FONDO_PRINCIPAL,
          padding: "16px",
          fontFamily: "'Inter', sans-serif",
          color: "#fff",
          boxSizing: "border-box",
          paddingBottom: "110px",
          overflowX: "hidden"
        }}
      >
        
        {/* --- CABECERA PRINCIPAL MODERNA --- */}
        <div
          style={{
            background: "linear-gradient(135deg, #0e1726 0%, #05080f 100%)",
            border: BORDE_DORADO_INTENSO,
            borderRadius: "20px",
            padding: "14px 18px",
            marginBottom: "20px",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.7), 0 0 20px rgba(224, 176, 52, 0.2)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxSizing: "border-box"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ padding: "4px", background: "rgba(224, 176, 52, 0.1)", borderRadius: "12px", border: BORDE_DORADO_FINO }}>
              <img 
                src={logoReal} 
                alt="CoastGuard HOMES Logo" 
                style={{ 
                  height: "40px",
                  width: "auto",
                  objectFit: "contain",
                  filter: `drop-shadow(0 0 6px ${COLOR_BRILLO_DORADO})`
                }} 
              />
            </div>
            <div>
              <span style={{ fontSize: "10px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "700" }}>Panel de Control</span>
              <h1
                style={{
                  fontSize: "15px",
                  fontWeight: "900",
                  margin: 0,
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                  lineHeight: "1.2",
                  ...TEXTO_DORADO_BRILLO,
                }}
              >
                DASHBOARD CLIENTE
              </h1>
            </div>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(16, 185, 129, 0.1)", padding: "6px 10px", borderRadius: "20px", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
            <div style={{ width: "7px", height: "7px", background: "#10b981", borderRadius: "50%", boxShadow: "0 0 8px #10b981" }}></div>
            <span style={{ color: "#34d399", fontSize: "10px", fontWeight: "700", textTransform: "uppercase" }}>Operativo</span>
          </div>
        </div>

        {/* --- AVISO DE INFORMES EXTRAS (DISEÑO LUXURY) --- */}
        {nuevosExtras.length > 0 && (
          <div style={{ 
            marginBottom: "20px", 
            background: FONDO_BANNER_EXTRA, 
            border: BORDE_DORADO_INTENSO, 
            borderRadius: "20px", 
            padding: "18px", 
            boxShadow: "0 10px 30px rgba(224, 176, 52, 0.2)",
            position: "relative",
            overflow: "hidden"
          }}>
            {/* Brillo decorativo superior */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "linear-gradient(90deg, transparent, #e0b034, transparent)" }}></div>
            
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "rgba(224, 176, 52, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", border: BORDE_DORADO_FINO }}>
                <span style={{ fontSize: "16px" }}>📥</span>
              </div>
              <div>
                <h3 style={{ fontSize: "13px", fontWeight: "900", ...TEXTO_DORADO_BRILLO, margin: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  ¡Nuevos informes disponibles!
                </h3>
                <p style={{ fontSize: "11px", color: "#94a3b8", margin: 0 }}>Tienes {nuevosExtras.length} {nuevosExtras.length === 1 ? "informe extra enviado" : "informes extras enviados"} por la administración.</p>
              </div>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {nuevosExtras.map((extra) => (
                <div 
                  key={extra.id} 
                  onClick={() => navigate(`/cliente/inspeccion/${extra.id}`)}
                  style={{ 
                    background: "rgba(5, 8, 15, 0.75)", 
                    border: "1px solid rgba(224, 176, 52, 0.35)", 
                    borderRadius: "12px", 
                    padding: "14px", 
                    cursor: "pointer", 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center",
                    transition: "all 0.2s ease"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "8px", height: "8px", background: COLOR_DORADO, borderRadius: "50%", boxShadow: `0 0 8px ${COLOR_DORADO}` }}></div>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: "700", color: "#fff" }}>
                        {extra.direccion || "Trabajo Extra / Informe de Mantenimiento"}
                      </div>
                      <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
                        {extra.descripcion ? extra.descripcion.substring(0, 45) + "..." : "Pulsa para ver detalles completos y multimedia"}
                      </div>
                    </div>
                  </div>
                  <div style={{ background: "rgba(224, 176, 52, 0.15)", padding: "6px 12px", borderRadius: "8px", border: BORDE_DORADO_FINO }}>
                    <span style={{ fontSize: "11px", fontWeight: "800", color: COLOR_DORADO, whiteSpace: "nowrap" }}>
                      Ver →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TARJETAS DE DATOS (ESTILO MODERNO GRID) --- */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "10px",
            marginBottom: "20px",
            width: "100%",
            boxSizing: "border-box"
          }}
        >
          {/* Tarjeta 1: Inspecciones */}
          <div style={estiloTarjetaDato} onClick={() => navigate('/cliente/inspecciones')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: "10px", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", lineHeight: "1.2" }}>
                  Inspecciones
                </span>
                <div style={{ background: "rgba(224, 176, 52, 0.1)", padding: "5px", borderRadius: "8px", border: BORDE_DORADO_FINO }}>
                  <span style={{ fontSize: "12px" }}>📋</span>
                </div>
            </div>
            <div style={{ marginTop: '10px', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: "26px", fontWeight: "900", ...TEXTO_DORADO_BRILLO }}>{numInspecciones}</span>
              <span style={{ fontSize: "10px", color: "#64748b", fontWeight: "600" }}>Activas</span>
            </div>
          </div>

          {/* Tarjeta 2: Alertas */}
          <div style={estiloTarjetaDato} onClick={() => navigate('/cliente/alertas')}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: "10px", fontWeight: "800", color: numAlertas > 0 ? "#ef4444" : "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", lineHeight: "1.2" }}>
                  Alertas
                </span>
                <div style={{ background: numAlertas > 0 ? "rgba(239, 68, 68, 0.15)" : "rgba(224, 176, 52, 0.1)", padding: "5px", borderRadius: "8px", border: numAlertas > 0 ? "1px solid rgba(239, 68, 68, 0.4)" : BORDE_DORADO_FINO }}>
                  <span style={{ fontSize: "12px" }}>⚠️</span>
                </div>
             </div>
            <div style={{ marginTop: '10px', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: "26px", fontWeight: "900", color: numAlertas > 0 ? "#ef4444" : COLOR_DORADO, textShadow: numAlertas > 0 ? "0 0 10px rgba(239, 68, 68, 0.4)" : "0 0 12px rgba(224, 176, 52, 0.6)" }}>{numAlertas}</span>
              <span style={{ fontSize: "10px", color: "#64748b", fontWeight: "600" }}>Activas</span>
            </div>
          </div>

          {/* Tarjeta 3: Viviendas */}
          <div style={estiloTarjetaDato} onClick={() => navigate('/cliente/contratos')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: "10px", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", lineHeight: "1.2" }}>
                   Viviendas
                </span>
                <div style={{ background: "rgba(224, 176, 52, 0.1)", padding: "5px", borderRadius: "8px", border: BORDE_DORADO_FINO }}>
                  <span style={{ fontSize: "12px" }}>🏠</span>
                </div>
            </div>
            <div style={{ marginTop: '10px', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: "26px", fontWeight: "900", ...TEXTO_DORADO_BRILLO }}>{numViviendas}</span>
                <span style={{ fontSize: "10px", color: "#64748b", fontWeight: "600" }}>Total</span>
            </div>
          </div>
        </div>

        {/* --- GRÁFICO DE INSPECCIONES (DISEÑO PULIDO) --- */}
        <div
          style={{
            background: FONDO_TARJETA,
            border: BORDE_DORADO_FINO,
            borderRadius: "20px",
            padding: "18px",
            boxShadow: SOMBRA_LUXURY,
            marginBottom: "20px",
            boxSizing: "border-box"
          }}
        >
           <div style={{ display: "flex", alignItems: "center", justifyContent: "between", marginBottom: "14px" }}>
             <h3 style={{ fontSize: "11px", color: "#cbd5e1", margin: 0, fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px" }}>
                📊 Inspecciones Diarias (Última semana)
             </h3>
           </div>
          
           <div style={{ width: '100%', height: 180 }}>
             <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={datosGrafico} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                    <XAxis dataKey="dia" stroke="#64748b" tick={{ fontSize: 10, fontWeight: "600" }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 10, fontWeight: "600" }} domain={[0, 'dataMax + 2']} />
                    <Tooltip 
                       contentStyle={{ background: '#070b14', border: BORDE_DORADO_FINO, borderRadius: '12px', color: COLOR_DORADO, fontSize: '11px', boxShadow: '0 10px 25px rgba(0,0,0,0.8)' }}
                       cursor={{ stroke: COLOR_DORADO, strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Line 
                       type="monotone" 
                       dataKey="inspecciones" 
                       stroke={COLOR_DORADO} 
                       strokeWidth={3.5} 
                       dot={{ r: 4, fill: COLOR_DORADO, stroke: '#fff', strokeWidth: 2 }} 
                       activeDot={{ r: 7, fill: '#fff', stroke: COLOR_DORADO, strokeWidth: 2.5 }}
                    />
                  </LineChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* --- ENLACE A CONFIGURACIÓN Y SEGURIDAD (BOTÓN PREMIUM) --- */}
        <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
          <Link
            to="/cliente/configuracion"
            style={{
              width: "100%",
              maxWidth: "420px",
              background: "linear-gradient(135deg, rgba(224, 176, 52, 0.18) 0%, rgba(11, 19, 32, 0.9) 100%)",
              border: BORDE_DORADO_INTENSO,
              borderRadius: "30px",
              padding: "14px 18px",
              boxShadow: "0 8px 25px rgba(224, 176, 52, 0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              textDecoration: "none",
              boxSizing: "border-box",
              transition: "transform 0.2s ease"
            }}
          >
            <div style={{ background: "rgba(224, 176, 52, 0.2)", borderRadius: "50%", width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", border: BORDE_DORADO_FINO }}>
              <span style={{ fontSize: '12px' }}>⚙️</span>
            </div>
            <span style={{ fontWeight: "800", ...TEXTO_DORADO_BRILLO, fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", textAlign: "center" }}>
              Configuración de Seguridad y Notificaciones
            </span>
          </Link>
        </div>

      </div>
    </Menu>
  );
}
