const STORAGE_KEY = "inspecciones_pendientes";

/**
 * Obtiene todas las inspecciones pendientes guardadas offline
 */
export async function obtenerPendientes() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error leyendo inspecciones offline:", error);
    return [];
  }
}

/**
 * Guarda una inspección en modo offline
 */
export async function guardarPendiente(inspeccion) {
  try {
    const actuales = await obtenerPendientes();
    actuales.push(inspeccion);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(actuales));
  } catch (error) {
    console.error("Error guardando inspección offline:", error);
  }
}

/**
 * Limpia todas las inspecciones pendientes (solo si se sincronizó bien)
 */
export async function limpiarPendientes() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error limpiando inspecciones offline:", error);
  }
}
