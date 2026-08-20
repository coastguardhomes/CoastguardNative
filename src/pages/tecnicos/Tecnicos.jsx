import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { Link } from "react-router-dom";

const COLOR_DORADO = "#e0b034";
const FONDO_PRINCIPAL = "#030509";
const FONDO_TARJETA = "linear-gradient(145deg, #0b1320 0%, #04070d 100%)";
const BORDE_DORADO_FINO = "1px solid rgba(224, 176, 52, 0.4)";
const SOMBRA_LUXURY = "0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 20px rgba(224, 176, 52, 0.12)";
const TEXTO_DORADO_BRILLO = { color: COLOR_DORADO, textShadow: "0 0 12px rgba(224, 176, 52, 0.6)" };

export default function Tecnicos() {
  const [tecnicos, setTecnicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    cargarTecnicos();
  }, []);

  async function cargarTecnicos() {
    setLoading(true);
    setMensaje("");

    try {
      // 1️⃣ Cargar técnicos
      const { data: dataTecnicos, error: tecError } = await supabase
        .from("tecnicos")
        .select("id, nombre, telefono, email, especialidad, activo, created_at")
        .order("nombre", { ascending: true });

      if (tecError) {
        setMensaje("Error cargando técnicos: " + tecError.message);
        setLoading(false);
        return;
      }

      // 2️⃣ Cargar inspecciones asociadas
      const { data: dataInspecciones, error: inspError } = await supabase
        .from("inspecciones")
        .select("id, tecnico_id, estado");

      if (inspError) {
        console.error("Error al cargar inspecciones:", inspError);
      }

      const inspecciones = dataInspecciones || [];

      // 3️⃣ Mapear con validación segura de ID
      const tecnicosConDatos = (dataTecnicos || []).map((t) => {
        const insp = inspecciones.filter(
          (i) => String(i.tecnico_id) === String(t.id)
        );
        const pendientes = insp.filter(
          (i) => i.estado === "pendiente" || i.estado === "asignada"
        ).length;

        return {
          ...t,
          total_inspecciones: insp.length,
          pendientes,
        };
      });

      setTecnicos(tecnicosConDatos);
    } catch (err) {
      console.error("Error inesperado:", err);
      setMensaje("Error al procesar la lista de técnicos.");
    } finally {
      setLoading(false);
    }
  }

  async function borrarTecnico(id) {
    const confirmar = window.confirm(
      "¿Seguro que quieres borrar este técnico? Si tiene inspecciones asignadas, quedarán desvinculadas y pendientes de reasignar."
    );
    if (!confirmar) return;

    setProcesando(true);
    setMensaje("");

    try {
      // 1️⃣ Desvincular inspecciones primero (tecnico_id = null) para evitar restricción FK
      const { error: updateError } = await supabase
        .from("inspecciones")
        .update({ tecnico_id: null, estado: "pendiente_reasignar" })
        .eq("tecnico_id", String(id));

      if (updateError) {
        setMensaje("Error al desvincular inspecciones: " + updateError.message);
        setProcesando(false);
        return;
      }

      // 2️⃣ Borrar técnico
      const { error: deleteError } = await supabase
        .from("tecnicos")
        .delete()
        .eq("id", String(id));

      if (deleteError) {
        setMensaje("Error al eliminar el técnico: " + deleteError.message);
      } else {
        setMensaje("Técnico eliminado con éxito.");
        await cargarTecnicos();
      }
    } catch (err) {
      console.error("Error en borrado:", err);
      setMensaje("Error en la operación de borrado.");
    } finally {
      setProcesando(false);
    }
  }

  async function cambiarEstado(id, estadoActual) {
    setProcesando(true);
    setMensaje("");

    try {
      const nuevoEstado = !estadoActual;

      const { error: tecError } = await supabase
        .from("tecnicos")
        .update({ activo: nuevoEstado })
        .eq("id", String(id));

      if (tecError) {
        setMensaje("Error al actualizar estado del técnico: " + tecError.message);
        setProcesando(false);
        return;
      }

      // Si se desactiva → desvincular sus inspecciones pendientes
      if (estadoActual === true) {
        await supabase
          .from("inspecciones")
          .update({ tecnico_id: null, estado: "pendiente_reasignar" })
          .eq("tecnico_id", String(id))
          .eq("estado", "pendiente");
      }

      await cargarTecnicos();
    } catch (err) {
      console.error("Error cambiando estado:", err);
      setMensaje("Error al actualizar el estado.");
    } finally {
      setProcesando(false);
    }
  }

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
          Gestión de Técnicos
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

        <Link to="/tecnicos/crear" style={{ textDecoration: "none" }}>
          <button
            style={{
              marginBottom: "20px",
              padding: "14px",
              width: "100%",
              background: "linear-gradient(135deg, #38bdf8 0%, #1e3a8a 100%)",
              color: "#fff",
              borderRadius: "16px",
              border: BORDE_DORADO_FINO,
              fontWeight: "900",
              fontSize: "14px",
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(56, 189, 248, 0.3)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            + Nuevo Técnico
          </button>
        </Link>

        {loading ? (
          <p style={{ textAlign: "center", color: COLOR_DORADO, fontWeight: "700", fontSize: "14px" }}>
            Cargando técnicos...
          </p>
        ) : tecnicos.length === 0 ? (
          <p style={{ textAlign: "center", opacity: 0.8, fontSize: "13px", color: "#aaa" }}>
            No hay técnicos registrados.
          </p>
        ) : (
          <div>
            {tecnicos.map((t) => (
              <div
                key={t.id}
                style={{
                  marginBottom: "16px",
                  background: FONDO_TARJETA,
                  padding: "16px",
                  borderRadius: "16px",
                  border: BORDE_DORADO_FINO,
                  boxShadow: SOMBRA_LUXURY,
                  fontSize: "13px",
                }}
              >
                <Link
                  to={`/tecnicos/ver/${t.id}`}
                  style={{
                    color: COLOR_DORADO,
                    fontWeight: "900",
                    fontSize: "16px",
                    textDecoration: "none",
                  }}
                >
                  {t.nombre}
                </Link>

                <p style={{ marginTop: "10px", marginBottom: "6px" }}>
                  <strong style={{ color: COLOR_DORADO }}>Teléfono:</strong> {t.telefono || "Sin teléfono"}
                </p>

                <p style={{ marginBottom: "6px" }}>
                  <strong style={{ color: COLOR_DORADO }}>Email:</strong> {t.email || "Sin email"}
                </p>

                <p style={{ marginBottom: "6px" }}>
                  <strong style={{ color: COLOR_DORADO }}>Especialidad:</strong>{" "}
                  {t.especialidad || "General"}
                </p>

                <p
                  style={{
                    marginBottom: "8px",
                    color: t.activo ? "#34d399" : "#ef4444",
                    fontWeight: "700",
                  }}
                >
                  {t.activo ? "● Activo" : "○ Inactivo"}
                </p>

                <p style={{ marginBottom: "10px", opacity: 0.6, fontSize: "12px" }}>
                  Creado el:{" "}
                  {t.created_at
                    ? new Date(t.created_at).toLocaleDateString()
                    : "N/A"}
                </p>

                <div
                  style={{
                    marginTop: "10px",
                    padding: "10px 12px",
                    background: "rgba(11, 19, 32, 0.9)",
                    border: BORDE_DORADO_FINO,
                    borderRadius: "10px",
                    fontSize: "12px",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span>
                    <strong style={{ color: COLOR_DORADO }}>Inspecciones totales:</strong> {t.total_inspecciones}
                  </span>
                  <span>
                    <strong style={{ color: COLOR_DORADO }}>Pendientes:</strong> {t.pendientes}
                  </span>
                </div>

                <div
                  style={{
                    marginTop: "14px",
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "10px",
                  }}
                >
                  <Link
                    to={`/tecnicos/ver/${t.id}`}
                    style={{ textDecoration: "none" }}
                  >
                    <button
                      disabled={procesando}
                      style={{
                        padding: "10px",
                        background: "linear-gradient(135deg, #38bdf8 0%, #1e3a8a 100%)",
                        borderRadius: "10px",
                        border: BORDE_DORADO_FINO,
                        color: "#fff",
                        fontWeight: "900",
                        cursor: procesando ? "not-allowed" : "pointer",
                        width: "100%",
                        fontSize: "12px",
                        textTransform: "uppercase",
                      }}
                    >
                      Ver perfil
                    </button>
                  </Link>

                  <button
                    onClick={() => cambiarEstado(t.id, t.activo)}
                    disabled={procesando}
                    style={{
                      padding: "10px",
                      background: t.activo ? "linear-gradient(135deg, #ef4444 0%, #991b1b 100%)" : "linear-gradient(135deg, #10b981 0%, #047857 100%)",
                      borderRadius: "10px",
                      border: t.activo ? "1px solid rgba(239, 68, 68, 0.6)" : "1px solid rgba(16, 185, 129, 0.6)",
                      color: "#fff",
                      fontWeight: "900",
                      cursor: procesando ? "not-allowed" : "pointer",
                      width: "100%",
                      fontSize: "12px",
                      textTransform: "uppercase",
                    }}
                  >
                    {t.activo ? "Desactivar" : "Activar"}
                  </button>

                  <button
                    onClick={() => borrarTecnico(t.id)}
                    disabled={procesando}
                    style={{
                      padding: "10px",
                      background: "linear-gradient(135deg, #ef4444 0%, #991b1b 100%)",
                      borderRadius: "10px",
                      border: "1px solid rgba(239, 68, 68, 0.6)",
                      color: "#fff",
                      fontWeight: "900",
                      cursor: procesando ? "not-allowed" : "pointer",
                      gridColumn: "span 2",
                      width: "100%",
                      fontSize: "12px",
                      textTransform: "uppercase",
                    }}
                  >
                    Borrar Técnico
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Menu>
  );
}
