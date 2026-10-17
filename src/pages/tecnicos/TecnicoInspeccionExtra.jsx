
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { resolverUrlPdfSegura } from "../../lib/urlPdf.js";

const COLOR_DORADO = "#e0b034";
const FONDO_PRINCIPAL = "#030509";
const FONDO_TARJETA =
  "linear-gradient(145deg, #0b1320 0%, #04070d 100%)";
const BORDE_DORADO_FINO =
  "1px solid rgba(224, 176, 52, 0.4)";
const SOMBRA_LUXURY =
  "0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 20px rgba(224, 176, 52, 0.12)";

const TEXTO_DORADO_BRILLO = {
  color: COLOR_DORADO,
  textShadow: "0 0 12px rgba(224, 176, 52, 0.6)"
};

const BUCKET_FOTOS = "extras";
const CARPETA_FOTOS = "fotos";

function obtenerReferenciaFoto(foto) {
  if (typeof foto === "string") return foto.trim();

  if (foto && typeof foto === "object") {
    return (
      foto.url_foto ||
      foto.url ||
      foto.path ||
      foto.foto_url ||
      foto.archivo ||
      foto.url_storage_o_path ||
      ""
    );
  }

  return "";
}

function obtenerBucketYReferencia(valor) {
  const referencia = obtenerReferenciaFoto(valor);
  if (!referencia) return null;

  if (
    referencia.startsWith("data:") ||
    referencia.startsWith("blob:")
  ) {
    return { bucket: null, referencia };
  }

  const coincidencia = referencia.match(
    /\/storage\/v1\/object\/(?:public|sign|authenticated)\/([^/]+)\/(.+?)(?:\?.*)?$/i
  );

  if (coincidencia) {
    try {
      return {
        bucket: decodeURIComponent(coincidencia[1]),
        referencia: coincidencia[2]
          .split("/")
          .map((segmento) => decodeURIComponent(segmento))
          .join("/")
      };
    } catch {
      return null;
    }
  }

  let ruta = referencia.replace(/^\/+/, "");

  // Referencias antiguas que incluyen el nombre del bucket.
  for (const bucket of ["facturas", "extras"]) {
    if (ruta.startsWith(`${bucket}/`)) {
      return {
        bucket,
        referencia: ruta.slice(bucket.length + 1)
      };
    }
  }

  // Las fotos nuevas se guardan dentro de extras/fotos/.
  if (ruta.startsWith("fotos/")) {
    return { bucket: "extras", referencia: ruta };
  }

  // Compatibilidad con rutas antiguas de inspecciones.
  if (ruta.startsWith("inspecciones/")) {
    return { bucket: "facturas", referencia: ruta };
  }

  // Referencias antiguas sin bucket.
  return { bucket: "extras", referencia: ruta };
}

function normalizarFotos(valor) {
  if (Array.isArray(valor)) return valor;

  if (typeof valor !== "string" || !valor.trim()) {
    return [];
  }

  try {
    const resultado = JSON.parse(valor);
    return Array.isArray(resultado) ? resultado : [valor];
  } catch {
    return [valor];
  }
}

export default function TecnicoInspeccionExtra() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [extraData, setExtraData] = useState(null);
  const [facturaData, setFacturaData] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [viviendas, setViviendas] = useState([]);
  const [clienteId, setClienteId] = useState("");
  const [viviendaId, setViviendaId] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [materiales, setMateriales] = useState("");
  const [tiempo, setTiempo] = useState("");
  const [alerta, setAlerta] = useState(false);
  const [fotos, setFotos] = useState([]);
  const [fotosUrlsFirmadas, setFotosUrlsFirmadas] = useState([]);
  const [previsualizacionesLocales, setPrevisualizacionesLocales] =
    useState({});
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const cargarClientes = async () => {
    const { data, error: consultaError } = await supabase
      .from("clientes")
      .select("id, nombre, direccion, email")
      .order("nombre");

    if (consultaError) throw consultaError;
    setClientes(data || []);
  };

  const cargarViviendas = async (nuevoClienteId) => {
    setViviendas([]);
    setViviendaId("");

    if (!nuevoClienteId) return [];

    const { data, error: consultaError } = await supabase
      .from("viviendas")
      .select("id, direccion, tecnico_id, cliente_id")
      .eq("cliente_id", nuevoClienteId)
      .order("direccion");

    if (consultaError) throw consultaError;

    setViviendas(data || []);

    if ((data || []).length === 1) {
      setViviendaId(String(data[0].id));
    }

    return data || [];
  };

  const cargarDetalleExtra = async () => {
    try {
      setLoading(true);
      setError("");
      setMensaje("");

      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) {
        throw new Error("No hay una sesión autenticada.");
      }

      await cargarClientes();

      const {
        data: factura,
        error: facturaError
      } = await supabase
        .from("facturas")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (facturaError) throw facturaError;
      setFacturaData(factura || null);

      let extra = null;

      if (factura?.id) {
        const {
          data: extrasPorFactura,
          error: extrasError
        } = await supabase
          .from("extras")
          .select("*")
          .eq("factura_id", factura.id)
          .order("creado_en", { ascending: false });

        if (extrasError) throw extrasError;
        if (extrasPorFactura?.length) {
          extra = extrasPorFactura[0];
        }
      }

      setExtraData(extra);

      const clienteSeleccionado =
        extra?.cliente_id || factura?.cliente_id || "";

      setClienteId(
        clienteSeleccionado ? String(clienteSeleccionado) : ""
      );

      if (clienteSeleccionado) {
        await cargarViviendas(clienteSeleccionado);
      }

      const viviendaSeleccionada =
        extra?.vivienda_id || factura?.vivienda_id || "";

      setViviendaId(
        viviendaSeleccionada ? String(viviendaSeleccionada) : ""
      );

      setDescripcion(
        extra?.descripcion ||
        extra?.concepto ||
        factura?.descripcion ||
        factura?.concepto ||
        ""
      );

      setMateriales(extra?.materiales || "");
      setTiempo(extra?.tiempo_empleado || "");
      setAlerta(Boolean(extra?.alerta));
      setFotos(normalizarFotos(extra?.fotos));
    } catch (err) {
      console.error("Error cargando el trabajo extra:", err);
      setError(
        err?.message || "No se pudieron cargar los datos del extra."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDetalleExtra();
  }, [id]);

  // Las rutas guardadas en la base de datos se convierten en URLs
  // firmadas para mostrar imágenes del bucket privado.
  useEffect(() => {
    let cancelado = false;

    const resolverFotos = async () => {
      setFotosUrlsFirmadas([]);

      if (!Array.isArray(fotos) || fotos.length === 0) return;

      const urls = await Promise.all(
        fotos.map(async (foto, index) => {
          const referencia = obtenerBucketYReferencia(foto);
          if (!referencia) return null;

          if (
            referencia.referencia.startsWith("data:") ||
            referencia.referencia.startsWith("blob:")
          ) {
            return referencia.referencia;
          }

          if (!referencia.bucket) return null;

          try {
            return (
              await resolverUrlPdfSegura(
                referencia.referencia,
                referencia.bucket,
                3600
              )
            ) || null;
          } catch (err) {
            console.error(
              `Error resolviendo la foto ${index + 1}:`,
              err
            );
            return null;
          }
        })
      );

      if (!cancelado) {
        setFotosUrlsFirmadas(urls);
      }
    };

    resolverFotos();

    return () => {
      cancelado = true;
    };
  }, [fotos]);

  // Liberar las vistas previas temporales cuando se desmonta la pantalla.
  useEffect(() => {
    return () => {
      Object.values(previsualizacionesLocales).forEach((url) => {
        if (typeof url === "string" && url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [previsualizacionesLocales]);

  const manejarCambioCliente = async (e) => {
    const nuevoClienteId = e.target.value;
    setClienteId(nuevoClienteId);
    setViviendaId("");
    setViviendas([]);
    setError("");

    if (!nuevoClienteId) return;

    try {
      setSaving(true);
      await cargarViviendas(nuevoClienteId);
    } catch (err) {
      setError(
        err?.message || "No se pudieron cargar las viviendas."
      );
    } finally {
      setSaving(false);
    }
  };

  const manejarSubidaFotos = async (e) => {
    const archivos = Array.from(e.target.files || []);
    if (!archivos.length) return;

    try {
      setSaving(true);
      setError("");
      setMensaje("");

      const nuevasFotos = [...fotos];
      const nuevasPrevisualizaciones = {};

      for (const archivo of archivos) {
        if (!archivo.type.startsWith("image/")) {
          throw new Error(
            `El archivo "${archivo.name}" no es una imagen válida.`
          );
        }

        const nombreLimpio = archivo.name.replace(
          /[^a-zA-Z0-9._-]/g,
          "_"
        );

        const nombreArchivo =
          `${Date.now()}_${Math.floor(Math.random() * 100000)}_${nombreLimpio}`;

        const ruta = `${CARPETA_FOTOS}/${nombreArchivo}`;

        const { data, error: uploadError } = await supabase.storage
          .from(BUCKET_FOTOS)
          .upload(ruta, archivo, {
            cacheControl: "3600",
            upsert: false,
            contentType: archivo.type
          });

        if (uploadError) throw uploadError;

        // Se guarda la ruta permanente, nunca una URL firmada temporal.
        const rutaGuardada = data?.path || ruta;
        nuevasFotos.push(rutaGuardada);

        // Vista previa local: funciona incluso antes de que exista
        // el registro del extra al que la política privada vincula la foto.
        nuevasPrevisualizaciones[rutaGuardada] =
          URL.createObjectURL(archivo);
      }

      // Si el extra ya existe, guardar las rutas inmediatamente.
      // No esperar al botón final para persistir la evidencia fotográfica.
      if (extraData?.id) {
        const {
          data: extraConFotos,
          error: guardarFotosError
        } = await supabase
          .from("extras")
          .update({ fotos: nuevasFotos })
          .eq("id", extraData.id)
          .select("id, fotos")
          .maybeSingle();

        if (guardarFotosError) throw guardarFotosError;

        if (!extraConFotos) {
          throw new Error(
            "Las fotos se subieron, pero no se pudieron guardar en el extra. Comprueba los permisos del técnico."
          );
        }

        setExtraData((actual) =>
          actual
            ? {
                ...actual,
                fotos: extraConFotos.fotos || nuevasFotos
              }
            : actual
        );
      }

      setPrevisualizacionesLocales((actuales) => ({
        ...actuales,
        ...nuevasPrevisualizaciones
      }));

      setFotos(nuevasFotos);

      setMensaje(
        extraData?.id
          ? "Fotografías subidas y guardadas correctamente."
          : "Fotografías subidas. Pulsa «Completar inspección y enviar» para guardarlas en el nuevo extra."
      );
    } catch (err) {
      console.error("Error subiendo fotografías:", err);
      setError(
        `No se pudieron subir las fotos: ${
          err?.message || "Error de permisos o conexión"
        }.`
      );
    } finally {
      setSaving(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");

    if (!clienteId) {
      setError("Selecciona el cliente.");
      return;
    }

    if (!viviendaId) {
      setError("Selecciona la vivienda.");
      return;
    }

    const vivienda = viviendas.find(
      (v) => String(v.id) === String(viviendaId)
    );

    if (!vivienda) {
      setError("No se pudo localizar la vivienda seleccionada.");
      return;
    }

    if (String(vivienda.cliente_id) !== String(clienteId)) {
      setError("La vivienda no pertenece al cliente seleccionado.");
      return;
    }

    const cliente = clientes.find(
      (c) => String(c.id) === String(clienteId)
    );

    if (!cliente) {
      setError("No se pudo localizar el cliente seleccionado.");
      return;
    }

    try {
      setSaving(true);

      const extraPayload = {
        descripcion:
          descripcion || extraData?.descripcion || "Trabajo extra",
        materiales: materiales || null,
        tiempo_empleado: tiempo || null,
        fotos,
        estado_tecnico: "completado",
        alerta
      };

      if (alerta) {
        extraPayload.alerta_vista = false;
      }

      if (extraData?.id) {
        const {
          data: extraActualizado,
          error: actualizarExtraError
        } = await supabase
          .from("extras")
          .update(extraPayload)
          .eq("id", extraData.id)
          .select("*")
          .maybeSingle();

        if (actualizarExtraError) throw actualizarExtraError;

        if (!extraActualizado) {
          throw new Error(
            "No se pudo actualizar el extra. Comprueba los permisos del técnico."
          );
        }

        setExtraData(extraActualizado);

        /*
         * Actualizamos únicamente el estado técnico de la factura.
         * No tocamos importes, IVA, totales ni estado de pago.
         */
        const facturaId =
          extraActualizado.factura_id || facturaData?.id;

        if (facturaId) {
          const {
            error: actualizarFacturaError
          } = await supabase
            .from("facturas")
            .update({ estado_tecnico: "completado" })
            .eq("id", facturaId);

          if (actualizarFacturaError) {
            throw new Error(
              "El extra se guardó, pero no se pudo actualizar el estado técnico de la factura. " +
              actualizarFacturaError.message
            );
          }
        }

        alert("Inspección actualizada y enviada al administrador.");
        navigate("/tecnico");
        return;
      }

      const nuevoExtraPayload = {
        ...extraPayload,
        cliente_id: clienteId,
        vivienda_id: viviendaId,
        tecnico_id: vivienda.tecnico_id,
        cliente_email: cliente.email || null,
        estado: "pendiente",
        estado_admin: "pendiente",
        direccion: vivienda.direccion || cliente.direccion || null,
        creado_en: new Date().toISOString()
      };

      if (facturaData?.id) {
        nuevoExtraPayload.factura_id = facturaData.id;
      }

      const {
        data: nuevoExtra,
        error: crearError
      } = await supabase
        .from("extras")
        .insert(nuevoExtraPayload)
        .select("*")
        .maybeSingle();

      if (crearError) throw crearError;

      if (!nuevoExtra) {
        throw new Error("No se pudo recuperar el extra creado.");
      }

      setExtraData(nuevoExtra);

      if (facturaData?.id) {
        const {
          error: facturaUpdateError
        } = await supabase
          .from("facturas")
          .update({ estado_tecnico: "completado" })
          .eq("id", facturaData.id);

        if (facturaUpdateError) {
          throw new Error(
            "El extra se creó, pero no se pudo actualizar el estado técnico de la factura. " +
            facturaUpdateError.message
          );
        }
      }

      alert("Extra creado y enviado al administrador para su valoración.");
      navigate("/tecnico");
    } catch (err) {
      console.error("Error guardando la inspección:", err);
      setError(
        "Error al guardar la inspección: " +
        (err?.message || "Error desconocido")
      );
    } finally {
      setSaving(false);
    }
  };

  const caja = {
    background: "rgba(11, 19, 32, 0.9)",
    padding: "14px",
    borderRadius: "12px",
    border: BORDE_DORADO_FINO
  };

  if (loading) {
    return (
      <div
        style={{
          backgroundColor: FONDO_PRINCIPAL,
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "Inter, sans-serif"
        }}
      >
        <h3 style={TEXTO_DORADO_BRILLO}>
          Cargando datos del trabajo...
        </h3>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: FONDO_PRINCIPAL,
        minHeight: "100vh",
        padding: "16px",
        display: "flex",
        justifyContent: "center",
        fontFamily: "Inter, sans-serif",
        boxSizing: "border-box"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          background: FONDO_TARJETA,
          border: BORDE_DORADO_FINO,
          borderRadius: "16px",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          boxShadow: SOMBRA_LUXURY,
          boxSizing: "border-box"
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: BORDE_DORADO_FINO,
            paddingBottom: "14px"
          }}
        >
          <button
            type="button"
            onClick={() => navigate("/tecnico")}
            style={{
              background: "transparent",
              border: BORDE_DORADO_FINO,
              color: COLOR_DORADO,
              padding: "6px 12px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "11px",
              fontWeight: "700"
            }}
          >
            ← Volver
          </button>

          <h2
            style={{
              ...TEXTO_DORADO_BRILLO,
              fontSize: "18px",
              fontWeight: "900",
              margin: 0,
              textTransform: "uppercase"
            }}
          >
            Inspección de Extra
          </h2>
        </div>

        {mensaje && (
          <div
            style={{
              backgroundColor: "rgba(16,185,129,0.15)",
              border: "1px solid rgba(16,185,129,0.4)",
              padding: "12px",
              borderRadius: "10px",
              color: "#34d399",
              fontSize: "12px",
              fontWeight: "700",
              textAlign: "center"
            }}
          >
            {mensaje}
          </div>
        )}

        {error && (
          <div
            style={{
              backgroundColor: "rgba(239,68,68,0.15)",
              border: "1px solid rgba(239,68,68,0.4)",
              padding: "12px",
              borderRadius: "10px",
              color: "#ef4444",
              fontSize: "12px",
              fontWeight: "700",
              textAlign: "center"
            }}
          >
            {error}
          </div>
        )}

        <div style={caja}>
          <label
            style={{
              display: "block",
              fontSize: "12px",
              color: COLOR_DORADO,
              fontWeight: "700",
              marginBottom: "7px"
            }}
          >
            Cliente
          </label>

          <select
            value={clienteId}
            onChange={manejarCambioCliente}
            disabled={saving}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: BORDE_DORADO_FINO,
              background: "#101a29",
              color: "#fff",
              fontSize: "13px",
              boxSizing: "border-box"
            }}
          >
            <option value="">-- Selecciona cliente --</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nombre}
                {cliente.direccion ? ` — ${cliente.direccion}` : ""}
              </option>
            ))}
          </select>
        </div>

        <div style={caja}>
          <label
            style={{
              display: "block",
              fontSize: "12px",
              color: COLOR_DORADO,
              fontWeight: "700",
              marginBottom: "7px"
            }}
          >
            Vivienda
          </label>

          <select
            value={viviendaId}
            onChange={(e) => setViviendaId(e.target.value)}
            disabled={!clienteId || saving}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: BORDE_DORADO_FINO,
              background: "#101a29",
              color: "#fff",
              fontSize: "13px",
              boxSizing: "border-box"
            }}
          >
            <option value="">
              {!clienteId
                ? "-- Selecciona primero un cliente --"
                : "-- Selecciona vivienda --"}
            </option>

            {viviendas.map((vivienda) => (
              <option key={vivienda.id} value={vivienda.id}>
                {vivienda.direccion || `Vivienda #${vivienda.id}`}
              </option>
            ))}
          </select>

          {clienteId && viviendas.length === 0 && (
            <p style={{ color: "#f59e0b", fontSize: "12px" }}>
              No hay viviendas disponibles para este cliente.
            </p>
          )}
        </div>

        <div style={caja}>
          <p style={{ color: "#ccc", fontSize: "12px" }}>
            <strong style={{ color: COLOR_DORADO }}>Extra:</strong>{" "}
            {extraData?.descripcion ||
              descripcion ||
              "Nuevo trabajo extra"}
          </p>

          {facturaData?.id && (
            <p style={{ color: "#ccc", fontSize: "12px" }}>
              <strong style={{ color: COLOR_DORADO }}>Factura:</strong>{" "}
              #{facturaData.id}
            </p>
          )}

          {extraData?.id && (
            <p style={{ color: "#777", fontSize: "11px" }}>
              ID extra: {extraData.id}
            </p>
          )}
        </div>

        <div style={caja}>
          <p
            style={{
              fontSize: "12px",
              color: COLOR_DORADO,
              fontWeight: "700",
              margin: "0 0 7px"
            }}
          >
            VALORACIÓN ECONÓMICA
          </p>

          <p
            style={{
              color: "#ccc",
              fontSize: "13px",
              lineHeight: 1.5
            }}
          >
            El precio, el IVA y el total de la factura los gestiona el
            administrador. El técnico registra únicamente los datos
            de la inspección.
          </p>

          {extraData?.precio !== null &&
            extraData?.precio !== undefined && (
              <p style={{ color: "#888", fontSize: "12px" }}>
                Precio registrado:{" "}
                {Number(extraData.precio).toLocaleString("es-ES", {
                  style: "currency",
                  currency: "EUR"
                })}
              </p>
            )}
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <label
            style={{
              flex: 1,
              textAlign: "center",
              background:
                "linear-gradient(135deg,#f59e0b 0%,#b45309 100%)",
              color: "#fff",
              padding: "12px",
              borderRadius: "12px",
              fontWeight: "900",
              fontSize: "12px",
              cursor: "pointer",
              border: BORDE_DORADO_FINO
            }}
          >
            📸 Hacer Foto
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={manejarSubidaFotos}
              disabled={saving}
              style={{ display: "none" }}
            />
          </label>

          <label
            style={{
              flex: 1,
              textAlign: "center",
              background:
                "linear-gradient(135deg,#38bdf8 0%,#1e3a8a 100%)",
              color: "#fff",
              padding: "12px",
              borderRadius: "12px",
              fontWeight: "900",
              fontSize: "12px",
              cursor: "pointer",
              border: BORDE_DORADO_FINO
            }}
          >
            🖼️ Galería
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={manejarSubidaFotos}
              disabled={saving}
              style={{ display: "none" }}
            />
          </label>
        </div>

        {fotos.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap"
            }}
          >
            {fotos.map((foto, index) => {
              const referenciaFoto = obtenerReferenciaFoto(foto);
              const url =
                fotosUrlsFirmadas[index] ||
                previsualizacionesLocales[referenciaFoto] ||
                null;

              return url ? (
                <img
                  key={`${index}-${referenciaFoto}`}
                  src={url}
                  alt={`Evidencia ${index + 1}`}
                  style={{
                    width: "60px",
                    height: "60px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    border: BORDE_DORADO_FINO
                  }}
                />
              ) : (
                <div
                  key={`${index}-${referenciaFoto}`}
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "8px",
                    border: BORDE_DORADO_FINO,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#94a3b8",
                    fontSize: "10px"
                  }}
                >
                  Cargando...
                </div>
              );
            })}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px"
          }}
        >
          <div style={caja}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                color: "#ef4444",
                fontSize: "13px",
                fontWeight: "800"
              }}
            >
              <input
                type="checkbox"
                checked={alerta}
                onChange={(e) => setAlerta(e.target.checked)}
                style={{
                  width: "20px",
                  height: "20px",
                  marginRight: "12px",
                  accentColor: "#ef4444"
                }}
              />
              ⚠️ Marcar como ALERTA / Urgencia importante
            </label>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "6px"
            }}
          >
            <label
              style={{
                fontSize: "12px",
                color: COLOR_DORADO,
                fontWeight: "700"
              }}
            >
              Descripción del trabajo realizado
            </label>

            <textarea
              rows="4"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Detalla qué se ha reparado o revisado..."
              required
              style={{
                backgroundColor: "rgba(11,19,32,0.8)",
                border: BORDE_DORADO_FINO,
                borderRadius: "12px",
                padding: "12px",
                color: "#fff",
                fontSize: "13px",
                resize: "vertical",
                boxSizing: "border-box"
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "6px"
            }}
          >
            <label
              style={{
                fontSize: "12px",
                color: COLOR_DORADO,
                fontWeight: "700"
              }}
            >
              Materiales usados
            </label>

            <input
              type="text"
              value={materiales}
              onChange={(e) => setMateriales(e.target.value)}
              placeholder="Ej: Tubo de PVC, silicona, tornillos..."
              style={{
                backgroundColor: "rgba(11,19,32,0.8)",
                border: BORDE_DORADO_FINO,
                borderRadius: "12px",
                padding: "12px",
                color: "#fff",
                fontSize: "13px",
                boxSizing: "border-box"
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "6px"
            }}
          >
            <label
              style={{
                fontSize: "12px",
                color: COLOR_DORADO,
                fontWeight: "700"
              }}
            >
              Tiempo empleado
            </label>

            <input
              type="text"
              value={tiempo}
              onChange={(e) => setTiempo(e.target.value)}
              placeholder="Ej: 2 horas"
              style={{
                backgroundColor: "rgba(11,19,32,0.8)",
                border: BORDE_DORADO_FINO,
                borderRadius: "12px",
                padding: "12px",
                color: "#fff",
                fontSize: "13px",
                boxSizing: "border-box"
              }}
            />
          </div>

          <button
            type="submit"
            disabled={saving || !clienteId || !viviendaId}
            style={{
              background:
                saving || !clienteId || !viviendaId
                  ? "rgba(255,255,255,0.08)"
                  : "linear-gradient(135deg,#10b981 0%,#047857 100%)",
              color:
                saving || !clienteId || !viviendaId
                  ? "#64748b"
                  : "#fff",
              border: BORDE_DORADO_FINO,
              padding: "14px",
              borderRadius: "16px",
              fontSize: "14px",
              fontWeight: "900",
              cursor:
                saving || !clienteId || !viviendaId
                  ? "not-allowed"
                  : "pointer",
              marginTop: "10px",
              textTransform: "uppercase"
            }}
          >
            {saving
              ? "Guardando..."
              : extraData
              ? "✅ Actualizar inspección y enviar"
              : "✅ Completar inspección y enviar"}
          </button>
        </form>
      </div>
    </div>
  );
}
