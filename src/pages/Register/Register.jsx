import React, { useState } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [idioma, setIdioma] = useState("es");
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  
  // Estados para controlar los dos modales por separado
  const [modalPrivacidad, setModalPrivacidad] = useState(false);
  const [modalContrato, setModalContrato] = useState(false);

  const navigate = useNavigate();
  const { changeLanguage } = useLanguage();

  const handleError = (err, customPrefix = "") => {
    let msg = "";
    if (!err) {
      msg = "Error desconocido";
    } else if (typeof err === "string") {
      msg = err;
    } else if (err.message) {
      msg = err.message;
    } else {
      try {
        const stringified = JSON.stringify(err);
        if (stringified && stringified !== "{}" && stringified !== "[]") {
          msg = stringified;
        }
      } catch (e) {}
    }
    if (!msg || msg === "{}") {
      msg = "Error de conexión con el servidor o credenciales inválidas";
    }
    setErrorMsg(customPrefix ? `${customPrefix}: ${msg}` : msg);
  };

  const handleRegister = async () => {
    setErrorMsg("");
    setMensaje("");

    if (!email || !password) {
      setErrorMsg("Debes completar todos los campos");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (!aceptaTerminos) {
      setErrorMsg("Debes aceptar la Política de Privacidad y el Contrato Marco de Servicios");
      return;
    }

    setLoading(true);

    let userIp = "IP_NO_DISPONIBLE";
    try {
      const ipRes = await fetch("https://api64.ipify.org?format=json");
      const ipData = await ipRes.json();
      userIp = ipData.ip;
    } catch (err) {
      console.warn("No se pudo obtener la IP del cliente", err);
    }

    const fechaAceptacion = new Date().toISOString();
    const versionTerminos = "v1.0";

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: "coastguard://auth/callback",
        data: {
          acepta_terminos: true,
          terminos_aceptados_at: fechaAceptacion,
          ip_registro: userIp,
          version_terminos: versionTerminos,
        },
      },
    });

    if (error) {
      handleError(error);
      setLoading(false);
      return;
    }

    const user = data?.user;
    if (!user) {
      setErrorMsg("Error inesperado creando usuario (sin datos de usuario)");
      setLoading(false);
      return;
    }

    const { error: perfilError } = await supabase
      .from("profiles")
      .insert({ id: user.id, rol: "cliente" });

    if (perfilError) {
      console.error("Error creando perfil:", perfilError);
    }

    const { data: clienteExistente } = await supabase
      .from("clientes")
      .select("id")
      .eq("email", user.email)
      .maybeSingle();

    const datosLegalesCliente = {
      email: user.email,
      idioma: idioma,
      acepta_terminos: true,
      terminos_aceptados_at: fechaAceptacion,
      ip_registro: userIp,
      version_terminos: versionTerminos,
    };

    if (!clienteExistente) {
      const { error: crearClienteError } = await supabase
        .from("clientes")
        .insert(datosLegalesCliente);

      if (crearClienteError) {
        handleError(crearClienteError, "Error DB (Crear)");
        setLoading(false);
        return;
      }
    } else {
      await supabase
        .from("clientes")
        .update(datosLegalesCliente)
        .eq("email", user.email);
    }

    changeLanguage(idioma);
    localStorage.setItem("app_idioma", idioma);

    setMensaje("Cuenta creada correctamente. Se ha enviado un enlace de confirmación a tu correo.");
    setLoading(false);

    setTimeout(() => {
      navigate("/login", { replace: true });
    }, 2000);
  };

  return (
    <div
      style={{
        height: "100%",
        background: "#0a0f1a",
        padding: "20px",
        color: "#fff",
        fontFamily: "Inter, sans-serif",
        boxSizing: "border-box",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          maxWidth: "380px",
          margin: "20px auto",
          background: "rgba(255,255,255,0.05)",
          padding: "30px",
          borderRadius: "14px",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 0 18px rgba(0,153,255,0.25)",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            color: "#4db8ff",
            marginBottom: "20px",
            fontSize: "24px",
            fontWeight: "700",
          }}
        >
          Crear cuenta
        </h2>

        {errorMsg && (
          <div
            style={{
              background: "rgba(255,0,0,0.15)",
              padding: "10px",
              borderRadius: "8px",
              color: "#ff6b6b",
              marginBottom: "15px",
              textAlign: "center",
              fontSize: "13px",
              wordBreak: "break-word",
            }}
          >
            {errorMsg}
          </div>
        )}

        {mensaje && (
          <div
            style={{
              background: "rgba(0,255,0,0.15)",
              padding: "10px",
              borderRadius: "8px",
              color: "#4dff88",
              marginBottom: "15px",
              textAlign: "center",
            }}
          >
            {mensaje}
          </div>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "15px",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.08)",
            color: "#fff",
            fontSize: "15px",
            boxSizing: "border-box",
          }}
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "15px",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.08)",
            color: "#fff",
            fontSize: "15px",
            boxSizing: "border-box",
          }}
        />

        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontSize: "13px",
              color: "#9fb3c8",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Idioma Preferido / Preferred Language
          </label>
          <select
            value={idioma}
            onChange={(e) => setIdioma(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.08)",
              color: "#fff",
              fontSize: "15px",
              boxSizing: "border-box",
            }}
          >
            <option value="es" style={{ background: "#0a0f1a", color: "#fff" }}>🇪🇸 Español</option>
            <option value="en" style={{ background: "#0a0f1a", color: "#fff" }}>🇬🇧 English</option>
            <option value="fr" style={{ background: "#0a0f1a", color: "#fff" }}>🇫🇷 Français</option>
          </select>
        </div>

        {/* CHECKBOX LEGAL (POLÍTICA DE PRIVACIDAD + CONTRATO MARCO) */}
        <div style={{ marginBottom: "20px", display: "flex", alignItems: "flex-start", gap: "10px", textAlign: "left" }}>
          <input
            type="checkbox"
            id="terminos"
            checked={aceptaTerminos}
            onChange={(e) => setAceptaTerminos(e.target.checked)}
            style={{ marginTop: "4px", cursor: "pointer", width: "18px", height: "18px", flexShrink: 0 }}
          />
          <label htmlFor="terminos" style={{ fontSize: "12px", lineHeight: "1.4", color: "#9fb3c8", cursor: "pointer" }}>
            He leído y acepto la{" "}
            <span
              onClick={(e) => {
                e.preventDefault();
                setModalPrivacidad(true);
              }}
              style={{ color: "#4db8ff", textDecoration: "underline", cursor: "pointer" }}
            >
              Política de Privacidad
            </span>{" "}
            y los términos del{" "}
            <span
              onClick={(e) => {
                e.preventDefault();
                setModalContrato(true);
              }}
              style={{ color: "#4db8ff", textDecoration: "underline", cursor: "pointer" }}
            >
              Contrato Marco de Servicios
            </span>
            .
          </label>
        </div>

        {/* BOTÓN BLOQUEADO HASTA MARCAR LA CASILLA */}
        <button
          onClick={handleRegister}
          disabled={loading || !aceptaTerminos}
          style={{
            width: "100%",
            padding: "12px",
            background: (!aceptaTerminos || loading) ? "#2a324b" : "#0077cc",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            cursor: (!aceptaTerminos || loading) ? "not-allowed" : "pointer",
            opacity: (!aceptaTerminos || loading) ? "0.4" : "1",
            transition: "background 0.2s, opacity 0.2s",
          }}
        >
          {loading ? "Creando cuenta..." : "Registrarse"}
        </button>

        <button
          onClick={() => navigate("/login")}
          style={{
            width: "100%",
            padding: "12px",
            background: "transparent",
            color: "#4db8ff",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            cursor: "pointer",
            marginTop: "15px",
            textDecoration: "underline",
          }}
        >
          Volver al login
        </button>
      </div>

      {/* MODAL 1: POLÍTICA DE PRIVACIDAD */}
      {modalPrivacidad && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            padding: "20px",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              background: "#101726",
              padding: "25px",
              borderRadius: "12px",
              maxWidth: "500px",
              width: "100%",
              maxHeight: "80vh",
              overflowY: "auto",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "#fff",
              textAlign: "left",
            }}
          >
            <h3 style={{ color: "#4db8ff", marginTop: 0, marginBottom: "15px" }}>Política de Privacidad</h3>
            <div style={{ fontSize: "13px", lineHeight: "1.6", color: "#ccc", marginBottom: "20px" }}>
              <p><strong>1. Responsable del tratamiento:</strong> Roxana Collazo Alonso (NIE: Z1968154A).</p>
              <p><strong>2. Datos que recopilamos:</strong> Datos de identificación, correo electrónico, datos del inmueble y de facturación necesarios para la prestación del servicio.</p>
              <p><strong>3. Finalidad:</strong> Gestión administrativa, facturación y atención de avisos o emergencias en la plataforma web y móvil.</p>
              <p><strong>4. Legitimación:</strong> Ejecución de contrato y consentimiento explícito del usuario mediante el registro.</p>
              <p><strong>5. Derechos:</strong> Puedes ejercer tus derechos escribiendo un correo a coastguardhomes@gmail.com para solicitar el acceso, rectificación o supresión de tus datos.</p>
            </div>
            <button
              onClick={() => setModalPrivacidad(false)}
              style={{
                width: "100%",
                padding: "10px",
                background: "#0077cc",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: CONTRATO MARCO DE SERVICIOS */}
      {modalContrato && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            padding: "20px",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              background: "#101726",
              padding: "25px",
              borderRadius: "12px",
              maxWidth: "500px",
              width: "100%",
              maxHeight: "80vh",
              overflowY: "auto",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "#fff",
              textAlign: "left",
            }}
          >
            <h3 style={{ color: "#4db8ff", marginTop: 0, marginBottom: "15px" }}>Contrato Marco de Servicios</h3>
            <div style={{ fontSize: "13px", lineHeight: "1.6", color: "#ccc", marginBottom: "20px" }}>
              <p><strong>1. Objeto:</strong> Regulación de la prestación de servicios de gestión, avisos y mantenimiento a través de la aplicación.</p>
              <p><strong>2. Condiciones de contratación y pagos:</strong> Los servicios contratados mediante la plataforma implican las condiciones de cobro y pagos por adelantado o según tarifa acordada.</p>
              <p><strong>3. Limitación de responsabilidad:</strong> La prestación de servicios se realiza bajo los estándares profesionales establecidos, limitando la responsabilidad a los términos legalmente aplicables.</p>
              <p><strong>4. Validez:</strong> La aceptación de este contrato se realiza de forma telemática durante el proceso de registro del usuario.</p>
            </div>
            <button
              onClick={() => setModalContrato(false)}
              style={{
                width: "100%",
                padding: "10px",
                background: "#0077cc",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
