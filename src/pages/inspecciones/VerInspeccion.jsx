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

  function formatearFecha(fechaISO) {
    if (!fechaISO) return "Sin fecha";

    const fecha = new Date(fechaISO);
    const dia = String(fecha.getDate()).padStart(2, "0");
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const año = fecha.getFullYear();

    return `${dia}/${mes}/${año}`;
  }

  useEffect(() => {
    async function cargarInspeccion() {
      setLoading(true);

      try {
        // 1. Cargar la inspección
        const { data, error } = await supabase
          .from("inspecciones")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (error) {
          console.error(
            "Error en Supabase al buscar inspección:",
            error
          );
          setLoading(false);
          return;
        }

        if (!data) {
          setLoading(false);
          return;
        }

        setInspeccion(data);

        // 2. Cargar los datos completos de la vivienda
        // Igual que se hace en el listado de inspecciones.
        if (data.vivienda_id) {
          const {
            data: viviendaData,
            error: viviendaError,
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
          } else {
            setVivienda(viviendaData);
          }
        }

        // 3. Cargar las fotografías realizadas por el técnico.
        // Las fotos se guardan en fotos_inspeccion.
        const {
          data: fotosData,
          error: fotosError,
        } = await supabase
          .from("fotos_inspeccion")
          .select("*")
          .eq("inspeccion_id", String(id))
          .order("id", { ascending: false });

        if (fotosError) {
          console.error(
            "Error cargando fotos de inspección:",
            fotosError
          );
        } else {
          const fotosProcesadas = (fotosData || []).map((foto) => {
            let urlFinal = foto.url;

            // Si la BD tiene guardado el path en lugar de una URL completa,
            // reconstruimos la URL pública desde Storage.
            if (!urlFinal || !urlFinal.startsWith("http")) {
              const nombreArchivo =
                foto.archivo || foto.url_storage_o_path;

              if (nombreArchivo) {
                const { data: publicData } =
                  supabase.storage
                    .from("fotos")
                    .getPublicUrl(nombreArchivo);

                urlFinal = publicData?.publicUrl || "";
              }
            }

            return {
              ...foto,
              url: urlFinal,
            };
          });

          setFotos(
            fotosProcesadas.filter((foto) => foto.url)
          );
        }
      } catch (error) {
        console.error(
          "Error general cargando inspección:",
          error
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

    await supabase
      .from("checklist_inspeccion")
      .delete()
      .eq("inspeccion_id", id);

    await supabase
      .from("fotos_inspeccion")
      .delete()
      .eq("inspeccion_id", id);

    const { error } = await supabase
      .from("inspecciones")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Error eliminando inspección");
      return;
    }

    alert("Inspección eliminada correctamente");
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
            fontSize: "18px",
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
            padding: "20px",
          }}
        >
          <h2>
            No se encontró la inspección con ID: {id}
          </h2>

          <Link
            to="/inspecciones"
            style={{ color: "#4db8ff" }}
          >
            Volver
          </Link>
        </div>
      </Menu>
    );
  }

  // Datos de vivienda.
  // Mantenemos también los posibles campos antiguos de la inspección
  // como respaldo para no romper datos existentes.
  const direccion =
    vivienda?.direccion ||
    inspeccion.direccion ||
    "Dirección no especificada";

  const localidad =
    vivienda?.ciudad ||
    vivienda?.localidad ||
    inspeccion.localidad ||
    "No especificada";

  const observaciones =
    inspeccion.observaciones ||
    "Sin observaciones";

  const estadoTecnico =
    inspeccion.estado_tecnico ||
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
          fontFamily: "Inter, sans-serif",
        }}
      >
        <h1
          style={{
            color: "#4db8ff",
            marginBottom: "15px",
          }}
        >
          Inspección #{inspeccion.id}
        </h1>

        {/* DATOS DE LA VIVIENDA */}
        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            border:
              "1px solid rgba(77,184,255,0.25)",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "18px",
          }}
        >
          <h3
            style={{
              color: "#4db8ff",
              marginTop: 0,
            }}
          >
            Datos de la vivienda
          </h3>

          <p
            style={{
              marginBottom: "7px",
              opacity: 0.9,
            }}
          >
            <strong>Dirección:</strong> {direccion}
          </p>

          <p
            style={{
              marginBottom: "7px",
              opacity: 0.9,
            }}
          >
            <strong>Localidad:</strong> {localidad}
          </p>

          {vivienda?.ciudad &&
            vivienda?.localidad &&
            vivienda.ciudad !== vivienda.localidad && (
              <p
                style={{
                  marginBottom: "7px",
                  opacity: 0.9,
                }}
              >
                <strong>Ciudad:</strong>{" "}
                {vivienda.ciudad}
              </p>
            )}

          {vivienda?.provincia && (
            <p
              style={{
                marginBottom: "7px",
                opacity: 0.9,
              }}
            >
              <strong>Provincia:</strong>{" "}
              {vivienda.provincia}
            </p>
          )}

          {vivienda?.codigo_postal && (
            <p
              style={{
                marginBottom: "0",
                opacity: 0.9,
              }}
            >
              <strong>Código postal:</strong>{" "}
              {vivienda.codigo_postal}
            </p>
          )}
        </div>

        {/* DATOS DE LA INSPECCIÓN */}

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

        {/* OBSERVACIONES DEL TÉCNICO */}

        <h3
          style={{
            marginTop: "20px",
            color: "#ffd700",
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
            marginBottom: "20px",
          }}
        >
          {observaciones}
        </div>

        {/* FOTOS DEL TÉCNICO */}

        <h3
          style={{
            marginTop: "20px",
            color: "#ffd700",
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
              marginBottom: "20px",
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
              marginBottom: "20px",
            }}
          >
            {fotos.map((foto) => (
              <a
                key={foto.id}
                href={foto.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  textDecoration: "none",
                }}
              >
                <img
                  src={foto.url}
                  alt="Foto de inspección"
                  style={{
                    width: "100%",
                    height: "150px",
                    objectFit: "cover",
                    borderRadius: "10px",
                    border: foto.principal
                      ? "3px solid #4ade80"
                      : "1px solid rgba(77,184,255,0.5)",
                  }}
                  onError={(e) => {
                    console.error(
                      "Error cargando foto:",
                      foto.url
                    );

                    e.currentTarget.style.display =
                      "none";
                  }}
                />
              </a>
            ))}
          </div>
        )}

        {/* ENLACES EXISTENTES */}

        <div
          style={{
            display: "flex",
            gap: "15px",
            flexWrap: "wrap",
            marginTop: "20px",
          }}
        >
          <Link
            to={`/inspecciones/checklist/${id}`}
            style={{
              color: "#4db8ff",
              fontWeight: "bold",
              textDecoration: "none",
            }}
          >
            📋 Ir al Checklist
          </Link>

          <Link
            to={`/inspecciones/fotos/${id}`}
            style={{
              color: "#4db8ff",
              fontWeight: "bold",
              textDecoration: "none",
            }}
          >
            🖼️ Ver Galería de Fotos
          </Link>

          <Link
            to={`/inspecciones/pdf/${id}`}
            style={{
              color: "#4db8ff",
              fontWeight: "bold",
              textDecoration: "none",
            }}
          >
            📄 Ver PDF
          </Link>
        </div>

        {/* ELIMINAR */}

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
            cursor: "pointer",
          }}
        >
          Eliminar inspección
        </button>

        {/* VOLVER */}

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
            cursor: "pointer",
          }}
        >
          ← Volver al listado
        </button>
      </div>
    </Menu>
  );
}
