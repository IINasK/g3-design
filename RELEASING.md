# Versões e publicação / Versions and releases

## Política

- Use `X.Y.Z`: correção compatível incrementa Z; recurso compatível incrementa Y;
  mudança incompatível incrementa X. A compatibilidade inclui nome da skill,
  caminhos/exportações dos recursos e comportamento documentado.
- `main` é desenvolvimento. Uma release é uma revisão testada, identificada por
  tag anotada `vX.Y.Z`. Não mover tags nem substituir arquivos já publicados;
  qualquer correção sai em outra versão.
- A versão em `package.json` alimenta o piloto. Metadados da skill, lockfile e
  comandos dos READMEs devem concordar; `npm run check` e o build verificam isso.
- Registre novidades, correções, compatibilidade, atualização e limites no
  [CHANGELOG](CHANGELOG.md). Não coloque histórico de releases no corpo da skill.
- Não há atualização automática silenciosa. A pessoa escolhe a versão e reinstala
  pelo comando com tag ou pelo ZIP. Preservar escopo e agente; salvar edições locais.
- `skills check`/`skills update` seguem as regras do instalador, não um canal
  estável desta biblioteca. O caminho suportado para estabilidade é a tag explícita.

## Publicar a próxima versão

1. Alterar versão no pacote, nos dois campos do lockfile e em
   `skills/g3-design/SKILL.md`. Atualizar versão/URLs nos READMEs PT/EN e notas.
2. Executar `npm run check`, `npm run test:release`, `npm run build`,
   `npm run test:demo`, o fiscal e as contraprovas Python descritos no README.
   Mudança visual exige capturas; versão do banner deve corresponder à release.
   Conferir segredos, licenças e diff antes do envio.
3. Fazer commit dos fontes e arquivos compilados. Confirmar árvore limpa, conta e
   remoto corretos. A autorização para publicar pertence à tarefa do mantenedor.
4. Criar a tag anotada no commit auditado e enviar commit e tag. Não usar force.
   Se a tag já existir, conferir a revisão e interromper em caso de divergência.
5. Gerar o ZIP apenas da skill com Git, usando a tag. Exemplo para esta release:

   ```sh
   git archive --format=zip --prefix=g3-design/ --output=g3-design-v1.1.0.zip v1.1.0:skills/g3-design
   ```

6. Descompactar em pasta temporária e conferir conteúdo, versão e fiscal. Gerar
   SHA-256 do ZIP em `SHA256SUMS.txt`; manter os artefatos fora do repositório.
7. Criar release em rascunho com `gh release create`, `--verify-tag`, `--draft` e
   `--notes-file`, anexando ZIP e checksum. Conferir a revisão e os dois anexos;
   publicar e marcar como Latest. Não incluir arquivos do computador do mantenedor.
8. Testar o comando público com a URL da tag em projeto descartável. Baixar o ZIP
   publicado, conferir SHA-256 e conteúdo. Conferir versão/comandos no Pages.

Uma falha interrompe a publicação. Se ocorrer depois de publicada, documentar o
problema e preparar uma nova versão; manter a anterior identificável para retorno.

## English summary

Use semantic versions: patch for compatible fixes, minor for compatible features,
major for breaking changes. `main` is development; annotated `vX.Y.Z` tags identify
tested releases. Never move a published tag or replace its assets. Record changes
and upgrade notes outside `SKILL.md`. Release identity and installation commands
are checked before build. Publish only the skill directory, with SHA-256, then
verify the public tag installation and downloaded asset. Updates are explicit;
reinstall the chosen release while preserving agent/scope and saving local edits.

References: [SemVer](https://semver.org/), [GitHub releases](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository), [installer commands](https://github.com/vercel-labs/skills/blob/main/docs/commands.md).
