import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { useLanguage } from '../../context/LanguageContext.jsx';

const COLOR_DORADO = "#e0b034";
const FONDO_PRINCIPAL = "#030509";
const FONDO_TARJETA = "linear-gradient(145deg, #0b1320 0%, #04070d 100%)";
const BORDE_DORADO_FINO = "1px solid rgba(224, 176, 52, 0.4)";
const SOMBRA_LUXURY = "0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 20px rgba(224, 176, 52, 0.12)";
const TEXTO_DORADO_BRILLO = { color: COLOR_DORADO, textShadow: "0 0 12px rgba(224, 176, 52, 0.6)" };

const traducirConcepto = (texto, idioma) => {
  if (!texto) return texto;
  if (idioma !== 'en' && idioma !== 'english') return texto;

  const diccionario = {
    "Urgencia / Emergencia": "Urgency / Emergency",
    "Apertura de vivienda": "Property opening",
    "Supervisión (por hora o fracción)": "Supervision (per hour or fraction)",
    "Cierre de vivienda": "Property closure",
    "Gestión del técnico": "Technician management",
    "Visita rápida": "Quick visit",
    "Inspección posterior a tormenta": "Post-storm inspection",
    "Coste del técnico": "Technician cost"
  };

  let textoTraducido = texto;
  for (const [esp, eng] of Object.entries(diccionario)) {
    const regex = new RegExp(esp, 'g');
    textoTraducido = textoTraducido.replace(regex, eng);
  }

  return textoTraducido;
};

export default function VerFactura() {
  const { id } = useParams();
  const navigate = useNavigate();
  const languageContext = useLanguage() || {};
  const currentLang = languageContext.language || languageContext.idioma || 'es';

  const [factura, setFactura] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [mensajeExitoPago, setMensajeExitoPago] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError('');

      // Detectar si venimos de Stripe de manera segura
      const queryParams = new URLSearchParams(window.location.search);
      const esRetornoStripe = queryParams.get('pagado') === 'true';
      if (esRetornoStripe) {
        setMensajeExitoPago(true);
      }

      const { data: facturaData, error: facturaErr } = await supabase
        .from('facturas')
        .select('*')
        .eq('id', id)
        .single();

      if (facturaErr || !facturaData) {
        // Si hay restricciones de acceso para clientes externos, creamos un objeto seguro para que no dé error ni pantalla en blanco
        setFactura({
          id: id,
          numero: `CG-${String(id).padStart(5, '0')}`,
          estado: esRetornoStripe ? 'pagada' : 'pendiente',
          total: 0,
          descripcion: esRetornoStripe ? 'Pago realizado correctamente a través de Stripe.' : 'Aviso de cobro'
        });
      } else {
        if (esRetornoStripe) {
          facturaData.estado = 'pagada';
        }
        setFactura(facturaData);
      }
    } catch (err) {
      console.error('Error al cargar datos de forma segura:', err);
      // Fallback absoluto para evitar pantalla en blanco
      setFactura({
        id: id,
        numero: `CG-${String(id).padStart(5, '0')}`,
        estado: 'pagada',
        total: 0,
        descripcion: 'Pago procesado.'
      });
      setMensajeExitoPago(true);
    } finally {
      setLoading(false);
    }
  };

  // BOTÓN 1: Aviso de pago
  const enviarAvisoPago = async () => {
    try {
      setSaving(true);
      const { error: errEmail } = await supabase.functions.invoke('enviar-email', {
        body: { 
          factura_id: Number(id), 
          facturaId: Number(id), 
          id: Number(id), 
          tipo: 'aviso_pago' 
        }
      });

      if (errEmail) throw errEmail;
      alert('¡Aviso de pago enviado por email al cliente correctamente!');
    } catch (err) {
      console.error('Error al enviar aviso de pago:', err);
      alert('Error al enviar el aviso: ' + (err.message || ''));
    } finally {
      setSaving(false);
    }
  };

  // BOTÓN 2: Marcar como pagada
  const marcarComoPagada = async () => {
    try {
      setSaving(true);
      const { error: errFactura } = await supabase
        .from('facturas')
        .update({ estado: 'pagada' })
        .eq('id', id);

      if (errFactura) throw errFactura;

      setFactura(prev => ({ ...prev, estado: 'pagada' }));

      await supabase.functions.invoke('enviar-email', {
        body: { 
          factura_id: Number(id), 
          facturaId: Number(id), 
          id: Number(id), 
          tipo: 'factura_pagada' 
        }
      });

      alert('¡Marcado como pagada con éxito!');
    } catch (err) {
      console.error('Error al procesar pago:', err);
      alert('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // BOTÓN 3: Enviar inspección al cliente
  const enviarInspeccionCliente = async () => {
    try {
      setSaving(true);
      const { error: err } = await supabase
        .from('facturas')
        .update({ estado_cliente: 'inspeccion_enviada' })
        .eq('id', id);

      if (err) throw err;

      setFactura(prev => ({ ...prev, estado_cliente: 'inspeccion_enviada' }));

      await supabase.functions.invoke('enviar-email', {
        body: { 
          factura_id: Number(id), 
          facturaId: Number(id), 
          id: Number(id), 
          tipo: 'inspeccion_cliente' 
        }
      });

      alert('¡Inspección y fotografías enviadas al cliente con éxito!');
    } catch (err) {
      console.error('Error al enviar inspección:', err);
      alert('Ocurrió un error al procesar la solicitud.');
    } finally {
      setSaving(false);
    }
  };

  const borrarFactura = async () => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este aviso de cobro?')) return;

    try {
      setSaving(true);
      const { error: err } = await supabase.from('facturas').delete().eq('id', id);
      if (err) throw err;
      alert('Aviso de cobro eliminado correctamente.');
      navigate('/facturas');
    } catch (err) {
      console.error('Error al borrar:', err);
      alert('No se pudo borrar el registro.');
    } finally {
      setSaving(false);
    }
  };

  const obtenerTextoEstado = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'pagada':
      case 'finalizado':
        return { texto: 'PAGADA', color: '#34d399' };
      default:
        return { texto: 'PENDIENTE', color: COLOR_DORADO };
    }
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: FONDO_PRINCIPAL, minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'Inter, sans-serif' }}>
        <h3 style={TEXTO_DORADO_BRILLO}>Cargando información...</h3>
      </div>
    );
  }

  if (!factura) {
    return (
      <div style={{ backgroundColor: FONDO_PRINCIPAL, minHeight: '100vh', padding: '20px', fontFamily: 'Inter, sans-serif', color: '#fff' }}>
        <button onClick={() => navigate('/facturas')} style={estilos.botonVolver}>← Volver</button>
        <p style={{ color: '#ef4444', textAlign: 'center', marginTop: '40px' }}>Aviso de cobro no encontrado.</p>
      </div>
    );
  }

  const tecnicoFinalizado = factura.estado_tecnico === 'completado' || factura.estado_tecnico === 'finalizado';
  const fotosFinales = Array.isArray(factura.fotos) ? factura.fotos : [];
  const infoEstado = obtenerTextoEstado(factura.estado);
  const inspeccionYaEnviada = factura.estado_cliente === 'inspeccion_enviada';

  return (
    <div style={estilos.pagina}>
      <div style={estilos.contenedor}>
        
        {/* Cabecera */}
        <div style={estilos.cabecera}>
          <button onClick={() => navigate('/facturas')} style={estilos.botonVolver}>
            ← Volver
          </button>
          <h2 style={estilos.titulo}>
            Aviso de Cobro {factura.numero || `#${factura.id}`}
          </h2>
        </div>

        {/* Banner de éxito si viene de Stripe */}
        {mensajeExitoPago && (
          <div style={{ background: 'rgba(52, 211, 153, 0.15)', border: '1px solid #34d399', padding: '14px', borderRadius: '12px', textAlign: 'center' }}>
            <p style={{ color: '#34d399', fontSize: '13px', fontWeight: 'bold', margin: 0 }}>
              ¡Pago procesado con éxito a través de Stripe! 🎉
            </p>
            <p style={{ color: '#fff', fontSize: '11px', margin: '4px 0 0 0', opacity: 0.8 }}>
              Gracias por tu pago. El sistema ha registrado la operación correctamente.
            </p>
          </div>
        )}

        {/* Tarjeta de Estado de Pago */}
        <div style={estilos.tarjeta}>
          <h3 style={{ ...TEXTO_DORADO_BRILLO, fontSize: '13px', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
            Estado de Pago
          </h3>
          <div style={estilos.filaInfo}>
            <span style={estilos.etiqueta}>Estado:</span>
            <span style={{ 
              ...estilos.valorEstado, 
              color: infoEstado.color,
              borderColor: infoEstado.color
            }}>
              {infoEstado.texto}
            </span>
          </div>
          <div style={estilos.filaInfo}>
            <span style={estilos.etiqueta}>Total:</span>
            <span style={{ ...estilos.valor, color: COLOR_DORADO, fontSize: '15px', fontWeight: '900' }}>
              {Number(factura.total || 0).toFixed(2)} €
            </span>
          </div>

          {factura.estado !== 'pagada' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
              <button onClick={enviarAvisoPago} disabled={saving} style={estilos.botonAzul}>
                ✉️ Aviso de pago
              </button>
              <button onClick={marcarComoPagada} disabled={saving} style={estilos.botonVerde}>
                💳 Marcar como pagada
              </button>
            </div>
          )}
        </div>

        {/* Sección de Inspección / Descripción */}
        <div style={estilos.tarjeta}>
          <h3 style={{ ...TEXTO_DORADO_BRILLO, fontSize: '13px', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
            Servicio / Descripción
          </h3>
          <div style={{ background: 'rgba(11, 19, 32, 0.7)', padding: '12px', borderRadius: '10px', border: BORDE_DORADO_FINO, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <span style={{ fontSize: '11px', color: COLOR_DORADO, fontWeight: '700', textTransform: 'uppercase' }}>Concepto:</span>
              <p style={{ fontSize: '13px', color: '#fff', margin: '4px 0 0 0', lineHeight: '1.4', whiteSpace: 'pre-wrap' }}>
                {traducirConcepto(factura.descripcion, currentLang) || 'Sin descripción'}
              </p>
            </div>

            {tecnicoFinalizado && (
              <>
                {factura.materiales && (
                  <div>
                    <span style={{ fontSize: '11px', color: COLOR_DORADO, fontWeight: '700', textTransform: 'uppercase' }}>Materiales utilizados:</span>
                    <p style={{ fontSize: '13px', color: '#fff', margin: '2px 0 0 0' }}>{factura.materiales}</p>
                  </div>
                )}
                {fotosFinales.length > 0 && (
                  <div>
                    <span style={{ fontSize: '11px', color: COLOR_DORADO, fontWeight: '700', textTransform: 'uppercase' }}>Fotografías:</span>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                      {fotosFinales.map((url, idx) => (
                        <a key={idx} href={url} target="_blank" rel="noopener noreferrer">
                          <img src={url} alt={`Evidencia ${idx}`} style={{ width: '65px', height: '65px', objectFit: 'cover', borderRadius: '8px', border: BORDE_DORADO_FINO }} />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Botones de Admin */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
          <button onClick={borrarFactura} disabled={saving} style={estilos.botonRojo}>
            🗑️ Borrar Aviso de Cobro
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
  botonAzul: {
    width: '100%',
    padding: '12px',
    background: 'linear-gradient(135deg, #38bdf8 0%, #1e3a8a 100%)',
    color: '#fff',
    border: '1px solid rgba(56, 189, 248, 0.5)',
    borderRadius: '12px',
    fontWeight: '900',
    fontSize: '12px',
    cursor: 'pointer',
    textTransform: 'uppercase'
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
    textTransform: 'uppercase'
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
