## Objetivo

Zerar todos os dados do sistema (materiais, movimentos, compras, conferências, vendas, fichas técnicas) para o login `paggio.adm@gmail.com`. No próximo acesso, o sistema abre vazio em qualquer dispositivo.

## O que vou fazer

1. **Apagar o registro `tenant_id = 'paggio'`** na tabela `estoque_state` (é a única linha, e é onde ficam todos os dados compartilhados entre dispositivos).
2. **Inserir um registro novo e vazio** (`data = {}`) para o mesmo tenant, para que o app abra em estado limpo sem tentar "semear" com o localStorage antigo de algum navegador.

## Efeito prático

- No próximo login em qualquer dispositivo (celular, computador, anônimo), o sistema aparece **completamente zerado**.
- O `localStorage` antigo de cada navegador **será sobrescrito** pelo estado vazio da nuvem assim que a tela abrir (o pull inicial já faz isso).
- Não é preciso mexer em código — a limpeza é só de dados.

## Aviso importante

Essa ação é **irreversível**: os materiais, movimentos, vendas e conferências atuais serão perdidos. Se quiser guardar um backup antes, me avise que eu exporto os dados atuais como CSV/JSON antes de zerar.
