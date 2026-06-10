import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LayoutWithMenu from "../../layouts/LayoutWithMenu.jsx";
import { supabase } from "../../lib/supabase";

export default function VerCliente() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarCliente = async () => {
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error cargando cliente:", error);
        setLoading(false);
        return;
      }

      setCliente(data);
      setLoading(false);
    };

    cargarCliente();
  }, [id]);

  if (loading) {
    return (
      <LayoutWithMenu>
        <div style={{ padding: 16 }}>
          <p>Cargando cliente...</p>
        </div>
      </LayoutWithMenu>
    );
  }

  if (!cliente) {
    return (
      <LayoutWithMenu>
        <div style={{ padding: 16 }}>
          <p>No se encontró el cliente.</p>
        </div>
      </LayoutWithMenu>
    );
  }

  return (
    <LayoutWithMenu>
      <div style={{ padding: 16 }}>
        <h1 style={{ marginBottom: 16 }}>{cliente.nombre}</h1>

        <div
          style={{
            background: "#1e293b",
            padding: 16,
            borderRadius: 8,
            border: "1px solid #334155",
            color: "white",
            marginBottom: 20,
          }}
        >
          <p><strong>Teléfono:</strong> {cliente.telefono}</p>
          <p><strong>Email:</strong> {cliente.email}</p>
          <p><strong>Dirección:</strong> {cliente.direccion}</p>
        </div>

        <button
          onClick={() => navigate(`/clientes/${id}/editar`)}
          style={{
            padding: "12px 20px",
            background: "#2563eb",
            color: "white",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            width: "100%",
            marginBottom: 12,
          }}
        >
          Editar cliente
        </button>

        <button
          onClick={() => navigate("/clientes")}
          style={{
            padding: "12px 20px",
            background: "#475569",
            color: "white",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            width: "100%",
          }}
        >
          Volver
        </button>
      </div>
    </LayoutWithMenu>
  );
}
