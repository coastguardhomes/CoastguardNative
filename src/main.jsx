import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { HashRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { LanguageProvider } from './context/LanguageContext.jsx';

import './styles/global.css';

// --- ESCUDO ATRAPA-ERRORES DE REACT (EVITA PANTALLAS EN BLANCO) ---
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("Error capturado por Boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "20px", background: "#7f1d1d", color: "#fff", minHeight: "100vh", fontFamily: "monospace", overflow: "auto", zIndex: 999999, position: "relative" }}>
          <h2 style={{ color: "#fca5a5" }}>🚨 ¡Error de React Detectado!</h2>
          <p><strong>Mensaje:</strong> {this.state.error && this.state.error.toString()}</p>
          <pre style={{ background: "#000", padding: "10px", fontSize: "12px", whiteSpace: "pre-wrap" }}>
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- CAPTURA GLOBAL DE ERRORES (BARRA ROJA) ---
window.onerror = function (msg, url, line, col, error) {
  const div = document.createElement("div");
  div.style.position = "fixed";
  div.style.top = "0";
  div.style.left = "0";
  div.style.width = "100%";
  div.style.background = "red";
  div.style.color = "white";
  div.style.padding = "10px";
  div.style.zIndex = "999999";
  div.style.fontSize = "14px";
  div.style.whiteSpace = "pre-wrap";
  div.innerText = "ERROR GLOBAL: " + msg + "\n" + url + ":" + line;
  document.body.appendChild(div);
};
// --- FIN DEL CAPTURADOR ---

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <LanguageProvider>
        <HashRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </HashRouter>
      </LanguageProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
