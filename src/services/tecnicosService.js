import { supabase } from "../lib/supabase";

const TABLE = "tecnicos";

/**
 * Obtener todos los técnicos
 */
export async function getTecnicos() {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("id", { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Obtener un técnico por ID
 */
export async function getTecnicoById(id) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Crear un técnico
 */
export async function crearTecnico(tecnico) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(tecnico)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Editar un técnico
 */
export async function editarTecnico(id, tecnico) {
  const { data, error } = await supabase
    .from(TABLE)
    .update(tecnico)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Borrar un técnico
 */
export async function borrarTecnico(id) {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
}
