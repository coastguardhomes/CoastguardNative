import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useParams, useNavigate } from "react-router-dom";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";

export default function GaleriaInspeccion() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [fotos, setFotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [fotoGrande, setFotoGrande] = useState(null);

  // 🔥 Cargar solo fotos de esta inspección
  const cargarFotos = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("fotos_inspeccion")
      .select("*")
      .eq("inspeccion_id", id)
      .order("id", { ascending: false });

    if (error) {
      setMensaje("Error cargando fotos");
      setLoading(false);
      return;
    }

    setFotos(data || []);
    setLoading(false);
  };

  // 📸 Subir foto con Capacitor directamente desde la galería
  async function subirFoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 70,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
      });

      if (!image.base64String) return;

      const base64 = `data:image/jpeg;base64,${image.base64String}`;
      const blob = await (await fetch(base64)).blob();

      const nombreArchivo = `inspeccion_${id}_${Date.now()}.jpg`;

      const { error: storageError } = await supabase.storage
        .from("fotos")
        .upload(nombreArchivo, blob, {
          contentType: "image/jpeg",
        });

      if (storageError) {
        setMensaje("Error subiendo foto al almacenamiento");
        return;
      }

      const { data: urlData } = supabase.storage
        .from("fotos")
        .getPublicUrl(nombreArchivo);

      const nuevaFotoObj = {
        inspeccion_id: id,
        archivo: nombreArchivo,
        url: urlData.publicUrl,
        principal: false,
      };

      const { data: insertedData, error: dbError } = await supabase
        .from("fotos_inspeccion")
        .insert([nuevaFotoObj])
        .select()
        .single();

      if (dbError) {
        setMensaje("Error guardando foto en la base de datos");
        return;
      }

      await supabase
        .from("inspecciones")
        .update({
          fecha_fotos: new Date().toISOString(),
          estado: "fotos_completadas",
        })
        .eq("id", id);

      // ⚡ Actualizamos estado local al instante
      setFotos((prev) => [insertedData || nuevaFotoObj, ...prev]);
      setMensaje("¡Foto subida correctamente!");
      setTimeout(() => setMensaje(""), 3000);

      cargarFotos();
    } catch (e) {
      console.error(e);
      setMensaje("Cámara cancelada o con error.");
    }
  }

  const borrarFoto = async (foto) => {
    let path = foto.archivo;
    if (!path && foto.url) {
      path = foto.url.split("/").pop();
    }

    if (path) {
      await supabase.storage.from("fotos").remove([path]);
    }

    const { error: dbError } = await supabase
      .from("fotos_inspeccion")
      .delete()
      .eq("id", foto.id);

    if (dbError) {
      setMensaje("Error borrando foto de la base de datos");
      return;
    }

    setMensaje("Foto eliminada correctamente");
    cargarFotos();
  };

  // 🔥 Marcar foto como principal (para PDF)
  async function marcarPrincipal(foto) {
    try {
      await supabase
        .from("fotos_inspeccion")
        .update({ principal: false })
        .eq("inspeccion_id", id);

      await supabase
        .from("fotos_inspeccion")
        .update({ principal: true })
        .eq("id", foto.id);

      await supabase
        .from("inspecciones")
        .update({
          foto_principal: foto.url,
        })
        .eq("id", id);

      setMensaje("Foto marcada como principal");
      cargarFotos();
    } catch (e) {
      console.error(e);
      setMensaje("Error marcando foto como principal");
    }
  }

  // 🔥 Finalizar y enviar al administrador
  async function finalizarYEnviarRevision() {
    if (fotos.length === 0) {
      setMensaje("Debes subir al menos una foto antes de finalizar.");
      return;
    }

    setLoading(true);
    setMensaje("");

    const { error } = await supabase
      .from("inspecciones")
      .update({
        estado: "pendiente_revision",
      })
      .eq("id", id);

    if (error) {
      setMensaje("Error al enviar a revisión: " + error.message);
      setLoading(false);
      return;
    }

    setMensaje("¡Inspección enviada al administrador correctamente!");
    setTimeout(() => {
      navigate("/tecnico");
    }, 1500);
  }

  useEffect(() => {
    cargarFotos();
  }, [id]);

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
            marginBottom: "20px",
            color: "#4db8ff",
            textShadow: "0 0 8px rgba(0,153,255,0.6)",
            textAlign: "center",
          }}
        >
          Galería de Fotos
        </h1>

        {mensaje && (
          <p
            style={{
              marginBottom: "15px",
              color: mensaje.includes("correctamente") ? "#4ade80" : "#4db8ff",
              fontWeight: "600",
              textAlign: "center",
            }}
          >
            {mensaje}
          </p>
        )}

        {/* 📸 Botón Tomar Foto */}
        <button
          onClick={subirFoto}
          style={{
            width: "100%",
            padding: "14px",
            background: "#4db8ff",
            color: "#000",
            borderRadius: "10px",
            border: "none",
            fontWeight: "700",
            fontSize: "16px",
            cursor: "pointer",
            marginBottom: "20px",
            boxShadow: "0 0 10px rgba(0,153,255,0.4)",
          }}
        >
          📸 Tomar foto
        </button>

        {/* 🔥 Foto en grande */}
        {fotoGrande && (
          <div
            style={{
              marginBottom: "25px",
              textAlign: "center",
              background: "rgba(255,255,255,0.05)",
              padding: "20px",
              borderRadius: "14px",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <img
              src={fotoGrande.url}
              alt="Foto grande"
              style={{
                width: "100%",
                maxHeight: "400px",
                objectFit: "contain",
                borderRadius: "10px",
                border: "3px solid #4db8ff",
                marginBottom: "15px",
              }}
            />

            <button
              onClick={() => setFotoGrande(null)}
              style={{
                padding: "12px",
                background: "#4db8ff",
                border: "none",
                borderRadius: "10px",
                color: "#000",
                cursor: "pointer",
                fontWeight: "700",
                width: "100%",
              }}
            >
              Cerrar foto
            </button>
          </div>
        )}

        {loading ? (
          <p style={{ textAlign: "center" }}>Cargando fotos...</p>
        ) : fotos.length === 0 ? (
          <p style={{ textAlign: "center", color: "#a0aec0", margin: "20px 0" }}>
            No hay fotos registradas.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: "20px",
            }}
          >
            {fotos.map((foto) => (
              <div
                key={foto.id}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  padding: "12px",
                  borderRadius: "14px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  boxShadow: "0 0 12px rgba(0,153,255,0.2)",
                  textAlign: "center",
                }}
              >
                <img
                  src={foto.url}
                  alt="foto"
                  style={{
                    width: "100%",
                    height: "120px",
                    objectFit: "cover",
                    borderRadius: "10px",
                    border: foto.principal
                      ? "3px solid #4ade80"
                      : "2px solid #4db8ff",
                    marginBottom: "10px",
                    cursor: "pointer",
                  }}
                  onClick={() => setFotoGrande(foto)}
                />

                <button
                  onClick={() => marcarPrincipal(foto)}
                  style={{
                    padding: "10px",
                    background: foto.principal ? "#4ade80" : "#4db8ff",
                    border: "none",
                    borderRadius: "10px",
                    color: "#000",
                    cursor: "pointer",
                    width: "100%",
                    fontWeight: "700",
                    marginBottom: "8px",
                  }}
                >
                  {foto.principal ? "Principal ✔" : "Marcar como principal"}
                </button>

                <button
                  onClick={() => borrarFoto(foto)}
                  style={{
                    padding: "12px",
                    background: "#ff4444",
                    border: "none",
                    borderRadius: "10px",
                    color: "#fff",
                    cursor: "pointer",
                    width: "100%",
                    fontWeight: "700",
                    boxShadow: "0 0 10px rgba(255,0,0,0.4)",
                  }}
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 🔥 Botón Enviar al Administrador */}
        <button
          onClick={finalizarYEnviarRevision}
          style={{
            marginTop: "30px",
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
          Finalizar y enviar al administrador
        </button>

        {/* 🔥 Botón volver */}
        <button
          onClick={() => navigate(`/inspecciones/${id}`)}
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
