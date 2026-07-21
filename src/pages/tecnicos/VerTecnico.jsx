import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../supabaseClient";
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
        <div style={{ padding: "20px", color: "#fff" }}>
          <p>Cargando técnico...</p>
        </div>
      </Menu>
    );
  }

  return (
    <Menu>
      <div style={{ padding: "20px", color: "#fff" }}>
        <h1 style={{ color: "#4db8ff" }}>{tecnico.nombre}</h1>

        {mensaje && (
          <p style={{ marginBottom: "15px", color: "#4db8ff" }}>{mensaje}</p>
        )}

        <p><strong>Teléfono:</strong> {tecnico.telefono}</p>
        <p><strong>Email:</strong> {tecnico.email}</p>
        <p><strong>Especialidad:</strong> {tecnico.especialidad}</p>

        <Link to={`/tecnicos/editar/${id}`}>
          <button
            style={{
              marginTop: "15px",
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
            Editar técnico
          </button>
        </Link>

        <button
          onClick={eliminarTecnico}
          style={{
            marginTop: "15px",
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
          Eliminar técnico
        </button>
      </div>
    </Menu>
  );
}
