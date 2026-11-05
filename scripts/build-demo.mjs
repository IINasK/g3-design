import {readFile, writeFile} from 'node:fs/promises';
import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';

const root = new URL('../', import.meta.url);
const {temas} = JSON.parse(await readFile(new URL('skills/g3-design/assets/papeis-de-cor.json', root), 'utf8'));
const roles = {fundo: 'page', superficie: 'surface', texto: 'text', textoSecundario: 'muted', acento: 'accent', borda: 'border', foco: 'focus', acao: 'primary', textoSobreAcao: 'on-primary'};
const css = Object.entries(temas).map(([name, colors]) => {
  const selector = name === 'claro' ? ':root, [data-theme="light"]' : '[data-theme="dark"]';
  return `${selector} {\n${Object.entries(roles).map(([role, token]) => `  --${token}: ${colors[role]};`).join('\n')}\n  color-scheme: ${name === 'claro' ? 'light' : 'dark'};\n}\n`;
}).join('\n');
await writeFile(new URL('docs/assets/theme.css', root), `/* Generated from the skill's shared color roles. */\n${css}`);
const result = await build({
  absWorkingDir: fileURLToPath(root),
  entryPoints: ['docs/src/main.ts'], outfile: 'docs/assets/demo.js',
  bundle: true, format: 'esm', target: 'es2023', minify: true,
  legalComments: 'none', metafile: true,
});
console.log(`Demo compiled: ${Object.values(result.metafile.outputs).reduce((n, value) => n + value.bytes, 0)} JS bytes.`);
