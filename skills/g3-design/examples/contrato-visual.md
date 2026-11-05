# Exemplo de contrato visual para uma mudança pequena

Projeto de exemplo com acervo de livros, pesquisa existente, componentes de
campo e botão e um catálogo de ícones já adotado.

## Pedido

Compactar a pesquisa no celular e corrigir sua borda cortada, seguindo G3 Design
e preservando o funcionamento da busca.

## Decisões verificáveis

| Parte | Fonte no destino | Comportamento esperado |
| --- | --- | --- |
| Campo | Componente compartilhado | Contorno, raio e foco pelos tokens locais |
| Lupa | Ícone Search disponível | Vetor original, cor do tema e nome acessível |
| Layout | Grade da tela | Texto flexível e ação numa coluna reservada |
| Ação secundária | Variante do botão existente | Recuos e altura da família; ícone cabe também no hover |
| Tema | Papéis existentes | Contorno reconhecível no claro e escuro |
| Conteúdo | Acervo do aplicativo | Títulos e exemplos pertencem a esse domínio |
| Prova | Runner do projeto | Texto longo/traduzido, foco, teclado, bordas, scroll e resize |

## Execução esperada

Corrigir o wrapper que recorta o foco. Reutilizar campo e ícone. Abrir pela
entrada real, medir a geometria e conferir as larguras em funcionamento.
Registrar causa, correção e limites, mantendo a arquitetura do destino.

## Contraprovas do recorte

- Parar o ponteiro junto à borda não deve alternar hover sem movimento.
- Sair e reentrar durante a pintura conserva a transição e termina sem máscara.
- Na menor largura e com rótulo traduzido, ícone e texto cabem nos recuos da peça.

O registro do destino liga sintoma → causa → peça reutilizada → prova executada.
Tempos e medidas continuam nos tokens/presets; não copie o exemplo como novo motor.
