## O que muda

### 1. Editar nome do material (aba Materiais)
Hoje o nome do produto já aceita edição, mas o campo é invisível (sem borda, sem fundo), então parece só um texto e ninguém percebe que dá pra alterar. Vou:

- Deixar o campo do nome com aparência de campo editável (borda sutil que aparece ao passar o mouse / ao focar, fundo levemente destacado).
- Salvar automaticamente ao sair do campo (Tab / clique fora / Enter), como já acontece com os outros campos da linha.
- Mostrar um aviso rápido "Nome de … atualizado" para confirmar que salvou na nuvem.
- Atualizar imediatamente os lugares que mostram o nome do material (selects de compra, entrada, saída, perda, conferência, vendas, histórico) para refletir o novo nome sem precisar recarregar.

O código do material continua fixo (não muda); só o nome exibido é editado.

### 2. Menu mobile mais claro
Hoje, em telas estreitas, o menu vira uma faixa única horizontal com Bar/Limpeza/Cozinha misturados com Dashboard/Materiais/Compras/etc, tudo apertado e com rolagem horizontal confusa. Vou reorganizar em duas linhas fixas no topo:

```
┌─────────────────────────────────────────────┐
│  [ Bar ] [ Limpeza ] [ Cozinha ]            │  ← módulo (linha 1)
├─────────────────────────────────────────────┤
│  ▸ Painel  Materiais  Compras  …   →        │  ← seções (linha 2, rola se precisar)
└─────────────────────────────────────────────┘
```

- Linha 1: os três módulos ocupando toda a largura, iguais, bem visíveis (mantendo as cores atuais de cada módulo quando ativo).
- Linha 2: as abas do sistema (Painel, Materiais, Compras, Entradas, Saídas, Perdas, Conferência, Vendas, Histórico) como pílulas de tamanho consistente, com rolagem horizontal suave só se não couberem; a aba ativa fica destacada em cobre.
- Ícones das abas ficam ocultos no mobile (só o texto) para caber melhor.
- Rodapé da sidebar (indicador de sincronização e botão "Apagar todos os dados") continua escondido no mobile, como hoje — o botão "Sair" e o status de sincronização já ficam no canto inferior direito da tela.

Nada muda em tablets/desktop — só ajustes na faixa `@media (max-width:760px)`.

## Escopo técnico

- Arquivo único afetado: `public/app.html`.
  - CSS: ajuste do bloco `@media (max-width:760px)` e um estado visual novo para `.edit-descricao`.
  - JS: pequeno acréscimo no handler de `.edit-descricao` para exibir toast e atualizar selects/tabelas dependentes (chamar `renderComprasSelects`, `renderNav`, etc. equivalentes já existentes) após salvar.
- Sem mudanças de dados, banco, políticas ou fluxo de login.
