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

export default function VerInspeccion() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [inspeccion, setInspeccion] =
    useState(null);

  const [vivienda, setVivienda] =
    useState(null);

  const [fotos, setFotos] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [errorMsg, setErrorMsg] =
    useState("");

  const [publicando, setPublicando] =
    useState(false);

  function formatearFecha(fechaISO) {
    if (!fechaISO) return "Sin fecha";

    const fecha = new Date(fechaISO);

    if (Number.isNaN(fecha.getTime())) {
      return "Sin fecha";
    }

    const dia = String(
      fecha.getDate()
    ).padStart(2, "0");

    const mes = String(
      fecha.getMonth() + 1
    ).padStart(2, "0");

    const año = fecha.getFullYear();

    return `${dia}/${mes}/${año}`;
  }

  function obtenerUrlFoto(foto) {
    if (!foto) return "";

    if (
      typeof foto.url === "string" &&
      foto.url.startsWith("http")
    ) {
      return foto.url;
    }

    const archivo =
      foto.archivo ||
      foto.url_storage_o_path ||
      (typeof foto.url === "string"
        ? foto.url
        : "");

    if (!archivo) {
      return "";
    }

    if (archivo.startsWith("http")) {
      return archivo;
    }

    const { data } =
      supabase.storage
        .from("fotos")
        .getPublicUrl(archivo);

    return data?.publicUrl || "";
  }

  function normalizarFoto(
    foto,
    index = 0
  ) {
    if (!foto) return null;

    const url =
      obtenerUrlFoto(foto);

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
        const {
          data,
          error,
        } = await supabase
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

        if (!data) {
          setErrorMsg(
            "No se encontró la inspección."
          );

          return;
        }

        setInspeccion(data);

        if (data.vivienda_id) {
          const {
            data: viviendaData,
            error:
              viviendaError,
          } = await supabase
            .from("viviendas")
            .select("*")
            .eq(
              "id",
              data.vivienda_id
            )
            .maybeSingle();

          if (viviendaError) {
            console.error(
              "Error cargando vivienda:",
              viviendaError
            );
          } else if (viviendaData) {
            setVivienda(
              viviendaData
            );
          }
        }

        const {
          data: fotosData,
          error: fotosError,
        } = await supabase
          .from("fotos_inspeccion")
          .select("*")
          .eq(
            "inspeccion_id",
            String(id)
          )
          .order("id", {
            ascending: false,
          });

        if (fotosError) {
          console.error(
            "Error cargando fotos:",
            fotosError
          );
        }

        const fotosTabla =
          (fotosData || [])
            .map(
              (foto, index) =>
                normalizarFoto(
                  foto,
                  index
                )
            )
            .filter(Boolean);

        const fotosCampo = [];

        if (
          Array.isArray(
            data.fotos
          )
        ) {
          data.fotos.forEach(
            (foto, index) => {
              const objeto =
                typeof foto ===
                "string"
                  ? {
                      url: foto,
                      archivo: foto,
                    }
                  : foto;

              const fotoNormalizada =
                normalizarFoto(
                  objeto,
                  index +
                    fotosTabla.length
                );

              if (
                fotoNormalizada
              ) {
                fotosCampo.push(
                  fotoNormalizada
                );
              }
            }
          );
        }

        const todasLasFotos = [
          ...fotosTabla,
          ...fotosCampo,
        ];

        const fotosUnicas = [];
        const urlsVistas =
          new Set();

        todasLasFotos.forEach(
          (foto) => {
            if (!foto?.url) {
              return;
            }

            if (
              urlsVistas.has(
                foto.url
              )
            ) {
              return;
            }

            urlsVistas.add(
              foto.url
            );

            fotosUnicas.push(
              foto
            );
          }
        );

        setFotos(
          fotosUnicas
        );

      } catch (error) {
        console.error(
          "Error general:",
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

  async function publicarParaCliente() {
    if (!inspeccion) return;

    if (
      inspeccion.estado !==
        "completada_tecnico" ||
      inspeccion.estado_tecnico !==
        "completada"
    ) {
      setErrorMsg(
        "Esta inspección no está pendiente de revisión administrativa."
      );
      return;
    }

    const confirmar =
      window.confirm(
        "¿Has revisado las fotos y observaciones y quieres enviar esta inspección al cliente?"
      );

    if (!confirmar) {
      return;
    }

    setPublicando(true);
    setErrorMsg("");

    try {
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
        console.error(
          "Error publicando inspección:",
          error
        );

        setErrorMsg(
          "No se pudo enviar la inspección al cliente: " +
          error.message
        );

        return;
      }

      if (!data) {
        setErrorMsg(
          "La inspección ya no está pendiente de revisión administrativa."
        );

        return;
      }

      setInspeccion(data);

      alert(
        "Inspección enviada al cliente correctamente."
      );

    } catch (error) {
      console.error(
        "Error publicando inspección:",
        error
      );

      setErrorMsg(
        "Error al enviar la inspección al cliente."
      );
    } finally {
      setPublicando(false);
    }
  }

  async function eliminarInspeccion() {
    const confirmar =
      window.confirm(
        "¿Seguro que deseas eliminar esta inspección?"
      );

    if (!confirmar) return;

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
      error: fotosError,
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
            style={{
              color: "#4db8ff",
            }}
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
    inspeccion.estado ===
      "completada_tecnico" &&
    inspeccion.estado_tecnico ===
      "completada";

  return (
    <Menu>
      <div
        style={{
          padding: "20px",
          background: "#0a0f1a",
          minHeight: "100vh",
          color: "#fff",
          paddingBottom: "80px",
          fontFamily:
            "Inter, sans-serif",
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
              background:
                "rgba(239,68,68,0.12)",
              border:
                "1px solid rgba(239,68,68,0.4)",
              color: "#f87171",
            }}
          >
            {errorMsg}
          </div>
        )}

        <div
          style={{
            background:
              "rgba(255,255,255,0.05)",
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
              marginBottom: "15px",
            }}
          >
            Datos de la vivienda
          </h3>

          <p>
            <strong>
              Dirección:
            </strong>{" "}
            {direccion}
          </p>

          <p>
            <strong>
              Localidad:
            </strong>{" "}
            {localidad}
          </p>

          {ciudad &&
            ciudad !== localidad && (
              <p>
                <strong>
                  Ciudad:
                </strong>{" "}
                {ciudad}
              </p>
            )}

          {provincia && (
            <p>
              <strong>
                Provincia:
              </strong>{" "}
              {provincia}
            </p>
          )}

          {codigoPostal && (
            <p>
              <strong>
                Código postal:
              </strong>{" "}
              {codigoPostal}
            </p>
          )}
        </div>

        <p>
          <strong>
            Fecha:
          </strong>{" "}
          {formatearFecha(
            inspeccion.fecha
          )}
        </p>

        <p>
          <strong>
            Estado:
          </strong>{" "}
          {inspeccion.estado ||
            "Pendiente"}
        </p>

        <p>
          <strong>
            Estado técnico:
          </strong>{" "}
          {estadoTecnico}
        </p>

        <p>
          <strong>
            Estado administración:
          </strong>{" "}
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
            No hay fotos registradas
            para esta inspección.
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
            {fotos.map(
              (foto, index) => (
                <a
                  key={
                    foto.id ||
                    `foto-${index}`
                  }
                  href={foto.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    textDecoration:
                      "none",
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
                      objectFit:
                        "cover",
                      borderRadius:
                        "10px",
                      border:
                        foto.principal
                          ? "3px solid #4ade80"
                          : "1px solid rgba(77,184,255,0.5)",
                      display:
                        "block",
                      background:
                        "#111827",
                    }}
                    onError={(e) => {
                      e.currentTarget.style.opacity =
                        "0.35";
                    }}
                  />
                </a>
              )
            )}
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
            to={`/inspecciones/checklist/${id}`}
            style={{
              color: "#4db8ff",
              fontWeight: "bold",
              textDecoration:
                "none",
            }}
          >
            📋 Ir al Checklist
          </Link>

          <Link
            to={`/inspecciones/fotos/${id}`}
            style={{
              color: "#4db8ff",
              fontWeight: "bold",
              textDecoration:
                "none",
            }}
          >
            🖼️ Ver Galería de Fotos
          </Link>

          <Link
            to={`/inspecciones/pdf/${id}`}
            style={{
              color: "#4db8ff",
              fontWeight: "bold",
              textDecoration:
                "none",
            }}
          >
            📄 Ver PDF
          </Link>
        </div>

        {pendienteRevision && (
          <button
            onClick={publicarParaCliente}
            disabled={publicando}
            style={{
              marginTop: "25px",
              padding: "15px",
              width: "100%",
              background: publicando
                ? "#64748b"
                : "#4ade80",
              color: "#052e16",
              borderRadius: "10px",
              border: "none",
              fontWeight: "800",
              fontSize: "17px",
              cursor: publicando
                ? "not-allowed"
                : "pointer",
            }}
          >
            {publicando
              ? "Enviando al cliente..."
              : "✔ Revisar y enviar al cliente"}
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
          onClick={() =>
            navigate(
              "/inspecciones"
            )
          }
          style={{
            marginTop: "12px",
            padding: "14px",
            width: "100%",
            background:
              "transparent",
            color: "#4db8ff",
            borderRadius: "10px",
            border:
              "1px solid #4db8ff",
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
