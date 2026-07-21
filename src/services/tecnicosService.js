import { supabase } from "../lib/supabase";

const TABLE = "tecnicos";

/**
 * Obtener todos los técnicos
 */
export async function getTecnicos() {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      return { ok: false, mensaje: "Error obteniendo técnicos", error };
    }

    return { ok: true, tecnicos: data };

  } catch (e) {
    return { ok: false, mensaje: "Error de conexión obteniendo técnicos", error: e };
  }
}

/**
 * Obtener un técnico por ID
 */
export async function getTecnicoById(id) {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return { ok: false, mensaje: "Error obteniendo técnico", error };
    }

    return { ok: true, tecnico: data };

  } catch (e) {
    return { ok: false, mensaje: "Error de conexión obteniendo técnico", error: e };
  }
}

/**
 * Crear un técnico
 */
export async function crearTecnico(tecnico) {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .insert(tecnico)
      .select()
      .single();

    if (error) {
      return { ok: false, mensaje: "Error creando técnico", error };
    }

    return { ok: true, tecnico: data };

  } catch (e) {
    return { ok: false, mensaje: "Error de conexión creando técnico", error: e };
  }
}

/**
 * Editar un técnico
 */
export async function editarTecnico(id, tecnico) {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .update(tecnico)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return { ok: false, mensaje: "Error editando técnico", error };
    }

    return { ok: true, tecnico: data };

  } catch (e) {
    return { ok: false, mensaje: "Error de conexión editando técnico", error: e };
  }
}

/**
 * Borrar un técnico
 */
export async function borrarTecnico(id) {
  try {
    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq("id", id);

    if (error) {
      return { ok: false, mensaje: "Error borrando técnico", error };
    }

    return { ok: true, mensaje: "Técnico borrado correctamente" };

  } catch (e) {
    return { ok: false, mensaje:
