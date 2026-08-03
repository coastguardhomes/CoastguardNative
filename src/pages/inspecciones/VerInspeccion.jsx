import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import Bloque from "../../../components/Bloque";

export default function VerInspeccion({ id }) {
  const [checklist, setChecklist] = useState([]);
  const [bloqueado, setBloqueado] = useState(false);

  // 🔥 Cargar checklist + estado inspección
  async function cargarTodo() {
    // Cargar checklist desde checklist_inspeccion
    const { data: checklistData } = await supabase
      .from("checklist_inspeccion")
      .select("id, item, completado, observaciones")
      .eq("inspeccion_id", id)
      .order("id", { ascending: true });

    setChecklist(checklistData || []);

    // Ver si la inspección está finalizada
    const { data: insp } = await supabase
      .from("inspecciones")
      .select("finalizada")
      .eq("id", id)
      .single();

    setBloqueado(insp?.finalizada === true);
  }

  // 🔥 Actualizar estado del ítem
  async function actualizarChecklist(itemId, nuevoEstado) {
    await supabase
      .from("checklist_inspeccion")
      .update({ completado: nuevoEstado === "correcto" })
      .eq("id", itemId);

    cargarTodo();
  }

  useEffect(() => {
    cargarTodo();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Inspección #{id}</h1>

      <Bloque titulo="Checklist">
        {checklist.length === 0 ? (
          <p style={{ opacity: 0.7 }}>Checklist vacío.</p>
        ) : (
          checklist.map((item) => (
            <div key={item.id} style={{ marginBottom: "20px" }}>
              <p><strong>{item.item}</strong></p>

              <select
                disabled={bloqueado}
                value={item.completado ? "correcto" : "pendiente"}
                onChange={(e) => actualizarChecklist(item.id, e.target.value)}
                style={{
                  padding: "8px",
                  borderRadius: "8px",
                  marginBottom: "10px",
                  width: "100%",
                }}
              >
                <option value="pendiente">Pendiente</option>
                <option value="correcto">Correcto</option>
              </select>

              <p>Obs: {item.observaciones}</p>
            </div>
          ))
        )}
      </Bloque>
    </div>
  );
}
