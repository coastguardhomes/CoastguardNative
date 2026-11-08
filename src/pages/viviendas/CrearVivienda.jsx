import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function CrearVivienda() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    cliente_id: "",
    tecnico_id: "",
    nombre: "",
    direccion: "",
    ciudad: "",
    codigo_postal: "",
    localidad: "",
    activa: true,

    tamano: "",
    habitaciones: "",
    banos: "",
    tiene_piscina: false,
    tiene_jardin: false,
    tiene_garaje: false,
    tiene_sotano: false,
  });

  const [clientes, setClientes] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [errorDetalle, setErrorDetalle] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    async function cargarListas() {
      const [{ data: cli, error: errorClientes },
        { data: tec, error: errorTecnicos }] = await Promise.all([
        supabase
          .from("clientes")
          .select("id, nombre")
          .order("nombre"),
        supabase
          .from("tecnicos")
          .select("id, nombre")
          .order("nombre"),
      ]);

      if (errorClientes) {
        console.error("Error cargando clientes:", errorClientes);
      }

      if (errorTecnicos) {
        console.error("Error cargando técnicos:", errorTecnicos);
      }

      setClientes(cli || []);
      setTecnicos(tec || []);
    }

    cargarListas();
  }, []);

  async function crearVivienda() {
    if (guardando) return;

    setMensaje("");
    setErrorDetalle("");

    if (!form.cliente_id) {
      setMensaje("Selecciona el cliente propietario de la vivienda");
      return;
    }

    if (!form.tamano) {
      setMensaje("Selecciona el tamaño de la vivienda");
      return;
    }

    if (!["pequena", "mediana", "grande"].includes(form.tamano)) {
      setMensaje("El tamaño seleccionado no es válido");
      return;
    }

    if (!form.direccion.trim()) {
      setMensaje("Introduce la dirección de la vivienda");
      return;
    }

    setGuardando(true);

    const { error } = await supabase
      .from("viviendas")
      .insert([
        {
          cliente_id: form.cliente_id,
          tecnico_id: form.tecnico_id || null,
          nombre: form.nombre,
          direccion: form.direccion,
          ciudad: form.ciudad,
          codigo_postal: form.codigo_postal,
          localidad: form.localidad,

          tamano: form.tamano,

          habitaciones: Number(form.habitaciones || 0),
          banos: Number(form.banos || 0),

          tiene_piscina: form.tiene_piscina,
          tiene_jardin: form.tiene_jardin,
          tiene_garaje: form.tiene_garaje,
          tiene_sotano: form.tiene_sotano,

          activa: true,
        },
      ]);

    if (error) {
      console.error("Error creando vivienda:", error);

      setMensaje("Error creando vivienda");
      setErrorDetalle(error.message || JSON.stringify(error));
      setGuardando(false);
      return;
    }

    setMensaje("Vivienda creada correctamente");

    navigate("/viviendas");
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
          }}
        >
          Nueva Vivienda
        </h1>

        {mensaje && (
          <p
            role="status"
            style={{
              marginBottom: "10px",
              color: mensaje.includes("Error") ? "#ff6b6b" : "#4db8ff",
              fontWeight: "600",
            }}
          >
            {mensaje}
          </p>
        )}

        {errorDetalle && (
          <p
            style={{
              marginBottom: "15px",
              color: "#ff4444",
              fontSize: "14px",
              background: "rgba(255,0,0,0.15)",
              padding: "10px",
              borderRadius: "8px",
            }}
          >
            {errorDetalle}
          </p>
        )}

        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            padding: "20px",
            borderRadius: "14px",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 0 12px rgba(0,153,255,0.2)",
          }}
        >
          <label>Cliente</label>

          <select
            value={form.cliente_id}
            onChange={(e) =>
              setForm({ ...form, cliente_id: e.target.value })
            }
            style={inputStyle}
          >
            <option value="">Selecciona cliente</option>

            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>

          <label>Técnico asignado</label>

          <select
            value={form.tecnico_id}
            onChange={(e) =>
              setForm({ ...form, tecnico_id: e.target.value })
            }
            style={inputStyle}
          >
            <option value="">Sin técnico asignado</option>

            {tecnicos.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre}
              </option>
            ))}
          </select>

          <label>Nombre</label>

          <input
            value={form.nombre}
            onChange={(e) =>
              setForm({ ...form, nombre: e.target.value })
            }
            style={inputStyle}
          />

          <label>Dirección</label>

          <input
            value={form.direccion}
            onChange={(e) =>
              setForm({ ...form, direccion: e.target.value })
            }
            style={inputStyle}
          />

          <label>Ciudad</label>

          <input
            value={form.ciudad}
            onChange={(e) =>
              setForm({ ...form, ciudad: e.target.value })
            }
            style={inputStyle}
          />

          <label>Código Postal</label>

          <input
            value={form.codigo_postal}
            onChange={(e) =>
              setForm({ ...form, codigo_postal: e.target.value })
            }
            style={inputStyle}
          />

          <label>Localidad</label>

          <input
            value={form.localidad}
            onChange={(e) =>
              setForm({ ...form, localidad: e.target.value })
            }
            style={inputStyle}
          />

          <label>Tamaño de la vivienda</label>

          <select
            required
            value={form.tamano}
            onChange={(e) =>
              setForm({ ...form, tamano: e.target.value })
            }
            style={inputStyle}
          >
            <option value="">Selecciona el tamaño</option>
            <option value="pequena">Pequeña</option>
            <option value="mediana">Mediana</option>
            <option value="grande">Grande</option>
          </select>

          <p
            style={{
              color: "#9fb3c8",
              fontSize: "13px",
              marginTop: "-8px",
              marginBottom: "18px",
              lineHeight: "1.5",
            }}
          >
            El tamaño lo determina manualmente el administrador.
            No se calcula por metros cuadrados ni por características
            de la vivienda.
          </p>

          <label>Habitaciones</label>

          <select
            value={form.habitaciones}
            onChange={(e) =>
              setForm({
                ...form,
                habitaciones: Number(e.target.value),
              })
            }
            style={inputStyle}
          >
            <option value="">Selecciona habitaciones</option>
            <option value="1">1 habitación</option>
            <option value="2">2 habitaciones</option>
            <option value="3">3 habitaciones</option>
            <option value="4">4 habitaciones</option>
            <option value="5">5 habitaciones</option>
          </select>

          <label>Baños</label>

          <select
            value={form.banos}
            onChange={(e) =>
              setForm({
                ...form,
                banos: Number(e.target.value),
              })
            }
            style={inputStyle}
          >
            <option value="">Selecciona baños</option>
            <option value="1">1 baño</option>
            <option value="2">2 baños</option>
            <option value="3">3 baños</option>
            <option value="4">4 baños</option>
          </select>

          <label>
            <input
              type="checkbox"
              checked={form.tiene_piscina}
              onChange={(e) =>
                setForm({
                  ...form,
                  tiene_piscina: e.target.checked,
                })
              }
            />{" "}
            Piscina
          </label>

          <label>
            <input
              type="checkbox"
              checked={form.tiene_jardin}
              onChange={(e) =>
                setForm({
                  ...form,
                  tiene_jardin: e.target.checked,
                })
              }
            />{" "}
            Jardín
          </label>

          <label>
            <input
              type="checkbox"
              checked={form.tiene_garaje}
              onChange={(e) =>
                setForm({
                  ...form,
                  tiene_garaje: e.target.checked,
                })
              }
            />{" "}
            Garaje
          </label>

          <label>
            <input
              type="checkbox"
              checked={form.tiene_sotano}
              onChange={(e) =>
                setForm({
                  ...form,
                  tiene_sotano: e.target.checked,
                })
              }
            />{" "}
            Sótano
          </label>

          <button
            type="button"
            onClick={crearVivienda}
            disabled={guardando}
            style={{
              marginTop: "20px",
              padding: "14px",
              width: "100%",
              background: "#4db8ff",
              color: "#000",
              borderRadius: "10px",
              border: "none",
              fontWeight: "700",
              fontSize: "17px",
              cursor: guardando ? "not-allowed" : "pointer",
              opacity: guardando ? 0.6 : 1,
              boxShadow: "0 0 10px rgba(0,153,255,0.4)",
            }}
          >
            {guardando ? "Guardando..." : "Guardar vivienda"}
          </button>
        </div>
      </div>
    </Menu>
  );
}

const inputStyle = {
  padding: "12px",
  width: "100%",
  marginBottom: "15px",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.2)",
  background: "rgba(255,255,255,0.08)",
  color: "#fff",
  boxSizing: "border-box",
};
