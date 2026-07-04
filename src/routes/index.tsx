import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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

const EMAIL = "paggio.adm@gmail.com";
const PASSWORD = "Paggio1404!";

function AppEstoque() {
  const [userId, setUserId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const iframeAuthReadyRef = useRef(false);

  function sendTokenToIframe(accessToken: string, refreshToken: string) {
    iframeRef.current?.contentWindow?.postMessage(
      { type: "PAGGIO_AUTH_TOKEN", access_token: accessToken, refresh_token: refreshToken },
      window.location.origin,
    );
  }

  // Detect existing session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user.id ?? null);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user.id ?? null);
      // Sessão renovada (ex.: token expirou depois de ~1h) — repassa pro iframe
      // pra ele não parar de sincronizar no meio do expediente.
      if (session && iframeAuthReadyRef.current) {
        sendTokenToIframe(session.access_token, session.refresh_token);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Handshake de login com o iframe: quando o app.html avisa que está pronto,
  // mandamos o token da sessão atual pra ele poder falar com o Supabase também.
  useEffect(() => {
    if (!userId) return;
    const onMessage = async (ev: MessageEvent) => {
      if (ev.origin !== window.location.origin) return;
      if (!ev.data || ev.data.type !== "PAGGIO_ESTOQUE_READY") return;
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session) return;
      sendTokenToIframe(session.access_token, session.refresh_token);
      iframeAuthReadyRef.current = true;
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [userId]);

  if (!ready) return null;
  if (!userId) return <Login />;

  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <iframe
        ref={iframeRef}
        src="/app.html"
        title="Controle de Estoque · Paggio Gastro Bar"
        style={{ width: "100vw", height: "100vh", border: "none", display: "block" }}
      />
      <div
        style={{
          position: "fixed",
          bottom: 12,
          right: 12,
          display: "flex",
          gap: 8,
          alignItems: "center",
          zIndex: 9999,
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <span
          style={{
            fontSize: 11,
            letterSpacing: ".06em",
            textTransform: "uppercase",
            color: "#8FB37E",
            background: "rgba(32,36,31,.85)",
            padding: "5px 10px",
            borderRadius: 999,
            border: "1px solid #3a3f37",
          }}
        >
          Conectado
        </span>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
          }}
          style={{
            padding: "8px 14px",
            background: "#20241F",
            color: "#F1EEE3",
            border: "1px solid #BD6A2C",
            borderRadius: 8,
            fontSize: 12,
            letterSpacing: ".04em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          Sair
        </button>
      </div>
    </div>
  );
}

function Login() {
  const [email, setEmail] = useState(EMAIL);
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    // Only allow the fixed account
    if (email.trim().toLowerCase() !== EMAIL) {
      setErr("Usuário não autorizado.");
      setLoading(false);
      return;
    }

    let { error } = await supabase.auth.signInWithPassword({ email: EMAIL, password: pass });

    // First-time bootstrap: create the account if it doesn't exist yet
    if (error && /invalid|credentials/i.test(error.message) && pass === PASSWORD) {
      const { error: signUpErr } = await supabase.auth.signUp({
        email: EMAIL,
        password: PASSWORD,
      });
      if (!signUpErr) {
        const retry = await supabase.auth.signInWithPassword({ email: EMAIL, password: PASSWORD });
        error = retry.error;
      } else {
        error = signUpErr;
      }
    }

    if (error) setErr("E-mail ou senha inválidos.");
    setLoading(false);
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
          <img
            src="/logo.ico"
            alt="Paggio"
            style={{
              width: 56,
              height: 56,
              marginBottom: 12,
              display: "block",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          />
          <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: ".02em" }}>Paggio Gastro Bar</div>
          <div
            style={{ fontSize: 12, color: "#a8ac9f", marginTop: 4, letterSpacing: ".08em", textTransform: "uppercase" }}
          >
            Controle de Estoque
          </div>
        </div>

        <label style={labelStyle}>E-mail</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
          required
          style={inputStyle}
        />

        <label style={{ ...labelStyle, margin: "16px 0 6px" }}>Senha</label>
        <input
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          autoComplete="current-password"
          required
          style={inputStyle}
        />

        {err && <div style={{ marginTop: 12, color: "#E38B7A", fontSize: 13 }}>{err}</div>}

        <button
          type="submit"
          disabled={loading}
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
            cursor: loading ? "wait" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: ".08em",
  color: "#a8ac9f",
  marginBottom: 6,
};

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
