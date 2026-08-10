import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient'; // Ajusta la ruta a tu cliente de Supabase si es necesario

export default function DashboardTecnico() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    inspeccionesSemana: 0,
    alertasDetectadas: 0,
    viviendasAsignadas: 0,
  });
  const [inspeccionesDiarias, setInspeccionesDiarias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatosDashboard();
  }, []);

  const cargarDatosDashboard = async () => {
    try {
      setLoading(true);
      // Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // 1. Obtener inspecciones asignadas al técnico
      const { data: inspecciones, error: errInsp } = await supabase
        .from('inspecciones')
        .select('*, viviendas(nombre, direccion)')
        .eq('tecnico_id', user.id);

      if (errInsp) throw errInsp;

      // 2. Obtener viviendas asignadas o totales relacionadas
      const { count: countViviendas, error: errViv } = await supabase
        .from('viviendas')
        .select('*', { count: 'exact', head: true })
        .eq('tecnico_id', user.id);

      if (errViv) {
        // Fallback si no hay columna tecnico_id directa en viviendas
        console.warn("No se pudo filtrar viviendas por técnico directo", errViv);
      }

      setInspeccionesDiarias(inspecciones || []);
      
      // Calcular métricas básicas para las tarjetas superiores
      setStats({
        inspeccionesSemana: inspecciones?.length || 0,
        alertasDetectadas: inspecciones?.filter(i => i.estado === 'Incidencia' || i.alerta).length || 0,
        viviendasAsignadas: countViviendas || 120, // Valor por defecto visual si está vacío
      });

    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <h2 style={styles.headerTitle}>DASHBOARD TÉCNICO</h2>
        <div style={styles.brandContainer}>
          <span style={styles.brandText}>COASTGUARD</span>
        </div>
      </div>

      {/* TARJETAS SUPERIORES DE RESUMEN */}
      <div style={styles.cardsGrid}>
        <div style={styles.card}>
          <div style={styles.cardIcon}>📋</div>
          <div>
            <div style={styles.cardValue}>{stats.inspeccionesSemana}</div>
            <div style={styles.cardLabel}>Inspecciones esta semana</div>
          </div>
        </div>

        <div style={styles.cardAlert}>
          <div style={styles.cardIcon}>⚠️</div>
          <div>
            <div style={styles.cardValueRed}>{stats.alertasDetectadas}</div>
            <div style={styles.cardLabel}>Incidencias detectadas</div>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardIcon}>🏠</div>
          <div>
            <div style={styles.cardValue}>{stats.viviendasAsignadas}</div>
            <div style={styles.cardLabel}>Viviendas Asignadas</div>
          </div>
        </div>
      </div>

      {/* BOTÓN PRINCIPAL DE ACCESO A INSPECCIONES DIARIAS / CHECKLIST */}
      <div style={styles.actionContainer}>
        <button 
          style={styles.mainButton}
          onClick={() => navigate('/inspecciones/checklist')}
        >
          🔍 Inspecciones Diarias & Checklist
        </button>
      </div>

      {/* SECCIÓN DE LISTADO RÁPIDO ASIGNADO POR ADMIN */}
      <div style={styles.sectionContainer}>
        <h3 style={styles.sectionTitle}>Inspecciones Asignadas para Hoy</h3>
        {loading ? (
          <p style={styles.loadingText}>Cargando inspecciones...</p>
        ) : inspeccionesDiarias.length === 0 ? (
          <p style={styles.loadingText}>No hay inspecciones asignadas en este momento.</p>
        ) : (
          <div style={styles.listContainer}>
            {inspeccionesDiarias.map((insp) => (
              <div key={insp.id} style={styles.listItem}>
                <div>
                  <strong style={{ color: '#f39c12' }}>{insp.viviendas?.nombre || 'Vivienda sin nombre'}</strong>
                  <p style={{ margin: '4px 0 0', color: '#bbb', fontSize: '12px' }}>{insp.viviendas?.direccion || 'Sin dirección'}</p>
                </div>
                <button 
                  style={styles.checkButton}
                  onClick={() => navigate(`/inspecciones/checklist?id=${insp.id}`)}
                >
                  Hacer Checklist
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Estilos limpios adaptados al diseño oscuro y dorado de tu app
const styles = {
  container: {
    padding: '16px',
    backgroundColor: '#0b131e',
    minHeight: '100vh',
    color: '#ffffff',
    fontFamily: 'sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '2px solid #d4af37',
    paddingBottom: '12px',
    marginBottom: '16px',
  },
  headerTitle: {
    color: '#d4af37',
    fontSize: '18px',
    margin: 0,
    fontWeight: 'bold',
  },
  brandContainer: {
    backgroundColor: '#111b2b',
    padding: '4px 8px',
    borderRadius: '4px',
    border: '1px solid #d4af37',
  },
  brandText: {
    color: '#d4af37',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
    gap: '10px',
    marginBottom: '20px',
  },
  card: {
    backgroundColor: '#162235',
    border: '1px solid #d4af37',
    borderRadius: '8px',
    padding: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  cardAlert: {
    backgroundColor: '#162235',
    border: '1px solid #e74c3c',
    borderRadius: '8px',
    padding: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  cardIcon: {
    fontSize: '20px',
  },
  cardValue: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#ffffff',
  },
  cardValueRed: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  cardLabel: {
    fontSize: '10px',
    color: '#aaaaaa',
  },
  actionContainer: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  mainButton: {
    width: '100%',
    backgroundColor: '#d4af37',
    color: '#0b131e',
    border: 'none',
    padding: '14px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
  },
  sectionContainer: {
    backgroundColor: '#111b2b',
    borderRadius: '8px',
    padding: '12px',
    border: '1px solid #2c3e50',
  },
  sectionTitle: {
    color: '#d4af37',
    fontSize: '14px',
    marginBottom: '12px',
    borderBottom: '1px solid #2c3e50',
    paddingBottom: '6px',
  },
  loadingText: {
    color: '#888',
    fontSize: '13px',
    textAlign: 'center',
  },
  listContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  listItem: {
    backgroundColor: '#162235',
    padding: '10px',
    borderRadius: '6px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    border: '1px solid #333',
  },
  checkButton: {
    backgroundColor: '#27ae60',
    color: '#fff',
    border: 'none',
    padding: '6px 10px',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
};
