import { obtenerFactura } from "./facturas";
import { generarFacturaPDF } from "./facturaPdf";
import { subirFacturaPDF } from "./facturaUpload";
import { enviarFacturaEmail } from "./facturaEmail";

export async function enviarFactura(facturaId) {
  const factura = await obtenerFactura(facturaId);
  const pdfUri = await generarFacturaPDF(factura);
  const pdfUrl = await subirFacturaPDF(facturaId, pdfUri);
  await enviarFacturaEmail(factura, pdfUrl);
}
