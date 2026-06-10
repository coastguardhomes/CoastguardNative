import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LayoutWithMenu from "../../layouts/LayoutWithMenu.jsx";
import { supabase } from "../../lib/supabase";

export default function ContratosHome() {
  const navigate = useNavigate();
  const [contratos, setContratos] = useState([]);

  useEffect(() => {
    const cargarContratos = async () => {
      const { data, error } = await supabase
        .from("contratos")
        .select("id, fecha, clientes(nombre)")
        .order("id", { ascending: false });

      if (error) {
        console.error("Error cargando contratos:", error);
        return;
      }

      setContratos(data);
    };

    cargarContratos();
  }, []);

  return (
    <LayoutWithMenu>
      <div style={{ padding: 16 }}>
        <h1 style={{ marginBottom: 16 }}>Contratos</h1>

        {contratos.length === 0 && (
          <p style={{ color: "#94a3b8" }}>No hay contratos registrados.</p>
        )}

        <div style={{ marginTop: 10 }}>
          {contratos.map((c) => (
            <div
              key={c.id}
              onClick={() => navigate(`/contratos/${c.id}`)}
              style={{
                background: "#1e293b",
                padding: 16,
                borderRadius: 8,
                border: "1px solid #334155",
                marginBottom: 12,
                cursor: "pointer",
                color: "white",
              }}
            >
              <h2 style={{ margin: 0, fontSize: 18 }}>
                {c.clientes?.nombre || "Cliente desconocido"}
              </h2>

              <p style={{ margin: "6px 0 0 0", color: "#cbd5e1" }}>
                Fecha:{" "}
                {c.fecha
                  ? new Date(c.fecha).toLocaleDateString()
                  : "Sin fecha"}
              </p>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate("/contratos/nuevo")}
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
          Nuevo contrato
        </button>
      </div>
    </LayoutWithMenu>
  );
}O

