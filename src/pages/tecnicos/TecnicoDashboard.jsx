import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function TecnicoDashboard() {
  const navigate = useNavigate();

  const [inspecciones, setInspecciones] = useState([]);
  const [viviendas, setViviendas] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    setLoading(true);

    const { data: insp } = await supabase
      .from("inspecciones")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: viv } = await supabase
      .from("viviendas")
      .select("*")
      .order("id", { ascending: false });

    const alertasDetectadas =
      insp?.filter((i) => i.estado === "incidencia") || [];

    setInspecciones(insp || []);
    setViviendas(viv || []);
    setAlertas(alertasDetectadas);

    setLoading(false);
  }

  if (loading) {
    return (
      <div style={{ color: "#fff", padding: 20, fontSize: 20 }}>
        Cargando Dashboard Técnico...
      </div>
    );
  }

  const inspeccionesPorDia = inspecciones.slice(0, 7).map((i) => ({
    fecha: i.created_at?.substring(0, 10),
    total: 1,
  }));

  const viviendasSupervisadas = viviendas.slice(0, 7).map((v) => ({
    nombre: v.nombre,
    estado: v.estado === "ok" ? 1 : 0,
  }));

  const alertasPorDia = alertas.slice(0, 7).map((a) => ({
    fecha: a.created_at?.substring(0, 10),
    alertas: 1,
  }));

  const actividadTecnico = inspecciones.slice(0, 7).map((i) => ({
    vivienda: i.vivienda_id,
    actividad: 1,
  }));

  const estadoViviendas = [
    {
      name: "OK",
      value: viviendas.filter((v) => v.estado === "ok").length,
    },
    {
      name: "Incidencias",
      value: viviendas.filter((v) => v.estado !== "ok").length,
    },
  ];

  const COLORS = ["#00C49F", "#FF4444"];

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Dashboard Técnico</h1>

      <div style={styles.navButtons}>
        <button style={styles.navBtn} onClick={() => navigate("/inspecciones")}>
          📋 Inspecciones
        </button>
        <button style={styles.navBtn} onClick={() => navigate("/viviendas")}>
          🏡 Viviendas
        </button>
        <button style={styles.navBtn} onClick={() => navigate("/contratos")}>
          📄 Contratos
        </button>
        <button style={styles.navBtn} onClick={() => navigate("/clientes")}>
          👥 Clientes
        </button>
        <button style={styles.navBtn} onClick={() => navigate("/facturas")}>
          💳 Facturas
        </button>
      </div>

      <div style={styles.cards}>
        <div style={styles.card}>
          <h3>Inspecciones</h3>
          <p style={styles.number}>{inspecciones.length}</p>
        </div>

        <div style={styles.card}>
          <h3>Viviendas</h3>
          <p style={styles.number}>{viviendas.length}</p>
        </div>

        <div style={styles.card}>
          <h3>Alertas</h3>
          <p style={styles.number}>{alertas.length}</p>
        </div>
      </div>

      <div style={styles.graphContainer}>
        <h2 style={styles.graphTitle}>Inspecciones por día</h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={inspeccionesPorDia}>
            <CartesianGrid stroke="#333" />
            <XAxis dataKey="fecha" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip />
            <Line type="monotone" dataKey="total" stroke="#FACC15" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={styles.graphContainer}>
        <h2 style={styles.graphTitle}>Viviendas supervisadas</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={viviendasSupervisadas}>
            <CartesianGrid stroke="#333" />
            <XAxis dataKey="nombre" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip />
            <Bar dataKey="estado" fill="#00C49F" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={styles.graphContainer}>
        <h2 style={styles.graphTitle}>Alertas por día</h2>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={alertasPorDia}>
            <CartesianGrid stroke="#333" />
            <XAxis dataKey="fecha" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip />
            <Area type="monotone" dataKey="alertas" stroke="#FF4444" fill="#FF4444" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={styles.graphContainer}>
        <h2 style={styles.graphTitle}>Actividad del técnico</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={actividadTecnico}>
            <CartesianGrid stroke="#333" />
            <XAxis dataKey="vivienda" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip />
            <Bar dataKey="actividad" fill="#FACC15" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={styles.graphContainer}>
        <h2 style={styles.graphTitle}>Estado de viviendas</h2>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={estadoViviendas}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
              label
            >
              {estadoViviendas.map((entry, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: "#000A1A",
    minHeight: "100vh",
    padding: 20,
    color: "#fff",
    fontFamily: "Arial",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 25,
    color: "#FACC15",
    textShadow: "0 0 10px rgba(250,200,21,0.6)",
  },
  navButtons: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 25,
  },
  navBtn: {
    backgroundColor: "#0A2A43",
    color: "#FACC15",
    padding: "14px 18px",
    borderRadius: 12,
    border: "none",
    fontWeight: "bold",
    fontSize: 16,
    boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
  },
  cards: {
    display: "flex",
    gap: 18,
    flexWrap: "wrap",
    marginBottom: 25,
  },
  card: {
    backgroundColor: "#0A2A43",
    padding: 22,
    borderRadius: 14,
    width: 170,
    textAlign: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
  },
  number: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FACC15",
  },
  graphContainer: {
    backgroundColor: "#0A2A43",
    padding: 22,
    borderRadius: 14,
    marginBottom: 25,
    boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
  },
  graphTitle: {
    fontSize: 20,
    marginBottom: 12,
    color: "#FACC15",
  },
};
