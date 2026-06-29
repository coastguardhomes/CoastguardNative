import { supabase } from './supabase';
import { generarPDF } from './pdf';
import { enviarEmailFactura } from './email';

export async function marcarFacturaComoPagada(id) {
  await supabase
    .from('facturas')
    .update({ estado: 'pagada', fecha_pago: new Date() })
    .eq('id', id);

  const pdfUrl = await generarPDF(id);

  await supabase
    .from('facturas')
    .update({ pdf_url: pdfUrl })
    .eq('id', id);

  const { data: factura } = await supabase
    .from('facturas')
    .select('cliente_id')
    .eq('id', id)
    .single();

  const { data: cliente } = await supabase
    .from('clientes')
    .select('email')
    .eq('id', factura.cliente_id)
    .single();

  await enviarEmailFactura(cliente.email, pdfUrl);
}
