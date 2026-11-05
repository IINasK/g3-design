# G3 Design

[Português](README.md) · [English](README.en.md)

[![G3 Design — Minimalismo com presença.](docs/assets/banner-pt.png)](https://iinask.github.io/g3-design/?lang=pt)

## Minimalismo com presença.

Componentes limpos, ondas orgânicas e transições com intenção. G3 Design é uma skill para criar interfaces elegantes, com uma identidade que se reconhece.

**Versão oficial 1.1.0 · Em desenvolvimento ativo.** As versões anteriores eram protótipos.
As instruções e os exemplos podem evoluir.

**[→ Experimentar a demonstração interativa](https://iinask.github.io/g3-design/?lang=pt)**

Teste as ondas que respondem ao ponteiro e ao toque, a luz radial dos botões e o seletor PT/EN com cápsula deslizante. A transição circular fecha no ponto do clique atual. Escolha entre **Corporativo, Lavanda, Noite e Corporativo Escuro**.

O README do GitHub exibe um banner clicável. A experiência interativa funciona no GitHub Pages.

## Instalar

Requer **Node.js 22.20+**, npm/npx e Git. Execute na pasta do seu projeto. O comando instala a skill completa para o agente escolhido nesse projeto, sem alterar configurações globais.

### Claude Code

```sh
npx --yes skills@1.7.6 add https://github.com/IINasK/g3-design/tree/v1.1.0 --skill g3-design --agent claude-code --copy --yes
```

### Codex

```sh
npx --yes skills@1.7.6 add https://github.com/IINasK/g3-design/tree/v1.1.0 --skill g3-design --agent codex --copy --yes
```

### Cursor

```sh
npx --yes skills@1.7.6 add https://github.com/IINasK/g3-design/tree/v1.1.0 --skill g3-design --agent cursor --copy --yes
```

### Gemini CLI

```sh
npx --yes skills@1.7.6 add https://github.com/IINasK/g3-design/tree/v1.1.0 --skill g3-design --agent gemini-cli --copy --yes
```

### GitHub Copilot

```sh
npx --yes skills@1.7.6 add https://github.com/IINasK/g3-design/tree/v1.1.0 --skill g3-design --agent github-copilot --copy --yes
```

### Antigravity

```sh
npx --yes skills@1.7.6 add https://github.com/IINasK/g3-design/tree/v1.1.0 --skill g3-design --agent antigravity --copy --yes
```

Depois, peça ao agente:

> Use a skill G3 Design. Reutilize os componentes e ícones deste projeto, preserve sua identidade e audite o resultado no celular e no computador.

### Instalação manual

Copie a pasta inteira [`skills/g3-design`](skills/g3-design/SKILL.md) para o diretório de skills do seu agente. Preserve referências, assets, exemplos, scripts e metadados juntos.

## Atualizar uma instalação existente

1. Confira a versão e as notas em [Releases](https://github.com/IINasK/g3-design/releases/latest).
2. Na pasta do projeto, execute novamente o comando de instalação acima para o seu agente. Ele já aponta para **v1.1.0** e mantém o modo de cópia.
3. Se a mudança não aparecer, abra uma nova sessão ou reinicie seu aplicativo de IA.

Guarde suas adaptações locais antes: reinstalar substitui os arquivos da skill.
Isso não altera automaticamente as telas que ela já ajudou a criar. Instalação
por ZIP é atualizada substituindo a pasta completa pela do ZIP da nova release.
Se instalou globalmente, acrescente `--global` ao comando; preserve o mesmo escopo.

O `1.7.6` no comando é a versão do instalador; `v1.1.0` na URL é a versão da G3 Design.
`main` é desenvolvimento. Os comandos `skills check`/`skills update` não selecionam,
por si, a última release estável: para seguir esta política, reinstale pela tag
indicada na release. Para voltar, use o comando ou ZIP da versão anterior.

Veja [o que mudou](CHANGELOG.md) e a [política de publicação](RELEASING.md).

## O que a skill orienta

- Campos, bordas, espaçamentos, foco e estados consistentes.
- Reutilização de componentes e ícones oficiais licenciados.
- Quatro temas por papéis semânticos, com contraste e cores das ondas.
- Motores TypeScript/CSS de ondas interativas, luz radial e seletor deslizante incluídos no pacote.
- Responsividade, interação acessível e movimento reduzido.
- Conferência visual e de desempenho no ambiente real.

A stack, a marca e os componentes aprovados no projeto de destino têm precedência. A skill não exige um framework específico. O piloto é um exemplo, não uma garantia automática de qualidade visual, segurança ou desempenho.

## Desenvolvimento e verificação

```sh
npm ci
npm run check
npm run test:release
npm run build
npx playwright install chromium
npm run test:demo
python -B skills/g3-design/scripts/validar_pacote.py
python -B -m unittest discover -s tests -p test_validar_pacote.py -v
```

O piloto usa HTML/CSS e TypeScript compilado, sem dependências de framework em execução. Python 3.9+ é usado nas verificações da skill. Os testes usam um servidor estático Node restrito ao endereço local.

Um teste real de link simbólico pode ser ignorado explicitamente quando o sistema operacional recusar sua criação. Emulação no navegador não substitui teste em aparelho físico.

Referências técnicas: [comandos do instalador](https://github.com/vercel-labs/skills/blob/main/docs/commands.md), [agentes suportados](https://github.com/vercel-labs/skills/blob/main/docs/agents.md), [licenças de fontes e ícones](docs/assets/THIRD-PARTY-NOTICES.md).
