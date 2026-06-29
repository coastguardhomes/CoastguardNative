import { supabase } from './supabase';
import { generarPDF } from './pdf';
import { enviarEmailFactura } from './email';

export async function createExtraInvoice(data) {
  const { data: factura, error } = await supabase
    .from('facturas')
    .insert({
      cliente_id: data.clienteId,
      propiedad_id: data.propiedadId,
      extras: data.extras,
      horas: data.horas,
      precio_tecnico: data.precioTecnico,
      materiales: data.materiales,
      total: data.total,
      estado: 'pendiente',
      fecha: new Date()
    })
    .select()
    .single();

  if (error) return null;

  const pdfUrl = await generarPDF(factura.id);

  await supabase
    .from('facturas')
    .update({ pdf_url: pdfUrl })
    .eq('id', factura.id);

  const { data: cliente } = await supabase
    .from('clientes')
    .select('email')
    .eq('id', data.clienteId)
    .single();

  await enviarEmailFactura(cliente.email, pdfUrl);

  return factura.id;
}
