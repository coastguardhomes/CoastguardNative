import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// Ocultar splash screen (Capacitor 5)
import { SplashScreen } from "@capacitor/splash-screen";
SplashScreen.hide();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
