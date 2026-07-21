export async function generarPDF(facturaId) {
  try {
    const res = await fetch(
      "https://wjomazuymbayceilvfku.supabase.co/functions/v1/factura-pdf",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ facturaId })
      }
    );

    if (!res.ok) {
      return {
        ok: false,
        mensaje: "Error generando PDF de factura"
      };
    }

    const data = await res.json();

    if (!data.url) {
      return {
        ok: false,
        mensaje: "La función no devolvió la URL del PDF"
      };
    }

    return {
      ok: true,
      pdfUrl: data.url
    };

  } catch (e) {
    return {
      ok: false,
      mensaje: "Error de conexión generando PDF",
      error: e
    };
  }
}
