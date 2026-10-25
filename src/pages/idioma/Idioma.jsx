
import React from "react";
import Menu from "../../layouts/Menu";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function Idioma() {
  const context = useLanguage() || {};
  const idiomaActual = ["es", "en"].includes(context.language)
    ? context.language
    : "es";

  const actualizarIdioma = context.changeLanguage;

  const cambiarIdioma = (nuevoIdioma) => {
    if (!["es", "en"].includes(nuevoIdioma)) return;

    if (typeof actualizarIdioma === "function") {
      actualizarIdioma(nuevoIdioma);
    }

    localStorage.setItem("app_idioma", nuevoIdioma);
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

  const texto = idiomaActual === "en"
    ? {
        titulo: "Language",
        descripcion: "Choose the language you want to use in the application:",
      }
    : {
        titulo: "Idioma",
        descripcion: "Elige el idioma en el que deseas visualizar la aplicación:",
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
          🌐 {texto.titulo}
        </h1>

        <div style={cardStyle}>
          <p style={{ opacity: 0.8, marginBottom: "15px" }}>
            {texto.descripcion}
          </p>

          <button
            type="button"
            aria-pressed={idiomaActual === "es"}
            style={idiomaActual === "es" ? buttonActive : buttonStyle}
            onClick={() => cambiarIdioma("es")}
          >
            🇪🇸 Español
          </button>

          <button
            type="button"
            aria-pressed={idiomaActual === "en"}
            style={idiomaActual === "en" ? buttonActive : buttonStyle}
            onClick={() => cambiarIdioma("en")}
          >
            🇬🇧 English
          </button>
        </div>
      </div>
    </Menu>
  );
}
