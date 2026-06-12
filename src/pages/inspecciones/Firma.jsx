import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function Firma() {
  const { id } = useParams();
  const navigate = useNavigate();

  const canvasRef = useRef(null);
  const [ctx, setCtx] = useState(null);
  const [dibujando, setDibujando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // ============================
  // CONFIGURAR CANVAS
  // ============================
  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth - 40;
    canvas.height = 300;

    const context = canvas.getContext("2d");
    context.strokeStyle = "#ffffff";
    context.lineWidth = 3;
    context.lineCap = "round";

    setCtx(context);
  }, []);

  // ============================
  // DIBUJAR
  // ============================
  const empezar = (e) => {
    setDibujando(true);
    ctx.beginPath();
    ctx.moveTo(
      e.touches ? e.touches[0].clientX - 20 : e.clientX - 20,
      e.touches ? e.touches[0].clientY - 140 : e.clientY - 140
    );
  };

  const dibujar = (e) => {
    if (!dibujando) return;

    ctx.lineTo(
      e.touches ? e.touches[0].clientX - 20 : e.clientX - 20,
      e.touches ? e.touches[0].clientY - 140 : e.clientY - 140
    );
    ctx.stroke();
  };

  const terminar = () => {
    setDibujando(false);
  };

  // ============================
  // LIMPIAR FIRMA
  // ============================
  const limpiar = () => {
    const canvas = canvasRef.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // ============================
  // GUARDAR FIRMA
  // ============================
  const guardarFirma = async () => {
    setGuardando(true);

    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL("image/png");

    const blob = await (await fetch(dataUrl)).blob();
    const nombreArchivo = `${id}/firma-${Date.now()}.png`;

    const { error: uploadError } = await supabase.storage
      .from("inspection_photos")
      .upload(nombreArchivo, blob);

    if (uploadError) {
      alert("Error subiendo firma");
      setGuardando(false);
      return;
    }

    const urlPublica = supabase.storage
      .from("inspection_photos")
      .getPublicUrl(nombreArchivo).data.publicUrl;

    const { error: insertError } = await supabase
      .from("firmas_inspeccion")
      .insert([
        {
          inspeccion_id: id,
          url: urlPublica,
        },
      ]);

    setGuardando(false);

    if (insertError) {
      alert("Error guardando firma");
      return;
    }

    navigate(`/inspecciones/${id}`);
  };

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ marginBottom: 16 }}>Firma del Cliente</h1>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={empezar}
        onMouseMove={dibujar}
        onMouseUp={terminar}
        onMouseLeave={terminar}
        onTouchStart={empezar}
        onTouchMove={dibujar}
        onTouchEnd={terminar}
        style={{
          background: "#1e293b",
          borderRadius: 8,
          border: "1px solid #334155",
          marginBottom: 20,
        }}
      ></canvas>

      {/* Botón limpiar */}
      <button
        onClick={limpiar}
        style={{
          width: "100%",
          padding: "12px 20px",
          background: "#ef4444",
          color: "white",
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
          marginBottom: 12,
        }}
      >
        Limpiar
      </button>

      {/* Botón guardar */}
      <button
        onClick={guardarFirma}
        disabled={guardando}
        style={{
          width: "100%",
          padding: "12px 20px",
          background: guardando ? "#15803d" : "#22c55e",
          color: "white",
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
          marginBottom: 12,
        }}
      >
        {guardando ? "Guardando..." : "Guardar Firma"}
      </button>

      {/* Volver */}
      <button
        onClick={() => navigate(`/inspecciones/${id}`)}
        style={{
          width: "100%",
          padding: "12px 20px",
          background: "#475569",
          color: "white",
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
        }}
      >
        Volver
      </button>
    </div>
  );
}
