## Objetivo

Recriar fielmente o sistema "Controle de Estoque · Paggio Gastro Bar" do HTML enviado, dentro do projeto TanStack Start, com o mesmo visual (paleta cobre/papel/tinta, fontes Oswald + Inter + IBM Plex Mono) e todas as telas e regras. Persistência 100% no `localStorage` do navegador (sem backend, sem login).

## Telas (rotas)

Layout com sidebar fixa escura + área de conteúdo, igual ao original:

- `/` Dashboard — cards de resumo (valor de estoque, itens em alerta, movimentações recentes), lista de itens que precisam de atenção, recentes.
- `/materiais` Materiais — cadastro individual, importação de lista em texto (parser), tabela com busca, filtro de status, valor total por módulo.
- `/entrada` Entrada — lançar compra (pendente) + registrar entrada que dá baixa em compra/aumenta estoque, histórico recente.
- `/saida` Saída — registrar saída por consumo, histórico recente.
- `/perdas` Perdas — registrar perda com motivo (vencimento, quebra, etc.), histórico.
- `/conferencia` Conferência — contagem física por material, cálculo de diferenças, confirmação de ajustes, exportar PDF da conferência.
- `/vendas` Vendas — importar vendas via texto colado, baixa automática no estoque conforme ficha técnica.
- `/relatorios` Relatórios — visões consolidadas (movimentações, perdas, valor de estoque por módulo/período).

Cada rota usa `createFileRoute` com `head()` próprio (title/description em PT-BR).

## Estrutura de arquivos

```text
src/
  routes/
    __root.tsx                 # shell + sidebar layout + fontes via <link>
    index.tsx                  # Dashboard
    materiais.tsx
    entrada.tsx
    saida.tsx
    perdas.tsx
    conferencia.tsx
    vendas.tsx
    relatorios.tsx
  components/
    app-sidebar.tsx            # nav cobre/escuro com badges
    save-pill.tsx              # indicador "salvo / salvando"
    collapsible-panel.tsx
    data-table.tsx (leve)
  lib/
    estoque/
      store.ts                 # estado central + subscribe + persistência localStorage
      types.ts                 # Material, Movimento, Compra, Conferencia, Venda, FichaTecnica
      parsers.ts               # parser de lista de materiais e de vendas (texto colado)
      calculations.ts          # valor de estoque, alertas, diferenças de conferência
      pdf.ts                   # exportar conferência em PDF (jsPDF + autotable)
      seed.ts                  # estado inicial vazio + migração de versões
  styles.css                   # tokens (--ink, --paper, --copper, --sage, --rust, --mute, --line) + classes do design original
```

## Design system (tokens em `styles.css`)

Reproduzir as variáveis do HTML como tokens semânticos OKLCH equivalentes + utilitárias Tailwind via `@theme inline`:

- `--ink #20241F`, `--paper #F1EEE3`, `--copper #BD6A2C`, `--sage #5E7A52`, `--rust #A23B2E`, `--mute #6B6F63`, `--line #D8D3C2`, `--white #FBFAF6`.
- Tipografia: Oswald (display/h1-h3), Inter (corpo), IBM Plex Mono (números/códigos) — carregadas via `<link rel="stylesheet">` no `head()` do `__root.tsx` (não via `@import` no CSS).
- Componentes visuais replicados: sidebar 220px escura com item ativo cobre, painéis brancos com sombra suave, tags/pills, tabelas com linhas finas, botões `btn-primary` (cobre), `btn-secondary`, `btn-danger` (rust), `btn-ghost`, indicadores de módulo (mod-bar, mod-cozinha, etc.), `save-pill`.

## Modelo de dados (localStorage)

Chave única `paggio-estoque-v1` contendo:

```text
{
  version: 1,
  materiais: [{ id, codigo, descricao, unidade, modulo, estoqueAtual,
                estoqueMinimo, valorCompra, criadoEm }],
  movimentos: [{ id, tipo: 'entrada'|'saida'|'perda'|'ajuste',
                 materialId, qtd, valorUnitario?, motivo?, obs?, data }],
  compras:    [{ id, materialId, qtd, valorUnitario?, obs, status:'pendente'|'recebida', criadoEm, recebidoEm? }],
  conferencias:[{ id, data, itens:[{materialId, contado, sistema, diferenca}], confirmada }],
  vendas:     [{ id, data, itens:[{descricao, qtd, materialId?}], textoOriginal }],
  fichasTecnicas:[{ produtoVenda, componentes:[{materialId, qtdPorUnidade}] }]
}
```

Store simples em `store.ts`: objeto com `getState`, `setState(updater)`, `subscribe(listener)`, hook `useEstoque(selector)`. Cada `setState` serializa para `localStorage` (debounce 200ms) e atualiza a `save-pill` ("salvando…" → "salvo agora").

## Regras de negócio (porta direta do HTML)

- **Materiais**: validação de código único, módulos (Bar, Cozinha, Limpeza, etc. — extrair lista exata do HTML), valor total por módulo somando `estoqueAtual * valorCompra`.
- **Importação de lista**: textarea cola texto multi-linha; `parsers.ts` separa por linha, identifica `codigo descricao unidade qtd valor`, mostra preview em tabela com tag de contagem, confirma ou cancela.
- **Compra → Entrada**: lançar compra cria registro pendente; ao "Registrar entrada" pode-se referenciar compra pendente, somar ao estoque, atualizar `valorCompra` se informado, marcar compra como recebida.
- **Saída**: subtrai do estoque, registra motivo.
- **Perdas**: subtrai do estoque, exige motivo do select (vencimento, quebra, cortesia, outro).
- **Conferência**: lista todos materiais com input de contagem; "Calcular diferenças" gera preview com diferença e valor financeiro; "Confirmar ajustes" cria movimentos do tipo `ajuste`; "Exportar PDF" usa jsPDF para gerar relatório formatado com cabeçalho Paggio.
- **Vendas**: parser de texto colado (formato do PDV) identifica produtos vendidos e, via ficha técnica, dá baixa nos materiais correspondentes.
- **Dashboard**: cards (valor total estoque, nº de materiais, itens em alerta `estoqueAtual <= estoqueMinimo`, movimentos do dia), lista de alertas e movimentos recentes (últimos 10).
- **Botão "Apagar todos os dados"**: limpa `localStorage` com confirmação dupla.

## Detalhes técnicos

- TanStack Start file-based routing; nada de `src/pages/`.
- Sidebar usa `<Link>` do `@tanstack/react-router` com `activeProps` para o estado cobre ativo.
- Toda lógica no cliente — sem `createServerFn`. Componentes que leem `localStorage` são wrappers `'use client'`-equivalentes: leem dentro de `useEffect`/`useSyncExternalStore` para evitar mismatch SSR (estado inicial vazio no servidor).
- PDF: `bun add jspdf jspdf-autotable`.
- Sem dependências de UI extras além do shadcn já presente; a maioria dos componentes é HTML+Tailwind para casar com o visual artesanal do original.
- `head()` por rota com title `… · Paggio Gastro Bar` e descrição PT-BR.

## Ordem de implementação

1. Tokens, fontes e layout (`__root.tsx` + sidebar + save-pill).
2. `store.ts` + tipos + persistência + seed vazio.
3. Materiais (cadastro + importação + tabela).
4. Entrada (compra + recebimento) e Saída.
5. Perdas.
6. Dashboard.
7. Conferência + exportar PDF.
8. Vendas (parser + ficha técnica) e Relatórios.
9. Botão "apagar todos os dados" e ajustes finais de paridade visual.

Resultado: visual e fluxos idênticos ao HTML original, agora como app TanStack Start navegável por rotas, com os mesmos dados persistidos no navegador.