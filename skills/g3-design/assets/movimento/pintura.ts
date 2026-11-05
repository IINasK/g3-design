/** Pintura circular aprovada; listeners pertencem ao consumidor, nunca ao modulo. */
export function criarPintura(raiz: HTMLElement) {
  function pontoDo(el: HTMLElement, e?: MouseEvent) {
    const doTeclado = !e || e.clientX === undefined || (e.type === 'click' && e.detail === 0)
    if (!doTeclado) return { x: e.clientX, y: e.clientY }
    const r = el.getBoundingClientRect()
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
  }

  // A camada passa 1px por dentro da borda de 1px (inset: -1px): o canto
  // dela é o canto de fora da peça, o mesmo do getBoundingClientRect.
  // No painel, o ponto é contado do centro (calc(50% + dx)): ele abre para
  // os dois lados com o conteúdo no meio, e o ponto acompanha o conteúdo.
  // larguraFinal: a largura que a peça vai ter (o painel que está abrindo),
  // para o raio da pintura cobrir a peça já aberta.
  function noCanto(el: HTMLElement, ponto: { x: number; y: number }, larguraFinal?: number) {
    const r = el.getBoundingClientRect()
    const y = ponto.y - r.top
    if (el.classList.contains('painel')) {
      const dx = ponto.x - (r.left + r.width / 2)
      const w = larguraFinal || r.width
      return { x: w / 2 + dx, y, w, h: r.height, xCss: 'calc(50% + ' + dx.toFixed(1) + 'px)' }
    }
    const x = ponto.x - r.left
    return { x, y, w: r.width, h: r.height, xCss: x.toFixed(1) + 'px' }
  }

  // Do ponto até o canto mais distante da peça.
  function ateOCanto(x: number, y: number, w: number, h: number) {
    return Math.max(Math.hypot(x, y), Math.hypot(w - x, y), Math.hypot(x, h - y), Math.hypot(w - x, h - y))
  }

  // O ponto e o raio entram sem transição: com a peça ainda apagada
  // (raio 0), o círculo só muda de lugar. Depois quem chama marca a peça,
  // e aí só o raio anima.
  function marcarPonto(el: HTMLElement, e?: MouseEvent, larguraFinal?: number) {
    const { x, y, w, h, xCss } = noCanto(el, pontoDo(el, e), larguraFinal)
    el.classList.add('pinta-instante')
    el.style.setProperty('--pinta-x', xCss)
    el.style.setProperty('--pinta-y', y.toFixed(1) + 'px')
    el.style.setProperty('--pinta-alvo', (ateOCanto(x, y, w, h) + 2).toFixed(1) + 'px')
    firmar(el)
    el.classList.remove('pinta-instante')
  }

  /* Acender: chamar antes de marcar a peça. Se ela ainda estava se
     apagando, o furo só se fecha de volta e a cor retorna, sem piscar em
     branco; se estava apagada, a cor nasce no ponto do clique. */
  function acender(el: HTMLElement, e?: MouseEvent, larguraFinal?: number) {
    if (el.classList.contains('apagando')) {
      el.classList.remove('apagando')
      return
    }
    marcarPonto(el, e, larguraFinal)
  }

  /* Apagar: chamar junto com a desmarcação, com o ponto (pontoDo) do
     clique que marcou a outra peça. O furo nasce nele, mesmo fora desta
     peça: começa encostado na borda mais próxima do ponto e cresce até o
     canto mais distante. O fim da transição (abaixo) zera tudo. Sem
     @property o navegador não anima a variável — aí a peça apaga de uma
     vez. */
  const temRaio = window.CSS && 'registerProperty' in CSS
  function apagar(el: HTMLElement, ponto: { x: number; y: number }) {
    if (!temRaio) return
    const { x, y, w, h, xCss } = noCanto(el, ponto)
    const perto = Math.hypot(Math.max(0, -x, x - w), Math.max(0, -y, y - h))
    const longe = ateOCanto(x, y, w, h)
    el.style.setProperty('--apaga-x', xCss)
    el.style.setProperty('--apaga-y', y.toFixed(1) + 'px')
    // Primeiro, sem transição, o furo vai até a borda mais próxima...
    el.style.setProperty('--apaga-alvo', perto.toFixed(1) + 'px')
    el.classList.add('pinta-instante', 'apagando')
    firmar(el)
    el.classList.remove('pinta-instante')
    // ...depois, com transição, até o canto mais distante.
    el.style.setProperty('--apaga-alvo', (longe + 2).toFixed(1) + 'px')
  }

  // Aplica agora o estilo da camada (sem transição, com .pinta-instante).
  function firmar(el: HTMLElement) {
    const camada = el.querySelector(':scope > .pinta-camada')
    if (camada) getComputedStyle(camada).getPropertyValue('--apaga-raio')
    else getComputedStyle(el, '::before').getPropertyValue('--apaga-raio')
  }

  function zerarPintura(el: HTMLElement) {
    el.classList.add('pinta-instante')
    el.classList.remove('apagando')
    firmar(el)
    el.classList.remove('pinta-instante')
  }

  // O fim chega da peça (::before) ou da camada do painel, filha dela.
  const finalizar = (e: TransitionEvent) => {
    if (e.propertyName !== '--apaga-raio') return
    const alvo = e.target as HTMLElement
    const el = alvo.classList.contains('pinta-camada') ? alvo.parentElement! : alvo
    if (el.classList.contains('apagando')) zerarPintura(el)
  }
  raiz.addEventListener('transitionend', finalizar)
  return { pontoDo, noCanto, ateOCanto, marcarPonto, acender, apagar, firmar, zerarPintura,
    dispose: () => raiz.removeEventListener('transitionend', finalizar) }

}
export type Pintura = ReturnType<typeof criarPintura>
