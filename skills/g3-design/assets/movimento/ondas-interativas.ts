import {criarMotorDasOndas} from './nucleo-ondas';
import {criarFisicaDoFundo} from './fisica-fundo';
import type {CamadaDaOnda, CursorDoFundo, DesenhoDasOndas} from './tipos-fundo';
import {temas} from '../papeis-de-cor.json';

/** One owner for the approved engine, physics, observers, events and buffers. */
export function montarOndas(canvas: HTMLCanvasElement, podeMover: () => boolean) {
  const ctx = canvas.getContext('2d');
  const area = canvas.parentElement;
  if (!ctx || !area) return {atualizar() {}, cores() {}, destruir() {}};
  const cursor: CursorDoFundo = {alvoX: 0, alvoY: 0, x: 0, y: 0, quadro: 0, antes: 0, volta: null};
  const campo = {alvoX: 0, alvoY: 0, x: 0, y: 0, ativo: false, velocidade: 0, carga: 0, efeito: 0, ultimo: 0};
  const contexto = {cursor, campo, lerRaiz: (_nome: string, padrao: number) => padrao};
  const motor = criarMotorDasOndas(contexto);
  const fisica = criarFisicaDoFundo({...contexto, svg: () => null, esferas: () => []});
  // Approved three-layer surface, rotated to fit the compact showcase.
  const camadas: CamadaDaOnda[] = [
    {eixo: 'x', base: 470, curvatura: -260, pivo: .15, amplitude: 38, amplitude2: 9, torcao: 1.3, periodo: 820, fase: .5, lado: 1, angulo: -3, duracao: 120, sentido: -1, opacidade: 1, paralaxe: 6, giro: -.6, cor: [[0, 0], [0, 600], []]},
    {eixo: 'x', base: 505, curvatura: -280, pivo: .22, amplitude: 30, amplitude2: 7, torcao: 2.4, periodo: 900, fase: .25, lado: 1, angulo: 2, duracao: 150, sentido: 1, opacidade: .7, paralaxe: 11, giro: .5, cor: [[0, 0], [0, 600], []]},
    {eixo: 'x', base: 530, curvatura: -300, pivo: .2, amplitude: 40, amplitude2: 9, torcao: 1.3, periodo: 820, fase: 0, lado: 1, angulo: 0, duracao: 100, sentido: 1, opacidade: 1, paralaxe: 16, giro: .8, cor: [[0, 0], [0, 600], []]},
  ];
  const desenho: DesenhoDasOndas = {canvas, ctx, caixa: {largura: 1000, altura: 600, alinhar: 'direita'}, largura: 0, altura: 0, dpr: 1, camadas, presenca: () => 1};
  const controle = new AbortController();
  const opcoes = {signal: controle.signal, passive: true};
  let quadro = 0, ultimo = 0, tempoPintado = 0, visivel = false, encerrado = false;
  function pintar() { if (!encerrado) motor.pintar(desenho, tempoPintado); }
  function passar(agora: number) {
    quadro = 0;
    if (!visivel || document.hidden || !podeMover() || encerrado) return;
    const intervalo = 1000 / (campo.ativo || campo.carga > .005 || cursor.quadro ? 60 : 30);
    if (agora - ultimo >= intervalo - .5) {
      const dt = ultimo ? Math.min(.1, (agora - ultimo) / 1000) : intervalo / 1000;
      ultimo = agora; tempoPintado += dt;
      fisica.atualizarCampo(dt, campo.ativo); pintar();
    }
    quadro = requestAnimationFrame(passar);
  }
  function soltar() { fisica.soltarPonteiro(); if (!visivel || document.hidden || !podeMover()) { fisica.dispose(); return; } if (cursor.x || cursor.y) fisica.voltarAoCentro(); }
  function atualizar() {
    cancelAnimationFrame(quadro); quadro = 0; ultimo = 0;
    if (encerrado) return;
    if (!visivel || document.hidden || !podeMover()) { fisica.dispose(); campo.ativo = false; }
    pintar();
    if (visivel && !document.hidden && podeMover()) quadro = requestAnimationFrame(passar);
  }
  function cores() {
    if (encerrado) return;
    const id = document.documentElement.dataset.palette as keyof typeof temas;
    const paleta = temas[id] || temas.claro;
    camadas.forEach((camada, indice) => {
      const tinta = paleta.ondas[indice];
      camada.cor[2] = tinta.cores; camada.filete = tinta.filete || undefined;
    });
    motor.prepararCamadas(desenho); atualizar();
  }
  function sentir(evento: PointerEvent) {
    if (encerrado || !visivel || document.hidden || !podeMover()) return;
    if (evento.pointerType !== 'mouse' && evento.type === 'pointermove' && !evento.buttons) return;
    const caixa = canvas.getBoundingClientRect(); desenho.caixaNaTela = caixa;
    fisica.mirar((evento.clientX - caixa.left) / caixa.width * 2 - 1, (evento.clientY - caixa.top) / caixa.height * 2 - 1);
    fisica.sentirPonteiro(evento.clientX, evento.clientY, performance.now());
  }
  area.addEventListener('pointermove', sentir, opcoes);
  area.addEventListener('pointerdown', sentir, opcoes);
  area.addEventListener('pointerleave', soltar, opcoes);
  area.addEventListener('pointercancel', soltar, opcoes);
  window.addEventListener('pointerup', event => { if (event.pointerType !== 'mouse') soltar(); }, opcoes);
  window.addEventListener('blur', soltar, opcoes);
  window.addEventListener('scroll', () => { desenho.caixaNaTela = canvas.getBoundingClientRect(); soltar(); }, opcoes);
  const tamanho = new ResizeObserver(([entry]) => {
    if (encerrado) return;
    const {width, height} = entry.contentRect;
    desenho.largura = width; desenho.altura = height; desenho.dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * desenho.dpr); canvas.height = Math.round(height * desenho.dpr);
    desenho.caixaNaTela = canvas.getBoundingClientRect(); cores();
  });
  const intersecao = new IntersectionObserver(([entry]) => { visivel = entry.isIntersecting; atualizar(); });
  tamanho.observe(canvas); intersecao.observe(canvas);
  document.addEventListener('visibilitychange', atualizar, opcoes);
  return {atualizar, cores, destruir() {
    if (encerrado) return;
    encerrado = true; cancelAnimationFrame(quadro); quadro = 0; fisica.dispose();
    controle.abort(); tamanho.disconnect(); intersecao.disconnect(); motor.dispose(); canvas.width = canvas.height = 0;
  }};
}
