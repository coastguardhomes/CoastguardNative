import React, { useState } from "react";
import Menu from "../../layouts/Menu";

export default function Notificaciones() {
  const [emailNotif, setEmailNotif] = useState(true);
  const [appNotif, setAppNotif] = useState(true);

  const cardStyle = {
    background: "rgba(255,255,255,0.05)",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 0 12px rgba(0,153,255,0.2)",
    marginBottom: "20px",
  };

  const toggleStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 0",
    fontSize: "16px",
    cursor: "pointer",
  };

  const switchStyle = (active) => ({
    width: "45px",
    height: "22px",
    borderRadius: "20px",
    background: active ? "#4db8ff" : "rgba(255,255,255,0.2)",
    position: "relative",
    transition: "0.2s",
  });

  const knobStyle = (active) => ({
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    background: "#fff",
    position: "absolute",
    top: "1px",
    left: active ? "23px" : "2px",
    transition: "0.2s",
  });

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
          🔔 Notificaciones
        </h1>

        <div style={cardStyle}>
          <p style={{ fontSize: "16px", opacity: 0.8 }}>
            Configura cómo quieres recibir avisos de CoastGuard.
          </p>

          <div style={{ marginTop: "20px" }}>
            {/* Notificaciones por email */}
            <div
              style={toggleStyle}
              onClick={() => setEmailNotif(!emailNotif)}
            >
              <span>📧 Notificaciones por correo</span>
              <div style={switchStyle(emailNotif)}>
                <div style={knobStyle(emailNotif)}></div>
              </div>
            </div>

            {/* Notificaciones dentro de la app */}
            <div
              style={toggleStyle}
              onClick={() => setAppNotif(!appNotif)}
            >
              <span>📱 Notificaciones en la app</span>
              <div style={switchStyle(appNotif)}>
                <div style={knobStyle(appNotif)}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Menu>
  );
}
