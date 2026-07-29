import React, { useState, useEffect } from "react";
import Menu from "../../layouts/Menu";

export default function Idioma() {
  const [idioma, setIdioma] = useState("es");

  useEffect(() => {
    const saved = localStorage.getItem("idioma");
    if (saved) setIdioma(saved);
  }, []);

  const cambiarIdioma = (lang) => {
    setIdioma(lang);
    localStorage.setItem("idioma", lang);
    alert(`Idioma cambiado a: ${lang === "es" ? "Español" : "English"}`);
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
          🌐 Cambiar idioma
        </h1>

        <div style={cardStyle}>
          <p style={{ opacity: 0.8, marginBottom: "15px" }}>
            Selecciona el idioma de la aplicación.
          </p>

          <button
            style={idioma === "es" ? buttonActive : buttonStyle}
            onClick={() => cambiarIdioma("es")}
          >
            🇪🇸 Español
          </button>

          <button
            style={idioma === "en" ? buttonActive : buttonStyle}
            onClick={() => cambiarIdioma("en")}
          >
            🇬🇧 English
          </button>
        </div>
      </div>
    </Menu>
  );
}
