import {version} from '../../package.json';
import {montarOndas} from './ondas';
import {criarPintura} from '../../skills/g3-design/assets/movimento/pintura';
import {montarSeletorDeslizante} from '../../skills/g3-design/assets/movimento/seletor';
import {MOVIMENTO} from '../../skills/g3-design/assets/movimento/presets';
import {temas} from '../../skills/g3-design/assets/papeis-de-cor.json';

const pt = {
  status: `${version} · EM DESENVOLVIMENTO`, heading: 'Minimalismo.', headingAccent: 'Com presença.',
  description: 'Design limpo, movimento sutil e uma identidade que se reconhece. Uma skill para criar interfaces elegantes, sem perder a vida.',
  explore: 'Experimentar', install: 'Instalar a skill', builtFor: 'Feita para a sua próxima interface.',
  theme: 'Mudar tema', livePreview: 'PREVIEW INTERATIVO', cardBadge: 'A forma encontra a função',
  sampleTitle: 'Seu próximo projeto.', sampleDescription: 'Poucos elementos. Cada um no seu lugar.',
  fieldLabel: 'Nome do projeto', fieldPlaceholder: 'Estúdio Aurora', apply: 'Aplicar',
  applied: 'Pronto. Seu estilo, sua ideia.', required: 'Escreva um nome para experimentar.', expand: 'Expandir experiência',
  principleOne: 'Clareza no essencial.', principleTwo: 'Movimento com intenção.', principleThree: 'Identidade em cada detalhe.',
  installEyebrow: 'COMECE A CRIAR', installTitle: 'Seu agente. A mesma linguagem.',
  installDescription: 'Escolha seu agente e cole o comando no terminal, dentro da pasta do seu projeto.',
  requirements: 'Requer Node.js 22.20+ e Git. A instalação é feita somente neste projeto.',
  chooseAgent: 'Escolha seu agente', copy: 'Copiar comando', copied: 'Comando copiado.',
  copyFailed: 'Selecione o comando e copie manualmente.', installHint: 'Depois de instalar, peça ao agente para usar a skill G3 Design.',
  footer: 'Elegância em evolução.', close: 'Fechar experiência', experienceNavigation: 'Navegação da experiência',
  exploreEyebrow: 'EXPLORE A FORMA', overview: 'Visão geral', details: 'Os detalhes', motion: 'O movimento',
  detailOne: 'Camadas leves', detailTwo: 'Identidade consistente', motionEnabled: 'Animações ativadas',
  motionNote: 'A preferência de movimento reduzido do seu dispositivo sempre prevalece.',
  overviewEyebrow: '01 / VISÃO GERAL', overviewTitle: 'O essencial pode ter personalidade.',
  overviewCopy: 'Uma interface pode ser simples sem ser genérica. Aqui, espaço, contraste e curvas trabalham juntos para deixar a sua ideia em primeiro plano.',
  detailsEyebrow: '02 / OS DETALHES', detailsTitle: 'Precisão que se sente.',
  detailsCopy: 'Bordas completas. Foco visível. Ícones no lugar certo. A consistência nasce de componentes reutilizados e de pequenos cuidados que se repetem.',
  motionEyebrow: '03 / O MOVIMENTO', motionTitle: 'Vida, na medida certa.',
  motionCopy: 'Ondas orgânicas e transições acompanham a interação. O movimento dá continuidade à experiência e respeita quem prefere tudo mais tranquilo.',
};
const en: Record<keyof typeof pt, string> = {
  status: `${version} · IN DEVELOPMENT`, heading: 'Minimal design.', headingAccent: 'With presence.',
  description: 'Clean design, subtle motion and a recognizable identity. A skill for creating elegant interfaces that still feel alive.',
  explore: 'Try the experience', install: 'Install the skill', builtFor: 'Made for your next interface.',
  theme: 'Switch theme', livePreview: 'INTERACTIVE PREVIEW', cardBadge: 'Where form meets function',
  sampleTitle: 'Your next project.', sampleDescription: 'Fewer elements. Everything in its place.',
  fieldLabel: 'Project name', fieldPlaceholder: 'Aurora Studio', apply: 'Apply',
  applied: 'Done. Your style, your idea.', required: 'Enter a name to try it.', expand: 'Expand the experience',
  principleOne: 'Clarity in the essentials.', principleTwo: 'Purposeful motion.', principleThree: 'Identity in every detail.',
  installEyebrow: 'START CREATING', installTitle: 'Your agent. One visual language.',
  installDescription: 'Choose your agent and paste the command into a terminal in your project folder.',
  requirements: 'Requires Node.js 22.20+ and Git. Installs in this project only.',
  chooseAgent: 'Choose your agent', copy: 'Copy command', copied: 'Command copied.',
  copyFailed: 'Select the command and copy it manually.', installHint: 'After installing, ask your agent to use the G3 Design skill.',
  footer: 'Elegance, evolving.', close: 'Close the experience', experienceNavigation: 'Experience navigation',
  exploreEyebrow: 'EXPLORE THE FORM', overview: 'Overview', details: 'The details', motion: 'The motion',
  detailOne: 'Lightweight layers', detailTwo: 'Consistent identity', motionEnabled: 'Animations enabled',
  motionNote: 'Your device’s reduced-motion preference always takes priority.',
  overviewEyebrow: '01 / OVERVIEW', overviewTitle: 'Essentials with personality.',
  overviewCopy: 'An interface can be simple without feeling generic. Space, contrast and curves work together to keep your idea in the foreground.',
  detailsEyebrow: '02 / THE DETAILS', detailsTitle: 'Precision you can feel.',
  detailsCopy: 'Complete borders. Visible focus. Icons in the right place. Consistency comes from reused components and small details that work together.',
  motionEyebrow: '03 / THE MOTION', motionTitle: 'Just enough life.',
  motionCopy: 'Organic waves and transitions follow your interaction. Motion creates continuity, while respecting those who prefer a quieter experience.',
};
type Key = keyof typeof pt;
type View = 'overview' | 'details' | 'motion';
const agents = ['claude-code', 'codex', 'cursor', 'gemini-cli', 'github-copilot', 'antigravity'] as const;
function el<T extends HTMLElement>(id: string) { const node = document.getElementById(id); if (!node) throw new Error('Missing demo element'); return node as T; }
const root = document.documentElement;
const dialog = el<HTMLDialogElement>('experience');
const input = el<HTMLInputElement>('project-name');
const motion = el<HTMLInputElement>('motion-enabled');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const events = new AbortController();
const options = {signal: events.signal};
let language: 'pt' | 'en' = new URLSearchParams(location.search).get('lang') === 'en' ? 'en' : 'pt';
let phase: 'closed' | 'opening' | 'open' | 'closing' = 'closed';
let view: View = 'overview';
let name = '', agent: typeof agents[number] = 'claude-code', effects = true, sequence = 0;
let trigger: HTMLElement | null = null;
let panelWaves: ReturnType<typeof montarOndas> | null = null;
let currentAnimation: Animation | null = null;
let copyTimer: ReturnType<typeof setTimeout> | undefined;
const heroWaves = montarOndas(el<HTMLCanvasElement>('hero-waves'), () => phase === 'closed' && moving());
const pintura = criarPintura(document.body);
const seletor = montarSeletorDeslizante(document.querySelector<HTMLElement>('.languages')!, moving);
function moving() { return effects && !reduced.matches; }
function words() { return language === 'en' ? en : pt; }
function text(key: Key) { return words()[key]; }

function setView(next: View, animate = true) {
  view = next;
  document.querySelectorAll<HTMLElement>('[data-view]').forEach(node => node.setAttribute('aria-pressed', String(node.dataset.view === view)));
  el('view-eyebrow').textContent = text(`${view}Eyebrow`);
  el('experience-title').textContent = text(`${view}Title`);
  el('experience-copy').textContent = text(`${view}Copy`);
  if (animate && moving()) {
    const content = el('experience-content');
    content.getAnimations().forEach(animation => animation.cancel());
    content.animate([{opacity: .5, transform: 'translateY(8px)'}, {opacity: 1, transform: 'translateY(0)'}], {duration: 300, easing: 'cubic-bezier(.22,1,.36,1)'});
  }
}
function setAgent(next: typeof agents[number]) {
  agent = next;
  document.querySelectorAll<HTMLElement>('[data-agent]').forEach(node => node.setAttribute('aria-pressed', String(node.dataset.agent === agent)));
  el('install-command').textContent = `npx --yes skills@1.7.6 add https://github.com/IINasK/g3-design/tree/v${version} --skill g3-design --agent ${agent} --copy --yes`;
  el('copy-feedback').textContent = text('installHint');
}
function setLanguage(next: 'pt' | 'en') {
  language = next;
  root.lang = next === 'pt' ? 'pt-BR' : 'en';
  document.title = `G3 Design — ${next === 'pt' ? 'minimalismo com presença' : 'minimal design with presence'}`;
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach(node => { node.textContent = text(node.dataset.i18n as Key); });
  document.querySelectorAll<HTMLElement>('[data-label]').forEach(node => node.setAttribute('aria-label', text(node.dataset.label as Key)));
  document.querySelectorAll<HTMLInputElement>('[data-placeholder]').forEach(node => { node.placeholder = text(node.dataset.placeholder as Key); });
  document.querySelectorAll<HTMLElement>('[data-lang]').forEach(node => node.setAttribute('aria-pressed', String(node.dataset.lang === next)));
  el('sample-title').textContent = name || text('sampleTitle');
  el('field-feedback').textContent = '';
  input.removeAttribute('aria-invalid');
  setView(view, false); setAgent(agent); atualizarPaletas();
  const url = new URL(location.href); url.searchParams.set('lang', next); history.replaceState(null, '', url);
}
function setMotion() {
  root.dataset.motion = moving() ? 'on' : 'off';
  motion.checked = moving(); motion.disabled = reduced.matches;
  if (!moving()) {
    document.getAnimations().filter(animation => animation !== currentAnimation).forEach(animation => animation.cancel());
    currentAnimation?.finish();
    document.querySelectorAll<HTMLElement>('.pinta').forEach(node => { node.classList.remove('iluminado'); pintura.zerarPintura(node); });
  }
  seletor.atualizarEfeitos();
  heroWaves.atualizar(); panelWaves?.atualizar();
}
async function transition(from: string, to: string, closing = false) {
  currentAnimation?.cancel();
  if (!moving()) return;
  const animation = dialog.animate([{clipPath: from}, {clipPath: to}], {duration: closing ? MOVIMENTO.recolher : MOVIMENTO.pintura, easing: closing ? MOVIMENTO.curvaRecolher : MOVIMENTO.curvaPintura});
  currentAnimation = animation;
  await animation.finished.catch(() => {});
  if (currentAnimation === animation) currentAnimation = null;
}
async function openExperience(event: MouseEvent) {
  if (phase !== 'closed') return;
  const ownSequence = ++sequence;
  trigger = event.currentTarget as HTMLElement;
  const origin = pintura.pontoDo(trigger, event);
  phase = 'opening'; heroWaves.atualizar();
  dialog.showModal();
  panelWaves = montarOndas(el<HTMLCanvasElement>('dialog-waves'), () => phase === 'open' && moving());
  const radius = Math.hypot(Math.max(origin.x, innerWidth - origin.x), Math.max(origin.y, innerHeight - origin.y));
  await transition(`circle(0px at ${origin.x}px ${origin.y}px)`, `circle(${radius}px at ${origin.x}px ${origin.y}px)`);
  if (ownSequence === sequence && phase === 'opening') { phase = 'open'; panelWaves?.atualizar(); el('close-experience').focus({preventScroll: true}); }
}
async function closeExperience(event?: MouseEvent) {
  if (phase === 'closed' || phase === 'closing') return;
  const origin = pintura.pontoDo(event?.currentTarget as HTMLElement || el('close-experience'), event);
  // Complete an interrupted reveal before contracting at a different point.
  currentAnimation?.finish();
  const ownSequence = ++sequence;
  phase = 'closing';
  panelWaves?.atualizar();
  const radius = pintura.ateOCanto(origin.x, origin.y, innerWidth, innerHeight);
  await transition(`circle(${radius}px at ${origin.x}px ${origin.y}px)`, `circle(0px at ${origin.x}px ${origin.y}px)`, true);
  if (ownSequence !== sequence) return;
  dialog.close(); phase = 'closed';
  panelWaves?.destruir(); panelWaves = null;
  heroWaves.atualizar();
  if (trigger?.isConnected) trigger.focus({preventScroll: true});
}

el('explore').addEventListener('click', openExperience, options);
el('expand').addEventListener('click', openExperience, options);
el('close-experience').addEventListener('click', closeExperience, options);
el('dialog-home').addEventListener('click', event => { event.preventDefault(); void closeExperience(event); }, options);
dialog.addEventListener('cancel', event => { event.preventDefault(); void closeExperience(); }, options);
document.querySelectorAll<HTMLElement>('[data-view]').forEach(button => button.addEventListener('click', () => setView(button.dataset.view as View), options));
document.querySelectorAll<HTMLElement>('[data-lang]').forEach(button => button.addEventListener('click', () => setLanguage(button.dataset.lang as 'pt' | 'en'), options));
document.querySelectorAll<HTMLElement>('[data-agent]').forEach(button => button.addEventListener('click', () => {
  const next = button.dataset.agent;
  if (agents.some(known => known === next)) setAgent(next as typeof agents[number]);
}, options));
function atualizarPaletas() {
  document.querySelectorAll<HTMLElement>('[data-palette-choice]').forEach(button => {
    const id = button.dataset.paletteChoice as keyof typeof temas;
    button.querySelector('span')!.textContent = language === 'pt' ? temas[id].nome : temas[id].name;
    button.setAttribute('aria-pressed', String(root.dataset.palette === id));
  });
}
function fecharPaletas() { el('theme-picker').hidden = true; el('theme-toggle').setAttribute('aria-expanded', 'false'); }
el('theme-toggle').addEventListener('click', () => {
  const abrir = el('theme-picker').hidden;
  el('theme-picker').hidden = !abrir; el('theme-toggle').setAttribute('aria-expanded', String(abrir));
  if (abrir) el('theme-picker').querySelector<HTMLElement>('[aria-pressed="true"]')?.focus({preventScroll: true});
}, options);
document.querySelectorAll<HTMLElement>('[data-palette-choice]').forEach(button => button.addEventListener('click', () => {
  const id = button.dataset.paletteChoice as keyof typeof temas;
  root.dataset.palette = id; root.dataset.theme = temas[id].modo;
  atualizarPaletas(); heroWaves.cores(); panelWaves?.cores(); fecharPaletas(); el('theme-toggle').focus({preventScroll: true});
}, options));
document.addEventListener('pointerdown', event => { if (!(event.target as Element).closest('.header-controls')) fecharPaletas(); }, options);
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !el('theme-picker').hidden) { fecharPaletas(); el('theme-toggle').focus(); } }, options);
const fineHover = matchMedia('(hover: hover) and (pointer: fine)');
document.querySelectorAll<HTMLElement>('button:not([data-lang]), .text-link').forEach(button => {
  button.classList.add('pinta');
  function acender(event?: MouseEvent) { if (moving()) { pintura.acender(button, event); button.classList.add('iluminado'); } }
  function apagar(event?: MouseEvent) { if (button.matches(':focus-visible')) return; if (moving() && button.classList.contains('iluminado')) pintura.apagar(button, pintura.pontoDo(button, event)); button.classList.remove('iluminado'); }
  button.addEventListener('pointerenter', event => { if (fineHover.matches) acender(event); }, options);
  button.addEventListener('pointerleave', apagar, options);
  button.addEventListener('pointerdown', event => { if (event.pointerType !== 'mouse') acender(event); }, options);
  button.addEventListener('pointerup', event => { if (event.pointerType !== 'mouse') apagar(event); }, options);
  button.addEventListener('pointercancel', apagar, options);
  button.addEventListener('focus', () => { if (button.matches(':focus-visible')) acender(); }, options);
  button.addEventListener('blur', () => { if (!button.matches(':hover')) apagar(); }, options);
});
el('sample-form').addEventListener('submit', event => {
  event.preventDefault();
  const value = input.value.trim();
  if (!value || value.length > 64) {
    input.setAttribute('aria-invalid', 'true'); el('field-feedback').textContent = text('required'); input.focus(); return;
  }
  name = value;
  input.removeAttribute('aria-invalid'); el('sample-title').textContent = name;
  el('field-feedback').textContent = text('applied');
  if (moving()) el('sample-title').animate([{opacity: .4, transform: 'translateY(5px)'}, {opacity: 1, transform: 'translateY(0)'}], {duration: 280, easing: 'ease-out'});
}, options);
el('copy-command').addEventListener('click', async () => {
  clearTimeout(copyTimer);
  try {
    await navigator.clipboard.writeText(el('install-command').textContent!);
    el('copy-feedback').textContent = text('copied');
    el('copy-command').querySelector('use')!.setAttribute('href', './assets/icons.svg#check');
  } catch {
    const selection = window.getSelection();
    const range = document.createRange(); range.selectNodeContents(el('install-command'));
    selection?.removeAllRanges(); selection?.addRange(range);
    el('copy-feedback').textContent = text('copyFailed');
  }
  copyTimer = setTimeout(() => {
    el('copy-command').querySelector('use')!.setAttribute('href', './assets/icons.svg#copy');
    el('copy-feedback').textContent = text('installHint');
  }, 2500);
}, options);
motion.addEventListener('change', () => { effects = motion.checked; setMotion(); }, options);
reduced.addEventListener('change', setMotion, options);
window.addEventListener('pagehide', (event: PageTransitionEvent) => {
  if (event.persisted) return;
  events.abort(); clearTimeout(copyTimer); currentAnimation?.cancel();
  heroWaves.destruir(); panelWaves?.destruir(); seletor.destruir(); pintura.dispose();
}, options);
document.querySelectorAll<HTMLElement>('[data-version]').forEach(node => { node.textContent = version; });
setLanguage(language); setMotion();
