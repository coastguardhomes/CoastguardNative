import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../supabaseClient";

export default function Inspecciones() {
  const navigate = useNavigate();

  const [inspecciones, setInspecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  // ============================
  // CARGAR INSPECCIONES
  // ============================
  const cargarInspecciones = async () => {
    const { data, error } = await supabase
      .from("inspecciones")
      .select("*, clientes(nombre)")
      .order("fecha", { ascending: false });

    if (error) {
      console.error("Error cargando inspecciones:", error);
      alert("Error cargando inspecciones");
      return;
    }

    setInspecciones(data || []);
    setLoading(false);
  };

  useEffect(() => {
    cargarInspecciones();
  }, []);

  // ============================
  // FILTRO DE BÚSQUEDA
  // ============================
  const filtradas = inspecciones.filter((i) => {
    const t = busqueda.toLowerCase();
    return (
      i.id.toString().includes(t) ||
      i.clientes?.nombre?.toLowerCase().includes(t) ||
      i.estado?.toLowerCase().includes(t)
    );
  });

  // ============================
  // COLORES DE ESTADO
  // ============================
  const colorEstado = (estado) => {
    switch (estado) {
      case "pendiente":
        return "#facc15"; // amarillo
      case "en_proceso":
        return "#3b82f6"; // azul
      case "completada":
        return "#22c55e"; // verde
      default:
        return "#94a3b8"; // gris
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 16 }}>
        <h1>Inspecciones</h1>
        <p>Cargando lista...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ marginBottom: 16 }}>Inspecciones</h1>

      {/* Buscador */}
      <input
        type="text"
        placeholder="Buscar inspección..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        style={{
          width: "100%",
          padding: 12,
          marginBottom: 20,
          borderRadius: 8,
          border: "1px solid #334155",
          background: "#1e293b",
          color: "white",
        }}
      />

      {/* Botón Nueva Inspección */}
      <button
        onClick={() => navigate("/inspecciones/nueva")}
        style={{
          width: "100%",
          padding: "12px 20px",
          background: "#2563eb",
          color: "white",
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
          marginBottom: 20,
        }}
      >
        + Nueva Inspección
      </button>

      {/* Lista */}
      {filtradas.length === 0 ? (
        <p style={{ color: "#94a3b8" }}>No hay inspecciones que coincidan.</p>
      ) : (
        filtradas.map((insp) => (
          <div
            key={insp.id}
            onClick={() => navigate(`/inspecciones/${insp.id}`)}
            style={{
              padding: 16,
              marginBottom: 12,
              borderRadius: 10,
              background: "#1e293b",
              border: "1px solid #334155",
              color: "white",
              cursor: "pointer",
            }}
          >
            <h3 style={{ margin: 0, marginBottom: 6 }}>
              Inspección #{insp.id}
            </h3>

            <p style={{ margin: 0, fontSize: 14, color: "#cbd5e1" }}>
              🧑 Cliente: {insp.clientes?.nombre || "Sin cliente"}
            </p>

            <p style={{ margin: 0, fontSize: 14, color: "#cbd5e1" }}>
              📅 Fecha: {insp.fecha || "Sin fecha"}
            </p>

            <p
              style={{
                margin: 0,
                marginTop: 6,
                fontSize: 14,
                fontWeight: "bold",
                color: colorEstado(insp.estado),
              }}
            >
              ● {insp.estado?.toUpperCase() || "SIN ESTADO"}
            </p>
          </div>
        ))
      )}
    </div>
  );
}
