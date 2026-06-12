import { useNavigate } from "react-router-dom";

export default function ClientesHome() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ marginBottom: 20 }}>Clientes</h1>

      <div
        style={{
          background: "#1e293b",
          padding: 16,
          borderRadius: 8,
          color: "white",
          marginBottom: 20,
          border: "1px solid #334155",
        }}
      >
        <p style={{ margin: 0 }}>
          Gestiona tus clientes: crea nuevos, edita información y consulta sus
          datos completos.
        </p>
      </div>

      <button
        onClick={() => navigate("/clientes")}
        style={{
          width: "100%",
          padding: "12px 20px",
          background: "#3b82f6",
          color: "white",
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
          marginBottom: 12,
        }}
      >
        Ver Lista de Clientes
      </button>

      <button
        onClick={() => navigate("/clientes/nuevo")}
        style={{
          width: "100%",
          padding: "12px 20px",
          background: "#22c55e",
          color: "white",
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
        }}
      >
        Nuevo Cliente
      </button>
    </div>
  );
}
