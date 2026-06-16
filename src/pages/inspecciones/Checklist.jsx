import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";

export default function Checklist() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);

  const cargarChecklist = async () => {
    const { data, error } = await supabase
      .from("checklist_inspeccion")
      .select("*")
      .eq("inspeccion_id", id);

    if (error) {
      console.error("Error cargando checklist:", error);
      return;
    }

    setItems(data || []);
  };

  const actualizarItem = async (itemId, nuevoEstado) => {
    const { error } = await supabase
      .from("checklist_inspeccion")
      .update({ completado: nuevoEstado })
      .eq("id", itemId);

    if (error) {
      console.error("Error actualizando item:", error);
      return;
    }

    cargarChecklist();
  };

  useEffect(() => {
    cargarChecklist();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Checklist de Inspección</h2>

      {items.length === 0 && <p>No hay elementos en el checklist.</p>}

      {items.map((item) => (
        <div
          key={item.id}
          style={{
            padding: 12,
            marginBottom: 10,
            border: "1px solid #ccc",
            borderRadius: 6,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{item.descripcion}</span>

          <input
            type="checkbox"
            checked={item.completado}
            onChange={(e) => actualizarItem(item.id, e.target.checked)}
          />
        </div>
      ))}

      <button
        onClick={() => navigate(`/inspecciones/detalle/${id}`)}
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
