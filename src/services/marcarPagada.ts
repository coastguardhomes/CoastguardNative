import { supabase } from './supabase';

export async function marcarFacturaComoPagada(facturaId) {
  // 1. Cambiar estado en la tabla
  const { error: updateError } = await supabase
    .from('facturas')
    .update({
      estado: 'pagada',
      fecha_pago: new Date()
    })
    .eq('id', facturaId);

  if (updateError) {
    console.log('Error actualizando factura:', updateError);
    return;
  }

  // 2. Obtener datos de la factura para generar PDF
  const { data: facturaData, error: facturaError } = await supabase
    .from('facturas')
    .select('*')
    .eq('id', facturaId)
    .single();

  if (facturaError) {
    console.log('Error obteniendo factura:', facturaError);
    return;
  }

  // 3. Llamar a la función Edge para generar PDF
  const pdfResponse = await fetch(
    'https://YOUR-SUPABASE-PROJECT.supabase.co/functions/v1/factura-pdf',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer YOUR_SERVICE_ROLE_KEY`
      },
      body: JSON.stringify({
        facturaId: facturaId
      })
    }
  );

  const pdfBlob = await pdfResponse.blob();

  // 4. Subir PDF a Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('facturas-pdf')
    .upload(`factura_${facturaId}.pdf`, pdfBlob, {
      contentType: 'application/pdf',
      upsert: true
    });

  if (uploadError) {
    console.log('Error subiendo PDF:', uploadError);
    return;
  }

  // 5. Obtener email del cliente
  const { data: clienteData, error: clienteError } = await supabase
    .from('clientes')
    .select('email')
    .eq('id', facturaData.cliente_id)
    .single();

  if (clienteError) {
    console.log('Error obteniendo email del cliente:', clienteError);
    return;
  }

  // 6. Enviar email con el PDF
  await fetch('https://YOUR-SUPABASE-PROJECT.supabase.co/functions/v1/enviar-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer YOUR_SERVICE_ROLE_KEY`
    },
    body: JSON.stringify({
      email: clienteData.email,
      asunto: 'Factura pagada',
      mensaje: 'Adjuntamos su factura en PDF.',
      archivo: `factura_${facturaId}.pdf`
    })
  });

  console.log('Factura marcada como pagada y PDF enviado.');
}
