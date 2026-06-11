import { useEffect } from "react";
import AppRouter from "./router/AppRouter";
import "./styles/global.css";

// 🔥 MOSTRAR ERRORES EN PANTALLA (para detectar la pantalla negra)
window.onerror = (msg, url, line, col, error) => {
  alert(
    "JS ERROR:\n" +
      msg +
      "\nArchivo: " +
      url +
      "\nLínea: " +
      line
  );
};

export default function App() {
  useEffect(() => {
    console.log("CoastGuardApp iniciada");
  }, []);

  return (
    <>
      <AppRouter />
    </>
  );
}
