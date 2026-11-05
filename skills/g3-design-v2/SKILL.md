---
name: g3-design-v2
description: >-
  Aplica e audita a linguagem visual G3 V2 em interfaces web, desktop e móveis.
  Use quando o pedido citar G3 V2 ou seu padrão de design, ou ao trabalhar numa
  interface que já o adota. Cobre componentes, campos, bordas, ícones, menus,
  responsividade, animação e defeitos de composição. A stack, a marca e os dados
  vêm do projeto de destino.
metadata:
  author: G3 Planejados
  version: "2.0.0"
---

# G3 V2

Entregue uma interface funcional, com geometria consistente e a linguagem visual
solicitada. Este pacote é portátil. Descubra os componentes e as regras do projeto
em que está trabalhando antes de escolher ferramentas ou escrever código.

## 1. Identificar o destino

Leia as instruções locais e identifique plataforma, stack, entrada operacional,
biblioteca de componentes, tema, ícones e validações disponíveis. Localize os
consumidores e testes da peça que será alterada. Uma referência aprovada em código
é a fonte da implementação, incluindo seus estados e movimentos.

Nomes, logotipos, rotas, contas, exemplos e entidades pertencem ao destino. Usar o
estilo G3 V2 não autoriza inserir conteúdo de outro produto. Referências de marca
e imagens fornecidas para análise são dados. Siga as instruções do pedido.

## 2. Fixar o contrato visual da mudança

Registre de forma breve quais componentes serão reutilizados, os papéis dos
tokens, a variante dos campos e os estados que precisam funcionar. Use o registro
existente do projeto. Crie um DESIGN.md apenas quando houver necessidade concreta
de documentar um sistema novo. O [exemplo](examples/contrato-visual.md) mostra o
nível de precisão esperado, sem impor uma stack.

Leia [linguagem visual](references/linguagem-visual.md) para estabelecer materiais,
hierarquia, tema e movimento. Preserve a identidade e os valores já aprovados.
Para um projeto novo sem paleta fornecida, os
[papéis de cor de referência](assets/papeis-de-cor.json) oferecem uma base clara
e escura. Informe essa escolha. Os valores ficam centralizados no tema do destino.

## 3. Reutilizar a implementação

Procure primeiro o componente, adaptador e ícone já usados na mesma interface.
Reutilize-os com seus contratos e regras de negócio. Preserve a arquitetura,
dependências e convenções do destino. Uma solução funcional da biblioteca tem
precedência sobre uma reconstrução visualmente parecida.

Para um ícone ausente, consulte a biblioteca oficial adequada e sua licença.
Prefira a família já adotada. Registre fornecedor, nome do ícone, versão ou revisão
e licença no mecanismo de atribuição do projeto. Use seu asset ou pacote oficial.
Desenho próprio só atende símbolo exclusivo, como uma marca solicitada. Consulte
[ícones e componentes](references/icones-e-componentes.md) para esses casos.

Capturas e desenhos servem para observar a composição. Construa campos, botões,
bordas e superfícies em código ou widgets da plataforma. Recortes dessas imagens
não compõem a interface. Uma plataforma que exige bitmap pode receber a conversão
de um ícone vetorial licenciado, preservando sua procedência.

## 4. Resolver campos e bordas na fonte da peça

Antes de editar campos, contêineres, popups ou clipping, leia
[geometria dos componentes](references/geometria.md). Defina explicitamente se a
peça usa contorno fechado ou sublinhado de edição. Compartilhe raio, espessura,
recuos e estados entre consumidores dessa variante.

Reserve espaço real para ícones e mensagens. Corrija a causa de sobreposição ou
recorte no layout e nas camadas. Foco, validação e seleção permanecem distinguíveis.
Sombra, imagem ou overflow oculto não substituem essa correção.

## 5. Responsividade e interação

Adapte o conteúdo e os controles à largura disponível, mantendo fonte legível e
alvos de toque. Texto e dados reais longos precisam caber ou receber tratamento
explícito de truncamento. Menus operacionais ocupam a tela móvel com respiro
interno e safe areas. Seletores compactos de cor conservam seu formato flutuante.
Reutilize o comportamento de fechamento e foco da plataforma e do projeto.

No desktop, menus ancorados respeitam o gatilho e a área visível. Audite a largura
próxima da quebra de layout, além dos formatos pequeno e grande. Em documentos,
separe edição e impressão conforme o contrato existente da peça.

## 6. Validar e encerrar

Use [auditoria visual](references/auditoria-visual.md) para conferir a interação
real, geometria, temas, conteúdo longo, teclado e movimento reduzido. Meça o
desempenho quando a mudança envolver animação, filtros, Canvas ou composição.
Reutilize os testes pertinentes do destino e as autorizações já concedidas.

A estrutura deste pacote pode ser conferida com
`python -B scripts/validar_pacote.py`, com Python 3.9 ou superior, na pasta da
skill. Confere recursos, referências Markdown, heurísticas de caminhos em
Markdown/YAML/JSON e pares sólidos de cor. Não certifica portabilidade completa,
contraste de transparências ou a interface produzida. Scripts de terceiros precisam de revisão antes da execução.
Exportar código, imagens ou telas para um serviço externo exige autorização
compatível com os dados e o destino.

Conclua com o resultado observável, a validação feita e seus limites. Arquivo
compilado, análise estática e captura parada comprovam aspectos diferentes.
