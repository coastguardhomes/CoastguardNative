import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Ajustes() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const cerrarSesion = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

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

          {/* Sólo se enlaza lo que tiene pantalla real. "Perfil",
              "Notificaciones" y "Privacidad" apuntaban a /perfil,
              /notificaciones y /privacidad, que no existen en /src/pages: al
              pulsarlos la app caía en el comodín y devolvía al login. */}
          <ul style={{ marginTop: "20px", lineHeight: "1.8", listStyle: "none", padding: 0 }}>
            <li>
              <Link to="/idioma" style={itemStyle}>
                🌐 Cambiar idioma
              </Link>
            </li>

            <li>
              <span style={{ ...itemStyle, color: "#fff", opacity: 0.85 }}>
                📧 {user?.email || "Sesión activa"}
              </span>
            </li>

            <li
              onClick={cerrarSesion}
              style={{
                ...itemStyle,
                color: "#ff6b6b",
              }}
            >
              🚪 Cerrar sesión
            </li>
          </ul>
        </div>
      </div>
    </Menu>
  );
}
