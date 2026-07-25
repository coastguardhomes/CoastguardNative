import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useParams, useNavigate } from "react-router-dom";

export default function Checklist() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    async function cargarChecklist() {
      const { data, error } = await supabase
        .from("checklist")
        .select("*")
        .eq("inspeccion_id", id)
        .order("id", { ascending: true });

      if (error) {
        setMensaje("Error cargando checklist");
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
      setMensaje("Error actualizando ítem");
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
        <div
          style={{
            height: "100vh",
            background: "#0a0f1a",
            color: "#fff",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontFamily: "Inter, sans-serif",
            fontSize: "18px",
          }}
        >
          Cargando checklist...
        </div>
      </Menu>
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
            fontSize: "28px",
            fontWeight: "700",
            textShadow: "0 0 8px rgba(0,153,255,0.6)",
          }}
        >
          Checklist de Inspección
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
          <p>No hay ítems en el checklist.</p>
        ) : (
          <div>
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  marginBottom: "15px",
                  background: "rgba(255,255,255,0.05)",
                  padding: "18px",
                  borderRadius: "14px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  boxShadow: "0 0 12px rgba(0,153,255,0.2)",
                }}
              >
                <p
                  style={{
                    marginBottom: "12px",
                    fontSize: "17px",
                    fontWeight: "600",
                  }}
                >
                  {item.titulo}
                </p>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => actualizarItem(item.id, "ok")}
                    style={{
                      flex: 1,
                      padding: "12px",
                      background:
                        item.estado === "ok"
                          ? "#4db8ff"
                          : "rgba(255,255,255,0.08)",
                      color: "#fff",
                      borderRadius: "10px",
                      border: "none",
                      fontWeight: "700",
                      cursor: "pointer",
                      boxShadow:
                        item.estado === "ok"
                          ? "0 0 10px rgba(0,153,255,0.4)"
                          : "none",
                    }}
                  >
                    ✓ OK
                  </button>

                  <button
                    onClick={() => actualizarItem(item.id, "ko")}
                    style={{
                      flex: 1,
                      padding: "12px",
                      background:
                        item.estado === "ko"
                          ? "red"
                          : "rgba(255,255,255,0.08)",
                      color: "#fff",
                      borderRadius: "10px",
                      border: "none",
                      fontWeight: "700",
                      cursor: "pointer",
                      boxShadow:
                        item.estado === "ko"
                          ? "0 0 10px rgba(255,0,0,0.4)"
                          : "none",
                    }}
                  >
                    ✗ KO
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <h2
          style={{
            marginTop: "30px",
            color: "#4db8ff",
            fontSize: "24px",
            fontWeight: "700",
          }}
        >
          Acciones
        </h2>

        <button
          onClick={() => navigate(`/inspecciones/fotos/${id}`)}
          style={{
            marginTop: "10px",
            padding: "14px",
            width: "100%",
            background: "#4db8ff",
            color: "#000",
            borderRadius: "10px",
            border: "none",
            fontWeight: "700",
            fontSize: "17px",
            cursor: "pointer",
            boxShadow: "0 0 10px rgba(0,153,255,0.4)",
          }}
        >
          Fotos
        </button>

        <button
          onClick={() => navigate(`/inspecciones/firma/${id}`)}
          style={{
            marginTop: "10px",
            padding: "14px",
            width: "100%",
            background: "#4db8ff",
            color: "#000",
            borderRadius: "10px",
            border: "none",
            fontWeight: "700",
            fontSize: "17px",
            cursor: "pointer",
            boxShadow: "0 0 10px rgba(0,153,255,0.4)",
          }}
        >
          Firma del cliente
        </button>

        <button
          onClick={() => navigate(`/inspecciones/pdf/${id}`)}
          style={{
            marginTop: "10px",
            padding: "14px",
            width: "100%",
            background: "#4db8ff",
            color: "#000",
            borderRadius: "10px",
            border: "none",
            fontWeight: "700",
            fontSize: "17px",
            cursor: "pointer",
            boxShadow: "0 0 10px rgba(0,153,255,0.4)",
          }}
        >
          Generar PDF
        </button>
      </div>
    </Menu>
  );
}
