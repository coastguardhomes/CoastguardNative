import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
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
          Viviendas
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

        <Link to="/viviendas/crear">
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
            Nueva vivienda
          </button>
        </Link>

        {loading ? (
          <p style={{ opacity: 0.8 }}>Cargando...</p>
        ) : viviendas.length === 0 ? (
          <p style={{ opacity: 0.8 }}>No hay viviendas registradas.</p>
        ) : (
          <div>
            {viviendas.map((v) => (
              <div
                key={v.id}
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
                  to={`/viviendas/ver/${v.id}`}
                  style={{
                    color: "#4db8ff",
                    fontWeight: "700",
                    fontSize: "18px",
                  }}
                >
                  {v.nombre} — {v.direccion}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </Menu>
  );
}
