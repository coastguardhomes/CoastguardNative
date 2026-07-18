import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../supabaseClient";
import { useParams } from "react-router-dom";

export default function Checklist() {
  const { id } = useParams(); // ID de la inspección

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarChecklist() {
      const { data, error } = await supabase
        .from("checklist")
        .select("*")
        .eq("inspeccion_id", id)
        .order("id", { ascending: true });

      if (error) {
        alert("Error cargando checklist");
        return;
      }

      setItems(data || []);
      setLoading(false);
    }

    cargarChecklist();
  }, [id]);

  async function actualizarItem(itemId, nuevoEstado) {
    const { error } = await supabase
      .from("checklist")
      .update({ estado: nuevoEstado })
      .eq("id", itemId);

    if (error) {
      alert("Error actualizando ítem");
      return;
    }

    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId ? { ...i, estado: nuevoEstado } : i
      )
    );
  }

  if (loading) {
    return (
      <Menu>
        <div style={{ padding: 20, color: "#fff" }}>Cargando checklist...</div>
      </Menu>
    );
  }

  return (
    <Menu>
      <div style={{ padding: 20, color: "#fff" }}>
        <h1 style={{ color: "#4db8ff" }}>Checklist de Inspección</h1>

        {items.length === 0 ? (
          <p>No hay ítems en el checklist.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {items.map((item) => (
              <li
                key={item.id}
                style={{
                  marginBottom: 15,
                  background: "rgba(255,255,255,0.05)",
                  padding: 15,
                  borderRadius: 10,
                }}
              >
                <p style={{ marginBottom: 10 }}>{item.titulo}</p>

                <button
                  onClick={() => actualizarItem(item.id, "ok")}
                  style={{
                    marginRight: 10,
                    background: item.estado === "ok" ? "#4db8ff" : "#333",
                    color: "#fff",
                    padding: "8px 12px",
                    borderRadius: 6,
                    border: "none",
                  }}
                >
                  ✓ OK
                </button>

                <button
                  onClick={() => actualizarItem(item.id, "ko")}
                  style={{
                    background: item.estado === "ko" ? "red" : "#333",
                    color: "#fff",
                    padding: "8px 12px",
                    borderRadius: 6,
                    border: "none",
                  }}
                >
                  ✗ KO
                </button>
              </li>
            ))}
          </ul>
        )}

        <h2 style={{ marginTop: 30, color: "#4db8ff" }}>Acciones</h2>

        <a href={`/inspecciones/fotos/${id}`}>
          <button style={{ marginTop: 10 }}>Fotos</button>
        </a>

        <a href={`/inspecciones/firma/${id}`}>
          <button style={{ marginTop: 10 }}>Firma del cliente</button>
        </a>

        <a href={`/inspecciones/pdf/${id}`}>
          <button style={{ marginTop: 10 }}>Generar PDF</button>
        </a>
      </div>
    </Menu>
  );
}
