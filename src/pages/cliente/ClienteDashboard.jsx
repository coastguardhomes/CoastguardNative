import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";

export default function ClienteDashboard() {
  const { id } = useParams(); // ID del cliente
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
    return <p style={{ padding: 20 }}>Cargando cliente...</p>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Panel del Cliente</h2>

      <p><strong>Nombre:</strong> {cliente.nombre}</p>
      <p><strong>Dirección:</strong> {cliente.direccion}</p>
      <p><strong>Teléfono:</strong> {cliente.telefono}</p>

      <button
        onClick={() => navigate(`/cliente/${id}/contratos`)}
        style={{
          background: "#007bff",
          color: "white",
          padding: "10px 20px",
          borderRadius: 8,
          marginTop: 20,
          cursor: "pointer",
        }}
      >
        Ver mis contratos
      </button>
    </div>
  );
}
