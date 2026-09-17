import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Menu from "../../layouts/Menu";

const COLOR_DORADO = "#e0b034";
const FONDO_PRINCIPAL = "#0a0f1a";
const FONDO_TARJETA = "linear-gradient(145deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))";
const BORDE_DORADO = "1px solid rgba(255, 215, 0, 0.3)";
const TEXTO_DORADO = { color: COLOR_DORADO, textShadow: "0 0 12px rgba(255,215,0,0.5)" };

export default function ClienteContratoExito() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionId) {
      console.log("Pago de suscripción completado con éxito, ID de sesión:", sessionId);
    }
  }, [sessionId]);

  return (
    <Menu>
      <div
        style={{
          minHeight: "100vh",
          background: FONDO_PRINCIPAL,
          padding: "40px 20px",
          color: "#fff",
          fontFamily: "Inter, sans-serif",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <div
          style={{
            background: FONDO_TARJETA,
            padding: "40px 30px",
            borderRadius: "16px",
            border: BORDE_DORADO,
            boxShadow: "0 0 25px rgba(255, 215, 0, 0.2)",
            maxWidth: "500px",
            width: "100%",
          }}
        >
          <div style={{ fontSize: "50px", marginBottom: "15px" }}>🎉</div>
          
          <h2
            style={{
              ...TEXTO_DORADO,
              fontSize: "26px",
              fontWeight: "700",
              marginBottom: "15px",
              marginTop: 0,
            }}
          >
            ¡Suscripción y Pago Exitosos!
          </h2>

          <p style={{ color: "#d1d5db", fontSize: "15px", lineHeight: "1.6", marginBottom: "25px" }}>
            El pago se ha procesado correctamente a través de Stripe. Tu contrato y la suscripción mensual ya se encuentran activos.
          </p>

          {sessionId && (
            <p style={{ color: "#6b7280", fontSize: "11px", marginBottom: "25px", wordBreak: "break-all" }}>
              Ref: {sessionId}
            </p>
          )}

          <button
            onClick={() => navigate("/contratos")} // Ajusta esta ruta si en tu router usas otra distinta para los contratos
            style={{
              padding: "14px 24px",
              width: "100%",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "16px",
              border: BORDE_DORADO,
              background: "linear-gradient(135deg, #38bdf8 0%, #1e3a8a 100%)",
              color: "#ffffff",
              boxShadow: "0 4px 15px rgba(56, 189, 248, 0.3)",
              transition: "all 0.2s ease",
            }}
          >
            Ver Mis Contratos
          </button>
        </div>
      </div>
    </Menu>
  );
}
