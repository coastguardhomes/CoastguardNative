import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";

export default function VerContrato() {
  const { id } = useParams();
  const [contrato, setContrato] = useState(null);

  useEffect(() => {
    async function cargar() {
      const { data, error } = await supabase
        .from("contratos")
        .select(
          `
          id,
          cliente_id,
          vivienda_id,
          tecnico_id,
          precio,
          notas,
          frecuencia,
          fecha_inicio,
          pdf_url,
          firma,
          firmado_en
        `
        )
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
          fontFamily: "Inter, sans-serif",
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

        {/* Cliente */}
        <p style={{ marginBottom: "10px" }}>
          <strong style={{ color: "#4db8ff" }}>Cliente ID:</strong>{" "}
          {contrato.cliente_id}
        </p>

        {/* Vivienda */}
        <p style={{ marginBottom: "10px" }}>
          <strong style={{ color: "#4db8ff" }}>Vivienda ID:</strong>{" "}
          {contrato.vivienda_id}
        </p>

        {/* Técnico */}
        <p style={{ marginBottom: "10px" }}>
          <strong style={{ color: "#4db8ff" }}>Técnico ID:</strong>{" "}
          {contrato.tecnico_id}
        </p>

        {/* Fecha inicio */}
        <p style={{ marginBottom: "10px" }}>
          <strong style={{ color: "#4db8ff" }}>Fecha inicio:</strong>{" "}
          {contrato.fecha_inicio || "Sin fecha"}
        </p>

        {/* Precio */}
        <p style={{ marginBottom: "10px" }}>
          <strong style={{ color: "#4db8ff" }}>Precio:</strong>{" "}
          {contrato.precio ? `${contrato.precio} €` : "Sin precio"}
        </p>

        {/* Frecuencia */}
        <p style={{ marginBottom: "10px" }}>
          <strong style={{ color: "#4db8ff" }}>Frecuencia:</strong>{" "}
          {contrato.frecuencia ? `${contrato.frecuencia} días` : "Sin frecuencia"}
        </p>

        {/* Notas */}
        <p style={{ marginBottom: "10px" }}>
          <strong style={{ color: "#4db8ff" }}>Notas:</strong>{" "}
          {contrato.notas || "Sin notas"}
        </p>

        {/* Firma */}
        <p style={{ marginBottom: "10px" }}>
          <strong style={{ color: "#4db8ff" }}>Firmado:</strong>{" "}
          {contrato.firmado_en ? contrato.firmado_en : "No firmado"}
        </p>

        {/* PDF */}
        {contrato.pdf_url ? (
          <a
            href={supabase.storage.from("contratos").getPublicUrl(contrato.pdf_url).data.publicUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
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
                width: "100%",
              }}
            >
              Descargar PDF
            </button>
          </a>
        ) : (
          <p style={{ marginTop: "15px", opacity: 0.8 }}>No hay PDF generado.</p>
        )}

        {/* Editar */}
        <Link to={`/contratos/editar/${contrato.id}`}>
          <button
            style={{
              marginTop: "20px",
              padding: "12px 20px",
              background: "#1e90ff",
              borderRadius: "10px",
              border: "none",
              color: "#fff",
              fontWeight: "700",
              cursor: "pointer",
              width: "100%",
            }}
          >
            Editar contrato
          </button>
        </Link>
      </div>
    </Menu>
  );
}
