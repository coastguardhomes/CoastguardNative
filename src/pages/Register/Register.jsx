
import React, { useState } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [idioma, setIdioma] = useState("es");
  const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false);
  const [aceptaContrato, setAceptaContrato] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

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
      } catch {
        // Se conserva el mensaje genérico si el error no se puede convertir.
      }
    }

    if (!msg || msg === "{}") {
      msg = "Error de conexión con el servidor o credenciales inválidas";
    }

    setErrorMsg(customPrefix ? `${customPrefix}: ${msg}` : msg);
  };

  const handleRegister = async () => {
    setErrorMsg("");
    setMensaje("");

    const emailNormalizado = email.trim().toLowerCase();

    if (!emailNormalizado || !password) {
      setErrorMsg("Debes completar todos los campos");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (!aceptaPrivacidad || !aceptaContrato) {
      setErrorMsg(
        "Debes aceptar por separado la Política de Privacidad y el Contrato Marco de Servicios"
      );
      return;
    }

    setLoading(true);

    try {
      // No se afirma haber registrado la IP real del usuario.
      const userIp = "IP_NO_REGISTRADA";

      const fechaAceptacion = new Date().toISOString();

      // Versiones de los documentos legales actualizados.
      const versionPrivacidad = "v1.1";
      const versionContrato = "v1.1";

      const { data, error } = await supabase.auth.signUp({
        email: emailNormalizado,
        password,
        options: {
          emailRedirectTo: "coastguard://auth/callback",
          data: {
            acepta_terminos: true,
            terminos_aceptados_at: fechaAceptacion,
            ip_registro: userIp,
            version_terminos: versionContrato,
            idioma,

            acepta_privacidad: true,
            privacidad_aceptada_at: fechaAceptacion,
            version_privacidad: versionPrivacidad,

            acepta_contrato_marco: true,
            contrato_marco_aceptado_at: fechaAceptacion,
            version_contrato_marco: versionContrato,
          },
        },
      });

      if (error) {
        handleError(error);
        return;
      }

      const user = data?.user;

      if (!user) {
        setErrorMsg(
          "Error inesperado creando usuario (sin datos de usuario)"
        );
        return;
      }

      // Se conserva la creación del perfil.
      const { error: perfilError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          rol: "cliente",
        });

      if (perfilError) {
        console.error("Error creando perfil:", perfilError);
      }

      // Se busca si el cliente ya existe.
      const {
        data: clienteExistente,
        error: clienteBusquedaError,
      } = await supabase
        .from("clientes")
        .select("id")
        .eq("email", user.email)
        .maybeSingle();

      if (clienteBusquedaError) {
        console.error(
          "Error buscando cliente existente:",
          clienteBusquedaError
        );
      }

      const datosLegalesCliente = {
        email: user.email,
        idioma,
        acepta_privacidad: true,
        privacidad_aceptada_at: fechaAceptacion,
        ip_registro: userIp,
        version_privacidad: versionPrivacidad,
      };

      if (!clienteBusquedaError && !clienteExistente) {
        const { error: crearClienteError } = await supabase
          .from("clientes")
          .insert({
            id: user.id,
            user_id: user.id,
            ...datosLegalesCliente,
          });

        if (crearClienteError) {
          console.error(
            "Error creando cliente:",
            crearClienteError
          );
        }
      } else if (!clienteBusquedaError && clienteExistente) {
        const { error: actualizarClienteError } = await supabase
          .from("clientes")
          .update(datosLegalesCliente)
          .eq("id", clienteExistente.id);

        if (actualizarClienteError) {
          console.error(
            "Error actualizando cliente:",
            actualizarClienteError
          );
        }
      }

      changeLanguage(idioma);
      localStorage.setItem("app_idioma", idioma);

      setMensaje(
        "Cuenta creada correctamente. Se ha enviado un enlace de confirmación a tu correo."
      );

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
    } catch (error) {
      console.error("Error durante el registro:", error);
      handleError(error, "No se ha podido completar el registro");
    } finally {
      setLoading(false);
    }
  };

  const aceptaTodo = aceptaPrivacidad && aceptaContrato;

  const estiloEnlace = {
    color: "#4db8ff",
    textDecoration: "underline",
    cursor: "pointer",
  };

  const abrirDocumento = (documento) => (event) => {
    event.preventDefault();
    event.stopPropagation();
    navigate(`/documentos-legales#${documento}`);
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
            role="alert"
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
            role="status"
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
          autoComplete="email"
          required
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
          autoComplete="new-password"
          required
          minLength={6}
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
            htmlFor="idioma"
            style={{
              display: "block",
              marginBottom: "6px",
              fontSize: "13px",
              color: "#9fb3c8",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Idioma preferido / Preferred Language
          </label>

          <select
            id="idioma"
            value={idioma}
            onChange={(e) => setIdioma(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.2)",
              background: "#0a0f1a",
              color: "#fff",
              fontSize: "15px",
              boxSizing: "border-box",
            }}
          >
            <option value="es">🇪🇸 Español</option>
            <option value="en">🇬🇧 English</option>
            <option value="fr">🇫🇷 Français</option>
          </select>
        </div>

        <div
          style={{
            marginBottom: "14px",
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
            textAlign: "left",
          }}
        >
          <input
            type="checkbox"
            id="aceptaPrivacidad"
            checked={aceptaPrivacidad}
            onChange={(e) => setAceptaPrivacidad(e.target.checked)}
            required
            style={{
              marginTop: "4px",
              cursor: "pointer",
              width: "18px",
              height: "18px",
              flexShrink: 0,
            }}
          />

          <label
            htmlFor="aceptaPrivacidad"
            style={{
              fontSize: "12px",
              lineHeight: "1.5",
              color: "#9fb3c8",
              cursor: "pointer",
            }}
          >
            He leído la{" "}
            <a
              href="/documentos-legales#privacidad"
              onClick={abrirDocumento("privacidad")}
              style={estiloEnlace}
            >
              Política de Privacidad
            </a>{" "}
            y confirmo que he sido informado sobre el tratamiento de mis
            datos personales.
          </label>
        </div>

        <div
          style={{
            marginBottom: "20px",
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
            textAlign: "left",
          }}
        >
          <input
            type="checkbox"
            id="aceptaContrato"
            checked={aceptaContrato}
            onChange={(e) => setAceptaContrato(e.target.checked)}
            required
            style={{
              marginTop: "4px",
              cursor: "pointer",
              width: "18px",
              height: "18px",
              flexShrink: 0,
            }}
          />

          <label
            htmlFor="aceptaContrato"
            style={{
              fontSize: "12px",
              lineHeight: "1.5",
              color: "#9fb3c8",
              cursor: "pointer",
            }}
          >
            He leído y acepto el{" "}
            <a
              href="/documentos-legales#contrato"
              onClick={abrirDocumento("contrato")}
              style={estiloEnlace}
            >
              Contrato Marco de Servicios
            </a>
            .
          </label>
        </div>

        <button
          type="button"
          onClick={handleRegister}
          disabled={loading || !aceptaTodo}
          style={{
            width: "100%",
            padding: "12px",
            background: !aceptaTodo || loading ? "#2a324b" : "#0077cc",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            cursor: !aceptaTodo || loading ? "not-allowed" : "pointer",
            opacity: !aceptaTodo || loading ? "0.4" : "1",
            transition: "background 0.2s, opacity 0.2s",
          }}
        >
          {loading ? "Creando cuenta..." : "Registrarse"}
        </button>

        <button
          type="button"
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
    </div>
  );
}
