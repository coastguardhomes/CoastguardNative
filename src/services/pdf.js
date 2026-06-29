export async function generarPDF(facturaId) {
  const res = await fetch(
    "https://wjomazuymbayceilvfku.supabase.co/functions/v1/factura-pdf",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ facturaId })
    }
  );

  const data = await res.json();
  return data.url;
}
