import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useParams, useNavigate } from "react-router-dom";
import {
  Camera,
  CameraResultType,
  CameraSource,
} from "@capacitor/camera";
import { resolverUrlPdfSegura } from "../../lib/urlPdf";

const BUCKETS_FOTOS_PERMITIDOS = new Set([
  "fotos",
  "inspecciones",
  "inspection_photos",
]);

export default function GaleriaInspeccion() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [fotos, setFotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [fotoGrande, setFotoGrande] = useState(null);

  /**
   * Reconoce las rutas de Storage del proyecto actual.
   * No confía en buckets ni rutas de otros proyectos.
   */
  function obtenerReferenciaStorage(valor) {
    if (typeof valor !== "string" || !valor.trim()) {
      return null;
    }

    const limpio = valor.trim();

    if (/^https?:\/\//i.test(limpio)) {
      try {
        const url = new URL(limpio);
        const urlProyecto = new URL(
          import.meta.env.VITE_SUPABASE_URL
        );

        if (
          url.origin !== urlProyecto.origin ||
          url.username ||
          url.password
        ) {
          return null;
        }

        const coincidencia = url.pathname.match(
          /\/storage\/v1\/object\/(?:public|sign|authenticated)\/([^/]+)\/(.+)$/i
        );

        if (!coincidencia) {
          return null;
        }

        const bucket = decodeURIComponent(coincidencia[1]);

        if (!BUCKETS_FOTOS_PERMITIDOS.has(bucket)) {
          return null;
        }

        const ruta = coincidencia[2]
          .split("/")
          .map((segmento) => decodeURIComponent(segmento))
          .join("/");

        if (!ruta.trim()) {
          return null;
        }

        return { bucket, ruta };
      } catch {
        return null;
      }
    }

    // Las rutas relativas actuales pertenecen al bucket "fotos".
    let ruta = limpio.replace(/^\/+/, "");

    if (ruta.startsWith("fotos/")) {
      ruta = ruta.slice("fotos/".length);
    }

    if (!ruta.trim()) {
      return null;
    }

    return {
      bucket: "fotos",
      ruta,
    };
  }

  async function resolverFoto(foto) {
    const candidatos = [
      foto?.archivo,
      foto?.url_storage_o_path,
      foto?.url,
    ].filter(
      (valor, index, lista) =>
        typeof valor === "string" &&
        valor.trim() &&
        lista.indexOf(valor) === index
    );

    for (const candidato of candidatos) {
      const referencia = obtenerReferenciaStorage(candidato);

      if (referencia) {
        try {
          const urlSegura = await resolverUrlPdfSegura(
            candidato,
            referencia.bucket,
            3600
          );

          if (urlSegura) {
            return {
              ...foto,
              url: urlSegura,
              archivo:
                foto?.archivo ||
                (referencia.bucket === "fotos"
                  ? referencia.ruta
                  : candidato),
              rutaStorage: referencia.ruta,
              bucketStorage: referencia.bucket,
            };
          }
        } catch (error) {
          console.error(
            "Error resolviendo la URL de la foto:",
            foto?.id,
            error
          );
        }

        continue;
      }

      // Mantener compatibilidad con imágenes externas que no sean
      // URLs de Storage de otro proyecto Supabase.
      if (/^https?:\/\//i.test(candidato)) {
        try {
          const urlExterna = await resolverUrlPdfSegura(
            candidato,
            "fotos",
            3600
          );

          if (urlExterna) {
            return {
              ...foto,
              url: urlExterna,
              rutaStorage: null,
              bucketStorage: null,
            };
          }
        } catch (error) {
          console.error(
            "Error resolviendo una imagen externa:",
            foto?.id,
            error
          );
        }
      }
    }

    return {
      ...foto,
      url: "",
      rutaStorage: null,
      bucketStorage: null,
    };
  }

  async function cargarFotos() {
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
        .eq("inspeccion_id", id)
        .order("id", { ascending: false });

      if (error) {
        throw error;
      }

      const fotosResueltas = await Promise.all(
        (data || []).map((foto) => resolverFoto(foto))
      );

      setFotos(fotosResueltas.filter((foto) => foto.url));

      if (
        fotosResueltas.length > 0 &&
        fotosResueltas.some((foto) => !foto.url)
      ) {
        setMensaje(
          "Algunas fotos no se han podido cargar. Comprueba los permisos de Storage."
        );
      }
    } catch (error) {
      console.error("Error cargando fotos:", error);
      setFotos([]);
      setMensaje(
        "No se pudieron cargar las fotos: " +
          (error?.message || "Error desconocido")
      );
    } finally {
      setLoading(false);
    }
  }

  async function subirFoto(fuente) {
    try {
      if (!id) {
        setMensaje("No se ha indicado la inspección.");
        return;
      }

      const image = await Camera.getPhoto({
        quality: 70,
        resultType: CameraResultType.Base64,
        source: fuente,
      });

      if (!image.base64String) {
        return;
      }

      setMensaje("Subiendo foto...");

      const base64 = `data:image/jpeg;base64,${image.base64String}`;
      const blob = await (await fetch(base64)).blob();
      const nombreArchivo = `inspeccion_${id}_${Date.now()}.jpg`;

      const { data: uploadData, error: storageError } =
        await supabase.storage
          .from("fotos")
          .upload(nombreArchivo, blob, {
            contentType: "image/jpeg",
            upsert: false,
          });

      if (storageError) {
        console.error(
          "Error subiendo foto al almacenamiento:",
          storageError
        );

        setMensaje(
          "Error subiendo foto al almacenamiento: " +
            storageError.message
        );
        return;
      }

      const rutaArchivo = uploadData?.path || nombreArchivo;

      const { data: signedData, error: signedError } =
        await supabase.storage
          .from("fotos")
          .createSignedUrl(rutaArchivo, 3600);

      if (signedError || !signedData?.signedUrl) {
        console.error(
          "Error creando enlace temporal:",
          signedError
        );

        const { error: errorEliminar } =
          await supabase.storage
            .from("fotos")
            .remove([rutaArchivo]);

        if (errorEliminar) {
          console.error(
            "No se pudo eliminar el archivo que falló:",
            errorEliminar
          );
        }

        setMensaje(
          "La foto se subió, pero no se pudo preparar para visualizarla."
        );
        return;
      }

      const nuevaFotoObj = {
        inspeccion_id: id,
        archivo: rutaArchivo,
        url: rutaArchivo,
        principal: false,
        tipo: "galeria",
      };

      const { data: insertedData, error: dbError } =
        await supabase
          .from("fotos_inspeccion")
          .insert([nuevaFotoObj])
          .select()
          .single();

      if (dbError) {
        console.error(
          "Error guardando foto en la base de datos:",
          dbError
        );

        const { error: errorEliminar } =
          await supabase.storage
            .from("fotos")
            .remove([rutaArchivo]);

        if (errorEliminar) {
          console.error(
            "No se pudo limpiar el archivo subido:",
            errorEliminar
          );
        }

        setMensaje(
          "Error guardando foto en la base de datos: " +
            dbError.message
        );
        return;
      }

      const { error: updateError } = await supabase
        .from("inspecciones")
        .update({
          fecha_fotos: new Date().toISOString(),
          estado: "fotos_completadas",
        })
        .eq("id", id);

      if (updateError) {
        console.error(
          "Error actualizando el estado de la inspección:",
          updateError
        );
      }

      setFotos((prev) => [
        {
          ...insertedData,
          url: signedData.signedUrl,
          rutaStorage: rutaArchivo,
          bucketStorage: "fotos",
        },
        ...prev,
      ]);

      setMensaje("¡Foto subida correctamente!");
      setTimeout(() => setMensaje(""), 3000);
    } catch (error) {
      console.error("Error con la cámara o la subida:", error);
      setMensaje("Acción cancelada o con error.");
    }
  }

  const borrarFoto = async (foto) => {
    if (!foto?.id) {
      setMensaje(
        "No se puede identificar la foto que deseas eliminar."
      );
      return;
    }

    const confirmar = window.confirm(
      "¿Seguro que deseas eliminar esta foto?"
    );

    if (!confirmar) {
      return;
    }

    try {
      const { error: dbError } = await supabase
        .from("fotos_inspeccion")
        .delete()
        .eq("id", foto.id)
        .eq("inspeccion_id", id);

      if (dbError) {
        throw dbError;
      }

      setFotos((prev) =>
        prev.filter((f) => f.id !== foto.id)
      );

      if (fotoGrande?.id === foto.id) {
        setFotoGrande(null);
      }

      if (foto.rutaStorage && foto.bucketStorage) {
        const { error: storageError } = await supabase.storage
          .from(foto.bucketStorage)
          .remove([foto.rutaStorage]);

        if (storageError) {
          console.error(
            "No se pudo eliminar el archivo del almacenamiento:",
            storageError
          );

          setMensaje(
            "La foto se eliminó de la lista, pero no se pudo borrar el archivo almacenado."
          );
          return;
        }
      }

      setMensaje("Foto eliminada correctamente");
      setTimeout(() => setMensaje(""), 2000);
    } catch (error) {
      console.error("Error borrando foto:", error);

      setMensaje(
        "Error borrando foto: " +
          (error?.message || "Error desconocido")
      );
    }
  };

  async function marcarPrincipal(foto) {
    try {
      const { error: quitarError } = await supabase
        .from("fotos_inspeccion")
        .update({ principal: false })
        .eq("inspeccion_id", id);

      if (quitarError) {
        throw quitarError;
      }

      const { error: principalError } = await supabase
        .from("fotos_inspeccion")
        .update({ principal: true })
        .eq("id", foto.id)
        .eq("inspeccion_id", id);

      if (principalError) {
        throw principalError;
      }

      // Guardar la referencia persistente, nunca el enlace firmado
      // que caduca. Las fotos actuales se guardan en "fotos".
      const valorPrincipal =
        foto.rutaStorage ||
        foto.archivo ||
        foto.url;

      const { error: inspeccionError } = await supabase
        .from("inspecciones")
        .update({
          foto_principal: valorPrincipal,
        })
        .eq("id", id);

      if (inspeccionError) {
        throw inspeccionError;
      }

      setFotos((prev) =>
        prev.map((f) => ({
          ...f,
          principal: f.id === foto.id,
        }))
      );

      setMensaje("Foto marcada como principal");
      setTimeout(() => setMensaje(""), 2000);
    } catch (error) {
      console.error(
        "Error marcando foto como principal:",
        error
      );

      setMensaje(
        "Error marcando foto como principal: " +
          (error?.message || "")
      );
    }
  }

  async function finalizarYEnviarRevision() {
    if (!fotos.length) {
      setMensaje(
        "Debes subir al menos una foto antes de finalizar."
      );
      return;
    }

    setLoading(true);
    setMensaje("");

    try {
      const { error } = await supabase
        .from("inspecciones")
        .update({
          estado: "pendiente_revision",
        })
        .eq("id", id);

      if (error) {
        throw error;
      }

      setMensaje(
        "¡Inspección enviada al administrador correctamente!"
      );

      setTimeout(() => {
        navigate("/tecnico");
      }, 1500);
    } catch (error) {
      console.error(
        "Error enviando la inspección a revisión:",
        error
      );

      setMensaje(
        "Error al enviar la inspección a revisión: " +
          (error?.message || "Error desconocido")
      );
    } finally {
      setLoading(false);
    }
  }

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
          .eq("inspeccion_id", id)
          .order("id", { ascending: false });

        if (error) {
          throw error;
        }

        const fotosResueltas = await Promise.all(
          (data || []).map((foto) => resolverFoto(foto))
        );

        if (!cancelado) {
          setFotos(fotosResueltas.filter((foto) => foto.url));

          if (
            fotosResueltas.length > 0 &&
            fotosResueltas.some((foto) => !foto.url)
          ) {
            setMensaje(
              "Algunas fotos no se han podido cargar. Comprueba los permisos de Storage."
            );
          }
        }
      } catch (error) {
        console.error("Error cargando fotos:", error);

        if (!cancelado) {
          setFotos([]);
          setMensaje(
            "No se pudieron cargar las fotos: " +
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
        <div
          style={{
            background: "rgba(77, 184, 255, 0.1)",
            border: "1px solid rgba(77, 184, 255, 0.3)",
            padding: "12px 16px",
            borderRadius: "10px",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "14px",
              color: "#4db8ff",
              fontWeight: "600",
            }}
          >
            📸 Panel de Técnico: Adjunta las evidencias fotográficas y selecciona la foto principal de la inspección.
          </p>
        </div>

        <h1
          style={{
            fontSize: "24px",
            fontWeight: "700",
            marginBottom: "20px",
            color: "#4db8ff",
            textShadow: "0 0 8px rgba(0,153,255,0.6)",
            textAlign: "center",
          }}
        >
          Galería de Fotos #{id}
        </h1>

        {mensaje && (
          <p
            role="status"
            style={{
              marginBottom: "15px",
              color:
                mensaje.includes("correctamente") ||
                mensaje.includes("principal")
                  ? "#4ade80"
                  : "#4db8ff",
              fontWeight: "600",
              textAlign: "center",
              overflowWrap: "anywhere",
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
            type="button"
            onClick={() => subirFoto(CameraSource.Camera)}
            disabled={loading}
            style={{
              flex: 1,
              padding: "14px",
              background: "#4db8ff",
              color: "#000",
              borderRadius: "10px",
              border: "none",
              fontWeight: "700",
              fontSize: "15px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            📸 Hacer Foto
          </button>

          <button
            type="button"
            onClick={() => subirFoto(CameraSource.Photos)}
            disabled={loading}
            style={{
              flex: 1,
              padding: "14px",
              background: "#27ae60",
              color: "#fff",
              borderRadius: "10px",
              border: "none",
              fontWeight: "700",
              fontSize: "15px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            🖼️ Galería
          </button>
        </div>

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
            {fotoGrande.url ? (
              <img
                src={fotoGrande.url}
                alt="Foto ampliada de inspección"
                style={{
                  width: "100%",
                  maxHeight: "400px",
                  objectFit: "contain",
                  borderRadius: "10px",
                  border: "3px solid #4db8ff",
                  marginBottom: "15px",
                }}
              />
            ) : (
              <p>Foto no disponible.</p>
            )}

            <button
              type="button"
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
          <p style={{ textAlign: "center" }}>
            Cargando fotos...
          </p>
        ) : fotos.length === 0 ? (
          <p
            style={{
              textAlign: "center",
              color: "#a0aec0",
              margin: "20px 0",
            }}
          >
            No hay fotos registradas para esta inspección.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(160px, 1fr))",
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
                {foto.url ? (
                  <img
                    src={foto.url}
                    alt="Foto de inspección"
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
                    onError={() => {
                      console.error(
                        "No se pudo mostrar la foto:",
                        foto.id
                      );
                    }}
                  />
                ) : (
                  <div
                    style={{
                      height: "120px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "10px",
                      color: "#a0aec0",
                      background: "rgba(255,255,255,0.05)",
                      borderRadius: "10px",
                    }}
                  >
                    Foto no disponible
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => marcarPrincipal(foto)}
                  disabled={loading}
                  style={{
                    padding: "10px",
                    background: foto.principal
                      ? "#4ade80"
                      : "#4db8ff",
                    border: "none",
                    borderRadius: "10px",
                    color: "#000",
                    cursor: loading ? "not-allowed" : "pointer",
                    width: "100%",
                    fontWeight: "700",
                    marginBottom: "8px",
                  }}
                >
                  {foto.principal
                    ? "Principal ✔"
                    : "Marcar como principal"}
                </button>

                <button
                  type="button"
                  onClick={() => borrarFoto(foto)}
                  disabled={loading}
                  style={{
                    padding: "12px",
                    background: "#ff4444",
                    border: "none",
                    borderRadius: "10px",
                    color: "#fff",
                    cursor: loading ? "not-allowed" : "pointer",
                    width: "100%",
                    fontWeight: "700",
                  }}
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={finalizarYEnviarRevision}
          disabled={loading}
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
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: "0 0 10px rgba(74,222,128,0.4)",
          }}
        >
          Finalizar y enviar al administrador
        </button>

        <button
          type="button"
          onClick={() => navigate(-1)}
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
          ← Volver
        </button>
      </div>
    </Menu>
  );
}
