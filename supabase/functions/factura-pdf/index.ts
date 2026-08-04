// Genera el PDF de una factura y lo guarda en el bucket "facturas".
//
// Por qué se reescribió:
//   · La versión desplegada delegaba en PDFShift (API externa de pago) leyendo
//     el secreto PDFSHIFT_API_KEY, que NO está configurado en el proyecto.
//     btoa("undefined:") producía un 401 y el cuerpo de ese error acababa
//     subido como si fuera un PDF.
//   · No comprobaba NINGÚN código de respuesta, así que siempre devolvía 200
//     con una URL aunque no se hubiera subido nada: el enlace daba 404.
//   · El contenido era un marcador de posición ("PDF generado correctamente"):
//     no incluía cliente, líneas ni importes.
//   · Esta copia del repositorio además usaba puppeteer y el bucket
//     "facturas-pdf", que no existe.
//
// Ahora el PDF se construye aquí con pdf-lib (sin servicios externos ni claves
// de terceros) a partir de los datos reales de la factura.

import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
  Deno.env.get("SERVICE_ROLE_KEY")!;

const BUCKET = "facturas";

// El navegador (y el WebView del APK) mandan un OPTIONS de comprobación antes
// del POST. Sin estas cabeceras esa comprobación fallaba y la llamada nunca
// llegaba a salir: la app sólo veía "Failed to fetch" y el PDF no se generaba.
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

/** Consulta REST con el service role (salta RLS). */
async function rest(path: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: cabecerasRest,
  });
  if (!res.ok) {
    throw new Error(`REST ${path} -> ${res.status} ${await res.text()}`);
  }
  return await res.json();
}

/**
 * WinAnsi (la codificación de las fuentes estándar) no admite todos los
 * caracteres. Se sustituyen los problemáticos para que pdf-lib no lance
 * excepción con nombres o conceptos que lleven símbolos raros.
 */
function limpiar(texto: unknown): string {
  return String(texto ?? "")
    .replace(/€/g, "EUR")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/[^\x20-\xFF]/g, "");
}

const dinero = (n: unknown) => `${Number(n ?? 0).toFixed(2)} EUR`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }

  try {
    const cuerpo = await req.json().catch(() => ({}));
    // Se aceptan las dos formas por compatibilidad con llamadas antiguas.
    const facturaId = cuerpo.facturaId ?? cuerpo.factura_id;

    if (!facturaId) return json({ error: "Falta facturaId" }, 400);

    // ---------------------------- DATOS ----------------------------
    const factura = (await rest(`facturas?id=eq.${facturaId}&select=*`))[0];
    if (!factura) {
      return json({ error: `No existe la factura ${facturaId}` }, 404);
    }

    const cliente = factura.cliente_id
      ? (await rest(`clientes?id=eq.${factura.cliente_id}&select=*`))[0] ?? {}
      : {};

    const lineas = await rest(
      `facturas_lineas?factura_id=eq.${facturaId}&select=*&order=id.asc`,
    );

    const config = (await rest("configuracion?select=*&limit=1"))[0] ?? {};

    // ----------------------------- PDF -----------------------------
    const doc = await PDFDocument.create();
    const pagina = doc.addPage([595.28, 841.89]); // A4
    const normal = await doc.embedFont(StandardFonts.Helvetica);
    const negrita = await doc.embedFont(StandardFonts.HelveticaBold);

    const azul = rgb(0.05, 0.35, 0.6);
    const gris = rgb(0.42, 0.45, 0.5);
    const negro = rgb(0.1, 0.1, 0.12);

    const M = 50; // margen izquierdo
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
    texto("FACTURA", 435, y, 20, negrita, azul);
    y -= 18;

    for (
      const linea of [
        config.direccion_empresa,
        config.telefono_empresa,
        config.email_empresa,
      ].filter(Boolean)
    ) {
      texto(linea, M, y, 9, normal, gris);
      y -= 12;
    }

    texto(`Nº ${factura.numero ?? factura.id}`, 435, 772, 11, negrita);
    texto(`Fecha: ${String(factura.fecha ?? "").slice(0, 10)}`, 435, 758, 10);
    texto(`Estado: ${factura.estado ?? "-"}`, 435, 744, 10, normal, gris);

    y = Math.min(y, 726);

    pagina.drawLine({
      start: { x: M, y },
      end: { x: 545, y },
      thickness: 1,
      color: azul,
    });
    y -= 26;

    // Cliente
    texto("CLIENTE", M, y, 10, negrita, azul);
    y -= 15;
    texto(cliente.nombre || "(sin nombre)", M, y, 11, negrita);
    y -= 13;
    for (
      const linea of [cliente.direccion, cliente.telefono, cliente.email]
        .filter(Boolean)
    ) {
      texto(linea, M, y, 9.5, normal, gris);
      y -= 12;
    }

    y -= 16;

    // Tabla de conceptos
    const colConcepto = M;
    const colCant = 355;
    const colPrecio = 415;
    const colSubtotal = 490;

    pagina.drawRectangle({
      x: M - 6,
      y: y - 5,
      width: 507,
      height: 20,
      color: rgb(0.93, 0.95, 0.97),
    });
    texto("Concepto", colConcepto, y, 9.5, negrita);
    texto("Cant.", colCant, y, 9.5, negrita);
    texto("Precio", colPrecio, y, 9.5, negrita);
    texto("Subtotal", colSubtotal, y, 9.5, negrita);
    y -= 22;

    if (lineas.length === 0) {
      // Sin desglose se muestra la descripción de la propia factura.
      texto(factura.descripcion || "(sin desglose)", colConcepto, y, 10);
      texto(dinero(factura.base), colSubtotal, y, 10);
      y -= 16;
    } else {
      for (const l of lineas) {
        if (y < 150) break; // una factura de extras cabe de sobra
        const concepto = limpiar(l.concepto);
        texto(
          concepto.length > 50 ? concepto.slice(0, 49) + "." : concepto,
          colConcepto,
          y,
          10,
        );
        texto(String(l.cantidad ?? 1), colCant, y, 10);
        texto(dinero(l.precio), colPrecio, y, 10);
        texto(dinero(l.subtotal), colSubtotal, y, 10);
        y -= 16;
      }
    }

    y -= 10;
    pagina.drawLine({
      start: { x: 330, y },
      end: { x: 545, y },
      thickness: 0.8,
      color: gris,
    });
    y -= 18;

    // Totales
    texto("Base imponible", 355, y, 10, normal, gris);
    texto(dinero(factura.base), colSubtotal, y, 10);
    y -= 15;
    texto("IVA", 355, y, 10, normal, gris);
    texto(dinero(factura.iva), colSubtotal, y, 10);
    y -= 18;
    texto("TOTAL", 355, y, 13, negrita, azul);
    texto(dinero(factura.total), colSubtotal, y, 13, negrita, azul);

    // Pie
    let pie = 96;
    if (config.cuenta_bancaria) {
      texto(
        `Pago por transferencia: ${config.cuenta_bancaria}`,
        M,
        pie,
        9,
        normal,
        gris,
      );
      pie -= 12;
    }
    if (factura.descripcion) {
      texto(`Detalle: ${factura.descripcion}`, M, pie, 8.5, normal, gris);
    }

    const bytes = await doc.save();

    // ---------------------------- SUBIDA ----------------------------
    const fileName = `factura-${facturaId}.pdf`;

    const subida = await fetch(
      `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${fileName}`,
      {
        method: "POST",
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
          "Content-Type": "application/pdf",
          // Sin upsert, regenerar la misma factura devolvía 409.
          "x-upsert": "true",
        },
        body: bytes,
      },
    );

    if (!subida.ok) {
      // Antes este fallo se ignoraba y la función devolvía 200 igualmente.
      return json({
        error: "No se pudo subir el PDF",
        detalle: `${subida.status} ${await subida.text()}`,
      }, 500);
    }

    const url = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${fileName}`;

    // Deja el enlace guardado en la factura.
    await fetch(`${SUPABASE_URL}/rest/v1/facturas?id=eq.${facturaId}`, {
      method: "PATCH",
      headers: cabecerasRest,
      body: JSON.stringify({ pdf_url: url }),
    });

    return json({ url, lineas: lineas.length });
  } catch (e) {
    console.error("factura-pdf:", e);
    return json({ error: String((e as Error)?.message ?? e) }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}
