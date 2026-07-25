import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.0";

serve(async (_req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  // 1) Obtener contratos activos
  const { data: contratos, error: contratosError } = await supabase
    .from("contratos")
    .select("id, cliente_id, vivienda_id, tecnico_id, frecuencia, fecha_inicio, fecha_fin")
    .eq("estado", "activo");

  if (contratosError) {
    console.error("Error obteniendo contratos:", contratosError);
    return new Response("Error obteniendo contratos", { status: 500 });
  }

  if (!contratos || contratos.length === 0) {
    console.log("No hay contratos activos");
    return new Response("OK (sin contratos activos)", { status: 200 });
  }

  for (const contrato of contratos) {
    const contratoId = contrato.id;
    const frecuencia = contrato.frecuencia; // semanal | quincenal | mensual
    const clienteId = contrato.cliente_id;
    const viviendaId = contrato.vivienda_id;
    const tecnicoId = contrato.tecnico_id;

    // 2) Última inspección
    const { data: ultimaInspeccion, error: ultimaError } = await supabase
      .from("inspecciones")
      .select("id, fecha")
      .eq("contrato_id", contratoId)
      .order("fecha", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (ultimaError) {
      console.error(`Error obteniendo última inspección contrato ${contratoId}:`, ultimaError);
      continue;
    }

    let fechaReferencia: Date;

    if (ultimaInspeccion && ultimaInspeccion.fecha) {
      fechaReferencia = new Date(ultimaInspeccion.fecha);
    } else if (contrato.fecha_inicio) {
      fechaReferencia = new Date(contrato.fecha_inicio);
    } else {
      fechaReferencia = new Date(hoy);
    }

    fechaReferencia.setHours(0, 0, 0, 0);

    // 3) Calcular próxima inspección
    const proxima = new Date(fechaReferencia);

    if (frecuencia === "semanal") {
      proxima.setDate(proxima.getDate() + 7);
    } else if (frecuencia === "quincenal") {
      proxima.setDate(proxima.getDate() + 14);
    } else if (frecuencia === "mensual") {
      proxima.setMonth(proxima.getMonth() + 1);
    } else {
      console.log(`Frecuencia desconocida en contrato ${contratoId}:`, frecuencia);
      continue;
    }

    proxima.setHours(0, 0, 0, 0);

    // 4) Si toca inspección → crearla
    if (proxima <= hoy) {
      console.log(`Creando inspección automática para contrato ${contratoId}`);

      const { error: insertError } = await supabase.from("inspecciones").insert({
        contrato_id: contratoId,
        cliente_id: clienteId,
        vivienda_id: viviendaId,
        tecnico_id: tecnicoId,
        fecha: proxima.toISOString().slice(0, 10),
        estado: "pendiente",
        origen: "automatico",
      });

      if (insertError) {
        console.error(`Error creando inspección para contrato ${contratoId}:`, insertError);
      }
    } else {
      console.log(`Aún no toca inspección para contrato ${contratoId}`);
    }
  }

  return new Response("OK (inspecciones automáticas procesadas)", { status: 200 });
});
