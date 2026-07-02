## Diagnóstico

A nuvem já está zerada (`data = {}`). O problema é a **lógica de sincronização** em `src/routes/index.tsx`:

- Quando a nuvem está vazia, o app **envia a localStorage do navegador atual pra nuvem** ("seed"). Foi isso que fez os 26 itens antigos voltarem depois da minha limpeza — o navegador ainda tinha o cadastro salvo localmente e re-subiu.
- Além disso, quando o pull inicial baixa dados da nuvem e reescreve a localStorage, o iframe (`/app.html`) já foi carregado e continua mostrando o que estava em memória. Só recarrega ao trocar de aba.
- Efeito prático: cada navegador vira dono da própria versão até alguém sobrescrever, e mudanças "não aparecem" entre logins.

Sobre o login: o sistema **não usa Google OAuth** — é só e-mail e senha (`paggio.adm@gmail.com` / `Paggio1404!`). Qual conta Google do navegador estava logada não influencia. O que muda entre navegadores é só a localStorage local, e é isso que estamos corrigindo.

## O que vou fazer

**1. Reescrever a lógica de sincronização (`src/routes/index.tsx`)**

- Remover o "seed a partir da localStorage". A nuvem passa a ser **sempre** a fonte da verdade.
- No pull inicial: sobrescrever a localStorage com o que a nuvem tem (inclusive `{}`) e **recarregar o iframe** logo em seguida, pra tela refletir o estado real.
- No loop de push: só sobe pra nuvem depois que o pull inicial terminou (evita a corrida atual em que o iframe empurra dados antigos antes do pull chegar).
- Pull no `focus` continua igual, mas também recarrega o iframe quando detecta mudança.

**2. Adicionar botão "Limpar tudo" no rodapé (ao lado de "Sair")**

- Pede confirmação, apaga a localStorage local, zera o registro na nuvem (`data = {}`) e recarrega o iframe.
- Útil pra qualquer manutenção futura sem precisar me chamar.

**3. Zerar de novo o registro atual na nuvem** (defensivo — a lógica antiga pode ter re-subido dados enquanto a página estava aberta).

## Efeito

- Depois dessa mudança, ao recarregar em qualquer dispositivo, o sistema abre **vazio de verdade**.
- Qualquer cadastro ou movimentação feita em um dispositivo aparece nos outros em ~2,5 s (ou ao voltar pra aba).
- Se algum dia quiser zerar tudo de novo, é só clicar em "Limpar tudo".
