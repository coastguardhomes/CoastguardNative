import { useEffect } from "react";

export default function ErrorOverlay() {
  useEffect(() => {
    window.onerror = function (msg, url, line, col, error) {
      const div = document.createElement("div");
      div.style.position = "fixed";
      div.style.bottom = "0";
      div.style.left = "0";
      div.style.right = "0";
      div.style.background = "red";
      div.style.color = "white";
      div.style.padding = "12px";
      div.style.fontSize = "14px";
      div.style.zIndex = "999999";
      div.style.whiteSpace = "pre-wrap";
      div.innerText = `ERROR: ${msg}\n${url}:${line}:${col}`;
      document.body.appendChild(div);
    };
  }, []);

  return null;
}
