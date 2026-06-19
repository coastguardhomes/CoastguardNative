import React from "react";
import Menu from "../../layouts/Menu";

export default function Tecnicos() {
  return (
    <Menu>
      <div
        style={{
          padding: "20px",
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
          Técnicos
        </h1>

        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            padding: "20px",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 0 12px rgba(0,153,255,0.2)",
          }}
        >
          <p style={{ fontSize: "16px", opacity: 0.8 }}>
            Gestión completa de técnicos CoastGuard.
          </p>

          <ul style={{ marginTop: "20px", lineHeight: "1.8" }}>
            <li>Listado de técnicos</li>
            <li>Registrar técnico</li>
            <li>Editar técnico</li>
            <li>Ver técnico</li>
            <li>Especialidades y contacto</li>
          </ul>

          <p style={{ marginTop: "20px", opacity: 0.7 }}>
            Próximamente añadiremos listado real desde Supabase, búsqueda,
            filtros y asignación a inspecciones.
          </p>
        </div>
      </div>
    </Menu>
  );
}
