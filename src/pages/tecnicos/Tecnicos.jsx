import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../supabaseClient";
import { Link } from "react-router-dom";

export default function Tecnicos() {
  const [tecnicos, setTecnicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    async function cargarTecnicos() {
      const { data, error } = await supabase
        .from("tecnicos")
        .select("*")
        .order("id", { ascending: false });

      if (error) {
        setMensaje("Error cargando técnicos");
        setLoading(false);
        return;
      }

      setTecnicos(data || []);
      setLoading(false);
    }

    cargarTecnicos();
  }, []);

  return (
    <Menu>
      <div style={{ padding: "20px", color: "#fff" }}>
        <h1 style={{ color: "#4db8ff" }}>Técnicos</h1>

        {mensaje && (
          <p style={{ marginBottom: "15px", color: "#4db8ff" }}>{mensaje}</p>
        )}

        <Link to="/tecnicos/crear">
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
            Nuevo técnico
          </button>
        </Link>

        {loading ? (
          <p style={{ opacity: 0.8 }}>Cargando...</p>
        ) : tecnicos.length === 0 ? (
          <p style={{ opacity: 0.8 }}>No hay técnicos registrados.</p>
        ) : (
          <ul style={{ padding: 0, marginTop: "20px" }}>
            {tecnicos.map((t) => (
              <li
                key={t.id}
                style={{
                  marginBottom: "15px",
                  background: "rgba(255,255,255,0.05)",
                  padding: "15px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <Link
                  to={`/tecnicos/ver/${t.id}`}
                  style={{ color: "#4db8ff", fontWeight: "600" }}
                >
                  {t.nombre} — {t.telefono}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Menu>
  );
}
