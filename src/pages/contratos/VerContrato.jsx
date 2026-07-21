import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../supabaseClient";
import { useParams, useNavigate } from "react-router-dom";

export default function VerContrato() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [contrato, setContrato] = useState(null);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    async function cargarContrato() {
      const { data, error } = await supabase
        .from("contratos")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setMensaje("Error cargando contrato");
        return;
      }

      setContrato(data);
    }

    cargarContrato();
  }, [id]);

  async function eliminarContrato() {
    const { error } = await supabase
      .from("contratos")
      .delete()
      .eq("id", id);

    if (error) {
      setMensaje("Error eliminando contrato");
      return;
    }

    setMensaje("Contrato eliminado correctamente");
    navigate("/contratos");
  }

  if (!contrato)
    return (
      <Menu>
        <div style={{ padding: "20px", color: "#fff" }}>
          <p>Cargando...</p>
        </div>
      </Menu>
    );

  return (
    <Menu>
      <div style={{ padding: "20px", color: "#fff" }}>
        <h1 style={{ color: "#4db8ff" }}>Contrato #{id}</h1>

        {mensaje && (
          <p style={{ marginBottom: "15px", color: "#4db8ff" }}>{mensaje}</p>
        )}

        <p><strong>Fecha:</strong> {contrato.fecha}</p>
        <p><strong>Precio:</strong> {contrato.precio}€</p>
        <p><strong>Notas:</strong> {contrato.notas}</p>

        <button
          onClick={() => navigate(`/contratos/editar/${id}`)}
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
          Editar contrato
        </button>

        <button
          onClick={eliminarContrato}
          style={{
            marginTop: "10px",
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
          Eliminar contrato
        </button>
      </div>
    </Menu>
  );
}
