import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { contratoId } = await req.json();

    if (!contratoId) {
      return new Response(
        JSON.stringify({ error: "El ID del contrato es requerido." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Consulta de datos del contrato y cliente
    const { data: contrato, error: dbError } = await supabase
      .from("contratos")
      .select("*, clientes(*)")
      .eq("id", contratoId)
      .single();

    if (dbError || !contrato) {
      return new Response(
        JSON.stringify({ error: "No se encontró el contrato solicitado." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Extracción y formateo de campos profesionales
    const clienteNombre = contrato.clientes?.nombre || "N/A";
    const clienteDni = contrato.clientes?.dni || contrato.clientes?.cif || "N/A";
    const clienteTelefono = contrato.clientes?.telefono || "N/A";
    const clienteEmail = contrato.clientes?.email || "N/A";
    const clienteDireccion = contrato.clientes?.direccion || "N/A";

    const fechaInicio = contrato.fecha_inicio || "A convenir";
    const fechaFin = contrato.fecha_fin || "Indefinida";
    const frecuencia = contrato.frecuencia || "Según acuerdo de partes";
    const precio = contrato.precio != null ? `${contrato.precio} €` : "A convenir";
    const serviciosDetalle = contrato.servicios_incluidos || contrato.observaciones || "Servicios profesionales detallados según la propuesta técnica acordada y normativas vigentes.";
    
    const firmaCliente = contrato.firma_url || null;
    const selloEmpresa = contrato.sello_url || "https://via.placeholder.com/150x150.png?text=SELLO+OFICIAL";

    // 3. Plantilla HTML profesional completa con clausulado legal ampliado (Cláusulas 6 a 15)
    const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: A4; margin: 12mm 15mm 15mm 15mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #0f172a; background: #ffffff; line-height: 1.5; font-size: 9.5pt; padding: 20px; max-width: 800px; margin: auto; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f2b48; padding-bottom: 12px; margin-bottom: 16px; }
    .brand h1 { color: #0f2b48; font-size: 15pt; font-weight: 800; letter-spacing: -0.3px; text-transform: uppercase; }
    .brand p { color: #64748b; font-size: 8pt; margin-top: 2px; }
    .doc-meta { text-align: right; }
    .badge { background: #0f2b48; color: #ffffff; font-weight: 700; font-size: 8pt; padding: 4px 10px; border-radius: 4px; display: inline-block; text-transform: uppercase; }
    .date { color: #64748b; font-size: 8pt; margin-top: 4px; }
    .section-title { font-size: 9pt; font-weight: 700; color: #0f2b48; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; margin-bottom: 8px; text-transform: uppercase; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; margin-bottom: 12px; }
    .card p { margin-bottom: 4px; font-size: 9pt; color: #334155; }
    .legal-block { margin-bottom: 12px; text-align: justify; }
    .legal-block h3 { font-size: 9.5pt; color: #0f2b48; margin-bottom: 4px; text-transform: uppercase; }
    .legal-block p { font-size: 8.5pt; color: #475569; margin-bottom: 6px; line-height: 1.4; }
    .signatures-container { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 15px; page-break-inside: avoid; }
    .sig-box { border: 1px dashed #cbd5e1; border-radius: 6px; padding: 8px; text-align: center; height: 130px; display: flex; flex-direction: column; justify-content: space-between; align-items: center; }
    .sig-box p { font-size: 8pt; font-weight: bold; color: #0f2b48; }
    .sig-img { max-height: 60px; max-width: 90%; object-fit: contain; margin: auto; }
    .stamp-img { max-height: 55px; max-width: 90%; object-fit: contain; margin: auto; display: block; }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <h1>Contrato de Prestación de Servicios</h1>
      <p>Referencia de expediente: #${contrato.id}</p>
    </div>
    <div class="doc-meta">
      <div class="badge">${(contrato.estado || "PENDIENTE").toUpperCase()}</div>
      <div class="date">Fecha de Emisión: ${new Date().toLocaleDateString("es-ES")}</div>
    </div>
  </div>

  <div class="card">
    <div class="section-title">1. Datos Identificativos de las Partes</div>
    <p><strong>Cliente / Razón Social:</strong> ${clienteNombre}</p>
    <p><strong>NIF / CIF:</strong> ${clienteDni}</p>
    <p><strong>Teléfono de Contacto:</strong> ${clienteTelefono}</p>
    <p><strong>Correo Electrónico:</strong> ${clienteEmail}</p>
    <p><strong>Domicilio Fiscal:</strong> ${clienteDireccion}</p>
  </div>

  <div class="card">
    <div class="section-title">2. Condiciones Económicas y Temporales</div>
    <p><strong>Fecha de Inicio:</strong> ${fechaInicio}</p>
    <p><strong>Fecha de Finalización:</strong> ${fechaFin}</p>
    <p><strong>Frecuencia de Prestación:</strong> ${frecuencia}</p>
    <p><strong>Importe Acordado:</strong> ${precio}</p>
  </div>

  <div class="legal-block">
    <h3>3. Objeto del Contrato y Alcance de los Servicios</h3>
    <p>${serviciosDetalle}</p>
    <p>La prestación de los servicios objeto de este contrato se llevará a cabo bajo los más altos estándares de calidad profesional, aplicando los procedimientos técnicos requeridos y cumpliendo rigurosamente con toda la normativa legal, sectorial y de seguridad aplicable.</p>
  </div>

  <div class="legal-block">
    <h3>4. Confidencialidad y Protección de Datos (RGPD)</h3>
    <p>Ambas partes se obligan expresamente a guardar la más absoluta confidencialidad sobre cualquier información, datos técnicos, económicos o comerciales a los que tengan acceso durante la vigencia de este acuerdo. Los datos personales recabados serán tratados de conformidad con el Reglamento General de Protección de Datos (UE) 2016/679 y la normativa nacional de protección de datos, utilizándose única y exclusivamente para los fines derivados de la ejecución y gestión de la relación contractual.</p>
  </div>

  <div class="legal-block">
    <h3>5. Resolución, Vigencia y Modificaciones</h3>
    <p>El presente contrato entrará en vigor en la fecha de firma y se mantendrá vigente durante el plazo estipulado. Cualquier modificación, prórroga o alteración de las condiciones aquí dispuestas requerirá el consentimiento mutuo expresado por escrito. El incumplimiento de cualquiera de las obligaciones esenciales facultará a la parte perjudicada para resolver el contrato de forma anticipada sin perjuicio de la indemnización por daños y perjuicios que pudiera corresponder.</p>
  </div>

  <div class="legal-block">
    <h3>6. Custodia de Llaves y Acceso a la Vivienda</h3>
    <p>El Cliente autoriza expresamente a CoastGuard Homes (en adelante, “El Prestador”) a custodiar las llaves de acceso a la vivienda objeto del presente contrato. Las llaves serán almacenadas en un sistema seguro y únicamente utilizadas para la prestación de los servicios contratados. El Prestador se compromete a no permitir el acceso a terceros no autorizados y a mantener un registro interno de accesos. El Cliente reconoce que la entrega de llaves implica su consentimiento para que el Prestador acceda a la vivienda exclusivamente para realizar las tareas de supervisión, inspección, verificación de estado, mantenimiento básico o actuaciones de emergencia previamente pactadas.</p>
  </div>

  <div class="legal-block">
    <h3>7. Responsabilidad, Limitaciones y Exoneraciones</h3>
    <p>El Prestador actuará con la diligencia profesional exigible en la supervisión de la vivienda. No obstante, el Prestador no será responsable de daños derivados de:</p>
    <p>a) Robos, actos vandálicos o intrusiones ajenas a la actuación del Prestador.</p>
    <p>b) Fenómenos meteorológicos, inundaciones, incendios, fallos estructurales o averías de instalaciones no causadas por su intervención.</p>
    <p>c) Mal uso, manipulación o falta de mantenimiento previo por parte del Cliente o terceros.</p>
    <p>d) Sistemas de alarma, cámaras o dispositivos electrónicos que no dependan del Prestador.</p>
    <p>El Prestador únicamente responderá por daños ocasionados por negligencia directa en la ejecución de sus funciones. En ningún caso será responsable de pérdidas económicas indirectas, lucro cesante o daños derivados de causas externas.</p>
  </div>

  <div class="legal-block">
    <h3>8. Actuaciones de Emergencia</h3>
    <p>En caso de detectar una incidencia grave que pueda comprometer la seguridad, integridad o habitabilidad de la vivienda (roturas, fugas, incendios, accesos forzados, etc.), el Prestador podrá actuar de forma inmediata, incluyendo:</p>
    <p>a) Aviso urgente al Cliente.</p>
    <p>b) Contacto con servicios de emergencia o técnicos autorizados.</p>
    <p>c) Acceso a la vivienda para minimizar daños.</p>
    <p>El Cliente asume los costes derivados de intervenciones de terceros (bomberos, cerrajeros, técnicos, etc.) salvo que la incidencia sea causada por negligencia del Prestador.</p>
  </div>

  <div class="legal-block">
    <h3>9. Informes, Fotografías y Registros</h3>
    <p>Cada visita podrá incluir fotografías, vídeos y anotaciones técnicas que formarán parte del informe de supervisión. El Cliente autoriza el tratamiento de dichas imágenes exclusivamente para fines de control, verificación del estado de la vivienda y evidencias de incidencias. El Prestador conservará dichos registros conforme a la normativa vigente y podrá facilitarlos al Cliente cuando este lo solicite.</p>
  </div>

  <div class="legal-block">
    <h3>10. Obligaciones del Cliente</h3>
    <p>El Cliente se compromete a:</p>
    <p>a) Facilitar acceso seguro a la vivienda y proporcionar llaves en buen estado.</p>
    <p>b) Informar de cualquier cambio relevante en la propiedad, sistemas de seguridad o suministros.</p>
    <p>c) Mantener los pagos al día según las condiciones económicas pactadas.</p>
    <p>d) Comunicar con antelación cualquier visita de terceros para evitar conflictos de acceso.</p>
  </div>

  <div class="legal-block">
    <h3>11. Obligaciones del Prestador</h3>
    <p>El Prestador se compromete a:</p>
    <p>a) Realizar las visitas en la frecuencia acordada.</p>
    <p>b) Mantener la confidencialidad y seguridad de las llaves.</p>
    <p>c) Emitir informes veraces y completos.</p>
    <p>d) Actuar con diligencia profesional y conforme a la normativa aplicable.</p>
    <p>e) Notificar al Cliente cualquier incidencia detectada.</p>
  </div>

  <div class="legal-block">
    <h3>12. Confidencialidad y Protección de Datos (RGPD)</h3>
    <p>El Prestador tratará los datos personales del Cliente conforme al Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD). Los datos serán utilizados exclusivamente para la gestión del contrato, visitas, informes y comunicaciones relacionadas con la prestación del servicio. El Cliente podrá ejercer sus derechos de acceso, rectificación, supresión, oposición y portabilidad mediante solicitud escrita.</p>
  </div>

  <div class="legal-block">
    <h3>13. Vigencia, Renovación y Resolución del Contrato</h3>
    <p>El contrato tendrá la duración indicada en las condiciones económicas. Podrá renovarse automáticamente salvo comunicación expresa del Cliente con al menos 30 días de antelación. El Prestador podrá resolver el contrato si el Cliente incumple obligaciones esenciales, especialmente impagos o impedimentos de acceso. Cualquier modificación deberá realizarse por escrito y con consentimiento de ambas partes.</p>
  </div>

  <div class="legal-block">
    <h3>14. Jurisdicción y Legislación Aplicable</h3>
    <p>El presente contrato se regirá por la legislación española. Para la resolución de cualquier controversia, ambas partes se someten a los Juzgados y Tribunales del domicilio del Prestador, salvo que la normativa de consumidores disponga lo contrario.</p>
  </div>

  <div class="legal-block">
    <h3>15. Aceptación</h3>
    <p>Ambas partes declaran haber leído y comprendido el contenido del presente contrato, aceptando todas sus cláusulas en su totalidad.</p>
  </div>

  <div class="signatures-container">
    <div class="sig-box">
      <p>POR LA EMPRESA (PRESTADOR)</p>
      <img src="${selloEmpresa}" class="stamp-img" alt="Sello Empresa" />
      <div style="font-size:7.5pt; color:#64748b;">FIRMADO Y SELLADO DIGITALMENTE</div>
    </div>
    <div class="sig-box">
      <p>POR EL CLIENTE</p>
      ${firmaCliente ? `<img src="${firmaCliente}" class="sig-img" alt="Firma Cliente" />` : `<div style="color:#94a3b8; font-style:italic; font-size:8.5pt; margin:auto;">Pendiente de firma del cliente</div>`}
      <div style="font-size:7.5pt; color:#64748b;">CONFORME</div>
    </div>
  </div>
</body>
</html>`;

    // 4. Crear Data URI segura para renderizar HTML directamente sin problemas de Storage
    const dataUri = `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`;

    // 5. Actualizar la base de datos con la Data URI
    const { error: updateError } = await supabase
      .from("contratos")
      .update({
        pdf_url: dataUri,
        actualizado_en: new Date().toISOString(),
      })
      .eq("id", contratoId);

    if (updateError) {
      console.error("Error actualizando contrato.pdf_url en base de datos:", updateError);
    }

    // 6. Respuesta JSON exitosa
    return new Response(
      JSON.stringify({
        ok: true,
        url: dataUri,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("contrato-pdf error general:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Error al procesar el contrato." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
