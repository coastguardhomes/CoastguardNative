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
  const [observaciones, setObservaciones] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    async function cargarChecklist() {
      // 1️⃣ Cargar checklist existente
      const { data, error } = await supabase
        .from("checklist_inspeccion")
        .select("*")
        .eq("inspeccion_id", id)
        .order("id", { ascending: true });

      if (error) {
        console.error("Error cargando checklist:", error);
        setMensaje("Error cargando checklist");
        setLoading(false);
        return;
      }

      // 2️⃣ Si no existe checklist → generarlo automáticamente
      if (!data || data.length === 0) {
        const plantilla = [
          "Puertas y ventanas cerradas",
          "Persianas en posición correcta",
          "Ausencia de humedades",
          "Estado general de la vivienda",
          "Revisión de electrodomésticos",
          "Comprobación de fugas",
        ];

        const nuevosItems = plantilla.map((texto) => ({
          inspeccion_id: id,
          item: texto,
          completado: false,
        }));

        const { error: errorInsert } = await supabase
          .from("checklist_inspeccion")
          .insert(nuevosItems);

        if (errorInsert) {
          console.error("Error generando checklist:", errorInsert);
          setMensaje("No se pudo generar el checklist.");
          setLoading(false);
          return;
        }

        const { data: dataFinal } = await supabase
          .from("checklist_inspeccion")
          .select("*")
          .eq("inspeccion_id", id)
          .order("id", { ascending: true });

        setItems(dataFinal);
      } else {
        setItems(data);
      }

      setLoading(false);
    }

    cargarChecklist();
  }, [id]);

  async function actualizarItem(itemId, completado) {
    const { error } = await supabase
      .from("checklist_inspeccion")
      .update({ completado })
      .eq("id", itemId);

    if (error) {
      console.error("Error actualizando ítem:", error);
      setMensaje("Error actualizando ítem");
      return;
    }

    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, completado } : i))
    );
  }

  async function guardarChecklistCompleto() {
    setGuardando(true);
    setMensaje("");

    try {
      // 1️⃣ Guardar observaciones
      await supabase
        .from("inspecciones")
        .update({
          observaciones,
          checklist_completado: true,
          fecha_checklist: new Date().toISOString(),
        })
        .eq("id", id);

      setMensaje("Checklist guardado correctamente.");
    } catch (e) {
      console.error(e);
      setMensaje("Error guardando checklist.");
    }

    setGuardando(false);
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
                  {item.item}
                </p>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => actualizarItem(item.id, true)}
                    style={{
                      flex: 1,
                      padding: "12px",
                      background: item.completado
                        ? "#4db8ff"
                        : "rgba(255,255,255,0.08)",
                      color: "#fff",
                      borderRadius: "10px",
                      border: "none",
                      fontWeight: "700",
                      cursor: "pointer",
                      boxShadow: item.completado
                        ? "0 0 10px rgba(0,153,255,0.4)"
                        : "none",
                    }}
                  >
                    ✓ OK
                  </button>

                  <button
                    onClick={() => actualizarItem(item.id, false)}
                    style={{
                      flex: 1,
                      padding: "12px",
                      background: item.completado
                        ? "rgba(255,255,255,0.08)"
                        : "red",
                      color: "#fff",
                      borderRadius: "10px",
                      border: "none",
                      fontWeight: "700",
                      cursor: "pointer",
                      boxShadow: item.completado
                        ? "none"
                        : "0 0 10px rgba(255,0,0,0.4)",
                    }}
                  >
                    ✗ KO
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 🔥 Observaciones */}
        <textarea
          placeholder="Observaciones de la inspección..."
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          style={{
            width: "100%",
            minHeight: "120px",
            marginTop: "20px",
            padding: "12px",
            borderRadius: "10px",
            background: "rgba(255,255,255,0.06)",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.18)",
            fontSize: "15px",
          }}
        />

        <button
          onClick={guardarChecklistCompleto}
          disabled={guardando}
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
            opacity: guardando ? 0.6 : 1,
            boxShadow: "0 0 10px rgba(0,153,255,0.4)",
          }}
        >
          {guardando ? "Guardando..." : "Guardar checklist completo"}
        </button>

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
