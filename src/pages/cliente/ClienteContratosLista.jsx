import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { PRICES } from "../../constants/prices";

export default function ClienteContratosLista() {
  const navigate = useNavigate();
  const [contratos, setContratos] = useState([]);

  const cargarContratos = async () => {
    const { data: contratosData, error: contratosError } = await supabase
      .from("contratos")
      .select("*")
      .order("id", { ascending: false });

    if (contratosError) {
      console.error("Error cargando contratos:", contratosError);
      return;
    }

    const { data: clientesData, error: clientesError } = await supabase
      .from("clientes")
      .select("*");

    if (clientesError) {
      console.error("Error cargando clientes:", clientesError);
      return;
    }

    const contratosConCliente = contratosData.map((contrato) => {
      const cliente = clientesData.find((c) => c.id === contrato.cliente_id);
      return {
        ...contrato,
        clienteNombre: cliente?.nombre || "Cliente desconocido",
        clienteDireccion: cliente?.direccion || "Sin dirección",
      };
    });

    setContratos(contratosConCliente);
  };

  useEffect(() => {
    cargarContratos();
  }, []);

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
        Contratos de Clientes
      </h2>

      {contratos.length === 0 && (
        <p
          style={{
            textAlign: "center",
            opacity: 0.8,
            fontSize: "16px",
          }}
        >
          No hay contratos registrados.
        </p>
      )}

      {contratos.map((c) => (
        <div
          key={c.id}
          onClick={() => navigate(`/cliente/contrato/${c.id}`)}
          style={{
            background: "rgba(255,255,255,0.05)",
            padding: "18px",
            borderRadius: "14px",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 0 12px rgba(0,153,255,0.2)",
            marginBottom: "15px",
            cursor: "pointer",
            transition: "transform 0.15s",
          }}
        >
          <p style={{ marginBottom: 6 }}>
            <strong style={{ color: "#4db8ff" }}>Cliente:</strong> {c.clienteNombre}
          </p>

          <p style={{ marginBottom: 6 }}>
            <strong style={{ color: "#4db8ff" }}>Dirección:</strong> {c.clienteDireccion}
          </p>

          <p style={{ marginBottom: 6 }}>
            <strong style={{ color: "#4db8ff" }}>Servicio:</strong> {c.tipoServicio}
          </p>

          <p>
            <strong style={{ color: "#4db8ff" }}>Precio:</strong>{" "}
            {PRICES[c.tipoServicio]} €
          </p>
        </div>
      ))}
    </div>
  );
}
