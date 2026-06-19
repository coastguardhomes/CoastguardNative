import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { PRICES } from "../../constants/prices";

export default function ClienteContratosLista() {
  const navigate = useNavigate();
  const [contratos, setContratos] = useState([]);

  const cargarContratos = async () => {
    // 1. Cargar contratos
    const { data: contratosData, error: contratosError } = await supabase
      .from("contratos")
      .select("*")
      .order("id", { ascending: false });

    if (contratosError) {
      console.error("Error cargando contratos:", contratosError);
      return;
    }

    // 2. Cargar clientes asociados
    const { data: clientesData, error: clientesError } = await supabase
      .from("clientes")
      .select("*");

    if (clientesError) {
      console.error("Error cargando clientes:", clientesError);
      return;
    }

    // 3. Combinar datos
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
    <div style={{ padding: 20 }}>
      <h2>Contratos de Clientes</h2>

      {contratos.length === 0 && <p>No hay contratos registrados.</p>}

      {contratos.map((c) => (
        <div
          key={c.id}
          style={{
            padding: 12,
            marginBottom: 10,
            border: "1px solid #ccc",
            borderRadius: 6,
            cursor: "pointer",
          }}
          onClick={() => navigate(`/cliente/contrato/${c.id}`)}
        >
          <p><strong>Cliente:</strong> {c.clienteNombre}</p>
          <p><strong>Dirección:</strong> {c.clienteDireccion}</p>
          <p><strong>Servicio:</strong> {c.tipoServicio}</p>
          <p><strong>Precio:</strong> {PRICES[c.tipoServicio]} €</p>
        </div>
      ))}
    </div>
  );
}
