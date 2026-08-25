import React from "react";
import { useNavigate } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function Idioma() {
  const navigate = useNavigate();
  // Se extraen correctamente t, lang y changeLanguage del hook
  const { lang, changeLanguage, t } = useLanguage();

  const handleSelectLanguage = (newLang) => {
    changeLanguage(newLang);
    // Opcional: volver automáticamente a ajustes o dejarlo ahí
    // navigate(-1); 
  };

  const cardStyle = {
    background: "rgba(255,255,255,0.05)",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 0 12px rgba(0,153,255,0.2)",
    marginBottom: "20px",
  };

  const btnStyle = (isActive) => ({
    width: "100%",
    padding: "15px",
    marginBottom: "12px",
    backgroundColor: isActive ? "#2563eb" : "rgba(255,255,255,0.08)",
    color: "#fff",
    border: "1px solid " + (isActive ? "#3b82f6" : "rgba(255,255,255,0.15)"),
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    transition: "all 0.2s ease",
  });

  return (
    <Menu>
      <div
        style={{
          padding: "25px",
          color: "#fff",
          fontFamily: "Inter, sans-serif",
          maxWidth: "500px",
          margin: "0 auto",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "none",
            border: "none",
            color: "#4db8ff",
            cursor: "pointer",
            fontSize: "16px",
            marginBottom: "15px",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          ← Volver
        </button>

        <h1
          style={{
            fontSize: "28px",
            fontWeight: "700",
            marginBottom: "20px",
            color: "#4db8ff",
            textShadow: "0 0 8px rgba(0,153,255,0.6)",
          }}
        >
          🌐 {t("cambiarIdioma") || "Seleccionar Idioma"}
        </h1>

        <div style={cardStyle}>
          <p style={{ fontSize: "15px", opacity: 0.8, marginBottom: "20px" }}>
            Elige el idioma en el que deseas visualizar la aplicación:
          </p>

          {/* Español */}
          <button
            onClick={() => handleSelectLanguage("es")}
            style={btnStyle(lang === "es")}
          >
            🇪🇸 Español {lang === "es" && "✓"}
          </button>

          {/* Inglés */}
          <button
            onClick={() => handleSelectLanguage("en")}
            style={btnStyle(lang === "en")}
          >
            🇬🇧 English {lang === "en" && "✓"}
          </button>

          {/* Francés */}
          <button
            onClick={() => handleSelectLanguage("fr")}
            style={btnStyle(lang === "fr")}
          >
            🇫🇷 Français {lang === "fr" && "✓"}
          </button>
        </div>
      </div>
    </Menu>
  );
}
