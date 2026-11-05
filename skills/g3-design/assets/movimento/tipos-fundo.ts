/** Contratos do desenho aprovado, não um novo motor de animação. */
export type Ponto = number[]
export type Gradiente = [Ponto, Ponto, string[]]
export type CursorDoFundo = {
  alvoX: number; alvoY: number; x: number; y: number; quadro: number; antes: number
  volta: { inicio: number; x: number; y: number } | null
}
export type CampoDoFundo = {
  alvoX: number; alvoY: number; x: number; y: number; ativo: boolean
  velocidade: number; carga: number; efeito: number; ultimo: number
}
export type ToqueDaOnda = { x: number; y: number; raio: number; empurrao: number } | null
export type CaixaDaArte = {
  largura: number; altura: number; alinhar: string; ajuste?: string
  alinharY?: string; focoY?: number; alturaDaEntrada?: number
}
export type CamadaDaOnda = {
  eixo: string; base: number; curvatura: number; pivo?: number
  amplitude: number; amplitude2: number; torcao: number; periodo: number
  fase: number; lado: number; angulo: number; duracao: number; sentido: number
  opacidade: number; paralaxe: number; giro: number; cor: Gradiente
  a1?: number; a2?: number; tinta?: CanvasGradient; giroY?: number
  campo?: number; fluxoS?: number[]; alcance?: number; domino?: number
  superficie?: boolean; proceduralProfunda?: boolean; profundaAprovada?: boolean
  cobertaPor?: CamadaDaOnda; profundidadeDoDegrade?: number
  corBase?: string[]; viva?: { cores: string[]; opacidade: number }
  bordaDaSuperficie?: boolean; fileteCompacto?: boolean; filete?: { cor: string; espessuraPx: number; pincelada?: { espessuraMaximaPx: number; luz: string; sombra: string; nucleo: number; sensibilidadeDaLuz: number } }
}
export type DesenhoDasOndas = {
  canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; caixa: CaixaDaArte
  largura: number; altura: number; dpr: number; camadas: CamadaDaOnda[]
  presenca: () => number; recortar?: boolean; caixaNaTela?: DOMRect
  corDeFundo?: string; escalaFixa?: number; origemX?: number; origemY?: number; focoNaTela?: number
  entradaDaCamada?: (camada: CamadaDaOnda) => number; decorrido?: number | null
  mundoVertical?: boolean; semSuperficie?: boolean; janelaProcedural?: boolean
  campo?: number; transicaoParaFundo?: string | null; dprMax?: number; naTela?: boolean
}
export type EsferaDoFundo = {
  g: SVGGElement; c: SVGCircleElement; cx: number; cy: number; r: number
  duracao: number; raio: number; atraso: number; paralaxe: number
  x: number; y: number; vx: number; vy: number; oculta?: boolean
}
export type ContextoDoFundo = {
  cursor: CursorDoFundo; campo: CampoDoFundo
  lerRaiz: (nome: string, padrao: number) => number
}
