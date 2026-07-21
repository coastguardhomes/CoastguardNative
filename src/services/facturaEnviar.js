export async function enviarFactura(id) {
  try {
    const factura = await obtenerFactura(id);
    if (!factura) {
      return { ok: false, mensaje: "Factura no encontrada" };
    }

    const html = generarFacturaHTML(factura);
    const blob = new Blob([html], { type: "application/pdf" });

    const pdfUrl = await subirFacturaPDF(id, blob);
    if (!pdfUrl) {
      return { ok: false, mensaje: "Error subiendo PDF" };
    }

    const envio = await enviarFacturaEmail(factura, pdfUrl);

    return {
      ok: true,
      pdfUrl,
      envio
    };

  } catch (e) {
    return {
      ok: false,
      mensaje: "Error general enviando factura",
      error: e
    };
  }
}
