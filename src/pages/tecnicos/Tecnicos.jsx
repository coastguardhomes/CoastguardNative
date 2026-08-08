import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { Link, useNavigate } from "react-router-dom";

export default function Tecnicos() {
  const [tecnicos, setTecnicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    cargarTecnicos();
  }, []);

  async function cargarTecnicos() {
    const { data, error } = await supabase
      .from("tecnicos")
      .select("id, nombre, telefono, email, especialidad, activo, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      setMensaje("Error cargando técnicos");
      setLoading(false);
      return;
    }

    setTecnicos(data || []);
    setLoading(false);
  }

  async function borrarTecnico(id) {
    const confirmar = window.confirm(
      "¿Seguro que quieres borrar este técnico? Esta acción no se puede deshacer."
    );
    if (!confirmar) return;

    await supabase.from("tecnicos").delete().eq("id", id);
    cargarTecnicos();
  }

  async function cambiarEstado(id, estadoActual) {
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
              color: "#4db8ff",
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
          <p style={{ opacity: 0.8 }}>Cargando...</p>
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
                {/* Nombre */}
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

                {/* Teléfono */}
                <p style={{ marginTop: "6px" }}>
                  <strong>Teléfono:</strong> {t.telefono || "Sin teléfono"}
                </p>

                {/* Email */}
                <p style={{ marginTop: "6px" }}>
                  <strong>Email:</strong> {t.email || "Sin email"}
                </p>

                {/* Especialidad */}
                <p style={{ marginTop: "6px" }}>
                  <strong>Especialidad:</strong>{" "}
                  {t.especialidad || "Sin especialidad"}
                </p>

                {/* Estado */}
                <p
                  style={{
                    marginTop: "6px",
                    color: t.activo ? "#4ade80" : "#ff6b6b",
                    fontWeight: "700",
                  }}
                >
                  {t.activo ? "Activo" : "Inactivo"}
                </p>

                {/* Fecha creación */}
                <p style={{ marginTop: "6px", opacity: 0.7 }}>
                  Creado el: {new Date(t.created_at).toLocaleDateString()}
                </p>

                {/* Botones */}
                <div
                  style={{
                    marginTop: "15px",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                    gap: "10px",
                  }}
                >
                  {/* Ver técnico */}
                  <Link to={`/tecnicos/ver/${t.id}`}>
                    <button
                      style={{
                        padding: "10px",
                        background: "#1e90ff",
                        borderRadius: "10px",
                        border: "none",
                        color: "#fff",
                        fontWeight: "700",
                        cursor: "pointer",
                        width: "100%",
                      }}
                    >
                      Ver técnico
                    </button>
                  </Link>

                  {/* Ver inspecciones */}
                  <Link to={`/tecnicos/ver/${t.id}#inspecciones`}>
                    <button
                      style={{
                        padding: "10px",
                        background: "#4db8ff",
                        borderRadius: "10px",
                        border: "none",
                        color: "#000",
                        fontWeight: "700",
                        cursor: "pointer",
                        width: "100%",
                      }}
                    >
                      Inspecciones
                    </button>
                  </Link>

                  {/* Activar / desactivar */}
                  <button
                    onClick={() => cambiarEstado(t.id, t.activo)}
                    style={{
                      padding: "10px",
                      background: t.activo ? "#ff6b6b" : "#4ade80",
                      borderRadius: "10px",
                      border: "none",
                      color: "#fff",
                      fontWeight: "700",
                      cursor: "pointer",
                      width: "100%",
                    }}
                  >
                    {t.activo ? "Desactivar" : "Activar"}
                  </button>

                  {/* Borrar */}
                  <button
                    onClick={() => borrarTecnico(t.id)}
                    style={{
                      padding: "10px",
                      background: "red",
                      borderRadius: "10px",
                      border: "none",
                      color: "#fff",
                      fontWeight: "700",
                      cursor: "pointer",
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
