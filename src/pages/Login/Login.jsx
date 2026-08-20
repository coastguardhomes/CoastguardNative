import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext.jsx";
import logo from "../../assets/logo.jpeg"; 

const COLOR_DORADO = "#e0b034";
const FONDO_GRADIENTE = "radial-gradient(circle at top, #1a1f26 0%, #030509 100%)";
const BORDE_DORADO_LUJO = "1px solid rgba(224, 176, 52, 0.3)";

export default function Login() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => { setCheckingSession(false); }, []);

  // ... (tu lógica redirigirSegunRol y handleLogin se mantiene igual)
  async function redirigirSegunRol(userId) {
    if (!userId) return;
    let { data: perfil } = await supabase.from("profiles").select("rol").eq("id", userId).maybeSingle();
    if (!perfil) { setErrorMsg("Error de configuración."); return; }
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
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.session) { setErrorMsg(t("loginError")); setLoading(false); return; }
      await redirigirSegunRol(data.session.user.id);
    } catch (e) { setErrorMsg(t("loginError")); }
    setLoading(false);
  };

  if (checkingSession) return null;

  return (
    <div style={{ 
      height: "100vh", 
      width: "100vw", 
      background: FONDO_GRADIENTE, // Fondo más profundo y profesional
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      padding: "20px" 
    }}>
      
      <div style={{ 
        width: "100%", 
        maxWidth: "400px", 
        background: "rgba(5, 8, 14, 0.7)", 
        backdropFilter: "blur(10px)", // Efecto cristal moderno
        padding: "40px 30px", 
        borderRadius: "24px", 
        border: BORDE_DORADO_LUJO, 
        boxShadow: "0 20px 40px rgba(0,0,0,0.6)" 
      }}>
        
        {/* Logo con corte de bordes y brillo dorado */}
        <div style={{ 
            width: "140px", 
            height: "140px", 
            margin: "0 auto 30px auto", 
            borderRadius: "20px", // Esquinas suavizadas
            border: `2px solid ${COLOR_DORADO}`,
            boxShadow: `0 0 25px rgba(224, 176, 52, 0.4)`, // Brillo dorado (Glow)
            overflow: "hidden", // Esto oculta el "Made with AI"
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
        }}>
            <img 
              src={logo} 
              alt="Logo" 
              style={{ 
                width: "115%", // Zoom para recortar esquinas
                height: "115%", 
                objectFit: "cover",
                objectPosition: "center"
              }} 
            />
        </div>

        <p style={{ textAlign: "center", color: "#ddd", fontSize: "15px", marginBottom: "30px", fontWeight: "300" }}>
          {t("loginSubtitle")}
        </p>

        {errorMsg && (
          <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", padding: "10px", borderRadius: "10px", color: "#ef4444", marginBottom: "20px", textAlign: "center", fontSize: "13px" }}>
            {errorMsg}
          </div>
        )}

        <input type="email" placeholder={t("email")} value={email} onChange={(e) => setEmail(e.target.value)} 
            style={{ width: "100%", padding: "16px", marginBottom: "16px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: "16px", boxSizing: "border-box" }} />

        <input type="password" placeholder={t("password")} value={password} onChange={(e) => setPassword(e.target.value)} 
            style={{ width: "100%", padding: "16px", marginBottom: "30px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: "16px", boxSizing: "border-box" }} />

        <button onClick={handleLogin} disabled={loading} style={{ width: "100%", padding: "18px", background: `linear-gradient(135deg, ${COLOR_DORADO} 0%, #a67c00 100%)`, color: "#000", border: "none", borderRadius: "14px", fontWeight: "900", cursor: "pointer", fontSize: "15px", textTransform: "uppercase", letterSpacing: "1px" }}>
          {loading ? t("loggingIn") : t("login")}
        </button>

        <button onClick={() => navigate("/register")} style={{ width: "100%", marginTop: "20px", background: "transparent", border: "none", color: "#888", fontSize: "13px", cursor: "pointer", textDecoration: "underline" }}>
          {t("register")}
        </button>
      </div>
    </div>
  );
}
