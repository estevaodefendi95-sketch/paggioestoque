import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Controle de Estoque · Paggio Gastro Bar" },
      {
        name: "description",
        content:
          "Sistema de controle de estoque do Paggio Gastro Bar — materiais, entradas, saídas, perdas, conferência e vendas.",
      },
    ],
  }),
  component: AppEstoque,
});

const AUTH_KEY = "paggio-auth-v1";
const EMAIL = "paggio.adm@gmail.com";
const PASSWORD = "Paggio1404!";

function AppEstoque() {
  const [authed, setAuthed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setAuthed(localStorage.getItem(AUTH_KEY) === "1");
    } catch {}
    setReady(true);
  }, []);

  if (!ready) return null;
  if (!authed) return <Login onSuccess={() => setAuthed(true)} />;

  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <iframe
        src="/app.html"
        title="Controle de Estoque · Paggio Gastro Bar"
        style={{ width: "100vw", height: "100vh", border: "none", display: "block" }}
      />
      <button
        onClick={() => {
          try { localStorage.removeItem(AUTH_KEY); } catch {}
          setAuthed(false);
        }}
        style={{
          position: "fixed",
          bottom: 12,
          right: 12,
          padding: "8px 14px",
          background: "#20241F",
          color: "#F1EEE3",
          border: "1px solid #BD6A2C",
          borderRadius: 8,
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: 12,
          letterSpacing: ".04em",
          textTransform: "uppercase",
          cursor: "pointer",
          zIndex: 9999,
        }}
      >
        Sair
      </button>
    </div>
  );
}

function Login({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim().toLowerCase() === EMAIL && pass === PASSWORD) {
      try { localStorage.setItem(AUTH_KEY, "1"); } catch {}
      onSuccess();
    } else {
      setErr("E-mail ou senha inválidos.");
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#20241F",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, system-ui, sans-serif",
        color: "#F1EEE3",
        padding: 20,
      }}
    >
      <form
        onSubmit={submit}
        style={{
          width: "100%",
          maxWidth: 380,
          background: "#2A2E28",
          border: "1px solid #3a3f37",
          borderRadius: 14,
          padding: 32,
          boxShadow: "0 20px 60px rgba(0,0,0,.5)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <img src="/logo.ico" alt="Paggio" style={{ width: 56, height: 56, marginBottom: 12, display: "block", marginLeft: "auto", marginRight: "auto" }} />
          <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: ".02em" }}>
            Paggio Gastro Bar
          </div>
          <div style={{ fontSize: 12, color: "#a8ac9f", marginTop: 4, letterSpacing: ".08em", textTransform: "uppercase" }}>
            Controle de Estoque
          </div>
        </div>

        <label style={{ display: "block", fontSize: 11, textTransform: "uppercase", letterSpacing: ".08em", color: "#a8ac9f", marginBottom: 6 }}>
          E-mail
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
          required
          style={inputStyle}
        />

        <label style={{ display: "block", fontSize: 11, textTransform: "uppercase", letterSpacing: ".08em", color: "#a8ac9f", margin: "16px 0 6px" }}>
          Senha
        </label>
        <input
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          autoComplete="current-password"
          required
          style={inputStyle}
        />

        {err && (
          <div style={{ marginTop: 12, color: "#E38B7A", fontSize: 13 }}>{err}</div>
        )}

        <button
          type="submit"
          style={{
            marginTop: 22,
            width: "100%",
            padding: "12px 16px",
            background: "#BD6A2C",
            color: "#FBFAF6",
            border: "none",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: ".08em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          Entrar
        </button>
      </form>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  background: "#20241F",
  border: "1px solid #3a3f37",
  borderRadius: 8,
  color: "#F1EEE3",
  fontSize: 14,
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
};
