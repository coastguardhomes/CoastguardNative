// --- Overlay de errores en pantalla ---
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
  div.innerText = msg + " @ " + url + ":" + line;
  document.body.appendChild(div);
};

// --- Arranque normal de React ---
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// IMPORT CORRECTO SEGÚN TU PROYECTO
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
