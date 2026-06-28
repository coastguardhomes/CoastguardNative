import { obtenerFactura } from "./facturas";
import { generarFacturaHTML } from "./facturaPdf";
import { subirFacturaPDF } from "./facturaUpload";
import { enviarFacturaEmail } from "./facturaEmail";

export async function enviarFactura(id) {
  const factura = await obtenerFactura(id);

  const html = generarFacturaHTML(factura);

  const blob = new Blob([html], { type: "application/pdf" });

  const pdfUrl = await subirFacturaPDF(id, blob);

  await enviarFacturaEmail(factura, pdfUrl);

  return pdfUrl;
}
