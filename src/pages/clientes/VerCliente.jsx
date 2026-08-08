import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useParams, useNavigate, Link } from "react-router-dom";

export default function VerCliente() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [cliente, setCliente] = useState(null);
  const [mensaje, setMensaje] = useState("");

  const [viviendas, setViviendas] = useState([]);
  const [contratos, setContratos] = useState([]);
  const [inspecciones, setInspecciones] = useState([]);
  const [facturas, setFacturas] = useState([]);

  useEffect(() => {
    cargarCliente();
  }, [id]);

  useEffect(() => {
    if (cliente) cargarRelacionados();
  }, [cliente]);

  async function cargarCliente() {
    const { data, error } = await supabase
      .from("clientes")
      .select("id, nombre, telefono, email, direccion")
      .eq("id", id)
      .single();

    if (error) {
      setMensaje("Error cargando cliente");
      return;
    }

    setCliente(data);
  }

  async function cargarRelacionados() {
    const { data: viv } = await supabase
      .from("viviendas")
      .select("*")
      .eq("cliente_id", id);
    setViviendas(viv || []);

    const { data: cont } = await supabase
      .from("contratos")
      .select("*")
      .eq("cliente_id", id);
    setContratos(cont || []);

    const { data: insp } = await supabase
      .from("inspecciones")
      .select("id, fecha, estado, vivienda_id, tecnico_id")
      .eq("cliente_id", id);
    setInspecciones(insp || []);

    const { data: fac } = await supabase
      .from("facturas")
      .select("*")
      .eq("cliente_id", id);
    setFacturas(fac || []);
  }

  // ⭐ BORRAR CLIENTE COMPLETO
  async function eliminarCliente() {
    const confirmar = window.confirm("¿Seguro que deseas eliminar este cliente?");
    if (!confirmar) return;

    // 1. Obtener contratos del cliente
    const { data: contratosCliente } = await supabase
      .from("contratos")
      .select("id")
      .eq("cliente_id", id);

    // 2. Borrar inspecciones asociadas a esos contratos
    if (contratosCliente && contratosCliente.length > 0) {
      for (const contrato of contratosCliente) {
        await supabase
          .from("inspecciones")
          .delete()
          .eq("contrato_id", contrato.id);
      }
    }

    // 3. Borrar contratos del cliente
    await supabase
      .from("contratos")
      .delete()
      .eq("cliente_id", id);

    // 4. Borrar viviendas del cliente
    await supabase
      .from("viviendas")
      .delete()
      .eq("cliente_id", id);

    // 5. Borrar facturas del cliente
    await supabase
      .from("facturas")
      .delete()
      .eq("cliente_id", id);

    // 6. Borrar el cliente
    const { error } = await supabase
      .from("clientes")
      .delete()
      .eq("id", id);

    if (error) {
      setMensaje("Error eliminando cliente");
      return;
    }

    alert("Cliente eliminado correctamente");
    navigate("/clientes");
  }

  if (!cliente) {
    return (
      <Menu>
        <div style={{
          height: "100vh",
          background: "#0a0f1a",
          color: "#fff",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "18px",
          fontFamily: "Inter, sans-serif",
        }}>
          Cargando cliente...
        </div>
      </Menu>
    );
  }

  return (
    <Menu>
      <div style={{
        padding: "20px",
        color: "#fff",
        background: "#0a0f1a",
        minHeight: "100vh",
        fontFamily: "Inter, sans-serif",
      }}>
        <h1 style={{
          color: "#4db8ff",
          marginBottom: "20px",
          textShadow: "0 0 8px rgba(0,153,255,0.6)",
        }}>
          {cliente.nombre}
        </h1>

        {mensaje && (
          <p style={{
            marginBottom: "15px",
            color: "#4db8ff",
            fontWeight: "600",
          }}>
            {mensaje}
          </p>
        )}

        <div style={{
          background: "rgba(255,255,255,0.05)",
          padding: "20px",
          borderRadius: "14px",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 0 12px rgba(0,153,255,0.2)",
          marginBottom: "20px",
        }}>
          <p><strong>Teléfono:</strong> {cliente.telefono}</p>
          <p><strong>Email:</strong> {cliente.email}</p>
          <p><strong>Dirección:</strong> {cliente.direccion}</p>
        </div>

        <Bloque titulo="Viviendas del cliente">
          {viviendas.length === 0 ? (
            <p style={{ opacity: 0.7 }}>No hay viviendas registradas.</p>
          ) : (
            viviendas.map((v) => (
              <Item key={v.id} to={`/viviendas/${v.id}`} titulo={v.direccion} />
            ))
          )}
        </Bloque>

        <Bloque titulo="Contratos del cliente">
          {contratos.length === 0 ? (
            <p style={{ opacity: 0.7 }}>No hay contratos.</p>
          ) : (
            contratos.map((c) => (
              <Item key={c.id} to={`/contratos/${c.id}`} titulo={`${c.modalidad} — ${c.precio}€`} />
            ))
          )}
        </Bloque>

        <Bloque titulo="Inspecciones del cliente">
          {inspecciones.length === 0 ? (
            <p style={{ opacity: 0.7 }}>No hay inspecciones.</p>
          ) : (
            inspecciones.map((i) => (
              <Item key={i.id} to={`/inspecciones/${i.id}`} titulo={`Inspección del ${i.fecha} — Estado: ${i.estado}`} />
            ))
          )}
        </Bloque>

        <Bloque titulo="Facturas del cliente">
          {facturas.length === 0 ? (
            <p style={{ opacity: 0.7 }}>No hay facturas.</p>
          ) : (
            facturas.map((f) => (
              <Item key={f.id} to={`/facturas/${f.id}`} titulo={`Factura ${f.id} — ${f.total}€`} />
            ))
          )}
        </Bloque>

        <Link to={`/viviendas?cliente_id=${id}`}>
          <button style={{
            marginTop: "10px",
            padding: "14px",
            width: "100%",
            background: "#1e90ff",
            color: "#fff",
            borderRadius: "10px",
            border: "none",
            fontWeight: "700",
            fontSize: "17px",
            cursor: "pointer",
            boxShadow: "0 0 10px rgba(0,153,255,0.4)",
          }}>
            Ver viviendas del cliente
          </button>
        </Link>

        <Link to={`/clientes/editar/${id}`}>
          <button style={{
            marginTop: "15px",
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
          }}>
            Editar cliente
          </button>
        </Link>

        {/* ⭐ BOTÓN NUEVO: BORRAR CLIENTE COMPLETO */}
        <button
          onClick={eliminarCliente}
          style={{
            marginTop: "15px",
            padding: "14px",
            width: "100%",
            background: "red",
            color: "#fff",
            borderRadius: "10px",
            border: "none",
            fontWeight: "700",
            fontSize: "17px",
            cursor: "pointer",
          }}
        >
          Eliminar cliente
        </button>
      </div>
    </Menu>
  );
}

function Bloque({ titulo, children }) {
  return (
    <div style={{ marginBottom: "25px" }}>
      <h2 style={{
        fontSize: "18px",
        marginBottom: "10px",
        color: "#4db8ff",
      }}>
        {titulo}
      </h2>

      <div style={{
        background: "rgba(255,255,255,0.04)",
        padding: "12px",
        borderRadius: "10px",
        border: "1px solid rgba(255,255,255,0.08)",
      }}>
        {children}
      </div>
    </div>
  );
}

function Item({ to, titulo }) {
  return (
    <Link to={to} style={{ textDecoration: "none" }}>
      <div style={{
        padding: "10px",
        marginBottom: "8px",
        background: "rgba(255,255,255,0.06)",
        borderRadius: "8px",
        border: "1px solid rgba(255,255,255,0.12)",
        color: "#fff",
        cursor: "pointer",
      }}>
        {titulo}
      </div>
    </Link>
  );
}
