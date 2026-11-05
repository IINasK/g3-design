# Geometria de campos, contêineres e menus

## Contrato da peça

Identifique superfície, contorno, conteúdo, recorte, scroller e foco, com um dono
para cada responsabilidade. Campos da mesma variante compartilham altura,
fonte, recuos e borda. Formulário e valor editável numa folha podem ter variantes
distintas. A referência aprovada define essa escolha.

Contorno fechado usa tokens de espessura e raio. Edição por sublinhado aplica o
filete na largura do campo. A área clicável pode ser maior que a tinta. Pontilhado
indica a área de upload quando previsto, não a borda comum de caixas e inputs.

## Uma geometria para superfície e borda

- Na web, considere padding e borda com box-sizing border-box. Em widget nativo,
  confira métricas lógicas, escala de DPI e desenho de foco.
- Prefira borda da própria caixa. Camada adicional atende necessidade real, como
  pintura de seleção. Faça raio, inset e área de fundo coincidirem.
- Camada que cresce além da caixa ajusta seu raio pelo mesmo deslocamento.
  Herdar raio sozinho não resolve camadas de tamanhos diferentes.
- Shorthand background pode redefinir origin e clip. Declare o comportamento
  do gradiente junto do fundo quando houver borda transparente.
- Outline e sombra de foco precisam de espaço no ancestral. Overflow hidden
  no formulário não serve para esconder um erro de largura.
- Separe recorte do conteúdo rolável e superfície arredondada quando foco ou
  popup precisar ultrapassá-lo. Portais seguem a biblioteca do destino.

## Ações com texto e ícone

- Ações vizinhas da mesma família reutilizam o componente e seus tokens de altura,
  raio, padding e tipografia. Uma ação secundária pode ter outra ênfase, sem virar
  um link sem recuos. Preserve a semântica: link navega; botão executa uma ação.
- Reserve espaço real nos dois lados. O recuo do ícone inclui seu deslocamento
  máximo no hover. Texto e ícone permanecem alinhados também durante o movimento.
- O espaço entre ações pertence ao layout, separado do padding interno. Quando
  rótulos traduzidos não couberem, ajuste o fluxo antes de reduzir a fonte.
- Compare a peça com um consumidor correto da mesma variante. Não imponha altura
  ou formato de botão a links de texto que não pertencem a esse grupo de ações.

## Conteúdo, ícones e largura

- Reserve colunas reais para texto, ícone e ação. Na web, minmax(0, 1fr) e
  min-width zero deixam o texto flexível encolher sem deslocar o ícone.
- Reserve espaço no padding ou na grade para seta, lápis, verificação e scrollbar.
  Texto longo não passa por baixo dessas peças.
- Rótulos alinham com entradas. Erro, ajuda ou vizinho alto não estica input de
  linha única. Mensagem e conteúdo podem crescer para baixo.
- Máscaras e interpretação de dinheiro, quantidade e porcentagem pertencem ao
  domínio do destino. Aparência não autoriza alterar números ou cadeados.
- Confira valor carregado, zero, vazio, conteúdo longo e colagem. Meça conteúdo
  e área visível, inclusive com foco. Elipse deve ter uso explícito.

## Rolagem e popup

Estilize a barra nativa quando ela atender ao formato. Se precisar de componente
próprio, reutilize o existente e preserve teclado, roda, toque, arrasto, semântica
e contraste. Cobrir a barra com faixa ou imagem não corrige seu recorte.

Menus ancorados respeitam gatilho e área visível. Menus operacionais móveis
preenchem a tela, com padding interno e safe areas. O corpo é quem rola. Ações
fixas reservam espaço e não cobrem os últimos campos. Confira teclado móvel,
mudança de orientação e popup filho.

## Reproduzir o defeito

Use abrir, fechar, hover, foco, seleção, scroll e resize reais. Compare os estados
correto e quebrado, com coordenadas e estilos dos ancestrais. Teste uma hipótese
por vez. Observe border-radius, border-width, padding, overflow, transform,
filtros e stacking context. Uma captura assentada não comprova a transição.

Referências sobre [box-sizing](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/box-sizing)
e [border-radius](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/border-radius).
