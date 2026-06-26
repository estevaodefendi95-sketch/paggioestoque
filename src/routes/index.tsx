import { createFileRoute } from "@tanstack/react-router";

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

function AppEstoque() {
  return (
    <iframe
      src="/app.html"
      title="Controle de Estoque · Paggio Gastro Bar"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        border: "none",
      }}
    />
  );
}
