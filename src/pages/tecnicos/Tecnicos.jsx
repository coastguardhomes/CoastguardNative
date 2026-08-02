import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { Link } from "react-router-dom";

export default function Tecnicos() {
  const [tecnicos, setTecnicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    async function cargarTecnicos() {
      const { data, error } = await supabase
        .from("tecnicos")
        .select("id, nombre, telefono, activo")
        .order("created_at", { ascending: false });

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
            marginBottom: "25px",
            color: "#4db8ff",
            textShadow: "0 0 8px rgba(0,153,255,0.6)",
            textAlign: "center",
          }}
        >
          Técnicos
        </h1>

        {mensaje && (
          <p
            style={{
              marginBottom: "15px",
              color: "#4db8ff",
              fontWeight: "600",
            }}
          >
            {mensaje}
          </p>
        )}

        <Link to="/tecnicos/crear">
          <button
            style={{
              marginBottom: "25px",
              padding: "14px",
              width: "100%",
              background: "#4db8ff",
              color: "#000",
              borderRadius: "10px",
              border: "none",
              fontWeight: "700",
              fontSize: "17px",
              cursor: "pointer",
              boxShadow: "0 0 10px rgba(0,153,255,0.4)",
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
          <div>
            {tecnicos.map((t) => (
              <div
                key={t.id}
                style={{
                  marginBottom: "15px",
                  background: "rgba(255,255,255,0.05)",
                  padding: "18px",
                  borderRadius: "14px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  boxShadow: "0 0 12px rgba(0,153,255,0.2)",
                }}
              >
                <Link
                  to={`/tecnicos/ver/${t.id}`}
                  style={{
                    color: "#4db8ff",
                    fontWeight: "700",
                    fontSize: "18px",
                    textDecoration: "none",
                  }}
                >
                  {t.nombre} — {t.telefono || "Sin teléfono"}
                </Link>

                <p style={{ marginTop: "6px", color: t.activo ? "#4ade80" : "#ff6b6b" }}>
                  {t.activo ? "Activo" : "Inactivo"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Menu>
  );
}
