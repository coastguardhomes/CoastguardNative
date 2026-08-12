import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import Menu from "../../layouts/Menu.jsx";
// Importación de la librería para gráficos
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- IMPORTACIÓN DE TU LOGO REAL ---
import logoReal from "../../assets/logo.jpeg";

// --- CONSTANTES DE ESTILO (Paleta Táctica CoastGuard) ---
const COLOR_DORADO = "#e0b034";
const COLOR_BRILLO_DORADO = "rgba(224, 176, 52, 0.5)";
const FONDO_TARJETA_LINEAL = "linear-gradient(145deg, #0d1626 0%, #05080f 100%)";
const FONDO_PRINCIPAL = "#030509";
const BORDE_DORADO_FINO = `1px solid ${COLOR_DORADO}`;
const SOMBRA_TARJETA_PROFUNDA = "0 8px 20px rgba(0,0,0,0.6)";
const TEXTO_DORADO_BRILLO = { color: COLOR_DORADO, textShadow: `0 0 6px ${COLOR_BRILLO_DORADO}` };

// --- Datos de ejemplo para el gráfico (Simulando los datos de la semana) ---
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
  const [numContratos, setNumContratos] = useState(0);
  const [numAlertas, setNumAlertas] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarDatos() {
      if (!user) return;

      // Cargar datos del cliente
      const { data: clienteData, error: clienteError } = await supabase
        .from("clientes")
        .select("*")
        .eq("usuario_id", user.id)
        .single();

      if (clienteData) {
        setCliente(clienteData);
        const clienteId = clienteData.id;

        // Cargar Contratos y Alertas (Simulando el tablero técnico)
        const [
          { count: countContratos },
          { count: countAlertas }
        ] = await Promise.all([
          supabase.from("contratos").select("*", { count: "exact", head: true }).eq("cliente_id", clienteId),
          // Suponiendo que tienes una tabla 'alertas' o 'incidencias'
          supabase.from("alertas").select("*", { count: "exact", head: true }).eq("cliente_id", clienteId).eq("estado", "activa")
        ]);

        setNumContratos(countContratos || 0);
        setNumAlertas(countAlertas || 0);
      } else {
          console.error("Error cargando cliente:", clienteError);
      }
      setLoading(false);
    }

    cargarDatos();
  }, [user]);

  // Estilo para las tarjetas de datos superiores
  const estiloTarjetaDato = {
    background: FONDO_TARJETA_LINEAL,
    border: BORDE_DORADO_FINO,
    borderRadius: "12px",
    padding: "14px 16px",
    boxShadow: SOMBRA_TARJETA_PROFUNDA,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '90px'
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
          minHeight: "100vh",
          background: FONDO_PRINCIPAL,
          padding: "20px",
          fontFamily: "'Inter', sans-serif",
          color: "#fff",
          boxSizing: "border-box",
          paddingBottom: "80px", // Espacio para el menú móvil
        }}
      >
        
        {/* --- CABECERA PRINCIPAL (TU LOGO Y TÍTULO) --- */}
        <div
          style={{
            background: "linear-gradient(180deg, #0d1626 0%, #05080f 100%)",
            border: BORDE_DORADO_FINO,
            borderRadius: "16px",
            padding: "12px 20px",
            marginBottom: "25px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.8)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: `2px solid ${COLOR_DORADO}`, // Borde inferior más grueso para destacar
          }}
        >
          {/* LOGO REAL A LA IZQUIERDA, CENTRADO VERTICALMENTE */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img 
              src={logoReal} 
              alt="CoastGuard HOMES Logo" 
              style={{ 
                height: "50px", // Ajusta el tamaño del logo aquí
                width: "auto",
                filter: `drop-shadow(0 0 8px ${COLOR_BRILLO_DORADO})` // Efecto de brillo en el logo
              }} 
            />
            <h1
              style={{
                fontSize: "18px",
                fontWeight: "800",
                margin: 0,
                letterSpacing: "1px",
                textTransform: "uppercase",
                ...TEXTO_DORADO_BRILLO, // Aplicando el estilo dorado brillante
              }}
            >
              DASHBOARD TÉCNICO
            </h1>
          </div>
          
          {/* Indicador de estado o usuario (Opcional, para rellenar el espacio) */}
          <div style={{ textAlign: "right" }}>
            <div style={{ width: "10px", height: "10px", background: "#10b981", borderRadius: "50%", display: "inline-block", marginRight: "8px", boxShadow: "0 0 10px #10b981" }}></div>
            <span style={{ color: "#94a3b8", fontSize: "12px" }}>Operativo</span>
          </div>
        </div>


        {/* --- PRIMERA FILA: TARJETAS DE DATOS RESUMEN --- */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "15px",
            marginBottom: "25px",
          }}
        >
          {/* Tarjeta 1: Inspecciones */}
          <div style={estiloTarjetaDato} onClick={() => navigate('/cliente/inspecciones')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: "11px", fontWeight: "600", color: "#cbd5e1", textTransform: "uppercase", letterSpacing: '0.5px' }}>
                  Inspecciones Esta Semana
                </span>
                {/* Icono de Portapapeles Dorado */}
                <span style={{ fontSize: "16px", color: COLOR_DORADO }}>📋</span>
            </div>
            <div style={{ marginTop: '8px' }}>
              <span style={{ fontSize: "32px", fontWeight: "900", ...TEXTO_DORADO_BRILLO }}>{numContratos}</span> {/* Usando numContratos de ejemplo, cámbialo por inspecciones reales si las tienes */}
              <span style={{ fontSize: "11px", color: "#94a3b8", marginLeft: '6px' }}>Activas</span>
            </div>
          </div>

          {/* Tarjeta 2: Alertas (Destacada en rojo si hay más de 0) */}
          <div style={estiloTarjetaDato} onClick={() => navigate('/cliente/alertas')}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: "11px", fontWeight: "600", color: numAlertas > 0 ? "#ef4444" : "#cbd5e1", textTransform: "uppercase", letterSpacing: '0.5px' }}>
                  Alertas Detectadas
                </span>
                 {/* Icono de Alerta Rojo/Dorado */}
                <span style={{ fontSize: "16px", color: numAlertas > 0 ? "#ef4444" : COLOR_DORADO }}>⚠️</span>
             </div>
            <div style={{ marginTop: '8px' }}>
              <span style={{ fontSize: "32px", fontWeight: "900", color: numAlertas > 0 ? "#ef4444" : COLOR_DORADO, textShadow: numAlertas > 0 ? 'none' : `0 0 8px ${COLOR_BRILLO_DORADO}` }}>{numAlertas}</span>
              <span style={{ fontSize: "11px", color: "#94a3b8", marginLeft: '6px' }}>Activas</span>
            </div>
          </div>

          {/* Tarjeta 3: Contratos */}
          <div style={estiloTarjetaDato} onClick={() => navigate('/cliente/contratos')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: "11px", fontWeight: "600", color: "#cbd5e1", textTransform: "uppercase", letterSpacing: '0.5px' }}>
                   Viviendas Asignadas
                </span>
                 {/* Icono de Casa Dorado */}
                <span style={{ fontSize: "16px", color: COLOR_DORADO }}>🏠</span>
            </div>
            <div style={{ marginTop: '8px' }}>
                <span style={{ fontSize: "32px", fontWeight: "900", ...TEXTO_DORADO_BRILLO }}>{numContratos}</span>
                <span style={{ fontSize: "11px", color: "#94a3b8", marginLeft: '6px' }}>Total</span>
            </div>
          </div>
        </div>


        {/* --- SEGUNDA FILA: GRÁFICO DE INSPECCIONES DIARIAS --- */}
        <div
          style={{
            background: FONDO_TARJETA_LINEAL,
            border: BORDE_DORADO_FINO,
            borderRadius: "16px",
            padding: "20px",
            boxShadow: SOMBRA_TARJETA_PROFUNDA,
            marginBottom: "25px"
          }}
        >
           <h3 style={{ fontSize: "14px", color: "#e2e8f0", marginBottom: "15px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Inspecciones Diarias (Última semana)
           </h3>
          
           {/* Gráfico de Líneas con estilo Recharts */}
           <ResponsiveContainer width="100%" height={200}>
                <LineChart data={datosGrafico} margin={{ top: 5, right: 10, left: -30, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                  <XAxis dataKey="dia" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} domain={[0, 'dataMax + 2']} />
                  <Tooltip 
                     contentStyle={{ background: '#090d16', border: BORDE_DORADO_FINO, borderRadius: '8px', color: COLOR_DORADO, fontSize: '11px', boxShadow: SOMBRA_TARJETA_PROFUNDA }}
                     cursor={{ stroke: COLOR_DORADO, strokeWidth: 1 }}
                  />
                  <Line 
                     type="monotone" 
                     dataKey="inspecciones" 
                     stroke={COLOR_DORADO} 
                     strokeWidth={3} 
                     dot={{ r: 4, fill: COLOR_DORADO, stroke: '#fff', strokeWidth: 2 }} 
                     activeDot={{ r: 6, fill: '#fff', stroke: COLOR_DORADO, strokeWidth: 2 }}
                     // Efecto de sombra en la línea usando SVG filters (opcional avanzado, no soportado directo en línea)
                  />
                </LineChart>
            </ResponsiveContainer>
        </div>

         {/* --- TERCERA FILA: ACCIONES RÁPIDAS (Opcional, similar al botón de perfil de antes) --- */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div
            onClick={() => navigate("/cliente/perfil")}
            style={{
              width: "90%",
              background: "linear-gradient(90deg, rgba(224, 176, 52, 0.1) 0%, rgba(224, 176, 52, 0.05) 100%)", // Fondo dorado muy sutil
              border: BORDE_DORADO_FINO,
              borderRadius: "30px",
              padding: "12px 20px",
              boxShadow: "0 5px 15px rgba(0,0,0,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              cursor: "pointer",
              transition: 'all 0.3s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.6)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.4)'; }}
          >
            <span style={{ fontSize: '14px', color: COLOR_DORADO }}>⚙️</span>
            <span style={{ fontWeight: "700", ...TEXTO_DORADO_BRILLO, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Configuración de Seguridad y Notificaciones
            </span>
          </div>
        </div>

      </div>
    </Menu>
  );
}
