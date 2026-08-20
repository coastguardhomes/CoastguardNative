import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useParams, useNavigate, Link } from "react-router-dom";

const COLOR_DORADO = "#e0b034";
const FONDO_PRINCIPAL = "#030509";
const FONDO_TARJETA = "linear-gradient(145deg, #0b1320 0%, #04070d 100%)";
const BORDE_DORADO_FINO = "1px solid rgba(224, 176, 52, 0.4)";
const SOMBRA_LUXURY = "0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 20px rgba(224, 176, 52, 0.12)";
const TEXTO_DORADO_BRILLO = { color: COLOR_DORADO, textShadow: "0 0 12px rgba(224, 176, 52, 0.6)" };

export default function VerTecnico() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tecnico, setTecnico] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [inspecciones, setInspecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    if (id) {
      cargarDatos();
    }
  }, [id]);

  async function cargarDatos() {
    setLoading(true);
    setMensaje("");

    try {
      // 1️⃣ Cargar técnico
      const { data: dataTecnico, error: errorTec } = await supabase
        .from("tecnicos")
        .select("id, nombre, telefono, email, especialidad, activo, created_at")
        .eq("id", String(id))
        .single();

      if (errorTec || !dataTecnico) {
        setMensaje("No se encontró el técnico o ocurrió un error al cargarlo.");
        setLoading(false);
        return;
      }

      setTecnico(dataTecnico);

      // 2️⃣ Cargar inspecciones con joins nativos (1 sola consulta eficiente)
      const { data: dataInsp, error: errorInsp } = await supabase
        .from("inspecciones")
        .select(`
          id,
          fecha,
          estado,
          vivienda_id,
          cliente_id,
          created_at,
          viviendas (direccion, ciudad),
          clientes (nombre, telefono)
        `)
        .eq("tecnico_id", String(id))
        .order("fecha", { ascending: false });

      if (errorInsp) {
        console.error("Error al cargar inspecciones:", errorInsp);
      } else {
        const formateadas = (dataInsp || []).map((i) => ({
          ...i,
          vivienda: i.viviendas || null,
          cliente: i.clientes || null,
        }));
        setInspecciones(formateadas);
      }
    } catch (err) {
      console.error("Error inesperado:", err);
      setMensaje("Error general al recuperar los datos.");
    } finally {
      setLoading(false);
    }
  }

  async function eliminarTecnico() {
    const confirmar = window.confirm(
      "¿Seguro que deseas eliminar este técnico? Sus inspecciones quedarán desvinculadas y pendientes de reasignar."
    );
    if (!confirmar) return;

    setProcesando(true);
    setMensaje("");

    try {
      // 1. Desvincular inspecciones primero (tecnico_id = null)
      const { error: updateError } = await supabase
        .from("inspecciones")
        .update({ tecnico_id: null, estado: "pendiente_reasignar" })
        .eq("tecnico_id", String(id));

      if (updateError) {
        setMensaje("Error al desvincular las inspecciones del técnico.");
        setProcesando(false);
        return;
      }

      // 2. Borrar técnico
      const { error: deleteError } = await supabase
        .from("tecnicos")
        .delete()
        .eq("id", String(id));

      if (deleteError) {
        setMensaje("Error al eliminar el técnico: " + deleteError.message);
      } else {
        alert("Técnico eliminado correctamente");
        navigate("/tecnicos");
      }
    } catch (err) {
      console.error("Error en eliminación:", err);
      setMensaje("Error procesando la eliminación.");
    } finally {
      setProcesando(false);
    }
  }

  async function cambiarEstado() {
    setProcesando(true);
    setMensaje("");

    try {
      const nuevoEstado = !tecnico.activo;

      const { error: errorTec } = await supabase
        .from("tecnicos")
        .update({ activo: nuevoEstado })
        .eq("id", String(id));

      if (errorTec) {
        setMensaje("Error al cambiar el estado del técnico.");
        setProcesando(false);
        return;
      }

      // Si pasa a inactivo, desvinculamos inspecciones pendientes o asignadas
      if (!nuevoEstado) {
        await supabase
          .from("inspecciones")
          .update({ tecnico_id: null, estado: "pendiente_reasignar" })
          .eq("tecnico_id", String(id))
          .in("estado", ["pendiente", "asignada"]);
      }

      await cargarDatos();
    } catch (err) {
      console.error("Error al actualizar estado:", err);
      setMensaje("Error procesando el cambio de estado.");
    } finally {
      setProcesando(false);
    }
  }

  if (loading) {
    return (
      <Menu>
        <div
          style={{
            height: "100vh",
            background: FONDO_PRINCIPAL,
            color: COLOR_DORADO,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontFamily: "Inter, sans-serif",
            fontSize: "16px",
            fontWeight: "700",
          }}
        >
          Cargando datos del técnico...
        </div>
      </Menu>
    );
  }

  const pendientes = inspecciones.filter(
    (i) => i.estado === "pendiente" || i.estado === "asignada"
  );
  const completadasTecnico = inspecciones.filter(
    (i) => i.estado === "completada" || i.estado === "completada_tecnico"
  );
  const completadasAdmin = inspecciones.filter(
    (i) => i.estado === "aceptada" || i.estado === "completada_admin"
  );

  return (
    <Menu>
      <div
        style={{
          padding: "20px",
          background: FONDO_PRINCIPAL,
          minHeight: "100vh",
          color: "#fff",
          fontFamily: "Inter, sans-serif",
          paddingBottom: "100px",
          boxSizing: "border-box",
        }}
      >
        <h1
          style={{
            ...TEXTO_DORADO_BRILLO,
            fontSize: "20px",
            fontWeight: "900",
            marginBottom: "20px",
            textAlign: "center",
            textTransform: "uppercase",
          }}
        >
          {tecnico ? tecnico.nombre : "Detalle de Técnico"}
        </h1>

        {mensaje && (
          <div
            style={{
              marginBottom: "16px",
              padding: "12px 16px",
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              color: "#ef4444",
              borderRadius: "12px",
              fontWeight: "700",
              textAlign: "center",
              fontSize: "13px",
            }}
          >
            {mensaje}
          </div>
        )}

        {tecnico && (
          <>
            {/* Datos del técnico */}
            <div
              style={{
                background: FONDO_TARJETA,
                padding: "20px",
                borderRadius: "16px",
                border: BORDE_DORADO_FINO,
                boxShadow: SOMBRA_LUXURY,
                marginBottom: "20px",
                fontSize: "13px",
                lineHeight: "1.6",
                boxSizing: "border-box",
              }}
            >
              <p style={{ marginBottom: "8px" }}>
                <strong style={{ color: COLOR_DORADO }}>Teléfono:</strong>{" "}
                {tecnico.telefono || "Sin teléfono"}
              </p>
              <p style={{ marginBottom: "8px" }}>
                <strong style={{ color: COLOR_DORADO }}>Email:</strong>{" "}
                {tecnico.email || "Sin email"}
              </p>
              <p style={{ marginBottom: "8px" }}>
                <strong style={{ color: COLOR_DORADO }}>Especialidad:</strong>{" "}
                {tecnico.especialidad || "General"}
              </p>
              <p style={{ marginBottom: "8px" }}>
                <strong style={{ color: COLOR_DORADO }}>Estado:</strong>{" "}
                <span style={{ color: tecnico.activo ? "#34d399" : "#ef4444", fontWeight: "700" }}>
                  {tecnico.activo ? "● Activo" : "○ Inactivo"}
                </span>
              </p>
              <p style={{ opacity: 0.6, fontSize: "12px", marginTop: "10px", margin: 0 }}>
                Creado el: {tecnico.created_at ? new Date(tecnico.created_at).toLocaleDateString() : "N/A"}
              </p>
            </div>

            {/* Inspecciones separadas por categoría */}
            <Bloque titulo={`Pendientes / Asignadas (${pendientes.length})`}>
              {pendientes.length === 0 ? (
                <p style={{ opacity: 0.7, fontSize: "13px", color: "#aaa", margin: 0 }}>
                  No hay inspecciones pendientes.
                </p>
              ) : (
                pendientes.map((i) => (
                  <Item
                    key={i.id}
                    to={`/inspecciones/${i.id}`}
                    titulo={`${i.vivienda?.direccion || "Vivienda sin dirección"} — ${i.estado}`}
                  />
                ))
              )}
            </Bloque>

            <Bloque titulo={`Completadas por el Técnico (${completadasTecnico.length})`}>
              {completadasTecnico.length === 0 ? (
                <p style={{ opacity: 0.7, fontSize: "13px", color: "#aaa", margin: 0 }}>
                  No hay inspecciones completadas.
                </p>
              ) : (
                completadasTecnico.map((i) => (
                  <Item
                    key={i.id}
                    to={`/inspecciones/${i.id}`}
                    titulo={`${i.vivienda?.direccion || "Vivienda"} — Finalizada`}
                  />
                ))
              )}
            </Bloque>

            <Bloque titulo={`Aceptadas por Admin (${completadasAdmin.length})`}>
              {completadasAdmin.length === 0 ? (
                <p style={{ opacity: 0.7, fontSize: "13px", color: "#aaa", margin: 0 }}>
                  No hay inspecciones aceptadas.
                </p>
              ) : (
                completadasAdmin.map((i) => (
                  <Item
                    key={i.id}
                    to={`/inspecciones/${i.id}`}
                    titulo={`${i.vivienda?.direccion || "Vivienda"} — Aceptada`}
                  />
                ))
              )}
            </Bloque>

            {/* Botones de acción */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "24px" }}>
              <Link
                to={`/tecnicos/editar/${id}`}
                style={{
                  textDecoration: "none",
                  pointerEvents: procesando ? "none" : "auto",
                }}
              >
                <button
                  disabled={procesando}
                  style={{
                    padding: "14px",
                    width: "100%",
                    background: "linear-gradient(135deg, #38bdf8 0%, #1e3a8a 100%)",
                    color: "#fff",
                    borderRadius: "16px",
                    border: BORDE_DORADO_FINO,
                    fontWeight: "900",
                    fontSize: "14px",
                    cursor: procesando ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 15px rgba(56, 189, 248, 0.3)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    boxSizing: "border-box",
                  }}
                >
                  Editar Técnico
                </button>
              </Link>

              <button
                onClick={cambiarEstado}
                disabled={procesando}
                style={{
                  padding: "14px",
                  width: "100%",
                  background: tecnico.activo ? "linear-gradient(135deg, #ef4444 0%, #991b1b 100%)" : "linear-gradient(135deg, #10b981 0%, #047857 100%)",
                  color: "#fff",
                  borderRadius: "16px",
                  border: tecnico.activo ? "1px solid rgba(239, 68, 68, 0.6)" : "1px solid rgba(16, 185, 129, 0.6)",
                  fontWeight: "900",
                  fontSize: "14px",
                  cursor: procesando ? "not-allowed" : "pointer",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  boxSizing: "border-box",
                }}
              >
                {tecnico.activo ? "Desactivar Técnico" : "Activar Técnico"}
              </button>

              <button
                onClick={eliminarTecnico}
                disabled={procesando}
                style={{
                  padding: "14px",
                  width: "100%",
                  background: "linear-gradient(135deg, #ef4444 0%, #991b1b 100%)",
                  color: "#fff",
                  borderRadius: "16px",
                  border: "1px solid rgba(239, 68, 68, 0.6)",
                  fontWeight: "900",
                  fontSize: "14px",
                  cursor: procesando ? "not-allowed" : "pointer",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  boxSizing: "border-box",
                }}
              >
                Eliminar Técnico
              </button>
            </div>
          </>
        )}
      </div>
    </Menu>
  );
}

function Bloque({ titulo, children }) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <h2
        style={{
          fontSize: "14px",
          marginBottom: "10px",
          color: COLOR_DORADO,
          fontWeight: "900",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {titulo}
      </h2>

      <div
        style={{
          background: FONDO_TARJETA,
          padding: "14px",
          borderRadius: "14px",
          border: BORDE_DORADO_FINO,
          boxShadow: SOMBRA_LUXURY,
          boxSizing: "border-box",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function Item({ to, titulo }) {
  return (
    <Link to={to} style={{ textDecoration: "none" }}>
      <div
        style={{
          padding: "12px",
          marginBottom: "8px",
          background: "rgba(11, 19, 32, 0.8)",
          borderRadius: "10px",
          border: BORDE_DORADO_FINO,
          color: "#fff",
          fontSize: "13px",
          fontWeight: "600",
          cursor: "pointer",
        }}
      >
        {titulo}
      </div>
    </Link>
  );
}
