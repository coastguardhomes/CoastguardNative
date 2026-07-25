import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { PRICES } from "../../constants/prices";

export default function ClienteContratoVer() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [contrato, setContrato] = useState(null);
  const [cliente, setCliente] = useState(null);

  const cargarContrato = async () => {
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
        Cargando contrato...
      </div>
    );
  }

  const precioServicio =
    PRICES[contrato.tipoServicio] || "Precio no disponible";

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
        Contrato del Cliente
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
        <h3
          style={{
            color: "#4db8ff",
            marginBottom: "10px",
            fontSize: "20px",
          }}
        >
          Datos del Cliente
        </h3>

        <p><strong>Nombre:</strong> {cliente.nombre}</p>
        <p><strong>Dirección:</strong> {cliente.direccion}</p>
        <p><strong>Teléfono:</strong> {cliente.telefono}</p>
      </div>

      <div
        style={{
          background: "rgba(255,255,255,0.05)",
          padding: "20px",
          borderRadius: "14px",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 0 12px rgba(0,153,255,0.2)",
        }}
      >
        <h3
          style={{
            color: "#4db8ff",
            marginBottom: "10px",
            fontSize: "20px",
          }}
        >
          Detalles del Contrato
        </h3>

        <p><strong>Tipo de servicio:</strong> {contrato.tipoServicio}</p>
        <p><strong>Precio mensual:</strong> {precioServicio} €</p>
        <p><strong>Fecha inicio:</strong> {contrato.fechaInicio}</p>

        <button
          onClick={() => navigate(`/contratos/${id}/editar`)}
          style={{
            padding: "12px",
            width: "100%",
            backgroundColor: "#4db8ff",
            color: "#000",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            marginTop: "20px",
            fontWeight: "700",
            fontSize: "16px",
            boxShadow: "0 0 10px rgba(0,153,255,0.4)",
          }}
        >
          Editar contrato
        </button>
      </div>
    </div>
  );
}
