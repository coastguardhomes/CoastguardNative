import React from "react";
import Menu from "../../layouts/Menu";

export default function Inicio() {
  return (
    <Menu>
      <div
        style={{
          padding: "25px",
          background: "#0a0f1a",
          minHeight: "100vh",
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
            textAlign: "center",
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
          <p style={{ fontSize: "17px", opacity: 0.85, marginBottom: "20px" }}>
            Tu panel principal para gestionar clientes, viviendas, técnicos e inspecciones.
          </p>

          {/* Reemplazo de la lista por bloques táctiles */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                background: "rgba(255,255,255,0.08)",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              Acceso rápido a módulos
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.08)",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              Últimas inspecciones
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.08)",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              Notificaciones importantes
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.08)",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              Acciones rápidas
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.08)",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              Estado general del sistema
            </div>
          </div>

          <p style={{ opacity: 0.7 }}>
            Próximamente añadiremos dashboard real, estadísticas, accesos rápidos,
            notificaciones y resumen de actividad.
          </p>
        </div>
      </div>
    </Menu>
  );
}
