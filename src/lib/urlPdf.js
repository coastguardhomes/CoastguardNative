import { supabase } from "./supabase";

/**
 * Devuelve una URL abrible para un `pdf_url` guardado en base de datos.
 *
 * Los valores no son homogéneos: las inspecciones guardan la URL pública
 * completa ("https://.../storage/v1/object/public/pdfs/..."), mientras que los
 * contratos guardan sólo la ruta dentro del bucket ("contratos/contrato_3.pdf").
 * Esta función acepta las dos formas.
 */
export function resolverUrlPdf(valor, bucket = "pdfs") {
  if (!valor) return null;

  // Ya es una URL absoluta: se usa tal cual.
  if (/^https?:\/\//i.test(valor)) return valor;

  const { data } = supabase.storage.from(bucket).getPublicUrl(valor);
  return data?.publicUrl || null;
}
