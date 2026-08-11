import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function VerInspeccion() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [inspeccion, setInspeccion] = useState(null);
  const [loading, setLoading] = useState(true);

  function formatearFecha(fechaISO) {
    if (!fechaISO) return "Sin fecha";
    const fecha = new Date(fechaISO);
    const dia = String(fecha.getDate()).padStart(2, "0");
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const año = fecha.getFullYear();
    return `${dia}/${mes}/${año}`;
  }

  useEffect(() => {
    async function cargarInspeccion() {
      console.log("Buscando inspección con ID en la ruta:", id);

      // Consulta simplificada para evitar errores de relaciones
      const { data, error } = await supabase
        .from("inspecciones")
        .select("*")
        .eq("id", id)
        .maybeSingle(); // Usamos maybeSingle para evitar excepciones si no encuentra filas

      if (error) {
        console.error("Error en Supabase al buscar inspección:", error);
      } else {
        console.log("Resultado de la búsqueda:", data);
        setInspeccion(data);
      }

      setLoading(false);
    }

    if (id) {
      cargarInspeccion();
    }
  }, [id]);

  async function eliminarInspeccion() {
    const confirmar = window.confirm("¿Seguro que deseas eliminar esta inspección?");
    if (!confirmar) return;

    await supabase.from("checklist_inspeccion").delete().eq("inspeccion_id", id);
    await supabase.from("fotos_inspeccion").delete().eq("inspeccion_id", id);

    const { error } = await supabase.from("inspecciones").delete().eq("id", id);

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
          fontSize: "18px",
        }}
      >
        Cargando inspección…
      </div>
    );
  }

  if (!inspeccion) {
    return (
      <div style={{ background: "#0a0f1a", minHeight: "100vh", color: "#fff", padding: "20px" }}>
        <h2>No se encontró la inspección con ID: {id}</h2>
        <Link to="/inspecciones" style={{ color: "#4db8ff" }}>Volver</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", background: "#0a0f1a", minHeight: "100vh", color: "#fff" }}>
      <h1>Inspección #{inspeccion.id}</h1>

      <p style={{ marginTop: "15px" }}>
        <strong>Fecha:</strong> {formatearFecha(inspeccion.fecha)}
      </p>

      <p>
        <strong>Estado:</strong> {inspeccion.estado || "Pendiente"}
      </p>

      <h3>Notas</h3>
      <p>{inspeccion.notas || "Sin notas"}</p>

      <div style={{ marginTop: "20px" }}>
        <Link
          to={`/inspecciones/${id}/checklist`}
          style={{ color: "#4db8ff", marginRight: "10px" }}
        >
          Ver Checklist
        </Link>

        <Link
          to={`/inspecciones/firma/${id}`}
          style={{ color: "#4db8ff", marginRight: "10px" }}
        >
          Firmar
        </Link>

        <Link
          to={`/inspecciones/pdf/${id}`}
          style={{ color: "#4db8ff" }}
        >
          Ver PDF
        </Link>
      </div>

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
