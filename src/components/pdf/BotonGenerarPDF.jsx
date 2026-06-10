export default function BotonGenerarPDF({ generarPDF }) {
  return (
    <button
      onClick={generarPDF}
      style={{
        padding: "12px 18px",
        background: "#0A84FF",
        color: "white",
        border: "none",
        borderRadius: 8,
        cursor: "pointer",
        marginBottom: 20,
        width: "100%",
        fontSize: 16,
      }}
    >
      📄 Generar PDF
    </button>
  );
}
