# G3 Design

[Português](README.md) · [English](README.en.md)

[![G3 Design — Minimal design. With presence.](docs/assets/banner-en.png)](https://iinask.github.io/g3-design/?lang=en)

## Minimal design. With presence.

Clean components, organic waves and purposeful transitions. G3 Design is a skill for creating elegant interfaces with a recognizable identity.

**Official version 1.0.0 · In active development.** Earlier versions were prototypes.
Instructions and examples may evolve.

**[→ Try the interactive demo](https://iinask.github.io/g3-design/?lang=en)**

Try pointer- and touch-responsive waves, radial button lighting and the travelling PT/EN capsule. Circular transitions contract at the current click. Choose **Corporate, Lavender, Night or Corporate Dark**.

The GitHub README displays a clickable banner. The interactive experience runs on GitHub Pages.

## Install

Requires **Node.js 22.20+**, npm/npx and Git. Run the command in your project folder. It installs the complete skill for the selected agent in that project, without changing global settings.

### Claude Code

```sh
npx --yes skills@1.7.6 add IINasK/g3-design --skill g3-design --agent claude-code --copy --yes
```

### Codex

```sh
npx --yes skills@1.7.6 add IINasK/g3-design --skill g3-design --agent codex --copy --yes
```

### Cursor

```sh
npx --yes skills@1.7.6 add IINasK/g3-design --skill g3-design --agent cursor --copy --yes
```

### Gemini CLI

```sh
npx --yes skills@1.7.6 add IINasK/g3-design --skill g3-design --agent gemini-cli --copy --yes
```

### GitHub Copilot

```sh
npx --yes skills@1.7.6 add IINasK/g3-design --skill g3-design --agent github-copilot --copy --yes
```

### Antigravity

```sh
npx --yes skills@1.7.6 add IINasK/g3-design --skill g3-design --agent antigravity --copy --yes
```

Then ask your agent:

> Use the G3 Design skill. Reuse this project’s components and icons, preserve its identity and audit the result on mobile and desktop.

### Manual installation

Copy the entire [`skills/g3-design`](skills/g3-design/SKILL.md) folder to your agent’s skills directory. Keep its references, assets, examples, scripts and metadata together.

## What the skill covers

- Consistent fields, borders, spacing, focus and states.
- Reuse of components and licensed official icons.
- Four themes with semantic roles, contrast and coordinated wave colors.
- Included TypeScript/CSS engines for interactive waves, radial light and sliding selectors.
- Responsive layouts, accessible interaction and reduced motion.
- Real-world visual and performance checks.

The target project’s stack, brand and approved components take priority. The skill does not require a specific framework. The demo is an example, not an automatic guarantee of visual quality, security or performance.

## Development and checks

```sh
npm ci
npm run check
npm run build
npx playwright install chromium
npm run test:demo
python -B skills/g3-design/scripts/validar_pacote.py
python -B -m unittest discover -s tests -p test_validar_pacote.py -v
```

The demo is static HTML/CSS with bundled TypeScript, without runtime framework dependencies. Python 3.9+ is needed for skill checks. Tests use a Node static server bound to the local address.

A real symlink test can be skipped explicitly if the operating system refuses to create it. Browser emulation does not replace physical-device testing.

Technical references: [installer commands](https://github.com/vercel-labs/skills/blob/main/docs/commands.md), [supported agents](https://github.com/vercel-labs/skills/blob/main/docs/agents.md), [font and icon licenses](docs/assets/THIRD-PARTY-NOTICES.md).
