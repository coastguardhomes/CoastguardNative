import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";

export default function DetalleInspeccion() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [inspeccion, setInspeccion] = useState(null);

  const cargarInspeccion = async () => {
    const { data, error } = await supabase
      .from("inspecciones")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error cargando inspección:", error);
      return;
    }

    setInspeccion(data);
  };

  useEffect(() => {
    cargarInspeccion();
  }, []);

  if (!inspeccion) {
    return <p style={{ padding: 20 }}>Cargando inspección...</p>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Detalle de Inspección</h2>

      <p><strong>Cliente:</strong> {inspeccion.cliente}</p>
      <p><strong>Fecha:</strong> {inspeccion.fecha}</p>
      <p><strong>Estado:</strong> {inspeccion.estado}</p>

      <button
        onClick={() => navigate(`/inspecciones/editar/${id}`)}
        style={{
          padding: "10px 16px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          marginTop: "12px",
        }}
      >
        Editar inspección
      </button>
    </div>
  );
}
