
import React, { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useLanguage } from "../../context/LanguageContext.jsx";

const VERSIONES_CONTRATO_ADMITIDAS = new Set([
  "CONTRATO_SERVICIOS_V2_2026-11-06",
  "CONTRATO_SERVICIOS_V3_2026-11-12"
]);

const VERSION_CONSENTIMIENTO_INICIO =
  "CONSENTIMIENTO_INICIO_ANTICIPADO_V3_2026-11-12";
const VERSION_RECONOCIMIENTO_PERDIDA =
  "RECONOCIMIENTO_PERDIDA_DESISTIMIENTO_V2_2026-11-12";

const ESTADOS_CONTRATO_FIRMADO = [
  "firmado",
  "enviado_al_admin",
  "activo"
];

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
  const [aceptaRenovacion, setAceptaRenovacion] = useState(false);
  const [solicitaInicioAnticipado, setSolicitaInicioAnticipado] =
    useState(false);
  const [contratoInfo, setContratoInfo] = useState(null);

  const [estadoComprobacion, setEstadoComprobacion] =
    useState("comprobando");
  const [mensajeComprobacion, setMensajeComprobacion] =
    useState("");

  const numericId = Number(contratoId);
  const idValido =
    contratoId !== undefined &&
    contratoId !== null &&
    String(contratoId).trim() !== "" &&
    String(contratoId) !== "undefined" &&
    Number.isSafeInteger(numericId) &&
    numericId > 0;

  useEffect(() => {
    let cancelado = false;

    const comprobarContrato = async () => {
      setEstadoComprobacion("comprobando");
      setMensajeComprobacion("");
      setHayFirma(false);
      setContratoInfo(null);

      if (!idValido) {
        setEstadoComprobacion("error");
        setMensajeComprobacion("El ID del contrato no es válido.");
        return;
      }

      try {
        const { data: contrato, error } = await supabase
          .from("contratos")
          .select(
            "id, estado, firma_url, firma_cliente, periodicidad_pago, descuento_anual_pct, version_condiciones"
          )
          .eq("id", numericId)
          .maybeSingle();

        if (cancelado) return;

        if (error) {
          console.error(
            "Error al comprobar el estado del contrato:",
            error
          );

          setEstadoComprobacion("error");
          setMensajeComprobacion(
            "No se ha podido comprobar el estado del contrato. " +
            "Por seguridad, no puedes firmarlo en este momento."
          );
          return;
        }

        if (!contrato) {
          setEstadoComprobacion("error");
          setMensajeComprobacion(
            "No se ha encontrado el contrato solicitado."
          );
          return;
        }

        const versionRegistrada = String(
          contrato.version_condiciones || ""
        );

        if (!VERSIONES_CONTRATO_ADMITIDAS.has(versionRegistrada)) {
          setEstadoComprobacion("error");
          setMensajeComprobacion(
            "La versión de condiciones de este contrato no es compatible con la firma. Contacta con administración."
          );
          return;
        }

        const periodicidad = String(
          contrato.periodicidad_pago || "mensual"
        );

        if (
          periodicidad !== "mensual" &&
          periodicidad !== "anual"
        ) {
          setEstadoComprobacion("error");
          setMensajeComprobacion(
            "La periodicidad de pago del contrato no es válida. Contacta con administración."
          );
          return;
        }

        const descuentoAnual = Number(
          contrato.descuento_anual_pct ?? 10
        );

        if (
          !Number.isFinite(descuentoAnual) ||
          descuentoAnual < 0 ||
          descuentoAnual > 100
        ) {
          setEstadoComprobacion("error");
          setMensajeComprobacion(
            "El descuento anual registrado en el contrato no es válido. Contacta con administración."
          );
          return;
        }

        setContratoInfo({
          periodicidad_pago: periodicidad,
          descuento_anual_pct: descuentoAnual,
          version_condiciones: versionRegistrada
        });

        const estado = String(contrato.estado || "")
          .trim()
          .toLowerCase();

        const tieneFirma =
          (typeof contrato.firma_url === "string" &&
            contrato.firma_url.trim() !== "") ||
          (typeof contrato.firma_cliente === "string" &&
            contrato.firma_cliente.trim() !== "");

        if (
          tieneFirma ||
          ESTADOS_CONTRATO_FIRMADO.includes(estado)
        ) {
          setEstadoComprobacion("firmado");
          setMensajeComprobacion(
            "Este contrato ya está firmado. No es necesario ni posible volver a firmarlo."
          );
          return;
        }

        setEstadoComprobacion("disponible");
      } catch (error) {
        if (cancelado) return;

        console.error(
          "Error inesperado al comprobar el contrato:",
          error
        );

        setEstadoComprobacion("error");
        setMensajeComprobacion(
          "No se ha podido comprobar el estado del contrato. " +
          "Por seguridad, no puedes firmarlo en este momento."
        );
      }
    };

    comprobarContrato();

    return () => {
      cancelado = true;
    };
  }, [contratoId, numericId, idValido]);

  useEffect(() => {
    if (estadoComprobacion !== "disponible") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const contenedor = canvas.parentElement;
    if (!contenedor) return;

    const rect = contenedor.getBoundingClientRect();
    canvas.width = Math.max(1, Math.floor(rect.width));
    canvas.height = 220;
  }, [estadoComprobacion]);

  const obtenerCoordenadas = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

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
    if (estadoComprobacion !== "disponible" || guardando) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsDrawing(true);
    setHayFirma(true);

    const { x, y } = obtenerCoordenadas(e);
    const ctx = canvas.getContext("2d");

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const dibujar = (e) => {
    if (
      !isDrawing ||
      estadoComprobacion !== "disponible" ||
      guardando
    ) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const { x, y } = obtenerCoordenadas(e);
    const ctx = canvas.getContext("2d");

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
    if (guardando || estadoComprobacion !== "disponible") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    setHayFirma(false);
  };

  const guardarFirma = async () => {
    if (estadoComprobacion !== "disponible") {
      alert(
        "No se puede firmar hasta comprobar que el contrato todavía no está firmado."
      );
      return;
    }

    if (!idValido) {
      alert(
        t("alertaIdContratoValido") ||
        "ID de contrato no válido."
      );
      return;
    }

    if (!hayFirma) {
      alert(
        t("alertaRealizarFirma") ||
        "Debes realizar una firma antes de guardar."
      );
      return;
    }

    if (!contratoInfo?.version_condiciones) {
      alert(
        "No se ha podido verificar la versión y modalidad de este contrato. No se enviará la firma."
      );
      return;
    }

    if (!aceptaContrato) {
      alert(
        "Debes marcar la casilla de aceptación expresa del contrato antes de firmar."
      );
      return;
    }

    if (!aceptaRenovacion) {
      alert(
        "Debes aceptar expresamente la duración inicial de 12 meses y la renovación automática por períodos sucesivos de 12 meses antes de firmar."
      );
      return;
    }

    if (guardando) return;

    setGuardando(true);

    try {
      // Volver a comprobar el estado inmediatamente antes del envío.
      // La función de Supabase también debe impedir una segunda firma.
      const {
        data: contratoActual,
        error: errorComprobacion
      } = await supabase
        .from("contratos")
        .select(
          "id, estado, firma_url, firma_cliente, periodicidad_pago, version_condiciones"
        )
        .eq("id", numericId)
        .maybeSingle();

      if (errorComprobacion || !contratoActual) {
        throw new Error(
          "No se ha podido verificar el estado actual del contrato. No se ha enviado la firma."
        );
      }

      const estadoActual = String(contratoActual.estado || "")
        .trim()
        .toLowerCase();

      const yaFirmado =
        (typeof contratoActual.firma_url === "string" &&
          contratoActual.firma_url.trim() !== "") ||
        (typeof contratoActual.firma_cliente === "string" &&
          contratoActual.firma_cliente.trim() !== "") ||
        ESTADOS_CONTRATO_FIRMADO.includes(estadoActual);

      if (yaFirmado) {
        setEstadoComprobacion("firmado");
        setMensajeComprobacion(
          "Este contrato ya está firmado. No puedes volver a firmarlo."
        );
        setHayFirma(false);

        throw new Error(
          "El contrato ya está firmado y no admite una nueva firma."
        );
      }

      if (
        contratoActual.version_condiciones !==
          contratoInfo.version_condiciones ||
        contratoActual.periodicidad_pago !==
          contratoInfo.periodicidad_pago
      ) {
        throw new Error(
          "Las condiciones o la periodicidad del contrato han cambiado. Actualiza la pantalla antes de firmar."
        );
      }

      const canvas = canvasRef.current;
      if (!canvas) {
        throw new Error("No se ha encontrado el área de firma.");
      }

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
          aceptaRenovacion: true,
          versionContrato: contratoInfo.version_condiciones,
          solicitaInicioAnticipado,
          versionConsentimientoInicio:
            VERSION_CONSENTIMIENTO_INICIO,
          reconocePerdidaDesistimiento: solicitaInicioAnticipado,
          versionReconocimientoPerdida: solicitaInicioAnticipado
            ? VERSION_RECONOCIMIENTO_PERDIDA
            : null
        }
      });

      if (funcError) {
        let mensaje =
          funcError.message ||
          "No se pudo guardar la firma.";

        try {
          const respuesta = await funcError.context?.json();

          if (respuesta?.error) {
            mensaje = respuesta.error;
          }
        } catch (_) {
          // Se conserva el mensaje original si no hay JSON.
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

  const estiloBoton = {
    border: "none",
    padding: "12px",
    borderRadius: "8px",
    fontWeight: "bold"
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

      {estadoComprobacion === "comprobando" && (
        <div
          role="status"
          style={{
            maxWidth: "500px",
            margin: "0 auto",
            padding: "18px",
            borderRadius: "12px",
            background: "rgba(255,255,255,0.05)",
            color: "#fff",
            textAlign: "center"
          }}
        >
          Comprobando el estado del contrato…
        </div>
      )}

      {(estadoComprobacion === "firmado" ||
        estadoComprobacion === "error") && (
        <div
          role="alert"
          style={{
            maxWidth: "500px",
            margin: "0 auto",
            padding: "18px",
            borderRadius: "12px",
            border: "1px solid rgba(255,193,7,0.55)",
            background: "rgba(255,193,7,0.08)",
            color: "#fff",
            lineHeight: 1.6
          }}
        >
          <strong>
            {estadoComprobacion === "firmado"
              ? "Contrato ya firmado"
              : "No se puede abrir la firma"}
          </strong>

          <p style={{ margin: "10px 0 0" }}>
            {mensajeComprobacion}
          </p>

          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              ...estiloBoton,
              marginTop: "16px",
              background: "#4db8ff",
              color: "#0a0f1a",
              cursor: "pointer"
            }}
          >
            Volver
          </button>
        </div>
      )}

      {estadoComprobacion === "disponible" && (
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
              onChange={(e) => setAceptaContrato(e.target.checked)}
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
              He leído y acepto expresamente todas las condiciones
              del contrato que voy a firmar. Confirmo que he podido
              revisar el documento contractual antes de firmar.
            </label>
          </div>

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
              id="aceptacion-renovacion-anual"
              type="checkbox"
              checked={aceptaRenovacion}
              onChange={(e) => setAceptaRenovacion(e.target.checked)}
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
              htmlFor="aceptacion-renovacion-anual"
              style={{
                color: "#ffffff",
                fontSize: "14px",
                lineHeight: 1.5,
                cursor: guardando ? "default" : "pointer"
              }}
            >
              {contratoInfo?.periodicidad_pago === "anual" ? (
                <>
                  Acepto expresamente que el contrato tenga una duración inicial
                  de 12 meses, con pago anual anticipado y un descuento del{" "}
                  {contratoInfo.descuento_anual_pct}
                  % sobre las doce mensualidades, antes de IVA. Acepto que se
                  renueve automáticamente por períodos sucesivos de 12 meses,
                  con el correspondiente pago anual anticipado y el descuento
                  aplicable indicado en el contrato, salvo que solicite la
                  cancelación con al menos un mes de preaviso antes de la
                  renovación. El servicio se mantiene durante el período ya
                  pagado. No se modificarán unilateralmente el precio ni el
                  alcance del servicio.
                  <br /><br />
                  I expressly agree that the agreement has an initial term of
                  12 months, paid annually in advance with the stated discount
                  on the twelve monthly fees before VAT. It automatically
                  renews for successive 12-month terms with the applicable
                  annual advance payment and discount, unless I request
                  cancellation at least one month before renewal. Service
                  continues throughout the period already paid. The price and
                  scope of the service will not be changed unilaterally.
                </>
              ) : (
                <>
                  Acepto expresamente que el contrato tenga una duración inicial
                  de 12 meses, con pagos mensuales, y que se renueve
                  automáticamente por períodos sucesivos de 12 meses, salvo que
                  solicite la cancelación con al menos un mes de preaviso. Puedo
                  solicitar la cancelación en cualquier momento, sin penalización
                  por permanencia anual; durante el preaviso se mantiene el
                  servicio y la facturación que corresponda. No se modificarán
                  unilateralmente el precio ni el alcance del servicio.
                  <br /><br />
                  I expressly agree that the agreement has an initial term of
                  12 months, paid monthly, and automatically renews for
                  successive 12-month terms unless I request cancellation at
                  least one month before renewal. I may request cancellation at
                  any time without an annual-commitment penalty; service and
                  applicable billing continue during the notice period. The
                  price and scope of the service will not be changed
                  unilaterally.
                </>
              )}
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
              Solicito expresamente que CoastGuard Homes Services comience
              a prestar el servicio antes de que finalice el plazo legal de
              desistimiento que resulte aplicable. He sido informado/a de que,
              si desisto después de que el servicio haya comenzado y antes de
              su ejecución íntegra, podré tener que abonar el importe
              proporcional correspondiente a la parte efectivamente prestada,
              siempre que se cumplan los requisitos legales. Reconozco que, si
              el servicio contratado llega a ejecutarse íntegramente durante
              el plazo de desistimiento, perderé ese derecho una vez completada
              la prestación. Esta solicitud es expresa y opcional.
              <br /><br />
              I expressly request CoastGuard Homes Services to begin providing
              the service before the applicable statutory withdrawal period
              ends. I have been informed that, if I withdraw after the service
              has started but before it has been fully performed, I may have to
              pay the proportionate amount for the part actually provided,
              where the legal requirements are met. I acknowledge that, if the
              contracted service is fully performed during the withdrawal
              period, I will lose that right once performance is complete.
              This request is express and optional.
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
                height: "220px",
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
              type="button"
              onClick={limpiarLienzo}
              disabled={guardando}
              style={{
                ...estiloBoton,
                flex: 1,
                background: "transparent",
                border: "1px solid #ff4d4d",
                color: "#ff4d4d",
                cursor: guardando ? "default" : "pointer"
              }}
            >
              {t("limpiar") || "Limpiar"}
            </button>

            <button
              type="button"
              onClick={guardarFirma}
              disabled={
                guardando ||
                !hayFirma ||
                !aceptaContrato ||
                !aceptaRenovacion ||
                estadoComprobacion !== "disponible"
              }
              style={{
                ...estiloBoton,
                flex: 2,
                background:
                  guardando || !hayFirma || !aceptaContrato || !aceptaRenovacion
                    ? "rgba(77, 184, 255, 0.4)"
                    : "#4db8ff",
                color: "#0a0f1a",
                cursor:
                  guardando || !hayFirma || !aceptaContrato || !aceptaRenovacion
                    ? "default"
                    : "pointer"
              }}
            >
              {guardando
                ? t("guardando") || "Guardando..."
                : t("guardarFirmaBtn") || "Guardar Firma"}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return propContratoId ? contenido : <Menu>{contenido}</Menu>;
}
