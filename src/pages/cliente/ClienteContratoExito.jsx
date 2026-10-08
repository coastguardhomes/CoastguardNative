import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function ClienteContratoExito() {
  const [searchParams] = useSearchParams();
  const contractId = searchParams.get("contractId") || searchParams.get("contract_id");
  const result = searchParams.get("result");
  const activated = searchParams.get("activated");
  const navigate = useNavigate();

  const [mensajeEstado, setMensajeEstado] = useState(
    "Comprobando el estado de tu contrato..."
  );
  const [errorDetalle, setErrorDetalle] = useState(null);
  const [comprobado, setComprobado] = useState(false);

  useEffect(() => {
    let cancelado = false;

    const comprobarContrato = async () => {
      if (!contractId || !/^\d+$/.test(contractId)) {
        if (!cancelado) {
          setErrorDetalle("No se encontró un ID de contrato válido.");
          setMensajeEstado(
            "No se pudo comprobar el estado del contrato."
          );
          setComprobado(true);
        }
        return;
      }

      try {
        const { data, error } = await supabase
          .from("contratos")
          .select("id, estado, pagado")
          .eq("id", Number(contractId))
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (cancelado) return;

        if (!data) {
          setErrorDetalle(
            "No se encontró el contrato o no tienes permiso para consultarlo."
          );
          setMensajeEstado(
            "No se pudo comprobar el estado del contrato."
          );
          setComprobado(true);
          return;
        }

        if (data.estado === "activo") {
          setErrorDetalle(null);
          setMensajeEstado(
            "¡Tu contrato ya se encuentra activo y la suscripción está en marcha!"
          );
        } else if (result === "success" && activated === "pending") {
          setErrorDetalle(null);
          setMensajeEstado(
            "El pago está siendo confirmado por Stripe. El contrato se activará automáticamente cuando la confirmación final esté disponible."
          );
        } else if (result === "cancelled") {
          setErrorDetalle(null);
          setMensajeEstado(
            "El proceso de pago fue cancelado. Tu contrato no ha sido activado."
          );
        } else {
          setErrorDetalle(
            "El contrato todavía no figura como activo."
          );
          setMensajeEstado(
            "El pago ha vuelto a la aplicación, pero el contrato todavía no aparece activado. Vuelve a intentarlo en unos instantes."
          );
        }

        setComprobado(true);
      } catch (err) {
        if (cancelado) return;

        console.error("Error comprobando contrato:", err);

        setErrorDetalle(
          err?.message || "No se pudo comprobar el contrato."
        );
        setMensajeEstado(
          "No se pudo comprobar el estado del contrato."
        );
        setComprobado(true);
      }
    };

    comprobarContrato();

    return () => {
      cancelado = true;
    };
  }, [contractId, result, activated]);

  const titulo =
    errorDetalle && comprobado
      ? "Aviso en la confirmación"
      : result === "cancelled"
        ? "Pago cancelado"
        : "¡Pago y suscripción!";

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
        <div
          style={{
            fontSize: "50px",
            marginBottom: "20px",
          }}
        >
          {errorDetalle ? "⚠️" : result === "cancelled" ? "↩️" : "🎉"}
        </div>

        <h1
          style={{
            color: "#e0b034",
            fontSize: "24px",
            marginBottom: "15px",
            fontWeight: "700",
          }}
        >
          {titulo}
        </h1>

        <p
          style={{
            color: errorDetalle ? "#ff6b6b" : "#9ca3af",
            fontSize: "15px",
            lineHeight: "1.5",
            marginBottom: "25px",
          }}
        >
          {mensajeEstado}
        </p>

        {errorDetalle && (
          <div
            style={{
              background: "rgba(255,0,0,0.1)",
              border: "1px solid red",
              padding: "10px",
              borderRadius: "8px",
              fontSize: "12px",
              color: "#ff8080",
              marginBottom: "20px",
              textAlign: "left",
              wordBreak: "break-word",
            }}
          >
            <strong>Detalle:</strong> {errorDetalle}
          </div>
        )}

        <button
          onClick={() => {
            if (contractId && /^\d+$/.test(contractId)) {
              navigate(`/cliente/contrato/${contractId}`);
            } else {
              navigate("/cliente/contratos");
            }
          }}
          style={{
            background:
              "linear-gradient(135deg, #38bdf8 0%, #1e3a8a 100%)",
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
          {result === "cancelled"
            ? "Volver a mi contrato"
            : "Ver mi contrato"}
        </button>
      </div>
    </div>
  );
}
