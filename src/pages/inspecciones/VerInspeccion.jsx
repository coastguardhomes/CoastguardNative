
import React, {
  useEffect,
  useState,
} from "react";
import {
  useParams,
  Link,
  useNavigate,
} from "react-router-dom";
import { supabase } from "../../lib/supabase";
import Menu from "../../layouts/Menu";

const BUCKET_FOTOS = "fotos";
const DURACION_URL_FIRMADA = 3600;

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

  function obtenerRutaStorage(valor) {
    if (!valor || typeof valor !== "string") {
      return null;
    }

    const texto = valor.trim();

    if (!texto || /^data:/i.test(texto)) {
      return null;
    }

    if (/^https?:\/\//i.test(texto)) {
      try {
        const url = new URL(texto);
        const marcador = "/storage/v1/object/";
        const posicion = url.pathname.indexOf(marcador);

        if (posicion === -1) {
          return null;
        }

        const resto = url.pathname.slice(
          posicion + marcador.length
        );

        const prefijos = [
          `public/${BUCKET_FOTOS}/`,
          `sign/${BUCKET_FOTOS}/`,
          `authenticated/${BUCKET_FOTOS}/`,
        ];

        const prefijo = prefijos.find((item) =>
          resto.startsWith(item)
        );

        if (!prefijo) {
          return null;
        }

        return decodeURIComponent(
          resto.slice(prefijo.length)
        );
      } catch (error) {
        console.error(
          "Error interpretando la URL de la foto:",
          error
        );

        return null;
      }
    }

    return texto.replace(/^\/+/, "");
  }

  async function obtenerUrlFoto(foto) {
    if (!foto) return "";

    const candidatos = [
      foto.archivo,
      foto.url_storage_o_path,
      foto.url,
    ];

    let urlExterna = "";

    for (const candidato of candidatos) {
      if (
        typeof candidato !== "string" ||
        !candidato.trim()
      ) {
        continue;
      }

      const valor = candidato.trim();

      if (/^data:/i.test(valor)) {
        continue;
      }

      const ruta = obtenerRutaStorage(valor);

      if (ruta) {
        const { data, error } = await supabase.storage
          .from(BUCKET_FOTOS)
          .createSignedUrl(
            ruta,
            DURACION_URL_FIRMADA
          );

        if (error) {
          console.error(
            "Error generando URL firmada de la foto:",
            error
          );

          continue;
        }

        if (data?.signedUrl) {
          return data.signedUrl;
        }
      }

      if (/^https?:\/\//i.test(valor)) {
        try {
          const url = new URL(valor);

          if (
            url.protocol === "https:" ||
            url.protocol === "http:"
          ) {
            urlExterna = valor;
          }
        } catch {
          // Ignorar URLs antiguas no válidas.
        }
      }
    }

    return urlExterna;
  }

  async function normalizarFoto(foto, index = 0) {
    if (!foto) return null;

    const url = await obtenerUrlFoto(foto);

    if (!url) {
      return null;
    }

    return {
      ...foto,
      id: foto.id || `foto-${index}-${url}`,
      url,
    };
  }

  useEffect(() => {
    let cancelado = false;

    async function cargarInspeccion() {
      setLoading(true);
      setErrorMsg("");

      try {
        const { data, error } = await supabase
          .from("inspecciones")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (error) {
          console.error(
            "Error buscando inspección:",
            error
          );

          setErrorMsg(
            "No se pudo cargar la inspección: " +
              error.message
          );

          return;
        }

        if (cancelado) return;

        if (!data) {
          setErrorMsg("No se encontró la inspección.");
          return;
        }

        setInspeccion(data);

        if (data.vivienda_id) {
          const {
            data: viviendaData,
            error: viviendaError,
          } = await supabase
            .from("viviendas")
            .select("*")
            .eq("id", data.vivienda_id)
            .maybeSingle();

          if (cancelado) return;

          if (viviendaError) {
            console.error(
              "Error cargando vivienda:",
              viviendaError
            );
          } else if (viviendaData) {
            setVivienda(viviendaData);
          }
        }

        const {
          data: fotosData,
          error: fotosError,
        } = await supabase
          .from("fotos_inspeccion")
          .select("*")
          .eq("inspeccion_id", String(id))
          .order("id", { ascending: false });

        if (cancelado) return;

        if (fotosError) {
          console.error(
            "Error cargando fotos:",
            fotosError
          );
        }

        const fotosTabla = await Promise.all(
          (fotosData || []).map((foto, index) =>
            normalizarFoto(foto, index)
          )
        );

        const fotosCampo = [];

        if (Array.isArray(data.fotos)) {
          const fotosOriginales = await Promise.all(
            data.fotos.map((foto, index) => {
              const objeto =
                typeof foto === "string"
                  ? { url: foto, archivo: foto }
                  : foto;

              return normalizarFoto(
                objeto,
                index + (fotosData || []).length
              );
            })
          );

          fotosCampo.push(
            ...fotosOriginales.filter(Boolean)
          );
        }

        if (cancelado) return;

        const todasLasFotos = [
          ...fotosTabla.filter(Boolean),
          ...fotosCampo,
        ];

        const fotosUnicas = [];
        const urlsVistas = new Set();

        todasLasFotos.forEach((foto) => {
          if (!foto?.url) return;

          const identificador =
            foto.archivo ||
            foto.url_storage_o_path ||
            foto.url;

          if (urlsVistas.has(identificador)) {
            return;
          }

          urlsVistas.add(identificador);
          fotosUnicas.push(foto);
        });

        setFotos(fotosUnicas);
      } catch (error) {
        console.error("Error general:", error);

        if (!cancelado) {
          setErrorMsg("Error cargando la inspección.");
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
      setErrorMsg(
        "El identificador de la inspección no es válido."
      );
      setLoading(false);
    }

    return () => {
      cancelado = true;
    };
  }, [id]);

  async function eliminarInspeccion() {
    const confirmar = window.confirm(
      "¿Seguro que deseas eliminar esta inspección? Se eliminarán también los registros asociados y se intentarán retirar sus fotografías."
    );

    if (!confirmar) return;

    try {
      const { data, error: invokeError } =
        await supabase.functions.invoke(
          "eliminarInspeccionCompleta",
          {
            body: { inspeccion_id: id },
          }
        );

      if (invokeError) {
        console.error(
          "Error eliminando inspección:",
          invokeError
        );

        alert(
          "No se ha podido completar la eliminación. La inspección puede seguir existiendo. Detalle: " +
            (invokeError.message ||
              "error de comunicación con Supabase")
        );

        return;
      }

      if (!data || data.ok !== true) {
        console.error(
          "Respuesta inesperada al eliminar inspección:",
          data
        );

        alert(
          data?.error ||
            "Supabase no ha confirmado la eliminación. No se continuará."
        );

        return;
      }

      if (data.limpiezaStoragePendiente) {
        alert(
          "La inspección se ha eliminado, pero algunas fotografías podrían seguir almacenadas. Es necesario revisar la limpieza de Storage."
        );
      } else {
        alert(
          "Inspección y fotografías asociadas eliminadas correctamente."
        );
      }

      navigate("/inspecciones");
    } catch (error) {
      console.error(
        "Error inesperado eliminando inspección:",
        error
      );

      alert(
        "Error inesperado al eliminar la inspección. Comprueba el estado antes de volver a intentarlo."
      );
    }
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
            {errorMsg ||
              `No se encontró la inspección con ID: ${id}`}
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
    inspeccion.ciudad ||
    null;

  const provincia =
    vivienda?.provincia ||
    inspeccion.provincia ||
    null;

  const codigoPostal =
    vivienda?.codigo_postal ||
    vivienda?.cp ||
    inspeccion.codigo_postal ||
    inspeccion.cp ||
    null;

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

  const pendienteRevision =
    inspeccion.estado === "completada_tecnico" &&
    inspeccion.estado_tecnico === "completada";

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

        {errorMsg && (
          <div
            style={{
              padding: "12px",
              marginBottom: "15px",
              borderRadius: "10px",
              background: "rgba(239,68,68,0.12)",
              border: "1px solid rgba(239,68,68,0.4)",
              color: "#f87171",
            }}
          >
            {errorMsg}
          </div>
        )}

        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(77,184,255,0.25)",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "18px",
          }}
        >
          <h3
            style={{
              color: "#4db8ff",
              marginTop: 0,
              marginBottom: "15px",
            }}
          >
            Datos de la vivienda
          </h3>

          <p>
            <strong>Dirección:</strong> {direccion}
          </p>

          <p>
            <strong>Localidad:</strong> {localidad}
          </p>

          {ciudad && ciudad !== localidad && (
            <p>
              <strong>Ciudad:</strong> {ciudad}
            </p>
          )}

          {provincia && (
            <p>
              <strong>Provincia:</strong> {provincia}
            </p>
          )}

          {codigoPostal && (
            <p>
              <strong>Código postal:</strong> {codigoPostal}
            </p>
          )}
        </div>

        <p>
          <strong>Fecha:</strong>{" "}
          {formatearFecha(inspeccion.fecha)}
        </p>

        <p>
          <strong>Estado:</strong>{" "}
          {inspeccion.estado || "Pendiente"}
        </p>

        <p>
          <strong>Estado técnico:</strong>{" "}
          {estadoTecnico}
        </p>

        <p>
          <strong>Estado administración:</strong>{" "}
          {estadoAdmin}
        </p>

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
            background: "rgba(255,255,255,0.05)",
            borderRadius: "10px",
            padding: "14px",
            whiteSpace: "pre-wrap",
            opacity: 0.9,
            marginBottom: "20px",
          }}
        >
          {observaciones}
        </div>

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
              background: "rgba(255,255,255,0.05)",
              color: "#aaa",
              marginBottom: "20px",
            }}
          >
            No hay fotos registradas para esta inspección.
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
            {fotos.map((foto, index) => (
              <a
                key={foto.id || `foto-${index}`}
                href={foto.url}
                target="_blank"
                rel="noreferrer"
                style={{ textDecoration: "none" }}
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
                    border: foto.principal
                      ? "3px solid #4ade80"
                      : "1px solid rgba(77,184,255,0.5)",
                    display: "block",
                    background: "#111827",
                  }}
                  onError={(e) => {
                    e.currentTarget.style.opacity = "0.35";
                  }}
                />
              </a>
            ))}
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: "15px",
            flexWrap: "wrap",
            marginTop: "20px",
          }}
        >
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

        {pendienteRevision && (
          <button
            onClick={() =>
              navigate(`/inspecciones/finalizar/${id}`)
            }
            style={{
              marginTop: "25px",
              padding: "15px",
              width: "100%",
              background: "#4ade80",
              color: "#052e16",
              borderRadius: "10px",
              border: "none",
              fontWeight: "800",
              fontSize: "17px",
              cursor: "pointer",
            }}
          >
            ✔ Revisar y publicar para el cliente
          </button>
        )}

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

        <button
          onClick={() => navigate("/inspecciones")}
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
