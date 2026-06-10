import { useContext } from "react";
import { UIContext } from "../../context/ui/UIContext.jsx";

export default function LoaderOverlay() {
  const ui = useContext(UIContext);

  if (!ui?.loading) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: "50%",
          border: "6px solid #334155",
          borderTopColor: "#22c55e",
          animation: "spin 0.8s linear infinite",
        }}
      />
    </div>
  );
}
