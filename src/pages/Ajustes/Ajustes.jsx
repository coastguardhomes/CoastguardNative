import React from "react";
import { Link } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Ajustes() {
  const { logout } = useAuth();

  const cardStyle = {
    background: "rgba(255,255,255,0.05)",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 0 12px rgba(0,153,255,0.2)",
    marginBottom: "20px",
  };

  const itemStyle = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 0",
    fontSize: "16px",
    cursor: "pointer",
    color: "#4db8ff",
    textDecoration: "none",
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
          ⚙️ Ajustes
        </h1>

        <div style={cardStyle}>
          <p style={{ fontSize: "16px", opacity: 0.8 }}>
            Configuración general de tu cuenta y preferencias.
          </p>

          <ul style={{ marginTop: "20px", lineHeight: "1.8", listStyle: "none", padding: 0 }}>
            <li>
              <Link to="/perfil" style={itemStyle}>
                👤 Perfil del usuario
              </Link>
            </li>

            <li>
              <Link to="/idioma" style={itemStyle}>
                🌐 Cambiar idioma
              </Link>
            </li>

            <li>
              <Link to="/notificaciones" style={itemStyle}>
                🔔 Notificaciones
              </Link>
            </li>

            <li>
              <Link to="/privacidad" style={itemStyle}>
                🔒 Privacidad y seguridad
              </Link>
            </li>

            <li
              onClick={logout}
              style={{
                ...itemStyle,
                color: "#ff6b6b",
              }}
            >
              🚪 Cerrar sesión
            </li>
          </ul>

          <p style={{ marginTop: "20px", opacity: 0.7 }}>
            Próximamente añadiremos ajustes reales, selector de idioma funcional,
            actualización de perfil y configuración avanzada de notificaciones.
          </p>
        </div>
      </div>
    </Menu>
  );
}
