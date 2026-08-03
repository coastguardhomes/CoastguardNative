// Archivo: src/lib/emailInspeccion.js
// Versión estable para evitar errores en la app.
// El técnico podrá completar la lógica real de envío de email.

export async function enviarEmailInspeccion({ inspeccionId, pdfUrl, emailDestino }) {
  try {
    console.log("Simulación de envío de email:");
    console.log("ID inspección:", inspeccionId);
    console.log("PDF:", pdfUrl);
    console.log("Destino:", emailDestino);

    // Aquí el técnico podrá implementar la integración real:
    // - Supabase Edge Function
    // - API externa
    // - SMTP
    // - SendGrid / Mailgun / etc.

    return {
      ok: true,
      mensaje: "Email simulado correctamente (lógica pendiente de implementar).",
    };
  } catch (error) {
    console.error("Error enviando email:", error);
    return {
      ok: false,
      mensaje: "Error enviando email.",
    };
  }
}
