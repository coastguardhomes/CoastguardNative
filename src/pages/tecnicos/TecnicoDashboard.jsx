import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { useLanguage } from '../../context/LanguageContext';

const COLOR_DORADO = "#e0b034";
const FONDO_PRINCIPAL = "#030509";
const FONDO_TARJETA = "linear-gradient(145deg, #0b1320 0%, #04070d 100%)";
const BORDE_DORADO_FINO = "1px solid rgba(224, 176, 52, 0.4)";
const SOMBRA_LUXURY = "0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 20px rgba(224, 176, 52, 0.12)";
const TEXTO_DORADO_BRILLO = {
  color: COLOR_DORADO,
  textShadow: "0 0 12px rgba(224, 176, 52, 0.6)"
};

const TEXTOS = {
  es: {
    technician: 'TÉCNICO',
    dashboard: 'Panel de Operaciones',
    logout: 'Salir',
    networkStatus: 'Estado de Red:',
    starting: 'Iniciando carga...',
    connecting: 'Conectando a Supabase...',
    loaded: '¡Datos cargados!',
    generalError: 'Error general: ',
    unknownError: 'Error desconocido',
    inspections: 'Inspecciones',
    alerts: 'Alertas',
    homes: 'Viviendas',
    extrasPending: 'Tienes {count} extras pendientes',
    noExtras: 'No hay servicios extras pendientes.',
    assignedExtras: 'Trabajos Extras Asignados',
    invoice: 'Factura #',
    noConcept: 'Sin concepto',
    doExtra: 'Hacer Extra →',
    assignedInspections: 'Inspecciones Asignadas',
    loadingAssignments: 'Cargando asignaciones...',
    noAssignments: 'No hay inspecciones pendientes asignadas.',
    inspection: 'Inspección #',
    checklist: 'Checklist →',
    unassigned: 'Vivienda sin asignar'
  },
  en: {
    technician: 'TECHNICIAN',
    dashboard: 'Operations Dashboard',
    logout: 'Log out',
    networkStatus: 'Network status:',
    starting: 'Starting...',
    connecting: 'Connecting to Supabase...',
    loaded: 'Data loaded!',
    generalError: 'General error: ',
    unknownError: 'Unknown error',
    inspections: 'Inspections',
    alerts: 'Alerts',
    homes: 'Properties',
    extrasPending: 'You have {count} pending extra services',
    noExtras: 'No pending extra services.',
    assignedExtras: 'Assigned Extra Services',
    invoice: 'Invoice #',
    noConcept: 'No description',
    doExtra: 'Perform extra →',
    assignedInspections: 'Assigned Inspections',
    loadingAssignments: 'Loading assignments...',
    noAssignments: 'No pending inspections assigned.',
    inspection: 'Inspection #',
    checklist: 'Checklist →',
    unassigned: 'Unassigned property'
  },
  fr: {
    technician: 'TECHNICIEN',
    dashboard: 'Tableau de bord des opérations',
    logout: 'Déconnexion',
    networkStatus: 'État du réseau :',
    starting: 'Chargement en cours...',
    connecting: 'Connexion à Supabase...',
    loaded: 'Données chargées !',
    generalError: 'Erreur générale : ',
    unknownError: 'Erreur inconnue',
    inspections: 'Inspections',
    alerts: 'Alertes',
    homes: 'Logements',
    extrasPending: 'Vous avez {count} prestations supplémentaires en attente',
    noExtras: 'Aucune prestation supplémentaire en attente.',
    assignedExtras: 'Prestations supplémentaires attribuées',
    invoice: 'Facture n°',
    noConcept: 'Sans description',
    doExtra: 'Effectuer la prestation →',
    assignedInspections: 'Inspections attribuées',
    loadingAssignments: 'Chargement des affectations...',
    noAssignments: 'Aucune inspection en attente attribuée.',
    inspection: 'Inspection n°',
    checklist: 'Liste de contrôle →',
    unassigned: 'Logement non attribué'
  }
};

export default function TecnicoDashboard() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const idioma = TEXTOS[language] ? language : 'es';
  const t = (key) => TEXTOS[idioma][key] || TEXTOS.es[key] || key;

  const [stats, setStats] = useState({
    inspeccionesSemana: 0,
    alertasDetectadas: 0,
    viviendasAsignadas: 0,
    extrasPendientesCount: 0,
  });

  const [inspeccionesDiarias, setInspeccionesDiarias] = useState([]);
  const [extrasPendientes, setExtrasPendientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [debugLog, setDebugLog] = useState('starting');

  useEffect(() => {
    cargarDatosDashboard();
  }, []);

  const cargarDatosDashboard = async () => {
    try {
      setLoading(true);
      setDebugLog('connecting');

      // 1. INSPECCIONES NORMALES
      const { data: inspData, error: inspError } = await supabase
        .from('inspecciones')
        .select('*')
        .not('estado', 'eq', 'completada_tecnico')
        .not('estado', 'eq', 'finalizada')
        .not('estado', 'eq', 'aprobada')
        .not('estado', 'eq', 'completada_admin')
        .or(
          'estado_tecnico.is.null,estado_tecnico.not.in.(completada,completado,finalizada)'
        )
        .order('fecha', { ascending: false });

      if (inspError) {
        console.error("Error inspecciones:", inspError);
      }

      const rawLista = inspData || [];

      const viviendaIds = [
        ...new Set(
          rawLista
            .map((inspeccion) => inspeccion.vivienda_id)
            .filter(Boolean)
        )
      ];

      const viviendasMap = {};

      if (viviendaIds.length > 0) {
        const { data: vivData, error: vivError } = await supabase
          .from('viviendas')
          .select('id, direccion')
          .in('id', viviendaIds);

        if (vivError) {
          console.error("Error al consultar viviendas:", vivError);
        }

        if (vivData) {
          vivData.forEach((vivienda) => {
            viviendasMap[vivienda.id] = vivienda.direccion;
          });
        }
      }

      const inspeccionesLista = rawLista.map((inspeccion) => ({
        ...inspeccion,
        direccion:
          viviendasMap[inspeccion.vivienda_id] ||
          inspeccion.direccion ||
          `${t('unassigned')} #${inspeccion.vivienda_id || ''}`,
      }));

      setInspeccionesDiarias(inspeccionesLista);

      // 2. EXTRAS PAGADOS
      // Se mantienen las consultas y los filtros originales.
      const { data: extrasData, error: extrasError } = await supabase
        .from('facturas')
        .select('*')
        .in('estado', ['pagada', 'pagado'])
        .is('contrato_id', null)
        .order('id', { ascending: false });

      if (extrasError) {
        console.error("Error facturas/extras:", extrasError);
      }

      const {
        data: trabajosExtraData,
        error: trabajosExtraError
      } = await supabase
        .from('extras')
        .select('factura_id, estado_tecnico')
        .not('factura_id', 'is', null);

      if (trabajosExtraError) {
        console.error(
          "No se pudieron consultar los estados de extras:",
          trabajosExtraError
        );
      }

      const normalizarEstado = (estado) =>
        String(estado || '').trim().toLowerCase();

      const estadosCompletados = new Set([
        'completado',
        'completada',
        'completados',
        'completadas',
        'finalizado',
        'finalizada',
        'finalizados',
        'finalizadas',
        'completada_tecnico',
        'completado_tecnico',
        'finalizada_tecnico',
        'finalizado_tecnico',
      ]);

      const facturasExtraCompletadas = new Set(
        (trabajosExtraData || [])
          .filter((trabajo) =>
            estadosCompletados.has(
              normalizarEstado(trabajo.estado_tecnico)
            )
          )
          .map((trabajo) => String(trabajo.factura_id))
      );

      const listaExtras = (extrasData || []).filter((factura) => {
        const estadoFactura = normalizarEstado(factura.estado_tecnico);

        const facturaCompletada =
          estadosCompletados.has(estadoFactura) ||
          facturasExtraCompletadas.has(String(factura.id));

        return !facturaCompletada;
      });

      setExtrasPendientes(listaExtras);

      // 3. CONTADORES
      const { count: countViviendas, error: viviendasCountError } =
        await supabase
          .from('viviendas')
          .select('*', {
            count: 'exact',
            head: true
          });

      if (viviendasCountError) {
        console.error(
          "Error al contar viviendas:",
          viviendasCountError
        );
      }

      const { count: countIncidencias, error: incidenciasCountError } =
        await supabase
          .from('incidencias')
          .select('*', {
            count: 'exact',
            head: true
          });

      if (incidenciasCountError) {
        console.error(
          "Error al contar incidencias:",
          incidenciasCountError
        );
      }

      setStats({
        inspeccionesSemana: inspeccionesLista.length,
        alertasDetectadas: countIncidencias || 0,
        viviendasAsignadas: countViviendas || 0,
        extrasPendientesCount: listaExtras.length,
      });

      setDebugLog('loaded');

    } catch (error) {
      console.error("Error al cargar el Dashboard:", error);
      setDebugLog(
        t('generalError') + (error?.message || t('unknownError'))
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login', {
      replace: true
    });
  };

  const debugLogVisible =
    ['starting', 'connecting', 'loaded'].includes(debugLog)
      ? t(debugLog)
      : debugLog;

  return (
    <div
      style={{
        backgroundColor: FONDO_PRINCIPAL,
        minHeight: '100vh',
        padding: '16px',
        display: 'flex',
        justifyContent: 'center',
        fontFamily: 'Inter, sans-serif',
        boxSizing: 'border-box'
      }}
    >
      <div
        style={{
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
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: BORDE_DORADO_FINO,
            paddingBottom: '14px'
          }}
        >
          <div>
            <div
              style={{
                color: COLOR_DORADO,
                fontSize: '11px',
                fontWeight: '900',
                marginBottom: '4px'
              }}
            >
              ⛵ COASTGUARD <span style={{ color: '#888' }}>| {t('technician')}</span>
            </div>

            <h2
              style={{
                ...TEXTO_DORADO_BRILLO,
                fontSize: '20px',
                fontWeight: '900',
                margin: 0
              }}
            >
              {t('dashboard')}
            </h2>
          </div>

          <button
            onClick={handleLogout}
            style={{
              background: 'transparent',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#ef4444',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            🚪 {t('logout')}
          </button>
        </div>

        <div
          style={{
            background: 'rgba(11, 19, 32, 0.8)',
            border: BORDE_DORADO_FINO,
            borderRadius: '10px',
            padding: '10px 14px',
            fontSize: '11px',
            color: '#fff'
          }}
        >
          <span
            style={{
              color: COLOR_DORADO,
              fontWeight: 'bold'
            }}
          >
            {t('networkStatus')}
          </span>{' '}
          {debugLogVisible}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '10px'
          }}
        >
          <div
            style={{
              background: FONDO_TARJETA,
              border: BORDE_DORADO_FINO,
              borderRadius: '12px',
              padding: '12px 6px',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '18px' }}>📋</div>
            <div
              style={{
                fontSize: '16px',
                fontWeight: '900',
                color: '#fff'
              }}
            >
              {stats.inspeccionesSemana}
            </div>
            <div
              style={{
                fontSize: '10px',
                color: COLOR_DORADO
              }}
            >
              {t('inspections')}
            </div>
          </div>

          <div
            style={{
              background:
                'linear-gradient(145deg, #1f0b0b 0%, #0d070a 100%)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '12px',
              padding: '12px 6px',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '18px' }}>⚠️</div>
            <div
              style={{
                fontSize: '16px',
                fontWeight: '900',
                color: '#ef4444'
              }}
            >
              {stats.alertasDetectadas}
            </div>
            <div
              style={{
                fontSize: '10px',
                color: '#ef4444'
              }}
            >
              {t('alerts')}
            </div>
          </div>

          <div
            style={{
              background: FONDO_TARJETA,
              border: BORDE_DORADO_FINO,
              borderRadius: '12px',
              padding: '12px 6px',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '18px' }}>🏠</div>
            <div
              style={{
                fontSize: '16px',
                fontWeight: '900',
                color: '#fff'
              }}
            >
              {stats.viviendasAsignadas}
            </div>
            <div
              style={{
                fontSize: '10px',
                color: COLOR_DORADO
              }}
            >
              {t('homes')}
            </div>
          </div>
        </div>

        {stats.extrasPendientesCount > 0 ? (
          <div
            style={{
              backgroundColor: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              borderRadius: '12px',
              padding: '12px 14px'
            }}
          >
            <span
              style={{
                color: '#38bdf8',
                fontWeight: 'bold'
              }}
            >
              ⚡ {t('extrasPending').replace(
                '{count}',
                stats.extrasPendientesCount
              )}
            </span>
          </div>
        ) : (
          <div
            style={{
              backgroundColor: 'rgba(11, 19, 32, 0.6)',
              border: BORDE_DORADO_FINO,
              borderRadius: '12px',
              padding: '10px 14px',
              color: '#888'
            }}
          >
            ⚡ {t('noExtras')}
          </div>
        )}

        {extrasPendientes.length > 0 && (
          <div
            style={{
              background: FONDO_TARJETA,
              border: '1px solid rgba(56, 189, 248, 0.4)',
              borderRadius: '14px',
              padding: '14px'
            }}
          >
            <h3
              style={{
                color: '#38bdf8',
                fontSize: '12px',
                marginBottom: '10px'
              }}
            >
              🛠️ {t('assignedExtras')}
            </h3>

            <div
              style={{
                maxHeight: '180px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              {extrasPendientes.map((extra) => (
                <div
                  key={extra.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'rgba(11, 19, 32, 0.9)',
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid rgba(56, 189, 248, 0.3)'
                  }}
                >
                  <div>
                    <div
                      style={{
                        color: '#38bdf8',
                        fontWeight: 'bold',
                        fontSize: '12px'
                      }}
                    >
                      {t('invoice')}
                      {extra.codigo || String(extra.id).substring(0, 8)}
                    </div>

                    <div
                      style={{
                        color: '#aaa',
                        fontSize: '11px',
                        marginTop: '4px'
                      }}
                    >
                      📝{' '}
                      {extra.concepto ||
                        extra.descripcion ||
                        t('noConcept')}
                    </div>
                  </div>

                  <button
                    style={{
                      backgroundColor: '#38bdf8',
                      color: '#030509',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: '900',
                      cursor: 'pointer'
                    }}
                    onClick={() =>
                      navigate(`/tecnico/extra/${extra.id}`)
                    }
                  >
                    {t('doExtra')}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div
          style={{
            background: FONDO_TARJETA,
            border: BORDE_DORADO_FINO,
            borderRadius: '14px',
            padding: '14px'
          }}
        >
          <h3
            style={{
              fontSize: '12px',
              color: COLOR_DORADO,
              marginBottom: '10px'
            }}
          >
            {t('assignedInspections')}
          </h3>

          {loading ? (
            <p
              style={{
                color: '#888',
                textAlign: 'center'
              }}
            >
              {t('loadingAssignments')}
            </p>
          ) : inspeccionesDiarias.length === 0 ? (
            <p
              style={{
                color: '#888',
                textAlign: 'center'
              }}
            >
              {t('noAssignments')}
            </p>
          ) : (
            <div
              style={{
                maxHeight: '180px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              {inspeccionesDiarias.map((insp) => (
                <div
                  key={insp.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'rgba(11, 19, 32, 0.9)',
                    padding: '12px',
                    borderRadius: '10px',
                    border: BORDE_DORADO_FINO
                  }}
                >
                  <div>
                    <div
                      style={{
                        color: COLOR_DORADO,
                        fontWeight: 'bold',
                        fontSize: '12px'
                      }}
                    >
                      {t('inspection')}
                      {String(insp.id).substring(0, 8)}
                    </div>

                    <div
                      style={{
                        color: '#aaa',
                        fontSize: '11px',
                        marginTop: '4px'
                      }}
                    >
                      📍 {insp.direccion}
                    </div>
                  </div>

                  <button
                    style={{
                      backgroundColor: '#10b981',
                      color: '#fff',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: '900',
                      cursor: 'pointer'
                    }}
                    onClick={() =>
                      navigate(
                        `/tecnico/inspeccion/${insp.id}/checklist`
                      )
                    }
                  >
                    {t('checklist')}
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
