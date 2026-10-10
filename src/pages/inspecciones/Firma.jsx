import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import {
  Camera,
  CameraResultType,
  CameraSource,
} from "@capacitor/camera";

const DURACION_URL_FIRMADA = 3600;

function obtenerRutaStorage(valor, bucket = "fotos") {
  if (!valor || typeof valor !== "string") return null;

  const texto = valor.trim();
  if (!texto) return null;

  // Si ya es una ruta interna de Storage.
  if (!/^https?:\/\//i.test(texto) && !/^data:/i.test(texto)) {
    return texto.replace(/^\/+/, "");
  }

  // Mantener las imágenes externas y los Data URI antiguos.
  if (/^data:/i.test(texto)) return null;

  try {
    const url = new URL(texto);
    const marcador = `/storage/v1/object/`;
    const posicion = url.pathname.indexOf(marcador);

    if (posicion === -1) return null;

    const resto = url.pathname.slice(posicion + marcador.length);
    const prefijos = [
      `public/${bucket}/`,
      `sign/${bucket}/`,
      `authenticated/${bucket}/`,
    ];

    const prefijo = prefijos.find((p) => resto.startsWith(p));
    if (!prefijo) return null;

    return decodeURIComponent(resto.slice(prefijo.length));
  } catch {
    return null;
  }
}

async function obtenerUrlFoto(foto) {
  const valorOriginal = foto.url || foto.foto_url || "";
  const ruta = obtenerRutaStorage(
    foto.archivo || foto.url_storage_o_path || valorOriginal,
    "fotos"
  );

  if (ruta) {
    const { data, error } = await supabase.storage
      .from("fotos")
      .createSignedUrl(ruta, DURACION_URL_FIRMADA);

    if (error) {
      console.error("Error creando URL firmada de la foto:", error);
      return "";
    }

    return data?.signedUrl || "";
  }

  // Compatibilidad con imágenes alojadas fuera de Supabase.
  if (/^https?:\/\//i.test(valorOriginal)) {
    try {
      const url = new URL(valorOriginal);
      if (url.protocol === "https:" || url.protocol === "http:") {
        return valorOriginal;
      }
    } catch {
      // URL antigua no válida.
    }
  }

  return "";
}

export default function TecnicoFotos() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [fotos, setFotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      if (!id) {
        setFotos([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setMensaje("");

      try {
        const { data, error } = await supabase
          .from("fotos_inspeccion")
          .select("*")
          .eq("inspeccion_id", String(id))
          .order("id", { ascending: false });

        if (error) throw error;

        const fotosProcesadas = await Promise.all(
          (data || []).map(async (foto) => ({
            ...foto,
            url: await obtenerUrlFoto(foto),
          }))
        );

        if (!cancelado) {
          setFotos(fotosProcesadas);
        }
      } catch (error) {
        console.error("Error al cargar fotos:", error);

        if (!cancelado) {
          setMensaje("Error al cargar fotos: " + error.message);
        }
      } finally {
        if (!cancelado) setLoading(false);
      }
    }

    cargar();

    return () => {
      cancelado = true;
    };
  }, [id]);

  async function cargarFotos() {
    setLoading(true);
    setMensaje("");

    try {
      const { data, error } = await supabase
        .from("fotos_inspeccion")
        .select("*")
        .eq("inspeccion_id", String(id))
        .order("id", { ascending: false });

      if (error) throw error;

      const fotosProcesadas = await Promise.all(
        (data || []).map(async (foto) => ({
          ...foto,
          url: await obtenerUrlFoto(foto),
        }))
      );

      setFotos(fotosProcesadas);
    } catch (error) {
      console.error("Error al cargar fotos:", error);
      setMensaje("Error al cargar fotos: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function tomarFoto(sourceType) {
    let nombreArchivo = null;

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
      const formato = (image.format || "jpeg").toLowerCase();
      const tipoMime =
        formato === "jpg" ? "image/jpeg" : `image/${formato}`;
      const blob = new Blob([byteArray], { type: tipoMime });

      nombreArchivo = `inspeccion_${id}_${Date.now()}.${formato}`;

      // 1. Subir la imagen al bucket fotos.
      const { error: uploadError } = await supabase.storage
        .from("fotos")
        .upload(nombreArchivo, blob, {
          contentType: tipoMime,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // 2. Guardar la ruta interna, no una URL pública.
      const { error: dbError } = await supabase
        .from("fotos_inspeccion")
        .insert([
          {
            inspeccion_id: String(id),
            archivo: nombreArchivo,
            url: nombreArchivo,
            tipo: "inspeccion",
            principal: false,
          },
        ]);

      if (dbError) {
        // Evitar dejar un archivo huérfano si falla el registro.
        const { error: errorLimpieza } = await supabase.storage
          .from("fotos")
          .remove([nombreArchivo]);

        if (errorLimpieza) {
          console.error(
            "No se pudo limpiar la foto tras fallar el registro:",
            errorLimpieza
          );
        }

        throw dbError;
      }

      await cargarFotos();
      setMensaje("¡Foto subida con éxito!");
      setTimeout(() => setMensaje(""), 3000);
    } catch (error) {
      console.error("Error al capturar/subir la foto:", error);
      setMensaje(
        "Error al guardar la foto: " +
          (error.message || "Error desconocido")
      );
    } finally {
      setSubiendo(false);
    }
  }

  async function eliminarFoto(foto) {
    if (!window.confirm("¿Seguro que deseas eliminar esta foto?")) {
      return;
    }

    // Resolver también las rutas de registros antiguos.
    const ruta = obtenerRutaStorage(
      foto.archivo || foto.url_storage_o_path || foto.url || foto.foto_url,
      "fotos"
    );

    // 1. Eliminar el registro de la base de datos.
    const { error: dbError } = await supabase
      .from("fotos_inspeccion")
      .delete()
      .eq("id", foto.id);

    if (dbError) {
      console.error("Error al eliminar foto de BD:", dbError);
      setMensaje("Error al eliminar foto: " + dbError.message);
      return;
    }

    // 2. Eliminar el archivo si tenemos su ruta interna.
    if (ruta) {
      const { error: storageError } = await supabase.storage
        .from("fotos")
        .remove([ruta]);

      if (storageError) {
        console.error(
          "El registro se eliminó, pero no se pudo eliminar el archivo:",
          storageError
        );
        setMensaje(
          "La foto se quitó del listado, pero no se pudo borrar el archivo de Storage."
        );
      } else {
        setMensaje("");
      }
    }

    await cargarFotos();
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
            role="status"
            style={{
              textAlign: "center",
              color: "#4db8ff",
              fontWeight: "600",
              marginBottom: "15px",
              fontSize: "14px",
              overflowWrap: "anywhere",
            }}
          >
            {mensaje}
          </p>
        )}

        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <button
            type="button"
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
              cursor: subiendo ? "not-allowed" : "pointer",
              boxShadow: "0 0 10px rgba(0,153,255,0.4)",
            }}
          >
            {subiendo ? "Subiendo..." : "📸 Tomar foto"}
          </button>

          <button
            type="button"
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
              cursor: subiendo ? "not-allowed" : "pointer",
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
                {f.url ? (
                  <img
                    src={f.url}
                    alt="Foto de inspección"
                    style={{
                      width: "100%",
                      height: "130px",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src =
                        "https://via.placeholder.com/150?text=Error+Carga";
                    }}
                  />
                ) : (
                  <div
                    style={{
                      height: "130px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "8px",
                      textAlign: "center",
                      fontSize: "12px",
                    }}
                  >
                    No se pudo cargar esta foto
                  </div>
                )}

                <button
                  type="button"
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

        <button
          type="button"
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
          type="button"
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
