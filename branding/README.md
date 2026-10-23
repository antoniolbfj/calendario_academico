# Identidade do Folhinha

Assinaturas copiadas do kit da marca: item 4 (coloridas), item 5 (negativas) e item 6 (PNG e favicon). Os SVGs mantêm a geometria e as letras em contornos do kit, sem carregar fontes externas. O nome usa Nunito ExtraBold; o slogan oficial é “Seu ano toma forma.”.

`branding.js` concentra os textos, as cores e os componentes da marca. `branding-assets.html` reúne as assinaturas em um único conjunto de símbolos SVG por documento e os estilos exclusivos da marca. Os arquivos deste diretório ficam fora do envio ao Apps Script; os componentes necessários às telas estão incorporados nos dois arquivos compartilhados.

A Mesa usa a assinatura horizontal em telas maiores e o símbolo em telas menores. A marca tem versões colorida e negativa para as aparências clara e escura. O título do calendário continua independente e editável. As preferências pessoais já salvas mantêm suas chaves e seus valores.

A planilha preparada passa a receber a assinatura oficial negativa no espaço do nome do produto. Para aplicar apenas essa identificação a uma planilha instaladora já preparada, execute `atualizarIdentidadeFolhinha` no editor do Apps Script vinculado àquela planilha. Essa função preserva a identificação institucional, os botões manuais, as tabelas, os intervalos nomeados e o estado da instalação. Não é necessário preparar novamente nem reinstalar.

O HTML inclui uma referência ao favicon PNG deste repositório público. A abertura do sistema não utiliza `HtmlOutput.setFaviconUrl`, para evitar que a validação do ícone pelo Google interrompa o acesso. A exibição do ícone depende do tratamento do HTML pelo navegador e pelo contêiner do Apps Script. As assinaturas das telas e da planilha não dependem do acesso ao Google Drive. Calendários gerados, temas institucionais, impressão e PDF não recebem a marca do produto nesta atualização.
