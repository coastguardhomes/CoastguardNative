export function generarFacturaHTML(factura) {
  return `
    <html>
      <body>
        <h1>Factura #${factura.id}</h1>
        <p><strong>Cliente:</strong> ${factura.cliente_nombre}</p>
        <p><strong>Email:</strong> ${factura.cliente_email}</p>
        <p><strong>Fecha:</strong> ${factura.fecha}</p>
        <p><strong>Total:</strong> €${factura.total}</p>
        <p><strong>Estado:</strong> ${factura.estado}</p>
      </body>
    </html>
  `;
}
