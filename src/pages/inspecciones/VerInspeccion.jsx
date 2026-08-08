import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function VerInspeccion() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [inspeccion, setInspeccion] = useState(null);
  const [loading, setLoading] = useState(true);

  // Función para formatear fecha sin date-fns
  function formatearFecha(fechaISO) {
    const fecha = new Date(fechaISO);
    const dia = String(fecha.getDate()).padStart(2, "0");
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const año = fecha.getFullYear();
    return `${dia}/${mes}/${año}`;
  }

  useEffect(() => {
    async function cargarInspeccion() {
      const { data, error } = await supabase
        .from("inspecciones")
        .select(
          `
          id,
          fecha,
          estado,
          notas,
          viviendas (
            id,
            direccion,
            ciudad
          ),
          tecnicos (
            id,
            nombre
          )
        `
        )
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error cargando inspección:", error);
      } else {
        setInspeccion(data);
      }

      setLoading(false);
    }

    cargarInspeccion();
  }, [id]);

  // ⭐ BORRAR INSPECCIÓN COMPLETA
  async function eliminarInspeccion() {
    const confirmar = window.confirm("¿Seguro que deseas eliminar esta inspección?");
    if (!confirmar) return;

    // 1. Borrar checklist asociado
    await supabase
      .from("checklist_inspeccion")
      .delete()
      .eq("inspeccion_id", id);

    // 2. Borrar fotos asociadas (si existe tabla)
    await supabase
      .from("fotos_inspeccion")
      .delete()
      .eq("inspeccion_id", id);

    // 3. Borrar inspección
    const { error } = await supabase
      .from("inspecciones")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Error eliminando inspección");
      return;
    }

    alert("Inspección eliminada correctamente");
    navigate("/inspecciones");
  }

  if (loading) {
    return (
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
        Cargando inspección…
      </div>
    );
  }

  if (!inspeccion) {
    return (
      <div className="p-4">
        <h2>No se encontró la inspección</h2>
        <Link to="/inspecciones">Volver</Link>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1>Inspección #{inspeccion.id}</h1>

      <p>
        <strong>Fecha:</strong>{" "}
        {formatearFecha(inspeccion.fecha)}
      </p>

      <p>
        <strong>Estado:</strong> {inspeccion.estado}
      </p>

      <h3>Vivienda</h3>
      <p>
        {inspeccion.viviendas?.direccion || "Sin dirección"},{" "}
        {inspeccion.viviendas?.ciudad || "Sin localidad"}
      </p>

      <h3>Técnico</h3>
      <p>{inspeccion.tecnicos?.nombre || "Sin técnico asignado"}</p>

      <h3>Notas</h3>
      <p>{inspeccion.notas || "Sin notas"}</p>

      <div style={{ marginTop: "20px" }}>
        <Link
          to={`/inspecciones/${id}/checklist`}
          className="btn btn-primary"
        >
          Ver Checklist
        </Link>

        <Link
          to={`/inspecciones/firma/${id}`}
          className="btn btn-secondary"
          style={{ marginLeft: "10px" }}
        >
          Firmar
        </Link>

        <Link
          to={`/inspecciones/pdf/${id}`}
          className="btn btn-success"
          style={{ marginLeft: "10px" }}
        >
          Ver PDF
        </Link>
      </div>

      {/* ⭐ BOTÓN NUEVO: BORRAR INSPECCIÓN */}
      <button
        onClick={eliminarInspeccion}
        style={{
          marginTop: "20px",
          padding: "14px",
          width: "100%",
          background: "red",
          color: "#fff",
          borderRadius: "10px",
          border: "none",
          fontWeight: "700",
          fontSize: "17px",
          cursor: "pointer",
        }}
      >
        Eliminar inspección
      </button>
    </div>
  );
}
