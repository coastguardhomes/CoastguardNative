import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function TecnicoChecklist() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [inspeccion, setInspeccion] = useState(null);
  const [vivienda, setVivienda] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && id !== 'general') {
      cargarChecklist();
    } else {
      // Modo genérico por si entran sin ID específico de inspección
      setLoading(false);
      setMensaje("Modo checklist genérico activo. Seleccione una inspección válida para guardar registros.");
    }
  }, [id]);

  async function cargarChecklist() {
    try {
      setLoading(true);
      setMensaje("");

      if (!user?.email) {
        setMensaje("No se detectó sesión de usuario activa.");
        setLoading(false);
        return;
      }

      const { data: tecnico, error: errTecnico } = await supabase
        .from("tecnicos")
        .select("id")
        .eq("email", user.email)
        .maybeSingle();

      // Si no existe en la tabla técnicos pero hay sesión, permitimos pasar o manejamos el error con gracia
      const tecnicoId = tecnico ? tecnico.id : null;

      const { data: insp, error: errInsp } = await supabase
        .from("inspecciones")
        .select("*")
        .eq("id", id)
        .single();

      if (errInsp || !insp) {
        setMensaje("Inspección no encontrada en el sistema.");
        setLoading(false);
        return;
      }

      setInspeccion(insp);

      if (insp.vivienda_id) {
        const { data: viv } = await supabase
          .from("viviendas")
          .select("nombre, direccion, ciudad")
          .eq("id", insp.vivienda_id)
          .maybeSingle();
        setVivienda(viv || null);
      }

      if (insp.contrato_id) {
        const { data: contrato } = await supabase
          .from("contratos")
          .select("cliente_id")
          .eq("id", insp.contrato_id)
          .maybeSingle();

        if (contrato?.cliente_id) {
          const { data: cli } = await supabase
            .from("clientes")
            .select("nombre, telefono")
            .eq("id", contrato.cliente_id)
            .maybeSingle();
          setCliente(cli || null);
        }
      }

      const { data: checklistData, error: errChecklist } = await supabase
        .from("checklist_inspeccion")
        .select("id, inspeccion_id, texto, estado")
        .eq("inspeccion_id", id)
        .order("id", { ascending: true });

      if (errChecklist) {
        console.error("Error al cargar ítems:", errChecklist);
      }

      setItems(checklistData || []);
    } catch (e) {
      console.error("Excepción cargando checklist:", e);
      setMensaje("Ocurrió un error al cargar los datos.");
    } finally {
      setLoading(false);
    }
  }

  async function marcarItem(itemId, nuevoEstado) {
    setMensaje("");

    const { error } = await supabase
      .from("checklist_inspeccion")
      .update({ estado: nuevoEstado })
      .eq("id", itemId);

    if (error) {
      setMensaje("Error guardando el estado en Supabase");
      return;
    }

    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, estado: nuevoEstado } : i))
    );

    if (id && id !== 'general') {
      await supabase
        .from("inspecciones")
        .update({
          checklist_completado: true,
          fecha_checklist: new Date().toISOString(),
          estado: "checklist_completado",
        })
        .eq("id", id);
    }
  }

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={{ color: '#ffd700', fontSize: '14px', marginTop: '10px' }}>Cargando checklist...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        
        {/* ENCABEZADO */}
        <div style={styles.header}>
          <div>
            <div style={styles.brandBadge}>⛵ COASTGUARD</div>
            <h1 style={styles.title}>Checklist de Inspección</h1>
          </div>
          <button style={styles.btnBackHeader} onClick={() => navigate(-1)}>
            ← Volver
          </button>
        </div>

        {mensaje && <div style={styles.alertBox}>{mensaje}</div>}

        {/* INFO DE LA VIVIENDA / INSPECCIÓN */}
        <div style={styles.infoBox}>
          <p style={styles.infoText}>
            <strong style={{ color: "#ffd700" }}>Vivienda:</strong> {vivienda?.nombre || 'Inspección en Ruta'}
          </p>
          <p style={styles.infoText}>
            <strong style={{ color: "#ffd700" }}>Dirección:</strong> {vivienda?.direccion || 'No especificada'}
          </p>
          <p style={styles.infoText}>
            <strong style={{ color: "#ffd700" }}>Cliente:</strong> {cliente ? `${cliente.nombre} (${cliente.telefono})` : "Sin cliente asignado"}
          </p>
        </div>

        {/* LISTADO DE ITEMS */}
        {items.length === 0 ? (
          <div style={styles.emptyContainer}>
            <p style={{ color: '#aaa', fontSize: '12px' }}>No hay ítems configurados para este checklist.</p>
            <button 
              style={styles.mainBtn}
              onClick={() => alert('Se puede proceder con el registro manual de incidencias.')}
            >
              ➕ Registrar Incidencia Extra
            </button>
          </div>
        ) : (
          <div style={styles.itemsList}>
            {items.map((item) => (
              <div key={item.id} style={styles.itemCard}>
                <p style={styles.itemText}>{item.texto}</p>
                <div style={styles.statusRow}>
                  <span style={{ fontSize: '10px', color: '#888' }}>
                    Estado: <strong style={{ color: item.estado === 'ok' ? '#2ecc71' : item.estado === 'ko' ? '#e74c3c' : '#ffd700' }}>
                      {item.estado === 'ok' ? '✔ OK' : item.estado === 'ko' ? '✖ KO' : 'Pendiente'}
                    </strong>
                  </span>
                </div>
                <div style={styles.btnGroup}>
                  <button
                    onClick={() => marcarItem(item.id, "ok")}
                    style={{
                      ...styles.btnCheck,
                      background: item.estado === "ok" ? "#2ecc71" : "#10192d",
                      borderColor: item.estado === "ok" ? "#2ecc71" : "#2a3b55",
                    }}
                  >
                    ✔ OK
                  </button>
                  <button
                    onClick={() => marcarItem(item.id, "ko")}
                    style={{
                      ...styles.btnCheck,
                      background: item.estado === "ko" ? "#e74c3c" : "#10192d",
                      borderColor: item.estado === "ko" ? "#e74c3c" : "#2a3b55",
                    }}
                  >
                    ✖ KO
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* BOTONES INFERIORES DE NAVEGACIÓN */}
        <div style={styles.footerNav}>
          {id && id !== 'general' && (
            <>
              <button 
                style={styles.navBtnBlue}
                onClick={() => navigate(`/tecnico/inspeccion/${id}/fotos`)}
              >
                📷 Adjuntar Fotos
              </button>
              <button 
                style={styles.navBtnGreen}
                onClick={() => navigate(`/tecnico/inspeccion/${id}/finalizar`)}
              >
                ✅ Finalizar Inspección
              </button>
            </>
          )}
          <button 
            style={styles.navBtnGray}
            onClick={() => navigate('/tecnico/dashboard')}
          >
            🏠 Ir al Panel Principal
          </button>
        </div>

      </div>
    </div>
  );
}

const styles = {
  loadingContainer: {
    backgroundColor: '#04070c',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: 'sans-serif',
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid #1e3050',
    borderTop: '3px solid #ffd700',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  container: {
    backgroundColor: '#04070c',
    minHeight: '100vh',
    padding: '10px 6px',
    display: 'flex',
    justifyContent: 'center',
    fontFamily: 'sans-serif',
  },
  card: {
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
    alignItems: 'center',
    borderBottom: '2px solid #c5a03e',
    paddingBottom: '8px',
  },
  brandBadge: { color: '#ffd700', fontSize: '9px', fontWeight: 'bold' },
  title: { color: '#fff', fontSize: '16px', margin: '2px 0 0 0', fontWeight: 'bold' },
  btnBackHeader: {
    backgroundColor: '#16263f',
    color: '#ffd700',
    border: '1px solid #d4af37',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '10px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  alertBox: {
    backgroundColor: 'rgba(231, 76, 60, 0.15)',
    border: '1px solid #e74c3c',
    color: '#ff7675',
    padding: '8px',
    borderRadius: '6px',
    fontSize: '11px',
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: '#0d1626',
    border: '1px solid #1e3050',
    borderRadius: '8px',
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  infoText: { margin: 0, fontSize: '11px', color: '#ccc' },
  emptyContainer: { textAlign: 'center', padding: '20px 0', display: 'flex', flexDirection: 'column', gap: '10px' },
  mainBtn: {
    background: 'linear-gradient(to bottom, #f3e0aa 0%, #d4af37 50%, #b8860b 100%)',
    color: '#070b12',
    border: 'none',
    padding: '10px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxHeight: '320px',
    overflowY: 'auto',
  },
  itemCard: {
    backgroundColor: '#0d1626',
    border: '1px solid #1e3050',
    borderRadius: '8px',
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  itemText: { color: '#fff', fontSize: '12px', margin: 0, fontWeight: '600' },
  statusRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  btnGroup: { display: 'flex', gap: '8px' },
  btnCheck: {
    flex: 1,
    padding: '8px',
    borderRadius: '6px',
    border: '1px solid',
    color: '#fff',
    fontSize: '11px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  footerNav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '6px',
  },
  navBtnBlue: {
    backgroundColor: '#2980b9',
    color: '#fff',
    border: 'none',
    padding: '10px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  navBtnGreen: {
    backgroundColor: '#27ae60',
    color: '#fff',
    border: 'none',
    padding: '10px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  navBtnGray: {
    backgroundColor: '#16263f',
    color: '#ffd700',
    border: '1px solid #d4af37',
    padding: '8px',
    borderRadius: '8px',
    fontSize: '11px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
};
