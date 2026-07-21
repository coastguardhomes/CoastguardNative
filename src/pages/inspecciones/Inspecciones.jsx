import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../supabaseClient";
import { Link } from "react-router-dom";

export default function Inspecciones() {
  const [inspecciones, setInspecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    async function cargarInspecciones() {
      const { data, error } = await supabase
        .from("inspecciones")
        .select("*")
        .order("id", { ascending: false });

      if (error) {
        setMensaje("Error cargando inspecciones");
        return;
      }

      setInspecciones(data || []);
      setLoading(false);
    }

    cargarInspecciones();
  }, []);

  return (
    <Menu>
      <div
        style={{
          padding: "20px",
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
          Inspecciones
        </h1>

        {mensaje && (
          <p style={{ marginBottom: "15px", color: "#4db8ff" }}>{mensaje}</p>
        )}

        <Link to="/inspecciones/nueva">
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
            Nueva inspección
          </button>
        </Link>

        {loading ? (
          <p style={{ opacity: 0.8 }}>Cargando inspecciones...</p>
        ) : inspecciones.length === 0 ? (
          <p style={{ opacity: 0.8 }}>No hay inspecciones registradas.</p>
        ) : (
          <ul style={{ marginTop: "20px", lineHeight: "1.8", padding: 0 }}>
            {inspecciones.map((i) => (
              <li
                key={i.id}
                style={{
                  marginBottom: "15px",
                  background: "rgba(255,255,255,0.05)",
                  padding: "15px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <Link
                  to={`/inspecciones/ver/${i.id}`}
                  style={{ color: "#4db8ff", fontWeight: "600" }}
                >
                  Inspección #{i.id}
                </Link>

                <p style={{ opacity: 0.8, marginTop: "5px" }}>
                  <strong>Fecha:</strong> {i.fecha}
                </p>

                <p style={{ opacity: 0.8 }}>
                  <strong>Estado:</strong> {i.estado}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Menu>
  );
}
