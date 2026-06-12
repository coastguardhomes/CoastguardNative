import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function Clientes() {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  const cargarClientes = async () => {
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .order("nombre", { ascending: true });

    if (error) {
      console.error("Error cargando clientes:", error);
      alert("Error cargando clientes");
      return;
    }

    setClientes(data);
    setCargando(false);
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  const clientesFiltrados = clientes.filter((c) =>
    c.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (cargando) {
    return (
      <div style={{ padding: 16 }}>
        <h1>Clientes</h1>
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ marginBottom: 16 }}>Clientes</h1>

      <input
        type="text"
        placeholder="Buscar cliente..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 8,
          border: "1px solid #334155",
          marginBottom: 20,
        }}
      />

      {clientesFiltrados.length === 0 ? (
        <p>No hay clientes.</p>
      ) : (
        clientesFiltrados.map((cliente) => (
          <div
            key={cliente.id}
            onClick={() => navigate(`/clientes/${cliente.id}`)}
            style={{
              background: "#1e293b",
              padding: 16,
              borderRadius: 8,
              marginBottom: 12,
              color: "white",
              cursor: "pointer",
              border: "1px solid #334155",
            }}
          >
            <h3 style={{ margin: 0 }}>{cliente.nombre}</h3>
            <p style={{ margin: 0, opacity: 0.7 }}>{cliente.telefono}</p>
          </div>
        ))
      )}

      <button
        onClick={() => navigate("/clientes/nuevo")}
        style={{
          width: "100%",
          padding: "12px 20px",
          background: "#22c55e",
          color: "white",
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
          marginTop: 20,
        }}
      >
        Nuevo Cliente
      </button>
    </div>
  );
}
