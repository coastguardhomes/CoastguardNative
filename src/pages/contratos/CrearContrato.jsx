import { useState } from "react";

export default function CrearContrato() {
  const [lang, setLang] = useState("es");

  const t = (es, en) => (lang === "es" ? es : en);

  const [form, setForm] = useState({
    cliente: "",
    tipo: "",
    fecha: "",
    descripcion: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Aquí luego conectamos a Supabase
    console.log("Contrato creado:", form);

    alert(t("Contrato creado correctamente", "Contract created successfully"));
  };

  return (
    <div className="crear-contrato-pro">

      {/* TÍTULO */}
      <h2 className="cg-header-title">
        {t("Crear Contrato", "Create Contract")}
      </h2>

      {/* FORMULARIO */}
      <form className="cg-card" onSubmit={handleSubmit}>

        {/* CLIENTE */}
        <div className="cg-form-group">
          <label className="cg-label">{t("Cliente", "Client")}</label>
          <input
            type="text"
            name="cliente"
            className="cg-input"
            placeholder={t("Nombre del cliente", "Client name")}
            value={form.cliente}
            onChange={handleChange}
            required
          />
        </div>

        {/* TIPO */}
        <div className="cg-form-group">
          <label className="cg-label">{t("Tipo de Contrato", "Contract Type")}</label>
          <select
            name="tipo"
            className="cg-input"
            value={form.tipo}
            onChange={handleChange}
            required
          >
            <option value="">{t("Seleccionar...", "Select...")}</option>
            <option value="mantenimiento">
              {t("Mantenimiento General", "General Maintenance")}
            </option>
            <option value="seguridad">
              {t("Inspección de Seguridad", "Security Inspection")}
            </option>
            <option value="anual">
              {t("Contrato Anual", "Annual Contract")}
            </option>
          </select>
        </div>

        {/* FECHA */}
        <div className="cg-form-group">
          <label className="cg-label">{t("Fecha", "Date")}</label>
          <input
            type="date"
            name="fecha"
            className="cg-input"
            value={form.fecha}
            onChange={handleChange}
            required
          />
        </div>

        {/* DESCRIPCIÓN */}
        <div className="cg-form-group">
          <label className="cg-label">{t("Descripción", "Description")}</label>
          <textarea
            name="descripcion"
            className="cg-input"
            rows="4"
            placeholder={t("Detalles del contrato", "Contract details")}
            value={form.descripcion}
            onChange={handleChange}
            required
          ></textarea>
        </div>

        {/* BOTONES */}
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button type="submit" className="cg-btn cg-btn-accent">
            {t("Crear Contrato", "Create Contract")}
          </button>

          <button
            type="button"
            className="cg-btn cg-btn-ghost"
            onClick={() => window.history.back()}
          >
            {t("Cancelar", "Cancel")}
          </button>
        </div>

      </form>
    </div>
  );
}