import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LayoutWithMenu from "../../layouts/LayoutWithMenu.jsx";
import { supabase } from "../../lib/supabase";

export default function ClientesHome() {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarClientes = async () => {
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .order("id", { ascending: false });

      if (error) {
        console.error("Error cargando clientes:", error);
        setLoading(false);
        return;
      }

      setClientes(data || []);
      setLoading(false);
    };

    cargarClientes();
  }, []);

  return (
    <LayoutWithMenu>
      <div style={{ padding: 16 }}>
        <h1 style={{ marginBottom: 16 }}>Clientes</h1>

        {loading && <p>Cargando clientes...</p>}

        {!loading && clientes.length === 0 && (
          <p>No hay clientes registrados.</p>
        )}

        <ul style={{ listStyle: "none", padding: 0 }}>
          {clientes.map((c) => (
            <li
              key={c.id}
              onClick={() => navigate(`/clientes/${c.id}`)}
              style={{
                padding: 12,
                border: "1px solid #334155",
                borderRadius: 8,
                marginBottom: 10,
                background: "#1e293b",
                color: "#e2e8f0",
                cursor: "pointer",
              }}
            >
              <strong style={{ fontSize: 18 }}>{c.nombre}</strong>
              <br />
              <span style={{ opacity: 0.8 }}>{c.telefono}</span>
            </li>
          ))}
        </ul>

        <button
          onClick={() => navigate("/clientes/nuevo")}
          style={{
            marginTop: 20,
            padding: "12px 20px",
            background: "#2563eb",
            color: "white",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            width: "100%",
            fontSize: 16,
          }}
        >
          + Nuevo Cliente
        </button>
      </div>
    </LayoutWithMenu>
  );
}
