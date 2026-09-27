import React, {
  useEffect,
  useState,
} from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import {
  useParams,
  useNavigate,
} from "react-router-dom";

export default function FinalizarInspeccion() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [inspeccion, setInspeccion] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [mensaje, setMensaje] =
    useState("");

  const [esError, setEsError] =
    useState(false);

  const [procesando, setProcesando] =
    useState(false);

  useEffect(() => {
    if (id) {
      cargarInspeccion();
    }
  }, [id]);

  async function cargarInspeccion() {
    setLoading(true);

    try {
      let {
        data,
        error,
      } = await supabase
        .from("inspecciones")
        .select(`
          *,
          viviendas (
            id,
            direccion,
            ciudad,
            localidad
          )
        `)
        .eq("id", id)
        .maybeSingle();

      if (error || !data) {
        const resSimple =
          await supabase
            .from("inspecciones")
            .select("*")
            .eq("id", id)
            .maybeSingle();

        data = resSimple.data;
        error = resSimple.error;
      }

      if (error || !data) {
        setMensaje(
          "No se encontró la inspección con ID: " +
            id
        );

        setEsError(true);
      } else {
        setInspeccion(data);
      }
    } catch (e) {
      console.error(e);

      setMensaje(
        "Error de conexión al cargar la inspección."
      );

      setEsError(true);
    } finally {
      setLoading(false);
    }
  }

  async function publicarParaCliente() {
    if (!inspeccion) {
      return;
    }

    /*
     * Solo se puede publicar una inspección
     * que haya terminado el técnico.
     */
    if (
      inspeccion.estado !==
        "completada_tecnico" ||
      inspeccion.estado_tecnico !==
        "completada"
    ) {
      setMensaje(
        "Esta inspección todavía no está lista para revisión administrativa."
      );

      setEsError(true);

      return;
    }

    const confirmar =
      window.confirm(
        "¿Has revisado las fotos y observaciones y quieres publicar esta inspección para el cliente?"
      );

    if (!confirmar) {
      return;
    }

    setProcesando(true);
    setMensaje(
      "Publicando inspección para el cliente..."
    );
    setEsError(false);

    try {
      /*
       * ESTE ES EL ÚNICO CAMBIO DE ESTADO
       * QUE PUBLICA LA INSPECCIÓN.
       *
       * NO:
       * - email
       * - factura
       * - Stripe
       * - FacturaDirecta
       */
      const {
        data,
        error,
      } = await supabase
        .from("inspecciones")
        .update({
          estado: "finalizada",
          estado_admin: "aprobada",
          fecha_finalizacion:
            new Date().toISOString(),
        })
        .eq("id", id)
        .eq(
          "estado",
          "completada_tecnico"
        )
        .eq(
          "estado_tecnico",
          "completada"
        )
        .select("*")
        .maybeSingle();

      if (error) {
        throw error;
      }

      /*
       * Si no devuelve registro,
       * no se ha realizado la publicación.
       */
      if (!data) {
        throw new Error(
          "La inspección ya no está pendiente de revisión o no cumple el estado requerido."
        );
      }

      setInspeccion(data);

      setMensaje(
        "Inspección publicada correctamente para el cliente ✔"
      );

      setEsError(false);

      setTimeout(() => {
        navigate("/inspecciones");
      }, 1500);
    } catch (e) {
      console.error(
        "Error publicando inspección:",
        e
      );

      setMensaje(
        "Error publicando la inspección: " +
          e.message
      );

      setEsError(true);
      setProcesando(false);
    }
  }

  async function eliminarInspeccion() {
    const confirmar =
      window.confirm(
        "¿Seguro que deseas eliminar esta inspección?"
      );

    if (!confirmar) {
      return;
    }

    setProcesando(true);

    try {
      const {
        error:
          checklistError,
      } = await supabase
        .from("checklist_inspeccion")
        .delete()
        .eq(
          "inspeccion_id",
          id
        );

      if (checklistError) {
        console.error(
          "Error eliminando checklist:",
          checklistError
        );
      }

      const {
        error:
          fotosError,
      } = await supabase
        .from("fotos_inspeccion")
        .delete()
        .eq(
          "inspeccion_id",
          id
        );

      if (fotosError) {
        console.error(
          "Error eliminando fotos:",
          fotosError
        );
      }

      const {
        error,
      } = await supabase
        .from("inspecciones")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      alert(
        "Inspección eliminada correctamente"
      );

      navigate("/inspecciones");
    } catch (e) {
      console.error(e);

      alert(
        "Error eliminando inspección: " +
          e.message
      );

      setProcesando(false);
    }
  }

  if (loading) {
    return (
      <Menu>
        <div
          style={{
            height: "100vh",
            background: "#0a0f1a",
            color: "#4db8ff",
            display: "flex",
            justifyContent:
              "center",
            alignItems:
              "center",
          }}
        >
          Cargando inspección...
        </div>
      </Menu>
    );
  }

  const direccionReal =
    inspeccion?.viviendas
      ?.direccion ||
    inspeccion?.direccion ||
    "Dirección no especificada";

  const localidadReal =
    inspeccion?.viviendas
      ?.localidad ||
    inspeccion?.localidad ||
    inspeccion?.viviendas
      ?.ciudad ||
    "No especificada";

  const puedePublicar =
    inspeccion?.estado ===
      "completada_tecnico" &&
    inspeccion?.estado_tecnico ===
      "completada";

  return (
    <Menu>
      <div
        style={{
          padding: "20px",
          background: "#0a0f1a",
          minHeight: "100vh",
          color: "#fff",
          fontFamily:
            "Inter, sans-serif",
        }}
      >
        <h1
          style={{
            color: "#4db8ff",
            marginBottom: "25px",
            fontSize: "24px",
            textAlign:
              "center",
          }}
        >
          Revisión de inspección
        </h1>

        {mensaje && (
          <div
            style={{
              marginBottom: "20px",
              padding: "12px",
              background:
                esError
                  ? "rgba(255,107,107,0.15)"
                  : "rgba(74,222,128,0.15)",
              border:
                `1px solid ${
                  esError
                    ? "#ff6b6b"
                    : "#4ade80"
                }`,
              borderRadius: "10px",
              color:
                esError
                  ? "#ff6b6b"
                  : "#4ade80",
              textAlign:
                "center",
              fontSize: "14px",
            }}
          >
            {mensaje}
          </div>
        )}

        {inspeccion && (
          <>
            <div
              style={{
                background:
                  "rgba(255,255,255,0.05)",
                padding: "20px",
                borderRadius:
                  "14px",
                border:
                  "1px solid rgba(255,255,255,0.1)",
                marginBottom:
                  "25px",
              }}
            >
              <p>
                <strong
                  style={{
                    color:
                      "#4db8ff",
                  }}
                >
                  Dirección:
                </strong>{" "}
                {direccionReal}
              </p>

              <p>
                <strong
                  style={{
                    color:
                      "#4db8ff",
                  }}
                >
                  Localidad:
                </strong>{" "}
                {localidadReal}
              </p>

              <p>
                <strong
                  style={{
                    color:
                      "#4db8ff",
                  }}
                >
                  Fecha:
                </strong>{" "}
                {inspeccion.fecha
                  ? String(
                      inspeccion.fecha
                    ).slice(0, 10)
                  : "-"}
              </p>

              <p>
                <strong
                  style={{
                    color:
                      "#4db8ff",
                  }}
                >
                  Estado:
                </strong>{" "}
                {inspeccion.estado ||
                  "pendiente"}
              </p>

              <p>
                <strong
                  style={{
                    color:
                      "#4db8ff",
                  }}
                >
                  Estado técnico:
                </strong>{" "}
                {inspeccion.estado_tecnico ||
                  "pendiente"}
              </p>

              <p>
                <strong
                  style={{
                    color:
                      "#4db8ff",
                  }}
                >
                  Estado administración:
                </strong>{" "}
                {inspeccion.estado_admin ||
                  "pendiente"}
              </p>

              <div
                style={{
                  marginTop:
                    "20px",
                  padding:
                    "15px",
                  background:
                    "rgba(255,255,255,0.05)",
                  borderRadius:
                    "10px",
                }}
              >
                <strong
                  style={{
                    color:
                      "#ffd700",
                  }}
                >
                  Observaciones del técnico
                </strong>

                <p
                  style={{
                    whiteSpace:
                      "pre-wrap",
                    marginTop:
                      "10px",
                  }}
                >
                  {inspeccion.observaciones ||
                    "Sin observaciones"}
                </p>
              </div>
            </div>

            {puedePublicar ? (
              <button
                onClick={
                  publicarParaCliente
                }
                disabled={
                  procesando
                }
                style={{
                  padding:
                    "15px",
                  width:
                    "100%",
                  background:
                    "#4ade80",
                  color:
                    "#052e16",
                  borderRadius:
                    "10px",
                  border:
                    "none",
                  fontWeight:
                    "800",
                  fontSize:
                    "17px",
                  cursor:
                    "pointer",
                  opacity:
                    procesando
                      ? 0.6
                      : 1,
                }}
              >
                {procesando
                  ? "Publicando..."
                  : "✔ Revisar y publicar para el cliente"}
              </button>
            ) : (
              <div
                style={{
                  padding:
                    "15px",
                  background:
                    "rgba(255,255,255,0.05)",
                  borderRadius:
                    "10px",
                  textAlign:
                    "center",
                  color:
                    "#aaa",
                }}
              >
                Esta inspección no está
                pendiente de revisión
                administrativa.
              </div>
            )}

            <button
              onClick={
                eliminarInspeccion
              }
              disabled={
                procesando
              }
              style={{
                marginTop:
                  "12px",
                padding:
                  "14px",
                width:
                  "100%",
                background:
                  "#ef4444",
                color:
                  "#fff",
                borderRadius:
                  "10px",
                border:
                  "none",
                fontWeight:
                  "700",
                fontSize:
                  "16px",
                cursor:
                  "pointer",
                opacity:
                  procesando
                    ? 0.6
                    : 1,
              }}
            >
              Eliminar Inspección
            </button>
          </>
        )}
      </div>
    </Menu>
  );
}
