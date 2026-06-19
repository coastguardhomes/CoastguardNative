import React from "react";
import Menu from "../../layouts/Menu";

export default function Inicio() {
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
            fontSize: "30px",
            fontWeight: "700",
            marginBottom: "25px",
            color: "#4db8ff",
            textShadow: "0 0 10px rgba(0,153,255,0.6)",
          }}
        >
          Bienvenido a CoastGuard
        </h1>

        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            padding: "25px",
            borderRadius: "14px",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 0 14px rgba(0,153,255,0.2)",
            marginBottom: "20px",
          }}
        >
          <p style={{ fontSize: "17px", opacity: 0.85 }}>
            Tu panel principal para gestionar clientes, viviendas, técnicos e inspecciones.
          </p>

          <ul style={{ marginTop: "20px", lineHeight: "1.9" }}>
            <li>Acceso rápido a módulos</li>
            <li>Últimas inspecciones</li>
            <li>Notificaciones importantes</li>
            <li>Acciones rápidas</li>
            <li>Estado general del sistema</li>
          </ul>

          <p style={{ marginTop: "20px", opacity: 0.7 }}>
            Próximamente añadiremos dashboard real, estadísticas, accesos rápidos,
            notificaciones y resumen de actividad.
          </p>
        </div>
      </div>
    </Menu>
  );
}
