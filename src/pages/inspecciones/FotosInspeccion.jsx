import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LayoutWithMenu from "../../layouts/LayoutWithMenu.jsx";
import { supabase } from "../../lib/supabase";

export default function FotosInspeccion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fotos, setFotos] = useState([]);

  useEffect(() => {
    const cargarFotos = async () => {
      const { data, error } = await supabase
        .from("fotos_inspeccion")
        .select("*")
        .eq("inspeccion_id", id);

      if (error) {
        console.error("Error cargando fotos:", error);
        return;
      }

      setFotos(data);
    };

    cargarFotos();
  }, [id]);

  return (
    <LayoutWithMenu>
      <div style={{ padding: 20 }}>
        <h2>Fotos de la Inspección</h2>

        {fotos.length === 0 && <p>No hay fotos disponibles.</p>}

        <div style={{ display: "grid", gap: 10 }}>
          {fotos.map((foto) => (
            <img
              key={foto.id}
              src={foto.url}
              alt="Foto inspección"
              style={{ width: "100%", borderRadius: 8 }}
            />
          ))}
        </div>

        <button onClick={() => navigate(-1)}>Volver</button>
      </div>
    </LayoutWithMenu>
  );
}
