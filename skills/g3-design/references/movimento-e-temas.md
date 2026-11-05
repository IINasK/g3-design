# Movimento e temas da G3 Design

Estes comportamentos fazem parte da identidade. Um fundo que se move sozinho,
uma troca instantânea de cor ou um fade genérico não os substituem.

## Implementações portáteis

Reutilize primeiro o componente equivalente do destino. Para uma integração nova,
o pacote inclui o [núcleo das ondas](../assets/movimento/nucleo-ondas.ts),
sua [física](../assets/movimento/fisica-fundo.ts), os [tipos](../assets/movimento/tipos-fundo.ts),
a [pintura circular](../assets/movimento/pintura.ts), o
[seletor deslizante](../assets/movimento/seletor.ts), os
[presets](../assets/movimento/presets.ts) e o [CSS de interação](../assets/movimento/interacoes.css).
O [adaptador de ondas interativas](../assets/movimento/ondas-interativas.ts)
liga ponteiro, toque, cores e lifecycle ao núcleo: `montarOndas(canvas, podeMover)`.
O consumidor define `data-palette` no elemento raiz e chama `cores()` ao trocar
o tema, `atualizar()` ao mudar efeitos/visibilidade e `destruir()` ao desmontar.
Compile com suporte a importação JSON; mantenha as variáveis de tema no destino.
São fontes TypeScript/CSS, sem framework ou serviço de infraestrutura obrigatório.
Compile-as com a ferramenta do destino. Não copie o piloto como outra aplicação.

## Origem e ritmo

- Pintura e expansão circular: 820ms, cubic-bezier(.22,1,.36,1).
- Contração: 820ms, cubic-bezier(.55,.055,.675,.19).
- Resposta de pressão: 200ms. Cápsula: 360ms com aceleração, alongamento e pouso
  definidos nos quatro keyframes compartilhados. Não substituir por um translate
  linear ou por mudança de background entre dois botões.
- A origem visual pertence à ação atual. Clique/toque usa suas coordenadas reais;
  teclado usa o centro do controle acionado. Escape usa o X da tela atual.
  Fechar não reutiliza a origem que abriu a página. O foco pode voltar ao gatilho
  original; isso é uma responsabilidade distinta do ponto de contração.
- O raio alcança o canto mais distante. Não usar um raio arbitrário muito maior,
  que faz a peça parecer preencher no primeiro instante e desperdiça o restante.

## Ondas que respondem

Ligue ponteiro e toque à física existente: aproximação, velocidade, carga,
deformação local, paralaxe e retorno amortecido. Preservar o núcleo sem ligar
essas entradas produz apenas uma animação automática.

A carga sobe em 0,9s, desce em 0,18s e segue a posição em 0,09s; movimento rápido
reduz o empurrão, aproximação parada o fortalece. A paralaxe retorna em 2,4s.
Use coordenadas do mesmo retângulo e escala do Canvas, inclusive após scroll.
Toque não pode bloquear a rolagem ou edição dos campos. Canvas continua decorativo.

Use 30 quadros/s em repouso e 60 enquanto houver interação ou dissipação,
conforme o motor. Suspenda fora de vista, em documento oculto, sob camada opaca
e durante a máscara de expansão. Retome sem salto de fase; descarte frames,
observers, listeners e buffers. Movimento reduzido e efeitos desativados prevalecem.

## Luz e cápsula

No hover por ponteiro fino, a luz cresce do ponto de entrada e preenche a peça
dentro da borda arredondada. Foco por teclado nasce no centro; toque recebe
feedback da pressão. Meça o raio, preserve o ponto e anime clip-path; não faça
o centro deslizar até o clique. Na saída, o furo revela a superfície original.
Reentrada durante a saída reverte o estado sem flash ou resíduo.

A cápsula do seletor é uma peça única. Forma e recorte dos rótulos compartilham
o relógio. Uma reversão amostra a posição e escala atuais antes de cancelar a
animação, preservando continuidade. Controles reais mantêm aria-pressed e foco;
as cópias visuais de texto não entram na acessibilidade nem no Tab.

## Quatro opções de cor

Os [papéis de tema](../assets/papeis-de-cor.json) incluem Corporativo, Lavanda,
Noite e Corporativo Escuro. Claro/escuro são modos; não substituem esse catálogo.
Preserve a paleta do destino quando já aprovada. Na adoção desta identidade,
apresente os quatro temas, com ondas e estados alimentados pela mesma fonte.

Audite o movimento real em cada tema, inclusive inversão rápida, fechar pelo X,
Escape, toque, scroll, resize, descarte e preferências de movimento. Captura
assentada não demonstra origem, física, continuidade ou desempenho em GPU real.
