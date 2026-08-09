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
    cargarTecnico();
  }, [id]);

  useEffect(() => {
    if (tecnico) cargarInspecciones();
  }, [tecnico]);

  async function cargarTecnico() {
    setLoading(true);

    const { data, error } = await supabase
      .from("tecnicos")
      .select("id, nombre, telefono, email, especialidad, activo, created_at")
      .eq("id", id)
      .single();

    if (error || !data) {
      setMensaje("Error cargando técnico");
      setLoading(false);
      return;
    }

    setTecnico(data);
    setLoading(false);
  }

  async function cargarInspecciones() {
    const { data } = await supabase
      .from("inspecciones")
      .select(`
        id,
        fecha,
        estado,
        vivienda_id,
        cliente_id,
        created_at
      `)
      .eq("tecnico_id", id)
      .order("fecha", { ascending: false });

    // Cargar vivienda y cliente
    const inspeccionesConDatos = await Promise.all(
      (data || []).map(async (i) => {
        const { data: viv } = await supabase
          .from("viviendas")
          .select("direccion, ciudad")
          .eq("id", i.vivienda_id)
          .single();

        const { data: cli } = await supabase
          .from("clientes")
          .select("nombre, telefono")
          .eq("id", i.cliente_id)
          .single();

        return {
          ...i,
          vivienda: viv || null,
          cliente: cli || null,
        };
      })
    );

    setInspecciones(inspeccionesConDatos);
  }

  // ⭐ ELIMINAR TÉCNICO SIN BORRAR INSPECCIONES
  async function eliminarTecnico() {
    const confirmar = window.confirm(
      "¿Seguro que deseas eliminar este técnico? Sus inspecciones quedarán pendientes de reasignar."
    );
    if (!confirmar) return;

    setProcesando(true);

    // 1. Reasignar inspecciones
    await supabase
      .from("inspecciones")
      .update({ estado: "pendiente_reasignar" })
      .eq("tecnico_id", id);

    // 2. Borrar técnico
    const { error } = await supabase
      .from("tecnicos")
      .delete()
      .eq("id", id);

    setProcesando(false);

    if (error) {
      setMensaje("Error eliminando técnico");
      return;
    }

    alert("Técnico eliminado correctamente");
    navigate("/tecnicos");
  }

  async function cambiarEstado() {
    setProcesando(true);

    const nuevoEstado = !tecnico.activo;

    await supabase
      .from("tecnicos")
      .update({ activo: nuevoEstado })
      .eq("id", id);

    if (!nuevoEstado) {
      await supabase
        .from("inspecciones")
        .update({ estado: "pendiente_reasignar" })
        .eq("tecnico_id", id)
        .eq("estado", "pendiente");
    }

    setProcesando(false);
    cargarTecnico();
  }

  if (loading) {
    return (
      <Menu>
        <div
          style={{
            height: "100vh",
            background: "#0a0f1a",
            color: "#fff",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontFamily: "Inter, sans-serif",
            fontSize: "18px",
          }}
        >
          Cargando técnico...
        </div>
      </Menu>
    );
  }

  const pendientes = inspecciones.filter((i) => i.estado === "pendiente");
  const completadasTecnico = inspecciones.filter(
    (i) => i.estado === "completada_tecnico"
  );
  const completadasAdmin = inspecciones.filter(
    (i) => i.estado === "completada_admin"
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
        }}
      >
        <h1
          style={{
            color: "#4db8ff",
            marginBottom: "25px",
            fontSize: "28px",
            fontWeight: "700",
            textShadow: "0 0 8px rgba(0,153,255,0.6)",
            textAlign: "center",
          }}
        >
          {tecnico.nombre}
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

        {/* Datos del técnico */}
        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            padding: "20px",
            borderRadius: "14px",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 0 12px rgba(0,153,255,0.2)",
            marginBottom: "25px",
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
            {tecnico.especialidad || "Sin especialidad"}
          </p>
          <p>
            <strong style={{ color: "#4db8ff" }}>Estado:</strong>{" "}
            {tecnico.activo ? "Activo" : "Inactivo"}
          </p>
          <p style={{ opacity: 0.7 }}>
            Creado el: {new Date(tecnico.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* Inspecciones */}
        <Bloque titulo="Inspecciones asignadas">
          {inspecciones.length === 0 ? (
            <p style={{ opacity: 0.7 }}>Este técnico no tiene inspecciones.</p>
          ) : (
            inspecciones.map((i) => (
              <Item
                key={i.id}
                to={`/inspecciones/${i.id}`}
                titulo={`${i.vivienda?.direccion || "Vivienda"} — ${i.estado}`}
              />
            ))
          )}
        </Bloque>

        <Bloque titulo="Pendientes">
          {pendientes.length === 0 ? (
            <p style={{ opacity: 0.7 }}>No hay inspecciones pendientes.</p>
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

        <Bloque titulo="Completadas por el técnico">
          {completadasTecnico.length === 0 ? (
            <p style={{ opacity: 0.7 }}>No hay inspecciones completadas.</p>
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

        <Bloque titulo="Aceptadas por el admin">
          {completadasAdmin.length === 0 ? (
            <p style={{ opacity: 0.7 }}>No hay inspecciones aceptadas.</p>
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

        {/* Botones */}
        <Link to={`/tecnicos/editar/${id}`}>
          <button
            disabled={procesando}
            style={{
              marginBottom: "15px",
              padding: "14px",
              width: "100%",
              background: "#4db8ff",
              color: "#000",
              borderRadius: "10px",
              border: "none",
              fontWeight: "700",
              fontSize: "17px",
              cursor: procesando ? "not-allowed" : "pointer",
              boxShadow: "0 0 10px rgba(0,153,255,0.4)",
            }}
          >
            Editar técnico
          </button>
        </Link>

        <button
          onClick={cambiarEstado}
          disabled={procesando}
          style={{
            marginBottom: "15px",
            padding: "14px",
            width: "100%",
            background: tecnico.activo ? "#ff6b6b" : "#4ade80",
            color: "#fff",
            borderRadius: "10px",
            border: "none",
            fontWeight: "700",
            fontSize: "17px",
            cursor: procesando ? "not-allowed" : "pointer",
            boxShadow: "0 0 10px rgba(255,0,0,0.4)",
          }}
        >
          {tecnico.activo ? "Desactivar técnico" : "Activar técnico"}
        </button>

        <button
          onClick={eliminarTecnico}
          disabled={procesando}
          style={{
            marginTop: "10px",
            padding: "14px",
            width: "100%",
            background: "red",
            color: "#fff",
            borderRadius: "10px",
            border: "none",
            fontWeight: "700",
            fontSize: "17px",
            cursor: procesando ? "not-allowed" : "pointer",
            boxShadow: "0 0 10px rgba(255,0,0,0.4)",
          }}
        >
          Eliminar técnico
        </button>
      </div>
    </Menu>
  );
}

function Bloque({ titulo, children }) {
  return (
    <div style={{ marginBottom: "25px" }}>
      <h2
        style={{
          fontSize: "18px",
          marginBottom: "10px",
          color: "#4db8ff",
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
          padding: "10px",
          marginBottom: "8px",
          background: "rgba(255,255,255,0.06)",
          borderRadius: "8px",
          border: "1px solid rgba(255,255,255,0.12)",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        {titulo}
      </div>
    </Link>
  );
}
