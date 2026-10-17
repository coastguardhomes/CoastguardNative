import React, { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useLanguage } from "../../context/LanguageContext.jsx";

const VERSION_CONTRATO = "CONTRATO_SERVICIOS_V1_2026-10-11";
const VERSION_CONSENTIMIENTO_INICIO =
  "CONSENTIMIENTO_INICIO_ANTICIPADO_V1_2026-10-18";

export default function ClienteFirmaDibujar({
  contratoId: propContratoId,
  onFirmaGuardada
}) {
  const { id: routeContratoId } = useParams();
  const contratoId = propContratoId || routeContratoId;
  const navigate = useNavigate();
  const { t } = useLanguage();

  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [hayFirma, setHayFirma] = useState(false);
  const [aceptaContrato, setAceptaContrato] = useState(false);
  const [solicitaInicioAnticipado, setSolicitaInicioAnticipado] =
    useState(false);

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

    const clientX = e.touches
      ? e.touches[0].clientX
      : e.clientX;

    const clientY = e.touches
      ? e.touches[0].clientY
      : e.clientY;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
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

  const detenerTrazo = () => {
    setIsDrawing(false);
  };

  const limpiarLienzo = () => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    setHayFirma(false);
  };

  const guardarFirma = async () => {
    if (!hayFirma) {
      alert(
        t("alertaRealizarFirma") ||
        "Debes realizar una firma antes de guardar."
      );
      return;
    }

    if (!aceptaContrato) {
      alert(
        "Debes marcar la casilla de aceptación expresa del contrato antes de firmar."
      );
      return;
    }

    if (!contratoId || contratoId === "undefined") {
      alert(
        t("alertaIdContratoValido") ||
        "ID de contrato no válido."
      );
      return;
    }

    const numericId = Number(contratoId);

    if (!Number.isSafeInteger(numericId) || numericId <= 0) {
      alert(
        t("alertaIdContratoValido") ||
        "ID de contrato no válido."
      );
      return;
    }

    if (guardando) return;

    setGuardando(true);

    try {
      const canvas = canvasRef.current;
      const firmaBase64 = canvas.toDataURL("image/png");

      const {
        data: funcData,
        error: funcError
      } = await supabase.functions.invoke("guardar-firma", {
        body: {
          contratoId: numericId,
          contrato_id: numericId,
          firmaBase64,
          aceptaContrato: true,
          versionContrato: VERSION_CONTRATO,
          solicitaInicioAnticipado,
          versionConsentimientoInicio:
            VERSION_CONSENTIMIENTO_INICIO
        }
      });

      if (funcError) {
        let mensaje =
          funcError.message ||
          "No se pudo guardar la firma.";

        try {
          const respuesta =
            await funcError.context?.json();

          if (respuesta?.error) {
            mensaje = respuesta.error;
          }
        } catch (_) {
          // Se conserva el mensaje original si la respuesta
          // de error no contiene JSON.
        }

        throw new Error(mensaje);
      }

      if (funcData?.ok !== true) {
        throw new Error(
          funcData?.error ||
          "El servidor no confirmó que la firma se guardara."
        );
      }

      alert(
        t("contratoFirmadoExito") ||
        "¡Contrato firmado y aceptación registrada con éxito!"
      );

      if (onFirmaGuardada) {
        onFirmaGuardada(firmaBase64);
      } else {
        navigate(-1);
      }
    } catch (err) {
      console.error(
        "Error al guardar la firma y la aceptación:",
        err
      );

      alert(
        "No se ha podido guardar la firma. " +
        (err?.message ||
          "Comprueba tu conexión e inténtalo de nuevo.")
      );
    } finally {
      setGuardando(false);
    }
  };

  const contenido = (
    <div
      style={{
        background: "#0a0f1a",
        minHeight: "100vh",
        padding: "20px",
        color: "#fff"
      }}
    >
      <h2
        style={{
          textAlign: "center",
          color: "#4db8ff",
          marginBottom: "20px"
        }}
      >
        {t("firmaDelClienteTitulo") || "Firma del Cliente"}
      </h2>

      <div
        style={{
          background: "rgba(255,255,255,0.05)",
          padding: "18px",
          borderRadius: "14px",
          maxWidth: "500px",
          margin: "0 auto"
        }}
      >
        <p
          style={{
            color: "#9fb3c8",
            fontSize: "14px",
            marginBottom: "12px",
            textAlign: "center"
          }}
        >
          {t("instruccionesFirma") ||
            "Dibuje su firma con el dedo dentro del recuadro blanco:"}
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
            margin: "16px 0",
            padding: "14px",
            border: "1px solid rgba(77,184,255,0.45)",
            borderRadius: "10px",
            background: "rgba(77,184,255,0.08)"
          }}
        >
          <input
            id="aceptacion-expresa-contrato"
            type="checkbox"
            checked={aceptaContrato}
            onChange={(e) =>
              setAceptaContrato(e.target.checked)
            }
            disabled={guardando}
            style={{
              width: "20px",
              height: "20px",
              flexShrink: 0,
              marginTop: "2px",
              accentColor: "#4db8ff"
            }}
          />

          <label
            htmlFor="aceptacion-expresa-contrato"
            style={{
              color: "#ffffff",
              fontSize: "14px",
              lineHeight: 1.5,
              cursor: guardando ? "default" : "pointer"
            }}
          >
            He leído y acepto expresamente todas las
            condiciones del contrato que voy a firmar.
            Confirmo que he podido revisar el documento
            contractual antes de firmar.
          </label>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
            margin: "16px 0",
            padding: "14px",
            border: "1px solid rgba(255,193,7,0.45)",
            borderRadius: "10px",
            background: "rgba(255,193,7,0.07)"
          }}
        >
          <input
            id="consentimiento-inicio-anticipado"
            type="checkbox"
            checked={solicitaInicioAnticipado}
            onChange={(e) =>
              setSolicitaInicioAnticipado(e.target.checked)
            }
            disabled={guardando}
            style={{
              width: "20px",
              height: "20px",
              flexShrink: 0,
              marginTop: "2px",
              accentColor: "#4db8ff"
            }}
          />

          <label
            htmlFor="consentimiento-inicio-anticipado"
            style={{
              color: "#ffffff",
              fontSize: "14px",
              lineHeight: 1.5,
              cursor: guardando ? "default" : "pointer"
            }}
          >
            Solicito expresamente que el servicio comience
            antes de que finalice el plazo de desistimiento
            de 14 días y entiendo que, si desisto, podré tener
            que abonar la parte proporcional del servicio
            prestado cuando legalmente corresponda. Esta
            solicitud es opcional y no condiciona la firma
            del contrato.
          </label>
        </div>

        <div
          style={{
            background: "#ffffff",
            borderRadius: "10px",
            overflow: "hidden",
            touchAction: "none"
          }}
        >
          <canvas
            ref={canvasRef}
            onMouseDown={iniciarTrazo}
            onMouseMove={dibujar}
            onMouseUp={detenerTrazo}
            onMouseLeave={detenerTrazo}
            onTouchStart={iniciarTrazo}
            onTouchMove={dibujar}
            onTouchEnd={detenerTrazo}
            style={{
              display: "block",
              width: "100%",
              cursor: "crosshair",
              touchAction: "none"
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "16px"
          }}
        >
          <button
            onClick={limpiarLienzo}
            disabled={guardando}
            style={{
              flex: 1,
              background: "transparent",
              border: "1px solid #ff4d4d",
              color: "#ff4d4d",
              padding: "12px",
              borderRadius: "8px",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            {t("limpiar") || "Limpiar"}
          </button>

          <button
            onClick={guardarFirma}
            disabled={
              guardando ||
              !hayFirma ||
              !aceptaContrato
            }
            style={{
              flex: 2,
              background:
                guardando || !hayFirma || !aceptaContrato
                  ? "rgba(77, 184, 255, 0.4)"
                  : "#4db8ff",
              color: "#0a0f1a",
              border: "none",
              padding: "12px",
              borderRadius: "8px",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            {guardando
              ? t("guardando") || "Guardando..."
              : t("guardarFirmaBtn") || "Guardar Firma"}
          </button>
        </div>
      </div>
    </div>
  );

  return propContratoId
    ? contenido
    : <Menu>{contenido}</Menu>;
}
