import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function ClienteContratoExito() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Sesión de Stripe recibida:", sessionId);
  }, [sessionId]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0f1a",
        color: "#ffffff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        fontFamily: "Inter, sans-serif",
        textAlign: "center",
      }}
    >
      <div
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          border: "1px solid rgba(255, 215, 0, 0.3)",
          borderRadius: "16px",
          padding: "40px 30px",
          maxWidth: "450px",
          width: "100%",
          boxShadow: "0 0 25px rgba(255, 215, 0, 0.15)",
        }}
      >
        <div style={{ fontSize: "50px", marginBottom: "20px" }}>🎉</div>
        
        <h1 style={{ color: "#e0b034", fontSize: "24px", marginBottom: "15px", fontWeight: "700" }}>
          ¡Pago Realizado con Éxito!
        </h1>
        
        <p style={{ color: "#9ca3af", fontSize: "15px", lineHeight: "1.5", marginBottom: "25px" }}>
          Tu suscripción se ha procesado correctamente a través de Stripe y tu contrato ya está activo.
        </p>

        {sessionId && (
          <p style={{ color: "#4b5563", fontSize: "11px", marginBottom: "25px", wordBreak: "break-all" }}>
            ID: {sessionId}
          </p>
        )}

        <button
          onClick={() => navigate("/cliente/contratos")}
          style={{
            background: "linear-gradient(135deg, #38bdf8 0%, #1e3a8a 100%)",
            color: "#ffffff",
            border: "none",
            borderRadius: "10px",
            padding: "14px 20px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
            width: "100%",
            boxShadow: "0 4px 15px rgba(56, 189, 248, 0.3)",
          }}
        >
          Ir a Mis Contratos
        </button>
      </div>
    </div>
  );
}
