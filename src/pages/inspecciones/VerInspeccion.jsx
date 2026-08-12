import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import Menu from "../../layouts/Menu";

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
      const { data, error } = await supabase
        .from("inspecciones")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Error en Supabase al buscar inspección:", error);
      } else {
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
      <Menu>
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
      </Menu>
    );
  }

  if (!inspeccion) {
    return (
      <Menu>
        <div style={{ background: "#0a0f1a", minHeight: "100vh", color: "#fff", padding: "20px" }}>
          <h2>No se encontró la inspección con ID: {id}</h2>
          <Link to="/inspecciones" style={{ color: "#4db8ff" }}>Volver</Link>
        </div>
      </Menu>
    );
  }

  return (
    <Menu>
      <div style={{ padding: "20px", background: "#0a0f1a", minHeight: "100vh", color: "#fff" }}>
        <h1 style={{ color: "#4db8ff", marginBottom: "15px" }}>Inspección #{inspeccion.id}</h1>

        <p style={{ marginTop: "15px", opacity: 0.9 }}>
          <strong>Fecha:</strong> {formatearFecha(inspeccion.fecha)}
        </p>

        <p style={{ opacity: 0.9 }}>
          <strong>Estado:</strong> {inspeccion.estado || "Pendiente"}
        </p>

        <h3 style={{ marginTop: "20px", color: "#ffd700" }}>Notas</h3>
        <p style={{ opacity: 0.8, marginBottom: "20px" }}>{inspeccion.notas || "Sin notas"}</p>

        <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", marginTop: "20px" }}>
          <Link
            to={`/inspecciones/checklist/${id}`}
            style={{ color: "#4db8ff", fontWeight: "bold", textDecoration: "none" }}
          >
            📋 Ir al Checklist
          </Link>

          <Link
            to={`/inspecciones/fotos/${id}`}
            style={{ color: "#4db8ff", fontWeight: "bold", textDecoration: "none" }}
          >
            🖼️ Ver Galería de Fotos
          </Link>

          <Link
            to={`/inspecciones/pdf/${id}`}
            style={{ color: "#4db8ff", fontWeight: "bold", textDecoration: "none" }}
          >
            📄 Ver PDF
          </Link>
        </div>

        <button
          onClick={eliminarInspeccion}
          style={{
            marginTop: "30px",
            padding: "14px",
            width: "100%",
            background: "#e74c3c",
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

        <button
          onClick={() => navigate("/inspecciones")}
          style={{
            marginTop: "12px",
            padding: "14px",
            width: "100%",
            background: "transparent",
            color: "#4db8ff",
            borderRadius: "10px",
            border: "1px solid #4db8ff",
            fontWeight: "700",
            fontSize: "15px",
            cursor: "pointer",
          }}
        >
          ← Volver al listado
        </button>
      </div>
    </Menu>
  );
}
