import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import Menu from "../../layouts/Menu";

export default function VerInspeccion() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [inspeccion, setInspeccion] = useState(null);
  const [vivienda, setVivienda] = useState(null);
  const [fotos, setFotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  function formatearFecha(fechaISO) {
    if (!fechaISO) return "Sin fecha";

    const fecha = new Date(fechaISO);

    if (Number.isNaN(fecha.getTime())) {
      return "Sin fecha";
    }

    const dia = String(fecha.getDate()).padStart(2, "0");
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const año = fecha.getFullYear();

    return `${dia}/${mes}/${año}`;
  }

  function obtenerUrlFoto(foto) {
    if (!foto) return "";

    // 1. URL completa guardada en la BD.
    if (
      typeof foto.url === "string" &&
      foto.url.startsWith("http")
    ) {
      return foto.url;
    }

    // 2. Archivo/path guardado en la BD.
    const archivo =
      foto.archivo ||
      foto.url_storage_o_path ||
      (typeof foto.url === "string"
        ? foto.url
        : "");

    if (!archivo) {
      return "";
    }

    // Si ya es una URL, la devolvemos.
    if (archivo.startsWith("http")) {
      return archivo;
    }

    const { data } = supabase.storage
      .from("fotos")
      .getPublicUrl(archivo);

    return data?.publicUrl || "";
  }

  function normalizarFoto(foto, index = 0) {
    if (!foto) return null;

    const url = obtenerUrlFoto(foto);

    if (!url) {
      return null;
    }

    return {
      ...foto,
      id:
        foto.id ||
        `foto-${index}-${url}`,
      url,
    };
  }

  useEffect(() => {
    async function cargarInspeccion() {
      setLoading(true);
      setErrorMsg("");

      try {
        // =========================================================
        // 1. INSPECCIÓN
        // =========================================================
        const {
          data,
          error
        } = await supabase
          .from("inspecciones")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (error) {
          console.error(
            "Error en Supabase al buscar inspección:",
            error
          );

          setErrorMsg(
            "No se pudo cargar la inspección: " +
              error.message
          );

          return;
        }

        if (!data) {
          setErrorMsg(
            "No se encontró la inspección."
          );

          return;
        }

        setInspeccion(data);

        // =========================================================
        // 2. VIVIENDA
        // =========================================================
        if (data.vivienda_id) {
          const {
            data: viviendaData,
            error: viviendaError
          } = await supabase
            .from("viviendas")
            .select("*")
            .eq("id", data.vivienda_id)
            .maybeSingle();

          if (viviendaError) {
            console.error(
              "Error cargando vivienda:",
              viviendaError
            );
          } else if (viviendaData) {
            setVivienda(viviendaData);
          }
        }

        // =========================================================
        // 3. FOTOS DEL TÉCNICO
        // =========================================================
        //
        // Las fotos actuales del flujo normal se guardan en:
        // public.fotos_inspeccion
        //
        // El inspeccion_id de esa tabla es TEXT, mientras que
        // inspecciones.id es UUID, por eso convertimos a String.
        //
        const {
          data: fotosData,
          error: fotosError
        } = await supabase
          .from("fotos_inspeccion")
          .select("*")
          .eq("inspeccion_id", String(id))
          .order("id", {
            ascending: false
          });

        if (fotosError) {
          console.error(
            "Error cargando fotos_inspeccion:",
            fotosError
          );
        }

        const fotosTabla = (fotosData || [])
          .map((foto, index) =>
            normalizarFoto(foto, index)
          )
          .filter(Boolean);

        // =========================================================
        // 4. RESPALDO: inspecciones.fotos
        // =========================================================
        //
        // Algunas inspecciones antiguas pueden tener también
        // las fotos directamente en inspecciones.fotos.
        //
        const fotosCampo = [];

        if (Array.isArray(data.fotos)) {
          data.fotos.forEach((foto, index) => {
            const objeto =
              typeof foto === "string"
                ? {
                    url: foto,
                    archivo: foto
                  }
                : foto;

            const fotoNormalizada =
              normalizarFoto(
                objeto,
                index + fotosTabla.length
              );

            if (fotoNormalizada) {
              fotosCampo.push(
                fotoNormalizada
              );
            }
          });
        }

        // =========================================================
        // 5. UNIFICAR SIN DUPLICADOS
        // =========================================================
        const todasLasFotos = [
          ...fotosTabla,
          ...fotosCampo
        ];

        const fotosUnicas = [];
        const urlsVistas = new Set();

        todasLasFotos.forEach((foto) => {
          if (!foto?.url) return;

          if (urlsVistas.has(foto.url)) {
            return;
          }

          urlsVistas.add(foto.url);
          fotosUnicas.push(foto);
        });

        setFotos(fotosUnicas);
      } catch (error) {
        console.error(
          "Error general cargando inspección:",
          error
        );

        setErrorMsg(
          "Error cargando la inspección."
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      cargarInspeccion();
    }
  }, [id]);

  async function eliminarInspeccion() {
    const confirmar = window.confirm(
      "¿Seguro que deseas eliminar esta inspección?"
    );

    if (!confirmar) return;

    const {
      error: checklistError
    } = await supabase
      .from("checklist_inspeccion")
      .delete()
      .eq("inspeccion_id", id);

    if (checklistError) {
      console.error(
        "Error eliminando checklist:",
        checklistError
      );
    }

    const {
      error: fotosError
    } = await supabase
      .from("fotos_inspeccion")
      .delete()
      .eq("inspeccion_id", id);

    if (fotosError) {
      console.error(
        "Error eliminando fotos:",
        fotosError
      );
    }

    const {
      error
    } = await supabase
      .from("inspecciones")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(
        "Error eliminando inspección:",
        error
      );

      alert(
        "Error eliminando inspección: " +
          error.message
      );

      return;
    }

    alert(
      "Inspección eliminada correctamente"
    );

    navigate("/inspecciones");
  }

  if (loading) {
    return (
      <Menu>
        <div
          style={{
            height: "100vh",
            background: "#0a0f1a",
            color: "#fff",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "18px"
          }}
        >
          Cargando inspección…
        </div>
      </Menu>
    );
  }

  if (!inspeccion) {
    return (
      <Menu>
        <div
          style={{
            background: "#0a0f1a",
            minHeight: "100vh",
            color: "#fff",
            padding: "20px"
          }}
        >
          <h2>
            {errorMsg ||
              `No se encontró la inspección con ID: ${id}`}
          </h2>

          <Link
            to="/inspecciones"
            style={{
              color: "#4db8ff"
            }}
          >
            Volver
          </Link>
        </div>
      </Menu>
    );
  }

  // =============================================================
  // DATOS DE VIVIENDA
  // =============================================================

  const direccion =
    vivienda?.direccion ||
    inspeccion.direccion ||
    "Dirección no especificada";

  const localidad =
    vivienda?.localidad ||
    inspeccion.localidad ||
    vivienda?.ciudad ||
    "No especificada";

  const ciudad =
    vivienda?.ciudad ||
    null;

  const provincia =
    vivienda?.provincia ||
    null;

  const codigoPostal =
    vivienda?.codigo_postal ||
    vivienda?.cp ||
    null;

  // =============================================================
  // DATOS DE INSPECCIÓN
  // =============================================================

  const observaciones =
    inspeccion.observaciones ||
    inspeccion.notas_tecnico ||
    inspeccion.notas ||
    "Sin observaciones";

  const estadoTecnico =
    inspeccion.estado_tecnico ||
    "Pendiente";

  const estadoAdmin =
    inspeccion.estado_admin ||
    "Pendiente";

  return (
    <Menu>
      <div
        style={{
          padding: "20px",
          background: "#0a0f1a",
          minHeight: "100vh",
          color: "#fff",
          paddingBottom: "80px",
          fontFamily: "Inter, sans-serif"
        }}
      >
        <h1
          style={{
            color: "#4db8ff",
            marginBottom: "15px"
          }}
        >
          Inspección #{inspeccion.id}
        </h1>

        {errorMsg && (
          <div
            style={{
              padding: "12px",
              marginBottom: "15px",
              borderRadius: "10px",
              background:
                "rgba(239,68,68,0.12)",
              border:
                "1px solid rgba(239,68,68,0.4)",
              color: "#f87171"
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* =======================================================
            DATOS DE LA VIVIENDA
        ======================================================= */}

        <div
          style={{
            background:
              "rgba(255,255,255,0.05)",
            border:
              "1px solid rgba(77,184,255,0.25)",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "18px"
          }}
        >
          <h3
            style={{
              color: "#4db8ff",
              marginTop: 0,
              marginBottom: "15px"
            }}
          >
            Datos de la vivienda
          </h3>

          <p
            style={{
              marginBottom: "7px",
              opacity: 0.9
            }}
          >
            <strong>Dirección:</strong>{" "}
            {direccion}
          </p>

          <p
            style={{
              marginBottom: "7px",
              opacity: 0.9
            }}
          >
            <strong>Localidad:</strong>{" "}
            {localidad}
          </p>

          {ciudad &&
            ciudad !== localidad && (
              <p
                style={{
                  marginBottom: "7px",
                  opacity: 0.9
                }}
              >
                <strong>Ciudad:</strong>{" "}
                {ciudad}
              </p>
            )}

          {provincia && (
            <p
              style={{
                marginBottom: "7px",
                opacity: 0.9
              }}
            >
              <strong>Provincia:</strong>{" "}
              {provincia}
            </p>
          )}

          {codigoPostal && (
            <p
              style={{
                marginBottom: 0,
                opacity: 0.9
              }}
            >
              <strong>Código postal:</strong>{" "}
              {codigoPostal}
            </p>
          )}
        </div>

        {/* =======================================================
            DATOS DE LA INSPECCIÓN
        ======================================================= */}

        <p style={{ opacity: 0.9 }}>
          <strong>Fecha:</strong>{" "}
          {formatearFecha(inspeccion.fecha)}
        </p>

        <p style={{ opacity: 0.9 }}>
          <strong>Estado:</strong>{" "}
          {inspeccion.estado || "Pendiente"}
        </p>

        <p style={{ opacity: 0.9 }}>
          <strong>Estado técnico:</strong>{" "}
          {estadoTecnico}
        </p>

        <p style={{ opacity: 0.9 }}>
          <strong>Estado administración:</strong>{" "}
          {estadoAdmin}
        </p>

        {/* =======================================================
            OBSERVACIONES DEL TÉCNICO
        ======================================================= */}

        <h3
          style={{
            marginTop: "20px",
            color: "#ffd700"
          }}
        >
          Observaciones del técnico
        </h3>

        <div
          style={{
            background:
              "rgba(255,255,255,0.05)",
            borderRadius: "10px",
            padding: "14px",
            whiteSpace: "pre-wrap",
            opacity: 0.9,
            marginBottom: "20px"
          }}
        >
          {observaciones}
        </div>

        {/* =======================================================
            FOTOS DEL TÉCNICO
        ======================================================= */}

        <h3
          style={{
            marginTop: "20px",
            color: "#ffd700"
          }}
        >
          Fotos del técnico ({fotos.length})
        </h3>

        {fotos.length === 0 ? (
          <div
            style={{
              padding: "16px",
              borderRadius: "10px",
              background:
                "rgba(255,255,255,0.05)",
              color: "#aaa",
              marginBottom: "20px"
            }}
          >
            No hay fotos registradas para esta
            inspección.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(150px, 1fr))",
              gap: "12px",
              marginBottom: "20px"
            }}
          >
            {fotos.map((foto, index) => (
              <a
                key={
                  foto.id ||
                  `foto-${index}`
                }
                href={foto.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  textDecoration: "none"
                }}
              >
                <div
                  style={{
                    position: "relative"
                  }}
                >
                  <img
                    src={foto.url}
                    alt={
                      foto.descripcion ||
                      "Foto de inspección"
                    }
                    style={{
                      width: "100%",
                      height: "150px",
                      objectFit: "cover",
                      borderRadius: "10px",
                      border:
                        foto.principal
                          ? "3px solid #4ade80"
                          : "1px solid rgba(77,184,255,0.5)",
                      display: "block",
                      background:
                        "#111827"
                    }}
                    onError={(e) => {
                      console.error(
                        "Error cargando foto:",
                        foto.url
                      );

                      e.currentTarget.style.opacity =
                        "0.35";
                    }}
                  />

                  {foto.principal && (
                    <span
                      style={{
                        position: "absolute",
                        left: "8px",
                        bottom: "8px",
                        background:
                          "#4ade80",
                        color: "#052e16",
                        padding:
                          "4px 7px",
                        borderRadius: "6px",
                        fontSize: "10px",
                        fontWeight: "900"
                      }}
                    >
                      PRINCIPAL
                    </span>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}

        {/* =======================================================
            ENLACES EXISTENTES
        ======================================================= */}

        <div
          style={{
            display: "flex",
            gap: "15px",
            flexWrap: "wrap",
            marginTop: "20px"
          }}
        >
          <Link
            to={`/inspecciones/checklist/${id}`}
            style={{
              color: "#4db8ff",
              fontWeight: "bold",
              textDecoration: "none"
            }}
          >
            📋 Ir al Checklist
          </Link>

          <Link
            to={`/inspecciones/fotos/${id}`}
            style={{
              color: "#4db8ff",
              fontWeight: "bold",
              textDecoration: "none"
            }}
          >
            🖼️ Ver Galería de Fotos
          </Link>

          <Link
            to={`/inspecciones/pdf/${id}`}
            style={{
              color: "#4db8ff",
              fontWeight: "bold",
              textDecoration: "none"
            }}
          >
            📄 Ver PDF
          </Link>
        </div>

        {/* =======================================================
            ELIMINAR
        ======================================================= */}

        <button
          onClick={eliminarInspeccion}
          style={{
            marginTop: "30px",
            padding: "14px",
            width: "100%",
            background: "#e74c3c",
            color: "#fff",
            borderRadius: "10px",
            border: "none",
            fontWeight: "700",
            fontSize: "17px",
            cursor: "pointer"
          }}
        >
          Eliminar inspección
        </button>

        {/* =======================================================
            VOLVER
        ======================================================= */}

        <button
          onClick={() =>
            navigate("/inspecciones")
          }
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
            cursor: "pointer"
          }}
        >
          ← Volver al listado
        </button>
      </div>
    </Menu>
  );
}
