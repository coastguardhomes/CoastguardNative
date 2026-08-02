import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { Link } from "react-router-dom";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    async function cargarClientes() {
      const { data, error } = await supabase
        .from("clientes")
        .select("id, nombre, telefono")
        .order("id", { ascending: false });

      if (error) {
        setMensaje("Error cargando clientes");
        setLoading(false);
        return;
      }

      setClientes(data || []);
      setLoading(false);
    }

    cargarClientes();
  }, []);

  if (loading) {
    return (
      <Menu>
        <div
          style={{
            height: "100vh",
            background: "#0a0f1a",
            color: "#fff",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "18px",
            fontFamily: "Inter, sans-serif",
          }}
        >
          Cargando clientes...
        </div>
      </Menu>
    );
  }

  return (
    <Menu>
      <div
        style={{
          padding: "20px",
          color: "#fff",
          background: "#0a0f1a",
          minHeight: "100vh",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <h1
          style={{
            color: "#4db8ff",
            marginBottom: "20px",
            textShadow: "0 0 8px rgba(0,153,255,0.6)",
          }}
        >
          Clientes
        </h1>

        {mensaje && (
          <p style={{ color: "#4db8ff", marginBottom: "15px" }}>{mensaje}</p>
        )}

        <Link to="/clientes/crear">
          <button
            style={{
              marginBottom: "20px",
              width: "100%",
              padding: "12px",
              background: "#4db8ff",
              color: "#000",
              borderRadius: "8px",
              border: "none",
              fontWeight: "700",
              cursor: "pointer",
              boxShadow: "0 0 10px rgba(0,153,255,0.4)",
            }}
          >
            Nuevo cliente
          </button>
        </Link>

        {clientes.length === 0 ? (
          <p style={{ color: "#4db8ff" }}>No hay clientes registrados.</p>
        ) : (
          <div>
            {clientes.map((c) => (
              <div
                key={c.id}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  padding: "15px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  boxShadow: "0 0 12px rgba(0,153,255,0.2)",
                  marginBottom: "15px",
                }}
              >
                <Link
                  to={`/clientes/ver/${c.id}`}
                  style={{
                    color: "#4db8ff",
                    fontSize: "18px",
                    fontWeight: "600",
                    textDecoration: "none",
                  }}
                >
                  {c.nombre}
                </Link>

                <p style={{ marginTop: "6px", color: "#ccc" }}>
                  {c.telefono}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Menu>
  );
}
