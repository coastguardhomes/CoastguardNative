import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { PRICES } from "../../constants/prices";

export default function ClienteContratoVer() {
  const { id } = useParams(); // ID del contrato
  const navigate = useNavigate();

  const [contrato, setContrato] = useState(null);
  const [cliente, setCliente] = useState(null);

  const cargarContrato = async () => {
    // 1. Cargar contrato
    const { data: contratoData, error: contratoError } = await supabase
      .from("contratos")
      .select("*")
      .eq("id", id)
      .single();

    if (contratoError) {
      console.error("Error cargando contrato:", contratoError);
      return;
    }

    setContrato(contratoData);

    // 2. Cargar cliente asociado
    const { data: clienteData, error: clienteError } = await supabase
      .from("clientes")
      .select("*")
      .eq("id", contratoData.cliente_id)
      .single();

    if (clienteError) {
      console.error("Error cargando cliente:", clienteError);
      return;
    }

    setCliente(clienteData);
  };

  useEffect(() => {
    cargarContrato();
  }, []);

  if (!contrato || !cliente) {
    return <p style={{ padding: 20 }}>Cargando contrato...</p>;
  }

  const precioServicio =
    PRICES[contrato.tipoServicio] || "Precio no disponible";

  return (
    <div style={{ padding: 20 }}>
      <h2>Contrato del Cliente</h2>

      <h3>Datos del Cliente</h3>
      <p><strong>Nombre:</strong> {cliente.nombre}</p>
      <p><strong>Dirección:</strong> {cliente.direccion}</p>
      <p><strong>Teléfono:</strong> {cliente.telefono}</p>

      <h3>Detalles del Contrato</h3>
      <p><strong>Tipo de servicio:</strong> {contrato.tipoServicio}</p>
      <p><strong>Precio mensual:</strong> {precioServicio} €</p>
      <p><strong>Fecha inicio:</strong> {contrato.fechaInicio}</p>

      <button
        onClick={() => navigate(`/contratos/${id}/editar`)}
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
