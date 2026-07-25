import puppeteer from "puppeteer";
import { serve } from "https://deno.land/x/sift@0.6.0/mod.ts";

serve({
  "/": async (req) => {
    const { facturaId } = await req.json();

    // SECRETOS CORRECTOS
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SERVICE_ROLE_KEY"); // ← CORREGIDO

    // OBTENER FACTURA
    const facturaRes = await fetch(
      `${supabaseUrl}/rest/v1/facturas?id=eq.${facturaId}`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`
        }
      }
    );

    const factura = (await facturaRes.json())[0];

    // OBTENER CLIENTE
    const clienteRes = await fetch(
      `${supabaseUrl}/rest/v1/clientes?id=eq.${factura.cliente_id}`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`
        }
      }
    );

    const cliente = (await clienteRes.json())[0];

    // HTML DEL PDF
    const html = `
      <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: Arial, sans-serif; font-size: 12px; padding: 20px; }
          .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
          .logo { height: 50px; }
          .title { text-align: right; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; }
          th { background-color: #f2f2f2; }
          .total { margin-top: 20px; text-align: right; font-size: 14px; font-weight: bold; }
          .section-title { margin-top: 20px; font-weight: bold; }
          .firma { margin-top: 40px; padding-top: 15px; border-top: 1px solid #ccc; font-size: 11px; color: #555; }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="https://YOUR-LOGO-URL/logo.png" class="logo" />
          <div class="title">
            <strong>CoastGuard</strong><br/>
            Factura / Invoice #${factura.id}<br/>
            ${new Date(factura.fecha).toLocaleDateString()}
          </div>
        </div>

        <div class="section-title">ES - Datos del cliente</div>
        <p>Nombre: ${cliente.nombre || ""}</p>
        <p>Email: ${cliente.email || ""}</p>

        <div class="section-title">EN - Customer details</div>
        <p>Name: ${cliente.nombre || ""}</p>
        <p>Email: ${cliente.email || ""}</p>

        <div class="section-title">ES - Detalle de la factura</div>
        <table>
          <thead>
            <tr><th>Concepto</th><th>Detalle</th><th>Importe (€)</th></tr>
          </thead>
          <tbody>
            <tr><td>Gestión técnico</td><td>${factura.extras?.gestionTecnico ? "Sí" : "No"}</td><td>${factura.gestion_tecnico || 0}</td></tr>
            <tr><td>Apertura</td><td>${factura.extras?.apertura ? "Sí" : "No"}</td><td>${factura.apertura || 0}</td></tr>
            <tr><td>Cierre</td><td>${factura.extras?.cierre ? "Sí" : "No"}</td><td>${factura.cierre || 0}</td></tr>
            <tr><td>Supervisión</td><td>${factura.horas || 0} horas</td><td>${factura.supervision_total || 0}</td></tr>
            <tr><td>Precio técnico</td><td>${factura.precio_tecnico || 0}</td><td>${factura.precio_tecnico || 0}</td></tr>
            <tr><td>Materiales</td><td></td><td>${factura.materiales || 0}</td></tr>
          </tbody>
        </table>

        <div class="total">
          ES - Total: ${factura.total} €<br/>
          EN - Total: ${factura.total} €
        </div>

        <div class="section-title">ES - Estado</div>
        <p>${factura.estado}</p>

        <div class="section-title">EN - Status</div>
        <p>${factura.estado}</p>

        <div class="firma">
          <strong>CoastGuard · Home Supervision Services</strong><br/><br/>
          ES: Supervisión profesional de viviendas en la Costa Blanca.<br/>
          EN: Professional home supervision services in Costa Blanca.<br/><br/>
          📞 +34 600 000 000<br/>
          ✉️ info@coastguard.es<br/>
          🌐 www.coastguard.es<br/><br/>
          ES: Gracias por confiar en CoastGuard.<br/>
          EN: Thank you for trusting CoastGuard.
        </div>
      </body>
      </html>
    `;

    // GENERAR PDF
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({ format: "A4" });
    await browser.close();

    // SUBIR PDF
    await fetch(
      `${supabaseUrl}/storage/v1/object/facturas-pdf/factura_${facturaId}.pdf`,
      {
        method: "PUT",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/pdf"
        },
        body: pdf
      }
    );

    return new Response(
      JSON.stringify({
        url: `${supabaseUrl}/storage/v1/object/public/facturas-pdf/factura_${facturaId}.pdf`
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  }
});
