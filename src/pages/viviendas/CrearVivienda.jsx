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
    activa: true,

    // ⭐ NUEVOS CAMPOS
    metros_cuadrados: "",
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

  useEffect(() => {
    async function cargarListas() {
      const [{ data: cli }, { data: tec }] = await Promise.all([
        supabase.from("clientes").select("id, nombre").order("nombre"),
        supabase.from("tecnicos").select("id, nombre").order("nombre"),
      ]);

      setClientes(cli || []);
      setTecnicos(tec || []);
    }

    cargarListas();
  }, []);

  async function crearVivienda() {
    if (!form.cliente_id) {
      setMensaje("Selecciona el cliente propietario de la vivienda");
      return;
    }

    const { error } = await supabase.from("viviendas").insert([
      {
        ...form,
        tecnico_id: form.tecnico_id || null,
      },
    ]);

    if (error) {
      console.error(error);
      setMensaje("Error creando vivienda");
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
            style={{
              marginBottom: "15px",
              color: "#4db8ff",
              fontWeight: "600",
            }}
          >
            {mensaje}
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
            onChange={(e) => setForm({ ...form, cliente_id: e.target.value })}
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
            onChange={(e) => setForm({ ...form, tecnico_id: e.target.value })}
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
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            style={inputStyle}
          />

          <label>Dirección</label>
          <input
            value={form.direccion}
            onChange={(e) => setForm({ ...form, direccion: e.target.value })}
            style={inputStyle}
          />

          <label>Ciudad</label>
          <input
            value={form.ciudad}
            onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
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

          {/* ⭐ NUEVOS CAMPOS */}

          <label>Metros cuadrados</label>
          <input
            type="number"
            value={form.metros_cuadrados}
            onChange={(e) =>
              setForm({ ...form, metros_cuadrados: Number(e.target.value) })
            }
            style={inputStyle}
          />

          <label>Habitaciones</label>
          <input
            type="number"
            value={form.habitaciones}
            onChange={(e) =>
              setForm({ ...form, habitaciones: Number(e.target.value) })
            }
            style={inputStyle}
          />

          <label>Baños</label>
          <input
            type="number"
            value={form.banos}
            onChange={(e) =>
              setForm({ ...form, banos: Number(e.target.value) })
            }
            style={inputStyle}
          />

          <label>
            <input
              type="checkbox"
              checked={form.tiene_piscina}
              onChange={(e) =>
                setForm({ ...form, tiene_piscina: e.target.checked })
              }
            />{" "}
            Piscina
          </label>

          <label>
            <input
              type="checkbox"
              checked={form.tiene_jardin}
              onChange={(e) =>
                setForm({ ...form, tiene_jardin: e.target.checked })
              }
            />{" "}
            Jardín
          </label>

          <label>
            <input
              type="checkbox"
              checked={form.tiene_garaje}
              onChange={(e) =>
                setForm({ ...form, tiene_garaje: e.target.checked })
              }
            />{" "}
            Garaje
          </label>

          <label>
            <input
              type="checkbox"
              checked={form.tiene_sotano}
              onChange={(e) =>
                setForm({ ...form, tiene_sotano: e.target.checked })
              }
            />{" "}
            Sótano
          </label>

          <button
            onClick={crearVivienda}
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
              cursor: "pointer",
              boxShadow: "0 0 10px rgba(0,153,255,0.4)",
            }}
          >
            Guardar vivienda
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
};
