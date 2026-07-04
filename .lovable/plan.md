Plano para corrigir o recarregamento ao mudar valores na aba Materiais:

1. Corrigir o Realtime dentro do `public/app.html`
   - Hoje o próprio `app.html` também escuta alterações em tempo real e chama `location.reload()`.
   - Vou marcar a alteração local como já aplicada antes do `upsert`, para o retorno em tempo real da própria edição não ser tratado como mudança externa.
   - Também vou comparar o JSON recebido com o estado em memória; se for o mesmo conteúdo, não recarrega.

2. Evitar redesenhar a tabela inteira ao alterar “Valor de compra”
   - O campo de valor atualmente salva e chama `renderMateriais()`, recriando a tabela e podendo parecer atualização/reload.
   - Vou salvar o valor sem reconstruir a tela inteira, atualizando apenas os totais necessários e mantendo o usuário na mesma posição.

3. Manter mudanças externas funcionando
   - Alterações feitas por outro dispositivo/aba continuarão chegando.
   - A diferença é que a própria edição local não vai mais recarregar a página nem tirar o usuário da aba/campo.

4. Validar no preview
   - Testar edição do valor de compra em Materiais.
   - Confirmar que salva, mostra feedback e não recarrega/não sai da tela.