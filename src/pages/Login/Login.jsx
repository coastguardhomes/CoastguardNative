            import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import logo from "../../assets/logo.jpeg"; 

const COLOR_DORADO = "#e0b034";
const FONDO_GRADIENTE = "radial-gradient(circle at top, #1a1f26 0%, #030509 100%)";
const BORDE_DORADO_LUJO = "1px solid rgba(224, 176, 52, 0.35)";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const { t, changeLanguage, language } = useLanguage();

  useEffect(() => { setCheckingSession(false); }, []);

  async function redirigirSegunRol(userId) {
    if (!userId) return;
    
    let { data: clienteData } = await supabase
      .from("clientes")
      .select("idioma")
      .eq("usuario_id", userId)
      .maybeSingle();

    if (clienteData && clienteData.idioma) {
      localStorage.setItem("app_idioma", clienteData.idioma);
    }

    let { data: perfil } = await supabase.from("profiles").select("rol").eq("id", userId).maybeSingle();
    if (!perfil) { setErrorMsg("Error de configuración."); return; }
    switch (perfil.rol) {
      case "admin": navigate("/admin/dashboard", { replace: true }); break;
      case "cliente": navigate("/cliente", { replace: true }); break;
      case "tecnico": navigate("/tecnico", { replace: true }); break;
      default: setErrorMsg("Rol de usuario no válido o sin permisos.");
    }
  }

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    setErrorMsg("");
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { 
        setErrorMsg(error.message || JSON.stringify(error)); 
        setLoading(false); 
        return; 
      }
      if (!data.session) { 
        setErrorMsg("No se pudo iniciar sesión, sesión no encontrada."); 
        setLoading(false); 
        return; 
      }
      
      await redirigirSegunRol(data.session.user.id);
    } catch (e) { 
      setErrorMsg(e?.message || String(e)); 
    }
    setLoading(false);
  };

  if (checkingSession) return null;

  return (
    <div style={{ 
      minHeight: "100vh", 
      width: "100%", 
      background: FONDO_GRADIENTE, 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      padding: "12px", 
      boxSizing: "border-box"
    }}>
      
      <div style={{ 
        width: "100%", 
        maxWidth: "400px", 
        background: "rgba(5, 8, 14, 0.85)", 
        backdropFilter: "blur(12px)", 
        padding: "28px 20px", 
        borderRadius: "22px", 
        border: BORDE_DORADO_LUJO, 
        boxShadow: "0 20px 40px rgba(0,0,0,0.8), 0 0 15px rgba(224, 176, 52, 0.1)",
        boxSizing: "border-box"
      }}>

        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
          <select
            value={language || localStorage.getItem("app_idioma") || "es"}
            onChange={(e) => {
              changeLanguage(e.target.value);
              localStorage.setItem("app_idioma", e.target.value);
            }}
            style={{
              background: "rgba(11, 19, 32, 0.9)",
              border: BORDE_DORADO_LUJO,
              color: COLOR_DORADO,
              padding: "4px 8px",
              borderRadius: "8px",
              fontSize: "11px",
              fontWeight: "700",
              cursor: "pointer",
              outline: "none"
            }}
          >
            <option value="es" style={{ background: "#030509", color: "#fff" }}>Español</option>
            <option value="en" style={{ background: "#030509", color: "#fff" }}>English</option>
            <option value="fr" style={{ background: "#030509", color: "#fff" }}>Français</option>
          </select>
        </div>
        
        <div style={{ 
            width: "110px", 
            height: "110px", 
            margin: "0 auto 20px auto", 
            borderRadius: "18px", 
            border: `2px solid ${COLOR_DORADO}`,
            boxShadow: `0 0 20px rgba(224, 176, 52, 0.4)`, 
            overflow: "hidden", 
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexShrink: 0
        }}>
            <img 
              src={logo} 
              alt="Logo" 
              style={{ 
                width: "115%", 
                height: "115%", 
                objectFit: "cover",
                objectPosition: "center"
              }} 
            />
        </div>

        <p style={{ textAlign: "center", color: "#ccc", fontSize: "13px", marginBottom: "22px", fontWeight: "400" }}>
          {t("loginSubtitle")}
        </p>

        {errorMsg && (
          <div style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.4)", padding: "10px", borderRadius: "10px", color: "#ef4444", marginBottom: "16px", textAlign: "center", fontSize: "12px", fontWeight: "700", wordBreak: "break-word" }}>
            {errorMsg}
          </div>
        )}

        <input 
          type="email" 
          placeholder="Correo electrónico" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          style={{ 
            width: "100%", 
            padding: "14px 16px", 
            marginBottom: "14px", 
            borderRadius: "12px", 
            border: BORDE_DORADO_LUJO, 
            background: "rgba(11, 19, 32, 0.9)", 
            color: "#fff", 
            fontSize: "14px", 
            boxSizing: "border-box",
            outline: "none" 
          }} 
        />

        <input 
          type="password" 
          placeholder="Contraseña" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          style={{ 
            width: "100%", 
            padding: "14px 16px", 
            marginBottom: "22px", 
            borderRadius: "12px", 
            border: BORDE_DORADO_LUJO, 
            background: "rgba(11, 19, 32, 0.9)", 
            color: "#fff", 
            fontSize: "14px", 
            boxSizing: "border-box",
            outline: "none" 
          }} 
        />

        <button 
          onClick={handleLogin} 
          disabled={loading} 
          style={{ 
            width: "100%", 
            padding: "15px", 
            background: `linear-gradient(135deg, ${COLOR_DORADO} 0%, #99751e 100%)`, 
            color: "#030509", 
            border: BORDE_DORADO_LUJO, 
            borderRadius: "14px", 
            fontWeight: "900", 
            cursor: "pointer", 
            fontSize: "13px", 
            textTransform: "uppercase", 
            letterSpacing: "0.5px",
            boxShadow: "0 4px 15px rgba(224, 176, 52, 0.3)",
            boxSizing: "border-box" 
          }}
        >
          {loading ? "Iniciando sesión..." : "Iniciar sesión"}
        </button>

        <button 
          onClick={() => navigate("/register")} 
          style={{ 
            width: "100%", 
            marginTop: "14px", 
            background: "transparent", 
            border: "none", 
            color: COLOR_DORADO, 
            fontSize: "13px", 
            fontWeight: "700",
            cursor: "pointer", 
            textDecoration: "underline" 
          }}
        >
          ¿No tienes cuenta? Regístrate
        </button>
      </div>
    </div>
  );
}
