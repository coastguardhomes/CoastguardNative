import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { resolverUrlPdfSegura } from "../../lib/urlPdf";

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
        setMensaje("No se ha indicado la inspección.");
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
          (data || []).map(async (foto) => {
            const referencia =
              foto.url ||
              foto.foto_url ||
              foto.archivo ||
              foto.url_storage_o_path;

            if (!referencia) {
              return { ...foto, url: "" };
            }

            try {
              const urlSegura = await resolverUrlPdfSegura(
                referencia,
                "fotos",
                3600
              );

              return {
                ...foto,
                url: urlSegura || "",
              };
            } catch (errorFirma) {
              console.error(
                "Error resolviendo la foto:",
                foto.id,
                errorFirma
              );

              return { ...foto, url: "" };
            }
          })
        );

        if (!cancelado) {
          setFotos(fotosProcesadas);

          if (fotosProcesadas.some((foto) => !foto.url)) {
            setMensaje(
              "Algunas fotos no se han podido cargar. Comprueba los permisos de Storage."
            );
          }
        }
      } catch (error) {
        console.error("Error al cargar fotos:", error);

        if (!cancelado) {
          setMensaje(
            "Error al cargar fotos: " +
              (error?.message || "Error desconocido")
          );
        }
      } finally {
        if (!cancelado) {
          setLoading(false);
        }
      }
    }

    cargar();

    return () => {
      cancelado = true;
    };
  }, [id]);

  async function cargarFotos() {
    if (!id) return;

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("fotos_inspeccion")
        .select("*")
        .eq("inspeccion_id", String(id))
        .order("id", { ascending: false });

      if (error) throw error;

      const fotosProcesadas = await Promise.all(
        (data || []).map(async (foto) => {
          const referencia =
            foto.url ||
            foto.foto_url ||
            foto.archivo ||
            foto.url_storage_o_path;

          if (!referencia) {
            return { ...foto, url: "" };
          }

          try {
            const urlSegura = await resolverUrlPdfSegura(
              referencia,
              "fotos",
              3600
            );

            return { ...foto, url: urlSegura || "" };
          } catch (errorFirma) {
            console.error(
              "Error generando URL firmada:",
              foto.id,
              errorFirma
            );

            return { ...foto, url: "" };
          }
        })
      );

      setFotos(fotosProcesadas);
    } catch (error) {
      console.error("Error actualizando la galería:", error);
      setMensaje(
        "Error al actualizar las fotos: " +
          (error?.message || "Error desconocido")
      );
    } finally {
      setLoading(false);
    }
  }

  async function tomarFoto(sourceType) {
    if (subiendo) return;

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

      let fileName = null;

      try {
        const base64Clean = image.base64String.includes("base64,")
          ? image.base64String.split("base64,")[1]
          : image.base64String;

        const byteCharacters = atob(base64Clean);
        const byteNumbers = new Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        const extension =
          String(image.format || "jpeg").toLowerCase() === "png"
            ? "png"
            : "jpeg";
        const contentType =
          extension === "png" ? "image/png" : "image/jpeg";
        const blob = new Blob([byteArray], { type: contentType });

        fileName = `inspeccion_${id}_${Date.now()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("fotos")
          .upload(fileName, blob, {
            contentType,
            upsert: false,
          });

        if (uploadError) throw uploadError;

        // Guardamos la ruta interna para que el archivo pueda
        // utilizarse con un bucket privado y URLs firmadas.
        const { error: dbError } = await supabase
          .from("fotos_inspeccion")
          .insert([
            {
              inspeccion_id: String(id),
              archivo: fileName,
              url: fileName,
              tipo: "inspeccion",
              principal: false,
            },
          ]);

        if (dbError) {
          const { error: removeError } = await supabase.storage
            .from("fotos")
            .remove([fileName]);

          if (removeError) {
            console.error(
              "No se pudo retirar la foto tras fallar el registro:",
              removeError
            );
          }

          throw dbError;
        }

        setMensaje("¡Foto subida con éxito!");
        await cargarFotos();
      } catch (error) {
        console.error("Error al guardar la foto:", error);

        setMensaje(
          "Error al guardar la foto: " +
            (error?.message || "Error desconocido")
        );
      }
    } catch (error) {
      console.error("Error al capturar o seleccionar la foto:", error);

      setMensaje(
        "Cámara o galería cancelada o no disponible."
      );
    } finally {
      setSubiendo(false);
    }
  }

  async function eliminarFoto(foto) {
    if (subiendo) return;

    if (!window.confirm("¿Seguro que deseas eliminar esta foto?")) {
      return;
    }

    setMensaje("");

    try {
      // Primero eliminamos el registro. Si falla, conservamos
      // el archivo de Storage para no dejar la foto sin referencia.
      const { error: dbError } = await supabase
        .from("fotos_inspeccion")
        .delete()
        .eq("id", foto.id);

      if (dbError) throw dbError;

      if (foto.archivo) {
        const { error: storageError } = await supabase.storage
          .from("fotos")
          .remove([foto.archivo]);

        if (storageError) {
          console.error(
            "No se pudo eliminar el archivo de Storage:",
            storageError
          );

          setMensaje(
            "El registro se eliminó, pero no se pudo borrar el archivo de Storage."
          );
          await cargarFotos();
          return;
        }
      }

      setMensaje("Foto eliminada correctamente.");
      await cargarFotos();
    } catch (error) {
      console.error("Error al eliminar foto:", error);

      setMensaje(
        "Error al eliminar la foto: " +
          (error?.message || "Error desconocido")
      );
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

        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
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
              cursor: subiendo ? "not-allowed" : "pointer",
              boxShadow: "0 0 10px rgba(0,153,255,0.4)",
              opacity: subiendo ? 0.7 : 1,
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
              cursor: subiendo ? "not-allowed" : "pointer",
              boxShadow: "0 0 10px rgba(56,189,248,0.4)",
              opacity: subiendo ? 0.7 : 1,
            }}
          >
            {subiendo ? "Subiendo..." : "🖼️ Galería"}
          </button>
        </div>

        {loading ? (
          <p
            style={{
              textAlign: "center",
              opacity: 0.8,
              color: "#4db8ff",
            }}
          >
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
                      e.currentTarget.style.display = "none";
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
                      color: "#fbbf24",
                    }}
                  >
                    No se pudo cargar la foto
                  </div>
                )}

                <button
                  onClick={() => eliminarFoto(f)}
                  disabled={subiendo}
                  aria-label="Eliminar foto"
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
                    cursor: subiendo ? "not-allowed" : "pointer",
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
          onClick={() =>
            navigate(`/tecnico/inspeccion/${id}/finalizar`)
          }
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
