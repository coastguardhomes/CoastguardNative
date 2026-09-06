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
    // Cargar inspección
    const { data: insp } = await supabase
      .from("inspecciones")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    setInspeccion(insp);

    // Cargar cliente
    if (insp?.cliente_id) {
      const { data: cli } = await supabase
        .from("clientes")
        .select("*")
        .eq("id", insp.cliente_id)
        .maybeSingle();

      setCliente(cli);
    }

    // Cargar checklist
    const { data: checklist } = await supabase
      .from("checklist_inspeccion")
      .select("*")
      .eq("inspeccion_id", id);

    setItems(checklist || []);
  }

  // ⭐ SANITIZAR TEXTO DEL TRADUCTOR
  function limpiarTexto(texto) {
    return texto
      .replace(/[^\x00-\x7F]/g, "")
      .replace(/[\u2028\u2029]/g, "");
  }

  async function marcarItem(itemId, valor) {
    await supabase
      .from("checklist_inspeccion")
      .update({ completado: valor })
      .eq("id", itemId);

    setItems(
      items.map((i) =>
        i.id === itemId ? { ...i, completado: valor } : i
      )
    );
  }

  async function subirFoto(e) {
    const archivo = e.target.files[0];
    if (!archivo) return;

    const nombre = `foto_${Date.now()}.jpg`;

    const { data, error } = await supabase.storage
      .from("fotos")
      .upload(nombre, archivo);

    if (!error) {
      const url = supabase.storage.from("fotos").getPublicUrl(nombre).data.publicUrl;
      setFotos([...fotos, url]);
    }
  }

  async function finalizar() {
    const textoLimpio = limpiarTexto(observaciones);

    const { error } = await supabase
      .from("inspecciones")
      .update({
        observaciones: textoLimpio,
        fotos_url: fotos,
        estado_tecnico: "completada",
        estado_admin: "pendiente",
      })
      .eq("id", id);

    if (error) {
      setMensaje("Error guardando inspección");
      return;
    }

    // Enviar al admin
    try {
      await supabase.functions.invoke("enviar-email", {
        body: { inspeccionId: id, tipo: "inspeccion" },
      });
    } catch (e) {
      console.error(e);
    }

    setMensaje("Inspección enviada correctamente");
    setTimeout(() => navigate("/inspecciones"), 1500);
  }

  return (
    <Menu>
      <div style={{ padding: 20, color: "#fff" }}>
        <h2>Checklist Técnico</h2>

        {mensaje && <p style={{ color: "#4db8ff" }}>{mensaje}</p>}

        {cliente && (
          <div style={{ marginBottom: 20 }}>
            <p><b>Cliente:</b> {cliente.nombre}</p>
            <p><b>Email:</b> {cliente.email}</p>
            <p><b>Teléfono:</b> {cliente.telefono}</p>
          </div>
        )}

        <h3>Checklist</h3>
        {items.map((i) => (
          <div key={i.id} style={{ marginBottom: 10 }}>
            <span>{i.item}</span>
            <input
              type="checkbox"
              checked={i.completado}
              onChange={(e) => marcarItem(i.id, e.target.checked)}
              style={{ marginLeft: 10 }}
            />
          </div>
        ))}

        <label>Observaciones:</label>
        <textarea
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          style={{ width: "100%", minHeight: 120 }}
        />

        <label>Fotos:</label>
        <input type="file" accept="image/*" onChange={subirFoto} />

        <div style={{ marginTop: 20 }}>
          {fotos.map((f, i) => (
            <img key={i} src={f} alt="foto" style={{ width: 120, marginRight: 10 }} />
          ))}
        </div>

        <button
          onClick={finalizar}
          style={{
            marginTop: 20,
            padding: 12,
            background: "#4db8ff",
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
