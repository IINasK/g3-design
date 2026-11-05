import {MOVIMENTO, POUSO} from './presets';

type Estado = {posicao: number; escala: number};
function forma({posicao, escala}: Estado, quantidade: number) {
  return {
    transform: `translateX(${posicao * 100}%) scaleX(${escala})`,
    clipPath: `inset(0 ${(quantidade - 1 - posicao - (escala - 1) / 2) * 100 / quantidade}% 0 ${(posicao - (escala - 1) / 2) * 100 / quantidade}% round ${999 * escala}px / 999px)`,
  };
}

/** Existing controls own aria-pressed; this adapter owns only finite animation. */
export function montarSeletorDeslizante(casa: HTMLElement, podeMover: () => boolean) {
  const botoes = [...casa.querySelectorAll<HTMLButtonElement>('button[aria-pressed]')];
  const quantidade = botoes.length;
  if (quantidade !== 2 && quantidade !== 3) throw new Error('A sliding selector needs two or three controls.');
  const conteudo = document.createElement('div'); conteudo.className = 'seletor-conteudo';
  const capsula = document.createElement('span'); capsula.className = 'seletor-capsula'; capsula.dataset.seletorCapsula = '';
  const recorte = document.createElement('span'); recorte.className = 'seletor-recorte';
  const tinta = document.createElement('span'); tinta.className = 'seletor-tinta';
  for (const botao of botoes) { const texto = document.createElement('span'); texto.textContent = botao.textContent; tinta.append(texto); }
  capsula.setAttribute('aria-hidden', 'true'); recorte.setAttribute('aria-hidden', 'true');
  recorte.append(tinta); conteudo.append(...botoes, capsula, recorte); casa.replaceChildren(conteudo);
  casa.classList.add('seletor-deslizante'); casa.dataset.seletorOpcoes = String(quantidade);
  let posicao = -1, animacoes: Animation[] = [];
  function cancelar() { animacoes.forEach(a => a.cancel()); animacoes = []; }
  function atualizar() {
    const indice = botoes.findIndex(botao => botao.getAttribute('aria-pressed') === 'true');
    if (indice < 0 || indice === posicao) return;
    const matriz = posicao < 0 ? null : new DOMMatrixReadOnly(getComputedStyle(capsula).transform);
    const largura = matriz ? capsula.getBoundingClientRect().width / matriz.m11 : 1;
    const inicio = {posicao: matriz ? matriz.m41 / largura : indice, escala: matriz?.m11 ?? 1};
    cancelar();
    const inicial = posicao < 0; posicao = indice;
    const destino = forma({posicao: indice, escala: 1}, quantidade);
    capsula.style.transform = destino.transform; recorte.style.clipPath = destino.clipPath;
    if (inicial || !podeMover()) return;
    const estados = POUSO.map((ponto, i) => {
      const centro = inicio.posicao + (indice - inicio.posicao) * ponto.progresso;
      const escala = i === 0 ? inicio.escala : Math.min(ponto.escala, 1 + 2 * Math.min(centro, quantidade - 1 - centro));
      return {...ponto, ...forma({posicao: centro, escala}, quantidade)};
    });
    const opcoes = {duration: MOVIMENTO.seletor, easing: 'linear'};
    animacoes = [capsula.animate(estados.map(({offset, easing, transform}) => ({offset, easing, transform})), opcoes),
      recorte.animate(estados.map(({offset, easing, clipPath}) => ({offset, easing, clipPath})), opcoes)];
    const inicioDoGesto = document.timeline.currentTime;
    animacoes.forEach(a => { a.startTime = inicioDoGesto; });
  }
  const observador = new MutationObserver(atualizar);
  botoes.forEach(botao => observador.observe(botao, {attributes: true, attributeFilter: ['aria-pressed']}));
  atualizar();
  return {atualizar, atualizarEfeitos() { if (!podeMover()) cancelar(); }, destruir() {
    observador.disconnect(); cancelar(); casa.replaceChildren(...botoes); casa.classList.remove('seletor-deslizante');
  }};
}
