import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../../supabaseClient"; // Ajusta la ruta de importación si es distinta

export default function ClienteContratoExito() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const contractId = searchParams.get("contract_id");
  const navigate = useNavigate();
  const [actualizando, setActualizando] = useState(true);

  useEffect(() => {
    const actualizarContrato = async () => {
      if (contractId) {
        try {
          // Actualizamos el estado del contrato en Supabase a activo/pagado
          const { error } = await supabase
            .from("contratos")
            .update({ 
              estado: "activo", // Cambia esto según el valor que use tu app para contratos pagados
              pagado: true 
            })
            .eq("id", contractId);

          if (error) {
            console.error("Error al actualizar contrato en BD:", error);
          } else {
            console.log("Contrato actualizado a activo con éxito.");
          }
        } catch (err) {
          console.error("Excepción al actualizar contrato:", err);
        }
      }
      setActualizando(false);
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
        <div style={{ fontSize: "50px", marginBottom: "20px" }}>🎉</div>
        
        <h1 style={{ color: "#e0b034", fontSize: "24px", marginBottom: "15px", fontWeight: "700" }}>
          ¡Pago y Suscripción Exitosa!
        </h1>
        
        <p style={{ color: "#9ca3af", fontSize: "15px", lineHeight: "1.5", marginBottom: "25px" }}>
          {actualizando 
            ? "Actualizando el estado de tu contrato..." 
            : "Tu contrato ya se encuentra activo y la suscripción está en marcha."}
        </p>

        <button
          onClick={() => navigate("/cliente/contratos")}
          disabled={actualizando}
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
            opacity: actualizando ? 0.6 : 1,
          }}
        >
          {actualizando ? "Guardando..." : "Ir a Mis Contratos"}
        </button>
      </div>
    </div>
  );
}
