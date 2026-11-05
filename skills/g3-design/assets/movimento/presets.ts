/** Fixed interaction contract. Consumers share the same clocks and curves. */
export const MOVIMENTO = Object.freeze({
  pintura: 820,
  recolher: 820,
  toque: 200,
  seletor: 360,
  curvaPintura: 'cubic-bezier(0.22, 1, 0.36, 1)',
  curvaRecolher: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
});

/** Acceleration, stretch and landing from the established sliding selector. */
export const POUSO = [
  {offset: 0, progresso: 0, escala: 1, easing: 'cubic-bezier(.65, 0, .8, .3)'},
  {offset: .18, progresso: .03, escala: 1.025, easing: 'cubic-bezier(.3, .05, .3, 1)'},
  {offset: .48, progresso: .58, escala: 1.18, easing: 'cubic-bezier(.2, .6, .3, 1)'},
  {offset: 1, progresso: 1, escala: 1, easing: 'linear'},
] as const;
