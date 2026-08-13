import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { Link } from "react-router-dom";

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
          background: "#0a0f1a",
          minHeight: "100vh",
          color: "#fff",
          fontFamily: "Inter, sans-serif",
          paddingBottom: "100px",
        }}
      >
        <h1
          style={{
            fontSize: "26px",
            fontWeight: "700",
            marginBottom: "25px",
            color: "#4db8ff",
            textShadow: "0 0 8px rgba(0,153,255,0.6)",
            textAlign: "center",
          }}
        >
          Gestión de Técnicos
        </h1>

        {mensaje && (
          <div
            style={{
              marginBottom: "15px",
              padding: "10px",
              background: "rgba(255,107,107,0.1)",
              border: "1px solid #ff6b6b",
              color: "#ff6b6b",
              borderRadius: "8px",
              fontWeight: "600",
              textAlign: "center",
              fontSize: "14px",
            }}
          >
            {mensaje}
          </div>
        )}

        <Link to="/tecnicos/crear" style={{ textDecoration: "none" }}>
          <button
            style={{
              marginBottom: "25px",
              padding: "14px",
              width: "100%",
              background: "#4db8ff",
              color: "#000",
              borderRadius: "10px",
              border: "none",
              fontWeight: "700",
              fontSize: "16px",
              cursor: "pointer",
              boxShadow: "0 0 10px rgba(0,153,255,0.4)",
            }}
          >
            + Nuevo Técnico
          </button>
        </Link>

        {loading ? (
          <p style={{ textAlign: "center", color: "#4db8ff", opacity: 0.8 }}>
            Cargando técnicos...
          </p>
        ) : tecnicos.length === 0 ? (
          <p style={{ textAlign: "center", opacity: 0.8 }}>
            No hay técnicos registrados.
          </p>
        ) : (
          <div>
            {tecnicos.map((t) => (
              <div
                key={t.id}
                style={{
                  marginBottom: "15px",
                  background: "rgba(255,255,255,0.05)",
                  padding: "18px",
                  borderRadius: "14px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  boxShadow: "0 0 12px rgba(0,153,255,0.2)",
                }}
              >
                <Link
                  to={`/tecnicos/ver/${t.id}`}
                  style={{
                    color: "#4db8ff",
                    fontWeight: "700",
                    fontSize: "18px",
                    textDecoration: "none",
                  }}
                >
                  {t.nombre}
                </Link>

                <p style={{ marginTop: "8px", fontSize: "14px" }}>
                  <strong>Teléfono:</strong> {t.telefono || "Sin teléfono"}
                </p>

                <p style={{ marginTop: "4px", fontSize: "14px" }}>
                  <strong>Email:</strong> {t.email || "Sin email"}
                </p>

                <p style={{ marginTop: "4px", fontSize: "14px" }}>
                  <strong>Especialidad:</strong>{" "}
                  {t.especialidad || "General"}
                </p>

                <p
                  style={{
                    marginTop: "6px",
                    color: t.activo ? "#4ade80" : "#ff6b6b",
                    fontWeight: "700",
                    fontSize: "14px",
                  }}
                >
                  {t.activo ? "● Activo" : "○ Inactivo"}
                </p>

                <p style={{ marginTop: "4px", opacity: 0.6, fontSize: "12px" }}>
                  Creado el:{" "}
                  {t.created_at
                    ? new Date(t.created_at).toLocaleDateString()
                    : "N/A"}
                </p>

                <div
                  style={{
                    marginTop: "10px",
                    padding: "8px 12px",
                    background: "rgba(0,0,0,0.2)",
                    borderRadius: "8px",
                    fontSize: "13px",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span>
                    <strong>Inspecciones totales:</strong> {t.total_inspecciones}
                  </span>
                  <span>
                    <strong>Pendientes:</strong> {t.pendientes}
                  </span>
                </div>

                <div
                  style={{
                    marginTop: "15px",
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
                        background: "#1e90ff",
                        borderRadius: "8px",
                        border: "none",
                        color: "#fff",
                        fontWeight: "700",
                        cursor: procesando ? "not-allowed" : "pointer",
                        width: "100%",
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
                      background: t.activo ? "#ff6b6b" : "#4ade80",
                      borderRadius: "8px",
                      border: "none",
                      color: t.activo ? "#fff" : "#000",
                      fontWeight: "700",
                      cursor: procesando ? "not-allowed" : "pointer",
                      width: "100%",
                    }}
                  >
                    {t.activo ? "Desactivar" : "Activar"}
                  </button>

                  <button
                    onClick={() => borrarTecnico(t.id)}
                    disabled={procesando}
                    style={{
                      padding: "10px",
                      background: "#ef4444",
                      borderRadius: "8px",
                      border: "none",
                      color: "#fff",
                      fontWeight: "700",
                      cursor: procesando ? "not-allowed" : "pointer",
                      gridColumn: "span 2",
                      width: "100%",
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
