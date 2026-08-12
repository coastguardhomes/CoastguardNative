import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import Menu from "../../layouts/Menu.jsx";

// Estética táctica CoastGuard HOMES (Dorados, Azul Marino y Blancos con relieve)
const COLOR_DORADO = "#e0b034";
const COLOR_BRILLO = "rgba(224, 176, 52, 0.5)";
const FONDO_TARJETA = "linear-gradient(145deg, #0f172a 0%, #090d16 100%)";
const FONDO_PRINCIPAL = "#05080f";
const BORDE_DORADO = `1px solid ${COLOR_DORADO}`;
const SOMBRA_PROFUNDA = "0 8px 20px rgba(0, 0, 0, 0.6)";

export default function ClienteDashboard() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [cliente, setCliente] = useState(null);
  const [numContratos, setNumContratos] = useState(0);
  const [numInspecciones, setNumInspecciones] = useState(0);
  const [numFacturasPendientes, setNumFacturasPendientes] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarDatos() {
      if (!user) return;

      const { data: clienteData } = await supabase
        .from("clientes")
        .select("*")
        .eq("usuario_id", user.id)
        .single();

      if (clienteData) {
        setCliente(clienteData);
        const clienteId = clienteData.id;

        const [
          { count: countContratos },
          { count: countInspecciones },
          { count: countFacturas }
        ] = await Promise.all([
          supabase.from("contratos").select("*", { count: "exact", head: true }).eq("cliente_id", clienteId),
          supabase.from("inspecciones").select("*", { count: "exact", head: true }).eq("cliente_id", clienteId),
          supabase.from("facturas").select("*", { count: "exact", head: true }).eq("cliente_id", clienteId).eq("estado", "pendiente")
        ]);

        setNumContratos(countContratos || 0);
        setNumInspecciones(countInspecciones || 0);
        setNumFacturasPendientes(countFacturas || 0);
      }
      setLoading(false);
    }

    cargarDatos();
  }, [user]);

  const tarjetasResumen = [
    { titulo: "Mis Contratos", valor: numContratos, icono: "📄", ruta: "/cliente/contratos" },
    { titulo: "Mis Inspecciones", valor: numInspecciones, icono: "📋", ruta: "/cliente/inspecciones" },
    { titulo: "Facturas Pendientes", valor: numFacturasPendientes, icono: "💳", ruta: "/cliente/facturas", alerta: numFacturasPendientes > 0 }
  ];

  if (loading) {
    return (
      <Menu>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', color: COLOR_DORADO, background: FONDO_PRINCIPAL, fontFamily: "Inter" }}>
          <h3 style={{ textShadow: `0 0 8px ${COLOR_BRILLO}` }}>{t("clienteDashboardCargando")}</h3>
        </div>
      </Menu>
    );
  }

  return (
    <Menu>
      <div
        style={{
          width: "100%",
          minHeight: "90vh",
          background: FONDO_PRINCIPAL,
          padding: "16px",
          fontFamily: "Inter, sans-serif",
          color: "#fff",
          boxSizing: "border-box",
          paddingBottom: "80px",
        }}
      >
        {/* Cabecera Oficial CoastGuard HOMES (Exacta al logotipo) */}
        <div
          style={{
            background: "linear-gradient(180deg, #0d1527 0%, #080e1a 100%)",
            border: BORDE_DORADO,
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "20px",
            boxShadow: SOMBRA_PROFUNDA,
            textAlign: "center",
          }}
        >
          {/* Escudo / Icono de Referencia */}
          <div style={{ fontSize: "28px", marginBottom: "6px", filter: `drop-shadow(0 0 8px ${COLOR_BRILLO})` }}>
            🛡️⚓
          </div>

          {/* Nombre con tipografía combinada idéntica al logo */}
          <div style={{ lineHeight: "1.1", marginBottom: "6px" }}>
            <span
              style={{
                fontSize: "22px",
                fontWeight: "800",
                color: "#ffffff",
                letterSpacing: "0.5px",
                textShadow: "0 2px 4px rgba(0,0,0,0.8)",
                fontFamily: "serif",
              }}
            >
              CoastGuard
            </span>
          </div>

          {/* Subtítulo HOMES con líneas doradas a los lados */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              marginTop: "4px",
            }}
          >
            <div style={{ height: "1px", width: "35px", background: COLOR_DORADO }} />
            <span
              style={{
                fontSize: "12px",
                fontWeight: "700",
                color: COLOR_DORADO,
                letterSpacing: "3px",
                textTransform: "uppercase",
                textShadow: `0 0 6px ${COLOR_BRILLO}`,
              }}
            >
              HOMES
            </span>
            <div style={{ height: "1px", width: "35px", background: COLOR_DORADO }} />
          </div>

          <div style={{ color: "#94a3b8", fontSize: "12px", marginTop: "12px", fontWeight: "500" }}>
            Panel de Control • <span style={{ color: COLOR_DORADO }}>{cliente?.nombre}</span>
          </div>
        </div>

        {/* Título de sección */}
        <h2 style={{ fontSize: "14px", color: "#e2e8f0", marginBottom: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          Resumen de Actividad
        </h2>

        {/* Grid de Tarjetas de Resumen */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "12px",
            marginBottom: "24px",
          }}
        >
          {tarjetasResumen.map((item) => (
            <div
              key={item.titulo}
              onClick={() => navigate(item.ruta)}
              style={{
                background: FONDO_TARJETA,
                borderRadius: "14px",
                padding: "16px",
                border: item.alerta ? `1px solid #ef4444` : BORDE_DORADO,
                boxShadow: SOMBRA_PROFUNDA,
                cursor: "pointer",
                transition: "transform 0.2s",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: "110px"
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-3px)"}
              onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{ fontSize: "11px", fontWeight: "700", color: item.alerta ? "#ef4444" : "#cbd5e1", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  {item.titulo}
                </span>
                <span style={{ fontSize: "16px", color: item.alerta ? "#ef4444" : COLOR_DORADO }}>{item.icono}</span>
              </div>
              
              <div style={{ marginTop: "16px" }}>
                <span
                  style={{
                    fontSize: "32px",
                    fontWeight: "900",
                    color: item.alerta ? "#ef4444" : COLOR_DORADO,
                    textShadow: item.alerta ? "none" : `0 0 10px ${COLOR_BRILLO}`,
                    letterSpacing: "-1px",
                  }}
                >
                  {item.valor}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Acceso Rápido al Perfil */}
        <div
            onClick={() => navigate("/cliente/perfil")}
            style={{
                background: FONDO_TARJETA,
                borderRadius: "14px",
                padding: "14px 16px",
                border: BORDE_DORADO,
                boxShadow: SOMBRA_PROFUNDA,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '20px', color: COLOR_DORADO, background: 'rgba(224, 176, 52, 0.1)', padding: '8px', borderRadius: '10px' }}>👤</div>
                <div>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: "#e2e8f0", textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mi Perfil</div>
                    <div style={{ fontSize: "11px", color: "#94a3b8" }}>Actualizar datos y contraseña</div>
                </div>
            </div>
            <div style={{ fontSize: '14px', color: COLOR_DORADO }}>→</div>
        </div>

      </div>
    </Menu>
  );
}
