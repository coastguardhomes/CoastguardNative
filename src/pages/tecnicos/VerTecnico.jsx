import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useParams, useNavigate, Link } from "react-router-dom";

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

      // Si pasa a inactivo, desvinculamos inspecciones pendientes
      if (!nuevoEstado) {
        await supabase
          .from("inspecciones")
          .update({ tecnico_id: null, estado: "pendiente_reasignar" })
          .eq("tecnico_id", String(id))
          .eq("estado", "pendiente");
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
            background: "#0a0f1a",
            color: "#4db8ff",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontFamily: "Inter, sans-serif",
            fontSize: "18px",
            fontWeight: "bold",
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
          background: "#0a0f1a",
          minHeight: "100vh",
          color: "#fff",
          fontFamily: "Inter, sans-serif",
          paddingBottom: "100px",
        }}
      >
        <h1
          style={{
            color: "#4db8ff",
            marginBottom: "25px",
            fontSize: "26px",
            fontWeight: "700",
            textShadow: "0 0 8px rgba(0,153,255,0.6)",
            textAlign: "center",
          }}
        >
          {tecnico ? tecnico.nombre : "Detalle de Técnico"}
        </h1>

        {mensaje && (
          <div
            style={{
              marginBottom: "20px",
              padding: "12px",
              background: "rgba(255,107,107,0.1)",
              border: "1px solid #ff6b6b",
              color: "#ff6b6b",
              borderRadius: "8px",
              textAlign: "center",
              fontWeight: "600",
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
                background: "rgba(255,255,255,0.05)",
                padding: "20px",
                borderRadius: "14px",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 0 12px rgba(0,153,255,0.2)",
                marginBottom: "25px",
                fontSize: "15px",
                lineHeight: "1.6",
              }}
            >
              <p>
                <strong style={{ color: "#4db8ff" }}>Teléfono:</strong>{" "}
                {tecnico.telefono || "Sin teléfono"}
              </p>
              <p>
                <strong style={{ color: "#4db8ff" }}>Email:</strong>{" "}
                {tecnico.email || "Sin email"}
              </p>
              <p>
                <strong style={{ color: "#4db8ff" }}>Especialidad:</strong>{" "}
                {tecnico.especialidad || "General"}
              </p>
              <p>
                <strong style={{ color: "#4db8ff" }}>Estado:</strong>{" "}
                <span style={{ color: tecnico.activo ? "#4ade80" : "#ff6b6b", fontWeight: "bold" }}>
                  {tecnico.activo ? "Activo" : "Inactivo"}
                </span>
              </p>
              <p style={{ opacity: 0.6, fontSize: "12px", marginTop: "8px" }}>
                Creado el: {tecnico.created_at ? new Date(tecnico.created_at).toLocaleDateString() : "N/A"}
              </p>
            </div>

            {/* Inspecciones */}
            <Bloque titulo={`Inspecciones Asignadas (${inspecciones.length})`}>
              {inspecciones.length === 0 ? (
                <p style={{ opacity: 0.7, fontSize: "14px" }}>
                  Este técnico no tiene inspecciones asignadas.
                </p>
              ) : (
                inspecciones.map((i) => (
                  <Item
                    key={i.id}
                    to={`/inspecciones/${i.id}`}
                    titulo={`${i.vivienda?.direccion || "Vivienda sin dirección"} — ${i.estado}`}
                  />
                ))
              )}
            </Bloque>

            <Bloque titulo={`Pendientes (${pendientes.length})`}>
              {pendientes.length === 0 ? (
                <p style={{ opacity: 0.7, fontSize: "14px" }}>
                  No hay inspecciones pendientes.
                </p>
              ) : (
                pendientes.map((i) => (
                  <Item
                    key={i.id}
                    to={`/inspecciones/${i.id}`}
                    titulo={`${i.vivienda?.direccion || "Vivienda"} — Pendiente`}
                  />
                ))
              )}
            </Bloque>

            <Bloque titulo={`Completadas por el Técnico (${completadasTecnico.length})`}>
              {completadasTecnico.length === 0 ? (
                <p style={{ opacity: 0.7, fontSize: "14px" }}>
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
                <p style={{ opacity: 0.7, fontSize: "14px" }}>
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
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "20px" }}>
              <Link to={`/tecnicos/editar/${id}`} style={{ textDecoration: "none" }}>
                <button
                  disabled={procesando}
                  style={{
                    padding: "14px",
                    width: "100%",
                    background: "#4db8ff",
                    color: "#000",
                    borderRadius: "10px",
                    border: "none",
                    fontWeight: "700",
                    fontSize: "16px",
                    cursor: procesando ? "not-allowed" : "pointer",
                    boxShadow: "0 0 10px rgba(0,153,255,0.4)",
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
                  background: tecnico.activo ? "#ff6b6b" : "#4ade80",
                  color: tecnico.activo ? "#fff" : "#000",
                  borderRadius: "10px",
                  border: "none",
                  fontWeight: "700",
                  fontSize: "16px",
                  cursor: procesando ? "not-allowed" : "pointer",
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
                  background: "#ef4444",
                  color: "#fff",
                  borderRadius: "10px",
                  border: "none",
                  fontWeight: "700",
                  fontSize: "16px",
                  cursor: procesando ? "not-allowed" : "pointer",
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
          fontSize: "16px",
          marginBottom: "10px",
          color: "#4db8ff",
          fontWeight: "600",
        }}
      >
        {titulo}
      </h2>

      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          padding: "12px",
          borderRadius: "10px",
          border: "1px solid rgba(255,255,255,0.08)",
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
          background: "rgba(255,255,255,0.06)",
          borderRadius: "8px",
          border: "1px solid rgba(255,255,255,0.12)",
          color: "#fff",
          fontSize: "14px",
          cursor: "pointer",
        }}
      >
        {titulo}
      </div>
    </Link>
  );
}
