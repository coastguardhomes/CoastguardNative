import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useParams, Link } from "react-router-dom";
import Menu from "../../layouts/Menu";

export default function TecnicoChecklist() {
  const { id } = useParams(); // ID de la inspección
  const [items, setItems] = useState([]);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    cargarChecklist();
  }, [id]);

  async function cargarChecklist() {
    const { data, error } = await supabase
      .from("checklist_inspeccion")
      .select("id, inspeccion_id, texto, estado")
      .eq("inspeccion_id", id)
      .order("id", { ascending: true });

    if (error) {
      setMensaje("Error cargando checklist");
      return;
    }

    setItems(data || []);
  }

  async function marcarItem(itemId, nuevoEstado) {
    const { error } = await supabase
      .from("checklist_inspeccion")
      .update({ estado: nuevoEstado })
      .eq("id", itemId);

    if (error) {
      setMensaje("Error guardando el estado");
      return;
    }

    // Actualizar en pantalla
    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId ? { ...i, estado: nuevoEstado } : i
      )
    );
  }

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
            color: "#4db8ff",
            marginBottom: "25px",
            fontSize: "26px",
            fontWeight: "700",
            textShadow: "0 0 8px rgba(0,153,255,0.6)",
            textAlign: "center",
          }}
        >
          Checklist de la inspección
        </h1>

        {mensaje && (
          <p
            style={{
              marginBottom: "15px",
              color: "#4db8ff",
              fontWeight: "600",
            }}
          >
            {mensaje}
          </p>
        )}

        {items.length === 0 ? (
          <p style={{ opacity: 0.7 }}>No hay ítems en el checklist.</p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              style={{
                background: "rgba(255,255,255,0.05)",
                padding: "15px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.1)",
                marginBottom: "15px",
              }}
            >
              <p
                style={{
                  marginBottom: "10px",
                  fontSize: "16px",
                  fontWeight: "600",
                }}
              >
                {item.texto}
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                }}
              >
                <button
                  onClick={() => marcarItem(item.id, "ok")}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: item.estado === "ok" ? "#4ade80" : "#1e1e1e",
                    color: "#fff",
                    borderRadius: "10px",
                    border: "none",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  OK
                </button>

                <button
                  onClick={() => marcarItem(item.id, "ko")}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: item.estado === "ko" ? "#ff6b6b" : "#1e1e1e",
                    color: "#fff",
                    borderRadius: "10px",
                    border: "none",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  KO
                </button>
              </div>
            </div>
          ))
        )}

        {/* Botones de navegación */}
        <Link to={`/tecnico/inspeccion/${id}`}>
          <button
            style={{
              marginTop: "20px",
              padding: "14px",
              width: "100%",
              background: "#4db8ff",
              color: "#000",
              borderRadius: "10px",
              border: "none",
              fontWeight: "700",
              fontSize: "17px",
              cursor: "pointer",
            }}
          >
            Volver a la inspección
          </button>
        </Link>

        <Link to={`/tecnico/inspeccion/${id}/fotos`}>
          <button
            style={{
              marginTop: "15px",
              padding: "14px",
              width: "100%",
              background: "#1e90ff",
              color: "#fff",
              borderRadius: "10px",
              border: "none",
              fontWeight: "700",
              fontSize: "17px",
              cursor: "pointer",
            }}
          >
            Fotos
          </button>
        </Link>

        <Link to={`/tecnico/inspeccion/${id}/finalizar`}>
          <button
            style={{
              marginTop: "15px",
              padding: "14px",
              width: "100%",
              background: "#4ade80",
              color: "#000",
              borderRadius: "10px",
              border: "none",
              fontWeight: "700",
              fontSize: "17px",
              cursor: "pointer",
            }}
          >
            Finalizar inspección
          </button>
        </Link>
      </div>
    </Menu>
  );
}
