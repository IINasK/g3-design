import {criarMotorDasOndas} from './nucleo-ondas';
import type {CamadaDaOnda, DesenhoDasOndas} from './tipos-fundo';

/** Owns one canvas and releases every observer, frame and buffer on disposal. */
export function montarOndas(canvas: HTMLCanvasElement, podeMover: () => boolean) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return {atualizar() {}, cores() {}, destruir() {}};
  const cursor = {alvoX: 0, alvoY: 0, x: 0, y: 0, quadro: 0, antes: 0, volta: null};
  const campo = {alvoX: 0, alvoY: 0, x: 0, y: 0, ativo: false, velocidade: 0, carga: 0, efeito: 0, ultimo: 0};
  const motor = criarMotorDasOndas({cursor, campo, lerRaiz: (_nome, padrao) => padrao});
  // The established three-layer surface, rotated to suit this compact frame.
  const camadas: CamadaDaOnda[] = [
    {eixo: 'x', base: 470, curvatura: -260, pivo: .15, amplitude: 38, amplitude2: 9, torcao: 1.3, periodo: 820, fase: .5, lado: 1, angulo: -3, duracao: 120, sentido: -1, opacidade: 1, paralaxe: 0, giro: 0, cor: [[0, 0], [0, 600], []]},
    {eixo: 'x', base: 505, curvatura: -280, pivo: .22, amplitude: 30, amplitude2: 7, torcao: 2.4, periodo: 900, fase: .25, lado: 1, angulo: 2, duracao: 150, sentido: 1, opacidade: .7, paralaxe: 0, giro: 0, cor: [[0, 0], [0, 600], []]},
    {eixo: 'x', base: 530, curvatura: -300, pivo: .2, amplitude: 40, amplitude2: 9, torcao: 1.3, periodo: 820, fase: 0, lado: 1, angulo: 0, duracao: 100, sentido: 1, opacidade: 1, paralaxe: 0, giro: 0, cor: [[0, 0], [0, 600], []]},
  ];
  const desenho: DesenhoDasOndas = {
    canvas, ctx, caixa: {largura: 1000, altura: 600, alinhar: 'direita'},
    largura: 0, altura: 0, dpr: 1, camadas, presenca: () => 1,
  };
  const controle = new AbortController();
  let quadro = 0, ultimo = 0, tempoPintado = 0, visivel = false, encerrado = false;
  const inicio = performance.now();

  function pintar(agora: number) {
    if (encerrado) return;
    if (podeMover()) tempoPintado = (agora - inicio) / 1000;
    motor.pintar(desenho, tempoPintado);
  }
  function passar(agora: number) {
    quadro = 0;
    if (!visivel || document.hidden || !podeMover() || encerrado) return;
    if (agora - ultimo >= 1000 / 30) { ultimo = agora; pintar(agora); }
    quadro = requestAnimationFrame(passar);
  }
  function atualizar() {
    cancelAnimationFrame(quadro); quadro = 0;
    if (encerrado) return;
    pintar(performance.now());
    if (visivel && !document.hidden && podeMover()) quadro = requestAnimationFrame(passar);
  }
  function cores() {
    if (encerrado) return;
    const estilo = getComputedStyle(document.documentElement);
    const acento = estilo.getPropertyValue('--accent').trim();
    const primaria = estilo.getPropertyValue('--primary').trim();
    camadas[0].cor[2] = [acento, acento];
    camadas[1].cor[2] = [primaria, primaria];
    camadas[2].cor[2] = [primaria, primaria];
    motor.prepararCamadas(desenho);
    atualizar();
  }
  const tamanho = new ResizeObserver(([entry]) => {
    if (encerrado) return;
    const {width, height} = entry.contentRect;
    desenho.largura = width; desenho.altura = height;
    desenho.dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * desenho.dpr);
    canvas.height = Math.round(height * desenho.dpr);
    desenho.caixaNaTela = canvas.getBoundingClientRect();
    cores();
  });
  const intersecao = new IntersectionObserver(([entry]) => { visivel = entry.isIntersecting; atualizar(); });
  tamanho.observe(canvas); intersecao.observe(canvas);
  document.addEventListener('visibilitychange', atualizar, {signal: controle.signal});
  return {atualizar, cores, destruir() {
    if (encerrado) return;
    encerrado = true;
    cancelAnimationFrame(quadro); quadro = 0;
    controle.abort(); tamanho.disconnect(); intersecao.disconnect();
    motor.dispose(); canvas.width = canvas.height = 0;
  }};
}
