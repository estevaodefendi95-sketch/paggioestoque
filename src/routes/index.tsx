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
const LS_KEY = "paggio-estoque-v1";
const TABLE = "estoque_state";
const TENANT_ID = "paggio";

function AppEstoque() {
  const [userId, setUserId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState<"idle" | "syncing" | "saved" | "error">("idle");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const initialPullDoneRef = useRef(false);
  const lastSyncedRef = useRef<string>("");
  const lastServerUpdatedRef = useRef<string>("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user.id ?? null);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user.id ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    initialPullDoneRef.current = false;

    const reloadIframe = () => {
      if (iframeRef.current) iframeRef.current.src = "/app.html?t=" + Date.now();
    };

    (async () => {
      setStatus("syncing");
      const { data, error } = await supabase
        .from(TABLE)
        .select("data, updated_at")
        .eq("tenant_id", TENANT_ID)
        .maybeSingle();
      if (cancelled) return;

      if (error) {
        console.error("[sync] pull error", error);
        setStatus("error");
        return;
      }

      // Nuvem é SEMPRE a fonte da verdade. Se vier vazio, o app abre vazio.
      const cloudData = (data?.data ?? {}) as object;
      const serialized = JSON.stringify(cloudData);
      const localCurrent = safeReadLocal();
      if (localCurrent !== serialized) {
        try {
          localStorage.setItem(LS_KEY, serialized);
        } catch (e) {
          console.error(e);
        }
        // Recarrega o iframe pra ele reler a localStorage já corrigida
        reloadIframe();
      }
      lastSyncedRef.current = serialized;
      lastServerUpdatedRef.current = (data?.updated_at as string) ?? "";
      initialPullDoneRef.current = true;
      setStatus("saved");

      // Push loop — só sobe alterações locais reais depois do pull inicial
      pollTimer = setInterval(async () => {
        if (!initialPullDoneRef.current) return;
        const current = safeReadLocal();
        if (current === null || current === lastSyncedRef.current) return;
        setStatus("syncing");
        let parsed: unknown;
        try {
          parsed = JSON.parse(current);
        } catch {
          return;
        }
        const nowIso = new Date().toISOString();
        const { error: upErr } = await supabase
          .from(TABLE)
          .upsert({ tenant_id: TENANT_ID, data: parsed as never, updated_at: nowIso }, { onConflict: "tenant_id" });
        if (upErr) {
          console.error("[sync] push error", upErr);
          setStatus("error");
        } else {
          lastSyncedRef.current = current;
          lastServerUpdatedRef.current = nowIso;
          setStatus("saved");
        }
      }, 2500);
    })();

    const onFocus = async () => {
      if (!userId || !initialPullDoneRef.current) return;
      const { data } = await supabase
        .from(TABLE)
        .select("data, updated_at")
        .eq("tenant_id", TENANT_ID)
        .maybeSingle();
      if (!data) return;
      if ((data.updated_at as string) > lastServerUpdatedRef.current) {
        const serialized = JSON.stringify(data.data ?? {});
        if (serialized !== lastSyncedRef.current) {
          localStorage.setItem(LS_KEY, serialized);
          lastSyncedRef.current = serialized;
          lastServerUpdatedRef.current = data.updated_at as string;
          reloadIframe();
        }
      }
    };
    window.addEventListener("focus", onFocus);

    return () => {
      cancelled = true;
      if (pollTimer) clearInterval(pollTimer);
      window.removeEventListener("focus", onFocus);
    };
  }, [userId]);

  async function limparTudo() {
    const ok = window.confirm(
      "Isso vai apagar TODOS os dados (materiais, movimentos, compras, conferências, vendas) na nuvem e neste dispositivo. Continuar?",
    );
    if (!ok) return;
    setStatus("syncing");
    try {
      localStorage.removeItem(LS_KEY);
    } catch {
      // ignore
    }
    const nowIso = new Date().toISOString();
    const { error } = await supabase
      .from(TABLE)
      .upsert({ tenant_id: TENANT_ID, data: {}, updated_at: nowIso }, { onConflict: "tenant_id" });
    if (error) {
      console.error(error);
      setStatus("error");
      return;
    }
    lastSyncedRef.current = "{}";
    lastServerUpdatedRef.current = nowIso;
    setStatus("saved");
    if (iframeRef.current) iframeRef.current.src = "/app.html?t=" + Date.now();
  }

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
            color: status === "error" ? "#E38B7A" : status === "syncing" ? "#D3A574" : "#8FB37E",
            background: "rgba(32,36,31,.85)",
            padding: "5px 10px",
            borderRadius: 999,
            border: "1px solid #3a3f37",
          }}
        >
          {status === "syncing" ? "Sincronizando…" : status === "error" ? "Erro sync" : "Sincronizado"}
        </span>
        <button
          onClick={limparTudo}
          style={{
            padding: "8px 14px",
            background: "#20241F",
            color: "#F1EEE3",
            border: "1px solid #A23B2E",
            borderRadius: 8,
            fontSize: 12,
            letterSpacing: ".04em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          Limpar tudo
        </button>
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

function safeReadLocal(): string | null {
  try {
    return localStorage.getItem(LS_KEY);
  } catch {
    return null;
  }
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

    if (email.trim().toLowerCase() !== EMAIL) {
      setErr("Usuário não autorizado.");
      setLoading(false);
      return;
    }

    let { error } = await supabase.auth.signInWithPassword({ email: EMAIL, password: pass });

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
