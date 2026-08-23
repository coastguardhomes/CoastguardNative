import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

const COLOR_DORADO = "#e0b034";
const FONDO_PRINCIPAL = "#030509";
const FONDO_TARJETA = "linear-gradient(145deg, #0b1320 0%, #04070d 100%)";
const BORDE_DORADO_FINO = "1px solid rgba(224, 176, 52, 0.4)";
const SOMBRA_LUXURY = "0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 20px rgba(224, 176, 52, 0.12)";
const TEXTO_DORADO_BRILLO = { color: COLOR_DORADO, textShadow: "0 0 12px rgba(224, 176, 52, 0.6)" };

export default function TecnicoDashboard() {
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

      // 1. INSPECCIONES NORMALES
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

      // ⭐ 2. EXTRAS PENDIENTES — FIX APLICADO
      const { data: extrasData, error: extrasError } = await supabase
        .from('extras')
        .select('*')
        .not('factura_id', 'is', null)   // SOLO extras reales con factura
        .in('estado', ['pendiente', 'asignado', 'en_proceso'])  // NO mostrar finalizados
        .order('id', { ascending: false });

      if (extrasError) {
        console.warn('Aviso al cargar extras:', extrasError.message);
      }

      const listaExtras = extrasData || [];
      setExtrasPendientes(listaExtras);

      // 3. CONTADORES
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

        {/* AVISO / BOTÓN DE EXTRAS PENDIENTES */}
        {stats.extrasPendientesCount > 0 ? (
          <div style={{
            backgroundColor: 'rgba(56, 189, 248, 0.1)',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            borderRadius: '12px',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '20px' }}>⚡</span>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '12px', color: '#fff' }}>
                  ¡Tienes {stats.extrasPendientesCount} trabajo(s) extra pendiente(s)!
                </div>
                <div style={{ fontSize: '11px', color: '#38bdf8' }}>
                  Revisa la lista inferior para realizar fotos y observaciones.
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            backgroundColor: 'rgba(11, 19, 32, 0.6)',
            border: BORDE_DORADO_FINO,
            borderRadius: '12px',
            padding: '10px 14px',
            fontSize: '12px',
            color: '#888',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '14px' }}>⚡</span> No hay servicios extras pendientes.
          </div>
        )}

        {/* LISTADO DE EXTRAS PENDIENTES */}
        {extrasPendientes.length > 0 && (
          <div style={{
            background: FONDO_TARJETA,
            border: '1px solid rgba(56, 189, 248, 0.4)',
            borderRadius: '14px',
            padding: '14px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px'
            }}>
              <h3 style={{
                fontSize: '12px',
                color: '#38bdf8',
                margin: 0,
                fontWeight: '900',
                textTransform: 'uppercase'
              }}>
                🛠️ Trabajos Extras Asignados
              </h3>
              <span style={{
                backgroundColor: 'rgba(56, 189, 248, 0.2)',
                color: '#38bdf8',
                fontSize: '10px',
                padding: '3px 8px',
                borderRadius: '6px',
                fontWeight: '700'
              }}>
                {extrasPendientes.length} Pendientes
              </span>
            </div>

            <div style={{
              maxHeight: '180px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              {extrasPendientes.map((extra) => (
                <div key={extra.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: 'rgba(11, 19, 32, 0.9)',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid rgba(56, 189, 248, 0.3)'
                }}>
                  <div>
                    <div style={{
                      color: '#38bdf8',
                      fontWeight: 'bold',
                      fontSize: '12px'
                    }}>
                      Extra #{String(extra.id).substring(0, 8)} - {extra.titulo || extra.nombre || 'Servicio'}
                    </div>
                    <div style={{
                      color: '#aaa',
                      fontSize: '11px',
                      marginTop: '4px'
                    }}>
                      📝 {extra.descripcion || 'Sin descripción detallada'}
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
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
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
        <div style={{
          background: FONDO_TARJETA,
          border: BORDE_DORADO_FINO,
          borderRadius: '14px',
          padding: '14px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px'
          }}>
            <h3 style={{
              fontSize: '12px',
              color: COLOR_DORADO,
              margin: 0,
              fontWeight: '900',
              textTransform: 'uppercase'
            }}>
              Inspecciones Asignadas
            </h3>
            <span style={{
              backgroundColor: 'rgba(224, 176, 52, 0.15)',
              color: COLOR_DORADO,
              fontSize: '10px',
              padding: '3px 8px',
              borderRadius: '6px',
              fontWeight: '700'
            }}>
              {inspeccionesDiarias.length} Pendientes
            </span>
          </div>

          {loading ? (
            <p style={{
              fontSize: '12px',
              color: '#888',
              textAlign: 'center',
              padding: '10px 0'
            }}>
              Cargando asignaciones...
            </p>
          ) : inspeccionesDiarias.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <p style={{
                fontSize: '12px',
                color: '#888',
                marginBottom: '6px'
              }}>
                No hay inspecciones pendientes asignadas.
              </p>
            </div>
          ) : (
            <div style={{
              maxHeight: '180px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              {inspeccionesDiarias.map((insp) => (
                <div key={insp.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: 'rgba(11, 19, 32, 0.9)',
                  padding: '12px',
                  borderRadius: '10px',
                  border: BORDE_DORADO_FINO
                }}>
                  <div>
                    <div style={{
                      color: COLOR_DORADO,
                      fontWeight: 'bold',
                      fontSize: '12px'
                    }}>
                      Inspección #{String(insp.id).substring(0, 8)}
                    </div>
                    <div style={{
                      color: '#aaa',
                      fontSize: '11px',
                      marginTop: '4px'
                    }}>
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
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
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
