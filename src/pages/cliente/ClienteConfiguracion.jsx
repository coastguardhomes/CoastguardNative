import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext.jsx";
import Menu from "../../layouts/Menu.jsx";
import logoReal from "../../assets/logo.jpeg";

// Estilos de la paleta táctica CoastGuard
const COLOR_DORADO = "#e0b034";
const COLOR_BRILLO_DORADO = "rgba(224, 176, 52, 0.5)";
const FONDO_TARJETA = "linear-gradient(145deg, #0d1626 0%, #05080f 100%)";
const FONDO_PRINCIPAL = "#030509";
const BORDE_DORADO = `1px solid ${COLOR_DORADO}`;
const TEXTO_DORADO_BRILLO = { color: COLOR_DORADO, textShadow: `0 0 8px ${COLOR_BRILLO_DORADO}` };

export default function ClienteConfiguracion() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Estados de configuración local
  const [notifPush, setNotifPush] = useState(true);
  const [notifEmail, setNotifEmail] = useState(true);
  const [alertasCriticas, setAlertasCriticas] = useState(true);
  const [autenticacionDosPasos, setAutenticacionDosPasos] = useState(false);
  const [guardado, setGuardado] = useState(false);

  const handleGuardar = () => {
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2500);
  };

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
        {/* CABECERA */}
        <div
          style={{
            background: "linear-gradient(180deg, #0d1626 0%, #05080f 100%)",
            border: BORDE_DORADO,
            borderRadius: "16px",
            padding: "12px 16px",
            marginBottom: "20px",
            boxShadow: "0 0 15px rgba(224, 176, 52, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img 
              src={logoReal} 
              alt="CoastGuard Logo" 
              style={{ height: "40px", width: "auto", filter: `drop-shadow(0 0 6px ${COLOR_BRILLO_DORADO})` }} 
            />
            <h1
              style={{
                fontSize: "14px",
                fontWeight: "800",
                margin: 0,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                lineHeight: "1.2",
                ...TEXTO_DORADO_BRILLO,
              }}
            >
              {t('configuracionYSeguridad')}
            </h1>
          </div>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: "transparent",
              border: BORDE_DORADO,
              color: COLOR_DORADO,
              borderRadius: "8px",
              padding: "4px 10px",
              fontSize: "11px",
              fontWeight: "700",
              cursor: "pointer"
            }}
          >
            {t('volver')}
          </button>
        </div>

        {/* SECCIÓN 1: NOTIFICACIONES */}
        <div
          style={{
            background: FONDO_TARJETA,
            border: BORDE_DORADO,
            borderRadius: "16px",
            padding: "16px",
            marginBottom: "16px",
            boxShadow: "0 0 12px rgba(224, 176, 52, 0.15)"
          }}
        >
          <h2 style={{ fontSize: "12px", color: "#cbd5e1", textTransform: "uppercase", marginBottom: "14px", fontWeight: "700" }}>
            🔔 {t('preferenciasNotificacion')}
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <ToggleOption
              titulo={t('notifPushTitulo')}
              subtitulo={t('notifPushSub')}
              activo={notifPush}
              onToggle={() => setNotifPush(!notifPush)}
            />
            <ToggleOption
              titulo={t('resumenCorreoTitulo')}
              subtitulo={t('resumenCorreoSub')}
              activo={notifEmail}
              onToggle={() => setNotifEmail(!notifEmail)}
            />
            <ToggleOption
              titulo={t('alertasCriticasTitulo')}
              subtitulo={t('alertasCriticasSub')}
              activo={alertasCriticas}
              onToggle={() => setAlertasCriticas(!alertasCriticas)}
            />
          </div>
        </div>

        {/* SECCIÓN 2: SEGURIDAD */}
        <div
          style={{
            background: FONDO_TARJETA,
            border: BORDE_DORADO,
            borderRadius: "16px",
            padding: "16px",
            marginBottom: "20px",
            boxShadow: "0 0 12px rgba(224, 176, 52, 0.15)"
          }}
        >
          <h2 style={{ fontSize: "12px", color: "#cbd5e1", textTransform: "uppercase", marginBottom: "14px", fontWeight: "700" }}>
            🛡️ {t('seguridadCuenta')}
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <ToggleOption
              titulo={t('autenticacionDosPasosTitulo')}
              subtitulo={t('autenticacionDosPasosSub')}
              activo={autenticacionDosPasos}
              onToggle={() => setAutenticacionDosPasos(!autenticacionDosPasos)}
            />

            <div style={{ paddingTop: "8px", borderTop: "1px solid rgba(224, 176, 52, 0.2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "12px", fontWeight: "700", color: "#fff" }}>{t('contrasena')}</div>
                <div style={{ fontSize: "10px", color: "#94a3b8" }}>{t('ultimoCambioContrasena')}</div>
              </div>
              <button
                onClick={() => alert(t('alertaCambiarContrasena'))}
                style={{
                  background: "rgba(224, 176, 52, 0.1)",
                  border: BORDE_DORADO,
                  color: COLOR_DORADO,
                  borderRadius: "20px",
                  padding: "6px 12px",
                  fontSize: "10px",
                  fontWeight: "700",
                  cursor: "pointer"
                }}
              >
                {t('cambiar')}
              </button>
            </div>
          </div>
        </div>

        {/* BOTÓN GUARDAR */}
        <button
          onClick={handleGuardar}
          style={{
            width: "100%",
            background: guardado ? "#10b981" : "linear-gradient(90deg, #e0b034 0%, #b88a1d 100%)",
            border: "none",
            borderRadius: "30px",
            padding: "14px",
            color: "#000",
            fontWeight: "800",
            fontSize: "12px",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            boxShadow: guardado ? "0 0 15px #10b981" : "0 0 15px rgba(224, 176, 52, 0.4)",
            cursor: "pointer",
            transition: "all 0.3s ease"
          }}
        >
          {guardado ? t('cambiosGuardados') : t('guardarPreferencias')}
        </button>
      </div>
    </Menu>
  );
}

// Componente auxiliar de Toggle
function ToggleOption({ titulo, subtitulo, activo, onToggle }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "12px", fontWeight: "700", color: "#fff" }}>{titulo}</div>
        <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "2px" }}>{subtitulo}</div>
      </div>
      <div
        onClick={onToggle}
        style={{
          width: "42px",
          height: "22px",
          background: activo ? COLOR_DORADO : "#1e293b",
          borderRadius: "12px",
          padding: "2px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: activo ? "flex-end" : "flex-start",
          transition: "all 0.2s ease",
          boxShadow: activo ? `0 0 8px ${COLOR_BRILLO_DORADO}` : "none"
        }}
      >
        <div
          style={{
            width: "18px",
            height: "18px",
            background: activo ? "#000" : "#64748b",
            borderRadius: "50%"
          }}
        />
      </div>
    </div>
  );
}
