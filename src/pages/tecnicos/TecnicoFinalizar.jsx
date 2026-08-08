import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useParams, Link, useNavigate } from "react-router-dom";
import Menu from "../../layouts/Menu";

export default function TecnicoFinalizar() {
  const { id } = useParams(); // ID de la inspección
  const navigate = useNavigate();

  const [inspeccion, setInspeccion] = useState(null);
  const [notas, setNotas] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarInspeccion();
  }, [id]);

  async function cargarInspeccion() {
    const { data, error } = await supabase
      .from("inspecciones")
      .select("id, fecha, estado, notas_tecnico")
      .eq("id", id)
      .single();

    if (error) {
      setMensaje("Error cargando inspección");
      return;
    }

    setInspeccion(data);
    setNotas(data.notas_tecnico || "");
  }

  async function finalizarInspeccion() {
    if (!notas.trim()) {
      setMensaje("Debes añadir notas antes de finalizar.");
      return;
    }

    setGuardando(true);

    const { error } = await supabase
      .from("inspecciones")
      .update({
        notas_tecnico: notas,
        estado: "completada_tecnico",
      })
      .eq("id", id);

    if (error) {
      setMensaje("Error guardando la inspección");
      setGuardando(false);
      return;
    }

    setGuardando(false);

    // Volver al dashboard del técnico
    navigate("/tecnico");
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
          Finalizar inspección
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
            <strong style={{ color: "#4db8ff" }}>Estado actual:</strong>{" "}
            {inspeccion.estado}
          </p>
        </div>

        {/* Notas del técnico */}
        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          placeholder="Escribe aquí las notas de la inspección..."
          style={{
            width: "100%",
            height: "150px",
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.05)",
            color: "#fff",
            fontSize: "16px",
            marginBottom: "20px",
          }}
        />

        <button
          onClick={finalizarInspeccion}
          disabled={guardando}
          style={{
            padding: "14px",
            width: "100%",
            background: "#4ade80",
            color: "#000",
            borderRadius: "10px",
            border: "none",
            fontWeight: "700",
            fontSize: "17px",
            cursor: "pointer",
            marginBottom: "20px",
          }}
        >
          {guardando ? "Guardando..." : "Finalizar inspección"}
        </button>

        {/* Navegación */}
        <Link to={`/tecnico/inspeccion/${id}/checklist`}>
          <button
            style={{
              padding: "14px",
              width: "100%",
              background: "#4db8ff",
              color: "#000",
              borderRadius: "10px",
              border: "none",
              fontWeight: "700",
              fontSize: "17px",
              cursor: "pointer",
              marginBottom: "15px",
            }}
          >
            Checklist
          </button>
        </Link>

        <Link to={`/tecnico/inspeccion/${id}/fotos`}>
          <button
            style={{
              padding: "14px",
              width: "100%",
              background: "#1e90ff",
              color: "#fff",
              borderRadius: "10px",
              border: "none",
              fontWeight: "700",
              fontSize: "17px",
              cursor: "pointer",
              marginBottom: "15px",
            }}
          >
            Fotos
          </button>
        </Link>

        <Link to={`/tecnico/inspeccion/${id}`}>
          <button
            style={{
              padding: "14px",
              width: "100%",
              background: "#ffcc00",
              color: "#000",
              borderRadius: "10px",
              border: "none",
              fontWeight: "700",
              fontSize: "17px",
              cursor: "pointer",
            }}
          >
            Volver a inspección
          </button>
        </Link>
      </div>
    </Menu>
  );
}
