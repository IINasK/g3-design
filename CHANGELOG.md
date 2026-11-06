# Notas de versão / Release notes

## 1.2.0 — 2026-11-05

### Português

**Adicionado:** registro curto de aprendizados no projeto consumidor, sem editar
ou investigar a skill central durante a tarefa. Modelo portátil incluído.
Destino configurável pelas instruções locais ou `G3_DESIGN_RELATOS_DIR`, com
registro no próprio projeto quando o destino não estiver acessível.

**Manutenção:** fluxo de triagem, reprodução, decisão, validação e release no
repositório central. Relatos brutos permanecem locais e fora do Git; somente
melhorias generalizadas e provas com dados fictícios podem ser publicadas.

**Atualização:** reinstale pela tag v1.2.0 no comando do seu agente. Instalações
anteriores continuam funcionando, mas só recebem esta orientação ao atualizar.
Definir um destino não envia nada automaticamente nem concede acesso a arquivos.
Marca, caminhos do computador e dados dos projetos não entram no pacote portátil.
Sem mudanças no desenho, cores, tempos ou física do piloto.

### English

**Added:** concise feedback reports from host projects without interrupting their
tasks to edit the upstream skill; a portable report template and configurable
local destination via project instructions or `G3_DESIGN_RELATOS_DIR`, with a
host-project fallback when unavailable.

**Maintenance:** central triage, reproduction, decisions, validation and releases.
Raw reports remain local and Git-ignored; publish only generalized improvements
and synthetic evidence. Update explicitly using the v1.2.0 tag. No automatic
upload, access grant or visual/motion changes.

## 1.1.0 — 2026-11-05

Primeira release formal. Reúne a evolução publicada anteriormente em `main` com
o rótulo 1.0.0; aquela etapa não tinha tag nem release. O histórico Git permanece
disponível, sem criar números retroativos para cada commit.

### Português

**Adicionado**
- Quatro temas coordenados: Corporativo, Lavanda, Noite e Corporativo Escuro.
- Ondas com física de ponteiro/toque e pausa quando não estão visíveis.
- Pintura radial e seletor com cápsula deslizante, com motores portáteis incluídos.
- Política de versões, instalação por tag e ZIP da skill com checksum.

**Corrigido e refinado**
- Fechamento contrai no clique atual; teclado/Escape usam o controle da tela.
- Hover mantém a área clicável fixa, preserva a borda e limpa a máscara ao terminar.
- Ação de instalação reutiliza o botão, com recuos e seta alinhados em PT/EN.
- Guia principal mais curto; referências, exemplo e contraprovas separados por tarefa.
- Checagem impede divergência entre versão da skill, pacote, lockfile e comandos.

**Atualização e compatibilidade**
- Reexecute o comando do seu agente no [README](README.md#atualizar-uma-instalação-existente).
- Nome `g3-design` e temas `claro`/`escuro` preservados; salve adaptações locais antes.
- A atualização substitui a skill, não altera automaticamente interfaces existentes.
- Projeto em desenvolvimento; validação de navegador não comprova aparelho físico.

### English

**Added:** four coordinated themes; pointer/touch wave physics; portable radial
paint and sliding-selector engines; version policy, tag-pinned installation and
a skill-only ZIP with checksum.

**Fixed and refined:** closing at the current click; stable hover hit areas,
intact borders and mask cleanup; aligned installation action; smaller entrypoint
with task-specific references and regression scenarios; release consistency checks.

**Upgrade:** rerun your agent's command in the [README](README.en.md#update-an-existing-installation).
The skill name and `claro`/`escuro` identifiers remain compatible. Save local edits
first. Updating the skill does not automatically modify existing interfaces.
This is the first formal release; earlier 1.0.0-labelled development remains in
Git history. Active development; browser validation is not physical-device proof.
