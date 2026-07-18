import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../supabaseClient";
import { useParams, useNavigate } from "react-router-dom";

export default function VerContrato() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [contrato, setContrato] = useState(null);

  useEffect(() => {
    async function cargarContrato() {
      const { data } = await supabase
        .from("contratos")
        .select("*")
        .eq("id", id)
        .single();

      setContrato(data);
    }

    cargarContrato();
  }, [id]);

  async function eliminarContrato() {
    const { error } = await supabase
      .from("contratos")
      .delete()
      .eq("id", id);

    if (!error) {
      alert("Contrato eliminado");
      navigate("/contratos");
    }
  }

  if (!contrato) return <Menu><p>Cargando...</p></Menu>;

  return (
    <Menu>
      <div style={{ padding: "20px", color: "#fff" }}>
        <h1>Contrato #{id}</h1>

        <p><strong>Fecha:</strong> {contrato.fecha}</p>
        <p><strong>Precio:</strong> {contrato.precio}€</p>
        <p><strong>Notas:</strong> {contrato.notas}</p>

        <button onClick={() => navigate(`/contratos/editar/${id}`)}>
          Editar contrato
        </button>

        <button onClick={eliminarContrato} style={{ marginTop: "10px", background: "red" }}>
          Eliminar contrato
        </button>
      </div>
    </Menu>
  );
}
