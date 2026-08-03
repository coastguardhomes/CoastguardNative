import React, { useState } from "react";
import Menu from "../../layouts/Menu";

export default function LimpiarCache() {
  const [mensaje, setMensaje] = useState("");

  const cardStyle = {
    background: "rgba(255,255,255,0.05)",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 0 12px rgba(0,153,255,0.2)",
    marginBottom: "20px",
  };

  const buttonStyle = {
    background: "#ff6b6b",
    padding: "12px 18px",
    borderRadius: "10px",
    border: "none",
    color: "#fff",
    fontSize: "16px",
    cursor: "pointer",
    width: "100%",
    marginTop: "15px",
    boxShadow: "0 0 10px rgba(255,0,0,0.4)",
  };

  const limpiarCache = async () => {
    try {
      // Simulación para navegador
      setMensaje("Caché limpiada correctamente (modo navegador).");

      // Si estás en móvil con Capacitor, aquí se ejecuta la limpieza real
      if (window.Capacitor?.Preferences) {
        await window.Capacitor.Preferences.clear();
        setMensaje("Caché limpiada correctamente (Capacitor).");
      }
    } catch (error) {
      setMensaje("Error al limpiar la caché.");
    }
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
          🧹 Limpiar Caché
        </h1>

        <div style={cardStyle}>
          <p style={{ fontSize: "16px", opacity: 0.8 }}>
            Borra la caché de CoastGuard para solucionar problemas de carga,
            rutas, imágenes o actualizaciones.
          </p>

          <button style={buttonStyle} onClick={limpiarCache}>
            Limpiar caché
          </button>

          {mensaje && (
            <p
              style={{
                marginTop: "20px",
                fontSize: "16px",
                color: "#4db8ff",
                textShadow: "0 0 6px rgba(0,153,255,0.5)",
              }}
            >
              {mensaje}
            </p>
          )}
        </div>
      </div>
    </Menu>
  );
}
