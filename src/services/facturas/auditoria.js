import { supabase } from "../../supabaseClient";

export async function registrarAuditoria(accion, facturaId, tecnicoId) {
  const { error } = await supabase
    .from("auditoria_facturas")
    .insert({
      accion,
      factura_id: facturaId,
      tecnico_id: tecnicoId,
      fecha: new Date().toISOString()
    });

  if (error) return false;
  return true;
}
