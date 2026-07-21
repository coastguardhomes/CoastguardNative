export async function obtenerFactura(id) {
  try {
    const { data, error } = await supabase
      .from("facturas")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return {
        ok: false,
        mensaje: "Error obteniendo factura",
        error
      };
    }

    return {
      ok: true,
      factura: data
    };

  } catch (e) {
    return {
      ok: false,
      mensaje: "Error de conexión obteniendo factura",
      error: e
    };
  }
}
