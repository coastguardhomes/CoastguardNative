import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";

export default function VerContrato() {
  const { id } = useParams();
  const [contrato, setContrato] = useState(null);

  useEffect(() => {
    async function cargar() {
      const { data, error } = await supabase
        .from("contratos")
        .select("*")
        .eq("id", id)
        .single();

      if (!error) setContrato(data);
    }
    cargar();
  }, [id]);

  if (!contrato) {
    return (
      <Menu>
        <p style={{ padding: "20px", color: "#fff" }}>Cargando contrato...</p>
      </Menu>
    );
  }

  return (
    <Menu>
      <div
        style={{
          padding: "20px",
          background: "rgba(255,255,255,0.05)",
          borderRadius: "12px",
          border: "1px solid rgba(255,255,255,0.2)",
          color: "#fff",
        }}
      >
        <h1
          style={{
            marginBottom: "20px",
            color: "#4db8ff",
            fontWeight: "700",
            fontSize: "24px",
          }}
        >
          Contrato #{contrato.id}
        </h1>

        <p style={{ marginBottom: "10px" }}>
          <strong style={{ color: "#4db8ff" }}>Fecha:</strong> {contrato.fecha}
        </p>

        <p style={{ marginBottom: "10px" }}>
          <strong style={{ color: "#4db8ff" }}>Precio:</strong> {contrato.precio} €
        </p>

        <button
          style={{
            marginTop: "20px",
            padding: "12px 20px",
            background: "#4db8ff",
            borderRadius: "10px",
            border: "none",
            color: "#000",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          Descargar PDF
        </button>
      </div>
    </Menu>
  );
}
