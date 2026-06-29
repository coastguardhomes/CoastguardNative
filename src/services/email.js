export async function enviarEmailFactura(email, pdfUrl) {
  await fetch(
    "https://wjomazuymbayceilvfku.supabase.co/functions/v1/enviar-email",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        pdfUrl
      })
    }
  );
}
