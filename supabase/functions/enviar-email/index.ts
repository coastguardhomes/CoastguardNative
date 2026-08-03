import { serve } from "https://deno.land/x/sift@0.6.0/mod.ts";

serve({
  "/": async (req) => {
    try {
      const {
        email,
        pdfUrl,
        cliente_nombre,
        direccion,
        fecha,
        observaciones,
        foto_principal,
        tipo_servicio,
      } = await req.json();

      const apiKey = Deno.env.get("RESEND_API_KEY");

      if (!email || !pdfUrl) {
        return new Response(
          JSON.stringify({ error: "Faltan parámetros obligatorios" }),
          { status: 400 }
        );
      }

      // 1️⃣ Descargar PDF desde Supabase Storage
      const pdfResponse = await fetch(pdfUrl);
      const pdfBuffer = await pdfResponse.arrayBuffer();

      // 2️⃣ HTML del email
      const html = `
        <div style="font-family: Arial; padding: 20px; color: #333;">
          
          <h2 style="color: #003366; margin-bottom: 10px;">Informe de Inspección - CoastGuard</h2>

          <p>Hola <strong>${cliente_nombre}</strong>,</p>

          <p>Adjuntamos el informe correspondiente a la inspección realizada en:</p>
          <p><strong>${direccion}</strong></p>

          <p><strong>Fecha:</strong> ${fecha}</p>
          <p><strong>Servicio:</strong> ${tipo_servicio}</p>

          <h3 style="color:#003366;">Observaciones</h3>
          <p>${observaciones || "Sin observaciones"}</p>

          ${
            foto_principal
              ? `<img src="${foto_principal}" alt="Foto principal" style="width:300px;border-radius:10px;margin-top:20px;" />`
              : ""
          }

          <br/><br/>

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
      `;

      // 3️⃣ Enviar email con Resend
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "CoastGuard <noreply@coastguard.es>",
          to: email,
          subject: `Informe de inspección - ${direccion}`,
          html,
          attachments: [
            {
              filename: "informe_inspeccion.pdf",
              content: Array.from(new Uint8Array(pdfBuffer)), // Resend requiere array de números
            },
          ],
        }),
      });

      if (!response.ok) {
        console.error(await response.text());
        return new Response(
          JSON.stringify({ error: "Error enviando email" }),
          { status: 500 }
        );
      }

      return new Response(JSON.stringify({ status: "ok" }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      console.error("ERROR EN FUNCIÓN enviar-email:", e);
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
      });
    }
  },
});
