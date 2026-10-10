import React, { useRef, useState, useEffect } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useParams, useNavigate } from "react-router-dom";

export default function Firma() {
  const { id } = useParams();
  const navigate = useNavigate();

  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [firmaGuardada, setFirmaGuardada] = useState(null);

  useEffect(() => {
    let cancelado = false;

    async function cargarFirma() {
      try {
        const { data, error } = await supabase
          .from("firmas_inspeccion")
          .select("id, archivo")
          .eq("inspeccion_id", id)
          .order("id", { ascending: false })
          .limit(1);

        if (error) throw error;

        if (!data?.length || !data[0].archivo) return;

        const { data: urlData, error: urlError } =
          await supabase.storage
            .from("firmas")
            .createSignedUrl(data[0].archivo, 300);

        if (urlError) throw urlError;

        if (!cancelado && urlData?.signedUrl) {
          setFirmaGuardada(urlData.signedUrl);
        }
      } catch (err) {
        console.error("Error cargando firma anterior:", err);

        if (!cancelado) {
          setMensaje(
            "No se pudo cargar la firma guardada. Comprueba tus permisos."
          );
        }
      }
    }

    if (id) cargarFirma();

    return () => {
      cancelado = true;
    };
  }, [id]);

  function obtenerPosicion(e) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const punto = e.touches?.[0] || e.changedTouches?.[0] || e;

    return {
      x: (punto.clientX - rect.left) * (canvas.width / rect.width),
      y: (punto.clientY - rect.top) * (canvas.height / rect.height),
    };
  }

  function startDrawing(e) {
    if (e.cancelable) e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas || guardando) return;

    const ctx = canvas.getContext("2d");
    const { x, y } = obtenerPosicion(e);

    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#4db8ff";
    ctx.beginPath();
    ctx.moveTo(x, y);

    setIsDrawing(true);
  }

  function draw(e) {
    if (!isDrawing) return;
    if (e.cancelable) e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const { x, y } = obtenerPosicion(e);

    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function stopDrawing() {
    setIsDrawing(false);
  }

  function limpiar() {
    const canvas = canvasRef.current;
    if (!canvas || guardando) return;

    canvas.getContext("2d").clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    setMensaje("");
  }

  async function guardarFirma() {
    const canvas = canvasRef.current;

    if (!canvas || guardando) return;

    if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
      setMensaje("El identificador de la inspección no es válido.");
      return;
    }

    const ctx = canvas.getContext("2d");
    const pixels = ctx.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    ).data;

    let hayFirma = false;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] > 0) {
        const r = pixels[i - 3];
        const g = pixels[i - 2];
        const b = pixels[i - 1];

        if (r < 250 || g < 250 || b < 250) {
          hayFirma = true;
          break;
        }
      }
    }

    if (!hayFirma) {
      setMensaje("Debes dibujar la firma antes de guardar.");
      return;
    }

    setGuardando(true);
    setMensaje("Guardando firma...");

    let nombreArchivo = null;

    try {
      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );

      if (!blob) {
        throw new Error("No se pudo procesar la firma.");
      }

      nombreArchivo = `firma_${id}_${Date.now()}.png`;

      const { error: errorSubida } = await supabase.storage
        .from("firmas")
        .upload(nombreArchivo, blob, {
          upsert: false,
          contentType: "image/png",
          cacheControl: "300",
        });

      if (errorSubida) throw errorSubida;

      const { error: errorRegistro } = await supabase
        .from("firmas_inspeccion")
        .insert([
          {
            inspeccion_id: id,
            archivo: nombreArchivo,
          },
        ]);

      if (errorRegistro) {
        await supabase.storage
          .from("firmas")
          .remove([nombreArchivo]);

        throw errorRegistro;
      }

      const { data: urlData, error: errorUrl } =
        await supabase.storage
          .from("firmas")
          .createSignedUrl(nombreArchivo, 300);

      if (errorUrl) {
        throw errorUrl;
      }

      setFirmaGuardada(urlData?.signedUrl || null);
      setMensaje("Firma guardada correctamente ✔");

      setTimeout(() => {
        navigate(`/inspecciones/${id}`);
      }, 1000);
    } catch (err) {
      console.error("Error guardando firma:", err);

      setMensaje(
        err?.message || "No se pudo guardar la firma."
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Menu>
      <div
        style={{
          padding: "20px",
          background: "#0a0f1a",
          minHeight: "100vh",
          color: "#fff",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "700",
            marginBottom: "25px",
            color: "#4db8ff",
            textShadow: "0 0 8px rgba(0,153,255,0.6)",
            textAlign: "center",
          }}
        >
          Firma del Cliente
        </h1>

        {mensaje && (
          <div
            role="status"
            style={{
              marginBottom: "20px",
              padding: "12px",
              background: mensaje.includes("correctamente")
                ? "rgba(74, 222, 128, 0.15)"
                : "rgba(255, 107, 107, 0.15)",
              border: `1px solid ${
                mensaje.includes("correctamente")
                  ? "#4ade80"
                  : "#ff6b6b"
              }`,
              borderRadius: "10px",
              color: mensaje.includes("correctamente")
                ? "#4ade80"
                : "#ff6b6b",
              fontWeight: "600",
              textAlign: "center",
              overflowWrap: "anywhere",
            }}
          >
            {mensaje}
          </div>
        )}

        {firmaGuardada && (
          <div
            style={{
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            <p style={{ marginBottom: "10px", opacity: 0.8 }}>
              Firma ya registrada:
            </p>

            <img
              src={firmaGuardada}
              alt="Firma guardada"
              style={{
                width: "300px",
                maxWidth: "100%",
                borderRadius: "10px",
                border: "2px solid #4db8ff",
              }}
            />
          </div>
        )}

        <p
          style={{
            opacity: 0.8,
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          El cliente debe firmar la inspección realizada.
        </p>

        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            padding: "20px",
            borderRadius: "14px",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 0 12px rgba(0,153,255,0.2)",
            marginBottom: "25px",
          }}
        >
          <canvas
            ref={canvasRef}
            width={350}
            height={250}
            style={{
              background: "#fff",
              borderRadius: "10px",
              border: "2px solid #4db8ff",
              display: "block",
              margin: "0 auto 20px auto",
              maxWidth: "100%",
              touchAction: "none",
            }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              onClick={limpiar}
              disabled={guardando}
              style={{
                flex: 1,
                padding: "14px",
                background: "rgba(255,255,255,0.08)",
                color: "#fff",
                borderRadius: "10px",
                border: "none",
                fontWeight: "700",
                cursor: guardando ? "not-allowed" : "pointer",
              }}
            >
              Limpiar firma
            </button>

            <button
              type="button"
              onClick={guardarFirma}
              disabled={guardando}
              style={{
                flex: 1,
                padding: "14px",
                background: "#4db8ff",
                color: "#000",
                borderRadius: "10px",
                border: "none",
                fontWeight: "700",
                cursor: guardando ? "not-allowed" : "pointer",
                opacity: guardando ? 0.6 : 1,
                boxShadow: "0 0 10px rgba(0,153,255,0.4)",
              }}
            >
              {guardando ? "Guardando..." : "Guardar firma"}
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate(`/inspecciones/${id}`)}
          style={{
            padding: "12px",
            width: "100%",
            background: "rgba(255,255,255,0.06)",
            color: "#fff",
            borderRadius: "10px",
            border: "1px solid rgba(255,255,255,0.18)",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Volver al detalle de la inspección
        </button>
      </div>
    </Menu>
  );
}
