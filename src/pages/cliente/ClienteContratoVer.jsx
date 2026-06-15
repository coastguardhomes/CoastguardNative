import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import supabase from "../../supabaseClient";

export default function ClienteContratoVer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contrato, setContrato] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      const { data, error } = await supabase
        .from("contratos")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
        return;
      }

      setContrato(data);
    };

    cargar();
  }, [id]);

  if (!contrato) return <p style={{ padding: 20 }}>Cargando contrato...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Contrato #{contrato.id}</h2>

      <p><strong>Cliente:</strong> {contrato.nombre_cliente}</p>
      <p><strong>Dirección:</strong> {contrato.direccion}</p>
      <p><strong>Estado:</strong> {contrato.estado}</p>

      {/* Botón para firmar */}
      <button
        onClick={() => navigate(`/contratos/firma/${id}`)}
        style={{
          marginTop: 20,
          background: "#007bff",
          color: "white",
          padding: "10px 20px",
          borderRadius: 8,
          display: "block",
        }}
      >
        Firmar contrato
      </button>

      {/* Botón para generar PDF si no existe */}
      {!contrato.pdf_url && (
        <button
          onClick={() => navigate(`/cliente/contrato/generar-pdf/${id}`)}
          style={{
            marginTop: 20,
            background: "#28a745",
            color: "white",
            padding: "10px 20px",
            borderRadius: 8,
            display: "block",
          }}
        >
          Generar PDF
        </button>
      )}

      {/* Botón para ver PDF si ya existe */}
      {contrato.pdf_url && (
        <button
          onClick={() => navigate(`/cliente/contrato/pdf/${id}`)}
          style={{
            marginTop: 20,
            background: "#6c63ff",
            color: "white",
            padding: "10px 20px",
            borderRadius: 8,
            display: "block",
          }}
        >
          Ver PDF
        </button>
      )}
    </div>
  );
}
