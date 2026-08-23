import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

const COLOR_DORADO = "#e0b034";
const FONDO_PRINCIPAL = "#030509";
const FONDO_TARJETA = "linear-gradient(145deg, #0b1320 0%, #04070d 100%)";
const BORDE_DORADO_FINO = "1px solid rgba(224, 176, 52, 0.4)";
const SOMBRA_LUXURY = "0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 20px rgba(224, 176, 52, 0.12)";
const TEXTO_DORADO_BRILLO = { color: COLOR_DORADO, textShadow: "0 0 12px rgba(224, 176, 52, 0.6)" };

export default function VerFactura() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [factura, setFactura] = useState(null);
  const [extra, setExtra] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError('');

      // 1. Cargar la factura
      const { data: facturaData, error: facturaErr } = await supabase
        .from('facturas')
        .select('*')
        .eq('id', id)
        .single();

      if (facturaErr) throw facturaErr;
      setFactura(facturaData);

      // 2. Cargar el extra asociado
      const { data: extraData, error: extraErr } = await supabase
        .from('extras')
        .select('*')
        .eq('factura_id', id)
        .maybeSingle();

      if (!extraErr && extraData) {
        setExtra(extraData);
      }
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('No se pudieron cargar los datos de la factura.');
    } finally {
      setLoading(false);
    }
  };

  // Marcar como pagada y asegurar el envío al técnico (Usando UPSERT para evitar que falle)
  const marcarPagadaYEnviarTecnico = async () => {
    try {
      setSaving(true);

      const { error: errFactura } = await supabase
        .from('facturas')
        .update({ estado: 'pagada' })
        .eq('id', id);

      if (errFactura) throw errFactura;

      // Upsert en la tabla extras para asegurar que siempre exista el registro
      const { error: errExtra } = await supabase
        .from('extras')
        .upsert({
          factura_id: id,
          descripcion: factura.descripcion || 'Trabajo extra',
          estado: 'pendiente_tecnico'
        }, { onConflict: 'factura_id' });

      if (errExtra) console.warn('Aviso en extras upsert:', errExtra);

      alert('¡Factura marcada como pagada y extra enviado al técnico con éxito!');
      cargarDatos();
    } catch (err) {
      console.error('Error al procesar:', err);
      alert('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Enviar al cliente final
  const enviarAlCliente = async () => {
    try {
      setSaving(true);
      const { error: err } = await supabase
        .from('facturas')
        .update({ estado: 'enviado_cliente' })
        .eq('id', id);

      if (err) throw err;
      
      setFactura(prev => ({ ...prev, estado: 'enviado_cliente' }));
      alert('¡Factura y trabajo extra enviados al cliente con éxito!');
    } catch (err) {
      console.error('Error al enviar al cliente:', err);
      alert('No se pudo enviar al cliente.');
    } finally {
      setSaving(false);
    }
  };

  // Borrar factura y extra
  const borrarFacturaExtra = async () => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta factura y su trabajo extra asociado?')) {
      return;
    }

    try {
      setSaving(true);
      await supabase.from('extras').delete().eq('factura_id', id);
      const { error: err } = await supabase.from('facturas').delete().eq('id', id);

      if (err) throw err;

      alert('Factura eliminada correctamente.');
      navigate('/facturas');
    } catch (err) {
      console.error('Error al borrar:', err);
      alert('No se pudo borrar la factura.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: FONDO_PRINCIPAL, minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'Inter, sans-serif' }}>
        <h3 style={TEXTO_DORADO_BRILLO}>Cargando detalle de la factura...</h3>
      </div>
    );
  }

  if (error || !factura) {
    return (
      <div style={{ backgroundColor: FONDO_PRINCIPAL, minHeight: '100vh', padding: '20px', fontFamily: 'Inter, sans-serif', color: '#fff' }}>
        <button onClick={() => navigate('/facturas')} style={estilos.botonVolver}>← Volver</button>
        <p style={{ color: '#ef4444', textAlign: 'center', marginTop: '40px' }}>{error || 'Factura no encontrada.'}</p>
      </div>
    );
  }

  const tecnicoFinalizado = 
    (extra && (extra.estado === 'finalizado' || extra.estado === 'revisado')) || 
    (factura.estado === 'finalizado');

  // Obtener la descripción y las fotos combinando extra y factura de forma inteligente
  const descripcionFinal = extra?.descripcion || factura.descripcion || 'Sin descripción';
  const fotosFinales = (extra?.fotos && extra.fotos.length > 0) ? extra.fotos : (factura?.fotos || []);

  return (
    <div style={estilos.pagina}>
      <div style={estilos.contenedor}>
        
        {/* Cabecera */}
        <div style={estilos.cabecera}>
          <button onClick={() => navigate('/facturas')} style={estilos.botonVolver}>
            ← Volver
          </button>
          <h2 style={estilos.titulo}>Factura {factura.numero || `#${factura.id}`}</h2>
        </div>

        {/* Tarjeta de Datos de la Factura */}
        <div style={estilos.tarjeta}>
          <h3 style={{ ...TEXTO_DORADO_BRILLO, fontSize: '13px', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
            Información Financiera
          </h3>
          <div style={estilos.filaInfo}>
            <span style={estilos.etiqueta}>Estado Factura:</span>
            <span style={{ 
              ...estilos.valorEstado, 
              color: factura.estado === 'pagada' || factura.estado === 'enviado_cliente' ? '#34d399' : COLOR_DORADO 
            }}>
              {factura.estado}
            </span>
          </div>
          <div style={estilos.filaInfo}>
            <span style={estilos.etiqueta}>Total:</span>
            <span style={{ ...estilos.valor, color: COLOR_DORADO, fontSize: '15px', fontWeight: '900' }}>
              {Number(factura.total || 0).toFixed(2)} €
            </span>
          </div>

          {/* Botón de Pagada / Enviar a Técnico */}
          {factura.estado !== 'pagada' && factura.estado !== 'enviado_cliente' && (
            <div style={{ marginTop: '8px' }}>
              <button 
                onClick={marcarPagadaYEnviarTecnico} 
                disabled={saving}
                style={estilos.botonVerde}
              >
                💳 Marcar Pagada y Enviar al Técnico
              </button>
            </div>
          )}
        </div>

        {/* Sección del Trabajo Extra del Técnico */}
        <div style={estilos.tarjeta}>
          <h3 style={{ ...TEXTO_DORADO_BRILLO, fontSize: '13px', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
            Inspección / Trabajo del Técnico
          </h3>

          <div style={estilos.filaInfo}>
            <span style={estilos.etiqueta}>Estado Técnico:</span>
            <span style={{ 
              ...estilos.valorEstado, 
              color: tecnicoFinalizado ? '#34d399' : '#f59e0b' 
            }}>
              {tecnicoFinalizado ? 'Finalizado / Revisado' : (extra?.estado || 'Pendiente')}
            </span>
          </div>

          {tecnicoFinalizado ? (
            <div style={{ background: 'rgba(11, 19, 32, 0.7)', padding: '12px', borderRadius: '10px', border: BORDE_DORADO_FINO, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <span style={{ fontSize: '11px', color: COLOR_DORADO, fontWeight: '700', textTransform: 'uppercase' }}>Detalles y Observaciones:</span>
                <p style={{ fontSize: '13px', color: '#fff', margin: '4px 0 0 0', lineHeight: '1.4', whiteSpace: 'pre-wrap' }}>
                  {descripcionFinal}
                </p>
              </div>

              {fotosFinales.length > 0 ? (
                <div>
                  <span style={{ fontSize: '11px', color: COLOR_DORADO, fontWeight: '700', textTransform: 'uppercase' }}>Fotos de evidencia:</span>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                    {fotosFinales.map((url, idx) => (
                      <img key={idx} src={url} alt={`Evidencia ${idx}`} style={{ width: '65px', height: '65px', objectFit: 'cover', borderRadius: '8px', border: BORDE_DORADO_FINO }} />
                    ))}
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: '11px', color: '#888', fontStyle: 'italic', margin: 0 }}>No se adjuntaron fotos en esta inspección.</p>
              )}
            </div>
          ) : (
            <p style={{ fontSize: '12px', color: '#f59e0b', margin: 0 }}>
              ⏳ El técnico aún está realizando la inspección o no la ha enviado.
            </p>
          )}
        </div>

        {/* Acciones Finales: Enviar al cliente / Borrar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
          {tecnicoFinalizado && factura.estado !== 'enviado_cliente' && (
            <button 
              onClick={enviarAlCliente} 
              disabled={saving}
              style={estilos.botonDorado}
            >
              📤 Enviar Factura y Extra al Cliente
            </button>
          )}

          <button 
            onClick={borrarFacturaExtra} 
            disabled={saving}
            style={estilos.botonRojo}
          >
            🗑️ Borrar Factura y Extra
          </button>
        </div>

      </div>
    </div>
  );
}

const estilos = {
  pagina: {
    backgroundColor: FONDO_PRINCIPAL,
    minHeight: '100vh',
    padding: '16px',
    display: 'flex',
    justifyContent: 'center',
    fontFamily: 'Inter, sans-serif',
    boxSizing: 'border-box'
  },
  contenedor: {
    width: '100%',
    maxWidth: '480px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    boxSizing: 'border-box'
  },
  cabecera: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: BORDE_DORADO_FINO,
    paddingBottom: '12px'
  },
  titulo: {
    ...TEXTO_DORADO_BRILLO,
    fontSize: '17px',
    fontWeight: '900',
    margin: 0,
    textTransform: 'uppercase'
  },
  botonVolver: {
    background: 'transparent',
    border: BORDE_DORADO_FINO,
    color: COLOR_DORADO,
    padding: '6px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: '700'
  },
  tarjeta: {
    background: FONDO_TARJETA,
    border: BORDE_DORADO_FINO,
    borderRadius: '16px',
    padding: '16px',
    boxShadow: SOMBRA_LUXURY,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    boxSizing: 'border-box'
  },
  filaInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  etiqueta: {
    fontSize: '12px',
    color: COLOR_DORADO,
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  valor: {
    fontSize: '13px',
    color: '#fff',
    fontWeight: '600',
    textAlign: 'right',
    maxWidth: '65%'
  },
  valorEstado: {
    fontSize: '11px',
    fontWeight: '900',
    textTransform: 'uppercase',
    border: '1px solid',
    borderRadius: '20px',
    padding: '2px 8px'
  },
  botonVerde: {
    width: '100%',
    padding: '12px',
    background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
    color: '#fff',
    border: '1px solid rgba(16, 185, 129, 0.6)',
    borderRadius: '12px',
    fontWeight: '900',
    fontSize: '12px',
    cursor: 'pointer',
    textTransform: 'uppercase',
    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
  },
  botonDorado: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #e0b034 0%, #8b6508 100%)',
    color: '#030509',
    border: BORDE_DORADO_FINO,
    borderRadius: '16px',
    fontWeight: '900',
    fontSize: '13px',
    cursor: 'pointer',
    textTransform: 'uppercase',
    boxShadow: SOMBRA_LUXURY
  },
  botonRojo: {
    width: '100%',
    padding: '12px',
    background: 'rgba(239, 68, 68, 0.15)',
    color: '#ef4444',
    border: '1px solid rgba(239, 68, 68, 0.4)',
    borderRadius: '14px',
    fontWeight: '900',
    fontSize: '12px',
    cursor: 'pointer',
    textTransform: 'uppercase'
  }
};
