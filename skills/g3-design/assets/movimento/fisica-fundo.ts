import type { ContextoDoFundo, EsferaDoFundo } from './tipos-fundo'
import { emS } from './nucleo-ondas'

export const ESFERA_ALCANCE = 190
export const ESFERA_EMPURRAO = 80
export const ESFERA_MOLA = 34
export const ESFERA_AMORTECE = 9.5

export function criarFisicaDoFundo({ cursor, campo, lerRaiz, svg, esferas }: ContextoDoFundo & { svg: () => SVGSVGElement | null; esferas: () => EsferaDoFundo[] }) {
const PARALAXE_SEGUE = 0.3
const PARALAXE_VOLTA = 2400
const CAMPO_VELOCIDADE_REF = 500
const CAMPO_SOBE = 0.9
const CAMPO_DESCE = 0.18
const CAMPO_SEGUE = 0.09
function aproximarDoCursor(agora: number) {
    const dt = cursor.antes ? Math.min(0.1, (agora - cursor.antes) / 1000) : 1 / 60
    cursor.antes = agora
    let chegou
    if (cursor.volta) {
      const p = Math.min(1, (agora - cursor.volta.inicio) / PARALAXE_VOLTA)
      const resta = 1 - emS(p)
      cursor.x = cursor.volta.x * resta
      cursor.y = cursor.volta.y * resta
      chegou = p >= 1
      if (chegou) cursor.volta = null
    } else {
      const k = 1 - Math.exp(-dt / PARALAXE_SEGUE)
      cursor.x += (cursor.alvoX - cursor.x) * k
      cursor.y += (cursor.alvoY - cursor.y) * k
      chegou = Math.abs(cursor.alvoX - cursor.x) < 0.001 && Math.abs(cursor.alvoY - cursor.y) < 0.001
    }
    if (chegou) {
      cursor.quadro = 0
      cursor.antes = 0
    } else {
      cursor.quadro = requestAnimationFrame(aproximarDoCursor)
    }
  }

function mirar(x: number, y: number) {
    cursor.volta = null
    cursor.alvoX = x
    cursor.alvoY = y
    if (!cursor.quadro) cursor.quadro = requestAnimationFrame(aproximarDoCursor)
  }

function voltarAoCentro() {
    cursor.alvoX = 0
    cursor.alvoY = 0
    cursor.volta = { inicio: performance.now(), x: cursor.x, y: cursor.y }
    if (!cursor.quadro) cursor.quadro = requestAnimationFrame(aproximarDoCursor)
  }

function sentirPonteiro(x: number, y: number, agora: number) {
    if (!campo.ativo) {
      campo.x = campo.alvoX = x
      campo.y = campo.alvoY = y
      campo.velocidade = 0
    } else {
      const dt = Math.max(1, agora - campo.ultimo) / 1000
      const instantanea = Math.hypot(x - campo.alvoX, y - campo.alvoY) / dt
      campo.velocidade = campo.velocidade * 0.6 + instantanea * 0.4
      campo.alvoX = x
      campo.alvoY = y
    }
    campo.ultimo = agora
    campo.ativo = true
  }

function soltarPonteiro() {
    campo.ativo = false
  }

function moverEsferas(dt: number, segundos: number) {
    const svgDasEsferas = svg(), ESFERAS = esferas()
    if (!svgDasEsferas || !ESFERAS.length) return false
    const intensidade = lerRaiz('--paralaxe-intensidade', 0.6)
    let mouse: DOMPoint | null = null
    if (campo.ativo) {
      const m = svgDasEsferas.getScreenCTM()
      if (m) mouse = new DOMPoint(campo.x, campo.y).matrixTransform(m.inverse())
    }
    let mexendo = false
    for (const e of ESFERAS) {
      if (e.oculta) continue
      let alvoX = 0
      let alvoY = 0
      if (mouse) {
        const dx = e.cx - mouse.x
        const dy = e.cy - mouse.y
        const dist = Math.hypot(dx, dy) || 0.001
        const alcance = e.r + ESFERA_ALCANCE
        if (dist < alcance) {
          const perto = 1 - dist / alcance
          const peso = Math.sqrt(90 / (e.r + 60))
          const forca = ESFERA_EMPURRAO * peso * perto * perto
          alvoX = (dx / dist) * forca
          alvoY = (dy / dist) * forca
        }
      }
      // Mola com amortecimento, integrada em passos pequenos.
      const passos = Math.ceil(dt / (1 / 120))
      const h = dt / passos
      for (let i = 0; i < passos; i++) {
        e.vx += (ESFERA_MOLA * (alvoX - e.x) - ESFERA_AMORTECE * e.vx) * h
        e.vy += (ESFERA_MOLA * (alvoY - e.y) - ESFERA_AMORTECE * e.vy) * h
        e.x += e.vx * h
        e.y += e.vy * h
      }
      // Órbita + paralaxe do cursor + empurrão, num translate só.
      const angulo = (2 * Math.PI * (segundos - e.atraso)) / e.duracao
      const tx = e.raio * Math.cos(angulo) + cursor.x * e.paralaxe * intensidade + e.x
      const ty = e.raio * Math.sin(angulo) + cursor.y * e.paralaxe * intensidade + e.y
      e.g.style.translate = tx.toFixed(2) + 'px ' + ty.toFixed(2) + 'px'
      if (Math.abs(e.x) > 0.05 || Math.abs(e.y) > 0.05 || Math.abs(e.vx) > 0.05 || Math.abs(e.vy) > 0.05) mexendo = true
    }
    return mexendo
  }
function atualizarCampo(dt: number, campoAtivoNoQuadro: boolean) {
campo.velocidade *= Math.exp(-dt / 0.12)
    const alvo = campoAtivoNoQuadro ? 1 / (1 + (campo.velocidade / CAMPO_VELOCIDADE_REF) ** 2) : 0
    const tempo = alvo > campo.carga ? CAMPO_SOBE : CAMPO_DESCE
    campo.carga += (alvo - campo.carga) * (1 - Math.exp(-dt / tempo))
    campo.efeito = campo.carga * campo.carga * (3 - 2 * campo.carga) // a curva em S
    const segue = 1 - Math.exp(-dt / CAMPO_SEGUE)
    campo.x += (campo.alvoX - campo.x) * segue
    campo.y += (campo.alvoY - campo.y) * segue
}
return { aproximarDoCursor, mirar, voltarAoCentro, sentirPonteiro, soltarPonteiro, moverEsferas, atualizarCampo, dispose: () => { cancelAnimationFrame(cursor.quadro); cursor.quadro = 0 } }
}
