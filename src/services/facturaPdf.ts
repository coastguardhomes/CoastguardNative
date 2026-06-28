import * as Print from "expo-print";

export async function generarFacturaPDF(factura) {
  const html = `
    <html>
      <body>
        <h1>Factura #${factura.id}</h1>
        <p><strong>Cliente:</strong> ${factura.cliente_nombre}</p>
        <p><strong>Email:</strong> ${factura.cliente_email}</p>
        <p><strong>Fecha:</strong> ${factura.fecha}</p>
        <p><strong>Total:</strong> €${factura.total}</p>
      </body>
    </html>
  `;

  const { uri } = await Print.printToFileAsync({ html });
  return uri;
}
