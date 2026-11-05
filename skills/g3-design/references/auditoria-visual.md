# Auditoria visual e de interação

Escolha cobertura pela mudança. Reutilize runner, entrada operacional e contas
fictícias autorizadas do destino. Preserve a referência e a baseline. Dados
representativos seguem o domínio do projeto, sem importar conteúdo de outro app.

## Comparação renderizada

Abra pelo caminho real. Confira móvel e computador quando houver responsividade,
incluindo a largura antes e depois da quebra de layout. Registre viewport e escala.

Compare borda e raio completos, padding, começo e fim do texto, posição dos
ícones, alinhamento e área de rolagem. Confira as paletas adotadas, incluindo os
quatro temas na adoção integral da identidade, e o vidro sobre fundos diferentes.
Meça área visível, conteúdo, retângulos, overflow e foco.
Distinga recorte intencional de carrossel, elipse declarada e perda de conteúdo.

## Interação e acesso

- Campos em repouso, preenchidos, foco, erro, somente leitura e desabilitados.
- Popup abre e fecha pelo gatilho e pela ação ou gesto previsto. Clique fora
  fecha menus dispensáveis e respeita confirmações. Popup filho e retorno de
  foco preservam o preenchimento.
- Tab e Shift+Tab percorrem ações em ordem lógica, com foco reconhecível.
  Scrollers, superfícies decorativas e Canvas não recebem Tab para medição.
  Seus controles conservam acesso por teclado.
- Alvos móveis de 44px são medidos após a entrada. Confira sobreposição de alvos,
  texto e ações adjacentes. Use outra prova específica para a transição.
- Scroll até o último campo, teclado móvel, resize, orientação, retorno e recarga.
  Salvar e navegar preservam o contrato funcional do projeto.
- Em documento editável, confira edição, leitura e impressão/PDF real. Se houver
  reserva vertical comum, meça nos dois modos.

## Contraprovas orientadas ao defeito

Escolha as linhas afetadas. Não transforme uma correção pequena em varredura de
rotas sem relação. Use o teste existente, veja a falha antes e repita após corrigir.

| Peça | Gesto ou condição | Resultado observável |
| --- | --- | --- |
| Ações adjacentes | Rótulo longo/traduzido, largura próxima da quebra e hover | Geometria da família preservada; texto e ícone alinhados, com recuo inclusive no avanço máximo; sem sobreposição |
| Luz e borda | Ponteiro parado junto à borda, saída e reentrada antes do fim | Uma entrada sem oscilar com mouse imóvel; pintura não cobre a borda; máscara e coordenadas transitórias removidas ao assentar |
| Seletor | Troca e reversão antes de concluir | Cápsula e rótulo acompanham a mesma posição, sem salto ou reinício no extremo |
| Fechamento | Abrir num ponto e fechar noutro; depois teclado/Escape | Contração na ação atual; retorno de foco independente da origem visual |
| Ondas | Mover/parar ponteiro, tocar, rolar e ocultar a área | Física recebe coordenadas reais; toque não bloqueia scroll; pausa e retomada sem salto ou ciclo residual |
| Tema | Trocar paleta com controles em repouso, foco e seleção | Superfície, texto, borda, SVG e Canvas usam os mesmos papéis; conteúdo e estados preservados |

Quando o defeito for um resíduo de pintura, confira pixels da borda além das
classes/variáveis. Compare com a geometria original ou uma referência aprovada,
sem trocar baseline para fazer passar. Registre viewport e DPR; use outra escala
quando o defeito depender de antialiasing ou densidade. Não exija igualdade de
pixels entre plataformas/renderizadores diferentes.

## Movimento e desempenho

Capture em movimento quando houver flicker, fresta, corte ou ícone corrompido.
Sequência de quadros pode revelar o que uma imagem perde. Forçar classes só
testa geometria isolada, devendo ser identificado como tal.

Meça em produção quando houver animação ou composição. Registre navegador/runtime,
viewport, DPR, CPU e renderizador. Observe intervalos entre frames, layout,
pintura, composição e recursos após ciclos. Compare o mesmo percurso antes/depois.

Descarte frames, timers, listeners, observadores, buffers e contextos pertencentes
à peça. Conteúdo coberto ou fora da área visível suspende pintura quando o
contrato permitir. Movimento reduzido conserva leitura e operação.

## Evidência e limites

Vincule a prova ao código executado. Aguarde animações reais para medir geometria
final. Distinga navegador, janela nativa, emulação e aparelho físico.

Validação do pacote, lint, tipos e AST comprovam aspectos limitados. Eles não
certificam aparência ou segurança completa. Confira também o que a skill levou
o agente a fazer num projeto representativo. Registre falhas, correções e os
limites que ainda dependem de aparelho, integração ou aprovação visual.
