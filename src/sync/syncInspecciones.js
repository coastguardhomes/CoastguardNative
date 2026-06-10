import { supabase } from "../lib/supabase";
import { obtenerPendientes, limpiarPendientes } from "../offline/inspeccionesOffline";

/**
 * Sincroniza todas las inspecciones pendientes con Supabase
 */
export const syncInspecciones = async () => {
  try {
    const pendientes = await obtenerPendientes();

    if (!pendientes || pendientes.length === 0) {
      console.log("🔹 No hay inspecciones pendientes para sincronizar.");
      return;
    }

    console.log(`🔄 Intentando sincronizar ${pendientes.length} inspecciones...`);

    let errores = 0;

    for (const inspeccion of pendientes) {
      const { error } = await supabase.from("inspecciones").insert(inspeccion);

      if (error) {
        console.error("❌ Error subiendo inspección:", error);
        errores++;
        continue;
      }
    }

    if (errores === 0) {
      await limpiarPendientes();
      console.log("✅ Todas las inspecciones fueron sincronizadas correctamente.");
    } else {
      console.warn(`⚠ ${errores} inspecciones no pudieron sincronizarse. Se mantienen offline.`);
    }

  } catch (error) {
    console.error("❌ Error general en syncInspecciones:", error);
  }
};
