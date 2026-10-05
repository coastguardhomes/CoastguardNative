import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Menu from "../layouts/Menu";
import { supabase } from "../lib/supabase";

const TARJETAS = [
  { clave: "clientes", etiqueta: "Clientes", ruta: "/clientes", icono: "👤" },
  { clave: "viviendas", etiqueta: "Viviendas", ruta: "/viviendas", icono: "🏠" },
  { clave: "contratos", etiqueta: "Contratos", ruta: "/contratos", icono: "📄" },
  { clave: "facturas", etiqueta: "Facturas", ruta: "/facturas", icono: "💳" },
  { clave: "inspecciones", etiqueta: "Inspecciones", ruta: "/inspecciones", icono: "📋" },
  { clave: "tecnicos", etiqueta: "Técnicos", ruta: "/tecnicos", icono: "🛠️" },
];

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [conteos, setConteos] = useState({});
  const [datosGrafica, setDatosGrafica] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [avisosInspeccion, setAvisosInspeccion] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [cargandoAvisos, setCargandoAvisos] = useState(true);
  const [procesandoAviso, setProcesandoAviso] = useState(null);
  const [errorAvisos, setErrorAvisos] = useState("");

  useEffect(() => {
    let cancelado = false;

    async function cargarDatos() {
      const resultado = {};

      // 1. Cargar conteos de tarjetas
      await Promise.all(
        TARJETAS.map(async ({ clave }) => {
          const { count, error } = await supabase
            .from(clave)
            .select("*", { count: "exact", head: true });

          resultado[clave] = error ? null : count ?? 0;
        })
      );

      // 2. Cargar inspecciones reales para la gráfica de la semana
      const { data: inspeccionesData, error: errorInsp } = await supabase
        .from("inspecciones")
        .select("created_at, fecha");

      const conteoDias = [0, 0, 0, 0, 0, 0, 0];

      if (!errorInsp && inspeccionesData) {
        inspeccionesData.forEach((item) => {
          const fechaStr = item.fecha || item.created_at;

          if (fechaStr) {
            const d = new Date(fechaStr);
            let dia = d.getDay();

            // Ajustar para que 0 sea Lunes y 6 sea Domingo
            dia = dia === 0 ? 6 : dia - 1;

            if (dia >= 0 && dia < 7) {
              conteoDias[dia]++;
            }
          }
        });
      }

      if (!cancelado) {
        setConteos(resultado);
        setDatosGrafica(conteoDias);
        setCargando(false);
      }
    }

    cargarDatos();

    return () => {
      cancelado = true;
    };
  }, []);

  // ---------------------------------------------------------
  // AVISOS DE INSPECCIÓN PENDIENTES PARA ADMIN
  // ---------------------------------------------------------
  useEffect(() => {
    let cancelado = false;

    async function cargarAvisosInspeccion() {
      setCargandoAvisos(true);
      setErrorAvisos("");

      try {
        const { data: avisos, error } = await supabase
          .from("avisos_inspeccion_admin")
          .select(
            "id, contrato_id, cliente_id, vivienda_id, fecha_prevista, estado, created_at"
          )
          .eq("estado", "pendiente")
          .order("fecha_prevista", { ascending: true });

        if (error) {
          throw error;
        }

        if (!avisos || avisos.length === 0) {
          if (!cancelado) {
            setAvisosInspeccion([]);
            setCargandoAvisos(false);
          }
          return;
        }

        // IDs necesarios para cargar los nombres relacionados
        const clienteIds = [
          ...new Set(
            avisos
              .map((aviso) => aviso.cliente_id)
              .filter(Boolean)
          ),
        ];

        const viviendaIds = [
          ...new Set(
            avisos
              .map((aviso) => aviso.vivienda_id)
              .filter(Boolean)
          ),
        ];

        // Cargar clientes
        let clientesMap = {};

        if (clienteIds.length > 0) {
          const { data: clientes, error: errorClientes } = await supabase
            .from("clientes")
            .select("id, nombre")
            .in("id", clienteIds);

          if (errorClientes) {
            throw errorClientes;
          }

          clientesMap = (clientes || []).reduce((mapa, cliente) => {
            mapa[String(cliente.id)] = cliente;
            return mapa;
          }, {});
        }

        // Cargar viviendas
        let viviendasMap = {};

        if (viviendaIds.length > 0) {
          const { data: viviendas, error: errorViviendas } = await supabase
            .from("viviendas")
            .select("id, nombre, direccion")
            .in("id", viviendaIds);

          if (errorViviendas) {
            throw errorViviendas;
          }

          viviendasMap = (viviendas || []).reduce((mapa, vivienda) => {
            mapa[String(vivienda.id)] = vivienda;
            return mapa;
          }, {});
        }

        const avisosCompletos = avisos.map((aviso) => ({
          ...aviso,
          cliente: aviso.cliente_id
            ? clientesMap[String(aviso.cliente_id)] || null
            : null,
          vivienda: aviso.vivienda_id
            ? viviendasMap[String(aviso.vivienda_id)] || null
            : null,
        }));

        if (!cancelado) {
          setAvisosInspeccion(avisosCompletos);
          setCargandoAvisos(false);
        }
      } catch (error) {
        console.error("Error cargando avisos de inspección:", error);

        if (!cancelado) {
          setErrorAvisos(
            error?.message || "No se pudieron cargar los avisos de inspección."
          );
          setAvisosInspeccion([]);
          setCargandoAvisos(false);
        }
      }
    }

    cargarAvisosInspeccion();

    return () => {
      cancelado = true;
    };
  }, []);

  // ---------------------------------------------------------
  // MARCAR AVISO COMO GESTIONADO
  // ---------------------------------------------------------
  async function marcarAvisoGestionado(aviso) {
    if (!aviso?.id || procesandoAviso) {
      return;
    }

    const confirmar = window.confirm(
      "¿Quieres marcar este aviso de inspección como gestionado?"
    );

    if (!confirmar) {
      return;
    }

    setProcesandoAviso(aviso.id);
    setErrorAvisos("");

    try {
      const {
        data: { user },
        error: errorUsuario,
      } = await supabase.auth.getUser();

      if (errorUsuario) {
        throw errorUsuario;
      }

      if (!user?.id) {
        throw new Error("No se ha podido identificar al usuario administrador.");
      }

      const { error } = await supabase
        .from("avisos_inspeccion_admin")
        .update({
          estado: "resuelto",
          resuelto_at: new Date().toISOString(),
          resuelto_por: user.id,
        })
        .eq("id", aviso.id)
        .eq("estado", "pendiente");

      if (error) {
        throw error;
      }

      // Quitarlo inmediatamente de la lista visible
      setAvisosInspeccion((avisosActuales) =>
        avisosActuales.filter((item) => item.id !== aviso.id)
      );
    } catch (error) {
      console.error("Error marcando aviso como gestionado:", error);

      setErrorAvisos(
        error?.message || "No se pudo marcar el aviso como gestionado."
      );
    } finally {
      setProcesandoAviso(null);
    }
  }

  // ---------------------------------------------------------
  // FORMATEAR FECHA
  // ---------------------------------------------------------
  function formatearFecha(fecha) {
    if (!fecha) {
      return "Sin fecha";
    }

    const partes = String(fecha).split("-");

    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }

    const fechaObj = new Date(fecha);

    if (Number.isNaN(fechaObj.getTime())) {
      return fecha;
    }

    return fechaObj.toLocaleDateString("es-ES");
  }

  // ---------------------------------------------------------
  // GRÁFICA
  // ---------------------------------------------------------
  const maxValor = Math.max(10, ...datosGrafica);
  const alturaSVG = 90;
  const anchoSVG = 300;

  const puntosCoordenadas = datosGrafica.map((valor, index) => {
    const x = 35 + (index * (anchoSVG - 45)) / 6;
    const y =
      alturaSVG -
      (valor / maxValor) * (alturaSVG - 15) -
      10;

    return { x, y, valor };
  });

  const stringPuntos = puntosCoordenadas
    .map((p) => `${p.x},${p.y}`)
    .join(" ");

  return (
    <Menu>
      <div
        style={{
          width: "100%",
          minHeight: "100vh",
          background: "#05080f",
          padding: "16px",
          fontFamily: "'Inter', sans-serif",
          color: "#fff",
          boxSizing: "border-box",
        }}
      >
        {/* Cabecera Principal */}
        <div
          style={{
            background:
              "linear-gradient(180deg, #0d1527 0%, #080e1a 100%)",
            border: "1px solid rgba(234, 179, 8, 0.4)",
            borderRadius: "14px",
            padding: "14px 16px",
            marginBottom: "16px",
            boxShadow:
              "0 0 15px rgba(234, 179, 8, 0.15), inset 0 0 10px rgba(234, 179, 8, 0.05)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "16px",
                fontWeight: "800",
                margin: "0 0 2px 0",
                color: "#eab308",
                letterSpacing: "1px",
                textTransform: "uppercase",
                textShadow: "0 0 8px rgba(234, 179, 8, 0.5)",
              }}
            >
              PANEL DE CONTROL
            </h1>

            <p
              style={{
                color: "#94a3b8",
                fontSize: "11px",
                margin: 0,
                fontWeight: "500",
              }}
            >
              Métricas generales y gestión de CoastGuard.
            </p>
          </div>

          <div
            style={{
              background: "transparent",
              border: "1px solid rgba(234, 179, 8, 0.6)",
              borderRadius: "8px",
              padding: "4px 10px",
              color: "#eab308",
              fontSize: "10px",
              fontWeight: "700",
              letterSpacing: "1.5px",
              boxShadow: "0 0 8px rgba(234, 179, 8, 0.2)",
            }}
          >
            ADMIN
          </div>
        </div>

        {/* Grid de Tarjetas */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "10px",
            marginBottom: "16px",
          }}
        >
          {TARJETAS.map(({ clave, etiqueta, ruta, icono }) => (
            <Link
              key={clave}
              to={ruta}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  background:
                    "linear-gradient(145deg, #0b1220 0%, #060913 100%)",
                  borderRadius: "12px",
                  padding: "12px 14px",
                  border: "1px solid rgba(234, 179, 8, 0.35)",
                  boxShadow:
                    "0 6px 16px rgba(0, 0, 0, 0.6), inset 0 0 10px rgba(234, 179, 8, 0.06)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: "85px",
                  boxSizing: "border-box",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#e2e8f0",
                    }}
                  >
                    {etiqueta}
                  </span>

                  <span
                    style={{
                      fontSize: "12px",
                      background: "rgba(15, 23, 42, 0.8)",
                      border: "1px solid rgba(234, 179, 8, 0.3)",
                      padding: "4px 6px",
                      borderRadius: "8px",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {icono}
                  </span>
                </div>

                <div>
                  <span
                    style={{
                      fontSize: "22px",
                      fontWeight: "800",
                      color: "#eab308",
                      textShadow:
                        "0 0 10px rgba(234, 179, 8, 0.6)",
                      letterSpacing: "-0.5px",
                    }}
                  >
                    {cargando ? "…" : conteos[clave] ?? "—"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* ---------------------------------------------------------
            AVISOS DE INSPECCIÓN PENDIENTES
        --------------------------------------------------------- */}
        <div
          style={{
            background:
              "linear-gradient(145deg, #0b1220 0%, #060913 100%)",
            borderRadius: "14px",
            padding: "14px",
            border: "1px solid rgba(234, 179, 8, 0.45)",
            boxShadow:
              "0 8px 20px rgba(0, 0, 0, 0.6), inset 0 0 12px rgba(234, 179, 8, 0.08)",
            marginBottom: "20px",
          }}
        >
          {/* Cabecera */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "10px",
              marginBottom: "12px",
              borderBottom:
                "1px solid rgba(234, 179, 8, 0.2)",
              paddingBottom: "8px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span
                style={{
                  fontSize: "18px",
                  lineHeight: 1,
                }}
              >
                🔔
              </span>

              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "#eab308",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                }}
              >
                Inspecciones pendientes
              </span>
            </div>

            <span
              style={{
                minWidth: "24px",
                height: "24px",
                padding: "0 7px",
                borderRadius: "999px",
                background:
                  avisosInspeccion.length > 0
                    ? "#eab308"
                    : "rgba(100, 116, 139, 0.25)",
                color:
                  avisosInspeccion.length > 0
                    ? "#05080f"
                    : "#94a3b8",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
                fontWeight: "800",
                boxSizing: "border-box",
              }}
            >
              {cargandoAvisos ? "…" : avisosInspeccion.length}
            </span>
          </div>

          {/* Error */}
          {errorAvisos && (
            <div
              style={{
                background: "rgba(127, 29, 29, 0.25)",
                border:
                  "1px solid rgba(248, 113, 113, 0.35)",
                borderRadius: "8
