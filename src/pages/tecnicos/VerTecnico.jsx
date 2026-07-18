import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../supabaseClient";
import { useParams, useNavigate, Link } from "react-router-dom";

export default function VerTecnico() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tecnico, setTecnico] = useState(null);

  useEffect(() => {
    async function cargarTecnico() {
      const { data, error } = await supabase
        .from("tecnicos")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        alert("Error cargando técnico");
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
      alert("Error eliminando técnico");
      return;
    }

    alert("Técnico eliminado correctamente");
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

        <p><strong>Teléfono:</strong> {tecnico.telefono}</p>
        <p><strong>Email:</strong> {tecnico.email}</p>
        <p><strong>Especialidad:</strong> {tecnico.especialidad}</p>

        <Link to={`/tecnicos/editar/${id}`}>
          <button style={{ marginTop: "15px" }}>Editar técnico</button>
        </Link>

        <button
          onClick={eliminarTecnico}
          style={{
            marginTop: "15px",
            background: "red",
            color: "#fff",
            padding: "10px",
            borderRadius: "6px",
            border: "none",
          }}
        >
          Eliminar técnico
        </button>
      </div>
    </Menu>
  );
}
