import {readFile, writeFile, copyFile} from 'node:fs/promises';
import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';
import {MOVIMENTO} from '../skills/g3-design/assets/movimento/presets.ts';

const root = new URL('../', import.meta.url);
const {temas} = JSON.parse(await readFile(new URL('skills/g3-design/assets/papeis-de-cor.json', root), 'utf8'));
const roles = {fundo: 'page', superficie: 'surface', texto: 'text', textoSecundario: 'muted', acento: 'accent', borda: 'border', foco: 'focus', acao: 'primary', textoSobreAcao: 'on-primary'};
const css = Object.entries(temas).map(([name, colors]) => {
  const selector = name === 'claro' ? ':root, [data-palette="claro"]' : `[data-palette="${name}"]`;
  return `${selector} {\n${Object.entries(roles).map(([role, token]) => `  --${token}: ${colors[role]};`).join('\n')}\n  --paint-action: ${colors.pinturaAcao};\n  --paint-surface: ${colors.pinturaSuperficie};\n  color-scheme: ${colors.modo};\n}\n`;
}).join('\n');
const clocks = `:root { --tempo-pintura: ${MOVIMENTO.pintura}ms; --tempo-apagar: ${MOVIMENTO.pintura}ms; --curva-pintura: ${MOVIMENTO.curvaPintura}; }`;
const swatches = Object.entries(temas).map(([id, colors]) => `[data-palette-choice="${id}"] i { background: ${colors.acao}; box-shadow: inset 0 0 0 3px ${colors.acento}; }`).join('\n');
await writeFile(new URL('docs/assets/theme.css', root), `/* Generated from the skill's shared roles and clocks. */\n${css}\n${clocks}\n${swatches}\n`);
await copyFile(new URL('skills/g3-design/assets/movimento/interacoes.css', root), new URL('docs/assets/interacoes.css', root));
const result = await build({
  absWorkingDir: fileURLToPath(root),
  entryPoints: ['docs/src/main.ts'], outfile: 'docs/assets/demo.js',
  bundle: true, format: 'esm', target: 'es2023', minify: true,
  legalComments: 'none', metafile: true,
});
console.log(`Demo compiled: ${Object.values(result.metafile.outputs).reduce((n, value) => n + value.bytes, 0)} JS bytes.`);
