// Genera el PDF de un contrato y lo guarda en el bucket "contratos".
//
// Por qué se reescribió (mismos fallos que factura-pdf):
//   · Dependía de PDFShift leyendo el secreto PDFSHIFT_API_KEY, que NO está
//     configurado: btoa("undefined:") -> 401, y el cuerpo del error acababa
//     subido como si fuera un PDF.
//   · No comprobaba ningún código de respuesta, así que devolvía 200 con una
//     URL que en realidad daba 404. Por eso los 6 contratos tenían pdf_url
//     a NULL o enlaces rotos.
//   · Exigía que quien llamara le pasara cliente, empresa, servicio y
//     condiciones ya montados, y hacía servicio.precio.toFixed(), que lanza
//     excepción si falta el dato. Ahora sólo hace falta contratoId: los datos
//     se leen de la base.
//
// El PDF se construye con pdf-lib, sin servicios externos ni claves de pago.

import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
  Deno.env.get("SERVICE_ROLE_KEY")!;

const BUCKET = "contratos";

// Sin responder al OPTIONS de comprobación el navegador bloquea la llamada
// antes de enviarla, así que desde la web y el APK sólo se veía
// "Failed to fetch" y el contrato nunca generaba su PDF.
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const cabecerasRest = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
};

async function rest(path: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: cabecerasRest,
  });
  if (!res.ok) {
    throw new Error(`REST ${path} -> ${res.status} ${await res.text()}`);
  }
  return await res.json();
}

/** WinAnsi no admite todos los caracteres; se sustituyen los problemáticos. */
function limpiar(texto: unknown): string {
  return String(texto ?? "")
    .replace(/€/g, "EUR")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/[^\x20-\xFF]/g, "");
}

const CONDICIONES = [
  "El servicio se presta segun la frecuencia acordada en este contrato.",
  "El cliente autoriza el acceso a la vivienda para las revisiones pactadas.",
  "Cualquier incidencia detectada se comunicara al cliente a la mayor brevedad.",
  "Los servicios extraordinarios se facturaran aparte segun tarifa vigente.",
  "El contrato se renueva automaticamente salvo aviso con 30 dias de antelacion.",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }

  try {
    const cuerpo = await req.json().catch(() => ({}));
    const contratoId = cuerpo.contratoId ?? cuerpo.contrato_id;

    if (!contratoId) return json({ error: "Falta contratoId" }, 400);

    // ---------------------------- DATOS ----------------------------
    const contrato = (await rest(`contratos?id=eq.${contratoId}&select=*`))[0];
    if (!contrato) {
      return json({ error: `No existe el contrato ${contratoId}` }, 404);
    }

    const cliente = contrato.cliente_id
      ? (await rest(`clientes?id=eq.${contrato.cliente_id}&select=*`))[0] ?? {}
      : {};

    const vivienda = contrato.vivienda_id
      ? (await rest(`viviendas?id=eq.${contrato.vivienda_id}&select=*`))[0] ?? {}
      : {};

    const config = (await rest("configuracion?select=*&limit=1"))[0] ?? {};

    // ----------------------------- PDF -----------------------------
    const doc = await PDFDocument.create();
    const pagina = doc.addPage([595.28, 841.89]); // A4
    const normal = await doc.embedFont(StandardFonts.Helvetica);
    const negrita = await doc.embedFont(StandardFonts.HelveticaBold);

    const azul = rgb(0.05, 0.35, 0.6);
    const gris = rgb(0.42, 0.45, 0.5);
    const negro = rgb(0.1, 0.1, 0.12);

    const M = 50;
    let y = 790;

    const texto = (
      t: unknown,
      x: number,
      yy: number,
      size = 10,
      font = normal,
      color = negro,
    ) => pagina.drawText(limpiar(t), { x, y: yy, size, font, color });

    // Cabecera
    texto(config.nombre_empresa || "CoastGuard", M, y, 20, negrita, azul);
    y -= 24;
    texto(`CONTRATO DE SERVICIO Nº ${contrato.id}`, M, y, 13, negrita);
    y -= 16;
    texto(
      `Fecha de inicio: ${String(contrato.fecha_inicio ?? "").slice(0, 10) || "-"}`,
      M,
      y,
      10,
      normal,
      gris,
    );
    y -= 20;

    pagina.drawLine({
      start: { x: M, y },
      end: { x: 545, y },
      thickness: 1,
      color: azul,
    });
    y -= 26;

    // Empresa
    texto("EMPRESA", M, y, 10, negrita, azul);
    y -= 15;
    texto(config.nombre_empresa || "CoastGuard", M, y, 11, negrita);
    y -= 13;
    for (
      const l of [
        config.direccion_empresa,
        config.telefono_empresa,
        config.email_empresa,
      ].filter(Boolean)
    ) {
      texto(l, M, y, 9.5, normal, gris);
      y -= 12;
    }

    y -= 14;

    // Cliente
    texto("CLIENTE", M, y, 10, negrita, azul);
    y -= 15;
    texto(cliente.nombre || "(sin nombre)", M, y, 11, negrita);
    y -= 13;
    for (
      const l of [cliente.direccion, cliente.telefono, cliente.email].filter(
        Boolean,
      )
    ) {
      texto(l, M, y, 9.5, normal, gris);
      y -= 12;
    }

    y -= 14;

    // Vivienda y condiciones económicas
    texto("OBJETO DEL CONTRATO", M, y, 10, negrita, azul);
    y -= 15;
    texto(
      `Vivienda: ${vivienda.nombre || vivienda.direccion || contrato.vivienda_id || "-"}`,
      M,
      y,
      10,
    );
    y -= 13;
    if (vivienda.ciudad) {
      texto(`Localidad: ${vivienda.ciudad}`, M, y, 10, normal, gris);
      y -= 13;
    }
    texto(
      `Frecuencia de las visitas: cada ${contrato.frecuencia ?? "-"} dias`,
      M,
      y,
      10,
    );
    y -= 13;
    texto(
      `Precio: ${Number(contrato.precio ?? 0).toFixed(2)} EUR`,
      M,
      y,
      11,
      negrita,
      azul,
    );
    y -= 22;

    // Condiciones
    texto("CONDICIONES DEL SERVICIO", M, y, 10, negrita, azul);
    y -= 15;
    for (const c of CONDICIONES) {
      texto(`-  ${c}`, M, y, 9.5, normal, negro);
      y -= 13;
    }

    if (contrato.notas) {
      y -= 8;
      texto("OBSERVACIONES", M, y, 10, negrita, azul);
      y -= 14;
      texto(String(contrato.notas).slice(0, 110), M, y, 9.5, normal, gris);
      y -= 14;
    }

    // Firma del cliente si se capturó (contratos.firma guarda la ruta en el
    // bucket "firmas").
    y = Math.min(y - 18, 230);
    texto("FIRMAS", M, y, 10, negrita, azul);
    y -= 18;

    let firmaPuesta = false;
    if (contrato.firma) {
      try {
        const url =
          `${SUPABASE_URL}/storage/v1/object/public/firmas/${contrato.firma}`;
        const res = await fetch(url);
        if (res.ok) {
          const bytes = new Uint8Array(await res.arrayBuffer());
          const img = await doc.embedPng(bytes);
          const escala = Math.min(160 / img.width, 60 / img.height);
          pagina.drawImage(img, {
            x: M,
            y: y - 60,
            width: img.width * escala,
            height: img.height * escala,
          });
          firmaPuesta = true;
        }
      } catch (e) {
        console.warn("No se pudo incrustar la firma:", e);
      }
    }

    if (!firmaPuesta) {
      texto("Firma del cliente: ______________________________", M, y - 30, 10);
    }

    texto(
      `Firma ${config.nombre_empresa || "CoastGuard"}: ______________________________`,
      M,
      y - 70,
      10,
    );

    if (contrato.firmado_en) {
      texto(
        `Firmado el ${String(contrato.firmado_en).slice(0, 10)}`,
        M,
        y - 92,
        9,
        normal,
        gris,
      );
    }

    const bytes = await doc.save();

    // ---------------------------- SUBIDA ----------------------------
    const fileName = `contrato-${contratoId}.pdf`;

    const subida = await fetch(
      `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${fileName}`,
      {
        method: "POST",
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
          "Content-Type": "application/pdf",
          "x-upsert": "true",
        },
        body: bytes,
      },
    );

    if (!subida.ok) {
      return json({
        error: "No se pudo subir el PDF",
        detalle: `${subida.status} ${await subida.text()}`,
      }, 500);
    }

    const url = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${fileName}`;

    await fetch(`${SUPABASE_URL}/rest/v1/contratos?id=eq.${contratoId}`, {
      method: "PATCH",
      headers: cabecerasRest,
      body: JSON.stringify({ pdf_url: url }),
    });

    return json({ url, firma: firmaPuesta });
  } catch (e) {
    console.error("contrato-pdf:", e);
    return json({ error: String((e as Error)?.message ?? e) }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}
