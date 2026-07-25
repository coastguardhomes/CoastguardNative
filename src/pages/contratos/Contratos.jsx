import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";

export default function Contratos() {
  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarContratos() {
      const { data, error } = await supabase
        .from("contratos")
        .select("*")
        .order("id", { ascending: false });

      if (!error) setContratos(data);
      setLoading(false);
    }

    cargarContratos();
  }, []);

  return (
    <Menu>
      <div
        style={{
          padding: "20px",
          background: "#0a0f1a",
          minHeight: "100vh",
          color: "#fff",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "700",
            marginBottom: "20px",
            color: "#4db8ff",
            textShadow: "0 0 8px rgba(0,153,255,0.6)",
          }}
        >
          Contratos
        </h1>

        {loading ? (
          <p
            style={{
              textAlign: "center",
              fontSize: "18px",
              opacity: 0.8,
            }}
          >
            Cargando contratos...
          </p>
        ) : contratos.length === 0 ? (
          <p
            style={{
              textAlign: "center",
              fontSize: "16px",
              opacity: 0.8,
            }}
          >
            No hay contratos registrados.
          </p>
        ) : (
          <div>
            {contratos.map((c) => (
              <div
                key={c.id}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  padding: "18px",
                  borderRadius: "14px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  boxShadow: "0 0 12px rgba(0,153,255,0.2)",
                  marginBottom: "15px",
                }}
              >
                <p style={{ marginBottom: "6px" }}>
                  <strong style={{ color: "#4db8ff" }}>Contrato:</strong> #{c.id}
                </p>

                <p style={{ marginBottom: "6px" }}>
                  <strong style={{ color: "#4db8ff" }}>Fecha:</strong> {c.fecha}
                </p>

                <p>
                  <strong style={{ color: "#4db8ff" }}>Precio:</strong>{" "}
                  {c.precio} €
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Menu>
  );
}
