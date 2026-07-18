import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../supabaseClient";
import { useParams, Link, useNavigate } from "react-router-dom";

export default function VerInspeccion() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [inspeccion, setInspeccion] = useState(null);

  useEffect(() => {
    async function cargar() {
      const { data, error } = await supabase
        .from("inspecciones")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        alert("Error cargando inspección");
        return;
      }

      setInspeccion(data);
    }

    cargar();
  }, [id]);

  async function eliminar() {
    const { error } = await supabase
      .from("inspecciones")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Error eliminando inspección");
      return;
    }

    alert("Inspección eliminada");
    navigate("/inspecciones");
  }

  if (!inspeccion) {
    return (
      <Menu>
        <div style={{ padding: 20, color: "#fff" }}>Cargando inspección...</div>
      </Menu>
    );
  }

  return (
    <Menu>
      <div style={{ padding: 20, color: "#fff" }}>
        <h1 style={{ color: "#4db8ff" }}>Inspección #{inspeccion.id}</h1>

        <p><strong>Vivienda:</strong> {inspeccion.vivienda_id}</p>
        <p><strong>Técnico:</strong> {inspeccion.tecnico_id}</p>
        <p><strong>Fecha:</strong> {inspeccion.fecha}</p>
        <p><strong>Estado:</strong> {inspeccion.estado}</p>
        <p><strong>Notas:</strong> {inspeccion.notas}</p>

        <h2 style={{ marginTop: 20, color: "#4db8ff" }}>Acciones</h2>

        <Link to={`/inspecciones/checklist/${id}`}>
          <button style={{ marginTop: 10 }}>Checklist</button>
        </Link>

        <Link to={`/inspecciones/fotos/${id}`}>
          <button style={{ marginTop: 10 }}>Fotos</button>
        </Link>

        <Link to={`/inspecciones/firma/${id}`}>
          <button style={{ marginTop: 10 }}>Firma</button>
        </Link>

        <Link to={`/inspecciones/pdf/${id}`}>
          <button style={{ marginTop: 10 }}>Ver PDF</button>
        </Link>

        <Link to={`/inspecciones/detalle/${id}`}>
          <button style={{ marginTop: 10 }}>Detalle completo</button>
        </Link>

        <Link to={`/inspecciones/editar/${id}`}>
          <button style={{ marginTop: 10 }}>Editar inspección</button>
        </Link>

        <button
          onClick={eliminar}
          style={{
            marginTop: 20,
            background: "red",
            color: "#fff",
            padding: "10px",
            borderRadius: "6px",
            border: "none",
          }}
        >
          Eliminar inspección
        </button>
      </div>
    </Menu>
  );
}
