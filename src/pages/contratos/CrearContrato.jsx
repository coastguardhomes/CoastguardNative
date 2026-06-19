import React from "react";
import Menu from "../../layouts/Menu";

export default function CrearContrato() {
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
          Crear Contrato
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
            Aquí podrás crear un nuevo contrato para un cliente.
          </p>

          <ul style={{ marginTop: "20px", lineHeight: "1.8" }}>
            <li>Seleccionar cliente</li>
            <li>Seleccionar vivienda</li>
            <li>Elegir tipo de contrato</li>
            <li>Configurar precios</li>
            <li>Guardar contrato</li>
          </ul>

          <p style={{ marginTop: "20px", opacity: 0.7 }}>
            Próximamente añadiremos formulario real, validaciones y guardado en Supabase.
          </p>
        </div>
      </div>
    </Menu>
  );
}
