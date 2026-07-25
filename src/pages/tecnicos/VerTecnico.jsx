import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useParams, useNavigate, Link } from "react-router-dom";

export default function VerTecnico() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tecnico, setTecnico] = useState(null);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    async function cargarTecnico() {
      const { data, error } = await supabase
        .from("tecnicos")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setMensaje("Error cargando técnico");
        return;
      }

      setTecnico(data);
    }

    cargarTecnico();
  }, [id]);

  async function eliminarTecnico() {
    const { error } = await supabase
      .from("tecnicos")
      .delete()
      .eq("id", id);

    if (error) {
      setMensaje("Error eliminando técnico");
      return;
    }

    setMensaje("Técnico eliminado correctamente");
    navigate("/tecnicos");
  }

  if (!tecnico) {
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
          Cargando técnico...
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
          {tecnico.nombre}
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
            <strong style={{ color: "#4db8ff" }}>Teléfono:</strong>{" "}
            {tecnico.telefono}
          </p>

          <p style={{ marginBottom: "10px" }}>
            <strong style={{ color: "#4db8ff" }}>Email:</strong>{" "}
            {tecnico.email}
          </p>

          <p style={{ marginBottom: "10px" }}>
            <strong style={{ color: "#4db8ff" }}>Especialidad:</strong>{" "}
            {tecnico.especialidad}
          </p>
        </div>

        <Link to={`/tecnicos/editar/${id}`}>
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
            Editar técnico
          </button>
        </Link>

        <button
          onClick={eliminarTecnico}
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
          Eliminar técnico
        </button>
      </div>
    </Menu>
  );
}
