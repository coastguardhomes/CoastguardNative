import { supabase } from "./supabase";

export async function enviarEmailInspeccion(inspeccionId) {
  try {
    // 1️⃣ Cargar inspección
    const { data: inspeccion, error: errorInspeccion } = await supabase
      .from("inspecciones")
      .select("id, contrato_id, pdf_url, observaciones, fecha_inspeccion, foto_principal")
      .eq("id", inspeccionId)
      .single();

    if (errorInspeccion) throw new Error("No se pudo cargar la inspección");

    // 2️⃣ Cargar contrato
    const { data: contrato, error: errorContrato } = await supabase
      .from("contratos")
      .select("id, cliente_id, vivienda_id, tipo_servicio")
      .eq("id", inspeccion.contrato_id)
      .single();

    if (errorContrato) throw new Error("No se pudo cargar el contrato");

    // 3️⃣ Cargar cliente
    const { data: cliente, error: errorCliente } = await supabase
      .from("clientes")
      .select("id, nombre, email")
      .eq("id", contrato.cliente_id)
      .single();

    if (errorCliente) throw new Error("No se pudo cargar el cliente");

    // 4️⃣ Cargar vivienda
    const { data: vivienda, error: errorVivienda } = await supabase
      .from("viviendas")
      .select("direccion")
      .eq("id", contrato.vivienda_id)
      .single();

    if (errorVivienda) throw new Error("No se pudo cargar la vivienda");

    // 5️⃣ Validar PDF
    if (!inspeccion.pdf_url) {
      throw new Error("La inspección no tiene PDF generado");
    }

    // 6️⃣ Enviar email usando Supabase Edge Function
    const payload = {
      to: cliente.email,
      subject: `Informe de inspección - Vivienda ${vivienda.direccion}`,
      pdf_url: inspeccion.pdf_url,
      cliente_nombre: cliente.nombre,
      direccion: vivienda.direccion,
      fecha: inspeccion.fecha_inspeccion,
      observaciones: inspeccion.observaciones || "Sin observaciones",
      foto_principal: inspeccion.foto_principal || null,
      tipo_servicio: contrato.tipo_servicio,
    };

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/email-inspeccion`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error("Error enviando email desde la función");
    }

    // 7️⃣ Guardar registro del email enviado
    await supabase.from("emails_enviados").insert([
      {
        inspeccion_id: inspeccionId,
        cliente_id: cliente.id,
        email: cliente.email,
        fecha_envio: new Date().toISOString(),
      },
    ]);

    // 8️⃣ Actualizar inspección
    await supabase
      .from("inspecciones")
      .update({
        estado: "email_enviado",
        fecha_email: new Date().toISOString(),
      })
      .eq("id", inspeccionId);

    return { ok: true, mensaje: "Email enviado correctamente" };
  } catch (e) {
    console.error("ERROR EMAIL:", e);
    return { ok: false, mensaje: e.message };
  }
}
