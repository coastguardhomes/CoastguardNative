import React from "react";
import Menu from "../../layouts/Menu";

export default function Privacidad() {
  const cardStyle = {
    background: "rgba(255,255,255,0.05)",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 0 12px rgba(0,153,255,0.2)",
    marginBottom: "20px",
  };

  const itemStyle = {
    marginBottom: "15px",
    lineHeight: "1.6",
    fontSize: "16px",
    opacity: 0.85,
  };

  const titleStyle = {
    fontSize: "18px",
    fontWeight: "600",
    color: "#4db8ff",
    marginBottom: "8px",
    textShadow: "0 0 6px rgba(0,153,255,0.5)",
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
          🔐 Privacidad
        </h1>

        <div style={cardStyle}>
          <p style={{ fontSize: "16px", opacity: 0.8 }}>
            Información sobre cómo CoastGuard gestiona tus datos.
          </p>

          <div style={{ marginTop: "20px" }}>
            <div style={itemStyle}>
              <p style={titleStyle}>📄 Datos almacenados</p>
              <p>
                CoastGuard guarda únicamente la información necesaria para
                gestionar viviendas, inspecciones, contratos y tu cuenta.
              </p>
            </div>

            <div style={itemStyle}>
              <p style={titleStyle}>🔒 Seguridad</p>
              <p>
                Toda la información se almacena en Supabase con políticas RLS
                activas para proteger tus datos.
              </p>
            </div>

            <div style={itemStyle}>
              <p style={titleStyle}>🗑️ Eliminación de datos</p>
              <p>
                Puedes solicitar la eliminación de tu cuenta y todos tus datos
                asociados contactando con el administrador del servicio.
              </p>
            </div>

            <div style={itemStyle}>
              <p style={titleStyle}>📧 Contacto</p>
              <p>
                Para dudas sobre privacidad, ponte en contacto con el equipo de
                CoastGuard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Menu>
  );
}
