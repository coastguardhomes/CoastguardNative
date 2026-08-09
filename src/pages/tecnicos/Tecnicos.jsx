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

    const { data, error } = await supabase
      .from("tecnicos")
      .select("id, nombre, telefono, email, especialidad, activo, created_at");

    if (error) {
      setMensaje("Error cargando técnicos");
      setLoading(false);
      return;
    }

    // Cargar inspecciones por técnico
    const { data: inspecciones } = await supabase
      .from("inspecciones")
      .select("id, tecnico_id, estado");

    // Añadir conteo de inspecciones
    const tecnicosConDatos = data.map((t) => {
      const insp = inspecciones.filter((i) => i.tecnico_id === t.id);
      const pendientes = insp.filter((i) => i.estado === "pendiente").length;

      return {
        ...t,
        total_inspecciones: insp.length,
        pendientes,
      };
    });

    setTecnicos(tecnicosConDatos);
    setLoading(false);
  }

  async function borrarTecnico(id) {
    const confirmar = window.confirm(
      "¿Seguro que quieres borrar este técnico? Si tiene inspecciones asignadas, quedarán sin técnico."
    );
    if (!confirmar) return;

    setProcesando(true);

    // Validar inspecciones asignadas
    const { data: insp } = await supabase
      .from("inspecciones")
      .select("id")
      .eq("tecnico_id", id);

    if (insp.length > 0) {
      await supabase
        .from("inspecciones")
        .update({ estado: "pendiente_reasignar" })
        .eq("tecnico_id", id);
    }

    await supabase.from("tecnicos").delete().eq("id", id);

    setProcesando(false);
    cargarTecnicos();
  }

  async function cambiarEstado(id, estadoActual) {
    setProcesando(true);

    await supabase
      .from("tecnicos")
      .update({ activo: !estadoActual })
      .eq("id", id);

    // Si se desactiva → inspecciones pendientes quedan sin asignar
    if (estadoActual === true) {
      await supabase
        .from("inspecciones")
        .update({ estado: "pendiente_reasignar" })
        .eq("tecnico_id", id)
        .eq("estado", "pendiente");
    }

    setProcesando(false);
    cargarTecnicos();
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
        }}
      >
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "700",
            marginBottom: "25px",
            color: "#4db8ff",
            textShadow: "0 0 8px rgba(0,153,255,0.6)",
            textAlign: "center",
          }}
        >
          Técnicos
        </h1>

        {mensaje && (
          <p
            style={{
              marginBottom: "15px",
              color: "#ff6b6b",
              fontWeight: "600",
            }}
          >
            {mensaje}
          </p>
        )}

        <Link to="/tecnicos/crear">
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
              fontSize: "17px",
              cursor: "pointer",
              boxShadow: "0 0 10px rgba(0,153,255,0.4)",
            }}
          >
            Nuevo técnico
          </button>
        </Link>

        {loading ? (
          <p style={{ opacity: 0.8 }}>Cargando técnicos...</p>
        ) : tecnicos.length === 0 ? (
          <p style={{ opacity: 0.8 }}>No hay técnicos registrados.</p>
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

                <p style={{ marginTop: "6px" }}>
                  <strong>Teléfono:</strong> {t.telefono || "Sin teléfono"}
                </p>

                <p style={{ marginTop: "6px" }}>
                  <strong>Email:</strong> {t.email || "Sin email"}
                </p>

                <p style={{ marginTop: "6px" }}>
                  <strong>Especialidad:</strong>{" "}
                  {t.especialidad || "Sin especialidad"}
                </p>

                <p
                  style={{
                    marginTop: "6px",
                    color: t.activo ? "#4ade80" : "#ff6b6b",
                    fontWeight: "700",
                  }}
                >
                  {t.activo ? "Activo" : "Inactivo"}
                </p>

                <p style={{ marginTop: "6px", opacity: 0.7 }}>
                  Creado el: {new Date(t.created_at).toLocaleDateString()}
                </p>

                <p style={{ marginTop: "6px", opacity: 0.9 }}>
                  <strong>Inspecciones:</strong> {t.total_inspecciones}
                </p>

                <p style={{ marginTop: "6px", opacity: 0.9 }}>
                  <strong>Pendientes:</strong> {t.pendientes}
                </p>

                <div
                  style={{
                    marginTop: "15px",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                    gap: "10px",
                  }}
                >
                  <Link to={`/tecnicos/ver/${t.id}`}>
                    <button
                      disabled={procesando}
                      style={{
                        padding: "10px",
                        background: "#1e90ff",
                        borderRadius: "10px",
                        border: "none",
                        color: "#fff",
                        fontWeight: "700",
                        cursor: procesando ? "not-allowed" : "pointer",
                        width: "100%",
                      }}
                    >
                      Ver técnico
                    </button>
                  </Link>

                  <Link to={`/tecnicos/ver/${t.id}#inspecciones`}>
                    <button
                      disabled={procesando}
                      style={{
                        padding: "10px",
                        background: "#4db8ff",
                        borderRadius: "10px",
                        border: "none",
                        color: "#000",
                        fontWeight: "700",
                        cursor: procesando ? "not-allowed" : "pointer",
                        width: "100%",
                      }}
                    >
                      Inspecciones
                    </button>
                  </Link>

                  <button
                    onClick={() => cambiarEstado(t.id, t.activo)}
                    disabled={procesando}
                    style={{
                      padding: "10px",
                      background: t.activo ? "#ff6b6b" : "#4ade80",
                      borderRadius: "10px",
                      border: "none",
                      color: "#fff",
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
                      background: "red",
                      borderRadius: "10px",
                      border: "none",
                      color: "#fff",
                      fontWeight: "700",
                      cursor: procesando ? "not-allowed" : "pointer",
                      width: "100%",
                    }}
                  >
                    Borrar
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
