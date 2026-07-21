export async function enviarEmailFactura(email, pdfUrl) {
  try {
    const res = await fetch(
      "https://wjomazuymbayceilvfku.supabase.co/functions/v1/enviar-email",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, pdfUrl })
      }
    );

    if (!res.ok) {
      return {
        ok: false,
        mensaje: "Error enviando email de factura"
      };
    }

    return {
      ok: true,
      mensaje: "Factura enviada correctamente"
    };

  } catch (e) {
    return {
      ok: false,
      mensaje: "Error de conexión enviando factura",
      error: e
    };
  }
}
