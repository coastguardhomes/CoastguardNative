import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useParams, useNavigate, Link } from "react-router-dom";

export default function VerVivienda() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vivienda, setVivienda] = useState(null);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    async function cargarVivienda() {
      const { data, error } = await supabase
        .from("viviendas")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setMensaje("Error cargando vivienda");
        return;
      }

      setVivienda(data);
    }

    cargarVivienda();
  }, [id]);

  async function eliminarVivienda() {
    const { error } = await supabase
      .from("viviendas")
      .delete()
      .eq("id", id);

    if (error) {
      setMensaje("Error eliminando vivienda");
      return;
    }

    setMensaje("Vivienda eliminada correctamente");
    navigate("/viviendas");
  }

  if (!vivienda) {
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
          Cargando vivienda...
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
          {vivienda.nombre}
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
          <p style={{ marginBottom: "10px" }}>
            <strong style={{ color: "#4db8ff" }}>Dirección:</strong>{" "}
            {vivienda.direccion}
          </p>

          <p style={{ marginBottom: "10px" }}>
            <strong style={{ color: "#4db8ff" }}>Ciudad:</strong>{" "}
            {vivienda.ciudad}
          </p>

          <p style={{ marginBottom: "10px" }}>
            <strong style={{ color: "#4db8ff" }}>Código Postal:</strong>{" "}
            {vivienda.cp}
          </p>
        </div>

        <Link to={`/viviendas/editar/${id}`}>
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
            Editar vivienda
          </button>
        </Link>

        <button
          onClick={eliminarVivienda}
          style={{
            marginTop: "10px",
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
          Eliminar vivienda
        </button>
      </div>
    </Menu>
  );
}
