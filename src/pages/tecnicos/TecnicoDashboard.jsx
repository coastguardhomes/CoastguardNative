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
      setInspeccionesDiarias(inspecciones || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.headerTitle}>DASHBOARD TÉCNICO</div>
        <div style={styles.brandBox}>
          <span style={styles.lighthouseIcon}>⛵</span> COASTGUARD
        </div>
      </div>

      {/* TARJETAS SUPERIORES */}
      <div style={styles.topGrid}>
        <div style={styles.card}>
          <div style={styles.cardIcon}>📋</div>
          <div>
            <div style={styles.cardNum}>32 <span style={styles.cardSub}>esta semana</span></div>
            <div style={styles.cardText}>Inspecciones</div>
          </div>
        </div>

        <div style={styles.cardAlert}>
          <div style={styles.cardIcon}>⚠️</div>
          <div>
            <div style={styles.cardNumRed}>8 <span style={styles.cardSub}>incidencias</span></div>
            <div style={styles.cardText}>Alertas</div>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardIcon}>🏠</div>
          <div>
            <div style={styles.cardNum}>120 <span style={styles.cardSub}>asignadas</span></div>
            <div style={styles.cardText}>Viviendas</div>
          </div>
        </div>
      </div>

      {/* BOTÓN CENTRAL INSPECCIONES DIARIAS */}
      <button 
        style={styles.mainButton}
        onClick={() => navigate('/inspecciones/checklist')}
      >
        🔍 Inspecciones Diarias
      </button>

      {/* SECCIÓN DE GRÁFICOS (Estilo Panel de Control) */}
      <div style={styles.chartsGrid}>
        {/* Gráfico 1: Inspecciones por Día */}
        <div style={styles.chartCard}>
          <div style={styles.chartTitle}>Inspecciones <span style={{color: '#888', fontWeight: 'normal'}}>por Día</span></div>
          <div style={styles.lineChartArea}>
            {/* Simulación visual de gráfico de líneas */}
            <svg viewBox="0 0 100 40" style={styles.svgLine}>
              <polyline fill="none" stroke="#d4af37" strokeWidth="2" points="5,30 20,32 35,22 50,26 65,12 80,25 95,15" />
              <circle cx="5" cy="30" r="2" fill="#d4af37"/>
              <circle cx="20" cy="32" r="2" fill="#d4af37"/>
              <circle cx="35" cy="22" r="2" fill="#d4af37"/>
              <circle cx="50" cy="26" r="2" fill="#d4af37"/>
              <circle cx="65" cy="12" r="2" fill="#d4af37"/>
              <circle cx="80" cy="25" r="2" fill="#d4af37"/>
              <circle cx="95" cy="15" r="2" fill="#d4af37"/>
            </svg>
          </div>
          <div style={styles.daysRow}>
            <span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span>Dom</span>
          </div>
        </div>

        {/* Gráfico 2: Alertas por Día */}
        <div style={styles.chartCard}>
          <div style={styles.chartTitle}>Alertas <span style={{color: '#888', fontWeight: 'normal'}}>por Día</span></div>
          <div style={styles.barChartArea}>
            <div style={{...styles.bar, height: '30%'}}></div>
            <div style={{...styles.bar, height: '50%'}}></div>
            <div style={{...styles.bar, height: '40%'}}></div>
            <div style={{...styles.bar, height: '70%'}}></div>
            <div style={{...styles.bar, height: '50%'}}></div>
            <div style={{...styles.bar, height: '85%'}}></div>
            <div style={{...styles.bar, height: '30%'}}></div>
            <div style={{...styles.bar, height: '45%'}}></div>
          </div>
          <div style={styles.daysRow}>
            <span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span>Dom</span>
          </div>
        </div>
      </div>

      {/* SECCIÓN INFERIOR: ESTADO DE VIVIENDAS Y DONUT */}
      <div style={styles.bottomSection}>
        <div style={styles.statusLegend}>
          <div style={styles.chartTitle}>Estado de Viviendas</div>
          <div style={styles.legendItem}><span style={{...styles.dot, backgroundColor: '#27ae60'}}></span> Operativas</div>
          <div style={styles.legendItem}><span style={{...styles.dot, backgroundColor: '#e74c3c'}}></span> Con Incidencias</div>
        </div>
        <div style={styles.donutContainer}>
          <div style={styles.donutRing}>
            <span style={styles.donutPercent}>85%</span>
          </div>
          <span style={styles.badgeRed15}>15%</span>
        </div>
      </div>

      {/* LISTADO DE ASIGNACIONES ACTIVAS */}
      <div style={styles.assignedListSection}>
        <h4 style={styles.subHeader}>Inspecciones Asignadas para Hoy</h4>
        {loading ? (
          <p style={styles.mutedText}>Cargando...</p>
        ) : inspeccionesDiarias.length === 0 ? (
          <p style={styles.mutedText}>No hay inspecciones asignadas en este momento.</p>
        ) : (
          inspeccionesDiarias.map(insp => (
            <div key={insp.id} style={styles.listItem}>
              <div>
                <strong style={{color: '#d4af37'}}>{insp.viviendas?.nombre || 'Vivienda'}</strong>
                <div style={{fontSize: '11px', color: '#aaa'}}>{insp.viviendas?.direccion}</div>
              </div>
              <button 
                style={styles.checklistBtn}
                onClick={() => navigate(`/inspecciones/checklist?id=${insp.id}`)}
              >
                Abrir Checklist
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ESTILOS CON DISEÑO OSCURO / DORADO LUJO
const styles = {
  container: {
    padding: '12px',
    backgroundColor: '#070b12',
    minHeight: '100vh',
    color: '#fff',
    fontFamily: 'sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #d4af37',
    paddingBottom: '8px',
    marginBottom: '12px',
  },
  headerTitle: {
    color: '#d4af37',
    fontSize: '15px',
    fontWeight: 'bold',
    letterSpacing: '1px',
  },
  brandBox: {
    border: '1px solid #d4af37',
    borderRadius: '4px',
    padding: '2px 8px',
    fontSize: '11px',
    color: '#d4af37',
    backgroundColor: '#0d1522',
    fontWeight: 'bold',
  },
  topGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '6px',
    marginBottom: '12px',
  },
  card: {
    backgroundColor: '#0d1522',
    border: '1px solid #d4af37',
    borderRadius: '6px',
    padding: '8px',
    textAlign: 'center',
    boxShadow: 'inset 0 0 8px rgba(212, 175, 55, 0.1)',
  },
  cardAlert: {
    backgroundColor: '#0d1522',
    border: '1px solid #e74c3c',
    borderRadius: '6px',
    padding: '8px',
    textAlign: 'center',
    boxShadow: 'inset 0 0 8px rgba(231, 76, 60, 0.15)',
  },
  cardIcon: { fontSize: '16px', marginBottom: '2px' },
  cardNum: { fontSize: '16px', fontWeight: 'bold', color: '#fff' },
  cardNumRed: { fontSize: '16px', fontWeight: 'bold', color: '#e74c3c' },
  cardSub: { fontSize: '9px', color: '#aaa', fontWeight: 'normal', display: 'block' },
  cardText: { fontSize: '10px', color: '#d4af37', marginTop: '2px' },
  mainButton: {
    width: '100%',
    background: 'linear-gradient(to bottom, #e6c55c, #c5a03e)',
    color: '#070b12',
    border: 'none',
    padding: '12px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginBottom: '12px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '6px',
    marginBottom: '10px',
  },
  chartCard: {
    backgroundColor: '#0d1522',
    border: '1px solid #22334f',
    borderRadius: '6px',
    padding: '8px',
  },
  chartTitle: {
    fontSize: '11px',
    color: '#d4af37',
    marginBottom: '6px',
    fontWeight: 'bold',
  },
  lineChartArea: { height: '50px', display: 'flex', alignItems: 'center' },
  svgLine: { width: '100%', height: '40px', overflow: 'visible' },
  barChartArea: {
    height: '50px',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingBottom: '2px',
    borderBottom: '1px solid #22334f',
  },
  bar: {
    width: '8px',
    backgroundColor: '#e74c3c',
    borderRadius: '2px 2px 0 0',
  },
  daysRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '8px',
    color: '#777',
    marginTop: '4px',
  },
  bottomSection: {
    backgroundColor: '#0d1522',
    border: '1px solid #22334f',
    borderRadius: '6px',
    padding: '10px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  statusLegend: { display: 'flex', flexDirection: 'column', gap: '4px' },
  legendItem: { fontSize: '10px', color: '#ccc', display: 'flex', alignItems: 'center', gap: '6px' },
  dot: { width: '8px', height: '8px', borderRadius: '50%' },
  donutContainer: {
    position: 'relative',
    width: '50px',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutRing: {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    border: '4px solid #27ae60',
    borderTopColor: '#d4af37',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#070b12',
  },
  donutPercent: { fontSize: '11px', fontWeight: 'bold', color: '#fff' },
  badgeRed15: {
    position: 'absolute',
    top: '-2px',
    right: '-4px',
    backgroundColor: '#e74c3c',
    color: '#fff',
    fontSize: '8px',
    padding: '1px 3px',
    borderRadius: '4px',
    fontWeight: 'bold',
  },
  assignedListSection: {
    backgroundColor: '#0d1522',
    border: '1px solid #22334f',
    borderRadius: '6px',
    padding: '10px',
  },
  subHeader: {
    fontSize: '12px',
    color: '#d4af37',
    marginBottom: '8px',
    borderBottom: '1px solid #22334f',
    paddingBottom: '4px',
  },
  mutedText: { fontSize: '11px', color: '#777', textAlign: 'center' },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#121d2e',
    padding: '6px 8px',
    borderRadius: '4px',
    marginBottom: '6px',
    border: '1px solid #2a3b55',
  },
  checklistBtn: {
    backgroundColor: '#27ae60',
    color: '#fff',
    border: 'none',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
};
