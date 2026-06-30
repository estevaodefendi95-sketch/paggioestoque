Tarefa: aplicar a imagem .ico enviada como logo em dois lugares — favicon do navegador e menu lateral do app.

1. Copiar a imagem enviada para `public/logo.ico`.
2. Atualizar `src/routes/__root.tsx`: trocar o `<link rel="icon">` atual (`/icon-192.png`) para apontar para `/logo.ico`.
3. Atualizar `public/app.html`:
   - Inserir uma tag `<img>` dentro da div `.brand` (acima do texto "Controle de Estoque · Paggio Gastro Bar") apontando para `/logo.ico`.
   - Ajustar o CSS da classe `.brand` para exibir a imagem com tamanho apropriado (ex.: 40–48 px de altura, centralizada ou alinhada à esquerda) e manter o texto ao lado ou abaixo conforme o layout.
4. Nota: o `manifest.webmanifest` continua com os ícones PNG atuais (`icon-192.png`, `icon-512.png`) porque o formato .ico não é compatível com as especificações do PWA para ícones de tela inicial. A mudança afeta apenas o favicon da aba e o logo visual dentro do app.

Nenhuma dependência nova necessária. Alteração puramente de assets e marcação.