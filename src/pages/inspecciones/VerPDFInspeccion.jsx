import React from "react";
import Menu from "../../layouts/Menu";

export default function VerPDFInspeccion() {
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
          PDF de la Inspección
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
            Aquí podrás visualizar el PDF generado de la inspección.
          </p>

          <ul style={{ marginTop: "20px", lineHeight: "1.8" }}>
            <li>Visor de PDF integrado</li>
            <li>Zoom y navegación</li>
            <li>Descarga del PDF</li>
            <li>Recarga automática</li>
            <li>Sincronización con Supabase</li>
          </ul>

          <p style={{ marginTop: "20px", opacity: 0.7 }}>
            Próximamente añadiremos visor real, carga desde Supabase,
            manejo de errores, loader premium y descarga directa.
          </p>
        </div>
      </div>
    </Menu>
  );
}
