import { useEffect } from "react";

export default function ErrorOverlay() {
  useEffect(() => {
    window.onerror = function (msg, url, line, col, error) {
      // Evitar duplicados
      if (document.getElementById("cg-error-overlay")) return;

      const box = document.createElement("div");
      box.id = "cg-error-overlay";
      box.style.position = "fixed";
      box.style.bottom = "0";
      box.style.left = "0";
      box.style.right = "0";
      box.style.background = "rgba(255,0,0,0.85)";
      box.style.color = "#fff";
      box.style.padding = "16px";
      box.style.fontSize = "14px";
      box.style.fontFamily = "Inter, sans-serif";
      box.style.zIndex = "999999";
      box.style.whiteSpace = "pre-wrap";
      box.style.borderTop = "2px solid #ff8080";
      box.style.boxShadow = "0 -4px 12px rgba(0,0,0,0.4)";

      const title = document.createElement("div");
      title.style.fontWeight = "700";
      title.style.marginBottom = "8px";
      title.textContent = "⚠️ Error en la aplicación";

      const message = document.createElement("div");
      message.textContent = `Mensaje: ${msg}`;

      const location = document.createElement("div");
      location.textContent = `Ubicación: ${url}:${line}:${col}`;

      const stack = document.createElement("div");
      stack.style.marginTop = "8px";
      stack.style.opacity = "0.8";
      stack.textContent = error?.stack || "Sin stacktrace disponible";

      const closeBtn = document.createElement("button");
      closeBtn.textContent = "Cerrar";
      closeBtn.style.marginTop = "12px";
      closeBtn.style.padding = "6px 12px";
      closeBtn.style.background = "#fff";
      closeBtn.style.color = "#000";
      closeBtn.style.border = "none";
      closeBtn.style.borderRadius = "6px";
      closeBtn.style.cursor = "pointer";
      closeBtn.style.fontWeight = "600";
      closeBtn.onclick = () => box.remove();

      box.appendChild(title);
      box.appendChild(message);
      box.appendChild(location);
      box.appendChild(stack);
      box.appendChild(closeBtn);

      document.body.appendChild(box);
    };
  }, []);

  return null;
}
