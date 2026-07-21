import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../supabaseClient";
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

        {mensaje && (
          <p style={{ marginBottom: "15px", color: "#4db8ff" }}>{mensaje}</p>
        )}

        <p><strong>Dirección:</strong> {vivienda.direccion}</p>
        <p><strong>Ciudad:</strong> {vivienda.ciudad}</p>
        <p><strong>Código Postal:</strong> {vivienda.cp}</p>

        <Link to={`/viviendas/editar/${id}`}>
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
            Editar vivienda
          </button>
        </Link>

        <button
          onClick={eliminarVivienda}
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
          Eliminar vivienda
        </button>
      </div>
    </Menu>
  );
}
