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

  useEffect(() => {
    cargarDetalleExtra();
  }, [id]);

  const cargarDetalleExtra = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('inspecciones')
        .select('*, viviendas(direccion)')
        .eq('id', id)
        .single();

      if (error) throw error;
      setExtraData(data);
      if (data) {
        setDescripcion(data.descripcion_trabajo || '');
        setMateriales(data.materiales_usados || '');
        setTiempo(data.tiempo_empleado || '');
      }
    } catch (error) {
      console.error('Error al cargar extra:', error);
      alert('Error al cargar los datos del trabajo extra.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const { error } = await supabase
        .from('inspecciones')
        .update({
          descripcion_trabajo: descripcion,
          materiales_usados: materiales,
          tiempo_empleado: tiempo,
          estado: 'completada_tecnico'
        })
        .eq('id', id);

      if (error) throw error;

      alert('Inspección de extra enviada al admin con éxito.');
      navigate('/tecnico');
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error al enviar la inspección: ' + error.message);
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

        {extraData && (
          <div style={styles.infoBox}>
            <p style={styles.infoText}>🏠 <strong>Vivienda:</strong> {extraData.viviendas?.direccion || extraData.direccion || 'N/A'}</p>
            <p style={styles.infoText}>🆔 <strong>Ref ID:</strong> #{String(extraData.id).substring(0, 8)}</p>
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
  btnSubmit: { background: 'linear-gradient(to bottom, #27ae60 0%, #219653 100%)', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }
};
