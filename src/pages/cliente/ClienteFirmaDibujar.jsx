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
      let firmaUrlFinal = firmaBase64;

      // 1. Intentar subir imagen al Storage
      try {
        const fileName = `firma_${contratoId}_${Date.now()}.png`;
        const res = await fetch(firmaBase64);
        const blob = await res.blob();

        const { data: storageData, error: storageError } = await supabase.storage
          .from("firmas")
          .upload(fileName, blob, { contentType: "image/png", upsert: true });

        if (!storageError && storageData) {
          const { data: urlData } = supabase.storage
            .from("firmas")
            .getPublicUrl(fileName);
          if (urlData?.publicUrl) {
            firmaUrlFinal = urlData.publicUrl;
          }
        }
      } catch (sErr) {
        console.warn("Storage ignorado, guardando directamente en la tabla:", sErr);
      }

      // 2. CONVERSIÓN A NÚMERO Y ACTUALIZACIÓN EN BASE DE DATOS
      const numericId = Number(contratoId);

      const { data: updateResult, error: dbError } = await supabase
        .from("contratos")
        .update({
          estado: "firmado",
          firma_cliente: firmaUrlFinal,
          firma_url: firmaUrlFinal,
          fecha_firma: new Date().toISOString()
        })
        .eq("id", numericId)
        .select();

      if (dbError || !updateResult || updateResult.length === 0) {
        console.error("Error en update:", dbError);
        alert("Error al guardar la firma en la base de datos. Comprueba la conexión.");
        setGuardando(false);
        return;
      }

      // 3. Notificar a la Edge Function
      try {
        await supabase.functions.invoke("guardar-firma", {
          body: { contratoId: numericId, firmaBase64: firmaUrlFinal },
        });
      } catch (fErr) {
        console.log("Edge function procesada.");
      }

      alert(t("contratoFirmadoExito") || "¡Contrato firmado con éxito!");

      if (onFirmaGuardada) {
        onFirmaGuardada(firmaUrlFinal);
      } else {
        navigate(-1);
      }
    } catch (err) {
      console.error("Error al guardar la firma:", err);
      alert((t("errorGuardandoFirmaDetalle") || "Error: ") + (err.message || "Error desconocido"));
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
