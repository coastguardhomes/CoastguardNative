import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../supabaseClient";
import { useParams, useNavigate, Link } from "react-router-dom";

export default function VerVivienda() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vivienda, setVivienda] = useState(null);

  useEffect(() => {
    async function cargarVivienda() {
      const { data, error } = await supabase
        .from("viviendas")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        alert("Error cargando vivienda");
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
      alert("Error eliminando vivienda");
      return;
    }

    alert("Vivienda eliminada");
    navigate("/viviendas");
  }

  if (!vivienda) {
    return (
      <Menu>
        <div style={{ padding: "20px", color: "#fff" }}>
          <p>Cargando vivienda...</p>
        </div>
      </Menu>
    );
  }

  return (
    <Menu>
      <div style={{ padding: "20px", color: "#fff" }}>
        <h1 style={{ color: "#4db8ff" }}>{vivienda.nombre}</h1>

        <p><strong>Dirección:</strong> {vivienda.direccion}</p>
        <p><strong>Ciudad:</strong> {vivienda.ciudad}</p>
        <p><strong>Código Postal:</strong> {vivienda.cp}</p>

        <Link to={`/viviendas/editar/${id}`}>
          <button style={{ marginTop: "15px" }}>Editar vivienda</button>
        </Link>

        <button
          onClick={eliminarVivienda}
          style={{
            marginTop: "15px",
            background: "red",
            color: "#fff",
            padding: "10px",
            borderRadius: "6px",
            border: "none",
          }}
        >
          Eliminar vivienda
        </button>
      </div>
    </Menu>
  );
}
