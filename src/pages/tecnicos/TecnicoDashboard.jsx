import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid
} from "recharts";

export default function TecnicoDashboard() {
  const [inspecciones, setInspecciones] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [viviendas, setViviendas] = useState([]);
  const [mostrarDiarias, setMostrarDiarias] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    const { data: insp } = await supabase.from("inspecciones").select("*");
    const { data: viv } = await supabase.from("viviendas").select("*");
    const alertasDetectadas = insp?.filter(i => i.estado === "incidencia") || [];
    setInspecciones(insp || []);
    setViviendas(viv || []);
    setAlertas(alertasDetectadas);
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Dashboard Técnico</h1>

      <div style={styles.cards}>
        <Card titulo="Inspecciones" valor={inspecciones.length} />
        <Card titulo="Alertas" valor={alertas.length} color="#FF4444" />
        <Card titulo="Viviendas" valor={viviendas.length} />
      </div>

      <button style={styles.btn} onClick={() => setMostrarDiarias(!mostrarDiarias)}>
        🔍 Inspecciones Diarias
      </button>

      {mostrarDiarias && (
        <div style={styles.modal}>
          <h2>Inspecciones del Día</h2>
          {inspecciones.slice(0, 5).map((i, idx) => (
            <p key={idx}>{i.vivienda_id} — {i.estado}</p>
          ))}
        </div>
      )}

      <div style={styles.graphContainer}>
        <h2 style={styles.graphTitle}>Inspecciones por Día</h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={inspecciones.slice(0, 7)}>
            <CartesianGrid stroke="#333" />
            <XAxis dataKey="created_at" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip />
            <Line type="monotone" dataKey="id" stroke="#FFD700" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Card({ titulo, valor, color = "#FFD700" }) {
  return (
    <div style={{ ...styles.card, borderColor: color }}>
      <h3>{titulo}</h3>
      <p style={{ color }}>{valor}</p>
    </div>
  );
}

const styles = {
  container: { backgroundColor: "#000A1A", minHeight: "100vh", padding: 20, color: "#fff" },
  title: { fontSize: 28, color: "#FFD700", marginBottom: 20 },
  cards: { display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 },
  card: { border: "2px solid", borderRadius: 10, padding: 15, width: 120, textAlign: "center" },
  btn: { backgroundColor: "#FFD700", color: "#000", padding: "10px 15px", borderRadius: 8, fontWeight: "bold" },
  modal: { backgroundColor: "#0A2A43", padding: 15, borderRadius: 10, marginTop: 10 },
  graphContainer: { backgroundColor: "#0A2A43", padding: 20, borderRadius: 10, marginTop: 20 },
  graphTitle: { color: "#FFD700", marginBottom: 10 },
};
