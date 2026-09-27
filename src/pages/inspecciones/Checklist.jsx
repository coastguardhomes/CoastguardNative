import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useParams, useNavigate } from "react-router-dom";

export default function Checklist() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [inspeccion, setInspeccion] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [items, setItems] = useState([]);
  const [observaciones, setObservaciones] = useState("");
  const [fotos, setFotos] = useState([]);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    const { data: insp, error: inspError } = await supabase
      .from("inspecciones")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (inspError) {
      console.error("Error cargando inspección:", inspError);
      setMensaje("Error cargando inspección");
      return;
    }

    setInspeccion(insp);

    if (insp?.observaciones) {
      setObservaciones(insp.observaciones);
    }

    if (Array.isArray(insp?.fotos_url)) {
      setFotos(insp.fotos_url);
    }

    if (insp?.cliente_id) {
      const { data: cli, error: cliError } = await supabase
        .from("clientes")
        .select("*")
        .eq("id", insp.cliente_id)
        .maybeSingle();

      if (cliError) {
        console.error("Error cargando cliente:", cliError);
      }

      setCliente(cli);
    }

    const { data: checklist, error: checklistError } = await supabase
      .from("checklist_inspeccion")
      .select("*")
      .eq("inspeccion_id", id);

    if (checklistError) {
      console.error("Error cargando checklist:", checklistError);
      return;
    }

    setItems(checklist || []);
  }

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
  }

  async function subirFoto(e) {
    const archivo = e.target.files?.[0];

    if (!archivo) return;

    const extension =
      archivo.name?.split(".").pop()?.toLowerCase() || "jpg";

    const nombre = `inspecciones/${id}/foto_${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("fotos")
      .upload(nombre, archivo);

    if (uploadError) {
      console.error("Error subiendo foto:", uploadError);
      setMensaje("Error subiendo la foto");
      return;
    }

    const {
      data: publicUrlData,
    } = supabase.storage
      .from("fotos")
      .getPublicUrl(nombre);

    const url = publicUrlData?.publicUrl;

    if (!url) {
      setMensaje("No se pudo obtener la URL de la foto");
      return;
    }

    setFotos((actuales) => [...actuales, url]);

    e.target.value = "";
  }

  async function finalizar() {
    setMensaje("");

    const textoLimpio = limpiarTexto(observaciones);

    const { error } = await supabase
      .from("inspecciones")
      .update({
        observaciones: textoLimpio,
        fotos_url: fotos,

        // IMPORTANTE:
        // El técnico solamente entrega la inspección al administrador.
        // Todavía NO está publicada para el cliente.
        estado: "completada_tecnico",
        estado_tecnico: "completada",
        estado_admin: "pendiente",
      })
      .eq("id", id);

    if (error) {
      console.error("Error guardando inspección:", error);
      setMensaje("Error guardando inspección");
      return;
    }

    /*
     * NO hacer aquí:
     *
     * - enviar-email
     * - crear factura
     * - Stripe
     * - FacturaDirecta
     * - PDF para cliente
     *
     * El único responsable de publicar la inspección
     * al cliente es el administrador.
     */

    setMensaje(
      "Inspección enviada al administrador para revisión"
    );

    setTimeout(() => {
      navigate("/inspecciones");
    }, 1500);
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
            style={{
              color: "#4db8ff",
              marginBottom: 20,
            }}
          >
            {mensaje}
          </p>
        )}

        {cliente && (
          <div
            style={{
              marginBottom: 20,
            }}
          >
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
            style={{
              marginBottom: 10,
            }}
          >
            <span>{item.item}</span>

            <input
              type="checkbox"
              checked={!!item.completado}
              onChange={(e) =>
                marcarItem(
                  item.id,
                  e.target.checked
                )
              }
              style={{
                marginLeft: 10,
              }}
            />
          </div>
        ))}

        <label>
          Observaciones:
        </label>

        <textarea
          value={observaciones}
          onChange={(e) =>
            setObservaciones(e.target.value)
          }
          style={{
            width: "100%",
            minHeight: 120,
            marginTop: 8,
            marginBottom: 15,
          }}
        />

        <label>
          Fotos:
        </label>

        <input
          type="file"
          accept="image/*"
          onChange={subirFoto}
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
          {fotos.map((foto, index) => (
            <img
              key={`${foto}-${index}`}
              src={foto}
              alt="Foto de inspección"
              style={{
                width: 120,
                height: 120,
                objectFit: "cover",
                borderRadius: 8,
              }}
            />
          ))}
        </div>

        <button
          onClick={finalizar}
          style={{
            marginTop: 20,
            padding: 12,
            width: "100%",
            background: "#4db8ff",
            color: "#000",
            borderRadius: 10,
            border: "none",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          Finalizar y Enviar al Admin
        </button>
      </div>
    </Menu>
  );
}
