# Site de casamento — Cottagecore

Starter em Next.js + TypeScript para um site de casamento colaborativo.

## Requisitos

- Node.js 20.9 ou superior
- npm, pnpm, yarn ou bun

## Rodar localmente

```bash
npm install
npm run dev
```

Abra http://localhost:3000.

## Personalização rápida

Altere `src/data/site.ts` para definir:

- nomes do casal
- data
- local
- subtítulo

As imagens de demonstração ficam em `public/images` e podem ser substituídas por JPG, PNG, WebP ou AVIF.

## Já implementado

- Home responsiva
- carrossel automático e manual
- galeria clicável com lightbox
- página de vestimenta Cottagecore
- página de presentes
- interface inicial para token/upload
- paleta e tipografia da identidade visual

## Próxima etapa

Conectar Supabase:

1. Banco `upload_tokens`
2. Banco `photos`
3. Storage bucket de fotos
4. validação de token no servidor
5. URL assinada para upload direto
6. tela de moderação/aprovação
