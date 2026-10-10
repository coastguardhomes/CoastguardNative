import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { resolverUrlPdfSegura } from "../../lib/urlPdf";

export default function InspeccionExtra() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [descripcion, setDescripcion] = useState("");
  const [materiales, setMateriales] = useState("");
  const [tiempoEmpleado, setTiempoEmpleado] = useState("");

  // Referencias persistentes de las fotos: rutas internas o URLs antiguas.
  const [fotos, setFotos] = useState([]);

  // URLs temporales usadas únicamente para mostrar las fotos.
  const [fotosVisibles, setFotosVisibles] = useState([]);

  async function resolverFotos(referencias) {
    return Promise.all(
      (Array.isArray(referencias) ? referencias : []).map(
        async (referencia) => {
          if (!referencia || typeof referencia !== "string") {
            return "";
          }

          try {
            return (
              (await resolverUrlPdfSegura(
                referencia,
                "facturas",
                3600
              )) || ""
            );
          } catch (err) {
            console.error("Error resolviendo foto del extra:", err);
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

        const { data, error: err } = await supabase
          .from("facturas")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (err) throw err;

        if (!data) {
          if (!cancelado) {
            setError("No se encontró el registro de la factura.");
          }
          return;
        }

        const referencias = Array.isArray(data.fotos)
          ? data.fotos
          : [];

        const urlsVisibles = await resolverFotos(referencias);

        if (cancelado) return;

        setDescripcion(data.descripcion || "");
        setMateriales(data.materiales || "");
        setTiempoEmpleado(data.tiempo_empleado || "");
        setFotos(referencias);
        setFotosVisibles(urlsVisibles);
      } catch (err) {
        console.error("Error cargando inspección:", err);

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

  // Subida de fotos desde cámara o galería.
  const manejarSubidaFotos = async (e) => {
    const input = e.target;
    const files = Array.from(input.files || []);

    // Permite seleccionar de nuevo el mismo archivo.
    input.value = "";

    if (!files.length || guardando) return;

    setGuardando(true);
    setError("");
    setMensaje("");

    const nuevasRutasSubidas = [];

    try {
      const nuevasReferencias = [...fotos];

      for (const file of files) {
        if (!file.type || !file.type.startsWith("image/")) {
          throw new Error("Solo se permiten archivos de imagen.");
        }

        const extensionOriginal = file.name.includes(".")
          ? file.name.split(".").pop().toLowerCase()
          : "jpg";

        const extension = /^[a-z0-9]+$/.test(extensionOriginal)
          ? extensionOriginal
          : "jpg";

        const fileName =
          `${Date.now()}_${Math.random().toString(36).slice(2)}.${extension}`;

        const filePath = `inspecciones/${fileName}`;

        const { data: uploadData, error: uploadError } =
          await supabase.storage
            .from("facturas")
            .upload(filePath, file, {
              contentType: file.type,
              upsert: false,
            });

        if (uploadError) throw uploadError;

        const rutaGuardada = uploadData?.path || filePath;

        nuevasRutasSubidas.push(rutaGuardada);
        nuevasReferencias.push(rutaGuardada);
      }

      const nuevasUrlsVisibles = await resolverFotos(nuevasReferencias);

      setFotos(nuevasReferencias);
      setFotosVisibles(nuevasUrlsVisibles);
      setMensaje("¡Fotos subidas con éxito!");
    } catch (err) {
      console.error("Error al subir fotos:", err);

      // Si falla la subida de un archivo posterior, limpiamos los
      // archivos que ya se subieron durante esta misma operación.
      if (nuevasRutasSubidas.length > 0) {
        const { error: removeError } = await supabase.storage
          .from("facturas")
          .remove(nuevasRutasSubidas);

        if (removeError) {
          console.error(
            "No se pudieron limpiar todos los archivos subidos:",
            removeError
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

  // Guardar el trabajo extra y remitirlo a administración.
  const guardarYEnviarAlAdmin = async () => {
    if (guardando) return;

    try {
      setGuardando(true);
      setError("");
      setMensaje("");

      // Crear el registro de inspección extra.
      const { data: nuevaInspeccion, error: errIns } = await supabase
        .from("inspecciones")
        .insert({
          factura_id: id,
          descripcion,
          materiales,
          tiempo_empleado: tiempoEmpleado,
          tipo: "extra",
          fecha: new Date().toISOString(),
        })
        .select()
        .single();

      if (errIns) throw errIns;

      // Guardar las referencias de las fotos asociadas al extra.
      if (fotos.length > 0) {
        const fotosInsert = fotos.map((referencia) => ({
          inspeccion_id: nuevaInspeccion.id,
          url: referencia,
        }));

        const { error: errFotos } = await supabase
          .from("inspecciones_fotos")
          .insert(fotosInsert);

        if (errFotos) {
          // Evitar dejar la inspección extra creada sin sus fotos
          // registradas cuando la inserción de fotos falla.
          const { error: rollbackError } = await supabase
            .from("inspecciones")
            .delete()
            .eq("id", nuevaInspeccion.id);

          if (rollbackError) {
            console.error(
              "No se pudo limpiar la inspección extra incompleta:",
              rollbackError
            );
          }

          throw errFotos;
        }
      }

      // Mantener los campos y el estado técnico que utilizaba el flujo.
      const { error: updateError } = await supabase
        .from("facturas")
        .update({
          descripcion,
          materiales,
          tiempo_empleado: tiempoEmpleado,
          fotos,
          estado_tecnico: "completado",
        })
        .eq("id", id);

      if (updateError) throw updateError;

      setMensaje(
        "¡Inspección guardada y enviada al administrador correctamente!"
      );

      setTimeout(() => {
        navigate("/tecnico");
      }, 1500);
    } catch (err) {
      console.error("Error al guardar:", err);

      setError(
        "Error al guardar la inspección: " +
          (err?.message || "Error desconocido")
      );
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return <div style={estilos.centrado}>Cargando datos del trabajo...</div>;
  }

  return (
    <div style={estilos.pagina}>
      <button
        onClick={() => navigate(-1)}
        style={estilos.botonVolver}
        disabled={guardando}
      >
        ← Volver
      </button>

      <h2 style={estilos.titulo}>Inspección de Trabajo</h2>

      {mensaje && <p style={estilos.ok}>{mensaje}</p>}
      {error && <p style={estilos.error}>{error}</p>}

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
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Detalla qué se ha reparado o revisado..."
          style={estilos.textarea}
          disabled={guardando}
        />

        <label style={estilos.label}>Materiales usados:</label>
        <input
          type="text"
          value={materiales}
          onChange={(e) => setMateriales(e.target.value)}
          placeholder="Ej: Tubo de PVC, silicona, tornillos..."
          style={estilos.input}
          disabled={guardando}
        />

        <label style={estilos.label}>Tiempo empleado:</label>
        <input
          type="text"
          value={tiempoEmpleado}
          onChange={(e) => setTiempoEmpleado(e.target.value)}
          placeholder="Ej: 2 horas"
          style={estilos.input}
          disabled={guardando}
        />
      </div>

      <button
        onClick={guardarYEnviarAlAdmin}
        disabled={guardando}
        style={{
          ...estilos.botonEnviar,
          opacity: guardando ? 0.6 : 1,
          cursor: guardando ? "not-allowed" : "pointer",
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
