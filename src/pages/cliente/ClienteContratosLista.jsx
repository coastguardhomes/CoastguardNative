import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";

export default function ClienteContratosLista() {
  const navigate = useNavigate();
  const [contratos, setContratos] = useState([]);

  const cargarContratos = async () => {
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .order("nombre", { ascending: true });

    if (error) {
      console.error("Error cargando contratos:", error);
      return;
    }

    setContratos(data || []);
  };

  useEffect(() => {
    cargarContratos();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Contratos de Clientes</h2>

      {contratos.length === 0 && <p>No hay contratos registrados.</p>}

      {contratos.map((cliente) => (
        <div
          key={cliente.id}
          style={{
            padding: 12,
            marginBottom: 10,
            border: "1px solid #ccc",
            borderRadius: 6,
            cursor: "pointer",
          }}
          onClick={() => navigate(`/cliente/${cliente.id}/contrato`)}
        >
          <p><strong>Cliente:</strong> {cliente.nombre}</p>
          <p><strong>Dirección:</strong> {cliente.direccion}</p>
          <p><strong>Servicio:</strong> {cliente.tipoServicio}</p>
        </div>
      ))}
    </div>
  );
}
