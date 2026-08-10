import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function TecnicoDashboard() {
  const navigate = useNavigate();

  const [viviendas, setViviendas] = useState([]);
  const [contratosPendientes, setContratosPendientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    setLoading(true);
    setErrorMsg("");

    try {
      const { data: viv } = await supabase
        .from("viviendas")
        .select("*")
        .order("id", { ascending: false });

      const { data: contratos } = await supabase
        .from("contratos")
        .select("*")
        .eq("estado", "pendiente");

      setViviendas(viv || []);
      setContratosPendientes(contratos || []);
    } catch (e) {
      setErrorMsg("Error cargando datos: " + e.message);
    }

    setLoading(false);
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Dashboard Técnico</h1>

      {errorMsg && <p style={styles.error}>{errorMsg}</p>}

      {/* BOTONES DE NAVEGACIÓN REALES */}
      <div style={styles.navButtons}>
        <button style={styles.navBtn} onClick={() => navigate("/inspecciones")}>
          📋 Inspecciones
        </button>

        <button style={styles.navBtn} onClick={() => navigate("/viviendas")}>
          🏡 Viviendas
        </button>

        <button style={styles.navBtn} onClick={() => navigate("/contratos")}>
          📑 Contratos
        </button>

        <button style={styles.navBtn} onClick={() => navigate("/clientes")}>
          👥 Clientes
        </button>

        <button style={styles.navBtn} onClick={() => navigate("/facturas")}>
          💶 Facturas
        </button>
      </div>

      {/* TARJETAS */}
      <div style={styles.cards}>
        <div style={styles.card}>
          <h3>Viviendas</h3>
          <p style={styles.number}>{viviendas.length}</p>
        </div>

        <div style={styles.card}>
          <h3>Contratos pendientes</h3>
          <p style={styles.number}>{contratosPendientes.length}</p>
        </div>

        <div style={styles.card}>
          <h3>Inspecciones hoy</h3>
          <p style={styles.number}>3</p>
        </div>
      </div>

      {/* LISTA DE VIVIENDAS */}
      <h2 style={styles.subtitle}>Viviendas asignadas</h2>

      {viviendas.map((v) => (
        <div key={v.id} style={styles.item}>
          <div>
            <strong style={styles.itemTitle}>{v.nombre}</strong>
            <p style={styles.itemText}>{v.direccion}</p>
          </div>

          <button
            style={styles.btn}
            onClick={() => navigate(`/viviendas/ver/${v.id}`)}
          >
            Inspeccionar
          </button>
        </div>
      ))}
    </div>
  );
}

/* ESTILOS COASTGUARD */
const styles = {
  container: {
    padding: "20px",
    background: "#f5f7fa",
    minHeight: "100vh",
    fontFamily: "Arial",
  },
  title: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#001F3F",
    marginBottom: "20px",
  },
  subtitle: {
    fontSize: "20px",
    color: "#001F3F",
    marginTop: "20px",
    marginBottom: "10px",
  },
  error: {
    background: "#ffdddd",
    padding: "10px",
    borderRadius: "8px",
    color: "#a00",
  },

  navButtons: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  navBtn: {
    background: "#001F3F",
    color: "#FACC15",
    padding: "12px 16px",
    borderRadius: "10px",
    border: "none",
    fontWeight: "bold",
    fontSize: "15px",
  },

  cards: {
    display: "flex",
    gap: "15px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  card: {
    background: "#001F3F",
    color: "#fff",
    padding: "20px",
    borderRadius: "12px",
    width: "160px",
    textAlign: "center",
  },
  number: {
    fontSize: "26px",
    fontWeight: "bold",
    color: "#FACC15",
  },

  item: {
    background: "#fff",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "10px",
    display: "flex",
    justifyContent: "space-between",
    boxShadow: "0 3px 8px rgba(0,0,0,0.1)",
  },
  itemTitle: {
    fontSize: "18px",
    color: "#001F3F",
  },
  itemText: {
    fontSize: "14px",
    color: "#555",
  },
  btn: {
    background: "#FACC15",
    color: "#001F3F",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "none",
    fontWeight: "bold",
  },
};
