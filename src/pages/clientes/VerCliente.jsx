import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function VerCliente() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [cliente, setCliente] = useState(null);
  const [cargando, setCargando] = useState(true);

  const cargarCliente = async () => {
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error cargando cliente:", error);
      alert("Error cargando cliente");
      return;
    }

    setCliente(data);
    setCargando(false);
  };

  useEffect(() => {
    cargarCliente();
  }, []);

  if (cargando) {
    return (
      <div style={{ padding: 16 }}>
        <h1>Cliente</h1>
        <p>Cargando...</p>
      </div>
    );
  }

  if (!cliente) {
    return (
      <div style={{ padding: 16 }}>
        <h1>Cliente</h1>
        <p>No encontrado.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ marginBottom: 16 }}>{cliente.nombre}</h1>

      <div
        style={{
          background: "#1e293b",
          padding: 16,
          borderRadius: 8,
          color: "white",
          marginBottom: 20,
          border: "1px solid #334155",
        }}
      >
        <p><strong>Teléfono:</strong> {cliente.telefono || "—"}</p>
        <p><strong>Email:</strong> {cliente.email || "—"}</p>
        <p><strong>Dirección:</strong> {cliente.direccion || "—"}</p>
        <p><strong>Notas:</strong> {cliente.notas || "—"}</p>
      </div>

      <button
        onClick={() => navigate(`/clientes/editar/${id}`)}
        style={{
          width: "100%",
          padding: "12px 20px",
          background: "#3b82f6",
          color: "white",
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
          marginBottom: 10,
        }}
      >
        Editar Cliente
      </button>

      <button
        onClick={() => navigate("/clientes")}
        style={{
          width: "100%",
          padding: "12px 20px",
          background: "#475569",
          color: "white",
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
        }}
      >
        Volver
      </button>
    </div>
  );
}
