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

      // 2. Cargar el extra asociado (si lo hay)
      const { data: extraData, error: extraErr } = await supabase
        .from('extras')
        .select('*')
        .eq('factura_id', id)
        .maybeSingle();

      if (!extraErr && extraData) {
        setExtra(extraData);
      }
    } catch (err) {
      console.error('Error al cargar detalles:', err);
      setError('No se pudieron cargar los datos de la factura o el extra.');
    } finally {
      setLoading(false);
    }
  };

  // Cambiar estado de la factura (ej: pagada) y enviar/gestionar el extra al técnico
  const actualizarEstadoFactura = async (nuevoEstado) => {
    try {
      setSaving(true);
      const { error: err } = await supabase
        .from('facturas')
        .update({ estado: nuevoEstado })
        .eq('id', id);

      if (err) throw err;
      setFactura(prev => ({ ...prev, estado: nuevoEstado }));
      alert('Estado de la factura actualizado correctamente.');
    } catch (err) {
      console.error('Error al actualizar factura:', err);
      alert('Error al actualizar la factura.');
    } finally {
      setSaving(false);
    }
  };

  // Enviar el extra al técnico (crea o marca el registro en la tabla extras)
  const enviarExtraATecnico = async () => {
    try {
      setSaving(true);
      if (extra) {
        // Actualizar existente
        const { error: err } = await supabase
          .from('extras')
          .update({ estado: 'pendiente_tecnico' })
          .eq('id', extra.id);
        if (err) throw err;
      } else {
        // Crear nuevo registro en tabla extras vinculado a esta factura
        const { error: err } = await supabase
          .from('extras')
          .insert([{
            factura_id: id,
            descripcion: factura.descripcion || 'Trabajo extra',
            estado: 'pendiente_tecnico'
          }]);
        if (err) throw err;
      }
      
      alert('Trabajo extra enviado al técnico con éxito.');
      cargarDatos();
    } catch (err) {
      console.error('Error al enviar extra:', err);
      alert('No se pudo enviar el extra al técnico.');
    } finally {
      setSaving(false);
    }
  };

  // Mandar factura / extra al cliente final
  const enviarAlCliente = async () => {
    try {
      setSaving(true);
      const { error: err } = await supabase
        .from('facturas')
        .update({ estado: 'enviado_cliente' })
        .eq('id', id);

      if (err) throw err;
      setFactura(prev => ({ ...prev, estado: 'enviado_cliente' }));
      alert('¡Factura / Extra enviado al cliente con éxito!');
    } catch (err) {
      console.error('Error al enviar al cliente:', err);
      alert('No se pudo enviar al cliente.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: FONDO_PRINCIPAL, minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'Inter, sans-serif' }}>
        <h3 style={TEXTO_DORADO_BRILLO}>Cargando detalles de la factura...</h3>
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

  const esRevisadoPorTecnico = extra && (extra.estado === 'finalizado' || extra.estado === 'revisado');

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
          <h3 style={{ ...TEXTO_DORADO_BRILLO, fontSize: '14px', margin: '0 0 10px 0', textTransform: 'uppercase' }}>
            Detalles Financieros
          </h3>
          <div style={estilos.filaInfo}>
            <span style={estilos.etiqueta}>Estado Factura:</span>
            <span style={{ ...estilos.valorEstado, color: factura.estado === 'pagada' ? '#34d399' : COLOR_DORADO }}>
              {factura.estado}
            </span>
          </div>
          <div style={estilos.filaInfo}>
            <span style={estilos.etiqueta}>Total:</span>
            <span style={{ ...estilos.valor, color: COLOR_DORADO, fontSize: '15px', fontWeight: '900' }}>
              {Number(factura.total || 0).toFixed(2)} €
            </span>
          </div>
          <div style={estilos.filaInfo}>
            <span style={estilos.etiqueta}>Concepto:</span>
            <span style={estilos.valor}>{factura.descripcion || 'Sin descripción'}</span>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            {factura.estado !== 'pagada' && (
              <button 
                onClick={() => actualizarEstadoFactura('pagada')} 
                disabled={saving}
                style={estilos.botonVerde}
              >
                💳 Aceptar como Pagada
              </button>
            )}
          </div>
        </div>

        {/* Sección de Gestión del Extra / Técnico */}
        <div style={estilos.tarjeta}>
          <h3 style={{ ...TEXTO_DORADO_BRILLO, fontSize: '14px', margin: '0 0 10px 0', textTransform: 'uppercase' }}>
            Gestión de Trabajo Extra (Técnico)
          </h3>

          {!extra ? (
            <div>
              <p style={{ fontSize: '12px', color: '#aaa', marginBottom: '12px' }}>
                Este elemento no tiene un flujo de extra activo asignado todavía.
              </p>
              <button 
                onClick={enviarExtraATecnico} 
                disabled={saving}
                style={estilos.botonAzul}
              >
                🛠️ Enviar Extra al Técnico
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={estilos.filaInfo}>
                <span style={estilos.etiqueta}>Estado Técnico:</span>
                <span style={{ 
                  ...estilos.valorEstado, 
                  color: esRevisadoPorTecnico ? '#34d399' : '#f59e0b' 
                }}>
                  {esRevisadoPorTecnico ? 'Revisado / Finalizado' : extra.estado}
                </span>
              </div>

              {esRevisadoPorTecnico ? (
                <div style={{ background: 'rgba(11, 19, 32, 0.6)', padding: '10px', borderRadius: '8px', border: BORDE_DORADO_FINO }}>
                  <p style={{ fontSize: '12px', color: '#ccc', margin: '4px 0' }}>
                    <strong style={{ color: COLOR_DORADO }}>Informe Técnico:</strong> {extra.descripcion}
                  </p>
                  {extra.fotos && extra.fotos.length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                      {extra.fotos.map((url, idx) => (
                        <img key={idx} src={url} alt="Evidencia" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px', border: BORDE_DORADO_FINO }} />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p style={{ fontSize: '12px', color: '#f59e0b' }}>
                  ⏳ Esperando a que el técnico complete la inspección del extra...
                </p>
              )}
            </div>
          )}
        </div>

        {/* Botón Final para Enviar al Cliente */}
        <div style={{ marginTop: '4px' }}>
          <button 
            onClick={enviarAlCliente} 
            disabled={saving}
            style={{
              ...estilos.botonDoradoGris,
              width: '100%',
              opacity: saving ? 0.6 : 1
            }}
          >
            📤 Enviar Factura / Extra al Cliente
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
    gap: '16px',
    boxSizing: 'border-box'
  },
  cabecera: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: BORDE_DORADO_FINO,
    paddingBottom: '14px'
  },
  titulo: {
    ...TEXTO_DORADO_BRILLO,
    fontSize: '18px',
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
    fontSize: '12px',
    fontWeight: '900',
    textTransform: 'uppercase',
    border: '1px solid',
    borderRadius: '20px',
    padding: '2px 8px'
  },
  botonVerde: {
    flex: 1,
    padding: '10px',
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
  botonAzul: {
    width: '100%',
    padding: '10px',
    background: 'linear-gradient(135deg, #38bdf8 0%, #1e3a8a 100%)',
    color: '#fff',
    border: '1px solid rgba(56, 189, 248, 0.6)',
    borderRadius: '12px',
    fontWeight: '900',
    fontSize: '12px',
    cursor: 'pointer',
    textTransform: 'uppercase',
    boxShadow: '0 4px 15px rgba(56, 189, 248, 0.3)'
  },
  botonDoradoGris: {
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
  }
};
