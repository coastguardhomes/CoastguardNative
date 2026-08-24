import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

const COLOR_DORADO = "#e0b034";
const FONDO_PRINCIPAL = "#030509";
const FONDO_TARJETA = "linear-gradient(145deg, #0b1320 0%, #04070d 100%)";
const BORDE_DORADO_FINO = "1px solid rgba(224, 176, 52, 0.4)";
const SOMBRA_LUXURY = "0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 20px rgba(224, 176, 52, 0.12)";
const TEXTO_DORADO_BRILLO = { color: COLOR_DORADO, textShadow: "0 0 12px rgba(224, 176, 52, 0.6)" };

export default function TecnicoInspeccionExtra() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [extraData, setExtraData] = useState(null);
  
  const [descripcion, setDescripcion] = useState('');
  const [materiales, setMateriales] = useState('');
  const [tiempo, setTiempo] = useState('');
  const [fotos, setFotos] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    cargarDetalleExtra();
  }, [id]);

  const cargarDetalleExtra = async () => {
    try {
      setLoading(true);
      setError('');
      
      const { data, error: err } = await supabase
        .from('facturas')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (err) throw err;

      if (data) {
        setExtraData(data);
        setDescripcion(data.descripcion || '');
      } else {
        setError('No se encontró el trabajo extra en facturas.');
      }
    } catch (err) {
      console.error('Error al cargar extra:', err);
      setError('Error al cargar los datos de la factura/extra.');
    } finally {
      setLoading(false);
    }
  };

  const manejarSubidaFotos = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setSaving(true);
      setError('');
      const nuevasUrls = [...fotos];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random()}.${fileExt}`;
        const filePath = `extras/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('extras')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('extras')
          .getPublicUrl(filePath);

        if (publicUrlData?.publicUrl) {
          nuevasUrls.push(publicUrlData.publicUrl);
        }
      }

      setFotos(nuevasUrls);
      setMensaje('¡Fotos subidas con éxito!');
    } catch (err) {
      console.error('Error al subir fotos:', err);
      setError('No se pudieron subir las fotos.');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!extraData || !extraData.id) {
      alert("Error: Los datos aún no se han cargado correctamente.");
      return;
    }

    try {
      setSaving(true);
      setError('');

      const facturaIdNum = parseInt(extraData.id, 10);
      const inspeccionUuid = extraData.inspeccion_id || null;
      const viviendaIdNum = extraData.vivienda_id ? parseInt(extraData.vivienda_id, 10) : null;
      const clienteUuid = extraData.cliente_id || null;

      const descripcionCompleta = `Trabajo: ${descripcion} | Materiales: ${materiales || 'Ninguno'} | Tiempo: ${tiempo || 'No especificado'}`;

      // 1. Actualizar la tabla facturas dejando el estado en 'pendiente' para el admin
      const { error: updateError } = await supabase
        .from('facturas')
        .update({
          descripcion: descripcionCompleta,
          estado: 'pendiente' // Va al admin para su revisión
        })
        .eq('id', extraData.id);

      if (updateError) throw updateError;

      // 2. Sincronizar la tabla 'extras' vinculando factura e inspección a la vez
      const datosExtra = {
        factura_id: isNaN(facturaIdNum) ? null : facturaIdNum,
        inspeccion_id: inspeccionUuid,
        vivienda_id: viviendaIdNum,
        cliente_id: clienteUuid,
        descripcion: descripcionCompleta,
        materiales: materiales || '',
        tiempo_empleado: tiempo || '',
        fotos: fotos, // Array con las URLs de las fotos
        estado: 'pendiente' // Estado pendiente para revisión del administrador
      };

      // Comprobar si ya existe un registro previo en 'extras'
      let existingExtra = null;
      if (!isNaN(facturaIdNum)) {
        const { data } = await supabase.from('extras').select('id').eq('factura_id', facturaIdNum).maybeSingle();
        existingExtra = data;
      }
      if (!existingExtra && inspeccionUuid) {
        const { data } = await supabase.from('extras').select('id').eq('inspeccion_id', inspeccionUuid).maybeSingle();
        existingExtra = data;
      }

      let extraError;
      if (existingExtra) {
        const { error: errUpd } = await supabase
          .from('extras')
          .update(datosExtra)
          .eq('id', existingExtra.id);
        extraError = errUpd;
      } else {
        const { error: errIns } = await supabase
          .from('extras')
          .insert([datosExtra]);
        extraError = errIns;
      }

      if (extraError) throw extraError;

      alert('Inspección de extra enviada al administrador correctamente.');
      navigate('/tecnico');
    } catch (err) {
      console.error('Error al guardar:', err);
      setError('Error al enviar la inspección: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: FONDO_PRINCIPAL, minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'Inter, sans-serif' }}>
        <h3 style={TEXTO_DORADO_BRILLO}>Cargando datos del trabajo...</h3>
      </div>
    );
  }

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
        maxWidth: '480px',
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
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: BORDE_DORADO_FINO,
          paddingBottom: '14px'
        }}>
          <button 
            type="button"
            onClick={() => navigate('/tecnico')} 
            style={{
              background: 'transparent',
              border: BORDE_DORADO_FINO,
              color: COLOR_DORADO,
              padding: '6px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: '700'
            }}
          >
            ← Volver
          </button>
          <h2 style={{ ...TEXTO_DORADO_BRILLO, fontSize: '18px', fontWeight: '900', margin: 0, textTransform: 'uppercase' }}>
            Inspección de Extra
          </h2>
        </div>

        {mensaje && (
          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', padding: '12px', borderRadius: '10px', fontSize: '12px', fontWeight: '700', color: '#34d399', textAlign: 'center' }}>
            {mensaje}
          </div>
        )}

        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '12px', borderRadius: '10px', fontSize: '12px', fontWeight: '700', color: '#ef4444', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {extraData && (
          <div style={{ backgroundColor: 'rgba(11, 19, 32, 0.9)', padding: '14px', borderRadius: '12px', border: BORDE_DORADO_FINO }}>
            <p style={{ fontSize: '12px', margin: '4px 0', color: '#ccc' }}>
              <strong style={{ color: COLOR_DORADO }}>Factura / Ref:</strong> {extraData.numero || `#${extraData.id}`}
            </p>
            <p style={{ fontSize: '12px', margin: '4px 0 0 0', color: '#ccc' }}>
              <strong style={{ color: COLOR_DORADO }}>Concepto inicial:</strong> {extraData.descripcion || 'Sin descripción previa'}
            </p>
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <label style={{
            flex: 1,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
            color: '#fff',
            padding: '12px',
            borderRadius: '12px',
            fontWeight: '900',
            fontSize: '12px',
            cursor: 'pointer',
            border: BORDE_DORADO_FINO,
            boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)',
            textTransform: 'uppercase'
          }}>
            📸 Hacer Foto
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={manejarSubidaFotos}
              style={{ display: 'none' }}
            />
          </label>

          <label style={{
            flex: 1,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #38bdf8 0%, #1e3a8a 100%)',
            color: '#fff',
            padding: '12px',
            borderRadius: '12px',
            fontWeight: '900',
            fontSize: '12px',
            cursor: 'pointer',
            border: BORDE_DORADO_FINO,
            boxShadow: '0 4px 15px rgba(56, 189, 248, 0.3)',
            textTransform: 'uppercase'
          }}>
            🖼️ Galería
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={manejarSubidaFotos}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        {fotos.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {fotos.map((url, index) => (
              <img 
                key={index} 
                src={url} 
                alt={`Evidencia ${index}`} 
                style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: BORDE_DORADO_FINO }} 
              />
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', color: COLOR_DORADO, fontWeight: '700', textTransform: 'uppercase' }}>
              Descripción del trabajo realizado:
            </label>
            <textarea
              style={{
                backgroundColor: 'rgba(11, 19, 32, 0.8)',
                border: BORDE_DORADO_FINO,
                borderRadius: '12px',
                padding: '12px',
                color: '#fff',
                fontSize: '13px',
                resize: 'vertical',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              rows="4"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Detalla qué se ha reparado o revisado..."
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', color: COLOR_DORADO, fontWeight: '700', textTransform: 'uppercase' }}>
              Materiales usados:
            </label>
            <input
              type="text"
              style={{
                backgroundColor: 'rgba(11, 19, 32, 0.8)',
                border: BORDE_DORADO_FINO,
                borderRadius: '12px',
                padding: '12px',
                color: '#fff',
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              value={materiales}
              onChange={(e) => setMateriales(e.target.value)}
              placeholder="Ej: Tubo de PVC, silicona, tornillos..."
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', color: COLOR_DORADO, fontWeight: '700', textTransform: 'uppercase' }}>
              Tiempo empleado:
            </label>
            <input
              type="text"
              style={{
                backgroundColor: 'rgba(11, 19, 32, 0.8)',
                border: BORDE_DORADO_FINO,
                borderRadius: '12px',
                padding: '12px',
                color: '#fff',
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              value={tiempo}
              onChange={(e) => setTiempo(e.target.value)}
              placeholder="Ej: 2 horas"
            />
          </div>

          <button 
            type="submit" 
            disabled={saving || !extraData}
            style={{
              background: (saving || !extraData) ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
              color: (saving || !extraData) ? '#64748b' : '#fff',
              border: (saving || !extraData) ? BORDE_DORADO_FINO : '1px solid rgba(16, 185, 129, 0.6)',
              padding: '14px',
              borderRadius: '16px',
              fontSize: '14px',
              fontWeight: '900',
              cursor: (saving || !extraData) ? 'not-allowed' : 'pointer',
              marginTop: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              boxShadow: (saving || !extraData) ? 'none' : '0 4px 15px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            {saving ? 'Enviando...' : '✅ Enviar Inspección al Administrador'}
          </button>
        </form>
      </div>
    </div>
  );
}
