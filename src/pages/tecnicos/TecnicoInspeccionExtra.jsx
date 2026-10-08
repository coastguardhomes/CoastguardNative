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

  const [clientes, setClientes] = useState([]);
  const [viviendas, setViviendas] = useState([]);

  const [clienteId, setClienteId] = useState("");
  const [viviendaId, setViviendaId] = useState("");

  const [descripcion, setDescripcion] = useState("");
  const [materiales, setMateriales] = useState("");
  const [tiempo, setTiempo] = useState("");
  const [precio, setPrecio] = useState("");

  const [alerta, setAlerta] = useState(false);
  const [fotos, setFotos] = useState([]);

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const cargarClientes = async () => {
    const { data, error: clientesError } = await supabase
      .from("clientes")
      .select("id, nombre, direccion, email")
      .order("nombre");

    if (clientesError) {
      console.error("Error cargando clientes:", clientesError);
      throw clientesError;
    }

    setClientes(data || []);
  };

  const cargarViviendas = async (nuevoClienteId) => {
    setViviendas([]);
    setViviendaId("");

    if (!nuevoClienteId) {
      return [];
    }

    const {
      data,
      error: viviendasError
    } = await supabase
      .from("viviendas")
      .select("id, direccion, tecnico_id, cliente_id")
      .eq("cliente_id", nuevoClienteId)
      .order("direccion");

    if (viviendasError) {
      console.error(
        "Error cargando viviendas:",
        viviendasError
      );
      throw viviendasError;
    }

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

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error(
          "No hay una sesión autenticada de técnico."
        );
      }

      await cargarClientes();

      let factura = null;

      const {
        data: facturaEncontrada,
        error: facturaError
      } = await supabase
        .from("facturas")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (facturaError) {
        console.warn(
          "No se pudo consultar la factura:",
          facturaError
        );
      } else {
        factura = facturaEncontrada || null;
      }

      setFacturaData(factura);

      let extraEncontrado = null;

      if (factura?.id) {
        const {
          data: extrasPorFactura,
          error: extrasPorFacturaError
        } = await supabase
          .from("extras")
          .select("*")
          .eq("factura_id", factura.id)
          .order("creado_en", {
            ascending: false
          });

        if (extrasPorFacturaError) {
          throw extrasPorFacturaError;
        }

        if (
          extrasPorFactura &&
          extrasPorFactura.length > 0
        ) {
          extraEncontrado = extrasPorFactura[0];
        }
      }

      if (extraEncontrado) {
        setExtraData(extraEncontrado);

        const clienteSeleccionado =
          extraEncontrado.cliente_id
            ? String(extraEncontrado.cliente_id)
            : "";

        setClienteId(clienteSeleccionado);

        /*
         * Primero cargamos las viviendas porque esta función
         * limpia viviendaId. Después restauramos la vivienda
         * que pertenece al extra.
         */
        await cargarViviendas(
          extraEncontrado.cliente_id
        );

        setViviendaId(
          extraEncontrado.vivienda_id
            ? String(extraEncontrado.vivienda_id)
            : ""
        );

        setDescripcion(
          extraEncontrado.descripcion ||
            extraEncontrado.concepto ||
            factura?.descripcion ||
            factura?.concepto ||
            ""
        );

        setMateriales(
          extraEncontrado.materiales || ""
        );

        setTiempo(
          extraEncontrado.tiempo_empleado || ""
        );

        setPrecio(
          extraEncontrado.precio !== null &&
            extraEncontrado.precio !== undefined
            ? String(extraEncontrado.precio)
            : ""
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

        return;
      }

      setExtraData(null);

      if (factura?.cliente_id) {
        setClienteId(
          String(factura.cliente_id)
        );

        await cargarViviendas(
          factura.cliente_id
        );
      }

      if (factura?.vivienda_id) {
        setViviendaId(
          String(factura.vivienda_id)
        );
      }

      setDescripcion(
        factura?.descripcion ||
          factura?.concepto ||
          ""
      );

      setPrecio(
        factura?.total !== null &&
          factura?.total !== undefined
          ? String(factura.total)
          : ""
      );
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

  useEffect(() => {
    cargarDetalleExtra();
  }, [id]);

  const manejarCambioCliente = async (e) => {
    const nuevoClienteId = e.target.value;

    setClienteId(nuevoClienteId);
    setViviendaId("");
    setViviendas([]);
    setError("");

    if (!nuevoClienteId) {
      return;
    }

    try {
      setSaving(true);

      await cargarViviendas(
        nuevoClienteId
      );
    } catch (err) {
      console.error(
        "Error cargando viviendas:",
        err
      );

      setError(
        err?.message ||
          "No se pudieron cargar las viviendas."
      );
    } finally {
      setSaving(false);
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

      for (
        let i = 0;
        i < files.length;
        i++
      ) {
        const file = files[i];

        const cleanFileName =
          file.name.replace(
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

        if (
          publicUrlData?.publicUrl
        ) {
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

    setError("");
    setMensaje("");

    if (!clienteId) {
      setError(
        "Selecciona el cliente."
      );
      return;
    }

    if (!viviendaId) {
      setError(
        "Selecciona la vivienda."
      );
      return;
    }

    const vivienda = viviendas.find(
      (v) =>
        String(v.id) ===
        String(viviendaId)
    );

    if (!vivienda) {
      setError(
        "No se pudo localizar la vivienda seleccionada."
      );
      return;
    }

    if (
      String(vivienda.cliente_id) !==
      String(clienteId)
    ) {
      setError(
        "La vivienda seleccionada no pertenece al cliente seleccionado."
      );
      return;
    }

    const precioNumero = Number(
      String(precio)
        .replace(",", ".")
        .trim()
    );

    if (
      precio === "" ||
      !Number.isFinite(precioNumero) ||
      precioNumero < 0
    ) {
      setError(
        "Introduce un precio profesional válido."
      );
      return;
    }

    const cliente = clientes.find(
      (c) =>
        String(c.id) ===
        String(clienteId)
    );

    if (!cliente) {
      setError(
        "No se pudo localizar el cliente seleccionado."
      );
      return;
    }

    try {
      setSaving(true);

      if (extraData?.id) {
        const extraPayload = {
          cliente_id: clienteId,
          vivienda_id: viviendaId,

          descripcion:
            descripcion ||
            extraData.descripcion ||
            "Trabajo extra",

          materiales:
            materiales || null,

          tiempo_empleado:
            tiempo || null,

          precio:
            precioNumero,

          fotos,

          estado_tecnico:
            "completado",

          estado_admin:
            "pendiente",

          alerta
        };

        if (alerta) {
          extraPayload.alerta_vista =
            false;
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
            "El extra existe, pero no se ha podido actualizar. Comprueba que la vivienda esté asignada a este técnico."
          );
        }

        setExtraData(
          extraActualizado
        );

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

            fotos,

            estado_tecnico:
              "completado",

            alerta
          };

          facturaPayload.base =
            precioNumero;

          facturaPayload.iva =
            Math.round(
              precioNumero *
                0.21 *
                100
            ) / 100;

          facturaPayload.total =
            Math.round(
              precioNumero *
                1.21 *
                100
            ) / 100;

          if (alerta) {
            facturaPayload.alerta_vista =
              false;
          }

          const {
            error: facturaUpdateError
          } = await supabase
            .from("facturas")
            .update(facturaPayload)
            .eq(
              "id",
              facturaData.id
            );

          if (facturaUpdateError) {
            throw facturaUpdateError;
          }
        }

        alert(
          "Extra actualizado correctamente y enviado al administrador."
        );

        navigate("/tecnico");
        return;
      }

      const extraPayload = {
        cliente_id: clienteId,

        vivienda_id:
          viviendaId,

        tecnico_id:
          vivienda.tecnico_id,

        cliente_email:
          cliente.email || null,

        descripcion:
          descripcion ||
          "Trabajo extra",

        materiales:
          materiales || null,

        tiempo_empleado:
          tiempo || null,

        precio:
          precioNumero,

        estado:
          "pendiente",

        estado_tecnico:
          "completado",

        estado_admin:
          "pendiente",

        direccion:
          vivienda.direccion ||
          cliente.direccion ||
          null,

        fotos,

        alerta,

        creado_en:
          new Date().toISOString()
      };

      if (facturaData?.id) {
        extraPayload.factura_id =
          facturaData.id;
      }

      if (alerta) {
        extraPayload.alerta_vista =
          false;
      }

      const {
        data: nuevoExtra,
        error: errorCrearExtra
      } = await supabase
        .from("extras")
        .insert(extraPayload)
        .select("*")
        .maybeSingle();

      if (errorCrearExtra) {
        throw errorCrearExtra;
      }

      if (!nuevoExtra) {
        throw new Error(
          "El extra se ha enviado pero no se ha podido recuperar el registro creado."
        );
      }

      setExtraData(
        nuevoExtra
      );

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

          fotos,

          estado_tecnico:
            "completado",

          alerta,

          base:
            precioNumero,

          iva:
            Math.round(
              precioNumero *
                0.21 *
                100
            ) / 100,

          total:
            Math.round(
              precioNumero *
                1.21 *
                100
            ) / 100
        };

        if (alerta) {
          facturaPayload.alerta_vista =
            false;
        }

        const {
          error: facturaUpdateError
        } = await supabase
          .from("facturas")
          .update(facturaPayload)
          .eq(
            "id",
            facturaData.id
          );

        if (facturaUpdateError) {
          throw facturaUpdateError;
        }
      }

      alert(
        "Extra creado correctamente y enviado al administrador."
      );

      navigate("/tecnico");
    } catch (err) {
      console.error(
        "Error guardando el extra:",
        err
      );

      setError(
        "Error al guardar el extra: " +
          (err?.message ||
            "Error desconocido")
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          backgroundColor:
            FONDO_PRINCIPAL,
          minHeight: "100vh",
          display: "flex",
          justifyContent:
            "center",
          alignItems: "center",
          fontFamily:
            "Inter, sans-serif"
        }}
      >
        <h3
          style={
            TEXTO_DORADO_BRILLO
          }
        >
          Cargando datos del trabajo...
        </h3>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor:
          FONDO_PRINCIPAL,
        minHeight: "100vh",
        padding: "16px",
        display: "flex",
        justifyContent:
          "center",
        fontFamily:
          "Inter, sans-serif",
        boxSizing: "border-box"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          background:
            FONDO_TARJETA,
          border:
            BORDE_DORADO_FINO,
          borderRadius: "16px",
          padding: "20px",
          display: "flex",
          flexDirection:
            "column",
          gap: "16px",
          boxShadow:
            SOMBRA_LUXURY,
          boxSizing:
            "border-box"
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems:
              "center",
            borderBottom:
              BORDE_DORADO_FINO,
            paddingBottom:
              "14px"
          }}
        >
          <button
            type="button"
            onClick={() =>
              navigate("/tecnico")
            }
            style={{
              background:
                "transparent",
              border:
                BORDE_DORADO_FINO,
              color:
                COLOR_DORADO,
              padding:
                "6px 12px",
              borderRadius:
                "8px",
              cursor:
                "pointer",
              fontSize:
                "11px",
              fontWeight:
                "700"
            }}
          >
            ← Volver
          </button>

          <h2
            style={{
              ...TEXTO_DORADO_BRILLO,
              fontSize:
                "18px",
              fontWeight:
                "900",
              margin: 0,
              textTransform:
                "uppercase"
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
              padding:
                "12px",
              borderRadius:
                "10px",
              fontSize:
                "12px",
              fontWeight:
                "700",
              color:
                "#34d399",
              textAlign:
                "center"
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
              padding:
                "12px",
              borderRadius:
                "10px",
              fontSize:
                "12px",
              fontWeight:
                "700",
              color:
                "#ef4444",
              textAlign:
                "center"
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            background:
              "rgba(11, 19, 32, 0.9)",
            padding:
              "14px",
            borderRadius:
              "12px",
            border:
              BORDE_DORADO_FINO
          }}
        >
          <label
            style={{
              display:
                "block",
              fontSize:
                "12px",
              color:
                COLOR_DORADO,
              fontWeight:
                "700",
              textTransform:
                "uppercase",
              marginBottom:
                "7px"
            }}
          >
            Cliente
          </label>

          <select
            value={clienteId}
            onChange={
              manejarCambioCliente
            }
            disabled={saving}
            style={{
              width:
                "100%",
              padding:
                "12px",
              borderRadius:
                "10px",
              border:
                BORDE_DORADO_FINO,
              background:
                "#101a29",
              color:
                "#fff",
              fontSize:
                "13px",
              boxSizing:
                "border-box"
            }}
          >
            <option value="">
              -- Selecciona cliente --
            </option>

            {clientes.map(
              (cliente) => (
                <option
                  key={
                    cliente.id
                  }
                  value={
                    cliente.id
                  }
                >
                  {cliente.nombre}
                  {cliente.direccion
                    ? ` — ${cliente.direccion}`
                    : ""}
                </option>
              )
            )}
          </select>
        </div>

        <div
          style={{
            background:
              "rgba(11, 19, 32, 0.9)",
            padding:
              "14px",
            borderRadius:
              "12px",
            border:
              BORDE_DORADO_FINO
          }}
        >
          <label
            style={{
              display:
                "block",
              fontSize:
                "12px",
              color:
                COLOR_DORADO,
              fontWeight:
                "700",
              textTransform:
                "uppercase",
              marginBottom:
                "7px"
            }}
          >
            Vivienda
          </label>

          <select
            value={
              viviendaId
            }
            onChange={(e) =>
              setViviendaId(
                e.target.value
              )
            }
            disabled={
              !clienteId ||
              saving
            }
            style={{
              width:
                "100%",
              padding:
                "12px",
              borderRadius:
                "10px",
              border:
                BORDE_DORADO_FINO,
              background:
                "#101a29",
              color:
                "#fff",
              fontSize:
                "13px",
              boxSizing:
                "border-box"
            }}
          >
            <option value="">
              {!clienteId
                ? "-- Selecciona primero un cliente --"
                : "-- Selecciona vivienda --"}
            </option>

            {viviendas.map(
              (vivienda) => (
                <option
                  key={
                    vivienda.id
                  }
                  value={
                    vivienda.id
                  }
                >
                  {vivienda.direccion ||
                    `Vivienda #${vivienda.id}`}
                </option>
              )
            )}
          </select>

          {clienteId &&
            viviendas.length ===
              0 && (
              <p
                style={{
                  color:
                    "#f59e0b",
                  fontSize:
                    "12px",
                  marginBottom:
                    0
                }}
              >
                No hay viviendas disponibles
                para este cliente.
              </p>
            )}
        </div>

        <div
          style={{
            background:
              "rgba(11, 19, 32, 0.9)",
            padding:
              "14px",
            borderRadius:
              "12px",
            border:
              BORDE_DORADO_FINO
          }}
        >
          <p
            style={{
              fontSize:
                "12px",
              margin:
                "4px 0",
              color:
                "#ccc"
            }}
          >
            <strong
              style={{
                color:
                  COLOR_DORADO
              }}
            >
              Extra:
            </strong>{" "}
            {extraData?.descripcion ||
              extraData?.concepto ||
              descripcion ||
              "Nuevo trabajo extra"}
          </p>

          {facturaData?.id && (
            <p
              style={{
                fontSize:
                  "12px",
                margin:
                  "4px 0",
                color:
                  "#ccc"
              }}
            >
              <strong
                style={{
                  color:
                    COLOR_DORADO
                }}
              >
                Factura:
              </strong>{" "}
              #{facturaData.id}
            </p>
          )}

          {extraData?.id && (
            <p
              style={{
                fontSize:
                  "11px",
                margin:
                  "6px 0 0",
                color:
                  "#777"
              }}
            >
              ID extra:{" "}
              {extraData.id}
            </p>
          )}

          {!extraData && (
            <p
              style={{
                fontSize:
                  "11px",
                margin:
                  "6px 0 0",
                color:
                  "#34d399"
              }}
            >
              Nuevo extra: se creará al
              guardar.
            </p>
          )}
        </div>

        <div
          style={{
            background:
              "rgba(11, 19, 32, 0.9)",
            padding:
              "14px",
            borderRadius:
              "12px",
            border:
              BORDE_DORADO_FINO
          }}
        >
          <label
            style={{
              display:
                "block",
              fontSize:
                "12px",
              color:
                COLOR_DORADO,
              fontWeight:
                "700",
              textTransform:
                "uppercase",
              marginBottom:
                "7px"
            }}
          >
            Precio profesional (€)
          </label>

          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={precio}
            onChange={(e) =>
              setPrecio(
                e.target.value
              )
            }
            disabled={saving}
            placeholder="Ej: 125.00"
            style={{
              width:
                "100%",
              padding:
                "13px",
              borderRadius:
                "10px",
              border:
                BORDE_DORADO_FINO,
              background:
                "#101a29",
              color:
                "#fff",
              fontSize:
                "16px",
              fontWeight:
                "700",
              boxSizing:
                "border-box"
            }}
          />

          <p
            style={{
              color:
                "#888",
              fontSize:
                "11px",
              margin:
                "7px 0 0"
            }}
          >
            Este es el importe profesional
            del trabajo extra.
          </p>
        </div>

        <div
          style={{
            display:
              "flex",
            gap:
              "10px"
          }}
        >
          <label
            style={{
              flex:
                1,
              textAlign:
                "center",
              background:
                "linear-gradient(135deg, #f59e0b 0%, #b45309 100%)",
              color:
                "#fff",
              padding:
                "12px",
              borderRadius:
                "12px",
              fontWeight:
                "900",
              fontSize:
                "12px",
              cursor:
                "pointer",
              border:
                BORDE_DORADO_FINO,
              boxShadow:
                "0 4px 15px rgba(245, 158, 11, 0.3)",
              textTransform:
                "uppercase"
            }}
          >
            📸 Hacer Foto

            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={
                manejarSubidaFotos
              }
              disabled={
                saving
              }
              style={{
                display:
                  "none"
              }}
            />
          </label>

          <label
            style={{
              flex:
                1,
              textAlign:
                "center",
              background:
                "linear-gradient(135deg, #38bdf8 0%, #1e3a8a 100%)",
              color:
                "#fff",
              padding:
                "12px",
              borderRadius:
                "12px",
              fontWeight:
                "900",
              fontSize:
                "12px",
              cursor:
                "pointer",
              border:
                BORDE_DORADO_FINO,
              boxShadow:
                "0 4px 15px rgba(56, 189, 248, 0.3)",
              textTransform:
                "uppercase"
            }}
          >
            🖼️ Galería

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={
                manejarSubidaFotos
              }
              disabled={
                saving
              }
              style={{
                display:
                  "none"
              }}
            />
          </label>
        </div>

        {fotos.length > 0 && (
          <div
            style={{
              display:
                "flex",
              gap:
                "8px",
              flexWrap:
                "wrap"
            }}
          >
            {fotos.map(
              (url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Evidencia ${
                    index + 1
                  }`}
                  style={{
                    width:
                      "60px",
                    height:
                      "60px",
                    objectFit:
                      "cover",
                    borderRadius:
                      "8px",
                    border:
                      BORDE_DORADO_FINO
                  }}
                />
              )
            )}
          </div>
        )}

        <form
          onSubmit={
            handleSubmit
          }
          style={{
            display:
              "flex",
            flexDirection:
              "column",
            gap:
              "14px"
          }}
        >
          <div
            style={{
              background:
                "rgba(11, 19, 32, 0.9)",
              padding:
                "12px 14px",
              borderRadius:
                "12px",
              border:
                BORDE_DORADO_FINO,
              display:
                "flex",
              alignItems:
                "center"
            }}
          >
            <label
              style={{
                display:
                  "flex",
                alignItems:
                  "center",
                cursor:
                  "pointer",
                width:
                  "100%"
              }}
            >
              <input
                type="checkbox"
                checked={
                  alerta
                }
                onChange={(e) =>
                  setAlerta(
                    e.target.checked
                  )
                }
                style={{
                  width:
                    "20px",
                  height:
                    "20px",
                  marginRight:
                    "12px",
                  cursor:
                    "pointer",
                  accentColor:
                    "#ef4444"
                }}
              />

              <span
                style={{
                  fontSize:
                    "13px",
                  color:
                    "#ef4444",
                  fontWeight:
                    "800",
                  textTransform:
                    "uppercase",
                  letterSpacing:
                    "0.3px"
                }}
              >
                ⚠️ Marcar como ALERTA /
                Urgencia importante
              </span>
            </label>
          </div>

          <div
            style={{
              display:
                "flex",
              flexDirection:
                "column",
              gap:
                "6px"
            }}
          >
            <label
              style={{
                fontSize:
                  "12px",
                color:
                  COLOR_DORADO,
                fontWeight:
                  "700",
                textTransform:
                  "uppercase"
              }}
            >
              Descripción del trabajo realizado:
            </label>

            <textarea
              style={{
                backgroundColor:
                  "rgba(11, 19, 32, 0.8)",
                border:
                  BORDE_DORADO_FINO,
                borderRadius:
                  "12px",
                padding:
                  "12px",
                color:
                  "#fff",
                fontSize:
                  "13px",
                resize:
                  "vertical",
                outline:
                  "none",
                boxSizing:
                  "border-box"
              }}
              rows="4"
              value={
                descripcion
              }
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
              display:
                "flex",
              flexDirection:
                "column",
              gap:
                "6px"
            }}
          >
            <label
              style={{
                fontSize:
                  "12px",
                color:
                  COLOR_DORADO,
                fontWeight:
                  "700",
                textTransform:
                  "uppercase"
              }}
            >
              Materiales usados:
            </label>

            <input
              type="text"
              style={{
                backgroundColor:
                  "rgba(11, 19, 32, 0.8)",
                border:
                  BORDE_DORADO_FINO,
                borderRadius:
                  "12px",
                padding:
                  "12px",
                color:
                  "#fff",
                fontSize:
                  "13px",
                outline:
                  "none",
                boxSizing:
                  "border-box"
              }}
              value={
                materiales
              }
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
              display:
                "flex",
              flexDirection:
                "column",
              gap:
                "6px"
            }}
          >
            <label
              style={{
                fontSize:
                  "12px",
                color:
                  COLOR_DORADO,
                fontWeight:
                  "700",
                textTransform:
                  "uppercase"
              }}
            >
              Tiempo empleado:
            </label>

            <input
              type="text"
              style={{
                backgroundColor:
                  "rgba(11, 19, 32, 0.8)",
                border:
                  BORDE_DORADO_FINO,
                borderRadius:
                  "12px",
                padding:
                  "12px",
                color:
                  "#fff",
                fontSize:
                  "13px",
                outline:
                  "none",
                boxSizing:
                  "border-box"
              }}
              value={
                tiempo
              }
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
              saving ||
              !clienteId ||
              !viviendaId ||
              !precio
            }
            style={{
              background:
                saving ||
                !clienteId ||
                !viviendaId ||
                !precio
                  ? "rgba(255,255,255,0.08)"
                  : "linear-gradient(135deg, #10b981 0%, #047857 100%)",

              color:
                saving ||
                !clienteId ||
                !viviendaId ||
                !precio
                  ? "#64748b"
                  : "#fff",

              border:
                saving ||
                !clienteId ||
                !viviendaId ||
                !precio
                  ? BORDE_DORADO_FINO
                  : "1px solid rgba(16, 185, 129, 0.6)",

              padding:
                "14px",
              borderRadius:
                "16px",
              fontSize:
                "14px",
              fontWeight:
                "900",

              cursor:
                saving ||
                !clienteId ||
                !viviendaId ||
                !precio
                  ? "not-allowed"
                  : "pointer",

              marginTop:
                "10px",
              textTransform:
                "uppercase",
              letterSpacing:
                "0.5px",

              boxShadow:
                saving ||
                !clienteId ||
                !viviendaId ||
                !precio
                  ? "none"
                  : "0 4px 15px rgba(16, 185, 129, 0.3)",

              transition:
                "all 0.2s ease"
            }}
          >
            {saving
              ? "Guardando..."
              : extraData
              ? "✅ Actualizar Extra y Enviar"
              : "✅ Crear Extra y Enviar"}
          </button>
        </form>
      </div>
    </div>
  );
}
