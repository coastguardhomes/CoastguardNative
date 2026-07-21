import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../supabaseClient";
import { Link } from "react-router-dom";

export default function Viviendas() {
  const [viviendas, setViviendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    async function cargarViviendas() {
      const { data, error } = await supabase
        .from("viviendas")
        .select("*")
        .order("id", { ascending: false });

      if (error) {
        setMensaje("Error cargando viviendas");
        setLoading(false);
        return;
      }

      setViviendas(data || []);
      setLoading(false);
    }

    cargarViviendas();
  }, []);

  return (
    <Menu>
      <div style={{ padding: "20px", color: "#fff" }}>
        <h1 style={{ color: "#4db8ff" }}>Viviendas</h1>

        {mensaje && (
          <p style={{ marginBottom: "15px", color: "#4db8ff" }}>{mensaje}</p>
        )}

        <Link to="/viviendas/crear">
          <button
            style={{
              marginBottom: "20px",
              padding: "12px",
              width: "100%",
              background: "#4db8ff",
              color: "#000",
              borderRadius: "8px",
              border: "none",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Nueva vivienda
          </button>
        </Link>

        {loading ? (
          <p style={{ opacity: 0.8 }}>Cargando...</p>
        ) : viviendas.length === 0 ? (
          <p style={{ opacity: 0.8 }}>No hay viviendas registradas.</p>
        ) : (
          <ul style={{ padding: 0, marginTop: "20px" }}>
            {viviendas.map((v) => (
              <li
                key={v.id}
                style={{
                  marginBottom: "15px",
                  background: "rgba(255,255,255,0.05)",
                  padding: "15px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <Link
                  to={`/viviendas/ver/${v.id}`}
                  style={{ color: "#4db8ff", fontWeight: "600" }}
                >
                  {v.nombre} — {v.direccion}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Menu>
  );
}
