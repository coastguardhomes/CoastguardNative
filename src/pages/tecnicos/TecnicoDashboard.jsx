import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

export default function DashboardTecnico() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    inspeccionesSemana: 0,
    alertasDetectadas: 0,
    viviendasAsignadas: 0,
    extrasPendientesCount: 0,
  });
  const [inspeccionesDiarias, setInspeccionesDiarias] = useState([]);
  const [extrasPendientes, setExtrasPendientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [debugLog, setDebugLog] = useState('Iniciando carga...');

  useEffect(() => {
    cargarDatosDashboard();
  }, []);

  const cargarDatosDashboard = async () => {
    try {
      setLoading(true);
      setDebugLog('Conectando a Supabase...');

      // 1. Cargar inspecciones pendientes normales
      const { data: inspData, error: inspError } = await supabase
        .from('inspecciones')
        .select('*')
        .not('estado', 'in', '("completada_admin","finalizada","completada","aprobada")')
        .order('fecha', { ascending: false });

      if (inspError) {
        setDebugLog(`Error en inspecciones: ${inspError.message}`);
      }

      const rawLista = inspData || [];
      const viviendaIds = [...new Set(rawLista.map((i) => i.vivienda_id).filter(Boolean))];
      let viviendasMap = {};

      if (viviendaIds.length > 0) {
        const { data: vivData } = await supabase
          .from('viviendas')
          .select('id, direccion')
          .in('id', viviendaIds);

        if (vivData) {
          vivData.forEach((v) => {
            viviendasMap[v.id] = v.direccion;
          });
        }
      }

      const inspeccionesLista = rawLista.map((insp) => ({
        ...insp,
        direccion: viviendasMap[insp.vivienda_id] || insp.direccion || `Vivienda #${insp.vivienda_id || 'Sin asignar'}`,
      }));

      setInspeccionesDiarias(inspeccionesLista);

      // 2. Cargar EXTRAS pendientes asignados
      const { data: extrasData, error: extrasError } = await supabase
        .from('extras')
        .select('*')
        .not('estado', 'in', '("completada","finalizada","aprobada","enviado")')
        .order('id', { ascending: false });

      if (extrasError) {
        console.warn('Aviso al cargar extras (puede que la tabla no tenga datos aún):', extrasError.message);
      }

      const listaExtras = extrasData || [];
      setExtrasPendientes(listaExtras);

      // 3. Contar viviendas e incidencias
      const { count: countViviendas } = await supabase
        .from('viviendas')
        .select('*', { count: 'exact', head: true });

      const { count: countIncidencias } = await supabase
        .from('incidencias')
        .select('*', { count: 'exact', head: true });

      setStats({
        inspeccionesSemana: inspeccionesLista.length,
        alertasDetectadas: countIncidencias || 0,
        viviendasAsignadas: countViviendas || 0,
        extrasPendientesCount: listaExtras.length,
      });

      setDebugLog('¡Datos cargados con éxito!');
    } catch (error) {
      setDebugLog(`Excepción: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div style={styles.container}>
      <div style={styles.dashboardCard}>
        
        {/* ENCABEZADO */}
        <div style={styles.header}>
          <div>
            <div style={styles.brandBadge}>
              <span>⛵</span> COASTGUARD <span style={{ color: '#888', fontWeight: 'normal' }}>| TÉCNICO</span>
            </div>
            <h2 style={styles.headerTitle}>Panel de Operaciones</h2>
          </div>
          <button style={styles.btnLogout} onClick={handleLogout}>🚪 Salir</button>
        </div>

        <div style={styles.debugBox}>
          <span style={{ color: '#ffd700', fontWeight: 'bold' }}>Estado de Red:</span> {debugLog}
        </div>

        {/* 3 TARJETAS SUPERIORES */}
        <div style={styles.topCardsGrid}>
          <div style={styles.statCard}>
            <div style={styles.cardIcon}>📋</div>
            <div style={styles.statNumber}>{stats.inspeccionesSemana} <span style={styles.statSub}>pendientes</span></div>
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

        {/* AVISO / BOTÓN DE EXTRAS PENDIENTES */}
        {stats.extrasPendientesCount > 0 ? (
          <div style={styles.extraAlertBanner}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>⚡</span>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '12px', color: '#fff' }}>¡Tienes {stats.extrasPendientesCount} trabajo(s) extra pendiente(s)!</div>
                <div style={{ fontSize: '10px', color: '#ffd700' }}>Revisa la lista inferior para realizar fotos y observaciones.</div>
              </div>
            </div>
          </div>
        ) : (
          <div style={styles.extraNoAlertBanner}>
            <span style={{ fontSize: '14px' }}>⚡</span> No hay servicios extras pendientes.
          </div>
        )}

        {/* LISTADO DE EXTRAS PENDIENTES */}
        {extrasPendientes.length > 0 && (
          <div style={styles.assignedSectionExtra}>
            <div style={styles.sectionHeaderFlex}>
              <h3 style={styles.assignedTitleExtra}>🛠️ Trabajos Extras Asignados</h3>
              <span style={styles.counterBadgeExtra}>{extrasPendientes.length} Pendientes</span>
            </div>
            <div style={styles.listScrollContainer}>
              {extrasPendientes.map((extra) => (
                <div key={extra.id} style={styles.assignmentItemExtra}>
                  <div>
                    <div style={{ color: '#3498db', fontWeight: 'bold', fontSize: '12px' }}>
                      Extra #{String(extra.id).substring(0, 8)} - {extra.titulo || extra.nombre || 'Servicio'}
                    </div>
                    <div style={{ color: '#aaa', fontSize: '11px', marginTop: '3px' }}>
                      📝 {extra.descripcion || 'Sin descripción detallada'}
                    </div>
                  </div>
                  <button 
                    style={styles.btnActionExtraItem}
                    onClick={() => navigate(`/tecnico/extra/${extra.id}`)}
                  >
                    Hacer Extra →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LISTADO DE INSPECCIONES NORMALES */}
        <div style={styles.assignedSection}>
          <div style={styles.sectionHeaderFlex}>
            <h3 style={styles.assignedTitle}>Inspecciones Asignadas</h3>
            <span style={styles.counterBadge}>{inspeccionesDiarias.length} Pendientes</span>
          </div>

          {loading ? (
            <p style={styles.emptyText}>Cargando asignaciones...</p>
          ) : inspeccionesDiarias.length === 0 ? (
            <div style={styles.emptyBox}>
              <p style={styles.emptyText}>No hay inspecciones pendientes asignadas.</p>
            </div>
          ) : (
            <div style={styles.listScrollContainer}>
              {inspeccionesDiarias.map((insp) => (
                <div key={insp.id} style={styles.assignmentItem}>
                  <div>
                    <div style={{ color: '#ffd700', fontWeight: 'bold', fontSize: '12px' }}>
                      Inspección #{String(insp.id).substring(0, 8)}
                    </div>
                    <div style={{ color: '#aaa', fontSize: '11px', marginTop: '3px' }}>
                      📍 {insp.direccion}
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

      </div>
    </div>
  );
}

const styles = {
  container: { backgroundColor: '#04070c', minHeight: '100vh', padding: '10px 6px', display: 'flex', justifyContent: 'center', fontFamily: 'sans-serif' },
  dashboardCard: { width: '100%', maxWidth: '480px', backgroundColor: '#09101d', border: '1px solid #c5a03e', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #c5a03e', paddingBottom: '10px' },
  brandBadge: { color: '#ffd700', fontSize: '10px', fontWeight: 'bold', marginBottom: '4px' },
  headerTitle: { color: '#fff', fontSize: '18px', fontWeight: 'bold', margin: 0 },
  btnLogout: { background: 'linear-gradient(135deg, #e74c3c, #c0392b)', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' },
  debugBox: { backgroundColor: '#111b2e', border: '1px solid #d4af37', borderRadius: '6px', padding: '8px', fontSize: '10px', color: '#fff' },
  topCardsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' },
  statCard: { background: '#070d17', border: '1px solid #d4af37', borderRadius: '8px', padding: '10px 4px', textAlign: 'center' },
  alertCard: { background: '#0d070a', border: '1px solid #e74c3c', borderRadius: '8px', padding: '10px 4px', textAlign: 'center' },
  cardIcon: { fontSize: '16px', marginBottom: '2px' },
  statNumber: { fontSize: '15px', fontWeight: 'bold', color: '#fff' },
  statNumberRed: { fontSize: '15px', fontWeight: 'bold', color: '#e74c3c' },
  statSub: { fontSize: '7px', color: '#888', display: 'block' },
  statLabel: { fontSize: '9px', color: '#ffd700', marginTop: '2px', fontWeight: '600' },
  statLabelAlert: { fontSize: '9px', color: '#e74c3c', marginTop: '2px', fontWeight: '600' },
  extraAlertBanner: { backgroundColor: '#1a365d', border: '1px solid #3182ce', borderRadius: '8px', padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  extraNoAlertBanner: { backgroundColor: '#111b2e', border: '1px solid #2a3b55', borderRadius: '8px', padding: '8px 12px', fontSize: '11px', color: '#888', display: 'flex', alignItems: 'center', gap: '8px' },
  assignedSection: { background: '#070d17', border: '1px solid #1e3050', borderRadius: '10px', padding: '12px' },
  assignedSectionExtra: { background: '#081b29', border: '1px solid #2980b9', borderRadius: '10px', padding: '12px' },
  sectionHeaderFlex: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  assignedTitle: { fontSize: '11px', color: '#ffd700', margin: 0, fontWeight: 'bold', textTransform: 'uppercase' },
  assignedTitleExtra: { fontSize: '11px', color: '#3498db', margin: 0, fontWeight: 'bold', textTransform: 'uppercase' },
  counterBadge: { backgroundColor: '#16263f', color: '#ffd700', fontSize: '9px', padding: '2px 6px', borderRadius: '4px' },
  counterBadgeExtra: { backgroundColor: '#1b4f72', color: '#3498db', fontSize: '9px', padding: '2px 6px', borderRadius: '4px' },
  listScrollContainer: { maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' },
  emptyBox: { textAlign: 'center', padding: '10px 0' },
  emptyText: { fontSize: '11px', color: '#888', marginBottom: '6px' },
  assignmentItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111b2e', padding: '10px 12px', borderRadius: '6px', border: '1px solid #2a3b55' },
  assignmentItemExtra: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0d233a', padding: '10px 12px', borderRadius: '6px', border: '1px solid #2980b9' },
  btnActionItem: { backgroundColor: '#27ae60', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' },
  btnActionExtraItem: { backgroundColor: '#2980b9', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }
};
