import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";

export default function TecnicoFotos() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fotos, setFotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    if (id) cargarFotos();
  }, [id]);

  async function cargarFotos() {
    setLoading(true);
    setMensaje("");

    const { data, error } = await supabase
      .from("fotos_inspeccion")
      .select("*")
      .eq("inspeccion_id", String(id))
      .order("id", { ascending: false });

    if (error) {
      console.error("Error al cargar fotos:", error);
      setMensaje("Error al cargar fotos: " + error.message);
    } else {
      // Garantizar que la URL pública sea válida
      const fotosProcesadas = (data || []).map((f) => {
        let urlFinal = f.url || f.foto_url;
        if (!urlFinal || !urlFinal.startsWith("http")) {
          const archivo = f.archivo || f.url_storage_o_path;
          if (archivo) {
            const { data: pubUrl } = supabase.storage
              .from("fotos")
              .getPublicUrl(archivo);
            urlFinal = pubUrl?.publicUrl || "";
          }
        }
        return { ...f, url: urlFinal };
      });
      setFotos(fotosProcesadas);
    }
    setLoading(false);
  }

  async function tomarFoto(sourceType) {
    try {
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: sourceType,
      });

      if (!image.base64String) return;

      setSubiendo(true);
      setMensaje("Procesando y subiendo foto...");

      const byteCharacters = atob(image.base64String);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: `image/${image.format}` });

      const fileName = `inspeccion_${id}_${Date.now()}.${image.format}`;

      // 1️⃣ Subir al bucket unificado "fotos"
      const { error: uploadError } = await supabase.storage
        .from("fotos")
        .upload(fileName, blob, { contentType: `image/${image.format}`, upsert: true });

      if (uploadError) throw uploadError;

      // 2️⃣ Obtener URL pública
      const { data: publicUrlData } = supabase.storage
        .from("fotos")
        .getPublicUrl(fileName);

      const publicUrl = publicUrlData?.publicUrl || "";

      // 3️⃣ Insertar en la tabla unificada "fotos_inspeccion"
      const { error: dbError } = await supabase.from("fotos_inspeccion").insert([
        {
          inspeccion_id: String(id),
          archivo: fileName,
          url: publicUrl,
          tipo: "inspeccion",
          principal: false,
        },
      ]);

      if (dbError) throw dbError;

      setMensaje("¡Foto subida con éxito!");
      setTimeout(() => setMensaje(""), 3000);
      cargarFotos();
    } catch (error) {
      console.error("Error al capturar/subir la foto:", error);
      setMensaje("Error al guardar la foto: " + (error.message || "Error desconocido"));
    } finally {
      setSubiendo(false);
    }
  }

  async function eliminarFoto(foto) {
    if (!window.confirm("¿Seguro que deseas eliminar esta foto?")) return;

    // 1️⃣ Eliminar registro en BD
    const { error: dbError } = await supabase
      .from("fotos_inspeccion")
      .delete()
      .eq("id", foto.id);

    if (dbError) {
      console.error("Error al eliminar foto de BD:", dbError);
      setMensaje("Error al eliminar foto");
      return;
    }

    // 2️⃣ Eliminar archivo del Storage si existe el nombre del archivo
    if (foto.archivo) {
      await supabase.storage.from("fotos").remove([foto.archivo]);
    }

    cargarFotos();
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
          paddingBottom: "100px",
        }}
      >
        <h1
          style={{
            fontSize: "22px",
            fontWeight: "700",
            marginBottom: "20px",
            color: "#4db8ff",
            textAlign: "center",
            textShadow: "0 0 8px rgba(0,153,255,0.6)",
          }}
        >
          Galería de Fotos de la Inspección
        </h1>

        {mensaje && (
          <p
            style={{
              textAlign: "center",
              color: "#4db8ff",
              fontWeight: "600",
              marginBottom: "15px",
              fontSize: "14px",
            }}
          >
            {mensaje}
          </p>
        )}

        {/* Botones de acción unificados */}
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
          <p style={{ textAlign: "center", opacity: 0.8, color: "#4db8ff" }}>
            Cargando fotos...
          </p>
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
                  src={f.url}
                  alt="Foto Inspección"
                  style={{
                    width: "100%",
                    height: "130px",
                    objectFit: "cover",
                  }}
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/150?text=Error+Carga";
                  }}
                />
                <button
                  onClick={() => eliminarFoto(f)}
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

        {/* Botones de navegación del rol técnico */}
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
          Finalizar y enviar al administrador →
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
    </Menu>
  );
}
