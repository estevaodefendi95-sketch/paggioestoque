# Problema

Hoje os dados ficam no `localStorage` do navegador. Isso significa que **cada dispositivo/navegador tem seu próprio estoque**, mesmo entrando com o mesmo `paggio.adm@gmail.com`. O login atual é só uma "porta" local — não puxa nada de um servidor.

Por isso as informações não batem entre celular, computador, navegador anônimo, etc.

# Solução

Ativar o **Lovable Cloud** para guardar o estoque em um banco central. Todo dispositivo que logar com `paggio.adm@gmail.com` vai ler e gravar no mesmo lugar.

## O que vou fazer

1. **Ativar Lovable Cloud** (backend gerenciado — sem contas externas).
2. **Criar usuário `paggio.adm@gmail.com`** com a senha `Paggio1404!` no sistema de autenticação do Cloud (substitui o login "fake" atual).
3. **Criar 1 tabela** `estoque_state` (colunas: `user_id`, `data jsonb`, `updated_at`) com RLS: cada usuário só lê/escreve o próprio registro.
4. **Adaptar `public/app.html`**:
   - Ao abrir: se estiver logado, baixa o `data` do Cloud e injeta no `localStorage` (`paggio-estoque-v1`).
   - Toda vez que o app salvar (já existe o hook do "save-pill"): faz upsert no Cloud (debounce ~1s).
   - Botão "Sincronizar agora" no rodapé pra forçar pull/push.
5. **Migrar os dados atuais**: na primeira vez que você logar no navegador onde os dados "certos" estão, o app detecta que o Cloud está vazio e faz upload do `localStorage` atual — assim os dados de hoje viram a fonte da verdade.
6. **Tela de login**: passa a usar o auth do Cloud (mesma aparência), aceitando o mesmo e-mail e senha.

## Detalhes técnicos

- Tabela:
  ```
  estoque_state(user_id uuid PK ref auth.users, data jsonb, updated_at timestamptz)
  ```
  RLS: `USING (auth.uid() = user_id)` para SELECT/INSERT/UPDATE.
- Estratégia de conflito: **last-write-wins** por `updated_at` (simples, adequado para 1 usuário único em vários dispositivos).
- O `iframe` continua servindo `/app.html`; a ponte cliente↔Cloud fica em `src/routes/index.tsx` (postMessage) ou dentro do próprio `app.html` via CDN do supabase-js. Escolho **injetar o supabase-js no `app.html`** para manter tudo num só lugar.
- Login continua sendo só `paggio.adm@gmail.com` (não abro cadastro público).

## Pergunta de confirmação

Ativar o **Lovable Cloud** agora? (é grátis para começar, sem cadastro externo). Assim que confirmar, executo tudo acima e faço o primeiro upload dos dados do navegador onde está o estoque correto.
