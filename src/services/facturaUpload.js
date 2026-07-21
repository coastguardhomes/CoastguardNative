export async function subirFacturaPDF(id, blob) {
  try {
    const { error } = await supabase.storage
      .from("facturas")
      .upload(`factura_${id}.pdf`, blob, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (error) {
      return {
        ok: false,
        mensaje: "Error subiendo PDF de factura",
        error
      };
    }

    const { data } = supabase.storage
      .from("facturas")
      .getPublicUrl(`factura_${id}.pdf`);

    return {
      ok: true,
      pdfUrl: data.publicUrl
    };

  } catch (e) {
    return {
      ok: false,
      mensaje: "Error de conexión subiendo PDF",
      error: e
    };
  }
}
