import { supabase } from "../lib/supabase"

export async function getClientes() {
  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .order("nombre", { ascending: true })

  if (error) throw error
  return data
}

export async function getCliente(id) {
  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .eq("id", id)
    .single()

  if (error) throw error
  return data
}
