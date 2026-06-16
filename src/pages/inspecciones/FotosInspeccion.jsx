import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";

export default function FotosInspeccion() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [fotos, setFotos] = useState([]);

  const cargarFotos = async () => {
    const { data, error } = await supabase
      .from("fotos_inspeccion")
      .select("*")
      .eq("inspeccion_id", id);

    if (error) {
      console.error("Error cargando fotos:", error);
      return;
    }

    setFotos(data || []);
  };

  useEffect(() => {
    cargarFotos();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Fotos de la Inspección</h2>

      {fotos.length === 0 && <p>No hay fotos registradas.</p>}

      {fotos.map((foto) => (
        <div
          key={foto.id}
          style={{
            marginBottom: 20,
            border: "1px solid #ccc",
            padding: 10,
            borderRadius: 6,
          }}
        >
          <img
            src={foto.url}
            alt="Foto inspección"
            style={{ width: "100%", borderRadius: 6 }}
          />
        </div>
      ))}

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
        Volver
      </button>
    </div>
  );
}
