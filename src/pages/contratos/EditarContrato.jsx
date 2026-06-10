import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LayoutWithMenu from "../../layouts/LayoutWithMenu.jsx";
import { supabase } from "../../lib/supabase";

export default function EditarContrato() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [contrato, setContrato] = useState({
    fecha: "",
    notas: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarContrato = async () => {
      const { data, error } = await supabase
        .from("contratos")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error cargando contrato:", error);
        setLoading(false);
        return;
      }

      setContrato({
        fecha: data.fecha || "",
        notas: data.notas || "",
      });

      setLoading(false);
    };

    cargarContrato();
  }, [id]);

  const actualizarContrato = async () => {
    const { error } = await supabase
      .from("contratos")
      .update({
        fecha: contrato.fecha,
        notas: contrato.notas,
      })
      .eq("id", id);

    if (error) {
      console.error("Error actualizando contrato:", error);
      alert("Error al actualizar el contrato");
      return;
    }

    navigate(`/contratos/${id}`);
  };

  if (loading) {
    return (
      <LayoutWithMenu>
        <div style={{ padding: 16 }}>
          <p>Cargando contrato...</p>
        </div>
      </LayoutWithMenu>
    );
  }

  return (
    <LayoutWithMenu>
      <div style={{ padding: 16 }}>
        <h1 style={{ marginBottom: 16 }}>Editar Contrato</h1>

        <label>Fecha</label>
        <input
          type="date"
          value={contrato.fecha}
          onChange={(e) =>
            setContrato({ ...contrato, fecha: e.target.value })
          }
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 12,
            borderRadius: 6,
            border: "1px solid #334155",
            background: "#1e293b",
            color: "white",
          }}
        />

        <label>Notas</label>
        <textarea
          value={contrato.notas}
          onChange={(e) =>
            setContrato({ ...contrato, notas: e.target.value })
          }
          rows={4}
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 12,
            borderRadius: 6,
            border: "1px solid #334155",
            background: "#1e293b",
            color: "white",
          }}
        />

        <button
          onClick={actualizarContrato}
          style={{
            marginTop: 20,
            padding: "12px 20px",
            background: "#2563eb",
            color: "white",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            width: "100%",
          }}
        >
          Guardar Cambios
        </button>

        <button
          onClick={() => navigate(`/contratos/${id}`)}
          style={{
            marginTop: 12,
            padding: "12px 20px",
            background: "#475569",
            color: "white",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            width: "100%",
          }}
        >
          Cancelar
        </button>
      </div>
    </LayoutWithMenu>
  );
}
