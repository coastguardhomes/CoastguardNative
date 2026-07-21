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
          Cargando inspección...
        </div>
      </Menu>
    );
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
            color: "#4db8ff",
            marginBottom: "25px",
            fontSize: "28px",
            fontWeight: "700",
            textShadow: "0 0 8px rgba(0,153,255,0.6)",
            textAlign: "center",
          }}
        >
          Inspección #{inspeccion.id}
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

        {/* Tarjeta de datos */}
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
          <p style={{ marginBottom: "10px" }}>
            <strong style={{ color: "#4db8ff" }}>Vivienda:</strong>{" "}
            {inspeccion.vivienda_id}
          </p>

          <p style={{ marginBottom: "10px" }}>
            <strong style={{ color: "#4db8ff" }}>Técnico:</strong>{" "}
            {inspeccion.tecnico_id}
          </p>

          <p style={{ marginBottom: "10px" }}>
            <strong style={{ color: "#4db8ff" }}>Fecha:</strong>{" "}
            {inspeccion.fecha}
          </p>

          <p style={{ marginBottom: "10px" }}>
            <strong style={{ color: "#4db8ff" }}>Estado:</strong>{" "}
            {inspeccion.estado}
          </p>

          <p style={{ marginBottom: "10px" }}>
            <strong style={{ color: "#4db8ff" }}>Notas:</strong>{" "}
            {inspeccion.notas}
          </p>
        </div>

        <h2
          style={{
            marginBottom: "15px",
            color: "#4db8ff",
            fontSize: "24px",
            fontWeight: "700",
          }}
        >
          Acciones
        </h2>

        {/* Botones táctiles */}
        <Link to={`/inspecciones/checklist/${id}`}>
          <button
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
              cursor: "pointer",
              boxShadow: "0 0 10px rgba(0,153,255,0.4)",
            }}
          >
            Checklist
          </button>
        </Link>

        <Link to={`/inspecciones/fotos/${id}`}>
          <button
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
              cursor: "pointer",
              boxShadow: "0 0 10px rgba(0,153,255,0.4)",
            }}
          >
            Fotos
          </button>
        </Link>

        <Link to={`/inspecciones/firma/${id}`}>
          <button
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
              cursor: "pointer",
              boxShadow: "0 0 10px rgba(0,153,255,0.4)",
            }}
          >
            Firma
          </button>
        </Link>

        <Link to={`/inspecciones/pdf/${id}`}>
          <button
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
              cursor: "pointer",
              boxShadow: "0 0 10px rgba(0,153,255,0.4)",
            }}
          >
            Ver PDF
          </button>
        </Link>

        <Link to={`/inspecciones/detalle/${id}`}>
          <button
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
              cursor: "pointer",
              boxShadow: "0 0 10px rgba(0,153,255,0.4)",
            }}
          >
            Detalle completo
          </button>
        </Link>

        <Link to={`/inspecciones/editar/${id}`}>
          <button
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
              cursor: "pointer",
              boxShadow: "0 0 10px rgba(0,153,255,0.4)",
            }}
          >
            Editar inspección
          </button>
        </Link>

        <button
          onClick={eliminar}
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
            boxShadow: "0 0 10px rgba(255,0,0,0.4)",
          }}
        >
          Eliminar inspección
        </button>
      </div>
    </Menu>
  );
}
