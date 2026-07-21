 import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";

export default function ClienteDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [cliente, setCliente] = useState(null);

  const cargarCliente = async () => {
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error cargando cliente:", error);
      return;
    }

    setCliente(data);
  };

  useEffect(() => {
    cargarCliente();
  }, []);

  if (!cliente) {
    return (
      <div
        style={{
          height: "100%",
          background: "#0a0f1a",
          color: "#fff",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "Inter, sans-serif",
          fontSize: "18px",
        }}
      >
        Cargando cliente...
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100%",
        background: "#0a0f1a",
        padding: "20px",
        color: "#fff",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          color: "#4db8ff",
          marginBottom: "25px",
          fontSize: "28px",
          fontWeight: "700",
          textShadow: "0 0 8px rgba(0,153,255,0.6)",
        }}
      >
        Panel del Cliente
      </h2>

      <div
        style={{
          background: "rgba(255,255,255,0.05)",
          padding: "20px",
          borderRadius: "14px",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 0 12px rgba(0,153,255,0.2)",
          marginBottom: "20px",
        }}
      >
        <p style={{ marginBottom: 10 }}>
          <strong style={{ color: "#4db8ff" }}>Nombre:</strong> {cliente.nombre}
        </p>

        <p style={{ marginBottom: 10 }}>
          <strong style={{ color: "#4db8ff" }}>Dirección:</strong>{" "}
          {cliente.direccion}
        </p>

        <p style={{ marginBottom: 10 }}>
          <strong style={{ color: "#4db8ff" }}>Teléfono:</strong>{" "}
          {cliente.telefono}
        </p>
      </div>

      <button
        onClick={() => navigate(`/cliente/${id}/contratos`)}
        style={{
          width: "100%",
          padding: "12px",
          backgroundColor: "#4db8ff",
          color: "#000",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "700",
          fontSize: "16px",
          boxShadow: "0 0 10px rgba(0,153,255,0.4)",
        }}
      >
        Ver mis contratos
      </button>
    </div>
  );
}
