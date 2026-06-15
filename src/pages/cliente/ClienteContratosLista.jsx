import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import supabase from "../../supabaseClient";

export default function ClienteContratosLista() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contratos, setContratos] = useState([]);

  useEffect(() => {
    const cargar = async () => {
      const { data, error } = await supabase
        .from("contratos")
        .select("*")
        .eq("cliente_id", id);

      if (error) {
        console.error(error);
        return;
      }

      setContratos(data);
    };

    cargar();
  }, [id]);

  return (
    <div style={{ padding: 20 }}>
      <h2>Contratos del cliente</h2>

      {contratos.map((c) => (
        <div
          key={c.id}
          style={{
            padding: 15,
            border: "1px solid #ccc",
            borderRadius: 8,
            marginBottom: 10,
          }}
        >
          <p><strong>ID:</strong> {c.id}</p>
          <p><strong>Estado:</strong> {c.estado}</p>

          <button
            onClick={() => navigate(`/cliente/contrato/${c.id}`)}
            style={{
              background: "#007bff",
              color: "white",
              padding: "8px 15px",
              borderRadius: 8,
            }}
          >
            Ver contrato
          </button>
        </div>
      ))}
    </div>
  );
}
