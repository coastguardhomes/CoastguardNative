import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../../lib/supabase"; // Asegúrate de que esta sea tu ruta correcta

export default function ClienteContratoExito() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const contractId = searchParams.get("contract_id");
  const navigate = useNavigate();
  const [mensajeEstado, setMensajeEstado] = useState("Actualizando el estado de tu contrato...");
  const [errorDetalle, setErrorDetalle] = useState(null);

  useEffect(() => {
    const actualizarContrato = async () => {
      if (!contractId) {
        setMensajeEstado("Error: No se encontró el ID del contrato en el enlace.");
        return;
      }

      try {
        console.log("Intentando actualizar contrato ID:", contractId);

        // Intentamos actualizar el estado a activo
        const { data, error } = await supabase
          .from("contratos")
          .update({ estado: "activo" })
          .eq("id", contractId)
          .select(); // .select() es clave para que devuelva si realmente actualizó algo

        if (error) {
          console.error("Error de Supabase:", error);
          setErrorDetalle(error.message);
          setMensajeEstado("❌ Error al actualizar en la base de datos.");
          alert(`Error de Supabase: ${error.message} (Código: ${error.code})`);
        } else if (!data || data.length === 0) {
          console.warn("No se encontró ninguna fila con ese ID o RLS lo bloqueó.");
          setErrorDetalle("No se encontró el contrato o permisos insuficientes.");
          setMensajeEstado("⚠️ El pago se realizó, pero no se encontró el contrato para actualizarlo.");
          alert("Aviso: El pago se hizo, pero Supabase no encontró el contrato (o las políticas RLS lo impiden).");
        } else {
          console.log("Contrato actualizado con éxito:", data);
          setMensajeEstado("¡Tu contrato ya se encuentra activo y la suscripción está en marcha!");
        }
      } catch (err) {
        console.error("Excepción inesperada:", err);
        setErrorDetalle(err.message);
        setMensajeEstado("❌ Error inesperado al procesar.");
        alert(`Excepción: ${err.message}`);
      }
    };

    actualizarContrato();
  }, [contractId]);

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
        <div style={{ fontSize: "50px", marginBottom: "20px" }}>{errorDetalle ? "⚠️" : "🎉"}</div>
        
        <h1 style={{ color: "#e0b034", fontSize: "24px", marginBottom: "15px", fontWeight: "700" }}>
          {errorDetalle ? "Aviso en la Actualización" : "¡Pago y Suscripción Exitosa!"}
        </h1>
        
        <p style={{ color: errorDetalle ? "#ff6b6b" : "#9ca3af", fontSize: "15px", lineHeight: "1.5", marginBottom: "25px" }}>
          {mensajeEstado}
        </p>

        {errorDetalle && (
          <div style={{ background: "rgba(255,0,0,0.1)", border: "1px solid red", padding: "10px", borderRadius: "8px", fontSize: "12px", color: "#ff8080", marginBottom: "20px", textAlign: "left", wordBreak: "break-all" }}>
            <strong>Detalle técnico:</strong> {errorDetalle}
          </div>
        )}

        <button
          onClick={() => navigate(`/cliente/contrato/${contractId}`)}
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
          Ver mi Contrato
        </button>
      </div>
    </div>
  );
}
