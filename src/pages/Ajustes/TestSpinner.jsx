import React, { useState } from "react";
import Menu from "../../layouts/Menu";

export default function TestSpinner() {
  const [loading, setLoading] = useState(false);

  const cardStyle = {
    background: "rgba(255,255,255,0.05)",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 0 12px rgba(0,153,255,0.2)",
    marginBottom: "20px",
  };

  const buttonStyle = {
    background: "#4db8ff",
    padding: "12px 18px",
    borderRadius: "10px",
    border: "none",
    color: "#fff",
    fontSize: "16px",
    cursor: "pointer",
    width: "100%",
    marginTop: "15px",
    boxShadow: "0 0 10px rgba(0,153,255,0.4)",
  };

  const spinnerStyle = {
    width: "50px",
    height: "50px",
    border: "6px solid rgba(255,255,255,0.2)",
    borderTopColor: "#4db8ff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "30px auto",
  };

  return (
    <Menu>
      <div
        style={{
          padding: "25px",
          color: "#fff",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "700",
            marginBottom: "20px",
            color: "#4db8ff",
            textShadow: "0 0 8px rgba(0,153,255,0.6)",
          }}
        >
          🔄 Test del Spinner
        </h1>

        <div style={cardStyle}>
          <p style={{ fontSize: "16px", opacity: 0.8 }}>
            Prueba la animación del spinner para verificar que funciona
            correctamente y no causa errores en la app.
          </p>

          <button
            style={buttonStyle}
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 3000);
            }}
          >
            Mostrar spinner (3 segundos)
          </button>

          {loading && (
            <div style={spinnerStyle}></div>
          )}
        </div>
      </div>

      {/* Animación CSS */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </Menu>
  );
}
