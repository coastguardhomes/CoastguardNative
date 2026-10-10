import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useParams, useNavigate } from "react-router-dom";

const BUCKET_FOTOS = "fotos";
const DURACION_URL_FIRMADA = 3600;

function obtenerRutaStorage(valor) {
  if (!valor || typeof valor !== "string") return null;

  const texto = valor.trim();
  if (!texto) return null;

  // Las rutas internas de Storage se conservan tal cual.
  if (!/^https?:\/\//i.test(texto) && !/^data:/i.test(texto)) {
    return texto.replace(/^\/+/, "");
  }

  if (/^data:/i.test(texto)) return null;

  try {
    const url = new URL(texto);
    const marcador = "/storage/v1/object/";
    const posicion = url.pathname.indexOf(marcador);

    if (posicion === -1) return null;

    const resto = url.pathname.slice(posicion + marcador.length);
    const prefijos = [
      `public/${BUCKET_FOTOS}/`,
      `sign/${BUCKET_FOTOS}/`,
      `authenticated/${BUCKET_FOTOS}/`,
    ];

    const prefijo = prefijos.find((item) => resto.startsWith(item));

    if (!prefijo) return null;

    return decodeURIComponent(resto.slice(prefijo.length));
  } catch {
    return null;
  }
}

async function resolverUrlFoto(valor) {
  if (!valor || typeof valor !== "string") return "";

  const texto = valor.trim();
  if (!texto) return "";

  const ruta = obtenerRutaStorage(texto);

  if (ruta) {
    const { data, error } = await supabase.storage
      .from(BUCKET_FOTOS)
      .createSignedUrl(ruta, DURACION_URL_FIRMADA);

    if (error) {
      console.error("Error generando URL firmada de la foto:", error);
      return "";
    }

    return data?.signedUrl || "";
  }

  // Compatibilidad con imágenes antiguas externas a Supabase.
  if (/^https?:\/\//i.test(texto)) {
    try {
      const url = new URL(texto);

      if (url.protocol === "https:" || url.protocol === "http:") {
        return texto;
      }
    } catch {
      // URL antigua no válida.
    }
  }

  return "";
}

export default function Checklist() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [inspeccion, setInspeccion] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [items, setItems] = useState([]);
  const [observaciones, setObservaciones] = useState("");
  const [fotos, setFotos] = useState([]);
  const [fotosVisibles, setFotosVisibles] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [finalizando, setFinalizando] = useState(false);

  useEffect(() => {
    let cancelado = false;

    async function cargarDatos() {
      try {
        const { data: insp, error: inspError } = await supabase
          .from("inspecciones")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (inspError) throw inspError;

        if (cancelado) return;

        setInspeccion(insp);

        if (!insp) {
          setMensaje("No se encontró la inspección o no tienes permiso para verla.");
          return;
        }

        setObservaciones(insp.observaciones || "");

        const fotosGuardadas = Array.isArray(insp.fotos_url)
          ? insp.fotos_url.filter(
              (foto) => typeof foto === "string" && foto.trim()
            )
          : [];

        setFotos(fotosGuardadas);

        const fotosConUrl = await Promise.all(
          fotosGuardadas.map(async (valor, index) => ({
            id: `${valor}-${index}`,
            valor,
            url: await resolverUrlFoto(valor),
          }))
        );

        if (cancelado) return;
        setFotosVisibles(fotosConUrl);

        if (insp.cliente_id) {
          const { data: cli, error: cliError } = await supabase
            .from("clientes")
            .select("*")
            .eq("id", insp.cliente_id)
            .maybeSingle();

          if (cliError) {
            console.error("Error cargando cliente:", cliError);
          }

          if (!cancelado) setCliente(cli);
        }

        const { data: checklist, error: checklistError } = await supabase
          .from("checklist_inspeccion")
          .select("*")
          .eq("inspeccion_id", id);

        if (checklistError) throw checklistError;

        if (!cancelado) setItems(checklist || []);
      } catch (error) {
        console.error("Error cargando datos de inspección:", error);

        if (!cancelado) {
          setMensaje(
            "Error cargando los datos de la inspección: " +
              (error.message || "Error desconocido")
          );
        }
      }
    }

    if (id) {
      cargarDatos();
    } else {
      setMensaje("El identificador de la inspección no es válido.");
    }

    return () => {
      cancelado = true;
    };
  }, [id]);

  function limpiarTexto(texto) {
    return texto
      .replace(/[^\x00-\x7F]/g, "")
      .replace(/[\u2028\u2029]/g, "");
  }

  async function marcarItem(itemId, valor) {
    const { error } = await supabase
      .from("checklist_inspeccion")
      .update({
        completado: valor,
      })
      .eq("id", itemId);

    if (error) {
      console.error("Error actualizando checklist:", error);
      setMensaje("Error actualizando el elemento del checklist.");
      return;
    }

    setItems((actuales) =>
      actuales.map((item) =>
        item.id === itemId
          ? {
              ...item,
              completado: valor,
            }
          : item
      )
    );

    setMensaje("");
  }

  async function subirFoto(e) {
    const input = e.target;
    const archivo = input.files?.[0];

    if (!archivo || subiendoFoto || finalizando) return;

    if (!archivo.type.startsWith("image/")) {
      setMensaje("Selecciona un archivo de imagen válido.");
      input.value = "";
      return;
    }

    let nombre = null;

    try {
      setSubiendoFoto(true);
      setMensaje("Subiendo foto...");

      const extensionOriginal =
        archivo.name?.split(".").pop()?.toLowerCase() || "jpg";

      const extension = /^[a-z0-9]{1,10}$/.test(extensionOriginal)
        ? extensionOriginal
        : "jpg";

      nombre = `inspecciones/${id}/foto_${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_FOTOS)
        .upload(nombre, archivo, {
          contentType: archivo.type,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Comprobar que la foto se puede leer antes de registrarla.
      const urlFirmada = await resolverUrlFoto(nombre);

      if (!urlFirmada) {
        const { error: errorLimpieza } = await supabase.storage
          .from(BUCKET_FOTOS)
          .remove([nombre]);

        if (errorLimpieza) {
          console.error(
            "No se pudo limpiar la foto subida:",
            errorLimpieza
          );
        }

        nombre = null;
        throw new Error(
          "La foto se subió, pero no se pudo generar una URL segura para mostrarla."
        );
      }

      // Se conserva el formato del campo fotos_url, pero guardando
      // la ruta interna de Storage y no una URL pública.
      setFotos((actuales) => [...actuales, nombre]);
      setFotosVisibles((actuales) => [
        ...actuales,
        {
          id: `${nombre}-${actuales.length}`,
          valor: nombre,
          url: urlFirmada,
        },
      ]);

      setMensaje("Foto subida correctamente.");
      input.value = "";
    } catch (error) {
      console.error("Error subiendo foto:", error);

      setMensaje(
        "Error subiendo la foto: " +
          (error.message || "Error desconocido")
      );
    } finally {
      setSubiendoFoto(false);
    }
  }

  async function finalizar() {
    if (finalizando || subiendoFoto) return;

    if (!id) {
      setMensaje("El identificador de la inspección no es válido.");
      return;
    }

    setFinalizando(true);
    setMensaje("");

    try {
      const textoLimpio = limpiarTexto(observaciones);

      const { error } = await supabase
        .from("inspecciones")
        .update({
          observaciones: textoLimpio,
          fotos_url: fotos,

          // El técnico entrega la inspección al administrador.
          // No se publica automáticamente para el cliente.
          estado: "completada_tecnico",
          estado_tecnico: "completada",
          estado_admin: "pendiente",
        })
        .eq("id", id);

      if (error) throw error;

      /*
       * No enviar correos, crear facturas, usar Stripe,
       * llamar a FacturaDirecta ni publicar el PDF para el cliente.
       * La publicación corresponde al administrador.
       */

      setMensaje("Inspección enviada al administrador para revisión.");

      setTimeout(() => {
        navigate("/inspecciones");
      }, 1500);
    } catch (error) {
      console.error("Error guardando inspección:", error);

      setMensaje(
        "Error guardando inspección: " +
          (error.message || "Error desconocido")
      );
    } finally {
      setFinalizando(false);
    }
  }

  return (
    <Menu>
      <div
        style={{
          padding: 20,
          color: "#fff",
        }}
      >
        <h2>Checklist Técnico</h2>

        {mensaje && (
          <p
            role="status"
            style={{
              color: "#4db8ff",
              marginBottom: 20,
              overflowWrap: "anywhere",
            }}
          >
            {mensaje}
          </p>
        )}

        {cliente && (
          <div style={{ marginBottom: 20 }}>
            <p>
              <b>Cliente:</b> {cliente.nombre}
            </p>

            <p>
              <b>Email:</b> {cliente.email}
            </p>

            <p>
              <b>Teléfono:</b> {cliente.telefono}
            </p>
          </div>
        )}

        <h3>Checklist</h3>

        {items.map((item) => (
          <div
            key={item.id}
            style={{ marginBottom: 10 }}
          >
            <span>{item.item}</span>

            <input
              type="checkbox"
              checked={!!item.completado}
              disabled={finalizando || subiendoFoto}
              onChange={(e) =>
                marcarItem(item.id, e.target.checked)
              }
              style={{ marginLeft: 10 }}
            />
          </div>
        ))}

        <label htmlFor="observaciones">
          Observaciones:
        </label>

        <textarea
          id="observaciones"
          value={observaciones}
          disabled={finalizando || subiendoFoto}
          onChange={(e) => setObservaciones(e.target.value)}
          style={{
            width: "100%",
            minHeight: 120,
            marginTop: 8,
            marginBottom: 15,
          }}
        />

        <label htmlFor="foto-inspeccion">
          Fotos:
        </label>

        <input
          id="foto-inspeccion"
          type="file"
          accept="image/*"
          onChange={subirFoto}
          disabled={subiendoFoto || finalizando}
          style={{
            display: "block",
            marginTop: 8,
          }}
        />

        <div
          style={{
            marginTop: 20,
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          {fotosVisibles.map((foto) =>
            foto.url ? (
              <img
                key={foto.id}
                src={foto.url}
                alt="Foto de inspección"
                style={{
                  width: 120,
                  height: 120,
                  objectFit: "cover",
                  borderRadius: 8,
                }}
              />
            ) : (
              <div
                key={foto.id}
                role="status"
                style={{
                  width: 120,
                  height: 120,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  fontSize: 12,
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: 8,
                  padding: 6,
                }}
              >
                No se pudo cargar esta foto
              </div>
            )
          )}
        </div>

        <button
          type="button"
          onClick={finalizar}
          disabled={finalizando || subiendoFoto}
          style={{
            marginTop: 20,
            padding: 12,
            width: "100%",
            background: "#4db8ff",
            color: "#000",
            borderRadius: 10,
            border: "none",
            fontWeight: "700",
            cursor:
              finalizando || subiendoFoto
                ? "not-allowed"
                : "pointer",
            opacity:
              finalizando || subiendoFoto
                ? 0.6
                : 1,
          }}
        >
          {finalizando
            ? "Enviando..."
            : subiendoFoto
              ? "Espera a que termine la subida..."
              : "Finalizar y Enviar al Admin"}
        </button>
      </div>
    </Menu>
  );
}
