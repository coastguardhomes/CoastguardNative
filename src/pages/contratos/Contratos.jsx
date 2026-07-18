import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../supabaseClient";

export default function Contratos() {
  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarContratos() {
      const { data, error } = await supabase
        .from("contratos")
        .select("*")
        .order("id", { ascending: false });

      if (error) {
        console.error("Error cargando contratos:", error);
      } else {
        setContratos(data);
      }

      setLoading(false);
    }

    cargarContratos();
  }, []);

  return (
    <Menu>
      <div style={{ padding: "20px", color: "#fff", fontFamily: "Inter, sans-serif" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "20px", color: "#4db8ff" }}>
          Contratos
        </h1>

        {loading ? (
          <p>Cargando contratos...</p>
        ) : contratos.length === 0 ? (
          <p>No hay contratos registrados.</p>
        ) : (
          <ul style={{ marginTop: "20px", lineHeight: "1.8" }}>
            {contratos.map((c) => (
              <li key={c.id}>
                <strong>Contrato #{c.id}</strong> — {c.fecha} — {c.precio}€
              </li>
            ))}
          </ul>
        )}
      </div>
    </Menu>
  );
}
