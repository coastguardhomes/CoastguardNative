import React from "react";
import Menu from "../../layouts/Menu";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function Idioma() {
  const { lang, setLang, t } = useLanguage();

  const cambiarIdioma = (nuevo) => {
    setLang(nuevo);
    localStorage.setItem("idioma", nuevo);
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
          🌐 {t("idioma")}
        </h1>

        <div style={cardStyle}>
          <p style={{ opacity: 0.8, marginBottom: "15px" }}>
            {t("seleccionarIdioma")}
          </p>

          <button
            style={lang === "es" ? buttonActive : buttonStyle}
            onClick={() => cambiarIdioma("es")}
          >
            🇪🇸 {t("espanol")}
          </button>

          <button
            style={lang === "en" ? buttonActive : buttonStyle}
            onClick={() => cambiarIdioma("en")}
          >
            🇬🇧 {t("ingles")}
          </button>
        </div>
      </div>
    </Menu>
  );
}
