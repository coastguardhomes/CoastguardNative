import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";

export default function VerContrato() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [contrato, setContrato] = useState(null);

  const [cliente, setCliente] = useState(null);
  const [vivienda, setVivienda] = useState(null);
  const [tecnico, setTecnico] = useState(null);
  const [inspecciones, setInspecciones] = useState([]);

  useEffect(() => {
    cargarContrato();
  }, [id]);

  async function cargarContrato() {
    const { data, error } = await supabase
      .from("contratos")
      .select(`
        id,
        cliente_id,
        vivienda_id,
        tecnico_id,
        precio,
        notas,
        frecuencia,
        fecha_inicio,
        fecha_fin,
        pdf_url,
        firma,
        firmado_en,
        modalidad
      `)
      .eq("id", id)
      .single();

    if (!error) {
      setContrato(data);
      cargarRelacionados(data);
    }
  }

  async function cargarRelacionados(c) {
    const { data: clienteData } = await supabase
      .from("clientes")
      .select("id, nombre, email, telefono")
      .eq("id", c.cliente_id)
      .single();
    setCliente(clienteData || null);

    const { data: viviendaData } = await supabase
      .from("viviendas")
      .select("id, nombre, direccion")
      .eq("id", c.vivienda_id)
      .single();
    setVivienda(viviendaData || null);

    const { data: tecnicoData } = await supabase
      .from("tecnicos")
      .select("id, nombre, telefono")
      .eq("id", c.tecnico_id)
      .single();
    setTecnico(tecnicoData || null);

    const { data: inspData } = await supabase
      .from("inspecciones")
      .select("id, fecha, estado")
      .eq("contrato_id", c.id);

    setInspecciones(inspData || []);
  }

  async function borrarContrato() {
    const confirmar = window.confirm(
      "¿Seguro que quieres borrar este contrato? Esta acción no se puede deshacer."
    );

    if (!confirmar) return;

    await supabase.from("contratos").delete().eq("id", id);

    navigate("/contratos");
  }

  if (!contrato) {
    return (
      <Menu>
        <p style={{ padding: "20px", color: "#fff" }}>Cargando contrato...</p>
      </Menu>
    );
  }

  return (
    <Menu>
      <div
        style={{
          padding: "20px",
          background: "rgba(255,255,255,0.05)",
          borderRadius: "12px",
          border: "1px solid rgba(255,255,255,0.2)",
          color: "#fff",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <h1
          style={{
            marginBottom: "20px",
            color: "#4db8ff",
            fontWeight: "700",
            fontSize: "24px",
          }}
        >
          Contrato #{contrato.id}
        </h1>

        {/* Modalidad */}
        {contrato.modalidad && (
          <p style={{ marginBottom: "10px" }}>
            <strong style={{ color: "#4db8ff" }}>Modalidad:</strong>{" "}
            {contrato.modalidad}
          </p>
        )}

        {/* Cliente */}
        <Bloque titulo="Cliente asociado">
          {!cliente ? (
            <p style={{ opacity: 0.7 }}>No encontrado.</p>
          ) : (
            <Item
              to={`/clientes/${cliente.id}`}
              titulo={`${cliente.nombre} — ${cliente.email}`}
            />
          )}
        </Bloque>

        {/* Vivienda */}
        <Bloque titulo="Vivienda asociada">
          {!vivienda ? (
            <p style={{ opacity: 0.7 }}>No encontrada.</p>
          ) : (
            <Item
              to={`/viviendas/${vivienda.id}`}
              titulo={`${vivienda.nombre} — ${vivienda.direccion}`}
            />
          )}
        </Bloque>

        {/* Técnico */}
        <Bloque titulo="Técnico asignado">
          {!tecnico ? (
            <p style={{ opacity: 0.7 }}>No asignado.</p>
          ) : (
            <Item
              to={`/tecnicos/${tecnico.id}`}
              titulo={`${tecnico.nombre} — ${tecnico.telefono}`}
            />
          )}
        </Bloque>

        {/* Fecha inicio */}
        <p style={{ marginBottom: "10px" }}>
          <strong style={{ color: "#4db8ff" }}>Fecha inicio:</strong>{" "}
          {contrato.fecha_inicio || "Sin fecha"}
        </p>

        {/* Fecha fin */}
        <p style={{ marginBottom: "10px" }}>
          <strong style={{ color: "#4db8ff" }}>Fecha fin:</strong>{" "}
          {contrato.fecha_fin || "Sin fecha"}
        </p>

        {/* Precio */}
        <p style={{ marginBottom: "10px" }}>
          <strong style={{ color: "#4db8ff" }}>Precio:</strong>{" "}
          {contrato.precio ? `${contrato.precio} €` : "Sin precio"}
        </p>

        {/* Frecuencia */}
        <p style={{ marginBottom: "10px" }}>
          <strong style={{ color: "#4db8ff" }}>Frecuencia:</strong>{" "}
          {contrato.frecuencia ? `${contrato.frecuencia} días` : "Sin frecuencia"}
        </p>

        {/* Notas */}
        <p style={{ marginBottom: "10px" }}>
          <strong style={{ color: "#4db8ff" }}>Notas:</strong>{" "}
          {contrato.notas || "Sin notas"}
        </p>

        {/* Firma */}
        <p style={{ marginBottom: "10px" }}>
          <strong style={{ color: "#4db8ff" }}>Firmado:</strong>{" "}
          {contrato.firmado_en ? contrato.firmado_en : "No firmado"}
        </p>

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

        {/* PDF */}
        {contrato.pdf_url ? (
          <a href={contrato.pdf_url} target="_blank" rel="noopener noreferrer">
            <button
              style={{
                marginTop: "20px",
                padding: "12px 20px",
                background: "#4db8ff",
                borderRadius: "10px",
                border: "none",
                color: "#000",
                fontWeight: "700",
                cursor: "pointer",
                width: "100%",
              }}
            >
              Descargar PDF
            </button>
          </a>
        ) : (
          <p style={{ marginTop: "15px", opacity: 0.8 }}>No hay PDF generado.</p>
        )}

        {/* Editar */}
        <Link to={`/contratos/editar/${contrato.id}`}>
          <button
            style={{
              marginTop: "20px",
              padding: "12px 20px",
              background: "#1e90ff",
              borderRadius: "10px",
              border: "none",
              color: "#fff",
              fontWeight: "700",
              cursor: "pointer",
              width: "100%",
            }}
          >
            Editar contrato
          </button>
        </Link>

        {/* BORRAR CONTRATO */}
        <button
          onClick={borrarContrato}
          style={{
            marginTop: "20px",
            padding: "12px 20px",
            background: "red",
            borderRadius: "10px",
            border: "none",
            color: "#fff",
            fontWeight: "700",
            cursor: "pointer",
            width: "100%",
          }}
        >
          Borrar contrato
        </button>
      </div>
    </Menu>
  );
}

/* ---------------- COMPONENTES ---------------- */

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
