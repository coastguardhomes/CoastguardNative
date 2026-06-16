import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import supabase from "../../supabaseClient";

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

  // Obtener coordenadas reales
  const getCoords = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    return { x, y };
  };

  // ============================
  // DIBUJAR
  // ============================
  const empezar = (e) => {
    setDibujando(true);
    const { x, y } = getCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const dibujar = (e) => {
    if (!dibujando) return;
    const { x, y } = getCoords(e);
    ctx.lineTo(x, y);
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
    const canvas = canvasRef.current;

    // Validar firma vacía
    const pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const hayTrazo = pixelData.some((v) => v !== 0);
    if (!hayTrazo) {
      alert("La firma está vacía.");
      return;
    }

    setGuardando(true);

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
      .insert([{ inspeccion_id: id, url: urlPublica }]);

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
