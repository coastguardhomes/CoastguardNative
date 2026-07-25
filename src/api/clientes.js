import { supabase } from "../lib/supabase"

// Obtener todos los clientes
export async function getClientes() {
  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .order("nombre", { ascending: true })

  if (error) {
    console.error("Error obteniendo clientes:", error)
    throw error
  }

  return data
}

// Obtener un cliente por ID
export async function getCliente(id) {
  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error obteniendo cliente:", error)
    throw error
  }

  return data
}

// Crear cliente
export async function crearCliente(data) {
  const { data: result, error } = await supabase
    .from("clientes")
    .insert(data)
    .select()
    .single()

  if (error) {
    console.error("Error creando cliente:", error)
    throw error
  }

  return result
}

// Actualizar cliente
export async function actualizarCliente(id, data) {
  const { data: result, error } = await supabase
    .from("clientes")
    .update(data)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error actualizando cliente:", error)
    throw error
  }

  return result
}

// Eliminar cliente
export async function eliminarCliente(id) {
  const { error } = await supabase
    .from("clientes")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Error eliminando cliente:", error)
    throw error
  }

  return true
}
