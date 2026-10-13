
import React, { useState, useEffect } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useParams, useNavigate } from "react-router-dom";

export default function EditarContrato() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fecha_inicio: "",
    precio: "",
    notas: "",
    frecuencia: "",
    tecnico_id: "",
    modalidad: "",
  });

  const [tecnicos, setTecnicos] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [procesando, setProcesando] = useState(false);

  const modalidades = [
    {
      id: "basico",
      nombre: "Básico",
      precio: 39,
      frecuencia: 30,
    },
    {
      id: "standard",
      nombre: "Standard",
      precio: 59,
      frecuencia: 30,
    },
    {
      id: "premium",
      nombre: "Premium",
      precio: 79,
      frecuencia: 30,
    },
    {
      id: "custodia_llaves",
      nombre: "Custodia de llaves",
      precio: 15,
      frecuencia: null,
    },
  ];

  // La duración del contrato es de 12 meses.
  // La frecuencia de visitas nunca determina la fecha final.
  function calcularFechaFin(fechaInicio, meses = 12) {
    if (!fechaInicio) return null;

    const partes = fechaInicio.split("-").map(Number);

    if (
      partes.length !== 3 ||
      partes.some((numero) => !Number.isFinite(numero))
    ) {
      return null;
    }

    const [anio, mes, dia] = partes;

    if (
      anio < 1 ||
      mes < 1 ||
      mes > 12 ||
      dia < 1 ||
      dia > new Date(anio, mes, 0).getDate()
    ) {
      return null;
    }

    const indiceMes = mes - 1 + meses;
    const anioFinal = anio + Math.floor(indiceMes / 12);
    const mesFinal = indiceMes % 12;
    const ultimoDia = new Date(
      anioFinal,
      mesFinal + 1,
      0
    ).getDate();
    const diaFinal = Math.min(dia, ultimoDia);

    return `${anioFinal}-${String(mesFinal + 1).padStart(2, "0")}-${String(diaFinal).padStart(2, "0")}`;
  }

  useEffect(() => {
    cargarContrato();
    cargarTecnicos();
  }, [id]);

  async function cargarContrato() {
    const { data, error } = await supabase
      .from("contratos")
      .select(
        "fecha_inicio, precio, notas, frecuencia, tecnico_id, modalidad"
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error cargando contrato:", error);
      setMensaje("Error cargando contrato");
      return;
    }

    if (data) {
      setForm({
        fecha_inicio: data.fecha_inicio || "",
        precio: data.precio ?? "",
        notas: data.notas || "",
        frecuencia:
          data.modalidad === "custodia_llaves"
            ? ""
            : data.frecuencia ?? "",
        tecnico_id: data.tecnico_id || "",
        modalidad: data.modalidad || "",
      });
    }
  }

  async function cargarTecnicos() {
    const { data, error } = await supabase
      .from("tecnicos")
      .select("id, nombre");

    if (error) {
      console.error("Error cargando técnicos:", error);
    }

    setTecnicos(data || []);
  }

  function seleccionarModalidad(modalidadId) {
    const modalidadSeleccionada = modalidades.find(
      (modalidad) => modalidad.id === modalidadId
    );

    setForm((prev) => ({
      ...prev,
      modalidad: modalidadId,
      precio: modalidadSeleccionada
        ? modalidadSeleccionada.precio
        : prev.precio,
      frecuencia:
        modalidadId === "custodia_llaves"
          ? ""
          : modalidadSeleccionada
            ? modalidadSeleccionada.frecuencia
            : prev.frecuencia,
    }));
  }

  async function guardarCambios() {
    if (procesando) return;

    setMensaje("");

    if (!form.fecha_inicio) {
      setMensaje("La fecha de inicio es obligatoria");
      return;
    }

    const precio = Number(form.precio);

    if (
      form.precio === "" ||
      !Number.isFinite(precio) ||
      precio <= 0
    ) {
      setMensaje("Introduce un precio válido");
      return;
    }

    if (!form.modalidad) {
      setMensaje("Selecciona una modalidad");
      return;
    }

    if (!form.tecnico_id) {
      setMensaje("Selecciona un técnico");
      return;
    }

    const esCustodia = form.modalidad === "custodia_llaves";

    if (
      !esCustodia &&
      (
        form.frecuencia === "" ||
        !Number.isFinite(Number(form.frecuencia)) ||
        Number(form.frecuencia) <= 0
      )
    ) {
      setMensaje(
        "Indica una frecuencia de visitas válida para esta modalidad"
      );
      return;
    }

    const fechaFin = calcularFechaFin(form.fecha_inicio, 12);

    if (!fechaFin) {
      setMensaje("No se pudo calcular la fecha final del contrato");
      return;
    }

    setProcesando(true);

    try {
      // Actualizar el contrato manteniendo su duración anual.
      // El pago es mensual y no implica permanencia mínima anual.
      const { error } = await supabase
        .from("contratos")
        .update({
          fecha_inicio: form.fecha_inicio,
          fecha_fin: fechaFin,
          duracion_meses: 12,
          precio,
          notas: form.notas,
          frecuencia: esCustodia
            ? null
            : Number(form.frecuencia),
          tecnico_id: String(form.tecnico_id),
          modalidad: form.modalidad,
        })
        .eq("id", id);

      if (error) {
        console.error("Error guardando contrato:", error);
        setMensaje("Error guardando cambios");
        return;
      }

      const contratoId = Number(id);

      // Regenerar el PDF mediante la función ya desplegada.
      // No se modifica pdf_url desde este archivo.
      try {
        const { data: pdfData, error: pdfError } =
          await supabase.functions.invoke("contrato-pdf", {
            body: {
              contratoId,
              contrato_id: contratoId,
              id: contratoId,
            },
          });

        if (pdfError) {
          console.error("Error regenerando PDF:", pdfError);
        } else {
          console.log("PDF regenerado correctamente:", pdfData);
        }
      } catch (errorPDF) {
        console.error("Error regenerando PDF:", errorPDF);
      }

      // La custodia de llaves no incluye visitas ni inspecciones.
      // Para el resto de modalidades se conserva el flujo existente.
      if (!esCustodia) {
        try {
          const { error: inspeccionesError } =
            await supabase.functions.invoke(
              "crear_inspecciones_programadas",
              {
                body: {
                  contratoId,
                },
              }
            );

          if (inspeccionesError) {
            console.error(
              "Error regenerando inspecciones:",
              inspeccionesError
            );
          }
        } catch (errorInspecciones) {
          console.error(
            "Error regenerando inspecciones:",
            errorInspecciones
          );
        }
      }

      // Mantener el envío de correo existente.
      try {
        const { error: emailError } =
          await supabase.functions.invoke("enviar-email", {
            body: {
              contratoId,
            },
          });

        if (emailError) {
          console.error("Error enviando email:", emailError);
        }
      } catch (errorEmail) {
        console.error("Error enviando email:", errorEmail);
      }

      navigate("/contratos");
    } catch (error) {
      console.error("Error inesperado guardando contrato:", error);
      setMensaje("Se produjo un error inesperado al guardar el contrato");
    } finally {
      setProcesando(false);
    }
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

  const esCustodia = form.modalidad === "custodia_llaves";

  return (
    <Menu>
      <div
        style={{
          padding: "20px",
          background: "#0a0f1a",
          minHeight: "100vh",
          color: "#fff",
          fontFamily: "Inter, sans-serif",
          boxSizing: "border-box",
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
          Editar Contrato #{id}
        </h1>

        {mensaje && (
          <p
            role="status"
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
          <label>Modalidad:</label>

          <select
            value={form.modalidad || ""}
            onChange={(e) => seleccionarModalidad(e.target.value)}
            style={inputStyle}
          >
            <option value="">Selecciona modalidad</option>

            {modalidades.map((modalidad) => (
              <option key={modalidad.id} value={modalidad.id}>
                {modalidad.nombre} — {modalidad.precio}€
              </option>
            ))}
          </select>

          <label>Fecha de inicio:</label>

          <input
            type="date"
            value={form.fecha_inicio || ""}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                fecha_inicio: e.target.value,
              }))
            }
            style={inputStyle}
          />

          <div
            style={{
              padding: "12px",
              marginBottom: "18px",
              borderRadius: "8px",
              background: "rgba(77,184,255,0.08)",
              border: "1px solid rgba(77,184,255,0.25)",
              color: "#b8dfff",
              lineHeight: "1.6",
              fontSize: "14px",
            }}
          >
            El contrato tiene duración y renovación anual, con facturación
            mensual. No existe permanencia mínima anual: el cliente puede
            solicitar la cancelación en cualquier momento con un mes de
            preaviso, conforme al contrato marco.
          </div>

          <label>Precio base (€):</label>

          <input
            type="number"
            min="0.01"
            step="0.01"
            value={form.precio ?? ""}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                precio: e.target.value,
              }))
            }
            style={inputStyle}
          />

          {!esCustodia && (
            <>
              <label>Frecuencia de visitas (días):</label>

              <input
                type="number"
                min="1"
                step="1"
                value={form.frecuencia ?? ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    frecuencia: e.target.value,
                  }))
                }
                style={inputStyle}
              />
            </>
          )}

          {esCustodia && (
            <p
              style={{
                marginTop: 0,
                marginBottom: "15px",
                color: "#9fb3c8",
                fontSize: "14px",
                lineHeight: "1.6",
              }}
            >
              La custodia de llaves no incluye visitas ni inspecciones
              de la vivienda. Cualquier servicio adicional requiere
              contratación expresa.
            </p>
          )}

          <label>Técnico responsable:</label>

          <select
            value={form.tecnico_id || ""}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                tecnico_id: e.target.value,
              }))
            }
            style={inputStyle}
          >
            <option value="">Selecciona técnico</option>

            {tecnicos.map((tecnico) => (
              <option key={tecnico.id} value={tecnico.id}>
                {tecnico.nombre}
              </option>
            ))}
          </select>

          <label>Notas:</label>

          <textarea
            value={form.notas || ""}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                notas: e.target.value,
              }))
            }
            style={{
              ...inputStyle,
              minHeight: "90px",
            }}
          />

          <button
            type="button"
            onClick={guardarCambios}
            disabled={procesando}
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
              cursor: procesando ? "wait" : "pointer",
              boxShadow: "0 0 10px rgba(0,153,255,0.4)",
              opacity: procesando ? 0.6 : 1,
            }}
          >
            {procesando ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </Menu>
  );
}
