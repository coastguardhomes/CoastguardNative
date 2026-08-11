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

  useEffect(() => {
    cargarDatosDashboard();
  }, []);

  const cargarDatosDashboard = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Obtener el técnico vinculado en la tabla 'tecnicos'
      const { data: tecnicoData } = await supabase
        .from('tecnicos')
        .select('id')
        .eq('auth_id', user.id)
        .maybeSingle();

      let inspecciones = [];

      // 2. Consulta flexible para capturar las inspecciones tanto por ID de técnico, auth_id o email
      let query = supabase
        .from('inspecciones')
        .select('*, viviendas(id, direccion, ciudad, nombre)');

      if (tecnicoData) {
        query = query.or(`tecnico_id.eq.${tecnicoData.id},tecnico_id.eq.${user.id},tecnico_id.eq.${user.email}`);
      } else {
        query = query.or(`tecnico_id.eq.${user.id},tecnico_id.eq.${user.email}`);
      }

      const { data: inspData, error: inspError } = await query;

      if (!inspError && inspData) {
        inspecciones = inspData;
      }

      // Si aun así viene vacío, traemos todas para que el técnico no se quede bloqueado
      if (inspecciones.length === 0) {
        const { data: fallbackInsp } = await supabase
          .from('inspecciones')
          .select('*, viviendas(id, direccion, ciudad, nombre)');
        inspecciones = fallbackInsp || [];
      }

      // Consultas para las tarjetas
      const { count: countIncidencias } = await supabase
        .from('incidencias')
        .select('*', { count: 'exact', head: true });

      const { count: countViviendas } = await supabase
        .from('viviendas')
        .select('*', { count: 'exact', head: true });

      setInspeccionesDiarias(inspecciones);

      setStats({
        inspeccionesSemana: inspecciones.length,
        alertasDetectadas: countIncidencias || 0,
        viviendasAsignadas: countViviendas || 0,
      });

    } catch (error) {
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

        {/* INDICADOR RÁPIDO DE ESTADO / CONECTIVIDAD */}
        <div style={styles.syncStatusBar}>
          <div style={styles.syncIndicator}>
            <span style={styles.pulseDot}></span> Sincronizado con Supabase
          </div>
          <div style={styles.offlineNote}>Modo Seguro Activo</div>
        </div>

        {/* 3 TARJETAS SUPERIORES CON DATOS REALES */}
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

        {/* LISTADO DE INSPECCIONES ASIGNADAS */}
        <div style={styles.assignedSection}>
          <div style={styles.sectionHeaderFlex}>
            <h3 style={styles.assignedTitle}>Inspecciones Asignadas</h3>
            <span style={styles.counterBadge}>{inspeccionesDiarias.length} Pendientes</span>
          </div>

          {loading ? (
            <p style={styles.emptyText}>Cargando asignaciones...</p>
          ) : inspeccionesDiarias.length === 0 ? (
            <div style={styles.emptyBox}>
              <p style={styles.emptyText}>No hay inspecciones asignadas a tu usuario.</p>
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
                      {insp.viviendas?.nombre || insp.viviendas?.direccion || `Inspección #${insp.id.substring(0, 8)}`}
                    </div>
                    <div style={{ color: '#aaa', fontSize: '10px', marginTop: '2px' }}>
                      📍 {insp.viviendas?.direccion || 'Dirección no especificada'} {insp.viviendas?.ciudad ? `- ${insp.viviendas.ciudad}` : ''}
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

        {/* SECCIÓN INFERIOR */}
        <div style={styles.quickActionsGrid}>
          <div 
            style={styles.quickActionBox}
            onClick={() => navigate('/tecnico/inspeccion/general/checklist')}
          >
            <span style={styles.quickIcon}>➕</span>
            <span style={styles.quickLabel}>Reportar Extra</span>
          </div>
          <div 
            style={styles.quickActionBox}
            onClick={() => alert('Para soporte urgente de ruta, contacte con administración vía teléfono.')}
          >
            <span style={styles.quickIcon}>☎️</span>
            <span style={styles.quickLabel}>Soporte Admin</span>
          </div>
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
    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.9), inset 0 0 20px rgba(212, 175, 55, 0.1)',
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
  brandBadge: {
    color: '#ffd700',
    fontSize: '10px',
    fontWeight: 'bold',
    letterSpacing: '0.5px',
    marginBottom: '4px',
  },
  headerTitle: {
    color: '#fff',
    fontSize: '18px',
    fontWeight: 'bold',
    margin: 0,
    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
  },
  btnLogout: {
    background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
    border: '1px solid #ff7675',
    color: '#fff',
    padding: '6px 10px',
    borderRadius: '8px',
    fontSize: '11px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
  },
  syncStatusBar: {
    backgroundColor: '#0d1626',
    border: '1px solid #1e3050',
    borderRadius: '6px',
    padding: '6px 10px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '10px',
  },
  syncIndicator: {
    color: '#2ecc71',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontWeight: 'bold',
  },
  pulseDot: {
    width: '6px',
    height: '6px',
    backgroundColor: '#2ecc71',
    borderRadius: '50%',
    boxShadow: '0 0 6px #2ecc71',
  },
  offlineNote: {
    color: '#888',
  },
  topCardsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '8px',
  },
  statCard: {
    background: 'linear-gradient(145deg, #0d1626, #070d17)',
    border: '1px solid #d4af37',
    borderRadius: '8px',
    padding: '10px 4px',
    textAlign: 'center',
    boxShadow: 'inset 0 1px 3px rgba(255,215,0,0.2), 0 4px 8px rgba(0,0,0,0.4)',
  },
  alertCard: {
    background: 'linear-gradient(145deg, #1a1015, #0d070a)',
    border: '1px solid #e74c3c',
    borderRadius: '8px',
    padding: '10px 4px',
    textAlign: 'center',
    boxShadow: 'inset 0 1px 3px rgba(231,76,60,0.3), 0 4px 8px rgba(0,0,0,0.4)',
  },
  cardIcon: { fontSize: '16px', marginBottom: '2px' },
  statNumber: { fontSize: '15px', fontWeight: 'bold', color: '#fff' },
  statNumberRed: { fontSize: '15px', fontWeight: 'bold', color: '#e74c3c' },
  statSub: { fontSize: '7px', color: '#888', display: 'block', fontWeight: 'normal' },
  statLabel: { fontSize: '9px', color: '#ffd700', marginTop: '2px', fontWeight: '600' },
  statLabelAlert: { fontSize: '9px', color: '#e74c3c', marginTop: '2px', fontWeight: '600' },
  mainActionBtn: {
    width: '100%',
    background: 'linear-gradient(to bottom, #f3e0aa 0%, #d4af37 50%, #b8860b 100%)',
    color: '#070b12',
    border: '1px solid #fffae6',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(212, 175, 55, 0.4), inset 0 1px 2px rgba(255,255,255,0.6)',
    textShadow: '0 1px 0 rgba(255,255,255,0.4)',
  },
  assignedSection: {
    background: 'linear-gradient(145deg, #0d1626, #070d17)',
    border: '1px solid #1e3050',
    borderRadius: '10px',
    padding: '12px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
    flex: 1,
  },
  sectionHeaderFlex: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
    borderBottom: '1px solid #1e3050',
    paddingBottom: '6px',
  },
  assignedTitle: {
    fontSize: '11px',
    color: '#ffd700',
    margin: 0,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  counterBadge: {
    backgroundColor: '#16263f',
    color: '#ffd700',
    fontSize: '9px',
    padding: '2px 6px',
    borderRadius: '4px',
    border: '1px solid #d4af37',
  },
  listScrollContainer: {
    maxHeight: '160px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  emptyBox: { textAlign: 'center', padding: '10px 0' },
  emptyText: { fontSize: '11px', color: '#888', marginBottom: '6px' },
  btnDirectChecklist: {
    backgroundColor: '#27ae60',
    color: '#fff',
    border: 'none',
    padding: '6px 10px',
    borderRadius: '6px',
    fontSize: '10px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  assignmentItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#111b2e',
    padding: '8px 10px',
    borderRadius: '6px',
    border: '1px solid #2a3b55',
  },
  btnActionItem: {
    backgroundColor: '#27ae60',
    color: '#fff',
    border: 'none',
    padding: '6px 10px',
    borderRadius: '6px',
    fontSize: '10px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
    whiteSpace: 'nowrap',
  },
  quickActionsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
  },
  quickActionBox: {
    background: 'linear-gradient(145deg, #0d1626, #070d17)',
    border: '1px solid #2a3b55',
    borderRadius: '8px',
    padding: '10px',
    textAlign: 'center',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
  },
  quickIcon: { fontSize: '14px' },
  quickLabel: { fontSize: '11px', color: '#ffd700', fontWeight: 'bold' },
};
