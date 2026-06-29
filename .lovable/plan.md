# Médias de Venda por Item

Adicionar, dentro da tela **Vendas** do `public/app.html`, um painel que mostra a média de venda de cada item nos períodos **diária, semanal e mensal**, com atalhos rápidos de intervalo.

## UI

Acima (ou abaixo) da listagem atual de vendas, novo bloco "Médias de Venda por Item":

- Barra de atalhos: `7 dias` · `30 dias` · `90 dias` · `Este mês` · `Tudo` (default: 30 dias).
- Indicador do intervalo efetivo aplicado (datas de/até calculadas).
- Tabela ordenada por "Média diária" desc:

```text
Item | Qtd vendida | Média diária | Média semanal | Média mensal
```

- Campo de busca por nome do item.
- Botão "Exportar CSV" das médias do período selecionado.

Visual seguindo os tokens já existentes (ink/paper/copper/sage, Oswald nos títulos, IBM Plex Mono nos números).

## Cálculo

Para o intervalo escolhido `[início, fim]`:

- `dias = max(1, (fim - início) em dias + 1)` considerando apenas dias dentro do intervalo com pelo menos uma venda registrada quando atalho = "Tudo"; para atalhos fixos (7/30/90/mês) usar a janela completa do atalho.
- `semanas = dias / 7`
- `meses = dias / 30` (aproximação consistente com atalhos)
- Para cada item: somar quantidade vendida no intervalo a partir de `vendas` no localStorage.
- `média diária = qtd / dias`, `semanal = qtd / semanas`, `mensal = qtd / meses`.
- Formatar com 2 casas; mostrar `—` quando qtd = 0.

## Implementação

Tudo dentro de `public/app.html` (sistema é um único HTML embarcado em iframe):

1. Adicionar a section/markup do painel na aba Vendas.
2. Adicionar função `renderMediasVendas()` que lê `vendas` do localStorage, aplica filtro de período e busca, e renderiza a tabela.
3. Religar nos eventos: troca de atalho, busca, e após cada nova venda salva.
4. Exportar CSV via Blob (mesmo padrão de export já usado no arquivo).

Sem mudanças de dados persistidos nem de outras telas.
