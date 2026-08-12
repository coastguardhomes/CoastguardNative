import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

export default function DashboardTecnico() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    inspeccionesSemana: 0,
    alertasDetectadas: 0,
    viviendasAsignadas: 0,
  });
  const [inspeccionesDiarias, setInspeccionesDiarias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [debugLog, setDebugLog] = useState('Iniciando carga...');

  useEffect(() => {
    cargarDatosDashboard();
  }, []);

  const cargarDatosDashboard = async () => {
    try {
      setLoading(true);
      setDebugLog('Conectando a Supabase...');

      // 1. Probar consulta directa a inspecciones
      const { data: inspData, error: inspError } = await supabase
        .from('inspecciones')
        .select('*');

      if (inspError) {
        setDebugLog(`Error en inspecciones: ${inspError.message}`);
        setLoading(false);
        return;
      }

      setDebugLog(`Inspecciones leídas: ${inspData ? inspData.length : 0}`);
      const inspeccionesLista = inspData || [];
      setInspeccionesDiarias(inspeccionesLista);

      // 2. Contar viviendas
      const { count: countViviendas, error: errViv } = await supabase
        .from('viviendas')
        .select('*', { count: 'exact', head: true });

      if (errViv) {
        setDebugLog(prev => prev + ` | Error viviendas: ${errViv.message}`);
      }

      // 3. Contar incidencias
      const { count: countIncidencias } = await supabase
        .from('incidencias')
        .select('*', { count: 'exact', head: true });

      setStats({
        inspeccionesSemana: inspeccionesLista.length,
        alertasDetectadas: countIncidencias || 0,
        viviendasAsignadas: countViviendas || 0,
      });

      setDebugLog('¡Datos cargados con éxito!');
    } catch (error) {
      setDebugLog(`Excepción: ${error.message}`);
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.dashboardCard}>
        
        {/* ENCABEZADO */}
        <div style={styles.header}>
          <div>
            <div style={styles.brandBadge}>
              <span>⛵</span> COASTGUARD <span style={{color: '#888', fontWeight: 'normal'}}>| TÉCNICO</span>
            </div>
            <h2 style={styles.headerTitle}>Panel de Operaciones</h2>
          </div>
          <button style={styles.btnLogout} onClick={handleLogout} title="Cerrar Sesión">
            🚪 Salir
          </button>
        </div>

        {/* CAJA DE DEBUGEO VISUAL (Para ver qué pasa en pantalla) */}
        <div style={styles.debugBox}>
          <span style={{color: '#ffd700', fontWeight: 'bold'}}>Estado de Red:</span> {debugLog}
        </div>

        {/* 3 TARJETAS SUPERIORES */}
        <div style={styles.topCardsGrid}>
          <div style={styles.statCard}>
            <div style={styles.cardIcon}>📋</div>
            <div style={styles.statNumber}>{stats.inspeccionesSemana} <span style={styles.statSub}>total</span></div>
            <div style={styles.statLabel}>Inspecciones</div>
          </div>

          <div style={styles.alertCard}>
            <div style={styles.cardIcon}>⚠️</div>
            <div style={styles.statNumberRed}>{stats.alertasDetectadas} <span style={styles.statSub}>incidencias</span></div>
            <div style={styles.statLabelAlert}>Alertas</div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.cardIcon}>🏠</div>
            <div style={styles.statNumber}>{stats.viviendasAsignadas} <span style={styles.statSub}>registradas</span></div>
            <div style={styles.statLabel}>Viviendas</div>
          </div>
        </div>

        {/* BOTÓN PRINCIPAL DORADO */}
        <button 
          style={styles.mainActionBtn}
          onClick={() => navigate('/tecnico/inspeccion/general/checklist')}
        >
          <span style={{ fontSize: '18px' }}>🔍</span> Iniciar Checklist General / Ruta
        </button>

        {/* LISTADO DE INSPECCIONES */}
        <div style={styles.assignedSection}>
          <div style={styles.sectionHeaderFlex}>
            <h3 style={styles.assignedTitle}>Inspecciones Asignadas</h3>
            <span style={styles.counterBadge}>{inspeccionesDiarias.length} Pendientes</span>
          </div>

          {loading ? (
            <p style={styles.emptyText}>Cargando asignaciones...</p>
          ) : inspeccionesDiarias.length === 0 ? (
            <div style={styles.emptyBox}>
              <p style={styles.emptyText}>No hay inspecciones en la base de datos o la tabla está vacía.</p>
              <button 
                style={styles.btnDirectChecklist}
                onClick={() => navigate('/tecnico/inspeccion/general/checklist')}
              >
                Abrir Checklist Genérico
              </button>
            </div>
          ) : (
            <div style={styles.listScrollContainer}>
              {inspeccionesDiarias.map((insp) => (
                <div key={insp.id} style={styles.assignmentItem}>
                  <div>
                    <div style={{ color: '#ffd700', fontWeight: 'bold', fontSize: '12px' }}>
                      Inspección #{String(insp.id).substring(0, 8)}
                    </div>
                    <div style={{ color: '#aaa', fontSize: '10px', marginTop: '2px' }}>
                      🆔 ID de Vivienda: {insp.vivienda_id || 'Sin asignar'}
                    </div>
                  </div>
                  <button 
                    style={styles.btnActionItem}
                    onClick={() => navigate(`/tecnico/inspeccion/${insp.id}/checklist`)}
                  >
                    Checklist →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Identificador de Build para forzar actualización */}
        <div style={{ textAlign: 'center', marginTop: '10px', opacity: 0.3, fontSize: '10px', color: '#fff' }}>
          Build v1.0.1 - {new Date().toLocaleDateString()}
        </div>

      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#04070c',
    minHeight: '100vh',
    padding: '10px 6px',
    display: 'flex',
    justifyContent: 'center',
    fontFamily: 'sans-serif',
  },
  dashboardCard: {
    width: '100%',
    maxWidth: '480px',
    backgroundColor: '#09101d',
    border: '1px solid #c5a03e',
    borderRadius: '14px',
    padding: '16px',
    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.9)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '2px solid #c5a03e',
    paddingBottom: '10px',
  },
  brandBadge: { color: '#ffd700', fontSize: '10px', fontWeight: 'bold', marginBottom: '4px' },
  headerTitle: { color: '#fff', fontSize: '18px', fontWeight: 'bold', margin: 0 },
  btnLogout: {
    background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
    border: '1px solid #ff7675',
    color: '#fff', padding: '6px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer',
  },
  debugBox: {
    backgroundColor: '#111b2e',
    border: '1px solid #d4af37',
    borderRadius: '6px',
    padding: '8px',
    fontSize: '10px',
    color: '#fff',
    wordBreak: 'break-all',
  },
  topCardsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' },
  statCard: {
    background: 'linear-gradient(145deg, #0d1626, #070d17)', border: '1px solid #d4af37', borderRadius: '8px', padding: '10px 4px', textAlign: 'center',
  },
  alertCard: {
    background: 'linear-gradient(145deg, #1a1015, #0d070a)', border: '1px solid #e74c3c', borderRadius: '8px', padding: '10px 4px', textAlign: 'center',
  },
  cardIcon: { fontSize: '16px', marginBottom: '2px' },
  statNumber: { fontSize: '15px', fontWeight: 'bold', color: '#fff' },
  statNumberRed: { fontSize: '15px', fontWeight: 'bold', color: '#e74c3c' },
  statSub: { fontSize: '7px', color: '#888', display: 'block' },
  statLabel: { fontSize: '9px', color: '#ffd700', marginTop: '2px', fontWeight: '600' },
  statLabelAlert: { fontSize: '9px', color: '#e74c3c', marginTop: '2px', fontWeight: '600' },
  mainActionBtn: {
    width: '100%', background: 'linear-gradient(to bottom, #f3e0aa 0%, #d4af37 50%, #b8860b 100%)', color: '#070b12',
    border: '1px solid #fffae6', padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer',
  },
  assignedSection: {
    background: 'linear-gradient(145deg, #0d1626, #070d17)', border: '1px solid #1e3050', borderRadius: '10px', padding: '12px', flex: 1,
  },
  sectionHeaderFlex: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid #1e3050', paddingBottom: '6px' },
  assignedTitle: { fontSize: '11px', color: '#ffd700', margin: 0, fontWeight: 'bold', textTransform: 'uppercase' },
  counterBadge: { backgroundColor: '#16263f', color: '#ffd700', fontSize: '9px', padding: '2px 6px', borderRadius: '4px', border: '1px solid #d4af37' },
  listScrollContainer: { maxHeight: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' },
  emptyBox: { textAlign: 'center', padding: '10px 0' },
  emptyText: { fontSize: '11px', color: '#888', marginBottom: '6px' },
  btnDirectChecklist: { backgroundColor: '#27ae60', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' },
  assignmentItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111b2e', padding: '8px 10px', borderRadius: '6px', border: '1px solid #2a3b55' },
  btnActionItem: { backgroundColor: '#27ae60', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' },
};
