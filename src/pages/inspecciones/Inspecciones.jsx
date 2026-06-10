import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import LayoutWithMenu from "../../layouts/LayoutWithMenu.jsx";
import { supabase } from "../../lib/supabase";

export default function Inspecciones() {
  const [inspecciones, setInspecciones] = useState([]);

  useEffect(() => {
    const cargarInspecciones = async () => {
      const { data, error } = await supabase
        .from("inspecciones")
        .select(`
          id,
          fecha,
          estado,
          pdf_url,
          clientes (
            nombre
          )
        `)
        .order("fecha", { ascending: false });

      if (!error) setInspecciones(data);
    };

    cargarInspecciones();
  }, []);

  const colorEstado = (estado) => {
    switch (estado) {
      case "pendiente":
        return "#facc15";
      case "en_proceso":
        return "#3b82f6";
      case "completada":
        return "#22c55e";
      case "cancelada":
        return "#ef4444";
      default:
        return "#94a3b8";
    }
  };

  return (
    <LayoutWithMenu>
      <div style={{ padding: 16 }}>
        <h1 style={{ marginBottom: 16 }}>Inspecciones</h1>

        {inspecciones.length === 0 && (
          <p style={{ color: "#94a3b8" }}>No hay inspecciones registradas.</p>
        )}

        <div style={{ marginTop: 10 }}>
          {inspecciones.map((i) => (
            <Link
              key={i.id}
              to={`/inspecciones/${i.id}`}
              style={{
                display: "block",
                background: "#1e293b",
                padding: 16,
                borderRadius: 8,
                border: "1px solid #334155",
                marginBottom: 12,
                color: "white",
                textDecoration: "none",
              }}
            >
              <h2 style={{ margin: 0, fontSize: 18 }}>
                {i.clientes?.nombre || "Cliente desconocido"}
              </h2>

              <p style={{ margin: "6px 0 0 0", color: "#cbd5e1" }}>
                Fecha:{" "}
                {i.fecha
                  ? new Date(i.fecha).toLocaleDateString()
                  : "Sin fecha"}
              </p>

              <p
                style={{
                  margin: "4px 0 0 0",
                  color: colorEstado(i.estado),
                  fontWeight: "bold",
                }}
              >
                Estado: {i.estado || "Sin estado"}
              </p>

              {i.pdf_url && (
                <p style={{ margin: "4px 0 0 0", color: "#22c55e" }}>
                  📄 PDF generado
                </p>
              )}
            </Link>
          ))}
        </div>

        <Link
          to="/inspecciones/nueva"
          style={{
            display: "block",
            marginTop: 20,
            padding: "12px 20px",
            background: "#2563eb",
            color: "white",
            borderRadius: 8,
            textAlign: "center",
            textDecoration: "none",
          }}
        >
          Nueva inspección
        </Link>
      </div>
    </LayoutWithMenu>
  );
}
