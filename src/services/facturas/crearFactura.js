import { supabase } from "../../supabaseClient";
import { generarNumeroFactura } from "./numeracion.js";

export async function crearFactura(datos) {
  const numero = await generarNumeroFactura();

  const { data, error } = await supabase
    .from("facturas")
    .insert({
      numero,
      ...datos,
      fecha: new Date().toISOString()
    })
    .select()
    .single();

  if (error) return null;
  return data;
}
