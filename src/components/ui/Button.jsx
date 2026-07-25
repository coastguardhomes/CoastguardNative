export default function Button({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px 15px",
        background: "#333",
        color: "#fff",
        border: "none",
        borderRadius: 4,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}
