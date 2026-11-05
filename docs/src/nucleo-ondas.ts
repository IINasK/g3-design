import type { CamadaDaOnda, CaixaDaArte, DesenhoDasOndas, Ponto, ToqueDaOnda, ContextoDoFundo } from './tipos-fundo'

/** Motor compartilhado do desenho aprovado: curvas, tempos e física preservados. */
export function emS(p: number) {
  return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2
}

export function criarMotorDasOndas({ cursor, campo, lerRaiz }: ContextoDoFundo) {
const CURVATURA_PADRAO = -0.35
const PIVO_PADRAO = 0.2
const CAMPO_RAIO_MIN = 240
const CAMPO_RAIO_MAX = 380
const CAMPO_EMPURRAO = 30
const ESCALA_DO_DEGRADE_PROFUNDO = 0.25
const RASCUNHOS_DO_DEGRADE_PROFUNDO = new Map<string, { canvas: HTMLCanvasElement; contexto: CanvasRenderingContext2D; imagem: ImageData }>()
// Uma preparação por camada, sem guardar o histórico de tamanhos ou temas.
// WeakMap não mantém ondas removidas da página vivas até o próximo descarte.
let geometrias = new WeakMap<CamadaDaOnda, { comprimento: number; folga: number; passo: number; curvatura: number; pivo: number; fluxo?: number[]; pontos: Ponto[] }>()
let coresPreparadas = new WeakMap<CamadaDaOnda, { fontes: string[]; canais: number[][] }>()
function curvaturaDa(camada: CamadaDaOnda, comprimento: number) {
    return camada.curvatura ? camada.curvatura : CURVATURA_PADRAO * comprimento
  }

function amansar(camada: CamadaDaOnda, teto: number) {
    const k = (2 * Math.PI) / camada.periodo
    let maisIngreme = 0
    for (let i = 0; i < 360; i++) {
      const a = (i / 360) * 2 * Math.PI
      const derivada = camada.amplitude * k * Math.cos(a) + camada.amplitude2 * 2 * k * Math.cos(2 * a + camada.torcao)
      maisIngreme = Math.max(maisIngreme, Math.abs(derivada))
    }
    const fator = maisIngreme > teto ? teto / maisIngreme : 1
    camada.a1! = camada.amplitude * fator
    camada.a2! = camada.amplitude2 * fator
  }

function prepararCamadas(desenho: Pick<DesenhoDasOndas, 'ctx' | 'camadas'>) {
    const teto = lerRaiz('--onda-inclinacao-max', 0.55)
    desenho.camadas.forEach((camada) => {
      amansar(camada, teto)
      const [[x0, y0], [x1, y1], cores] = camada.cor
      const gradiente = desenho.ctx.createLinearGradient(x0, y0, x1, y1)
      cores.forEach((c, i) => gradiente.addColorStop(i / (cores.length - 1), c))
      camada.tinta! = gradiente
    })
  }

function pintar(desenho: DesenhoDasOndas, segundos: number) {
    const { ctx, dpr, largura, altura, caixa } = desenho
    if (!ctx || !largura || !altura) return
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    // O mar do celular tem a altura da página: redesenhar tudo a cada quadro
    // pesaria. Só a parte à vista, com meia tela de margem em cima e embaixo
    // (a rolagem não revela um pedaço parado).
    let recorte: number[] | null = null
    if (desenho.recortar) {
      const rr = desenho.caixaNaTela || desenho.canvas.getBoundingClientRect()
      const margem = innerHeight * 0.5
      const y0 = Math.max(0, -rr.top - margem)
      const y1 = Math.min(altura, innerHeight - rr.top + margem)
      if (y1 <= y0) return
      recorte = [y0, y1]
      ctx.clearRect(0, Math.floor(y0 * dpr), desenho.canvas.width, Math.ceil((y1 - y0) * dpr))
      ctx.save()
      ctx.beginPath()
      ctx.rect(0, Math.floor(y0 * dpr), desenho.canvas.width, Math.ceil((y1 - y0) * dpr))
      ctx.clip()
    } else {
      ctx.clearRect(0, 0, desenho.canvas.width, desenho.canvas.height)
    }
    if (desenho.corDeFundo) {
      ctx.fillStyle = desenho.corDeFundo
      ctx.fillRect(0, 0, desenho.canvas.width, desenho.canvas.height)
    }

    // O mesmo encaixe do SVG "slice": cobre a caixa inteira, sem distorcer.
    // Com ajuste pela largura (o mar do celular), a caixa acompanha o canvas.
    // Um pedaço do fundo do mar (ver PEDACOS_DO_MAR) traz a escala e a origem
    // do mundo inteiro: ele pinta só a fatia dele, na mesma conta.
    const escala = desenho.escalaFixa ?? (caixa.ajuste === 'largura' ? largura / caixa.largura : Math.max(largura / caixa.largura, altura / caixa.altura))
    // A home interpola suas âncoras no resize; pintura e cursor usam a mesma origem.
    const ox = desenho.origemX ?? (caixa.alinhar === 'direita' ? largura - caixa.largura * escala : (largura - caixa.largura * escala) / 2)
    // Com focoY, aquela altura da caixa (a superfície da água, no painel)
    // fica sempre na mesma fração da altura do canvas, qualquer que seja o
    // formato: no celular o painel é largo e baixo, e sem isso a água
    // ficava abaixo do que se vê.
    const oy = desenho.origemY != null ? desenho.origemY : caixa.ajuste === 'largura' ? 0 : caixa.focoY != null
      ? altura * (desenho.focoNaTela ?? (caixa.focoY / caixa.altura)) - caixa.focoY * escala
      : caixa.alinharY === 'topo' ? 0 : (altura - caixa.altura * escala) / 2
    const presenca = desenho.presenca()
    const intensidade = lerRaiz('--paralaxe-intensidade', 0.6)
    // A entrada (a segunda tela), em dominó: cada camada sobe e aparece na
    // sua vez (ver entradaDaCamada).
    const entrando = desenho.entradaDaCamada && desenho.decorrido != null

    // O cursor em unidades da caixa (a mesma conta do encaixe, ao contrário).
    // A caixa do canvas vem medida no começo do quadro (ver a maré), antes
    // de qualquer escrita; fora da maré, mede aqui.
    const r = desenho.caixaNaTela || desenho.canvas.getBoundingClientRect()
    const mx = (campo.x - r.left - ox) / escala
    const my = (campo.y - r.top - oy) / escala
    const temMundoVertical = Boolean(desenho.mundoVertical)
    const topoDoMundo = temMundoVertical ? -oy / escala : 0
    const fundoDoMundo = temMundoVertical ? (altura - oy) / escala : caixa.altura
    for (const camada of desenho.camadas) {
      if (desenho.semSuperficie && camada.superficie) continue
      // Abaixo do pedaço à vista, a camada não muda nada do que se vê.
      if (recorte && (camada.base - camada.a1! - camada.a2! - 40) * escala + oy > recorte[1]) continue
      if (desenho.janelaProcedural && temMundoVertical) {
        /* O fundo do mar de uma rota longa: só as ondas da janela. A faixa
           profunda sai quando toda a crista e seu fade passaram; as camadas
           opacas da superfície ainda usam a onda que as cobre como limite.
           A folga inclui a espinha, o degradê, o giro e a paralaxe. */
        const alcance = (c: CamadaDaOnda) => c.alcance ?? c.a1! + c.a2! + Math.abs(c.curvatura || 0) * 0.4 + 60
        const alcanceDaCamada = alcance(camada)
        if (camada.base - alcanceDaCamada > fundoDoMundo) continue
        if (camada.proceduralProfunda && camada.base + alcanceDaCamada < topoDoMundo) continue
        if (camada.profundaAprovada && camada.base + alcanceDaCamada < topoDoMundo) continue
        const cobre = camada.cobertaPor
        if (cobre && cobre.base + alcance(cobre) < topoDoMundo) continue
      }
      const px = cursor.x * camada.paralaxe * intensidade
      let py = cursor.y * camada.paralaxe * 0.6 * intensidade
      const giro = ((camada.angulo + cursor.x * camada.giro * intensidade) * Math.PI) / 180
      ctx.setTransform(dpr * escala, 0, 0, dpr * escala, dpr * ox, dpr * oy)
      let alfa = 1
      if (entrando) {
        const t = desenho.entradaDaCamada!(camada)
        alfa = Math.min(1, t * 2.5)
        py += Math.pow(1 - t, 3) * (caixa.alturaDaEntrada ?? caixa.altura) * 0.28
      }
      ctx.translate(px, py)
      // O giro em torno da própria onda (giroY), quando a caixa é alta: em
      // torno do meio de uma caixa de milhares de unidades, 4° arrastariam
      // a onda para o lado e abririam uma borda.
      const giroY = camada.giroY ?? caixa.altura / 2
      ctx.translate(caixa.largura / 2, giroY)
      ctx.rotate(giro)
      ctx.translate(-caixa.largura / 2, -giroY)

      // O campo nas coordenadas desta camada: desfaz a paralaxe e o giro.
      let toque: ToqueDaOnda = null
      const forca = campo.efeito * (camada.campo ?? desenho.campo ?? 1)
      if (forca > 0.005) {
        const dx = mx - px - caixa.largura / 2
        const dy = my - py - caixa.altura / 2
        const cos = Math.cos(giro)
        const sen = Math.sin(giro)
        toque = {
          x: caixa.largura / 2 + dx * cos + dy * sen,
          y: caixa.altura / 2 - dx * sen + dy * cos,
          raio: (CAMPO_RAIO_MIN + (CAMPO_RAIO_MAX - CAMPO_RAIO_MIN) * campo.efeito) / escala,
          empurrao: (CAMPO_EMPURRAO / escala) * forca,
        }
      }

      const alfaDaCamada = Math.min(1, camada.opacidade * presenca * alfa)
      ctx.globalAlpha = alfaDaCamada
      ctx.fillStyle = camada.tinta!
      if (camada.proceduralProfunda) {
        pintarDegradeDaOnda(ctx, camada, caixa, segundos, toque, alfaDaCamada)
      } else {
        const pontosDoFilete = camada.filete ? pontosDaOnda(camada, caixa, segundos, toque) : undefined
        ctx.beginPath()
        tracarOnda(ctx, camada, caixa, segundos, toque, pontosDoFilete)
        ctx.fill()
        if (camada.filete && pontosDoFilete) {
          // Só a crista aberta. Mesmos pontos, tempo, giro, campo e alpha do fill.
          ctx.beginPath()
          tracarCurvaSuave(ctx, pontosDoFilete, 0, camada.eixo === 'x', true)
          ctx.strokeStyle = camada.filete.cor
          ctx.lineWidth = camada.filete.espessuraPx / escala
          ctx.lineCap = 'round'; ctx.lineJoin = 'round'
          ctx.stroke()
          if (camada.filete.pincelada) pintarPincelada(ctx, pontosDoFilete, camada, caixa, escala)
        }
      }
    }
    if (desenho.transicaoParaFundo) {
      /* A superfície conserva as três curvas originais. Só a tinta por baixo
         delas encontra gradualmente o tom-base antes da primeira emenda de
         canvas, evitando um corte horizontal ao começar o fundo profundo. */
      const cor = desenho.transicaoParaFundo
      const canais = cor.match(/[\d.]+/g)?.slice(0, 3) || ['106', '78', '227']
      const inicio = Math.max(0, desenho.canvas.height - desenho.altura * desenho.dpr * 0.14)
      const transicao = ctx.createLinearGradient(0, inicio, 0, desenho.canvas.height)
      transicao.addColorStop(0, `rgba(${canais.join(', ')}, 0)`)
      transicao.addColorStop(1, `rgb(${canais.join(', ')})`)
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.globalAlpha = 1
      ctx.fillStyle = transicao
      ctx.fillRect(0, inicio, desenho.canvas.width, desenho.canvas.height - inicio)
    }
    ctx.globalAlpha = 1
    if (recorte) ctx.restore()
  }

function deslocamentoDoFluxoS(amostras: number[], u: number) {
    const ultimo = amostras.length - 1
    const posicao = Math.max(0, Math.min(1, u)) * ultimo
    const i = Math.min(ultimo - 1, Math.floor(posicao))
    const t = posicao - i
    const p0 = amostras[Math.max(0, i - 1)]
    const p1 = amostras[i]
    const p2 = amostras[i + 1]
    const p3 = amostras[Math.min(ultimo, i + 2)]
    const t2 = t * t
    const t3 = t2 * t
    return 0.5 * (
      2 * p1 +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t3
    )
  }

function geometriaDaOnda(c: CamadaDaOnda, caixa: CaixaDaArte, passoMaximo: number) {
    const deitada = c.eixo === 'x'
    const comprimento = deitada ? caixa.largura : caixa.altura
    // A sobra nas pontas cobre o giro. Numa caixa de 19 páginas, 30% da
    // altura seriam milhares de pontos por onda: o teto é o de uma tela.
    const folga = Math.max(caixa.largura, Math.min(caixa.altura, 1000)) * 0.3
    const inicio = -folga
    const fim = comprimento + folga
    // Pontos a cada 14 unidades no máximo: o campo é pequeno, e a curva
    // precisa de pontos dentro dele para dobrar macio.
    const passo = Math.min(c.periodo / 24, passoMaximo)
    const curvatura = c.curvatura, pivo = c.pivo ?? PIVO_PADRAO
    const anterior = geometrias.get(c)
    if (anterior && comprimento === anterior.comprimento && folga === anterior.folga &&
      passo === anterior.passo && curvatura === anterior.curvatura && pivo === anterior.pivo &&
      (c.fluxoS ? anterior.fluxo?.length === c.fluxoS.length && c.fluxoS.every((v, i) => Object.is(v, anterior.fluxo![i])) : !anterior.fluxo)) return anterior.pontos
    const pontos = []
    for (let t = inicio; t <= fim + passo / 2; t += passo) {
      /* Alguns desenhos antigos ainda usam uma espinha amostrada; os perfis
         profundos aprovados usam a mesma equação contínua da superfície. */
      const u = t / comprimento
      const espinha = c.fluxoS
        ? deslocamentoDoFluxoS(c.fluxoS, u)
        : curvaturaDa(c, comprimento) * (u - (c.pivo ?? PIVO_PADRAO)) ** 2
      pontos.push([t, espinha])
    }
    geometrias.set(c, { comprimento, folga, passo, curvatura, pivo, fluxo: c.fluxoS?.slice(), pontos })
    return pontos
  }

function pontosDaOnda(c: CamadaDaOnda, caixa: CaixaDaArte, segundos: number, toque: ToqueDaOnda, passoMaximo = 14) {
    const deitada = c.eixo === 'x'
    const andou = ((segundos / c.duracao) * c.periodo * c.sentido) % c.periodo
    const geometria = geometriaDaOnda(c, caixa, passoMaximo)
    const pontos = new Array<Ponto>(geometria.length)
    for (let i = 0; i < geometria.length; i++) {
      const t = geometria[i][0], espinha = geometria[i][1]
      const a = 2 * Math.PI * ((t + andou) / c.periodo + c.fase)
      let desvio = c.base + espinha + c.a1! * Math.sin(a) + c.a2! * Math.sin(2 * a + c.torcao)
      if (toque) {
        const dx = (deitada ? t : desvio) - toque.x
        const dy = (deitada ? desvio : t) - toque.y
        const peso = Math.exp(-(dx * dx + dy * dy) / (toque.raio * toque.raio))
        if (peso > 0.002) {
          const lado = deitada ? dy : dx
          const suave = toque.raio * 0.35
          desvio += toque.empurrao * peso * (lado / Math.sqrt(lado * lado + suave * suave))
        }
      }
      pontos[i] = deitada ? [t, desvio] : [desvio, t]
    }
    return pontos
  }

function controlesDaCurva(pontos: Ponto[], i: number): [Ponto, Ponto] {
    const p0 = pontos[i - 1] || pontos[i], p1 = pontos[i], p2 = pontos[i + 1], p3 = pontos[i + 2] || p2
    return [[p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6],
      [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]]
  }

function pintarPincelada(ctx: CanvasRenderingContext2D, pontos: Ponto[], camada: CamadaDaOnda, caixa: CaixaDaArte, escala: number) {
    const filete = camada.filete!, acabamento = filete.pincelada!
    const eixo = camada.eixo === 'x' ? 0 : 1
    const comprimento = eixo === 0 ? caixa.largura : caixa.altura
    // A faixa usa os MESMOS segmentos Catmull–Rom do fill. As duas margens
    // deslocam controles simetricamente: seu centro continua a Bézier original.
    // Não há outra onda, amostragem, relógio, filtro, canvas ou RAF.
    const normais = pontos.map((p, i) => {
      const antes = pontos[i - 1] || p, depois = pontos[i + 1] || p
      const dx = depois[0] - antes[0], dy = depois[1] - antes[1], tamanho = Math.hypot(dx, dy) || 1
      return [-dy / tamanho, dx / tamanho] as Ponto
    })
    const largura = (p: Ponto) => {
      const u = Math.max(0, Math.min(1, p[eixo] / comprimento))
      return (filete.espessuraPx + (acabamento.espessuraMaximaPx - filete.espessuraPx) * Math.sin(Math.PI * u) ** 2) / (2 * escala)
    }
    const deslocar = (p: Ponto, normal: Ponto, lado: number, fator: number): [number, number] => {
      const w = largura(p) * lado * fator
      return [p[0] + normal[0] * w, p[1] + normal[1] * w]
    }
    const segmentos = pontos.slice(0, -1).map((_, i) => controlesDaCurva(pontos, i))
    function faixa(fator: number) {
      ctx.beginPath()
      const inicio = deslocar(pontos[0], normais[0], 1, fator)
      ctx.moveTo(...inicio)
      segmentos.forEach(([c1, c2], i) => ctx.bezierCurveTo(...deslocar(c1, normais[i], 1, fator), ...deslocar(c2, normais[i + 1], 1, fator), ...deslocar(pontos[i + 1], normais[i + 1], 1, fator)))
      ctx.lineTo(...deslocar(pontos.at(-1)!, normais.at(-1)!, -1, fator))
      for (let i = segmentos.length - 1; i >= 0; i--) {
        const [c1, c2] = segmentos[i]
        ctx.bezierCurveTo(...deslocar(c2, normais[i + 1], -1, fator), ...deslocar(c1, normais[i], -1, fator), ...deslocar(pontos[i], normais[i], -1, fator))
      }
      ctx.closePath(); ctx.fill()
    }
    ctx.fillStyle = filete.cor; faixa(1)
    const luz = eixo === 0 ? ctx.createLinearGradient(0, 0, comprimento, 0) : ctx.createLinearGradient(0, 0, 0, comprimento)
    // Uma única direção de luz: a normal da própria crista decide onde
    // iluminar. Seu flanco direito recebe luz; o oposto, cobre sombreado.
    // Não há focos fixos no eixo: resize, maré e campo movem o reflexo junto
    // com os pontos já calculados. A faixa continua sendo a Bézier do fill.
    const sombra = rgbDaCor(acabamento.sombra), cobre = rgbDaCor(filete.cor), clara = rgbDaCor(acabamento.luz)
    const corDaNormal = (normal: Ponto) => {
      const faceDireita = normal[eixo] * (eixo === 0 ? -1 : 1)
      const intensidade = emS(Math.max(0, Math.min(1, .5 + faceDireita * acabamento.sensibilidadeDaLuz)))
      const a = intensidade < .5 ? sombra : cobre, b = intensidade < .5 ? cobre : clara
      const t = intensidade < .5 ? intensidade * 2 : (intensidade - .5) * 2
      return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(', ')})`
    }
    const visiveis = pontos.map((p, i) => ({ u: p[eixo] / comprimento, cor: corDaNormal(normais[i]) }))
    luz.addColorStop(0, visiveis.find(p => p.u >= 0)?.cor ?? filete.cor)
    visiveis.forEach(p => { if (p.u > 0 && p.u < 1) luz.addColorStop(p.u, p.cor) })
    luz.addColorStop(1, visiveis.findLast(p => p.u <= 1)?.cor ?? filete.cor)
    ctx.fillStyle = luz; faixa(acabamento.nucleo)
  }

function tracarCurvaSuave(ctx: CanvasRenderingContext2D, pontos: Ponto[], deslocamento: number, deitada: boolean, mover: boolean) {
    const deslocar = (p: Ponto) => deitada
      ? [p[0], p[1] + deslocamento]
      : [p[0] + deslocamento, p[1]]
    const primeiro = deslocar(pontos[0])
    if (mover) ctx.moveTo(primeiro[0], primeiro[1])
    else ctx.lineTo(primeiro[0], primeiro[1])
    for (let i = 0; i < pontos.length - 1; i++) {
      const p2 = pontos[i + 1]
      const controles = controlesDaCurva(pontos, i)
      const c1 = deslocar(controles[0])
      const c2 = deslocar(controles[1])
      const fim = deslocar(p2)
      ctx.bezierCurveTo(
        c1[0], c1[1],
        c2[0], c2[1],
        fim[0], fim[1],
      )
    }
  }

function tracarOnda(ctx: CanvasRenderingContext2D, c: CamadaDaOnda, caixa: CaixaDaArte, segundos: number, toque: ToqueDaOnda, pontosPreparados?: Ponto[]) {
    const deitada = c.eixo === 'x'
    const pontos = pontosPreparados ?? pontosDaOnda(c, caixa, segundos, toque)
    tracarCurvaSuave(ctx, pontos, 0, deitada, true)
    // Enche até longe do lado escolhido: a inclinação nunca mostra a borda.
    const comprimento = deitada ? caixa.largura : caixa.altura
    const folga = Math.max(caixa.largura, Math.min(caixa.altura, 1000)) * 0.3
    const inicio = -folga
    const fim = comprimento + folga
    const longe = c.lado > 0 ? (deitada ? caixa.altura : caixa.largura) + folga * 3 : -folga * 3
    if (deitada) {
      ctx.lineTo(fim, longe)
      ctx.lineTo(inicio, longe)
    } else {
      ctx.lineTo(longe, fim)
      ctx.lineTo(longe, inicio)
    }
    ctx.closePath()
  }

function rgbDaCor(cor: string) {
    const hex = cor.slice(1)
    const inteiro = parseInt(hex.length === 3
      ? hex.split('').map((digito) => digito + digito).join('')
      : hex, 16)
    return [(inteiro >> 16) & 255, (inteiro >> 8) & 255, inteiro & 255]
  }

function coresDoDegrade(c: CamadaDaOnda) {
    const fontes = c.cor[2], anterior = coresPreparadas.get(c)
    if (anterior && fontes.length === anterior.fontes.length && fontes.every((v, i) => v === anterior.fontes[i])) return anterior.canais
    const canais = fontes.map(rgbDaCor)
    coresPreparadas.set(c, { fontes: fontes.slice(), canais })
    return canais
  }

function corDoPontoNoGradiente(c: CamadaDaOnda, cores: number[][], x: number, y: number) {
    const [[x0, y0], [x1, y1]] = c.cor
    if (cores.length === 1) return cores[0]
    const dx = x1 - x0
    const dy = y1 - y0
    const progresso = Math.max(0, Math.min(1, ((x - x0) * dx + (y - y0) * dy) / (dx * dx + dy * dy)))
    const posicao = progresso * (cores.length - 1)
    const indice = Math.min(cores.length - 2, Math.floor(posicao))
    const local = posicao - indice
    const inicio = cores[indice]
    const fim = cores[indice + 1]
    return inicio.map((canal, i) => Math.round(canal + (fim[i] - canal) * local))
  }

function rascunhoDoDegrade(largura: number, altura: number) {
    const alturaDoBloco = Math.ceil(altura / 32) * 32
    const chave = `${largura}x${alturaDoBloco}`
    if (RASCUNHOS_DO_DEGRADE_PROFUNDO.has(chave)) return RASCUNHOS_DO_DEGRADE_PROFUNDO.get(chave)!
    const canvas = document.createElement('canvas')
    canvas.width = largura
    canvas.height = alturaDoBloco
    const contexto = canvas.getContext('2d')!
    const imagem = contexto.createImageData(largura, alturaDoBloco)
    const rascunho = { canvas, contexto, imagem }
    if (RASCUNHOS_DO_DEGRADE_PROFUNDO.size >= 12) {
      RASCUNHOS_DO_DEGRADE_PROFUNDO.delete(RASCUNHOS_DO_DEGRADE_PROFUNDO.keys().next().value!)
    }
    RASCUNHOS_DO_DEGRADE_PROFUNDO.set(chave, rascunho)
    return rascunho
  }

function pintarDegradeDaOnda(ctx: CanvasRenderingContext2D, c: CamadaDaOnda, caixa: CaixaDaArte, segundos: number, toque: ToqueDaOnda, alfaDaCamada: number) {
    const deitada = c.eixo === 'x'
    if (!deitada) return
    const profundidade = c.profundidadeDoDegrade!
    const matriz = ctx.getTransform()
    const escalaFisica = Math.max(0.001, Math.hypot(matriz.a, matriz.b))
    const pontos = pontosDaOnda(c, caixa, segundos, toque, Math.max(1.5, 3 / escalaFisica))
    const pontosNaTela = pontos.map((p) => ({
      x: matriz.a * p[0] + matriz.c * p[1] + matriz.e,
      y: matriz.b * p[0] + matriz.d * p[1] + matriz.f,
      mundoX: p[0], mundoY: p[1],
    }))
    const profundidadeNaTela = Math.max(1, Math.abs(matriz.d) * profundidade)
    const xInicial = Math.max(0, Math.floor(pontosNaTela[0].x))
    const xFinal = Math.min(ctx.canvas.width - 1, Math.ceil(pontosNaTela[pontosNaTela.length - 1].x))
    if (xFinal < xInicial) return
    const yInicial = Math.max(0, Math.floor(Math.min(...pontosNaTela.map((p) => p.y)) - 1))
    const yFinal = Math.min(ctx.canvas.height - 1, Math.ceil(Math.max(...pontosNaTela.map((p) => p.y)) + profundidadeNaTela + 1))
    if (yFinal < yInicial) return
    const largura = xFinal - xInicial + 1
    const altura = yFinal - yInicial + 1
    /* A máscara é calculada em resolução reduzida e ampliada pelo próprio
       Canvas com interpolação. O fade tem centenas de pixels de profundidade,
       portanto 1/4 da resolução preserva a curva e a suavidade, mas evita
       recalcular milhões de pixels a cada quadro da maré. */
    const escalaDaMascara = ESCALA_DO_DEGRADE_PROFUNDO
    const larguraDaMascara = Math.max(1, Math.ceil(largura * escalaDaMascara))
    const alturaDaMascara = Math.max(1, Math.ceil(altura * escalaDaMascara))
    const rascunho = rascunhoDoDegrade(larguraDaMascara, alturaDaMascara)
    const pixels = rascunho.imagem.data
    pixels.fill(0)
    const cores = coresDoDegrade(c)
    let segmento = 0
    for (let x = 0; x < larguraDaMascara; x++) {
      const centroX = xInicial + (x + 0.5) / escalaDaMascara
      while (segmento < pontosNaTela.length - 2 && pontosNaTela[segmento + 1].x < centroX) segmento++
      const p0 = pontosNaTela[segmento]
      const p1 = pontosNaTela[segmento + 1]
      const trecho = Math.max(0, Math.min(1, (centroX - p0.x) / Math.max(0.001, p1.x - p0.x)))
      const cristaY = p0.y + (p1.y - p0.y) * trecho
      const mundoX = p0.mundoX + (p1.mundoX - p0.mundoX) * trecho
      const mundoY = p0.mundoY + (p1.mundoY - p0.mundoY) * trecho
      const [r, g, b] = corDoPontoNoGradiente(c, cores, mundoX, mundoY)
      const topo = Math.max(0, Math.floor((cristaY - yInicial) * escalaDaMascara - 0.5))
      const fundo = Math.min(alturaDaMascara - 1, Math.ceil((cristaY + profundidadeNaTela - yInicial) * escalaDaMascara))
      for (let y = topo; y <= fundo; y++) {
        const yNaTela = yInicial + (y + 0.5) / escalaDaMascara
        const distancia = yNaTela - cristaY
        const cobertura = Math.max(0, Math.min(1, distancia + 0.5))
        const progresso = Math.max(0, Math.min(1, distancia / profundidadeNaTela))
        const alfa = cobertura * (1 - emS(progresso))
        const indice = (y * larguraDaMascara + x) * 4
        pixels[indice] = r
        pixels[indice + 1] = g
        pixels[indice + 2] = b
        pixels[indice + 3] = Math.round(alfa * 255)
      }
    }
    rascunho.contexto.putImageData(rascunho.imagem, 0, 0)
    ctx.save()
    /* O raster reduzido cuida apenas da dissolução. A borda visível continua
       sendo recortada pela curva vetorial em resolução integral, para a
       otimização nunca transformar a crista em uma escada de pixels. */
    const longe = Math.max(...pontos.map((p) => p[1])) + profundidade + 12
    ctx.beginPath()
    tracarCurvaSuave(ctx, pontos, 0, true, true)
    ctx.lineTo(pontos[pontos.length - 1][0], longe)
    ctx.lineTo(pontos[0][0], longe)
    ctx.closePath()
    ctx.clip()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.globalAlpha = alfaDaCamada
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(
      rascunho.canvas,
      0, 0, larguraDaMascara, alturaDaMascara,
      xInicial, yInicial, largura, altura,
    )
    ctx.restore()
    /* Uma lâmina vetorial cobre os primeiros pixels do fade. Como nessa
       faixa o smoothstep ainda é visualmente opaco, ela não cria emenda e
       conserva a crista perfeitamente lisa também em telas estreitas. */
    const espessuraDaCrista = 8 / escalaFisica
    ctx.beginPath()
    tracarCurvaSuave(ctx, pontos, 0, true, true)
    tracarCurvaSuave(ctx, pontos.slice().reverse(), espessuraDaCrista, true, false)
    ctx.closePath()
    ctx.fillStyle = c.tinta!
    ctx.globalAlpha = alfaDaCamada
    ctx.fill()
  }
return { emS, curvaturaDa, amansar, prepararCamadas, pintar, pontosDaOnda, tracarCurvaSuave, tracarOnda, rgbDaCor, dispose: () => {
  geometrias = new WeakMap()
  coresPreparadas = new WeakMap()
  for (const { canvas } of RASCUNHOS_DO_DEGRADE_PROFUNDO.values()) canvas.width = canvas.height = 0
  RASCUNHOS_DO_DEGRADE_PROFUNDO.clear()
} }
}
