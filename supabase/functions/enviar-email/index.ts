import { serve } from "https://deno.land/x/sift@0.6.0/mod.ts";

serve({
  "/": async (req) => {
    const { email, pdfUrl } = await req.json();

    const apiKey = Deno.env.get("RESEND_API_KEY");

    const html = `
      <div style="font-family: Arial; padding: 20px; color: #333;">
        
        <img src="https://YOUR-LOGO-URL/logo.png" style="height: 55px; margin-bottom: 25px;" />

        <h2 style="color: #003366; margin-bottom: 10px;">CoastGuard</h2>

        <p><strong>ES:</strong></p>
        <p>Adjuntamos su factura correspondiente. Puede descargarla en el siguiente enlace:</p>
        <p><a href="${pdfUrl}" style="color: #007bff; font-weight: bold;">Descargar factura</a></p>

        <br/>

        <p><strong>EN:</strong></p>
        <p>We have attached your corresponding invoice. You can download it from the link below:</p>
        <p><a href="${pdfUrl}" style="color: #007bff; font-weight: bold;">Download invoice</a></p>

        <br/><br/>

        <div style="border-top: 1px solid #ccc; padding-top: 15px; margin-top: 25px;">
          <p style="font-size: 14px; margin: 0; font-weight: bold;">CoastGuard · Home Supervision Services</p>

          <p style="font-size: 12px; margin: 5px 0;">
            ES: Supervisión profesional de viviendas en la Costa Blanca.<br/>
            EN: Professional home supervision services in Costa Blanca.
          </p>

          <p style="font-size: 12px; margin: 5px 0;">
            📞 +34 600 000 000<br/>
            ✉️ info@coastguard.es<br/>
            🌐 www.coastguard.es
          </p>

          <p style="font-size: 11px; color: #777; margin-top: 10px;">
            ES: Gracias por confiar en CoastGuard.<br/>
            EN: Thank you for trusting CoastGuard.
          </p>
        </div>

      </div>
    `;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "CoastGuard <noreply@coastguard.es>",
        to: email,
        subject: "Factura / Invoice - CoastGuard",
        html
      })
    });

    return new Response(JSON.stringify({ status: "ok" }), {
      headers: { "Content-Type": "application/json" }
    });
  }
});
