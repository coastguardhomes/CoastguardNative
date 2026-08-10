import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient"; // ← IMPORTACIÓN CORRECTA

export default function TecnicoDashboard() {
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
      const { data: viv, error: errViv } = await supabase
        .from("viviendas")
        .select("*")
        .order("id", { ascending: false });

      if (errViv) throw errViv;

      const { data: contratos, error: errContratos } = await supabase
        .from("contratos")
        .select("*")
        .eq("estado", "pendiente");

      if (errContratos) throw errContratos;

      setViviendas(viv);
      setContratosPendientes(contratos);
    } catch (e) {
      setErrorMsg("Error cargando datos: " + e.message);
    }

    setLoading(false);
  }

  async function borrarVivienda(id) {
    setErrorMsg("");

    try {
      const { error } = await supabase
        .from("viviendas")
        .delete()
        .eq("id", id);

      if (error) {
        setErrorMsg(
          "No se puede borrar la vivienda. Puede tener contratos o inspecciones asociadas."
        );
        return;
      }

      cargarDatos();
    } catch (e) {
      setErrorMsg("Error al borrar: " + e.message);
    }
  }

  if (loading) return <p style={styles.loading}>Cargando Dashboard...</p>;

  return (
    <div style={styles.layout}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <h2 style={styles.logo}>CoastGuard</h2>

        <nav style={styles.nav}>
          <p style={styles.navItem}>🏠 Panel Técnico</p>
          <p style={styles.navItem}>📋 Inspecciones</p>
          <p style={styles.navItem}>🏡 Viviendas</p>
          <p style={styles.navItem}>📑 Contratos</p>
          <p style={styles.navItem}>👷 Técnicos</p>
          <p style={styles.navItem}>⚙️ Ajustes</p>
        </nav>
      </aside>

      {/* Main content */}
      <main style={styles.container}>
        <h1 style={styles.title}>Dashboard Técnico</h1>

        {errorMsg && <p style={styles.error}>{errorMsg}</p>}

        {/* Cards */}
        <div style={styles.cards}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Viviendas registradas</h3>
            <p style={styles.cardNumber}>{viviendas.length}</p>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Contratos pendientes</h3>
            <p style={styles.cardNumber}>{contratosPendientes.length}</p>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Inspecciones hoy</h3>
            <p style={styles.cardNumber}>3</p>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Alertas activas</h3>
            <p style={styles.cardNumber}>0</p>
          </div>
        </div>

        {/* Viviendas */}
        <h2 style={styles.subtitle}>Viviendas asignadas</h2>

        {viviendas.map((v) => (
          <div key={v.id} style={styles.item}>
            <div>
              <strong style={styles.itemTitle}>{v.nombre}</strong>
              <p style={styles.itemText}>{v.direccion}</p>
            </div>

            <div style={styles.actions}>
              <button
                style={styles.btnInspect}
                onClick={() => alert("Abrir inspección de vivienda " + v.id)}
              >
                Inspeccionar
              </button>

              <button
                style={styles.btnDelete}
                onClick={() => borrarVivienda(v.id)}
              >
                Borrar
              </button>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}

/* ESTILOS PROFESIONALES COASTGUARD */
const styles = {
  layout: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f5f7fa",
    fontFamily: "Arial",
  },

  /* Sidebar */
  sidebar: {
    width: "240px",
    backgroundColor: "#001F3F",
    color: "#fff",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "4px 0 10px rgba(0,0,0,0.2)",
  },
  logo: {
    fontSize: "26px",
    fontWeight: "bold",
    marginBottom: "30px",
    color: "#FACC15",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  navItem: {
    fontSize: "16px",
    cursor: "pointer",
    padding: "8px 0",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },

  /* Main content */
  container: {
    flex: 1,
    padding: "30px",
  },
  title: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#001F3F",
    marginBottom: "20px",
  },
  subtitle: {
    fontSize: "22px",
    color: "#001F3F",
    marginTop: "25px",
    marginBottom: "10px",
  },
  loading: {
    fontSize: "20px",
    textAlign: "center",
    marginTop: "40px",
  },
  error: {
    background: "#ffdddd",
    padding: "12px",
    borderRadius: "8px",
    color: "#a00",
    marginBottom: "15px",
  },

  /* Cards */
  cards: {
    display: "flex",
    gap: "20px",
    marginBottom: "25px",
    flexWrap: "wrap",
  },
  card: {
    background: "#001F3F",
    color: "#fff",
    padding: "20px",
    borderRadius: "12px",
    width: "200px",
    textAlign: "center",
    boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
    transition: "transform 0.2s",
  },
  cardTitle: {
    fontSize: "16px",
    marginBottom: "10px",
  },
  cardNumber: {
    fontSize: "30px",
    fontWeight: "bold",
    color: "#FACC15",
  },

  /* Items */
  item: {
    background: "#fff",
    padding: "18px",
    borderRadius: "12px",
    marginBottom: "12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
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

  /* Buttons */
  actions: {
    display: "flex",
    gap: "10px",
  },
  btnInspect: {
    background: "#FACC15",
    color: "#001F3F",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "none",
    fontWeight: "bold",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
  },
  btnDelete: {
    background: "#d9534f",
    color: "#fff",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "none",
    fontWeight: "bold",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
  },
};
