import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import Menu from "../../layouts/Menu.jsx";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import logoReal from "../../assets/logo.jpeg";

const COLOR_DORADO = "#e0b034";
const FONDO_PRINCIPAL = "%23030509"; // Mantenido tal cual
const FONDO_TARJETA = "linear-gradient(145deg, #0b1320 0%, #04070d 100%)";
const FONDO_BANNER_EXTRA = "linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(11, 19, 32, 0.9) 100%)";
const BORDE_DORADO_FINO = "1px solid rgba(224, 176, 52, 0.4)";
const BORDE_DORADO_INTENSO = "1px solid rgba(224, 176, 52, 0.8)";
const SOMBRA_LUXURY = "0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 20px rgba(224, 176, 52, 0.2)";
const TEXTO_DORADO_BRILLO = { color: COLOR_DORADO, textShadow: "0 0 15px rgba(224, 176, 52, 0.7)" };
const DEGRADADO_AZUL_BOTON = "linear-gradient(135deg, #38bdf8 0%, #1e3a8a 100%)";

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
            supabase.from("alertas").select("*", { count: "exact", head: true }).eq("cliente_id", clienteId),
            supabase.from("viviendas").select("*", { count: "exact", head: true }).eq("cliente_id", clienteId),
            // Filtramos opcionalmente para que no cargue los extras que ya marcó como vistos (asumiendo que usas un campo 'visto' o estado)
            supabase.from("extras").select("*").eq("cliente_id", clienteId).neq("visto", true).order("created_at", { ascending: false })
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

  // Función para manejar el clic en el aviso y hacerlo desaparecer
  const manejarVerFactura = async (extraId) => {
    try {
      // 1. Actualizamos en Supabase para que quede registrado como visto y no vuelva a aparecer al recargar
      await supabase
        .from("extras")
        .update({ visto: true })
        .eq("id", extraId);

      // 2. Quitamos el elemento del estado local para que desaparezca al momento de la pantalla
      setNuevosExtras((prev) => prev.filter((item) => item.id !== extraId));
    } catch (err) {
      console.error("Error al actualizar el extra:", err);
    }

    // 3. Navegamos a la sección de facturas
    navigate('/cliente/facturas');
  };

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
    transition: 'all 0.2s ease',
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
        <div style={{ background: "linear-gradient(135deg, #0e1726 0%, #05080f 100%)", border: BORDE_DORADO_INTENSO, borderRadius: "20px", padding: "14px 18px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: SOMBRA_LUXURY }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ padding: "4px", background: "rgba(224, 176, 52, 0.15)", borderRadius: "12px", border: BORDE_DORADO_FINO, boxShadow: "0 0 10px rgba(224, 176, 52, 0.3)" }}>
              <img src={logoReal} alt="Logo" style={{ height: "40px", width: "auto", objectFit: "contain" }} />
            </div>
            <div>
              <span style={{ fontSize: "10px", color: "#94a3b8", textTransform: "uppercase", fontWeight: "700", letterSpacing: "1px" }}>Panel de Control</span>
              <h1 style={{ fontSize: "15px", fontWeight: "900", margin: 0, textTransform: "uppercase", ...TEXTO_DORADO_BRILLO }}>DASHBOARD CLIENTE</h1>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(16, 185, 129, 0.15)", padding: "6px 10px", borderRadius: "20px", border: "1px solid rgba(16, 185, 129, 0.4)", boxShadow: "0 0 10px rgba(16, 185, 129, 0.2)" }}>
            <div style={{ width: "7px", height: "7px", background: "#10b981", borderRadius: "50%", boxShadow: "0 0 6px #10b981" }}></div>
            <span style={{ color: "#34d399", fontSize: "10px", fontWeight: "700" }}>Operativo</span>
          </div>
        </div>

        {/* AVISO DE EXTRAS */}
        {nuevosExtras.length > 0 && (
          <div style={{ marginBottom: "20px", background: FONDO_BANNER_EXTRA, border: BORDE_DORADO_INTENSO, borderRadius: "20px", padding: "18px", boxShadow: "0 10px 30px rgba(224, 176, 52, 0.25)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "rgba(224, 176, 52, 0.25)", display: "flex", alignItems: "center", justifyContent: "center", border: BORDE_DORADO_FINO }}>
                <span>📥</span>
              </div>
              <div>
                <h3 style={{ fontSize: "13px", fontWeight: "900", ...TEXTO_DORADO_BRILLO, margin: 0 }}>¡Trabajos Extras Disponibles!</h3>
                <p style={{ fontSize: "11px", color: "#cbd5e1", margin: 0 }}>Tienes {nuevosExtras.length} trabajos o informes extras registrados.</p>
              </div>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {nuevosExtras.map((extra) => (
                <div key={extra.id} onClick={() => manejarVerFactura(extra.id)} style={{ background: DEGRADADO_AZUL_BOTON, border: BORDE_DORADO_FINO, borderRadius: "12px", padding: "14px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 4px 15px rgba(56, 189, 248, 0.3)" }}>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "800", color: "#fff" }}>Trabajo Extra / Factura</div>
                    <div style={{ fontSize: "11px", color: "#e2e8f0", marginTop: "2px" }}>{extra.descripcion || extra.observaciones || "Ver detalles y fotos en facturas"}</div>
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: "900", color: COLOR_DORADO, textShadow: "0 0 8px rgba(224,176,52,0.8)" }}>Ver Factura →</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TARJETAS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "20px" }}>
          <div style={estiloTarjetaDato} onClick={() => navigate('/cliente/inspecciones')}>
            <span style={{ fontSize: "10px", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase" }}>Inspecciones</span>
            <span style={{ fontSize: "26px", fontWeight: "900", ...TEXTO_DORADO_BRILLO }}>{numInspecciones}</span>
          </div>
          <div style={estiloTarjetaDato} onClick={() => navigate('/cliente/alertas')}>
            <span style={{ fontSize: "10px", fontWeight: "800", color: numAlertas > 0 ? "#ef4444" : "#94a3b8", textTransform: "uppercase" }}>Alertas</span>
            <span style={{ fontSize: "26px", fontWeight: "900", color: numAlertas > 0 ? "#ef4444" : COLOR_DORADO, textShadow: numAlertas > 0 ? "0 0 10px rgba(239,68,68,0.6)" : "0 0 12px rgba(224,176,52,0.6)" }}>{numAlertas}</span>
          </div>
          <div style={estiloTarjetaDato} onClick={() => navigate('/cliente/contratos')}>
            <span style={{ fontSize: "10px", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase" }}>Viviendas</span>
            <span style={{ fontSize: "26px", fontWeight: "900", ...TEXTO_DORADO_BRILLO }}>{numViviendas}</span>
          </div>
        </div>

        {/* GRÁFICO */}
        <div style={{ background: FONDO_TARJETA, border: BORDE_DORADO_FINO, borderRadius: "20px", padding: "18px", marginBottom: "20px", boxShadow: SOMBRA_LUXURY }}>
          <h3 style={{ fontSize: "11px", color: COLOR_DORADO, margin: "0 0 14px 0", fontWeight: "800", textShadow: "0 0 8px rgba(224,176,52,0.4)" }}>📊 Inspecciones Diarias</h3>
          <div style={{ width: '100%', height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={datosGrafico} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(224, 176, 52, 0.15)" />
                <XAxis dataKey="dia" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#070b14', border: BORDE_DORADO_FINO, borderRadius: '12px', color: COLOR_DORADO, boxShadow: '0 0 15px rgba(224,176,52,0.3)' }} />
                <Line type="monotone" dataKey="inspecciones" stroke={COLOR_DORADO} strokeWidth={3.5} dot={{ fill: COLOR_DORADO, r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CONFIGURACIÓN */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Link to="/cliente/configuracion" style={{ width: "100%", maxWidth: "420px", background: DEGRADADO_AZUL_BOTON, border: BORDE_DORADO_INTENSO, borderRadius: "30px", padding: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", textDecoration: "none", boxShadow: "0 6px 20px rgba(56, 189, 248, 0.4), 0 0 15px rgba(224, 176, 52, 0.3)" }}>
            <span>⚙️</span>
            <span style={{ fontWeight: "900", color: "#ffffff", fontSize: "11px", textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>Configuración de Seguridad y Notificaciones</span>
          </Link>
        </div>

      </div>
    </Menu>
  );
}
