import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { PRICES } from "../../constants/prices";

export default function ClienteContratoVer() {
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
    return <p style={{ padding: 20 }}>Cargando contrato...</p>;
  }

  const precioServicio =
    PRICES[cliente.tipoServicio] || "Precio no disponible";

  return (
    <div style={{ padding: 20 }}>
      <h2>Contrato del Cliente</h2>

      <p><strong>Nombre:</strong> {cliente.nombre}</p>
      <p><strong>Dirección:</strong> {cliente.direccion}</p>
      <p><strong>Teléfono:</strong> {cliente.telefono}</p>

      <h3>Detalles del Servicio</h3>
      <p><strong>Tipo:</strong> {cliente.tipoServicio}</p>
      <p><strong>Precio mensual:</strong> {precioServicio} €</p>
      <p><strong>Fecha inicio:</strong> {cliente.fechaInicio}</p>

      <button
        onClick={() => navigate(`/cliente/${id}/editar`)}
        style={{
          padding: "10px 16px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          marginTop: 12,
        }}
      >
        Editar contrato
      </button>
    </div>
  );
}
