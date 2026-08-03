// 🔥 CAMBIOS IMPORTANTES:
// - checklist_respuestas → checklist_inspeccion
// - estado → completado
// - observaciones → observaciones
// - item → item

// (El resto del archivo se mantiene igual excepto la parte del checklist)


// 🔥 Cargar checklist desde checklist_inspeccion
const { data: checklistData } = await supabase
  .from("checklist_inspeccion")
  .select("id, item, completado, observaciones")
  .eq("inspeccion_id", id)
  .order("id", { ascending: true });

setChecklist(checklistData || []);


// 🔥 Actualizar estado del ítem
async function actualizarChecklist(itemId, nuevoEstado) {
  await supabase
    .from("checklist_inspeccion")
    .update({ completado: nuevoEstado === "correcto" })
    .eq("id", itemId);

  cargarTodo();
}


// 🔥 Mostrar checklist
<Bloque titulo="Checklist">
  {checklist.length === 0 ? (
    <p style={{ opacity: 0.7 }}>Checklist vacío.</p>
  ) : (
    checklist.map((item) => (
      <div key={item.id} style={itemChecklist}>
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
