import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LayoutWithMenu from "../../layouts/LayoutWithMenu.jsx";
import { supabase } from "../../lib/supabase";

export default function VerContrato() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [contrato, setContrato] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarContrato = async () => {
      const { data, error } = await supabase
        .from("contratos")
        .select("id, fecha, notas, clientes(nombre)")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error cargando contrato:", error);
        setLoading(false);
        return;
      }

      setContrato(data);
      setLoading(false);
    };

    cargarContrato();
  }, [id]);

  if (loading) {
    return (
      <LayoutWithMenu>
        <div style={{ padding: 16 }}>
          <p>Cargando contrato...</p>
        </div>
      </LayoutWithMenu>
    );
  }

  if (!contrato) {
    return (
      <LayoutWithMenu>
        <div style={{ padding: 16 }}>
          <p>No se encontró el contrato.</p>
        </div>
      </LayoutWithMenu>
    );
  }

  return (
    <LayoutWithMenu>
      <div style={{ padding: 16 }}>
        <h1 style={{ marginBottom: 16 }}>Contrato #{contrato.id}</h1>

        <div
          style={{
            background: "#1e293b",
            padding: 16,
            borderRadius: 8,
            border: "1px solid #334155",
            color: "white",
            marginBottom: 20,
          }}
        >
          <p>
            <strong>Cliente:</strong>{" "}
            {contrato.clientes?.nombre || "Cliente desconocido"}
          </p>

          <p>
            <strong>Fecha:</strong>{" "}
            {contrato.fecha
              ? new Date(contrato.fecha).toLocaleDateString()
              : "Sin fecha"}
          </p>

          <p>
            <strong>Notas:</strong> {contrato.notas || "Sin notas"}
          </p>
        </div>

        <button
          onClick={() => navigate(`/contratos/${id}/editar`)}
          style={{
            padding: "12px 20px",
            background: "#2563eb",
            color: "white",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            width: "100%",
            marginBottom: 12,
          }}
        >
          Editar contrato
        </button>

        <button
          onClick={() => navigate("/contratos")}
          style={{
            padding: "12px 20px",
            background: "#475569",
            color: "white",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            width: "100%",
          }}
        >
          Volver
        </button>
      </div>
    </LayoutWithMenu>
  );
}
