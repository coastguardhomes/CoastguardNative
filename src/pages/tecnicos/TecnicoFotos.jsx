import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";

export default function TecnicoFotos() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fotos, setFotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subiendo, setSubiendo] = useState(false);

  useEffect(() => {
    cargarFotos();
  }, [id]);

  async function cargarFotos() {
    setLoading(true);
    const { data, error } = await supabase
      .from("inspeccion_fotos")
      .select("*")
      .eq("inspeccion_id", id);

    if (error) {
      console.error("Error al cargar fotos:", error);
    } else {
      setFotos(data || []);
    }
    setLoading(false);
  }

  async function tomarFoto(sourceType) {
    try {
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: sourceType, // CameraSource.Camera o CameraSource.Photos
      });

      setSubiendo(true);

      const byteCharacters = atob(image.base64String);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: `image/${image.format}` });

      const fileName = `inspeccion_${id}_${Date.now()}.${image.format}`;
      const filePath = `fotos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("inspecciones")
        .upload(filePath, blob);

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from("inspecciones")
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase.from("inspeccion_fotos").insert([
        {
          inspeccion_id: id,
          foto_url: publicUrlData.publicUrl,
        },
      ]);

      if (dbError) {
        throw dbError;
      }

      cargarFotos();
    } catch (error) {
      console.error("Error al capturar/subir la foto:", error);
    } finally {
      setSubiendo(false);
    }
  }

  async function eliminarFoto(fotoId) {
    const { error } = await supabase
      .from("inspeccion_fotos")
      .delete()
      .eq("id", fotoId);

    if (error) {
      console.error("Error al eliminar foto:", error);
    } else {
      cargarFotos();
    }
  }

  return (
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
          fontSize: "24px",
          fontWeight: "700",
          marginBottom: "20px",
          color: "#4db8ff",
          textAlign: "center",
          textShadow: "0 0 8px rgba(0,153,255,0.6)",
        }}
      >
        Galería de Fotos de la Inspección
      </h1>

      {/* Botones de acción unificados (Cámara y Galería) */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button
          onClick={() => tomarFoto(CameraSource.Camera)}
          disabled={subiendo}
          style={{
            flex: 1,
            padding: "14px",
            background: "#4db8ff",
            color: "#000",
            borderRadius: "10px",
            border: "none",
            fontWeight: "700",
            fontSize: "15px",
            cursor: "pointer",
            boxShadow: "0 0 10px rgba(0,153,255,0.4)",
          }}
        >
          {subiendo ? "Subiendo..." : "📸 Tomar foto"}
        </button>

        <button
          onClick={() => tomarFoto(CameraSource.Photos)}
          disabled={subiendo}
          style={{
            flex: 1,
            padding: "14px",
            background: "#38bdf8",
            color: "#000",
            borderRadius: "10px",
            border: "none",
            fontWeight: "700",
            fontSize: "15px",
            cursor: "pointer",
            boxShadow: "0 0 10px rgba(56,189,248,0.4)",
          }}
        >
          {subiendo ? "Subiendo..." : "🖼️ Galería"}
        </button>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", opacity: 0.8 }}>Cargando fotos...</p>
      ) : fotos.length === 0 ? (
        <p
          style={{
            textAlign: "center",
            opacity: 0.7,
            margin: "30px 0",
            fontSize: "15px",
          }}
        >
          No hay fotos registradas para esta inspección todavía.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "12px",
            marginBottom: "25px",
          }}
        >
          {fotos.map((f) => (
            <div
              key={f.id}
              style={{
                position: "relative",
                background: "rgba(255,255,255,0.05)",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.1)",
                overflow: "hidden",
                boxShadow: "0 0 8px rgba(0,153,255,0.2)",
              }}
            >
              <img
                src={f.foto_url}
                alt="Inspección"
                style={{
                  width: "100%",
                  height: "130px",
                  objectFit: "cover",
                }}
              />
              <button
                onClick={() => eliminarFoto(f.id)}
                style={{
                  position: "absolute",
                  top: "6px",
                  right: "6px",
                  background: "rgba(239, 68, 68, 0.9)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "50%",
                  width: "28px",
                  height: "28px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Botón correcto para finalizar y enviar al administrador */}
      <button
        onClick={() => navigate(`/tecnico/inspeccion/${id}/finalizar`)}
        style={{
          marginTop: "10px",
          padding: "14px",
          width: "100%",
          background: "#4ade80",
          color: "#000",
          borderRadius: "10px",
          border: "none",
          fontWeight: "700",
          fontSize: "17px",
          cursor: "pointer",
          boxShadow: "0 0 10px rgba(74,222,128,0.4)",
        }}
      >
        Finalizar e enviar al administrador →
      </button>

      <button
        onClick={() => navigate(`/tecnico/inspeccion/${id}`)}
        style={{
          marginTop: "12px",
          padding: "14px",
          width: "100%",
          background: "transparent",
          color: "#4db8ff",
          borderRadius: "10px",
          border: "1px solid #4db8ff",
          fontWeight: "700",
          fontSize: "15px",
          cursor: "pointer",
        }}
      >
        Volver a la inspección
      </button>
    </div>
  );
}
