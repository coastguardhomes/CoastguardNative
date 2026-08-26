import React from "react";
import Menu from "../../layouts/Menu";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function Idioma() {
  const context = useLanguage() || {};
  const lang = context.lang || "es";
  
  // Detectar automáticamente qué función de cambio de idioma expone el contexto de forma segura
  const actualizarIdioma = context.setLang || context.setLanguage || context.changeLanguage;

  const cambiarIdioma = (nuevo) => {
    if (typeof actualizarIdioma === "function") {
      actualizarIdioma(nuevo);
    }
    localStorage.setItem("idioma", nuevo);
    // Forzar recarga suave para asegurar que toda la interfaz traduzca al instante
    window.location.reload();
  };

  const cardStyle = {
    background: "rgba(255,255,255,0.05)",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 0 12px rgba(0,153,255,0.2)",
    marginBottom: "20px",
    color: "#fff",
    fontFamily: "Inter, sans-serif",
  };

  const buttonStyle = {
    width: "100%",
    padding: "12px",
    marginTop: "10px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
    background: "#4db8ff",
    color: "#fff",
  };

  const buttonActive = {
    ...buttonStyle,
    background: "#0077cc",
  };

  return (
    <Menu>
      <div style={{ padding: "25px", color: "#fff" }}>
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "700",
            marginBottom: "20px",
            color: "#4db8ff",
            textShadow: "0 0 8px rgba(0,153,255,0.6)",
          }}
        >
          🌐 Idioma
        </h1>

        <div style={cardStyle}>
          <p style={{ opacity: 0.8, marginBottom: "15px" }}>
            Elige el idioma en el que deseas visualizar la aplicación:
          </p>

          <button
            style={lang === "es" ? buttonActive : buttonStyle}
            onClick={() => cambiarIdioma("es")}
          >
            🇪🇸 Español
          </button>

          <button
            style={lang === "en" ? buttonActive : buttonStyle}
            onClick={() => cambiarIdioma("en")}
          >
            🇬🇧 English
          </button>

          <button
            style={lang === "fr" ? buttonActive : buttonStyle}
            onClick={() => cambiarIdioma("fr")}
          >
            🇫🇷 Français
          </button>
        </div>
      </div>
    </Menu>
  );
}
