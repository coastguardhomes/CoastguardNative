
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { resolverUrlPdfSegura } from "../../lib/urlPdf";

const BUCKET_FOTOS = "facturas";
const CARPETA_FOTOS = "inspecciones";

export default function InspeccionExtra() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [factura, setFactura] = useState(null);
  const [inspeccionId, setInspeccionId] = useState(null);

  const [descripcion, setDescripcion] = useState("");
  const [materiales, setMateriales] = useState("");
  const [tiempoEmpleado, setTiempoEmpleado] = useState("");

  // Se guardan rutas de Storage, no URLs temporales.
  const [fotos, setFotos] = useState([]);
  const [fotosVisibles, setFotosVisibles] = useState([]);

  async function resolverFotos(referencias) {
    return Promise.all(
      (Array.isArray(referencias) ? referencias : []).map(
        async (referencia) => {
          if (
            !referencia ||
            typeof referencia !== "string"
          ) {
            return "";
          }

          if (
            referencia.startsWith("data:") ||
            referencia.startsWith("blob:")
          ) {
            return referencia;
          }

          try {
            return (
              (await resolverUrlPdfSegura(
                referencia,
                BUCKET_FOTOS,
                3600
              )) || ""
            );
          } catch (err) {
            console.error(
              "Error resolviendo foto del extra:",
              err
            );
            return "";
          }
        }
      )
    );
  }

  useEffect(() => {
    let cancelado = false;

    async function cargarInspeccion() {
      try {
        setLoading(true);
        setError("");
        setMensaje("");

        /*
         * Se carga la factura únicamente para identificar
         * el trabajo asociado y mostrar su información.
         * Esta pantalla no actualiza la tabla facturas.
         */
        const {
          data: facturaEncontrada,
          error: errorFactura,
        } = await supabase
          .from("facturas")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (errorFactura) {
          throw errorFactura;
        }

        if (!facturaEncontrada) {
          if (!cancelado) {
            setError(
              "No se encontró el registro de la factura."
            );
          }
          return;
        }

        /*
         * Si ya existe una inspección de tipo extra para esta
         * factura, la cargamos para evitar crear una nueva cada
         * vez que se vuelva a abrir esta pantalla.
         */
        const {
          data: inspeccionExistente,
          error: errorInspeccion,
        } = await supabase
          .from("inspecciones")
          .select("*")
          .eq("factura_id", id)
          .eq("tipo", "extra")
          .order("fecha", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (errorInspeccion) {
          throw errorInspeccion;
        }

        let referenciasFotos = Array.isArray(
          facturaEncontrada.fotos
        )
          ? facturaEncontrada.fotos.filter(
              (foto) => typeof foto === "string"
            )
          : [];

        if (inspeccionExistente) {
          const {
            data: fotosRegistradas,
            error: errorFotos,
          } = await supabase
            .from("inspecciones_fotos")
            .select("url")
            .eq("inspeccion_id", inspeccionExistente.id);

          if (errorFotos) {
            throw errorFotos;
          }

          referenciasFotos = (
            fotosRegistradas || []
          )
            .map((foto) => foto.url)
            .filter(
              (referencia) =>
                typeof referencia === "string" &&
                referencia.length > 0
            );

          if (referenciasFotos.length === 0) {
            referenciasFotos = Array.isArray(
              facturaEncontrada.fotos
            )
              ? facturaEncontrada.fotos.filter(
                  (foto) => typeof foto === "string"
                )
              : [];
          }
        }

        const urlsVisibles = await resolverFotos(
          referenciasFotos
        );

        if (cancelado) return;

        setFactura(facturaEncontrada);
        setInspeccionId(
          inspeccionExistente?.id || null
        );

        setDescripcion(
          inspeccionExistente?.descripcion ??
            facturaEncontrada.descripcion ??
            ""
        );

        setMateriales(
          inspeccionExistente?.materiales ??
            facturaEncontrada.materiales ??
            ""
        );

        setTiempoEmpleado(
          inspeccionExistente?.tiempo_empleado ??
            facturaEncontrada.tiempo_empleado ??
            ""
        );

        setFotos(referenciasFotos);
        setFotosVisibles(urlsVisibles);
      } catch (err) {
        console.error(
          "Error cargando inspección:",
          err
        );

        if (!cancelado) {
          setError(
            "Error al cargar los datos del trabajo: " +
              (err?.message || "Error desconocido")
          );
        }
      } finally {
        if (!cancelado) {
          setLoading(false);
        }
      }
    }

    if (id) {
      cargarInspeccion();
    } else {
      setLoading(false);
      setError("No se ha indicado el trabajo.");
    }

    return () => {
      cancelado = true;
    };
  }, [id]);

  // Subida de fotografías desde cámara o galería.
  const manejarSubidaFotos = async (e) => {
    const input = e.target;
    const archivos = Array.from(input.files || []);

    // Permite volver a seleccionar el mismo archivo.
    input.value = "";

    if (!archivos.length || guardando) return;

    setGuardando(true);
    setError("");
    setMensaje("");

    const rutasSubidas = [];

    try {
      const nuevasReferencias = [...fotos];

      for (const archivo of archivos) {
        if (
          !archivo.type ||
          !archivo.type.startsWith("image/")
        ) {
          throw new Error(
            "Solo se permiten archivos de imagen."
          );
        }

        const extensionOriginal = archivo.name.includes(".")
          ? archivo.name.split(".").pop().toLowerCase()
          : "jpg";

        const extension =
          /^[a-z0-9]+$/.test(extensionOriginal)
            ? extensionOriginal
            : "jpg";

        const nombreArchivo =
          `${Date.now()}_${Math.random()
            .toString(36)
            .slice(2)}.${extension}`;

        const rutaArchivo =
          `${CARPETA_FOTOS}/${nombreArchivo}`;

        const {
          data: datosSubida,
          error: errorSubida,
        } = await supabase.storage
          .from(BUCKET_FOTOS)
          .upload(rutaArchivo, archivo, {
            contentType: archivo.type,
            upsert: false,
          });

        if (errorSubida) {
          throw errorSubida;
        }

        const rutaGuardada =
          datosSubida?.path || rutaArchivo;

        rutasSubidas.push(rutaGuardada);
        nuevasReferencias.push(rutaGuardada);
      }

      const nuevasUrls = await resolverFotos(
        nuevasReferencias
      );

      setFotos(nuevasReferencias);
      setFotosVisibles(nuevasUrls);
      setMensaje("¡Fotos subidas con éxito!");
    } catch (err) {
      console.error(
        "Error al subir fotos:",
        err
      );

      // Limpia las imágenes subidas durante esta operación
      // si falla una subida posterior.
      if (rutasSubidas.length > 0) {
        const {
          error: errorEliminar,
        } = await supabase.storage
          .from(BUCKET_FOTOS)
          .remove(rutasSubidas);

        if (errorEliminar) {
          console.error(
            "No se pudieron limpiar todos los archivos subidos:",
            errorEliminar
          );
        }
      }

      setError(
        "No se pudieron subir las fotos: " +
          (err?.message || "Error desconocido")
      );
    } finally {
      setGuardando(false);
    }
  };

  // Guarda la inspección sin modificar los datos administrativos.
  const guardarYEnviarAlAdmin = async () => {
    if (guardando) return;

    if (!factura?.id) {
      setError(
        "No se puede guardar: falta la factura asociada."
      );
      return;
    }

    if (!descripcion.trim()) {
      setError(
        "Escribe la descripción del trabajo realizado."
      );
      return;
    }

    setGuardando(true);
    setError("");
    setMensaje("");

    let idInspeccionGuardada = inspeccionId;
    let inspeccionNueva = false;

    try {
      const datosInspeccion = {
        factura_id: factura.id,
        descripcion: descripcion.trim(),
        materiales: materiales.trim(),
        tiempo_empleado: tiempoEmpleado.trim(),
        tipo: "extra",
        fecha: new Date().toISOString(),
      };

      if (inspeccionId) {
        const {
          data: inspeccionActualizada,
          error: errorActualizar,
        } = await supabase
          .from("inspecciones")
          .update(datosInspeccion)
          .eq("id", inspeccionId)
          .select("id")
          .maybeSingle();

        if (errorActualizar) {
          throw errorActualizar;
        }

        if (!inspeccionActualizada) {
          throw new Error(
            "No se pudo actualizar la inspección. Comprueba los permisos del técnico."
          );
        }

        idInspeccionGuardada =
          inspeccionActualizada.id;
      } else {
        const {
          data: nuevaInspeccion,
          error: errorInsertar,
        } = await supabase
          .from("inspecciones")
          .insert(datosInspeccion)
          .select("id")
          .single();

        if (errorInsertar) {
          throw errorInsertar;
        }

        idInspeccionGuardada = nuevaInspeccion.id;
        inspeccionNueva = true;
      }

      /*
       * Actualiza las referencias de fotos de la inspección.
       * No se guarda ninguna URL firmada porque caduca.
       */
      const {
        error: errorEliminarFotos,
      } = await supabase
        .from("inspecciones_fotos")
        .delete()
        .eq(
          "inspeccion_id",
          idInspeccionGuardada
        );

      if (errorEliminarFotos) {
        throw errorEliminarFotos;
      }

      if (fotos.length > 0) {
        const filasFotos = fotos.map(
          (referencia) => ({
            inspeccion_id: idInspeccionGuardada,
            url: referencia,
          })
        );

        const {
          error: errorInsertarFotos,
        } = await supabase
          .from("inspecciones_fotos")
          .insert(filasFotos);

        if (errorInsertarFotos) {
          throw errorInsertarFotos;
        }
      }

      setInspeccionId(idInspeccionGuardada);
      setMensaje(
        "¡Inspección guardada y enviada al administrador correctamente!"
      );

      setTimeout(() => {
        navigate("/tecnico");
      }, 1500);
    } catch (err) {
      console.error(
        "Error al guardar la inspección:",
        err
      );

      /*
       * Si se creó una inspección nueva pero falló el registro
       * de sus fotografías, intentamos eliminar el registro
       * incompleto para no dejar datos huérfanos.
       */
      if (
        inspeccionNueva &&
        idInspeccionGuardada
      ) {
        const {
          error: errorRollback,
        } = await supabase
          .from("inspecciones")
          .delete()
          .eq("id", idInspeccionGuardada);

        if (errorRollback) {
          console.error(
            "No se pudo limpiar la inspección incompleta:",
            errorRollback
          );
        }
      }

      setError(
        "Error al guardar la inspección: " +
          (err?.message || "Error desconocido")
      );
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return (
      <div style={estilos.centrado}>
        Cargando datos del trabajo...
      </div>
    );
  }

  return (
    <div style={estilos.pagina}>
      <button
        type="button"
        onClick={() => navigate(-1)}
        style={estilos.botonVolver}
        disabled={guardando}
      >
        ← Volver
      </button>

      <h2 style={estilos.titulo}>
        Inspección de Trabajo
      </h2>

      {mensaje && (
        <p style={estilos.ok}>{mensaje}</p>
      )}

      {error && (
        <p style={estilos.error}>{error}</p>
      )}

      <div style={estilos.tarjeta}>
        <p style={estilos.dato}>
          <strong>Factura asociada:</strong>{" "}
          {factura?.numero || `#${factura?.id || id}`}
        </p>

        <p style={estilos.aviso}>
          El técnico registra la inspección. El precio,
          el IVA, el total y el estado administrativo
          de la factura no se modifican desde esta pantalla.
        </p>
      </div>

      <div style={estilos.contenedorBotonesFoto}>
        <label
          style={{
            ...estilos.botonFoto,
            opacity: guardando ? 0.6 : 1,
          }}
        >
          📸 Hacer Foto
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={manejarSubidaFotos}
            disabled={guardando}
            style={{ display: "none" }}
          />
        </label>

        <label
          style={{
            ...estilos.botonGaleria,
            opacity: guardando ? 0.6 : 1,
          }}
        >
          🖼️ Galería
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={manejarSubidaFotos}
            disabled={guardando}
            style={{ display: "none" }}
          />
        </label>
      </div>

      {fotos.length > 0 && (
        <div style={estilos.gridFotos}>
          {fotos.map((referencia, index) => (
            <div key={`${referencia}-${index}`}>
              {fotosVisibles[index] ? (
                <img
                  src={fotosVisibles[index]}
                  alt={`Evidencia ${index + 1}`}
                  style={estilos.miniatura}
                />
              ) : (
                <div style={estilos.fotoNoDisponible}>
                  Foto no disponible
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={estilos.tarjeta}>
        <label style={estilos.label}>
          Descripción del trabajo realizado:
        </label>

        <textarea
          rows="3"
          value={descripcion}
          onChange={(e) =>
            setDescripcion(e.target.value)
          }
          placeholder="Detalla qué se ha reparado o revisado..."
          style={estilos.textarea}
          disabled={guardando}
        />

        <label style={estilos.label}>
          Materiales usados:
        </label>

        <input
          type="text"
          value={materiales}
          onChange={(e) =>
            setMateriales(e.target.value)
          }
          placeholder="Ej: Tubo de PVC, silicona, tornillos..."
          style={estilos.input}
          disabled={guardando}
        />

        <label style={estilos.label}>
          Tiempo empleado:
        </label>

        <input
          type="text"
          value={tiempoEmpleado}
          onChange={(e) =>
            setTiempoEmpleado(e.target.value)
          }
          placeholder="Ej: 2 horas"
          style={estilos.input}
          disabled={guardando}
        />
      </div>

      <button
        type="button"
        onClick={guardarYEnviarAlAdmin}
        disabled={guardando}
        style={{
          ...estilos.botonEnviar,
          opacity: guardando ? 0.6 : 1,
          cursor: guardando
            ? "not-allowed"
            : "pointer",
        }}
      >
        {guardando
          ? "Guardando..."
          : "✅ Guardar y Enviar Inspección al Admin"}
      </button>
    </div>
  );
}

const estilos = {
  pagina: {
    padding: 20,
    background: "#0a0f1a",
    minHeight: "100vh",
    color: "#fff",
    fontFamily: "Inter, sans-serif",
    boxSizing: "border-box",
  },
  centrado: {
    minHeight: "100vh",
    background: "#0a0f1a",
    color: "#fff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  titulo: {
    color: "#ffcc00",
    marginBottom: 20,
    fontSize: 22,
    fontWeight: 700,
  },
  botonVolver: {
    background: "transparent",
    border: "1px solid #ffcc00",
    color: "#ffcc00",
    padding: "8px 14px",
    borderRadius: 8,
    cursor: "pointer",
    marginBottom: 15,
  },
  tarjeta: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  dato: {
    color: "#d1d5db",
    fontSize: 13,
    margin: "4px 0 10px",
  },
  aviso: {
    color: "#fbbf24",
    fontSize: 12,
    lineHeight: 1.5,
    margin: 0,
  },
  label: {
    display: "block",
    color: "#9fb3c8",
    fontSize: 13,
    marginBottom: 6,
    fontWeight: 600,
    marginTop: 12,
  },
  input: {
    width: "100%",
    padding: 12,
    background: "#111827",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: 8,
    color: "#fff",
    fontSize: 14,
    marginBottom: 10,
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    padding: 12,
    background: "#111827",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: 8,
    color: "#fff",
    fontSize: 14,
    marginBottom: 10,
    boxSizing: "border-box",
  },
  contenedorBotonesFoto: {
    display: "flex",
    gap: 10,
    marginBottom: 15,
  },
  botonFoto: {
    flex: 1,
    textAlign: "center",
    background: "#f59e0b",
    color: "#000",
    padding: 12,
    borderRadius: 10,
    fontWeight: 700,
    cursor: "pointer",
  },
  botonGaleria: {
    flex: 1,
    textAlign: "center",
    background: "#10b981",
    color: "#fff",
    padding: 12,
    borderRadius: 10,
    fontWeight: 700,
    cursor: "pointer",
  },
  gridFotos: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 15,
  },
  miniatura: {
    width: 70,
    height: 70,
    objectFit: "cover",
    borderRadius: 8,
    border: "1px solid #fff",
  },
  fotoNoDisponible: {
    width: 70,
    height: 70,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    fontSize: 10,
    color: "#fbbf24",
    border: "1px solid #fff",
    borderRadius: 8,
  },
  botonEnviar: {
    width: "100%",
    padding: 14,
    background: "#22c55e",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontWeight: 700,
    fontSize: 16,
    cursor: "pointer",
  },
  ok: {
    color: "#4ade80",
    background: "rgba(74,222,128,0.1)",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    fontWeight: 600,
  },
  error: {
    color: "#f87171",
    background: "rgba(248,113,113,0.1)",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    fontWeight: 600,
  },
};
