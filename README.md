# G3 V2 — Design Skill

**Projeto em desenvolvimento: uma linguagem de design limpa, elegante e moderna.**

Uma skill portátil para orientar agentes de IA na criação e revisão de interfaces
web, desktop e móveis. O foco é manter consistência visual, reutilizar componentes
existentes e adaptar a implementação à plataforma e à identidade de cada projeto.

## Proposta

- Interfaces com hierarquia clara, cantos arredondados e profundidade discreta.
- Campos, bordas e estados de foco com geometria consistente.
- Reutilização de bibliotecas de componentes e ícones oficiais licenciados.
- Temas claro e escuro por papéis semânticos, com atenção ao contraste.
- Responsividade, acessibilidade e animações com movimento reduzido.
- Auditoria da interface em execução, incluindo conteúdo longo e mudanças de largura.

A skill descobre a stack, a marca e os componentes do projeto de destino antes
de sugerir alterações. Sua base de cores e medidas é opcional: referências e
componentes já aprovados no destino têm precedência.

## Estado do projeto

**Em desenvolvimento ativo.** As instruções, referências e validações podem evoluir.
A versão inicial publicada é a **2.0.0**. As orientações não garantem, sozinhas,
qualidade visual, segurança ou desempenho: a interface produzida precisa ser
conferida no ambiente real de cada projeto.

## Instalação e uso

A pasta completa da skill é [`skills/g3-design-v2`](skills/g3-design-v2/SKILL.md).

1. Copie essa pasta para o diretório de skills reconhecido pelo seu agente.
2. Preserve `references`, `assets`, `examples`, `scripts` e `agents` junto de `SKILL.md`.
3. Invoque a skill pelo nome `g3-design-v2`, conforme o formato do agente.

Exemplo de pedido:

> Use a skill G3 V2 para revisar os campos e menus deste projeto. Preserve os
> componentes e ícones existentes, corrija os recortes de borda e confira o
> resultado no celular e no computador.

## Organização

```text
skills/g3-design-v2/
  SKILL.md                  Entrada e critérios de aplicação
  references/               Linguagem visual, geometria, ícones e auditoria
  assets/                   Papéis de cor opcionais
  examples/                 Exemplo de contrato visual
  agents/                   Metadados de descoberta
  scripts/                  Verificador estrutural do pacote
```

O pacote não exige framework específico nem dependências de infraestrutura.
Python 3.9 ou superior é necessário apenas para executar o verificador e os testes.

## Verificação

Na raiz deste repositório:

```console
python -B skills/g3-design-v2/scripts/validar_pacote.py
python -B -m unittest discover -s tests -p test_validar_pacote.py -v
```

O verificador confere recursos, referências Markdown, heurísticas de caminhos e
pares sólidos de cor. Não certifica a interface renderizada, transparências ou
ausência completa de acoplamento. Um teste de links simbólicos pode ser ignorado
explicitamente quando o sistema operacional não permitir criá-los.

## Origem

Desenvolvida a partir da linguagem visual G3 V2. Sua organização foi aprimorada
com uma análise da coleção [Stitch Skills](https://github.com/google-labs-code/stitch-skills)
e do formato de skills com referências carregadas conforme a necessidade.
Este projeto é independente e não possui vínculo oficial com Google ou Stitch.
