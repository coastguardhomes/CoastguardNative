import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

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

export default function TecnicoInspeccionExtra() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [extraData, setExtraData] = useState(null);
  const [facturaData, setFacturaData] = useState(null);

  const [descripcion, setDescripcion] = useState("");
  const [materiales, setMateriales] = useState("");
  const [tiempo, setTiempo] = useState("");
  const [alerta, setAlerta] = useState(false);
  const [fotos, setFotos] = useState([]);

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    cargarDetalleExtra();
  }, [id]);

  const cargarDetalleExtra = async () => {
    try {
      setLoading(true);
      setError("");
      setMensaje("");

      /*
       * ============================================================
       * COMPROBACIÓN DE SESIÓN DEL TÉCNICO
       * ============================================================
       *
       * No modifica nada en Supabase.
       * Solo comprobamos qué usuario autenticado está utilizando
       * realmente esta pantalla.
       */
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      console.log(
        "USUARIO SESIÓN TÉCNICO:",
        user?.id
      );

      console.log(
        "ERROR SESIÓN TÉCNICO:",
        userError
      );

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error(
          "No hay una sesión autenticada de técnico."
        );
      }

      let extraEncontrado = null;
      let facturaEncontrada = null;

      /*
       * ============================================================
       * PASO 1
       * ============================================================
       *
       * El dashboard puede enviar directamente el ID del EXTRA.
       *
       * Como extras.id es UUID y facturas.id es bigint,
       * intentamos primero extras.id.
       */
      const {
        data: extraPorId,
        error: extraPorIdError
      } = await supabase
        .from("extras")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (extraPorIdError) {
        console.warn(
          "No se pudo buscar el extra directamente por ID:",
          extraPorIdError
        );
      }

      if (extraPorId) {
        extraEncontrado = extraPorId;

        if (extraPorId.factura_id) {
          const {
            data: facturaPorExtra,
            error: facturaPorExtraError
          } = await supabase
            .from("facturas")
            .select("*")
            .eq("id", extraPorId.factura_id)
            .maybeSingle();

          if (!facturaPorExtraError && facturaPorExtra) {
            facturaEncontrada = facturaPorExtra;
          }
        }
      }

      /*
       * ============================================================
       * PASO 2
       * ============================================================
       *
       * Si no encontramos el extra directamente, tratamos el ID
       * recibido como ID de factura.
       *
       * Esto mantiene compatibilidad con el dashboard actual.
       */
      if (!extraEncontrado) {
        const {
          data: factura,
          error: facturaError
        } = await supabase
          .from("facturas")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (facturaError) {
          throw facturaError;
        }

        if (factura) {
          facturaEncontrada = factura;

          /*
           * La factura ya tiene que tener su extra asociado.
           *
           * IMPORTANTE:
           * NO hacemos INSERT aquí.
           */
          const {
            data: extraPorFactura,
            error: extraPorFacturaError
          } = await supabase
            .from("extras")
            .select("*")
            .eq("factura_id", factura.id)
            .order("creado_en", {
              ascending: false
            })
            .limit(1)
            .maybeSingle();

          if (extraPorFacturaError) {
            throw extraPorFacturaError;
          }

          if (extraPorFactura) {
            extraEncontrado = extraPorFactura;
          }
        }
      }

      /*
       * ============================================================
       * PASO 3
       * ============================================================
       *
       * Si después de los dos métodos no hay extra, mostramos el
       * error real. Nunca creamos uno nuevo desde esta pantalla.
       */
      if (!extraEncontrado) {
        throw new Error(
          "No se encontró el extra asociado a este trabajo. No se ha creado ningún extra nuevo para evitar duplicados."
        );
      }

      setExtraData(extraEncontrado);
      setFacturaData(facturaEncontrada);

      setDescripcion(
        extraEncontrado.descripcion ||
          extraEncontrado.concepto ||
          facturaEncontrada?.descripcion ||
          facturaEncontrada?.concepto ||
          ""
      );

      setMateriales(
        extraEncontrado.materiales || ""
      );

      setTiempo(
        extraEncontrado.tiempo_empleado || ""
      );

      setAlerta(
        Boolean(extraEncontrado.alerta)
      );

      if (Array.isArray(extraEncontrado.fotos)) {
        setFotos(extraEncontrado.fotos);
      } else if (
        typeof extraEncontrado.fotos === "string"
      ) {
        try {
          const parsed = JSON.parse(
            extraEncontrado.fotos
          );

          if (Array.isArray(parsed)) {
            setFotos(parsed);
          } else if (
            extraEncontrado.fotos.trim()
          ) {
            setFotos([
              extraEncontrado.fotos
            ]);
          }
        } catch {
          if (extraEncontrado.fotos.trim()) {
            setFotos([
              extraEncontrado.fotos
            ]);
          }
        }
      }
    } catch (err) {
      console.error(
        "Error al cargar el trabajo extra:",
        err
      );

      setError(
        err?.message ||
          "Error al cargar los datos del trabajo extra."
      );
    } finally {
      setLoading(false);
    }
  };

  const manejarSubidaFotos = async (e) => {
    const files = e.target.files;

    if (!files || files.length === 0) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMensaje("");

      const nuevasUrls = [...fotos];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        const cleanFileName = file.name.replace(
          /[^a-zA-Z0-9.]/g,
          "_"
        );

        const fileName =
          `${Date.now()}_${Math.floor(
            Math.random() * 1000
          )}_${cleanFileName}`;

        const {
          data: uploadData,
          error: uploadError
        } = await supabase.storage
          .from("extras")
          .upload(
            fileName,
            file,
            {
              cacheControl: "3600",
              upsert: true
            }
          );

        if (uploadError) {
          console.error(
            "Error al subir imagen:",
            uploadError
          );

          throw new Error(
            uploadError.message ||
              "Error al subir la imagen."
          );
        }

        const {
          data: publicUrlData
        } = supabase.storage
          .from("extras")
          .getPublicUrl(
            uploadData?.path ||
              fileName
          );

        if (publicUrlData?.publicUrl) {
          nuevasUrls.push(
            publicUrlData.publicUrl
          );
        }
      }

      setFotos(nuevasUrls);

      setMensaje(
        "¡Fotos subidas con éxito!"
      );
    } catch (err) {
      console.error(
        "Error detallado al subir fotos:",
        err
      );

      setError(
        `No se pudieron subir las fotos (${
          err?.message ||
          "Error de red o permisos"
        }).`
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!extraData?.id) {
      setError(
        "No hay un extra válido para actualizar."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMensaje("");

      /*
       * ============================================================
       * ACTUALIZAMOS ÚNICAMENTE EL EXTRA EXISTENTE
       * ============================================================
       *
       * No se crea ningún registro nuevo.
       *
       * No tocamos:
       * - precio
       * - IVA
       * - total
       * - factura
       * - Stripe
       * - FacturaDirecta
       */
      const extraPayload = {
        descripcion:
          descripcion ||
          extraData.descripcion ||
          "Trabajo extra",

        materiales:
          materiales || null,

        tiempo_empleado:
          tiempo || null,

        fotos: fotos,

        estado_tecnico:
          "completado",

        estado_admin:
          "pendiente",

        alerta:
          alerta
      };

      if (alerta) {
        extraPayload.alerta_vista = false;
      }

      const {
        data: extraActualizado,
        error: extraUpdateError
      } = await supabase
        .from("extras")
        .update(extraPayload)
        .eq("id", extraData.id)
        .select("*")
        .maybeSingle();

      if (extraUpdateError) {
        throw extraUpdateError;
      }

      if (!extraActualizado) {
        throw new Error(
          "El extra existe, pero no se ha podido actualizar con la sesión actual del técnico. Comprueba que el técnico esté correctamente asignado a este extra."
        );
      }

      /*
       * Mantenemos también los datos técnicos de la factura.
       *
       * NO modificamos ningún dato económico.
       */
      if (facturaData?.id) {
        const facturaPayload = {
          descripcion:
            descripcion ||
            facturaData.descripcion ||
            facturaData.concepto ||
            null,

          materiales:
            materiales || null,

          tiempo_empleado:
            tiempo || null,

          fotos:
            fotos,

          estado_tecnico:
            "completado",

          alerta:
            alerta
        };

        if (alerta) {
          facturaPayload.alerta_vista = false;
        }

        const {
          error: facturaUpdateError
        } = await supabase
          .from("facturas")
          .update(facturaPayload)
          .eq("id", facturaData.id);

        if (facturaUpdateError) {
          throw facturaUpdateError;
        }
      }

      alert(
        "Inspección enviada correctamente al administrador."
      );

      navigate("/tecnico");
    } catch (err) {
      console.error(
        "Error al enviar la inspección:",
        err
      );

      setError(
        "Error al enviar la inspección: " +
          (err?.message || "")
      );
    } finally {
      setSaving(false);
    }
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
            onClick={() =>
              navigate("/tecnico")
            }
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
              backgroundColor:
                "rgba(16, 185, 129, 0.15)",
              border:
                "1px solid rgba(16, 185, 129, 0.4)",
              padding: "12px",
              borderRadius: "10px",
              fontSize: "12px",
              fontWeight: "700",
              color: "#34d399",
              textAlign: "center"
            }}
          >
            {mensaje}
          </div>
        )}

        {error && (
          <div
            style={{
              backgroundColor:
                "rgba(239, 68, 68, 0.15)",
              border:
                "1px solid rgba(239, 68, 68, 0.4)",
              padding: "12px",
              borderRadius: "10px",
              fontSize: "12px",
              fontWeight: "700",
              color: "#ef4444",
              textAlign: "center"
            }}
          >
            {error}
          </div>
        )}

        {extraData && (
          <div
            style={{
              backgroundColor:
                "rgba(11, 19, 32, 0.9)",
              padding: "14px",
              borderRadius: "12px",
              border: BORDE_DORADO_FINO
            }}
          >
            <p
              style={{
                fontSize: "12px",
                margin: "4px 0",
                color: "#ccc"
              }}
            >
              <strong
                style={{
                  color: COLOR_DORADO
                }}
              >
                Extra:
              </strong>{" "}
              {extraData.descripcion ||
                extraData.concepto ||
                "Trabajo extra"}
            </p>

            {facturaData?.id && (
              <p
                style={{
                  fontSize: "12px",
                  margin: "4px 0",
                  color: "#ccc"
                }}
              >
                <strong
                  style={{
                    color: COLOR_DORADO
                  }}
                >
                  Factura:
                </strong>{" "}
                #{facturaData.id}
              </p>
            )}

            <p
              style={{
                fontSize: "11px",
                margin: "6px 0 0",
                color: "#777"
              }}
            >
              ID extra: {extraData.id}
            </p>
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: "10px"
          }}
        >
          <label
            style={{
              flex: 1,
              textAlign: "center",
              background:
                "linear-gradient(135deg, #f59e0b 0%, #b45309 100%)",
              color: "#fff",
              padding: "12px",
              borderRadius: "12px",
              fontWeight: "900",
              fontSize: "12px",
              cursor: "pointer",
              border: BORDE_DORADO_FINO,
              boxShadow:
                "0 4px 15px rgba(245, 158, 11, 0.3)",
              textTransform: "uppercase"
            }}
          >
            📸 Hacer Foto

            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={manejarSubidaFotos}
              disabled={saving}
              style={{
                display: "none"
              }}
            />
          </label>

          <label
            style={{
              flex: 1,
              textAlign: "center",
              background:
                "linear-gradient(135deg, #38bdf8 0%, #1e3a8a 100%)",
              color: "#fff",
              padding: "12px",
              borderRadius: "12px",
              fontWeight: "900",
              fontSize: "12px",
              cursor: "pointer",
              border: BORDE_DORADO_FINO,
              boxShadow:
                "0 4px 15px rgba(56, 189, 248, 0.3)",
              textTransform: "uppercase"
            }}
          >
            🖼️ Galería

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={manejarSubidaFotos}
              disabled={saving}
              style={{
                display: "none"
              }}
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
            {fotos.map((url, index) => (
              <img
                key={index}
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
            ))}
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
          <div
            style={{
              background:
                "rgba(11, 19, 32, 0.9)",
              padding: "12px 14px",
              borderRadius: "12px",
              border: BORDE_DORADO_FINO,
              display: "flex",
              alignItems: "center"
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                width: "100%"
              }}
            >
              <input
                type="checkbox"
                checked={alerta}
                onChange={(e) =>
                  setAlerta(
                    e.target.checked
                  )
                }
                style={{
                  width: "20px",
                  height: "20px",
                  marginRight: "12px",
                  cursor: "pointer",
                  accentColor: "#ef4444"
                }}
              />

              <span
                style={{
                  fontSize: "13px",
                  color: "#ef4444",
                  fontWeight: "800",
                  textTransform: "uppercase",
                  letterSpacing: "0.3px"
                }}
              >
                ⚠️ Marcar como ALERTA / Urgencia importante
              </span>
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
                fontWeight: "700",
                textTransform: "uppercase"
              }}
            >
              Descripción del trabajo realizado:
            </label>

            <textarea
              style={{
                backgroundColor:
                  "rgba(11, 19, 32, 0.8)",
                border: BORDE_DORADO_FINO,
                borderRadius: "12px",
                padding: "12px",
                color: "#fff",
                fontSize: "13px",
                resize: "vertical",
                outline: "none",
                boxSizing: "border-box"
              }}
              rows="4"
              value={descripcion}
              onChange={(e) =>
                setDescripcion(
                  e.target.value
                )
              }
              placeholder="Detalla qué se ha reparado o revisado..."
              required
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
                fontWeight: "700",
                textTransform: "uppercase"
              }}
            >
              Materiales usados:
            </label>

            <input
              type="text"
              style={{
                backgroundColor:
                  "rgba(11, 19, 32, 0.8)",
                border: BORDE_DORADO_FINO,
                borderRadius: "12px",
                padding: "12px",
                color: "#fff",
                fontSize: "13px",
                outline: "none",
                boxSizing: "border-box"
              }}
              value={materiales}
              onChange={(e) =>
                setMateriales(
                  e.target.value
                )
              }
              placeholder="Ej: Tubo de PVC, silicona, tornillos..."
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
                fontWeight: "700",
                textTransform: "uppercase"
              }}
            >
              Tiempo empleado:
            </label>

            <input
              type="text"
              style={{
                backgroundColor:
                  "rgba(11, 19, 32, 0.8)",
                border: BORDE_DORADO_FINO,
                borderRadius: "12px",
                padding: "12px",
                color: "#fff",
                fontSize: "13px",
                outline: "none",
                boxSizing: "border-box"
              }}
              value={tiempo}
              onChange={(e) =>
                setTiempo(
                  e.target.value
                )
              }
              placeholder="Ej: 2 horas"
            />
          </div>

          <button
            type="submit"
            disabled={
              saving || !extraData
            }
            style={{
              background:
                saving || !extraData
                  ? "rgba(255,255,255,0.08)"
                  : "linear-gradient(135deg, #10b981 0%, #047857 100%)",

              color:
                saving || !extraData
                  ? "#64748b"
                  : "#fff",

              border:
                saving || !extraData
                  ? BORDE_DORADO_FINO
                  : "1px solid rgba(16, 185, 129, 0.6)",

              padding: "14px",
              borderRadius: "16px",
              fontSize: "14px",
              fontWeight: "900",

              cursor:
                saving || !extraData
                  ? "not-allowed"
                  : "pointer",

              marginTop: "10px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",

              boxShadow:
                saving || !extraData
                  ? "none"
                  : "0 4px 15px rgba(16, 185, 129, 0.3)",

              transition: "all 0.2s ease"
            }}
          >
            {saving
              ? "Enviando..."
              : "✅ Enviar Inspección al Administrador"}
          </button>
        </form>
      </div>
    </div>
  );
}
