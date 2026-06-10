import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LayoutWithMenu from "../../layouts/LayoutWithMenu.jsx";
import { supabase } from "../../lib/supabase";

export default function DetalleInspeccion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inspeccion, setInspeccion] = useState(null);

  useEffect(() => {
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

    cargarInspeccion();
  }, [id]);

  if (!inspeccion) {
    return (
      <LayoutWithMenu>
        <p style={{ padding: 20 }}>Cargando inspección...</p>
      </LayoutWithMenu>
    );
  }

  return (
    <LayoutWithMenu>
      <div style={{ padding: 20 }}>
        <h2>Detalle de la Inspección</h2>

        <p><strong>ID:</strong> {inspeccion.id}</p>
        <p><strong>Cliente:</strong> {inspeccion.cliente}</p>
        <p><strong>Técnico:</strong> {inspeccion.tecnico}</p>
        <p><strong>Fecha:</strong> {inspeccion.fecha}</p>

        <button onClick={() => navigate(-1)}>Volver</button>
      </div>
    </LayoutWithMenu>
  );
}
