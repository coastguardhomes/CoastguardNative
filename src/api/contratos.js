import { supabase } from "../lib/supabase"

// Obtener contratos de un cliente
export async function getContratos(clienteId) {
  const { data, error } = await supabase
    .from("contratos")
    .select("*")
    .eq("cliente_id", clienteId)
    .order("fecha", { ascending: false })

  if (error) {
    console.error("Error obteniendo contratos:", error)
    throw error
  }

  return data
}

// Obtener un contrato por ID
export async function getContrato(id) {
  const { data, error } = await supabase
    .from("contratos")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error obteniendo contrato:", error)
    throw error
  }

  return data
}

// Crear contrato
export async function crearContrato(data) {
  const { data: result, error } = await supabase
    .from("contratos")
    .insert(data)
    .select()
    .single()

  if (error) {
    console.error("Error creando contrato:", error)
    throw error
  }

  return result
}

// Actualizar contrato
export async function actualizarContrato(id, data) {
  const { data: result, error } = await supabase
    .from("contratos")
    .update(data)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error actualizando contrato:", error)
    throw error
  }

  return result
}

// Eliminar contrato
export async function eliminarContrato(id) {
  const { error } = await supabase
    .from("contratos")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Error eliminando contrato:", error)
    throw error
  }

  return true
}
