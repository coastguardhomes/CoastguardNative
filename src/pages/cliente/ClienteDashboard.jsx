import React from "react";
import { useNavigate } from "react-router-dom";

export default function ClienteDashboard() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 20 }}>
      <h2>Panel del Cliente</h2>

      <button
        onClick={() => navigate("/cliente/1/contratos")}
        style={{
          background: "#007bff",
          color: "white",
          padding: "10px 20px",
          borderRadius: 8,
          marginTop: 20,
        }}
      >
        Ver mis contratos
      </button>
    </div>
  );
}
