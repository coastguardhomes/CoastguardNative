import { supabase } from "../lib/supabase"

export async function getContratos(clienteId) {
  const { data, error } = await supabase
    .from("contratos")
    .select("*")
    .eq("clienteId", clienteId)

  if (error) throw error
  return data
}

export async function getContrato(id) {
  const { data, error } = await supabase
    .from("contratos")
    .select("*")
    .eq("id", id)
    .single()

  if (error) throw error
  return data
}
