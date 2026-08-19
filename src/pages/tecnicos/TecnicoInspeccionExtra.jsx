import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

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
      
      // ⭐ CORREGIDO: Consultamos la tabla 'extras' que es donde están estos trabajos
      const { data, error: err } = await supabase
        .from('extras')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (err) throw err;

      if (data) {
        setExtraData(data);
        setDescripcion(data.descripcion || '');
        setMateriales(data.materiales || '');
        setTiempo(data.tiempo_empleado || '');
        setFotos(data.fotos || []);
      } else {
        setError('No se encontró el trabajo extra.');
      }
    } catch (err) {
      console.error('Error al cargar extra:', err);
      setError('Error al cargar los datos del trabajo extra.');
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
          .from('extras') // Asegúrate de tener un bucket llamado 'extras' en Supabase Storage
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
    try {
      setSaving(true);
      setError('');

      // ⭐ Actualizamos la tabla 'extras' y cambiamos estado a 'finalizado'
      const { error: updateError } = await supabase
        .from('extras')
        .update({
          descripcion,
          materiales,
          tiempo_empleado: tiempo,
          fotos,
          estado: 'finalizado'
        })
        .eq('id', id);

      if (updateError) throw updateError;

      alert('Inspección de extra enviada al admin con éxito.');
      navigate('/tecnico');
    } catch (err) {
      console.error('Error al guardar:', err);
      setError('Error al enviar la inspección: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ color: '#fff', padding: 20, background: '#04070c', minHeight: '100vh', fontFamily: 'sans-serif' }}>Cargando datos del trabajo...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <button onClick={() => navigate('/tecnico')} style={styles.btnBack}>← Volver</button>
          <h2 style={styles.title}>Inspección de Extra</h2>
        </div>

        {mensaje && <p style={styles.ok}>{mensaje}</p>}
        {error && <p style={styles.errorText}>{error}</p>}

        {extraData && (
          <div style={styles.infoBox}>
            <p style={styles.infoText}>🆔 <strong>Ref ID:</strong> #{String(extraData.id).substring(0, 8)}</p>
            <p style={styles.infoText}>📄 <strong>Detalle:</strong> {extraData.descripcion || 'Sin descripción previa'}</p>
          </div>
        )}

        {/* Botones de Cámara y Galería */}
        <div style={styles.contenedorBotonesFoto}>
          <label style={styles.botonFoto}>
            📸 Hacer Foto
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={manejarSubidaFotos}
              style={{ display: 'none' }}
            />
          </label>

          <label style={styles.botonGaleria}>
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

        {/* Vista previa de las fotos subidas */}
        {fotos.length > 0 && (
          <div style={styles.gridFotos}>
            {fotos.map((url, index) => (
              <img key={index} src={url} alt={`Evidencia ${index}`} style={styles.miniatura} />
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Descripción del trabajo realizado:</label>
            <textarea
              style={styles.textarea}
              rows="4"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Detalla qué se ha reparado o revisado..."
              required
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Materiales usados:</label>
            <input
              type="text"
              style={styles.input}
              value={materiales}
              onChange={(e) => setMateriales(e.target.value)}
              placeholder="Ej: Tubo de PVC, silicona, tornillos..."
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Tiempo empleado:</label>
            <input
              type="text"
              style={styles.input}
              value={tiempo}
              onChange={(e) => setTiempo(e.target.value)}
              placeholder="Ej: 2 horas"
            />
          </div>

          <button type="submit" style={styles.btnSubmit} disabled={saving}>
            {saving ? 'Enviando...' : '✅ Guardar y Enviar Inspección al Admin'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: { backgroundColor: '#04070c', minHeight: '100vh', padding: '16px', display: 'flex', justifyContent: 'center', fontFamily: 'sans-serif' },
  card: { width: '100%', maxWidth: '480px', backgroundColor: '#09101d', border: '1px solid #c5a03e', borderRadius: '14px', padding: '16px', color: '#fff', display: 'flex', flexDirection: 'column', gap: '14px' },
  header: { display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '2px solid #c5a03e', paddingBottom: '10px' },
  btnBack: { background: 'transparent', border: '1px solid #d4af37', color: '#ffd700', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' },
  title: { fontSize: '16px', fontWeight: 'bold', margin: 0, color: '#ffd700' },
  infoBox: { backgroundColor: '#111b2e', padding: '10px', borderRadius: '8px', border: '1px solid #2a3b55' },
  infoText: { fontSize: '12px', margin: '4px 0', color: '#ccc' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '4px' },
  label: { fontSize: '12px', color: '#ffd700', fontWeight: '600' },
  input: { backgroundColor: '#132033', border: '1px solid #2a3b55', borderRadius: '8px', padding: '10px', color: '#fff', fontSize: '13px' },
  textarea: { backgroundColor: '#132033', border: '1px solid #2a3b55', borderRadius: '8px', padding: '10px', color: '#fff', fontSize: '13px', resize: 'vertical' },
  contenedorBotonesFoto: { display: 'flex', gap: '10px' },
  botonFoto: { flex: 1, textAlign: 'center', background: '#f59e0b', color: '#000', padding: '10px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' },
  botonGaleria: { flex: 1, textAlign: 'center', background: '#10b981', color: '#fff', padding: '10px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' },
  gridFotos: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  miniatura: { width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #c5a03e' },
  btnSubmit: { background: 'linear-gradient(to bottom, #27ae60 0%, #219653 100%)', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' },
  ok: { color: '#4ade80', backgroundColor: 'rgba(74,222,128,0.1)', padding: '8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' },
  errorText: { color: '#f87171', backgroundColor: 'rgba(248,113,113,0.1)', padding: '8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }
};
