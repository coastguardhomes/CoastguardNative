import React, { useState } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext.jsx";

const TEXTOS = {
  es: {
    titulo: "Crear cuenta",
    email: "Correo electrónico",
    password: "Contraseña",
    idioma: "Idioma preferido",
    privacidad: "He leído la",
    politica: "Política de Privacidad",
    privacidadFinal:
      "y confirmo que he sido informado sobre el tratamiento de mis datos personales.",
    contratoInicio: "He leído y acepto el",
    contrato: "Contrato Marco de Servicios",
    contratoFinal: ".",
    notaContrato:
      "La aceptación del Contrato Marco no sustituye la revisión ni la firma del contrato concreto de los servicios que contrates. Ese contrato se mostrará para su revisión y firma en el proceso correspondiente.",
    crear: "Registrarse",
    creando: "Creando cuenta...",
    volver: "Volver al inicio de sesión",
    completar: "Debes completar todos los campos.",
    contrasenaCorta: "La contraseña debe tener al menos 6 caracteres.",
    aceptar:
      "Debes aceptar por separado la Política de Privacidad y el Contrato Marco de Servicios.",
    errorUsuario: "Error inesperado creando usuario (sin datos de usuario).",
    registroExito:
      "Cuenta creada correctamente. Se ha enviado un enlace de confirmación a tu correo.",
    errorGenerico:
      "Error de conexión con el servidor o credenciales inválidas",
    errorRegistro: "No se ha podido completar el registro",
  },
  en: {
    titulo: "Create account",
    email: "Email address",
    password: "Password",
    idioma: "Preferred language",
    privacidad: "I have read the",
    politica: "Privacy Policy",
    privacidadFinal:
      "and confirm that I have been informed about how my personal data is processed.",
    contratoInicio: "I have read and accept the",
    contrato: "Framework Service Agreement",
    contratoFinal: ".",
    notaContrato:
      "Accepting the Framework Service Agreement does not replace reviewing and signing the specific contract for the services you purchase. That contract will be presented for review and signature during the relevant process.",
    crear: "Sign up",
    creando: "Creating account...",
    volver: "Back to sign in",
    completar: "Please complete all fields.",
    contrasenaCorta: "The password must contain at least 6 characters.",
    aceptar:
      "You must separately accept the Privacy Policy and the Framework Service Agreement.",
    errorUsuario: "Unexpected error creating user (no user data returned).",
    registroExito:
      "Account created successfully. A confirmation link has been sent to your email.",
    errorGenerico:
      "Server connection error or invalid credentials",
    errorRegistro: "Registration could not be completed",
  },
  fr: {
    titulo: "Créer un compte",
    email: "Adresse e-mail",
    password: "Mot de passe",
    idioma: "Langue préférée",
    privacidad: "J’ai lu la",
    politica: "Politique de confidentialité",
    privacidadFinal:
      "et confirme avoir été informé du traitement de mes données personnelles.",
    contratoInicio: "J’ai lu et j’accepte le",
    contrato: "Contrat-cadre de services",
    contratoFinal: ".",
    notaContrato:
      "L’acceptation du contrat-cadre ne remplace pas la lecture ni la signature du contrat spécifique aux services souscrits. Ce contrat sera présenté pour examen et signature au cours de la procédure correspondante.",
    crear: "S’inscrire",
    creando: "Création du compte...",
    volver: "Retour à la connexion",
    completar: "Veuillez remplir tous les champs.",
    contrasenaCorta:
      "Le mot de passe doit contenir au moins 6 caractères.",
    aceptar:
      "Vous devez accepter séparément la Politique de confidentialité et le Contrat-cadre de services.",
    errorUsuario:
      "Erreur inattendue lors de la création du compte (aucune donnée utilisateur reçue).",
    registroExito:
      "Compte créé avec succès. Un lien de confirmation a été envoyé à votre adresse e-mail.",
    errorGenerico:
      "Erreur de connexion au serveur ou identifiants invalides",
    errorRegistro: "L’inscription n’a pas pu être finalisée",
  },
};

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [idioma, setIdioma] = useState(() => {
    const guardado = localStorage.getItem("app_idioma");
    return ["es", "en", "fr"].includes(guardado) ? guardado : "es";
  });
  const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false);
  const [aceptaContrato, setAceptaContrato] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();
  const { changeLanguage } = useLanguage();
  const texto = TEXTOS[idioma];

  const handleError = (err, customPrefix = "") => {
    let msg = "";

    if (!err) {
      msg = texto.errorGenerico;
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
      msg = texto.errorGenerico;
    }

    setErrorMsg(customPrefix ? `${customPrefix}: ${msg}` : msg);
  };

  const handleRegister = async () => {
    setErrorMsg("");
    setMensaje("");

    const emailNormalizado = email.trim().toLowerCase();

    if (!emailNormalizado || !password) {
      setErrorMsg(texto.completar);
      return;
    }

    if (password.length < 6) {
      setErrorMsg(texto.contrasenaCorta);
      return;
    }

    if (!aceptaPrivacidad || !aceptaContrato) {
      setErrorMsg(texto.aceptar);
      return;
    }

    setLoading(true);

    try {
      const versionPrivacidad = "v1.1";
      const versionContrato = "v1.1";

      const { data, error } = await supabase.auth.signUp({
        email: emailNormalizado,
        password,
        options: {
          emailRedirectTo: "coastguard://auth/callback",
          data: {
            idioma,
            acepta_privacidad: true,
            version_privacidad: versionPrivacidad,
            acepta_contrato_marco: true,
            contrato_marco_aceptado: true,
            contrato_marco_aceptado_at: null,
            version_contrato_marco: versionContrato,
            acepta_terminos: true,
            version_terminos: versionContrato,
          },
        },
      });

      if (error) {
        handleError(error);
        return;
      }

      const user = data?.user;

      if (!user) {
        setErrorMsg(texto.errorUsuario);
        return;
      }

      // Supabase mantiene la responsabilidad de crear el perfil,
      // vincular al cliente y guardar las evidencias legales.
      changeLanguage(idioma);
      localStorage.setItem("app_idioma", idioma);

      setMensaje(texto.registroExito);

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
    } catch (error) {
      console.error("Error durante el registro:", error);
      handleError(error, texto.errorRegistro);
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
        minHeight: "100vh",
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
        <div style={{ marginBottom: "20px" }}>
          <label
            htmlFor="idioma-registro"
            style={{
              display: "block",
              marginBottom: "6px",
              fontSize: "13px",
              color: "#9fb3c8",
            }}
          >
            {texto.idioma}
          </label>

          <select
            id="idioma-registro"
            value={idioma}
            disabled={loading}
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

        <h2
          style={{
            textAlign: "center",
            color: "#4db8ff",
            marginBottom: "20px",
            fontSize: "24px",
            fontWeight: "700",
          }}
        >
          {texto.titulo}
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
            aria-live="polite"
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
          aria-label={texto.email}
          placeholder={texto.email}
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
          aria-label={texto.password}
          placeholder={texto.password}
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
            {texto.privacidad}{" "}
            <a
              href="/documentos-legales#privacidad"
              onClick={abrirDocumento("privacidad")}
              style={estiloEnlace}
            >
              {texto.politica}
            </a>{" "}
            {texto.privacidadFinal}
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
            {texto.contratoInicio}{" "}
            <a
              href="/documentos-legales#contrato"
              onClick={abrirDocumento("contrato")}
              style={estiloEnlace}
            >
              {texto.contrato}
            </a>
            {texto.contratoFinal}
          </label>
        </div>

        <p
          style={{
            color: "#9fb3c8",
            fontSize: "12px",
            lineHeight: "1.5",
            marginBottom: "20px",
          }}
        >
          {texto.notaContrato}
        </p>

        <button
          type="button"
          onClick={handleRegister}
          disabled={loading || !aceptaTodo}
          style={{
            width: "100%",
            padding: "12px",
            background:
              !aceptaTodo || loading ? "#2a324b" : "#0077cc",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            cursor:
              !aceptaTodo || loading ? "not-allowed" : "pointer",
            opacity: !aceptaTodo || loading ? "0.4" : "1",
            transition: "background 0.2s, opacity 0.2s",
          }}
        >
          {loading ? texto.creando : texto.crear}
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
          {texto.volver}
        </button>
      </div>
    </div>
  );
}
