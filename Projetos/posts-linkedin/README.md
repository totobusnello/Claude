# Posts LinkedIn — Conteúdo de IA e Tecnologia

Conteúdo para posts no LinkedIn sobre inteligência artificial e tecnologia. Cada post é composto por texto editorial e imagem gerada por IA, seguindo um template de prompt padronizado para manter consistência de tom e formato. Os posts abordam tendências, ferramentas e reflexões sobre o impacto da IA no mercado.

## Estrutura

```
posts-linkedin/
├── prompt-template.md    # Template de prompt para geração de conteúdo
└── posts/
    └── {slug}/
        ├── post.txt      # Texto do post para LinkedIn
        ├── cover.png     # Imagem gerada por IA
        └── .status       # Status de publicação do post
```

## Fluxo de Criação

1. Definir tema e ângulo editorial
2. Aplicar o template em `prompt-template.md` para gerar o texto
3. Gerar imagem de capa via IA com prompt derivado do conteúdo
4. Publicar no LinkedIn e atualizar o `.status` do post

## Convenções

- Arquivos `.status` rastreiam se o post está em rascunho, agendado ou publicado
- Imagens seguem proporção padrão para feed do LinkedIn (1200x628px recomendado)
- Textos mantêm tom profissional com linguagem acessível

---

Desenvolvido por [totobusnello](https://github.com/totobusnello)
