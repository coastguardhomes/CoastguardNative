import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import supabase from "../../lib/supabase";
import { format } from "date-fns";

export default function VerInspeccion() {
  const { id } = useParams();
  const [inspeccion, setInspeccion] = useState(null);
  const [loading, setLoading] = useState(true);

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
          vivienda (
            id,
            direccion,
            poblacion
          ),
          tecnico (
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
        {format(new Date(inspeccion.fecha), "dd/MM/yyyy")}
      </p>

      <p>
        <strong>Estado:</strong> {inspeccion.estado}
      </p>

      <h3>Vivienda</h3>
      <p>
        {inspeccion.vivienda.direccion}, {inspeccion.vivienda.poblacion}
      </p>

      <h3>Técnico</h3>
      <p>{inspeccion.tecnico.nombre}</p>

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
    </div>
  );
}
