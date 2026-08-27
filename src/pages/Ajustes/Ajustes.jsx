import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { useAuth } from "../../context/AuthContext.jsx";
import { supabase } from "../../supabaseClient";

export default function Ajustes() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [idiomaActual, setIdiomaActual] = useState(localStorage.getItem("app_idioma") || "es");
  const [mensaje, setMensaje] = useState("");

  const cambiarIdiomaManual = async (nuevoIdioma) => {
    setIdiomaActual(nuevoIdioma);
    localStorage.setItem("app_idioma", nuevoIdioma);

    if (user?.id) {
      await supabase
        .from("clientes")
        .update({ idioma: nuevoIdioma })
        .or(`user_id.eq.${user.id},usuario_id.eq.${user.id}`);
    }

    setMensaje("Idioma actualizado correctamente. Actualizando...");
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

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
    justifyContent: "space-between",
    padding: "12px 0",
    fontSize: "16px",
    color: "#4db8ff",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
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

        {mensaje && (
          <div style={{ background: "rgba(34, 197, 94, 0.2)", border: "1px solid rgba(34, 197, 94, 0.4)", padding: "10px", borderRadius: "8px", color: "#22c55e", marginBottom: "15px", textAlign: "center", fontSize: "14px", fontWeight: "700" }}>
            {mensaje}
          </div>
        )}

        <div style={cardStyle}>
          <p style={{ fontSize: "16px", opacity: 0.8, marginBottom: "15px" }}>
            Configuración general de tu cuenta y preferencias de idioma.
          </p>

          <div style={itemStyle}>
            <span>🌐 Idioma de la aplicación</span>
            <select 
              value={idiomaActual}
              onChange={(e) => cambiarIdiomaManual(e.target.value)}
              style={{
                background: "rgba(11, 19, 32, 0.9)",
                border: "1px solid rgba(0,153,255,0.4)",
                color: "#fff",
                padding: "8px 12px",
                borderRadius: "8px",
                fontSize: "14px",
                cursor: "pointer",
                outline: "none"
              }}
            >
              <option value="es" style={{ background: "#030509" }}>🇪🇸 Español</option>
              <option value="en" style={{ background: "#030509" }}>🇬🇧 English</option>
              <option value="fr" style={{ background: "#030509" }}>🇫🇷 Français</option>
            </select>
          </div>

          <div style={itemStyle}>
            <span style={{ color: "#fff", opacity: 0.85 }}>
              📧 {user?.email || "Sesión activa"}
            </span>
          </div>

          <div
            onClick={cerrarSesion}
            style={{
              ...itemStyle,
              color: "#ff6b6b",
              cursor: "pointer",
              borderBottom: "none"
            }}
          >
            <span>🚪 Cerrar sesión</span>
          </div>
        </div>
      </div>
    </Menu>
  );
}
