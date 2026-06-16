import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import supabase from "../../supabaseClient";

export default function DetalleInspeccion() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [inspeccion, setInspeccion] = useState(null);
  const [loading, setLoading] = useState(true);

  // ============================
  // CARGAR INSPECCIÓN
  // ============================
  const cargarInspeccion = async () => {
    const { data, error } = await supabase
      .from("inspecciones")
      .select("*, clientes(nombre)")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error cargando inspección:", error);
      alert("Error cargando inspección");
      navigate("/inspecciones");
      return;
    }

    setInspeccion(data);
    setLoading(false);
  };

  useEffect(() => {
    cargarInspeccion();
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: 16 }}>
        <h1>Inspección</h1>
        <p>Cargando datos...</p>
      </div>
    );
  }

  if (!inspeccion) {
    return (
      <div style={{ padding: 16 }}>
        <h1>Inspección no encontrada</h1>
        <button
          onClick={() => navigate("/inspecciones")}
          style={{
            marginTop: 20,
            padding: "12px 20px",
            background: "#475569",
            color: "white",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
          }}
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ marginBottom: 16 }}>Detalle de Inspección</h1>

      {/* Tarjeta */}
      <div
        style={{
          padding: 16,
          borderRadius: 10,
          background: "#1e293b",
          border: "1px solid #334155",
          color: "white",
          marginBottom: 20,
        }}
      >
        <p><strong>ID:</strong> {inspeccion.id}</p>
        <p><strong>Cliente:</strong> {inspeccion.clientes?.nombre || "Sin cliente"}</p>
        <p><strong>Fecha:</strong> {inspeccion.fecha}</p>
        <p>
          <strong>Estado:</strong>{" "}
          <span
            style={{
              color:
                inspeccion.estado === "completada"
                  ? "#22c55e"
                  : inspeccion.estado === "en_proceso"
                  ? "#3b82f6"
                  : "#facc15",
              fontWeight: "bold",
            }}
          >
            {inspeccion.estado?.toUpperCase()}
          </span>
        </p>
      </div>

      {/* Botones */}
      <button
        onClick={() => navigate(`/inspecciones/editar/${id}`)}
        style={{
          width: "100%",
          padding: "12px 20px",
          background: "#2563eb",
          color: "white",
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
          marginBottom: 12,
        }}
      >
        Editar Inspección
      </button>

      <button
        onClick={() => navigate(`/inspecciones/${id}/checklist`)}
        style={{
          width: "100%",
          padding: "12px 20px",
          background: "#0ea5e9",
          color: "white",
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
          marginBottom: 12,
        }}
      >
        Checklist
      </button>

      <button
        onClick={() => navigate(`/inspecciones/${id}/fotos`)}
        style={{
          width: "100%",
          padding: "12px 20px",
          background: "#14b8a6",
          color: "white",
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
          marginBottom: 12,
        }}
      >
        Fotos
      </button>

      <button
        onClick={() => navigate(`/inspecciones/${id}/firma`)}
        style={{
          width: "100%",
          padding: "12px 20px",
          background: "#22c55e",
          color: "white",
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
          marginBottom: 12,
        }}
      >
        Firma del Cliente
      </button>

      <button
        onClick={() => navigate(`/inspecciones/${id}/pdf`)}
        style={{
          width: "100%",
          padding: "12px 20px",
          background: "#9333ea",
          color: "white",
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
          marginBottom: 12,
        }}
      >
        Ver PDF
      </button>

      <button
        onClick={() => navigate("/inspecciones")}
        style={{
          width: "100%",
          padding: "12px 20px",
          background: "#475569",
          color: "white",
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
        }}
      >
        Volver
      </button>
    </div>
  );
}
