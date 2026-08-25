import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { FaPlus, FaEdit, FaEye, FaTrash, FaArrowLeft, FaUserTie } from 'react-icons/fa';

const COLOR_DORADO = "#e0b034";
const FONDO_PRINCIPAL = "#030509";
const FONDO_TARJETA = "linear-gradient(145deg, #0b1320 0%, #04070d 100%)";
const BORDE_DORADO_FINO = "1px solid rgba(224, 176, 52, 0.4)";
const SOMBRA_LUXURY = "0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 20px rgba(224, 176, 52, 0.12)";
const TEXTO_DORADO_BRILLO = { color: COLOR_DORADO, textShadow: "0 0 12px rgba(224, 176, 52, 0.6)" };

export default function Tecnicos() {
  const navigate = useNavigate();
  const [tecnicos, setTecnicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarTecnicos();
  }, []);

  const cargarTecnicos = async () => {
    try {
      setLoading(true);
      setError('');
      
      const { data, error: err } = await supabase
        .from('tecnicos')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) throw err;
      setTecnicos(data || []);
    } catch (err) {
      console.error('Error al cargar técnicos:', err);
      setError('No se pudieron cargar los técnicos.');
    } finally {
      setLoading(false);
    }
  };

  const eliminarTecnico = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este técnico?')) return;
    
    try {
      const { error: err } = await supabase
        .from('tecnicos')
        .delete()
        .eq('id', id);

      if (err) throw err;
      setTecnicos(tecnicos.filter(t => t.id !== id));
    } catch (err) {
      console.error('Error al eliminar técnico:', err);
      alert('Error al eliminar el técnico: ' + err.message);
    }
  };

  return (
    <div style={{
      backgroundColor: FONDO_PRINCIPAL,
      minHeight: '100vh',
      padding: '16px',
      display: 'flex',
      justifyContent: 'center',
      fontFamily: 'Inter, sans-serif',
      boxSizing: 'border-box'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '600px',
        background: FONDO_TARJETA,
        border: BORDE_DORADO_FINO,
        borderRadius: '16px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: SOMBRA_LUXURY,
        boxSizing: 'border-box'
      }}>
        
        {/* Cabecera */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: BORDE_DORADO_FINO,
          paddingBottom: '14px'
        }}>
          <button 
            type="button"
            onClick={() => navigate('/admin/dashboard')} 
            style={{
              background: 'transparent',
              border: BORDE_DORADO_FINO,
              color: COLOR_DORADO,
              padding: '6px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <FaArrowLeft /> Volver
          </button>
          <h2 style={{ ...TEXTO_DORADO_BRILLO, fontSize: '18px', fontWeight: '900', margin: 0, textTransform: 'uppercase' }}>
            Gestión de Técnicos
          </h2>
        </div>

        {/* Botón Nuevo Técnico (Ruta corregida en plural /tecnicos/nuevo) */}
        <button
          type="button"
          onClick={() => navigate('/tecnicos/nuevo')}
          style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
            color: '#fff',
            border: BORDE_DORADO_FINO,
            padding: '12px',
            borderRadius: '12px',
            fontWeight: '900',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)',
            textTransform: 'uppercase'
          }}
        >
          <FaPlus /> Nuevo Técnico
        </button>

        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '12px', borderRadius: '10px', fontSize: '12px', fontWeight: '700', color: '#ef4444', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p style={TEXTO_DORADO_BRILLO}>Cargando técnicos...</p>
          </div>
        ) : tecnicos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#888', fontSize: '13px' }}>
            No hay técnicos registrados todavía.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {tecnicos.map((tecnico) => (
              <div 
                key={tecnico.id}
                style={{
                  backgroundColor: 'rgba(11, 19, 32, 0.9)',
                  border: BORDE_DORADO_FINO,
                  borderRadius: '12px',
                  padding: '14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FaUserTie color={COLOR_DORADO} size={20} />
                  <div>
                    <h4 style={{ color: '#fff', margin: '0 0 4px 0', fontSize: '14px', fontWeight: '700' }}>
                      {tecnico.nombre || tecnico.email || 'Técnico sin nombre'}
                    </h4>
                    <p style={{ color: '#aaa', margin: 0, fontSize: '12px' }}>
                      {tecnico.email} {tecnico.telefono ? `• ${tecnico.telefono}` : ''}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => navigate(`/tecnicos/ver/${tecnico.id}`)}
                    style={{ background: 'transparent', border: '1px solid #38bdf8', color: '#38bdf8', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}
                    title="Ver"
                  >
                    <FaEye size={12} />
                  </button>
                  <button
                    onClick={() => navigate(`/tecnicos/editar/${tecnico.id}`)}
                    style={{ background: 'transparent', border: BORDE_DORADO_FINO, color: COLOR_DORADO, padding: '8px', borderRadius: '8px', cursor: 'pointer' }}
                    title="Editar"
                  >
                    <FaEdit size={12} />
                  </button>
                  <button
                    onClick={() => eliminarTecnico(tecnico.id)}
                    style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}
                    title="Eliminar"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
