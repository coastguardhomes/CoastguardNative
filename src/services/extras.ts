import { supabase } from './supabase';

export async function createExtraInvoice(data) {
  const { error } = await supabase.from('facturas').insert({
    cliente_id: data.clienteId,
    propiedad_id: data.propiedadId,

    // Parte 1: Gestión del técnico (si ya está cobrada, se pone 0)
    gestion_tecnico: data.gestionTecnico ? 25 : 0,

    // Parte 2: Servicios reales
    apertura: data.apertura ? 30 : 0,
    cierre: data.cierre ? 30 : 0,

    supervision_horas: data.supervisionHoras,
    supervision_total: data.supervisionHoras * 35,

    precio_tecnico: data.precioTecnico,
    materiales: data.materiales,

    // Total calculado en la pantalla
    total: data.total,

    estado: 'pendiente',
    fecha: new Date()
  });

  if (error) {
    console.log('Error creando factura extra:', error);
  }
}
