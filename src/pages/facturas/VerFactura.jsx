import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

const COLOR_DORADO = "#e0b034";
const FONDO_PRINCIPAL = "#030509";
const BORDE_DORADO_FINO = "1px solid rgba(224, 176, 52, 0.4)";

export default function VerFactura() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState('Iniciando componente...');
  const [factura, setFactura] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function cargar() {
      try {
        setStatus('Leyendo parámetros de URL...');
        const queryParams = new URLSearchParams(window.location.search);
        const pagado = queryParams.get('pagado') === 'true';

        setStatus(`Conectando a Supabase (ID: ${id})...`);
        const { data, error } = await supabase
          .from('facturas')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error) {
          setStatus(`Error de Supabase: ${error.message}`);
          setFactura({
            id,
            numero: `CG-${String(id).padStart(5, '0')}`,
            estado: pagado ? 'pagada' : 'pendiente',
            total: 0,
            descripcion: `Error BD: ${error.message}`
          });
          return;
        }

        if (!data) {
          setStatus('Factura no encontrada en BD, usando datos seguros.');
          setFactura({
            id,
            numero: `CG-${String(id).padStart(5, '0')}`,
            estado: pagado ? 'pagada' : 'pendiente',
            total: 0,
            descripcion: 'Aviso de cobro generado (Stripe)'
          });
          return;
        }

        setStatus('¡Datos cargados con éxito!');
        if (pagado) {
          data.estado = 'pagada';
        }
        setFactura(data);

      } catch (err) {
        setStatus(`Excepción crítica: ${err.message}`);
        setFactura({
          id,
          numero: `CG-${String(id).padStart(5, '0')}`,
          estado: 'pagada',
          total: 0,
          descripcion: 'Error crítico controlado'
        });
      }
    }

    cargar();
  }, [id]);

  const enviarAvisoPago = async () => {
    try {
      setSaving(true);
      setStatus('Enviando email...');
      const { error } = await supabase.functions.invoke('enviar-email', {
        body: { factura_id: Number(id), facturaId: Number(id), id: Number(id), tipo: 'aviso_pago' }
      });
      if (error) throw error;
      alert('¡Aviso de pago enviado con éxito!');
      setStatus('Email enviado correctamente.');
    } catch (err) {
      alert('Error al enviar: ' + err.message);
      setStatus('Error al enviar email: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const marcarComoPagada = async () => {
    try {
      setSaving(true);
      setStatus('Actualizando estado a pagada...');
      await supabase.from('facturas').update({ estado: 'pagada' }).eq('id', id);
      setFactura(prev => ({ ...prev, estado: 'pagada' }));
      await supabase.functions.invoke('enviar-email', {
        body: { factura_id: Number(id), facturaId: Number(id), id: Number(id), tipo: 'factura_pagada' }
      });
      alert('¡Marcado como pagada!');
      setStatus('Factura marcada como pagada.');
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ backgroundColor: FONDO_PRINCIPAL, minHeight: '100vh', padding: '20px', fontFamily: 'Inter, sans-serif', color: '#fff', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        
        {/* Cabecera */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: BORDE_DORADO_FINO, paddingBottom: '12px' }}>
          <button onClick={() => navigate('/facturas')} style={{ background: 'transparent', border: BORDE_DORADO_FINO, color: COLOR_DORADO, padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}>
            ← Volver
          </button>
          <h2 style={{ color: COLOR_DORADO, fontSize: '16px', margin: 0 }}>DEPURACIÓN FACTURA</h2>
        </div>

        {/* Estado en vivo */}
        <div style={{ background: '#111827', border: '1px solid #38bdf8', padding: '14px', borderRadius: '12px' }}>
          <p style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 'bold', margin: '0 0 4px 0', textTransform: 'uppercase' }}>Estado del Sistema:</p>
          <p style={{ fontSize: '13px', color: '#fff', margin: 0, wordBreak: 'break-all' }}>{status}</p>
        </div>

        {factura && (
          <div style={{ background: 'linear-gradient(145deg, #0b1320 0%, #04070d 100%)', border: BORDE_DORADO_FINO, padding: '16px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <p style={{ margin: 0, color: COLOR_DORADO, fontWeight: 'bold' }}>Factura: {factura.numero || `#${factura.id}`}</p>
            <p style={{ margin: 0, fontSize: '14px' }}>Estado: <strong>{factura.estado}</strong></p>
            <p style={{ margin: 0, fontSize: '14px' }}>Total: <strong>{Number(factura.total || 0).toFixed(2)} €</strong></p>
            <p style={{ margin: 0, fontSize: '12px', color: '#aaa' }}>{factura.descripcion}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
              <button onClick={enviarAvisoPago} disabled={saving} style={{ padding: '12px', background: '#38bdf8', color: '#000', fontWeight: '900', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>
                ✉️ Enviar Aviso de Pago (Email)
              </button>
              <button onClick={marcarComoPagada} disabled={saving} style={{ padding: '12px', background: '#10b981', color: '#fff', fontWeight: '900', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>
                💳 Marcar como pagada
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
