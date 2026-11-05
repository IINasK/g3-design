# Ícones e componentes

## Descobrir antes de criar

Procure imports, dependências, catálogos e componentes de uma tela equivalente.
Confira assinatura, consumidores e testes. Isso vale para ícones, campos,
calendários, seletores, popups, foco e navegação. Em interface nativa, procure
também os widgets e recursos já disponíveis na plataforma.

Para ícone ausente, use a família existente. Sem família adotada, confira catálogo
oficial e licença de opção adequada, como [Lucide](https://lucide.dev/) ou
[Material Symbols](https://developers.google.com/fonts/docs/material_symbols).
Escolha por compatibilidade com o desenho e a plataforma.

Registre origem oficial, identificador, revisão ou versão e licença no mecanismo
de atribuição do destino. Distribua LICENSE quando a licença exigir. Prefira
pacote instalado ou asset vetorial original. Um ícone isolado não justifica outra
biblioteca inteira. Uma seta comum não exige desenho novo. Símbolo exclusivo,
como uma marca solicitada, exige referência própria.

## Integrar sem deformar

- Preserve viewBox, proporção, fill-rule e caminhos. Ajuste tamanho pelo contêiner.
- Cor usa currentColor ou o papel equivalente da plataforma. Corrija o CSS que
  força fill num ícone de traço ou preenche os vazados de um ícone sólido.
- Tamanho visual e alvo são separados. Ícone pequeno pode ter alvo de 44px.
  A ação tem nome acessível e foco visível. Tooltip não substitui esse nome.
- Ícone decorativo fica fora da leitura e da sequência de foco.
- Renderizador sem SVG pode converter o asset oficial para formato suportado,
  com resolução e licença conferidas. Recorte de screenshot não é asset de UI.
- Fotografia e marca fornecidas podem ser assets. Borda, seta, sombra e texto
  do controle continuam implementados numa peça funcional.

Confira repouso, hover, pressão, seleção, foco e ambos os temas. Observe vazados,
nitidez, alinhamento e centro do alvo durante transformação e resize. Audite os
consumidores quando alterar o componente compartilhado.
