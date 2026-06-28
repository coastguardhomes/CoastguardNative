import { supabase } from "../supabaseClient";

export async function obtenerFacturas(filtros = {}) {
  let query = supabase.from("facturas").select("*");

  if (filtros.cliente) {
    query = query.ilike("cliente_nombre", `%${filtros.cliente}%`);
  }

  if (filtros.estado) {
    query = query.eq("estado", filtros.estado);
  }

  if (filtros.fechaDesde) {
    query = query.gte("fecha", filtros.fechaDesde);
  }

  if (filtros.fechaHasta) {
    query = query.lte("fecha", filtros.fechaHasta);
  }

  const { data, error } = await query.order("fecha", { ascending: false });

  if (error) throw error;
  return data;
}
