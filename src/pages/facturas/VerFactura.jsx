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

  let currentLang = 'es';
  try {
    const langCtx = useLanguage();
    currentLang = langCtx?.language || langCtx?.idioma || 'es';
  } catch (e) {
    currentLang = 'es';
  }

  const [factura, setFactura] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [procesando, setProcesando] = useState(false);

  const cargarDatosSeguros = async () => {
    try {
      setErrorMsg('');
      if (!id) throw new Error("ID de factura no proporcionado.");

      const { data: facturaData, error: facturaError } = await supabase
        .from('facturas')
        .select('*')
        .eq('id', id)
        .single();

      if (facturaError) throw facturaError;
      if (!facturaData) throw new Error("No se encontró el aviso de cobro.");

      setFactura(facturaData);

      if (facturaData.cliente_id) {
        const { data: clienteData } = await supabase
          .from('clientes')
          .select('*')
          .eq('id', facturaData.cliente_id)
          .single();

        if (clienteData) setCliente(clienteData);
      }
    } catch (err) {
      console.error('Error al cargar la factura:', err);
      setErrorMsg(err.message || 'No se pudo cargar la información.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatosSeguros();
  }, [id]);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const fuePagado = queryParams.get('pagado');

    if (fuePagado === 'true' && factura && factura.estado?.toLowerCase() !== 'pagada') {
      async function confirmarPagoAutomatico() {
        try {
          await supabase.from('facturas').update({ estado: 'pagada' }).eq('id', id);
          setFactura(prev => ({ ...prev, estado: 'pagada' }));
          
          await supabase.functions.invoke('enviar-email', {
            body: { factura_id: Number(id), facturaId: Number(id), id: Number(id), tipo: 'factura_pagada' }
          });
        } catch (err) {
          console.error("Error al actualizar el pago automático:", err);
        }
      }
      confirmarPagoAutomatico();
    }

    let ultimoChequeo = 0;
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const ahora = Date.now();
        if (ahora - ultimoChequeo > 3000) {
          ultimoChequeo = ahora;
          cargarDatosSeguros();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [factura, id]);

  const idiomaFinal = cliente?.idioma || cliente?.language || currentLang;

  const enviarAvisoPago = async () => {
    try {
      setProcesando(true);
      const { error: errEmail } = await supabase.functions.invoke('enviar-email', {
        body: { 
          factura_id: Number(id), 
          facturaId: Number(id), 
          id: Number(id), 
          tipo: 'aviso_pago',
          amount: Number(factura.total) * 100,
          customerEmail: cliente?.email,
          extraId: id,
          title: `Aviso de Cobro ${factura.numero || `#${factura.id}`}`
        }
      });
      if (errEmail) throw errEmail;
      alert('¡Aviso de pago enviado por email al cliente correctamente!');
    } catch (err) {
      alert('Error al enviar el aviso: ' + (err.message || ''));
    } finally {
      setProcesando(false);
    }
  };

  // ==========================================
  // BOTÓN MEJORADO: MARCAR COMO PAGADA Y FORZAR ENVÍO DE FACTURA
  // ==========================================
  const marcarComoPagada = async () => {
    try {
      setProcesando(true);
      
      // 1. Actualizar estado en Supabase
      const { error: errDb } = await supabase.from('facturas').update({ estado: 'pagada' }).eq('id', id);
      if (errDb) throw errDb;

      setFactura(prev => ({ ...prev, estado: 'pagada' }));

      // 2. Llamar a la Edge Function para disparar el correo y la orden hacia Stripe
      await supabase.functions.invoke('enviar-email', {
        body: { 
          factura_id: Number(id), 
          facturaId: Number(id), 
          id: Number(id), 
          tipo: 'factura_pagada',
          customerEmail: cliente?.email,
          amount: Number(factura.total) * 100,
          title: `Factura ${factura.numero || `#${factura.id}`}`
        }
      });

      alert('¡Marcado como pagada y factura/correo de pago enviado con éxito!');
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setProcesando(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este aviso de cobro?")) return;

    try {
      setProcesando(true);
      const { error } = await supabase.from('facturas').delete().eq('id', id);
      if (error) throw error;
      alert("Aviso de cobro eliminado correctamente.");
      navigate(-1);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setProcesando(false);
    }
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: FONDO_PRINCIPAL, minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'Inter, sans-serif' }}>
        <h3 style={TEXTO_DORADO_BRILLO}>Cargando detalle...</h3>
      </div>
    );
  }

  if (errorMsg || !factura) {
    return (
      <div style={{ backgroundColor: FONDO_PRINCIPAL, minHeight: '100vh', padding: '20px', color: '#fff', fontFamily: 'Inter, sans-serif', textAlign: 'center' }}>
        <h2 style={{ color: '#ef4444', marginTop: '40px' }}>⚠️ Error</h2>
        <p style={{ color: '#cbd5e1', fontSize: '14px' }}>{errorMsg || 'El registro no existe o no está accesible.'}</p>
        <button onClick={() => navigate(-1)} style={{ marginTop: '20px', padding: '12px 20px', background: COLOR_DORADO, border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', color: '#000' }}>
          Volver Atrás
        </button>
      </div>
    );
  }

  const esPagada = factura.estado?.toLowerCase() === 'pagada';
  const colorEstado = esPagada ? '#34d399' : COLOR_DORADO;
  const textoEstado = esPagada ? 'PAGADA' : 'PENDIENTE';
  const itemsDetalle = Array.isArray(factura.items) ? factura.items : [];
  const descripcionTraducida = traducirConcepto(factura.descripcion, idiomaFinal);

  return (
    <div style={estilos.pagina}>
      <div style={estilos.contenedor}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => navigate(-1)} style={estilos.botonVolver}>
            ← Volver
          </button>
          <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Panel de Administración</span>
        </div>

        <div style={estilos.cabecera}>
          <h2 style={estilos.titulo}>AVISO DE COBRO {factura.numero || `#${factura.id}`}</h2>
        </div>

        <div style={estilos.tarjeta}>
          <h3 style={{ ...TEXTO_DORADO_BRILLO, fontSize: '12px', margin: '0 0 8px 0', textTransform: 'uppercase' }}>Datos del Cliente</h3>
          <p style={{ fontSize: '13px', color: '#fff', margin: '4px 0' }}><strong>Nombre:</strong> {cliente?.nombre || 'N/A'}</p>
          <p style={{ fontSize: '13px', color: '#fff', margin: '4px 0' }}><strong>Email:</strong> {cliente?.email || 'N/A'}</p>
          <p style={{ fontSize: '13px', color: '#fff', margin: '4px 0' }}><strong>Teléfono:</strong> {cliente?.telefono || 'N/A'}</p>
        </div>

        <div style={estilos.tarjeta}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={estilos.etiqueta}>Fecha:</span>
            <span style={estilos.valor}>{factura.created_at ? factura.created_at.split('T')[0] : 'N/D'}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={estilos.etiqueta}>Estado:</span>
            <span style={{ ...estilos.valorEstado, color: colorEstado, borderColor: colorEstado }}>{textoEstado}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={estilos.etiqueta}>Importe Total:</span>
            <span style={{ fontSize: '16px', color: COLOR_DORADO, fontWeight: '900' }}>
              {Number(factura.total || 0).toFixed(2)} €
            </span>
          </div>

          <div style={{ marginTop: '10px', background: 'rgba(11, 19, 32, 0.7)', padding: '12px', borderRadius: '10px', border: BORDE_DORADO_FINO }}>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 4px 0', textTransform: 'uppercase', fontWeight: 'bold' }}>Descripción:</p>
            <p style={{ fontSize: '13px', color: '#fff', margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
              {descripcionTraducida || 'Sin descripción'}
            </p>
          </div>

          {!esPagada && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '15px' }}>
              <button onClick={enviarAvisoPago} disabled={procesando} style={estilos.botonAzul}>
                ✉️ Enviar Aviso de Pago (Stripe)
              </button>
              <button onClick={marcarComoPagada} disabled={procesando} style={estilos.botonVerde}>
                💳 Marcar como pagada y Enviar Factura
              </button>
            </div>
          )}
        </div>

        {itemsDetalle.length > 0 && (
          <div style={estilos.tarjeta}>
            <h3 style={{ ...TEXTO_DORADO_BRILLO, fontSize: '12px', margin: '0 0 10px 0', textTransform: 'uppercase' }}>Desglose de Conceptos</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {itemsDetalle.map((item, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '12px', color: '#e2e8f0', maxWidth: '70%' }}>{traducirConcepto(item.concepto || item.descripcion, idiomaFinal)}</span>
                  <span style={{ fontSize: '12px', color: COLOR_DORADO, fontWeight: 'bold' }}>{Number(item.precio || item.total || 0).toFixed(2)} €</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button onClick={handleDelete} disabled={procesando} style={estilos.botonEliminar}>
          {procesando ? 'Procesando...' : '🗑️ Eliminar Aviso de Cobro'}
        </button>

      </div>
    </div>
  );
}

const estilos = {
  pagina: { backgroundColor: FONDO_PRINCIPAL, minHeight: '100vh', padding: '16px', display: 'flex', justifyContent: 'center', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' },
  contenedor: { width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '14px', boxSizing: 'border-box' },
  botonVolver: { background: 'transparent', border: BORDE_DORADO_FINO, color: COLOR_DORADO, padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' },
  cabecera: { display: 'flex', justifyContent: 'center', alignItems: 'center', borderBottom: BORDE_DORADO_FINO, paddingBottom: '12px' },
  titulo: { ...TEXTO_DORADO_BRILLO, fontSize: '16px', fontWeight: '900', margin: 0, textTransform: 'uppercase', textAlign: 'center' },
  tarjeta: { background: FONDO_TARJETA, border: BORDE_DORADO_FINO, borderRadius: '16px', padding: '16px', boxShadow: SOMBRA_LUXURY, display: 'flex', flexDirection: 'column', boxSizing: 'border-box' },
  etiqueta: { fontSize: '12px', color: COLOR_DORADO, fontWeight: '700', textTransform: 'uppercase' },
  valor: { fontSize: '13px', color: '#fff', fontWeight: '600', textAlign: 'right' },
  valorEstado: { fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', border: '1px solid', borderRadius: '20px', padding: '2px 10px' },
  botonAzul: { width: '100%', padding: '12px', background: 'linear-gradient(135deg, #38bdf8 0%, #1e3a8a 100%)', color: '#fff', border: '1px solid rgba(56, 189, 248, 0.5)', borderRadius: '12px', fontWeight: '900', fontSize: '12px', cursor: 'pointer', textTransform: 'uppercase' },
  botonVerde: { width: '100%', padding: '12px', background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', color: '#fff', border: '1px solid rgba(16, 185, 129, 0.6)', borderRadius: '12px', fontWeight: '900', fontSize: '12px', cursor: 'pointer', textTransform: 'uppercase' },
  botonEliminar: { width: '100%', padding: '14px', background: 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)', color: '#fff', border: '1px solid rgba(239, 68, 68, 0.5)', borderRadius: '14px', fontWeight: '900', fontSize: '12px', cursor: 'pointer', textTransform: 'uppercase', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)', marginTop: '10px' }
};
