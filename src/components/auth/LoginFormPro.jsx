import { useState } from "react";

export default function LoginFormPro({ onSubmit }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f172a, #1e293b)",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#0b1120",
          padding: 30,
          borderRadius: 12,
          width: "100%",
          maxWidth: 380,
          color: "#e5e7eb",
          boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
        }}
      >
        <h2 style={{ marginBottom: 20, textAlign: "center" }}>
          CoastGuard Panel
        </h2>

        <div style={{ marginBottom: 15 }}>
          <label style={{ display: "block", marginBottom: 5 }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 6,
              border: "1px solid #1f2937",
              background: "#020617",
              color: "#e5e7eb",
            }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", marginBottom: 5 }}>
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 6,
              border: "1px solid #1f2937",
              background: "#020617",
              color: "#e5e7eb",
            }}
          />
        </div>

        <button
          type="submit"
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 6,
            border: "none",
            background: "#22c55e",
            color: "#022c22",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
