import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useParams, useNavigate } from "react-router-dom";

export default function FinalizarInspeccion() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [inspeccion, setInspeccion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");

  // 🔥 Cargar inspección completa
  useEffect(() => {
    async function cargarInspeccion() {
      const { data, error } = await supabase
        .from("inspecciones")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setMensaje("Error cargando inspección");
        setLoading(false);
        return;
      }

      setInspeccion(data);
      setLoading(false);
    }

    cargarInspeccion();
  }, [id]);

  // 🔥 Finalizar inspección
  async function finalizar() {
    setMensaje("");

    try {
      await supabase
        .from("inspecciones")
        .update({
          estado: "finalizada",
          fecha_finalizacion: new Date().toISOString(),
        })
        .eq("id", id);

      setMensaje("Inspección finalizada correctamente ✔");

      setTimeout(() => {
        navigate("/panel-tecnico");
      }, 1200);
    } catch (e) {
      setMensaje("Error finalizando inspección");
    }
  }

  if (loading || !inspeccion) {
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
        }}
      >
        <h1
          style={{
            color: "#4db8ff",
            marginBottom: "25px",
            fontSize: "28px",
            fontWeight: "700",
          }}
        >
          Finalizar Inspección
        </h1>

        {mensaje && (
          <p style={{ marginBottom: "15px", color: "#4db8ff", fontWeight: "600" }}>
            {mensaje}
          </p>
        )}

        <p style={{ marginBottom: "10px", fontSize: "18px" }}>
          <strong>Fecha:</strong> {inspeccion.fecha}
        </p>

        <p style={{ marginBottom: "10px", fontSize: "18px" }}>
          <strong>Estado actual:</strong> {inspeccion.estado}
        </p>

        <p style={{ marginBottom: "20px", fontSize: "18px" }}>
          <strong>Checklist:</strong>{" "}
          {inspeccion.checklist_completado ? "Completado ✔" : "Incompleto ✗"}
        </p>

        <p style={{ marginBottom: "20px", fontSize: "18px" }}>
          <strong>Fotos:</strong>{" "}
          {inspeccion.fecha_fotos ? "Completadas ✔" : "Pendientes ✗"}
        </p>

        <p style={{ marginBottom: "20px", fontSize: "18px" }}>
          <strong>Firma:</strong>{" "}
          {inspeccion.firma_cliente ? "Firmada ✔" : "Pendiente ✗"}
        </p>

        <button
          onClick={finalizar}
          style={{
            marginTop: "20px",
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
          Finalizar inspección
        </button>
      </div>
    </Menu>
  );
}
