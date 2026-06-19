import React from "react";
import Menu from "../../layouts/Menu";

export default function Ajustes() {
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
          Ajustes
        </h1>

        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            padding: "20px",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 0 12px rgba(0,153,255,0.2)",
            marginBottom: "20px",
          }}
        >
          <p style={{ fontSize: "16px", opacity: 0.8 }}>
            Configuración general de tu cuenta y preferencias.
          </p>

          <ul style={{ marginTop: "20px", lineHeight: "1.8" }}>
            <li>Perfil del usuario</li>
            <li>Cambiar idioma</li>
            <li>Notificaciones</li>
            <li>Privacidad y seguridad</li>
            <li>Cerrar sesión</li>
          </ul>

          <p style={{ marginTop: "20px", opacity: 0.7 }}>
            Próximamente añadiremos ajustes reales, selector de idioma funcional,
            actualización de perfil y cierre de sesión con Supabase Auth.
          </p>
        </div>
      </div>
    </Menu>
  );
}
