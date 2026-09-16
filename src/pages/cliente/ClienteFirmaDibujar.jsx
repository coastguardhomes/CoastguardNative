import React, { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function ClienteFirmaDibujar({ contratoId: propContratoId, onFirmaGuardada }) {
  const { id: routeContratoId } = useParams();
  const contratoId = propContratoId || routeContratoId;
  const navigate = useNavigate();
  const { t } = useLanguage();

  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [hayFirma, setHayFirma] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = 220;
    }
  }, []);

  const obtenerCoordenadas = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const iniciarTrazo = (e) => {
    setIsDrawing(true);
    setHayFirma(true);
    const { x, y } = obtenerCoordenadas(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const dibujar = (e) => {
    if (!isDrawing) return;

    const { x, y } = obtenerCoordenadas(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const detenerTrazo = () => setIsDrawing(false);

  const limpiarLienzo = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHayFirma(false);
  };

  const guardarFirma = async () => {
    if (!hayFirma) {
      alert(t("alertaRealizarFirma") || "Debes realizar una firma antes de guardar.");
      return;
    }

    if (!contratoId || contratoId === "undefined") {
      alert(t("alertaIdContratoValido") || "ID de contrato no válido.");
      return;
    }

    setGuardando(true);

    try {
      const canvas = canvasRef.current;
      const firmaBase64 = canvas.toDataURL("image/png");
      const numericId = Number(contratoId);

      // 1. Guardar vía Edge Function (Modo Principal - Bypass RLS)
      const { data: funcData, error: funcError } = await supabase.functions.invoke("guardar-firma", {
        body: { 
          contratoId: numericId, 
          contrato_id: numericId, 
          firmaBase64 
        },
      });

      // 2. Intento de respaldo directo en la base de datos
      const { error: dbError } = await supabase
        .from("contratos")
        .update({
          estado: "firmado",
          firma_cliente: firmaBase64,
          firma_url: firmaBase64,
          fecha_firma: new Date().toISOString()
        })
        .eq("id", numericId);

      // Si ambas vías fallan por completo, mostrar el detalle real del error
      if (funcError && dbError) {
        console.error("Error Edge Function:", funcError);
        console.error("Error DB:", dbError);
        alert("Error guardando firma: " + (funcError?.message || dbError?.message));
        setGuardando(false);
        return;
      }

      alert(t("contratoFirmadoExito") || "¡Contrato firmado con éxito!");

      if (onFirmaGuardada) {
        onFirmaGuardada(firmaBase64);
      } else {
        navigate(-1);
      }
    } catch (err) {
      console.error("Excepción al guardar la firma:", err);
      alert("Error: " + (err.message || "Error desconocido"));
    } finally {
      setGuardando(false);
    }
  };

  const contenido = (
    <div style={{ background: "#0a0f1a", minHeight: "100vh", padding: "20px", color: "#fff" }}>
      <h2 style={{ textAlign: "center", color: "#4db8ff", marginBottom: "20px" }}>
        {t("firmaDelClienteTitulo") || "Firma del Cliente"}
      </h2>

      <div style={{ background: "rgba(255,255,255,0.05)", padding: "18px", borderRadius: "14px", maxWidth: "500px", margin: "0 auto" }}>
        <p style={{ color: "#9fb3c8", fontSize: "14px", marginBottom: "12px", textAlign: "center" }}>
          {t("instruccionesFirma") || "Dibuje su firma con el dedo dentro del recuadro blanco:"}
        </p>

        <div style={{ background: "#ffffff", borderRadius: "10px", overflow: "hidden", touchAction: "none" }}>
          <canvas
            ref={canvasRef}
            onMouseDown={iniciarTrazo}
            onMouseMove={dibujar}
            onMouseUp={detenerTrazo}
            onMouseLeave={detenerTrazo}
            onTouchStart={iniciarTrazo}
            onTouchMove={dibujar}
            onTouchEnd={detenerTrazo}
            style={{ display: "block", width: "100%", cursor: "crosshair", touchAction: "none" }}
          />
        </div>

        <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
          <button
            onClick={limpiarLienzo}
            disabled={guardando}
            style={{ flex: 1, background: "transparent", border: "1px solid #ff4d4d", color: "#ff4d4d", padding: "12px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}
          >
            {t("limpiar") || "Limpiar"}
          </button>

          <button
            onClick={guardarFirma}
            disabled={guardando || !hayFirma}
            style={{ flex: 2, background: guardando || !hayFirma ? "rgba(77, 184, 255, 0.4)" : "#4db8ff", color: "#0a0f1a", border: "none", padding: "12px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}
          >
            {guardando ? (t("guardando") || "Guardando...") : (t("guardarFirmaBtn") || "Guardar Firma")}
          </button>
        </div>
      </div>
    </div>
  );

  return propContratoId ? contenido : <Menu>{contenido}</Menu>;
}
