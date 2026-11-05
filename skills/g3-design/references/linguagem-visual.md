# Linguagem visual

Use a implementação aprovada do destino para obter valores, estados e movimentos.

## Tema e hierarquia

- Organize tokens por função, com fundo, superfície, texto, texto secundário,
  ação, borda, foco, seleção, erro e sucesso. Uma fonte central atende cada tema.
- O tema governa também SVG, Canvas e widgets nativos. Mapeie os mesmos papéis
  para cada renderizador. Cores de screenshot não viram constantes nos componentes.
- A paleta do projeto tem precedência. Os
  [papéis de referência](../assets/papeis-de-cor.json) são uma opção inicial para
  projeto sem paleta, com Corporativo, Lavanda, Noite e Corporativo Escuro.
- Texto normal precisa de contraste mínimo 4,5:1. Texto grande pode usar 3:1.
  Contornos e estados necessários para reconhecer controles precisam de 3:1
  com a cor adjacente. Meça a transparência sobre o fundo real.
- Preserve a família aprovada. Na adoção integral da identidade G3, a interface
  usa Jost, com fallback de sistema. Documentos podem ter família própria.
  A fonte escala com a preferência do usuário. Na web móvel, campos usam ao
  menos 16px. Texto de controles não encolhe para compensar um layout que estoura.

## Formas, respiro e material

- Cantos arredondados, alinhamento claro e profundidade discreta compõem a
  identidade. Raios pertencem a famílias de peças, com recuos coerentes.
- Alinhe conteúdo de leitura ao início. O glifo pode ser centralizado no alvo.
  Posição à direita e alinhamento do texto são decisões diferentes.
- Hierarquia vem de espaço, peso, tinta e superfície. Reutilize intervalos e
  régua do sistema. Correção local não cria outra largura de página.
- Soft UI distingue repouso, hover e pressão por superfície, borda e elevação.
  A seleção permanece legível depois da animação. Hover respeita o tipo de ponteiro.
- Vidro é material opcional da peça aprovada. Use fundo mais opaco quando
  necessário para contraste ou composição. Evite blur aninhado e amplo.
  Adicionar vidro não corrige bordas ou separação entre elementos.
- Quando a referência usa iluminação de 30 graus, brilho e sombra compartilham
  direção e escala. Tokens controlam intensidade e acabamento da seleção.

## Base para adoção nova

Sem componente ou medida aprovada no destino, esta base reproduz a família de
campos cadastrais G3 Design. Centralize-a em tokens do destino. Não a aplique sobre
folhas de documento ou widgets existentes que tenham outro contrato aprovado.

| Papel | Referência inicial |
| --- | --- |
| Campo de linha única | 52px de altura, incluindo padding e borda |
| Texto de entrada e rótulo | 16px; entrada com peso médio |
| Campo com contorno fechado | Raio de 16px, padding horizontal de 16px |
| Borda | 1px em repouso; foco por outline de 2px com offset de 2px |
| Distância entre ações | 12px, mantendo o alvo mínimo de 44px |
| Campos vizinhos | 18px; seções de formulário com 28px |

O foco externo exige 4px livres no ancestral, além da borda. Mudar a espessura
não deve mover o texto. Na plataforma nativa, traduza medidas para unidades
lógicas e respeite escala de fonte/DPI; não force pixels físicos. Altura cresce
quando fonte ou conteúdo exigirem, sem cortar texto para cumprir a tabela.

## Movimento e fundos

- Reutilize tempos, curvas, agendador e política de efeitos do projeto.
  Movimento reduzido apresenta conteúdo assentado e conserva o significado.
- Animações acompanham mudanças reais. Evite movimento infinito em cada controle
  e montagem integral de listas que já oferecem carregamento sob demanda.
- Meça antes de escolher composição por transform/opacity, Canvas ou geometria.
  O critério é o comportamento e custo observados no runtime de destino.
- Ondas orgânicas em contra-fase pertencem aos fundos que as adotam. Reutilize
  motor e preset existentes. Pedir o estilo de um campo não inclui um novo fundo.
- Canvas usa tempo decorrido, buffer compatível com tamanho e DPR, limite de
  cadência e pausa fora da área visível. Conteúdo acessível existe fora do desenho.
- Canvas opaco repinta sua região de fundo antes do quadro seguinte. Canvas
  transparente limpa a região invalidada preservando a transparência. A correção
  remove rastros sem cobrir a composição aprovada.

Fontes de acessibilidade na
[W3C para texto](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
e na [W3C para controles](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).
