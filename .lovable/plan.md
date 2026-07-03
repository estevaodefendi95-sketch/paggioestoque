## Problema

Ao editar o nome de um material (ou qualquer campo), a tela às vezes "pisca" / rola pro topo / perde o foco do campo — parece que a página inteira recarrega. Isso acontece porque o iframe do app é recarregado (`iframeRef.current.src = "/app.html?t=..."`) quando o Realtime devolve a mudança que a própria aba acabou de enviar.

Causa: existe uma corrida entre o loop de sync (que envia o novo estado pro banco) e o Realtime (que recebe a notificação de volta). Enquanto o `upsert` ainda não terminou, `lastSyncedRef` ainda guarda o estado antigo, então o payload do Realtime parece "novo" e dispara o reload do iframe — mesmo sendo o eco da própria alteração local.

## O que muda

Ajustar `src/routes/index.tsx` para que o eco do Realtime da própria aba nunca recarregue o iframe:

1. No loop de push (poll de 2,5s), gravar `lastSyncedRef.current = current` **antes** de chamar o `upsert`, não depois. Assim, quando o Realtime devolver o mesmo JSON, a comparação `serialized === lastSyncedRef.current` já bate e o handler sai cedo, sem tocar no iframe.
2. Em caso de erro no `upsert`, reverter `lastSyncedRef` pro valor anterior (pra não perder a próxima tentativa de sync).
3. Mesmo cuidado no seed inicial (primeiro upsert quando a linha ainda não existia).

Nenhuma mudança em `public/app.html`, no fluxo de edição, nas políticas do banco ou no login. Só corrige o motivo do reload.

## Resultado esperado

- Editar nome / mínimo / valor de compra / unidade de um material salva na nuvem normalmente, mas a tela não recarrega mais.
- O usuário pode continuar editando o próximo campo sem perder posição de rolagem nem foco.
- Alterações feitas por **outra** aba/dispositivo continuam chegando via Realtime e atualizando a tela como hoje.
