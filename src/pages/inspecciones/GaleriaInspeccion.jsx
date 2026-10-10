import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useParams, useNavigate } from "react-router-dom";
import {
  Camera,
  CameraResultType,
  CameraSource,
} from "@capacitor/camera";

export default function GaleriaInspeccion() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [fotos, setFotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [fotoGrande, setFotoGrande] = useState(null);

  function obtenerReferenciaStorage(valor) {
    if (typeof valor !== "string" || !valor.trim()) {
      return null;
    }

    const limpio = valor.trim();

    if (/^https?:\/\//i.test(limpio)) {
      try {
        const url = new URL(limpio);
        const partes = url.pathname.split("/").filter(Boolean);

        const indice = partes.findIndex(
          (parte, index) =>
            parte === "storage" &&
            partes[index + 1] === "v1" &&
            partes[index + 2] === "object"
        );

        if (indice === -1) return null;

        const tipo = partes[indice + 3];

        if (!["public", "sign", "authenticated"].includes(tipo)) {
          return null;
        }

        const bucket = partes[indice + 4];
        const archivoPartes = partes.slice(indice + 5);

        if (!bucket || archivoPartes.length === 0) {
          return null;
        }

        let ruta;

        try {
          ruta = archivoPartes
            .map((parte) => decodeURIComponent(parte))
            .join("/");
        } catch {
          ruta = archivoPartes.join("/");
        }

        if (!ruta) return null;

        return { bucket, ruta };
      } catch {
        return null;
      }
    }

    return {
      bucket: "fotos",
      ruta: limpio.replace(/^\/+/, ""),
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
        const { data, error } = await supabase.storage
          .from(referencia.bucket)
          .createSignedUrl(referencia.ruta, 3600);

        if (error) {
          console.error(
            "No se pudo generar el enlace de la foto:",
            error
          );
          continue;
        }

        if (data?.signedUrl) {
          return {
            ...foto,
            url: data.signedUrl,
            archivo:
              foto?.archivo ||
              (referencia.bucket === "fotos"
                ? referencia.ruta
                : candidato),
            rutaStorage: referencia.ruta,
            bucketStorage: referencia.bucket,
          };
        }

        continue;
      }

      // No alterar fotos externas que no pertenezcan a Supabase Storage.
      if (/^https?:\/\//i.test(candidato)) {
        return {
          ...foto,
          url: candidato,
          rutaStorage: null,
          bucketStorage: null,
        };
      }
    }

    return {
      ...foto,
      url: "",
      rutaStorage: null,
      bucketStorage: null,
    };
  }

  const cargarFotos = async () => {
    setLoading(true);
    setMensaje("");

    try {
      const { data, error } = await supabase
        .from("fotos_inspeccion")
        .select("*")
        .eq("inspeccion_id", id)
        .order("id", { ascending: false });

      if (error) {
        setMensaje("Error cargando fotos: " + error.message);
        setFotos([]);
        return;
      }

      const fotosResueltas = await Promise.all(
        (data || []).map((foto) => resolverFoto(foto))
      );

      setFotos(fotosResueltas.filter((foto) => foto.url));
    } catch (error) {
      console.error("Error cargando fotos:", error);
      setMensaje("No se pudieron cargar las fotos.");
    } finally {
      setLoading(false);
    }
  };

  async function subirFoto(fuente) {
    try {
      const image = await Camera.getPhoto({
        quality: 70,
        resultType: CameraResultType.Base64,
        source: fuente,
      });

      if (!image.base64String) return;

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

        await supabase.storage
          .from("fotos")
          .remove([rutaArchivo]);

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

        await supabase.storage
          .from("fotos")
          .remove([rutaArchivo]);

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
      console.error(error);
      setMensaje("Acción cancelada o con error.");
    }
  }

  const borrarFoto = async (foto) => {
    if (!foto?.id) {
      setMensaje("No se puede identificar la foto que deseas eliminar.");
      return;
    }

    const confirmar = window.confirm(
      "¿Seguro que deseas eliminar esta foto?"
    );

    if (!confirmar) return;

    const { error: dbError } = await supabase
      .from("fotos_inspeccion")
      .delete()
      .eq("id", foto.id)
      .eq("inspeccion_id", id);

    if (dbError) {
      console.error(
        "Error borrando foto de la base de datos:",
        dbError
      );
      setMensaje(
        "Error borrando foto de la base de datos: " +
          dbError.message
      );
      return;
    }

    setFotos((prev) => prev.filter((f) => f.id !== foto.id));

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
  };

  async function marcarPrincipal(foto) {
    try {
      const {
        error: quitarError,
      } = await supabase
        .from("fotos_inspeccion")
        .update({ principal: false })
        .eq("inspeccion_id", id);

      if (quitarError) throw quitarError;

      const {
        error: principalError,
      } = await supabase
        .from("fotos_inspeccion")
        .update({ principal: true })
        .eq("id", foto.id)
        .eq("inspeccion_id", id);

      if (principalError) throw principalError;

      /*
       * Guardamos la ruta persistente, no la URL firmada,
       * porque esta última caduca.
       */
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

      if (inspeccionError) throw inspeccionError;

      setFotos((prev) =>
        prev.map((f) => ({
          ...f,
          principal: f.id === foto.id,
        }))
      );

      setMensaje("Foto marcada como principal");
      setTimeout(() => setMensaje(""), 2000);
    } catch (error) {
      console.error(error);
      setMensaje(
        "Error marcando foto como principal: " +
          (error?.message || "")
      );
    }
  }

  async function finalizarYEnviarRevision() {
    if (fotos.length === 0) {
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
        setMensaje(
          "Error al enviar a revisión: " + error.message
        );
        return;
      }

      setMensaje(
        "¡Inspección enviada al administrador correctamente!"
      );

      setTimeout(() => {
        navigate("/tecnico");
      }, 1500);
    } catch (error) {
      console.error(error);
      setMensaje("Error al enviar la inspección a revisión.");
    } finally {
      setLoading(false);
    }
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
            style={{
              marginBottom: "15px",
              color:
                mensaje.includes("correctamente") ||
                mensaje.includes("principal")
                  ? "#4ade80"
                  : "#4db8ff",
              fontWeight: "600",
              textAlign: "center",
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
                />

                <button
                  onClick={() => marcarPrincipal(foto)}
                  style={{
                    padding: "10px",
                    background: foto.principal
                      ? "#4ade80"
                      : "#4db8ff",
                    border: "none",
                    borderRadius: "10px",
                    color: "#000",
                    cursor: "pointer",
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
                  }}
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}

        <button
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
