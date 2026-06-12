import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function Checklist() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarChecklist = async () => {
    const { data, error } = await supabase
      .from("checklist")
      .select("*")
      .eq("inspeccion_id", id)
      .order("id", { ascending: true });

    if (error) {
      console.error("Error cargando checklist:", error);
      alert("Error cargando checklist");
      return;
    }

    setItems(data || []);
    setLoading(false);
  };

  const toggleEstado = async (item) => {
    const nuevoEstado = !item.estado;

    const { error } = await supabase
      .from("checklist")
      .update({ estado: nuevoEstado })
      .eq("id", item.id);

    if (error) {
      console.error("Error actualizando checklist:", error);
      alert("Error actualizando elemento");
      return;
    }

    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id ? { ...i, estado: nuevoEstado } : i
      )
    );
  };

  useEffect(() => {
    cargarChecklist();
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: 16 }}>
        <h1>Checklist</h1>
        <p>Cargando checklist...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ marginBottom: 16 }}>Checklist</h1>

      {items.length === 0 && (
        <p style={{ color: "#94a3b8" }}>
          No hay elementos en el checklist.
        </p>
      )}

      <div style={{ marginTop: 10 }}>
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              background: "#1e293b",
              padding: 14,
              borderRadius: 8,
              border: "1px solid #334155",
              marginBottom: 12,
              color: "white",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>{item.nombre}</span>
            <button
              onClick={() => toggleEstado(item)}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                background: item.estado ? "#22c55e" : "#ef4444",
                color: "white",
                fontWeight: "bold",
              }}
            >
              {item.estado ? "OK" : "Fallo"}
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate(`/inspecciones/${id}`)}
        style={{
          display: "block",
          marginTop: 20,
          padding: "12px 20px",
          background: "#2563eb",
          color: "white",
          borderRadius: 8,
          border: "none",
          textAlign: "center",
          width: "100%",
          cursor: "pointer",
        }}
      >
        Volver
      </button>
    </div>
  );
}
