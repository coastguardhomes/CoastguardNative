
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

function obtenerRutaStorage(referencia, bucketEsperado = "fotos") {
  if (!referencia || typeof referencia !== "string") {
    return null;
  }

  const valor = referencia.trim();

  if (!valor) return null;

  if (/^https?:\/\//i.test(valor)) {
    try {
      const url = new URL(valor);
      const coincidencia = url.pathname.match(
        /\/storage\/v1\/object\/(?:public|sign|authenticated)\/([^/]+)\/(.+)$/i
      );

      if (!coincidencia) return null;

      const bucket = decodeURIComponent(coincidencia[1]);
      const ruta = coincidencia[2]
        .split("/")
        .map((segmento) => decodeURIComponent(segmento))
        .join("/");

      return bucket === bucketEsperado ? ruta : null;
    } catch {
      return null;
    }
  }

  const ruta = valor.replace(/^\/+/, "");
  const prefijo = `${bucketEsperado}/`;

  return ruta.startsWith(prefijo)
    ? ruta.slice(prefijo.length)
    : ruta;
}

export default function FotosInspeccion() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [fotos, setFotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [fotoGrande, setFotoGrande] = useState(null);

  useEffect(() => {
    let cancelado = false;

    cargarFotosInspeccion(() => cancelado);

    return () => {
      cancelado = true;
    };
  }, [id]);

  async function cargarFotosInspeccion(estaCancelado = () => false) {
    setLoading(true);
    setMensaje("");

    try {
      const [resultadoInspeccion, resultadoFotos] = await Promise.all([
        supabase
          .from("fotos_inspeccion")
          .select("*")
          .eq("inspeccion_id", String(id))
          .order("id", { ascending: false }),

        supabase
          .from("fotos")
          .select("*")
          .eq("inspeccion_id", id)
          .order("id", { ascending: false }),
      ]);

      if (estaCancelado()) return;

      if (resultadoInspeccion.error) {
        console.warn(
          "No se pudieron consultar fotos_inspeccion:",
          resultadoInspeccion.error.message
        );
      }

      if (resultadoFotos.error) {
        console.warn(
          "No se pudieron consultar fotos:",
          resultadoFotos.error.message
        );
      }

      const registros = [
        ...(resultadoInspeccion.data || []).map((foto) => ({
          ...foto,
          _tabla: "fotos_inspeccion",
        })),
        ...(resultadoFotos.data || []).map((foto) => ({
          ...foto,
          archivo: foto.url,
          principal: false,
          _tabla: "fotos",
        })),
      ];

      const fotosProcesadas = await Promise.all(
        registros.map(async (foto) => {
          const referencia =
            foto.archivo ||
            foto.url_storage_o_path ||
            foto.url ||
            "";

          if (!referencia) {
            return { ...foto, url: "" };
          }

          try {
            const urlFinal = await resolverUrlPdfSegura(
              referencia,
              "fotos",
              3600
            );

            return {
              ...foto,
              _referenciaOriginal: referencia,
              url: urlFinal || "",
            };
          } catch (errorUrl) {
            console.error(
              "Error resolviendo URL de foto:",
              foto.id,
              errorUrl
            );

            return { ...foto, url: "" };
          }
        })
      );

      if (!estaCancelado()) {
        const unicas = [];
        const claves = new Set();

        for (const foto of fotosProcesadas) {
          const clave = `${foto._tabla}:${foto.id}`;

          if (!claves.has(clave)) {
            claves.add(clave);
            unicas.push(foto);
          }
        }

        setFotos(unicas);
      }
    } catch (err) {
      console.error("Error cargando fotos:", err);

      if (!estaCancelado()) {
        setMensaje(
          "Error cargando fotos: " +
            (err.message || "Error desconocido")
        );
      }
    } finally {
      if (!estaCancelado()) {
        setLoading(false);
      }
    }
  }

  async function subirFoto() {
    if (subiendo) return;

    setSubiendo(true);
    setMensaje("");

    try {
      const image = await Camera.getPhoto({
        quality: 70,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
      });

      if (!image.base64String) return;

      setMensaje("Subiendo foto...");

      const base64 = `data:image/jpeg;base64,${image.base64String}`;
      const blob = await (await fetch(base64)).blob();
      const nombreArchivo = `inspeccion_${id}_${Date.now()}.jpg`;

      const { error: storageError } = await supabase.storage
        .from("fotos")
        .upload(nombreArchivo, blob, {
          contentType: "image/jpeg",
          upsert: false,
        });

      if (storageError) {
        throw new Error(
          "Error al subir imagen al servidor: " +
            storageError.message
        );
      }

      const { error: insertError } = await supabase
        .from("fotos_inspeccion")
        .insert([
          {
            inspeccion_id: String(id),
            archivo: nombreArchivo,
            url: nombreArchivo,
            principal: false,
            tipo: "inspeccion",
          },
        ]);

      if (insertError) {
        const { error: errorEliminar } = await supabase.storage
          .from("fotos")
          .remove([nombreArchivo]);

        if (errorEliminar) {
          console.error(
            "No se pudo limpiar la foto subida:",
            errorEliminar.message
          );
        }

        throw new Error(
          "Error guardando la foto en la base de datos: " +
            insertError.message
        );
      }

      setMensaje("¡Foto subida con éxito!");

      await cargarFotosInspeccion();
    } catch (error) {
      console.error("Error en la cámara o al subir la foto:", error);

      setMensaje(
        error?.message ||
          "Operación de cámara cancelada o con error."
      );
    } finally {
      setSubiendo(false);
    }
  }

  async function borrarFoto(foto) {
    if (!window.confirm("¿Seguro que quieres eliminar esta foto?")) {
      return;
    }

    setMensaje("");

    try {
      const tabla = foto._tabla || "fotos_inspeccion";

      const { error: errorBD } = await supabase
        .from(tabla)
        .delete()
        .eq("id", foto.id);

      if (errorBD) {
        throw errorBD;
      }

      const referencia =
        foto.archivo ||
        foto.url_storage_o_path ||
        foto._referenciaOriginal ||
        foto.url ||
        "";

      const rutaStorage = obtenerRutaStorage(referencia, "fotos");

      if (rutaStorage) {
        const { error: errorStorage } = await supabase.storage
          .from("fotos")
          .remove([rutaStorage]);

        if (errorStorage) {
          console.error(
            "No se pudo eliminar el archivo de Storage:",
            errorStorage.message
          );

          setMensaje(
            "Registro eliminado, pero no se pudo borrar el archivo almacenado."
          );

          await cargarFotosInspeccion();
          return;
        }
      }

      if (
        fotoGrande?.id === foto.id &&
        fotoGrande?._tabla === foto._tabla
      ) {
        setFotoGrande(null);
      }

      setMensaje("Foto eliminada correctamente.");
      await cargarFotosInspeccion();
    } catch (err) {
      console.error("Error eliminando foto:", err);

      setMensaje(
        "Error al eliminar foto: " +
          (err.message || "Error desconocido")
      );
    }
  }

  async function marcarPrincipal(foto) {
    if (foto._tabla !== "fotos_inspeccion") {
      setMensaje(
        "Esta fotografía antigua no admite cambiar la foto principal desde esta galería."
      );
      return;
    }

    try {
      const { error: errorQuitar } = await supabase
        .from("fotos_inspeccion")
        .update({ principal: false })
        .eq("inspeccion_id", String(id));

      if (errorQuitar) throw errorQuitar;

      const { error: errorMarcar } = await supabase
        .from("fotos_inspeccion")
        .update({ principal: true })
        .eq("id", foto.id);

      if (errorMarcar) throw errorMarcar;

      setMensaje("Foto principal actualizada.");
      await cargarFotosInspeccion();
    } catch (err) {
      console.error("Error marcando foto principal:", err);

      setMensaje(
        "No se pudo marcar la foto como principal: " +
          (err.message || "Error desconocido")
      );
    }
  }

  return (
    <Menu>
      <div style={contenedor}>
        <h1 style={titulo}>
          Galería de Fotos de la Inspección
        </h1>

        {mensaje && (
          <p style={mensajeEstilo}>{mensaje}</p>
        )}

        <button
          onClick={subirFoto}
          disabled={subiendo}
          style={{
            ...botonSubir,
            opacity: subiendo ? 0.6 : 1,
          }}
        >
          {subiendo ? "Subiendo foto..." : "📸 Tomar foto"}
        </button>

        {fotoGrande && (
          <div style={contenedorGrande}>
            {fotoGrande.url ? (
              <img
                src={fotoGrande.url}
                alt="Foto ampliada de la inspección"
                style={imagenGrandeEstilo}
              />
            ) : (
              <p>No se pudo cargar esta foto.</p>
            )}

            <button
              onClick={() => setFotoGrande(null)}
              style={botonCerrarGrande}
            >
              Cerrar foto
            </button>
          </div>
        )}

        {loading ? (
          <p style={{ textAlign: "center", color: "#4db8ff" }}>
            Cargando fotos...
          </p>
        ) : fotos.length === 0 ? (
          <p style={vacioEstilo}>
            No hay fotos registradas para esta inspección todavía.
          </p>
        ) : (
          <div style={grid}>
            {fotos.map((foto) => (
              <div
                key={`${foto._tabla}-${foto.id}`}
                style={card}
              >
                {foto.url ? (
                  <img
                    src={foto.url}
                    alt={foto.descripcion || "Foto de inspección"}
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
                        "Error al mostrar imagen:",
                        foto.id,
                        foto._tabla
                      );
                    }}
                  />
                ) : (
                  <div style={fotoNoDisponible}>
                    Foto no disponible
                  </div>
                )}

                {foto.descripcion && (
                  <p style={descripcionEstilo}>
                    {foto.descripcion}
                  </p>
                )}

                {foto._tabla === "fotos_inspeccion" && (
                  <button
                    onClick={() => marcarPrincipal(foto)}
                    style={{
                      ...boton,
                      background: foto.principal
                        ? "#4ade80"
                        : "#4db8ff",
                    }}
                  >
                    {foto.principal
                      ? "Principal ✔"
                      : "Hacer principal"}
                  </button>
                )}

                <button
                  onClick={() => borrarFoto(foto)}
                  style={botonEliminar}
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() =>
            navigate(`/tecnico/inspeccion/${id}/checklist`)
          }
          style={botonContinuar}
        >
          Ir a Checklist ➔
        </button>

        <button
          onClick={() => navigate(`/tecnico/inspeccion/${id}`)}
          style={botonVolver}
        >
          Volver a la inspección
        </button>
      </div>
    </Menu>
  );
}

const contenedor = {
  padding: "20px",
  background: "#0a0f1a",
  minHeight: "100vh",
  color: "#fff",
  fontFamily: "Inter, sans-serif",
  paddingBottom: "100px",
};

const titulo = {
  fontSize: "22px",
  fontWeight: "700",
  marginBottom: "20px",
  color: "#4db8ff",
  textAlign: "center",
};

const mensajeEstilo = {
  marginBottom: "15px",
  color: "#4db8ff",
  fontWeight: "600",
  textAlign: "center",
  overflowWrap: "anywhere",
};

const botonSubir = {
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
};

const contenedorGrande = {
  marginBottom: "25px",
  textAlign: "center",
  background: "rgba(255,255,255,0.05)",
  padding: "20px",
  borderRadius: "14px",
};

const imagenGrandeEstilo = {
  width: "100%",
  maxHeight: "400px",
  objectFit: "contain",
  borderRadius: "10px",
  marginBottom: "15px",
};

const botonCerrarGrande = {
  padding: "12px",
  background: "#4db8ff",
  border: "none",
  borderRadius: "10px",
  color: "#000",
  cursor: "pointer",
  fontWeight: "700",
  width: "100%",
};

const vacioEstilo = {
  textAlign: "center",
  color: "#a0aec0",
  margin: "20px 0",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
  gap: "20px",
};

const card = {
  background: "rgba(255,255,255,0.05)",
  padding: "12px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.1)",
  textAlign: "center",
};

const fotoNoDisponible = {
  height: "120px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "10px",
  color: "#a0aec0",
  background: "rgba(255,255,255,0.05)",
  borderRadius: "10px",
};

const descripcionEstilo = {
  fontSize: "13px",
  color: "#cbd5e1",
  overflowWrap: "anywhere",
  marginBottom: "10px",
};

const boton = {
  width: "100%",
  padding: "10px",
  color: "#000",
  borderRadius: "10px",
  border: "none",
  fontWeight: "700",
  cursor: "pointer",
  marginBottom: "8px",
};

const botonEliminar = {
  width: "100%",
  padding: "12px",
  background: "#ff4444",
  color: "#fff",
  borderRadius: "10px",
  border: "none",
  fontWeight: "700",
  cursor: "pointer",
};

const botonContinuar = {
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
};

const botonVolver = {
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
};
