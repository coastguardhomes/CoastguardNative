export async function enviarFacturaEmail(factura, pdfUrl) {
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.EXPO_PUBLIC_RESEND_KEY}`,
    },
    body: JSON.stringify({
      from: "CoastGuard <noreply@coastguardhomes.com>",
      to: factura.cliente_email,
      subject: `Factura #${factura.id}`,
      html: `
        <p>Hola ${factura.cliente_nombre},</p>
        <p>Aquí tienes tu factura.</p>
        <p><a href="${pdfUrl}">Descargar PDF</a></p>
      `,
    }),
  });
}
