import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import Menu from "../../layouts/Menu.jsx";

// --- IMPORTACIÓN DE LOGO ---
import logoReal from "../../assets/logo.jpeg";

// --- CONSTANTES DE ESTILO ---
const COLOR_DORADO = "#e0b034";
const COLOR_BRILLO_DORADO = "rgba(224, 176, 52, 0.5)";
const FONDO_TARJETA_LINEAL = "linear-gradient(145deg, #0d1626 0%, #05080f 100%)";
const FONDO_PRINCIPAL = "#030509";
const BORDE_DORADO_FINO = `1px solid ${COLOR_DORADO}`;
const TEXTO_DORADO_BRILLO = { color: COLOR_DORADO, textShadow: `0 0 8px ${COLOR_BRILLO_DORADO}` };

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

      try {
        // Cargar datos del cliente
        const { data: clienteData, error: clienteError } = await supabase
          .from("clientes")
          .select("*")
          .eq("usuario_id", user.id)
          .maybeSingle();

        if (clienteData) {
          setCliente(clienteData);
          const clienteId = clienteData.id;

          const [
            { count: countContratos },
            { count: countAlertas }
          ] = await Promise.all([
            supabase.from("contratos").select("*", { count: "exact", head: true }).eq("cliente_id", clienteId),
            supabase.from("alertas").select("*", { count: "exact", head: true }).eq("cliente_id", clienteId).eq("estado", "activa")
          ]);

          setNumContratos(countContratos || 0);
          setNumAlertas(countAlertas || 0);
        } else if (clienteError) {
          console.error("Error cargando cliente:", clienteError);
        }
      } catch (err) {
        console.error("Error inesperado:", err);
      } finally {
        setLoading(false);
      }
    }

    cargarDatos();
  }, [user]);

  const estiloTarjetaDato = {
    background: FONDO_TARJETA_LINEAL,
    border: BORDE_DORADO_FINO,
    borderRadius: "12px",
    padding: "12px 10px",
    boxShadow: "0 0 12px rgba(224, 176, 52, 0.15)",
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '90px',
    minWidth: 0,
    cursor: 'pointer'
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
          padding: "15px",
          fontFamily: "'Inter', sans-serif",
          color: "#fff",
          boxSizing: "border-box",
          paddingBottom: "90px",
          overflowX: "hidden"
        }}
      >
        
        {/* --- CABECERA PRINCIPAL --- */}
        <div
          style={{
            background: "linear-gradient(180deg, #0d1626 0%, #05080f 100%)",
            border: BORDE_DORADO_FINO,
            borderRadius: "16px",
            padding: "12px 16px",
            marginBottom: "20px",
            boxShadow: "0 0 15px rgba(224, 176, 52, 0.2)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxSizing: "border-box"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img 
              src={logoReal} 
              alt="CoastGuard HOMES Logo" 
              style={{ 
                height: "45px",
                width: "auto",
                objectFit: "contain",
                filter: `drop-shadow(0 0 8px ${COLOR_BRILLO_DORADO})`
              }} 
            />
            <h1
              style={{
                fontSize: "16px",
                fontWeight: "800",
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
          
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "8px", height: "8px", background: "#10b981", borderRadius: "50%", boxShadow: "0 0 8px #10b981" }}></div>
            <span style={{ color: "#94a3b8", fontSize: "11px", fontWeight: "600" }}>Operativo</span>
          </div>
        </div>

        {/* --- TARJETAS DE DATOS --- */}
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
                <span style={{ fontSize: "10px", fontWeight: "700", color: "#cbd5e1", textTransform: "uppercase", lineHeight: "1.2" }}>
                  Inspecciones
                </span>
                <span style={{ fontSize: "14px" }}>📋</span>
            </div>
            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: "26px", fontWeight: "900", ...TEXTO_DORADO_BRILLO }}>{numContratos}</span>
              <span style={{ fontSize: "10px", color: "#94a3b8" }}>Activas</span>
            </div>
          </div>

          {/* Tarjeta 2: Alertas */}
          <div style={estiloTarjetaDato} onClick={() => navigate('/cliente/alertas')}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: "10px", fontWeight: "700", color: numAlertas > 0 ? "#ef4444" : "#cbd5e1", textTransform: "uppercase", lineHeight: "1.2" }}>
                  Alertas
                </span>
                <span style={{ fontSize: "14px" }}>⚠️</span>
             </div>
            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: "26px", fontWeight: "900", color: numAlertas > 0 ? "#ef4444" : COLOR_DORADO }}>{numAlertas}</span>
              <span style={{ fontSize: "10px", color: "#94a3b8" }}>Activas</span>
            </div>
          </div>

          {/* Tarjeta 3: Viviendas */}
          <div style={estiloTarjetaDato} onClick={() => navigate('/cliente/contratos')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: "10px", fontWeight: "700", color: "#cbd5e1", textTransform: "uppercase", lineHeight: "1.2" }}>
                   Viviendas
                </span>
                <span style={{ fontSize: "14px" }}>🏠</span>
            </div>
            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: "26px", fontWeight: "900", ...TEXTO_DORADO_BRILLO }}>{numContratos}</span>
                <span style={{ fontSize: "10px", color: "#94a3b8" }}>Total</span>
            </div>
          </div>
        </div>

        {/* --- BOTÓN A CONFIGURACIÓN Y SEGURIDAD --- */}
        <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
          <button
            onClick={() => navigate("/cliente/configuracion")}
            style={{
              width: "100%",
              maxWidth: "400px",
              background: "linear-gradient(90deg, rgba(224, 176, 52, 0.12) 0%, rgba(224, 176, 52, 0.04) 100%)",
              border: BORDE_DORADO_FINO,
              borderRadius: "30px",
              padding: "12px 16px",
              boxShadow: "0 0 15px rgba(224, 176, 52, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              cursor: "pointer",
              boxSizing: "border-box"
            }}
          >
            <span style={{ fontSize: '14px' }}>⚙️</span>
            <span style={{ fontWeight: "700", ...TEXTO_DORADO_BRILLO, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "center" }}>
              Configuración de Seguridad y Notificaciones
            </span>
          </button>
        </div>

      </div>
    </Menu>
  );
}
