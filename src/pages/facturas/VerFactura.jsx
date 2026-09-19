import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

export default function VerFactura() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const pagado = searchParams.get('pagado');

  return (
    <div style={{ padding: '40px', color: 'white', background: '#030509', minHeight: '100vh', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
      <h1 style={{ color: '#e0b034', fontSize: '22px' }}>DIAGNÓSTICO DE FACTURA</h1>
      <p style={{ fontSize: '16px', marginTop: '15px' }}>ID de factura recibido: <strong>{id}</strong></p>
      <p style={{ fontSize: '16px' }}>¿Viene pagado de Stripe?: <strong>{pagado ? 'SÍ (?pagado=true)' : 'NO'}</strong></p>
      
      <div style={{ background: '#111827', border: '1px solid #34d399', padding: '15px', borderRadius: '10px', marginTop: '20px' }}>
        <p style={{ color: '#34d399', fontWeight: 'bold', margin: 0 }}>
          ✓ Si estás leyendo este texto en el móvil, significa que la ruta y Vercel funcionan perfectamente.
        </p>
      </div>

      <div style={{ marginTop: '30px' }}>
        <a href="/facturas" style={{ background: '#e0b034', color: '#030509', padding: '12px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', display: 'inline-block' }}>
          Volver a la lista de facturas
        </a>
      </div>
    </div>
  );
}
