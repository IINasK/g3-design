---
name: g3-design
description: >-
  Aplica e audita a linguagem visual G3 Design em interfaces web, desktop e móveis.
  Use quando o pedido citar G3 Design ou seu padrão de design, ou ao trabalhar numa
  interface que já o adota. Cobre componentes, campos, bordas, ícones, menus,
  responsividade, animação e defeitos de composição. A stack, a marca e os dados
  vêm do projeto de destino.
metadata:
  author: G3 Design
  version: "1.1.0"
---

# G3 Design

Aplique a identidade visual com os componentes e as regras do projeto de destino.
Este pacote é portátil: marca, dados, rotas e infraestrutura pertencem ao destino.
Não importe marca, conteúdo ou rotas de outro produto.

## Fluxo de trabalho

### 1. Localizar a fonte

Leia as instruções locais e identifique stack, entrada operacional, componentes,
tokens, ícones e testes da peça. Código aprovado define geometria, estados e
movimento. Screenshot ajuda a observar; não substitui a implementação executável.

### 2. Definir o recorte

Registre componente reutilizado, variante, estados e prova de conclusão no registro
já existente. O [exemplo de contrato visual](examples/contrato-visual.md) mostra o
nível necessário. Crie DESIGN.md somente quando um sistema novo precisar dele.

Leia apenas as referências pertinentes:

| Trabalho | Referência responsável |
| --- | --- |
| Identidade, materiais, tipografia e paleta | [Linguagem visual](references/linguagem-visual.md) |
| Campos, ações, bordas, recuos, ícones desalinhados ou popups | [Geometria](references/geometria.md) |
| Ondas, pintura radial, seletor, origem, tempos ou troca de tema | [Movimento e temas](references/movimento-e-temas.md) |
| Encontrar e integrar ícone ou componente | [Ícones e componentes](references/icones-e-componentes.md) |
| Conferir a entrega e escolher contraprovas | [Auditoria visual](references/auditoria-visual.md) |

Na adoção integral da identidade sem paleta própria, use os quatro temas dos
[papéis de cor](assets/papeis-de-cor.json). Preserve a paleta já aprovada do destino.
Valores e motores ficam nas fontes compartilhadas, não repetidos em cada tela.

### 3. Integrar a menor correção completa

Reutilize componente, adaptador, máscara e regra de negócio antes de criar outra
peça. Uma variante secundária muda a ênfase da ação; sua geometria continua a da
família escolhida. Corrija a fonte comum e confira os consumidores afetados.

Ícones vêm do catálogo adotado, com identificador, versão e licença registrados
no destino. Preserve o vetor e seus vazados. Símbolo próprio atende uma marca
solicitada; recorte de screenshot não compõe campo, ícone ou borda funcional.

Responsividade preserva legibilidade, foco e alvos de toque. Menus operacionais
preenchem a tela móvel com respiro e safe areas; seletores de cor ficam compactos.
Lógica visual não altera dados, cálculos ou condições de edição do projeto.

### 4. Verificar antes de concluir

Use a [auditoria](references/auditoria-visual.md) para reproduzir o defeito real,
comprovar a correção e testar os consumidores afetados. Build, AST ou classe CSS
isolada não demonstram aparência, continuidade, origem ou ausência de resíduos.

Ao incorporar um aprendizado, mantenha causa, regra reutilizável e prova na
referência responsável. Medidas particulares ficam no componente/preset do destino.
Não crie outra camada, regra por tela ou script quando a peça existente resolve.

## Conferência do pacote

Na pasta da skill, execute `python -B scripts/validar_pacote.py` com Python 3.9+.
Confere recursos, links Markdown, heurísticas de caminhos e pares de cor,
incluindo extremos dos degradês. Não certifica a interface gerada, portabilidade
completa, transparências ou segurança. Revise scripts de terceiros antes de usá-los.

Reutilize os testes e autorizações existentes. Enviar código ou imagens a serviço
externo exige autorização compatível; a skill não concede acesso nem publicação.
Conclua com mudanças, provas e limites observados, distinguindo emulação de aparelho
físico e análise estática de execução.
