import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useParams, useNavigate, Link } from "react-router-dom";

export default function VerContrato() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [contrato, setContrato] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [cliente, setCliente] = useState(null);
  const [vivienda, setVivienda] = useState(null);
  const [tecnico, setTecnico] = useState(null);
  const [inspecciones, setInspecciones] = useState([]);
  const [generandoPdf, setGenerandoPdf] = useState(false);

  useEffect(() => {
    cargarContrato();
  }, [id]);

  useEffect(() => {
    if (contrato) cargarRelacionados();
  }, [contrato]);

  async function cargarContrato() {
    const { data, error } = await supabase
      .from("contratos")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      setMensaje("Error cargando contrato");
      return;
    }

    setContrato(data);
  }

  async function cargarRelacionados() {
    // Cliente
    const { data: cli } = await supabase
      .from("clientes")
      .select("*")
      .eq("id", contrato.cliente_id)
      .single();
    setCliente(cli || null);

    // Vivienda
    const { data: viv } = await supabase
      .from("viviendas")
      .select("*")
      .eq("id", contrato.vivienda_id)
      .single();
    setVivienda(viv || null);

    // Técnico
    const { data: tec } = await supabase
      .from("tecnicos")
      .select("*")
      .eq("id", contrato.tecnico_id)
      .single();
    setTecnico(tec || null);

    // Inspecciones
    const { data: insp } = await supabase
      .from("inspecciones")
      .select("*")
      .eq("contrato_id", id)
      .order("fecha", { ascending: false });

    setInspecciones(insp || []);
  }

  async function manejarPdf() {
    if (contrato.pdf_url) {
      window.open(contrato.pdf_url, "_blank");
      return;
    }

    setGenerandoPdf(true);
    setMensaje("Generando PDF del contrato...");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session ? session.access_token : "";

      const pdfResponse = await fetch(
        `https://wjomazuymbayceilvfku.supabase.co/functions/v1/contrato-pdf?id=${id}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      const respuestaTexto = await pdfResponse.text();

      if (pdfResponse.ok) {
        await supabase
          .from("contratos")
          .update({ pdf_url: respuestaTexto })
          .eq("id", id);

        setContrato({ ...contrato, pdf_url: respuestaTexto });
        setMensaje("");
        window.open(respuestaTexto, "_blank");
      } else {
        setMensaje(`Error del servidor: ${respuestaTexto || pdfResponse.statusText}`);
      }
    } catch (e) {
      console.error(e);
      setMensaje(`Fallo de red: ${e.message}`);
    } finally {
      setGenerandoPdf(false);
    }
  }

  async function eliminarContrato() {
    const confirmar = window.confirm("¿Seguro que deseas eliminar este contrato?");
    if (!confirmar) return;

    await supabase.from("checklist_inspeccion").delete().eq("contrato_id", id);
    await supabase.from("inspecciones").delete().eq("contrato_id", id);

    const { error } = await supabase.from("contratos").delete().eq("id", id);

    if (error) {
      setMensaje("Error eliminando contrato");
      return;
    }

    alert("Contrato eliminado correctamente");
    navigate("/contratos");
  }

  if (!contrato) {
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
            fontFamily: "Inter, sans-serif",
          }}
        >
          Cargando contrato...
        </div>
      </Menu>
    );
  }

  return (
    <Menu>
      <div
        style={{
          padding: "20px",
          background: "#0a0f1a",
          minHeight: "100vh",
          color: "#fff",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <h1
          style={{
            color: "#4db8ff",
            marginBottom: "25px",
            fontSize: "28px",
            fontWeight: "700",
            textShadow: "0 0 8px rgba(0,153,255,0.6)",
            textAlign: "center",
          }}
        >
          Contrato #{contrato.id}
        </h1>

        {mensaje && (
          <p
            style={{
              marginBottom: "15px",
              color: "#ff6b6b",
              fontWeight: "600",
            }}
          >
            {mensaje}
          </p>
        )}

        {/* Datos del contrato */}
        <Bloque titulo="Datos del contrato">
          <p><strong style={{ color: "#4db8ff" }}>Modalidad:</strong> {contrato.modalidad || "Sin modalidad"}</p>
          <p><strong style={{ color: "#4db8ff" }}>Precio:</strong> {contrato.precio ? `${contrato.precio}€` : "Sin precio"}</p>
          <p><strong style={{ color: "#4db8ff" }}>Frecuencia:</strong> {contrato.frecuencia || "Sin frecuencia"}</p>
          <p><strong style={{ color: "#4db8ff" }}>Fecha inicio:</strong> {contrato.fecha_inicio || "Sin fecha"}</p>
          <p><strong style={{ color: "#4db8ff" }}>Fecha fin:</strong> {contrato.fecha_fin || "Sin fecha"}</p>
          <p><strong style={{ color: "#4db8ff" }}>Estado:</strong> {contrato.estado || "Sin estado"}</p>

          <button
            onClick={manejarPdf}
            disabled={generandoPdf}
            style={{
              display: "inline-block",
              marginTop: "10px",
              padding: "12px 16px",
              background: "#4db8ff",
              color: "#000",
              borderRadius: "8px",
              fontWeight: "700",
              border: "none",
              cursor: "pointer",
            }}
          >
            {generandoPdf ? "Generando PDF..." : contrato.pdf_url ? "Ver PDF del contrato" : "Generar / Ver PDF"}
          </button>
        </Bloque>

        {/* Técnico */}
        <Bloque titulo="Técnico asignado">
          {tecnico ? (
            <Item
              to={`/tecnicos/${tecnico.id}`}
              titulo={`${tecnico.nombre}`}
            />
          ) : (
            <p style={{ opacity: 0.7 }}>Técnico no encontrado.</p>
          )}
        </Bloque>

        {/* Cliente */}
        <Bloque titulo="Cliente">
          {cliente ? (
            <Item
              to={`/clientes/${cliente.id}`}
              titulo={`${cliente.nombre} — ${cliente.telefono}`}
            />
          ) : (
            <p style={{ opacity: 0.7 }}>Cliente no encontrado.</p>
          )}
        </Bloque>

        {/* Vivienda */}
        <Bloque titulo="Vivienda">
          {vivienda ? (
            <Item
              to={`/viviendas/${vivienda.id}`}
              titulo={vivienda.direccion}
            />
          ) : (
            <p style={{ opacity: 0.7 }}>Vivienda no encontrada.</p>
          )}
        </Bloque>

        {/* Firma */}
        <Bloque titulo="Firma del cliente">
          {contrato.firma ? (
            <img
              src={contrato.firma}
              alt="Firma del cliente"
              style={{ width: "100%", borderRadius: "10px" }}
            />
          ) : (
            <p style={{ opacity: 0.7 }}>Sin firma.</p>
          )}

          <p>
            <strong style={{ color: "#4db8ff" }}>Firmado en:</strong>{" "}
            {contrato.firmado_en || "Sin fecha"}
          </p>
        </Bloque>

        {/* Inspecciones */}
        <Bloque titulo="Inspecciones del contrato">
          {inspecciones.length === 0 ? (
            <p style={{ opacity: 0.7 }}>No hay inspecciones.</p>
          ) : (
            inspecciones.map((i) => (
              <Item
                key={i.id}
                to={`/inspecciones/${i.id}`}
                titulo={`Inspección del ${i.fecha} — Estado: ${i.estado}`}
              />
            ))
          )}
        </Bloque>

        {/* Botón editar */}
        <Link to={`/contratos/editar/${id}`}>
          <button
            style={{
              marginBottom: "15px",
              padding: "14px",
              width: "100%",
              background: "#4db8ff",
              color: "#000",
              borderRadius: "10px",
              border: "none",
              fontWeight: "700",
              fontSize: "17px",
              cursor: "pointer",
              boxShadow: "0 0 10px rgba(0,153,255,0.4)",
            }}
          >
            Editar contrato
          </button>
        </Link>

        {/* Botón eliminar */}
        <button
          onClick={eliminarContrato}
          style={{
            marginTop: "10px",
            padding: "14px",
            width: "100%",
            background: "red",
            color: "#fff",
            borderRadius: "10px",
            border: "none",
            fontWeight: "700",
            fontSize: "17px",
            cursor: "pointer",
            boxShadow: "0 0 10px rgba(255,0,0,0.4)",
          }}
        >
          Eliminar contrato
        </button>
      </div>
    </Menu>
  );
}

function Bloque({ titulo, children }) {
  return (
    <div style={{ marginBottom: "25px" }}>
      <h2
        style={{
          fontSize: "18px",
          marginBottom: "10px",
          color: "#4db8ff",
        }}
      >
        {titulo}
      </h2>

      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          padding: "12px",
          borderRadius: "10px",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function Item({ to, titulo }) {
  return (
    <Link to={to} style={{ textDecoration: "none" }}>
      <div
        style={{
          padding: "10px",
          marginBottom: "8px",
          background: "rgba(255,255,255,0.06)",
          borderRadius: "8px",
          border: "1px solid rgba(255,255,255,0.12)",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        {titulo}
      </div>
    </Link>
  );
}
