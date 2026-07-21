export async function marcarPagada(id) {
  try {
    const { error } = await supabase
      .from("facturas")
      .update({ estado: "pagada" })
      .eq("id", id);

    if (error) {
      return {
        ok: false,
        mensaje: "Error marcando factura como pagada",
        error
      };
    }

    return {
      ok: true,
      mensaje: "Factura marcada como pagada"
    };

  } catch (e) {
    return {
      ok: false,
      mensaje: "Error de conexión marcando factura como pagada",
      error: e
    };
  }
}
