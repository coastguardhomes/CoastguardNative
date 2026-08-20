import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext.jsx";
// Asegúrate de que esta ruta apunte correctamente a tu logo
import logo from "../../assets/logo.jpeg"; 

const COLOR_DORADO = "#e0b034";
const FONDO_PRINCIPAL = "#030509";
const FONDO_TARJETA = "linear-gradient(145deg, #0b1320 0%, #04070d 100%)";
const BORDE_DORADO_FINO = "1px solid rgba(224, 176, 52, 0.4)";
const SOMBRA_LUXURY = "0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 20px rgba(224, 176, 52, 0.12)";

export default function Login() {
  const { t } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    setCheckingSession(false);
  }, []);

  async function redirigirSegunRol(userId) {
    if (!userId) {
      setErrorMsg(t("loginError"));
      return;
    }

    let { data: perfil } = await supabase
      .from("profiles")
      .select("rol")
      .eq("id", userId)
      .maybeSingle();

    if (!perfil) {
      setErrorMsg("Tu cuenta no está correctamente configurada. Contacta con soporte.");
      return;
    }

    switch (perfil.rol) {
      case "admin": navigate("/admin/dashboard", { replace: true }); break;
      case "cliente": navigate("/cliente", { replace: true }); break;
      case "tecnico": navigate("/tecnico", { replace: true }); break;
      default: setErrorMsg(t("loginSinRol"));
    }
  }

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    setErrorMsg("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.session) {
        setErrorMsg(t("loginError"));
        setLoading(false);
        return;
      }
      await redirigirSegunRol(data.session.user.id);
    } catch (error) {
      setErrorMsg(t("loginError"));
    }
    setLoading(false);
  };

  if (checkingSession) {
    return (
      <div style={{ height: "100vh", background: FONDO_PRINCIPAL, display: "flex", justifyContent: "center", alignItems: "center", color: COLOR_DORADO, fontSize: "16px", fontWeight: "700" }}>
        {t("loading")}
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        background: FONDO_PRINCIPAL,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        fontFamily: "Inter, sans-serif",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "380px",
          background: FONDO_TARJETA,
          padding: "30px",
          borderRadius: "16px",
          border: BORDE_DORADO_FINO,
          boxShadow: SOMBRA_LUXURY,
          boxSizing: "border-box",
        }}
      >
        {/* Logo sustituyendo al texto */}
        <img 
          src={logo} 
          alt="CoastGuard Logo" 
          style={{ 
            width: "160px", 
            display: "block", 
            margin: "0 auto 25px auto", 
            borderRadius: "12px",
            boxShadow: "0 0 15px rgba(0,0,0,0.5)"
          }} 
        />

        <p
          style={{
            textAlign: "center",
            color: "#aaa",
            fontSize: "13px",
            marginBottom: "25px",
          }}
        >
          {t("loginSubtitle")}
        </p>

        {errorMsg && (
          <div style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.4)", padding: "12px", borderRadius: "12px", color: "#ef4444", marginBottom: "16px", fontSize: "13px", fontWeight: "700", textAlign: "center" }}>
            {errorMsg}
          </div>
        )}

        <input
          type="email"
          placeholder={t("email")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: "12px 14px", marginBottom: "16px", borderRadius: "12px", border: BORDE_DORADO_FINO, background: "rgba(11, 19, 32, 0.8)", color: "#fff", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
        />

        <input
          type="password"
          placeholder={t("password")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: "12px 14px", marginBottom: "20px", borderRadius: "12px", border: BORDE_DORADO_FINO, background: "rgba(11, 19, 32, 0.8)", color: "#fff", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px",
            background: loading ? "rgba(224, 176, 52, 0.5)" : "linear-gradient(135deg, #e0b034 0%, #99751e 100%)",
            color: "#030509",
            border: BORDE_DORADO_FINO,
            borderRadius: "16px",
            fontSize: "13px",
            fontWeight: "900",
            cursor: "pointer",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            boxShadow: "0 4px 15px rgba(224, 176, 52, 0.3)",
            boxSizing: "border-box",
          }}
        >
          {loading ? t("loggingIn") : t("login")}
        </button>

        <button
          onClick={() => navigate("/register")}
          style={{
            width: "100%",
            padding: "12px",
            background: "transparent",
            color: COLOR_DORADO,
            border: "none",
            borderRadius: "12px",
            fontSize: "13px",
            fontWeight: "700",
            cursor: "pointer",
            marginTop: "15px",
            textDecoration: "underline",
          }}
        >
          {t("register")}
        </button>
      </div>
    </div>
  );
            }
              
