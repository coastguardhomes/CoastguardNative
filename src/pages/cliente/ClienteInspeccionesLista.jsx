import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext.jsx";

export default function ClienteInspeccionesLista() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [inspecciones, setInspecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    async function cargar() {
      if (!user) return;

      // RLS (inspecciones_select_cliente) ya limita esto a las
      // inspecciones de las viviendas del cliente logueado.
      const { data, error } = await supabase
        .from("inspecciones")
        .select(
          "id, fecha, estado, vivienda_id, viviendas(direccion, ciudad)"
        )
        .order("fecha", { ascending: false });

      if (error) {
        setMensaje("Error cargando inspecciones");
        setLoading(false);
        return;
      }

      setInspecciones(data || []);
      setLoading(false);
    }

    cargar();
  }, [user]);

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
          Mis Inspecciones
        </h1>

        {mensaje && (
          <p style={{ textAlign: "center", color: "#4db8ff", marginBottom: 15 }}>
            {mensaje}
          </p>
        )}

        {loading ? (
          <p style={{ textAlign: "center", opacity: 0.8 }}>Cargando...</p>
        ) : inspecciones.length === 0 ? (
          <p style={{ textAlign: "center", opacity: 0.8 }}>
            No hay inspecciones registradas.
          </p>
        ) : (
          inspecciones.map((i) => (
            <div
              key={i.id}
              onClick={() => navigate(`/cliente/inspeccion/${i.id}`)}
              style={{
                background: "rgba(255,255,255,0.05)",
                padding: "18px",
                borderRadius: "14px",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 0 12px rgba(0,153,255,0.2)",
                marginBottom: "15px",
                cursor: "pointer",
              }}
            >
              <p style={{ marginBottom: 6 }}>
                <strong style={{ color: "#4db8ff" }}>Dirección:</strong>{" "}
                {i.viviendas?.direccion || "Sin dirección"}
              </p>
              <p style={{ marginBottom: 6 }}>
                <strong style={{ color: "#4db8ff" }}>Fecha:</strong>{" "}
                {i.fecha ? new Date(i.fecha).toLocaleDateString() : "Sin fecha"}
              </p>
              <p>
                <strong style={{ color: "#4db8ff" }}>Estado:</strong> {i.estado}
              </p>
            </div>
          ))
        )}
      </div>
    </Menu>
  );
}
