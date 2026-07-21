import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../supabaseClient";
import { useParams, Link, useNavigate } from "react-router-dom";

export default function VerInspeccion() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [inspeccion, setInspeccion] = useState(null);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    async function cargar() {
      const { data, error } = await supabase
        .from("inspecciones")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setMensaje("Error cargando inspección");
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
      setMensaje("Error eliminando inspección");
      return;
    }

    setMensaje("Inspección eliminada correctamente");
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

        {mensaje && (
          <p style={{ marginBottom: "15px", color: "#4db8ff" }}>{mensaje}</p>
        )}

        <p><strong>Vivienda:</strong> {inspeccion.vivienda_id}</p>
        <p><strong>Técnico:</strong> {inspeccion.tecnico_id}</p>
        <p><strong>Fecha:</strong> {inspeccion.fecha}</p>
        <p><strong>Estado:</strong> {inspeccion.estado}</p>
        <p><strong>Notas:</strong> {inspeccion.notas}</p>

        <h2 style={{ marginTop: 20, color: "#4db8ff" }}>Acciones</h2>

        <Link to={`/inspecciones/checklist/${id}`}>
          <button
            style={{
              marginTop: "10px",
              padding: "12px",
              width: "100%",
              background: "#4db8ff",
              color: "#000",
              borderRadius: "8px",
              border: "none",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Checklist
          </button>
        </Link>

        <Link to={`/inspecciones/fotos/${id}`}>
          <button
            style={{
              marginTop: "10px",
              padding: "12px",
              width: "100%",
              background: "#4db8ff",
              color: "#000",
              borderRadius: "8px",
              border: "none",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Fotos
          </button>
        </Link>

        <Link to={`/inspecciones/firma/${id}`}>
          <button
            style={{
              marginTop: "10px",
              padding: "12px",
              width: "100%",
              background: "#4db8ff",
              color: "#000",
              borderRadius: "8px",
              border: "none",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Firma
          </button>
        </Link>

        <Link to={`/inspecciones/pdf/${id}`}>
          <button
            style={{
              marginTop: "10px",
              padding: "12px",
              width: "100%",
              background: "#4db8ff",
              color: "#000",
              borderRadius: "8px",
              border: "none",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Ver PDF
          </button>
        </Link>

        <Link to={`/inspecciones/detalle/${id}`}>
          <button
            style={{
              marginTop: "10px",
              padding: "12px",
              width: "100%",
              background: "#4db8ff",
              color: "#000",
              borderRadius: "8px",
              border: "none",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Detalle completo
          </button>
        </Link>

        <Link to={`/inspecciones/editar/${id}`}>
          <button
            style={{
              marginTop: "10px",
              padding: "12px",
              width: "100%",
              background: "#4db8ff",
              color: "#000",
              borderRadius: "8px",
              border: "none",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Editar inspección
          </button>
        </Link>

        <button
          onClick={eliminar}
          style={{
            marginTop: "20px",
            padding: "12px",
            width: "100%",
            background: "red",
            color: "#fff",
            borderRadius: "8px",
            border: "none",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          Eliminar inspección
        </button>
      </div>
    </Menu>
  );
}
