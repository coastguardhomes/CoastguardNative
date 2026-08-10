import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

export default function DashboardTecnico() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    inspeccionesSemana: 32,
    alertasDetectadas: 8,
    viviendasAsignadas: 120,
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

      const { data: inspecciones, error } = await supabase
        .from('inspecciones')
        .select('*, viviendas(nombre, direccion)')
        .eq('tecnico_id', user.id);

      if (error) throw error;
      
      if (inspecciones && inspecciones.length > 0) {
        setInspeccionesDiarias(inspecciones);
        setStats(prev => ({ ...prev, inspeccionesSemana: inspecciones.length }));
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* CONTENEDOR PRINCIPAL ESTILO HUD PROFESIONAL CON BRILLOS Y SOMBRAS */}
      <div style={styles.dashboardCard}>
        
        {/* ENCABEZADO */}
        <div style={styles.header}>
          <h2 style={styles.headerTitle}>DASHBOARD TÉCNICO</h2>
          <div style={styles.brandBadge}>
            <span style={{ marginRight: '4px' }}>⛵</span> COASTGUARD
          </div>
        </div>

        {/* 3 TARJETAS SUPERIORES (Efecto cristal oscuro con borde de luz dorada) */}
        <div style={styles.topCardsGrid}>
          <div style={styles.statCard}>
            <div style={styles.cardIcon}>📋</div>
            <div style={styles.statNumber}>32 <span style={styles.statSub}>esta semana</span></div>
            <div style={styles.statLabel}>Inspecciones</div>
          </div>

          <div style={styles.alertCard}>
            <div style={styles.cardIcon}>⚠️</div>
            <div style={styles.statNumberRed}>8 <span style={styles.statSub}>incidencias</span></div>
            <div style={styles.statLabelAlert}>Alertas</div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.cardIcon}>🏠</div>
            <div style={styles.statNumber}>120 <span style={styles.statSub}>asignadas</span></div>
            <div style={styles.statLabel}>Viviendas</div>
          </div>
        </div>

        {/* BOTÓN PRINCIPAL DORADO CON BRILLO METÁLICO Y ACCIÓN REAL */}
        <button 
          style={styles.mainActionBtn}
          onClick={() => navigate('/inspecciones/checklist')}
        >
          <span style={{ fontSize: '16px' }}>🔍</span> Inspecciones Diarias & Checklist
        </button>

        {/* SECCIÓN DE GRÁFICOS (Simulación de Panel de Control Técnico) */}
        <div style={styles.chartsRow}>
          {/* Gráfico 1 */}
          <div style={styles.miniChartBox}>
            <div style={styles.chartHeaderTitle}>Inspecciones <span style={styles.chartSubText}>por Día</span></div>
            <div style={styles.graphContainer}>
              <svg viewBox="0 0 100 35" style={styles.svgLine}>
                <defs>
                  <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffd700" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#ffd700" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <polygon points="5,30 20,28 35,20 50,22 65,10 80,20 95,12 95,35 5,35" fill="url(#goldGrad)" />
                <polyline fill="none" stroke="#ffd700" strokeWidth="2.5" points="5,30 20,28 35,20 50,22 65,10 80,20 95,12" />
                <circle cx="65" cy="10" r="3" fill="#fff" stroke="#ffd700" strokeWidth="2"/>
              </svg>
            </div>
            <div style={styles.daysFooter}>
              <span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span>Dom</span>
            </div>
          </div>

          {/* Gráfico 2 */}
          <div style={styles.miniChartBox}>
            <div style={styles.chartHeaderTitle}>Alertas <span style={styles.chartSubText}>por Día</span></div>
            <div style={styles.barsArea}>
              <div style={{...styles.bar, height: '35%'}}></div>
              <div style={{...styles.bar, height: '50%'}}></div>
              <div style={{...styles.bar, height: '30%'}}></div>
              <div style={{...styles.bar, height: '75%'}}></div>
              <div style={{...styles.bar, height: '45%'}}></div>
              <div style={{...styles.bar, height: '90%'}}></div>
              <div style={{...styles.bar, height: '25%'}}></div>
              <div style={{...styles.bar, height: '60%'}}></div>
            </div>
            <div style={styles.daysFooter}>
              <span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span>Dom</span>
            </div>
          </div>
        </div>

        {/* SECCIÓN INFERIOR: ESTADO DE VIVIENDAS Y DONUT 3D */}
        <div style={styles.statusSection}>
          <div>
            <div style={styles.chartHeaderTitle}>Estado de Viviendas</div>
            <div style={styles.legendRow}><span style={{...styles.statusDot, background: '#27ae60'}}></span> Operativas</div>
            <div style={styles.legendRow}><span style={{...styles.statusDot, background: '#e74c3c'}}></span> Con Incidencias</div>
          </div>
          <div style={styles.donutWrapper}>
            <div style={styles.donutOuter}>
              <div style={styles.donutInner}>
                <span style={styles.donutText}>85%</span>
              </div>
            </div>
            <div style={styles.badge15}>15%</div>
          </div>
        </div>

        {/* LISTADO DE INSPECCIONES ASIGNADAS CON CONEXIÓN AL CHECKLIST */}
        <div style={styles.assignedSection}>
          <h3 style={styles.assignedTitle}>Inspecciones Asignadas para Hoy</h3>
          {loading ? (
            <p style={styles.emptyText}>Cargando asignaciones...</p>
          ) : inspeccionesDiarias.length === 0 ? (
            <div style={styles.emptyBox}>
              <p style={styles.emptyText}>No hay inspecciones pendientes asignadas por el administrador.</p>
              <button 
                style={styles.btnDirectChecklist}
                onClick={() => navigate('/inspecciones/checklist')}
              >
                Abrir Checklist General
              </button>
            </div>
          ) : (
            inspeccionesDiarias.map((insp) => (
              <div key={insp.id} style={styles.assignmentItem}>
                <div>
                  <div style={{ color: '#ffd700', fontWeight: 'bold' }}>{insp.viviendas?.nombre || 'Vivienda Asignada'}</div>
                  <div style={{ color: '#aaa', fontSize: '11px' }}>{insp.viviendas?.direccion || 'Sin dirección especificada'}</div>
                </div>
                <button 
                  style={styles.btnActionItem}
                  onClick={() => navigate(`/inspecciones/checklist?id=${insp.id}`)}
                >
                  Realizar Checklist
                </button>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

// ESTILOS PROFESIONALES CON SOMBRAS, LUCES Y ACABADOS METÁLICOS
const styles = {
  container: {
    backgroundColor: '#04070c',
    minHeight: '100vh',
    padding: '8px',
    display: 'flex',
    justifyContent: 'center',
    fontFamily: 'sans-serif',
  },
  dashboardCard: {
    width: '100%',
    maxWidth: '480px',
    backgroundColor: '#09101d',
    border: '1px solid #c5a03e',
    borderRadius: '12px',
    padding: '14px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.8), inset 0 0 15px rgba(212, 175, 55, 0.15)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '2px solid #c5a03e',
    paddingBottom: '10px',
    marginBottom: '14px',
  },
  headerTitle: {
    color: '#ffd700',
    fontSize: '16px',
    fontWeight: 'bold',
    margin: 0,
    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
    letterSpacing: '0.5px',
  },
  brandBadge: {
    background: 'linear-gradient(135deg, #111b2e, #070b14)',
    border: '1px solid #ffd700',
    color: '#ffd700',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: 'bold',
    boxShadow: '0 2px 5px rgba(0,0,0,0.4)',
  },
  topCardsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '8px',
    marginBottom: '14px',
  },
  statCard: {
    background: 'linear-gradient(145deg, #0d1626, #070d17)',
    border: '1px solid #d4af37',
    borderRadius: '8px',
    padding: '10px 6px',
    textAlign: 'center',
    boxShadow: 'inset 0 1px 3px rgba(255,215,0,0.2), 0 4px 8px rgba(0,0,0,0.4)',
  },
  alertCard: {
    background: 'linear-gradient(145deg, #1a1015, #0d070a)',
    border: '1px solid #e74c3c',
    borderRadius: '8px',
    padding: '10px 6px',
    textAlign: 'center',
    boxShadow: 'inset 0 1px 3px rgba(231,76,60,0.3), 0 4px 8px rgba(0,0,0,0.4)',
  },
  cardIcon: { fontSize: '18px', marginBottom: '2px' },
  statNumber: { fontSize: '16px', fontWeight: 'bold', color: '#fff', textShadow: '0 1px 2px #000' },
  statNumberRed: { fontSize: '16px', fontWeight: 'bold', color: '#e74c3c', textShadow: '0 1px 2px #000' },
  statSub: { fontSize: '8px', color: '#999', display: 'block', fontWeight: 'normal' },
  statLabel: { fontSize: '10px', color: '#ffd700', marginTop: '2px', fontWeight: '600' },
  statLabelAlert: { fontSize: '10px', color: '#e74c3c', marginTop: '2px', fontWeight: '600' },
  mainActionBtn: {
    width: '100%',
    background: 'linear-gradient(to bottom, #f3e0aa 0%, #d4af37 50%, #b8860b 100%)',
    color: '#070b12',
    border: '1px solid #fffae6',
    padding: '14px',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginBottom: '14px',
    boxShadow: '0 4px 12px rgba(212, 175, 55, 0.4), inset 0 1px 2px rgba(255,255,255,0.6)',
    textShadow: '0 1px 0 rgba(255,255,255,0.4)',
  },
  chartsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
    marginBottom: '12px',
  },
  miniChartBox: {
    background: 'linear-gradient(145deg, #0d1626, #070d17)',
    border: '1px solid #1e3050',
    borderRadius: '8px',
    padding: '10px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
  },
  chartHeaderTitle: {
    fontSize: '11px',
    color: '#ffd700',
    fontWeight: 'bold',
    marginBottom: '6px',
  },
  chartSubText: { color: '#888', fontWeight: 'normal' },
  graphContainer: { height: '42px', display: 'flex', alignItems: 'center' },
  svgLine: { width: '100%', height: '38px', overflow: 'visible' },
  barsArea: {
    height: '42px',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingBottom: '2px',
    borderBottom: '1px solid #1e3050',
  },
  bar: {
    width: '7px',
    background: 'linear-gradient(to top, #c0392b, #e74c3c)',
    borderRadius: '3px 3px 0 0',
    boxShadow: '0 0 6px rgba(231,76,60,0.5)',
  },
  daysFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '8px',
    color: '#888',
    marginTop: '4px',
  },
  statusSection: {
    background: 'linear-gradient(145deg, #0d1626, #070d17)',
    border: '1px solid #1e3050',
    borderRadius: '8px',
    padding: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
  },
  legendRow: { fontSize: '10px', color: '#ccc', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' },
  statusDot: { width: '8px', height: '8px', borderRadius: '50%', boxShadow: '0 0 4px currentColor' },
  donutWrapper: {
    position: 'relative',
    width: '54px',
    height: '54px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutOuter: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: 'conic-gradient(#27ae60 0% 85%, #16263f 85% 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 10px rgba(39, 174, 96, 0.4)',
  },
  donutInner: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    backgroundColor: '#070d17',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutText: { fontSize: '11px', fontWeight: 'bold', color: '#fff' },
  badge15: {
    position: 'absolute',
    top: '-4px',
    right: '-6px',
    backgroundColor: '#e74c3c',
    color: '#fff',
    fontSize: '9px',
    padding: '2px 4px',
    borderRadius: '4px',
    fontWeight: 'bold',
    boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
  },
  assignedSection: {
    background: 'linear-gradient(145deg, #0d1626, #070d17)',
    border: '1px solid #1e3050',
    borderRadius: '8px',
    padding: '12px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
  },
  assignedTitle: {
    fontSize: '12px',
    color: '#ffd700',
    marginBottom: '10px',
    borderBottom: '1px solid #1e3050',
    paddingBottom: '6px',
    fontWeight: 'bold',
  },
  emptyBox: { textAlign: 'center', padding: '10px 0' },
  emptyText: { fontSize: '11px', color: '#888', marginBottom: '8px' },
  btnDirectChecklist: {
    backgroundColor: '#27ae60',
    color: '#fff',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(39,174,96,0.4)',
  },
  assignmentItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#111b2e',
    padding: '8px 10px',
    borderRadius: '6px',
    marginBottom: '6px',
    border: '1px solid #2a3b55',
  },
  btnActionItem: {
    backgroundColor: '#27ae60',
    color: '#fff',
    border: 'none',
    padding: '6px 10px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
  },
};
