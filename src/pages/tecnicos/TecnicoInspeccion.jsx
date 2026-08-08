import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useParams, Link } from "react-router-dom";
import Menu from "../../layouts/Menu";

export default function TecnicoInspeccion() {
  const { id } = useParams(); // ID de la inspección
  const [inspeccion, setInspeccion] = useState(null);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    cargarInspeccion();
  }, [id]);

  async function cargarInspeccion() {
    const { data, error } = await supabase
      .from("inspecciones")
      .select(`
        id,
        fecha,
        estado,
        vivienda_id,
        cliente_id,
        notas_tecnico
      `)
      .eq("id", id)
      .single();

    if (error) {
      setMensaje("Error cargando inspección");
      return;
    }

    setInspeccion(data);
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
            fontSize: "26px",
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
            <strong style={{ color: "#4db8ff" }}>Fecha:</strong>{" "}
            {inspeccion.fecha}
          </p>
          <p>
            <strong style={{ color: "#4db8ff" }}>Estado:</strong>{" "}
            {inspeccion.estado}
          </p>
          <p>
            <strong style={{ color: "#4db8ff" }}>Vivienda ID:</strong>{" "}
            {inspeccion.vivienda_id}
          </p>
          <p>
            <strong style={{ color: "#4db8ff" }}>Cliente ID:</strong>{" "}
            {inspeccion.cliente_id}
          </p>
        </div>

        {/* Botones del técnico */}
        <Link to={`/tecnico/inspeccion/${id}/checklist`}>
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
            }}
          >
            Checklist
          </button>
        </Link>

        <Link to={`/tecnico/inspeccion/${id}/fotos`}>
          <button
            style={{
              marginBottom: "15px",
              padding: "14px",
              width: "100%",
              background: "#1e90ff",
              color: "#fff",
              borderRadius: "10px",
              border: "none",
              fontWeight: "700",
              fontSize: "17px",
              cursor: "pointer",
            }}
          >
            Fotos
          </button>
        </Link>

        <Link to={`/tecnico/inspeccion/${id}/finalizar`}>
          <button
            style={{
              marginBottom: "15px",
              padding: "14px",
              width: "100%",
              background: "#4ade80",
              color: "#000",
              borderRadius: "10px",
              border: "none",
              fontWeight: "700",
              fontSize: "17px",
              cursor: "pointer",
            }}
          >
            Finalizar inspección
          </button>
        </Link>
      </div>
    </Menu>
  );
}
