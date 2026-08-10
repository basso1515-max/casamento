# Site de casamento — Guilherme & Sabrina

Site em Next.js para reunir as informações do casamento e manter um álbum colaborativo de fotos com acesso individual por convidado.

## Funcionalidades

- Home responsiva, carrossel e galeria com lightbox
- Páginas de vestimenta e presentes
- Lista de presentes com link para loja e contribuições de experiência via PIX/QR Code
- Tokens individuais armazenados apenas como hash
- Sessões de convidado e administrador em cookies HTTP-only
- Upload múltiplo direto para o Supabase Storage por URL assinada
- Identificação de quem enviou cada foto e contador por convidado
- Limite opcional, ativação e desativação de tokens
- Painel administrativo para convidados, fotos e exclusões excepcionais

## Requisitos

- Node.js 20.9 ou superior
- npm
- Projeto Supabase
- Projeto Vercel vinculado a este repositório

## Configuração local

1. Instale as dependências:

   ```bash
   npm ci
   ```

2. Copie `.env.example` para `.env.local` e preencha:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJECT-REF.supabase.co
   SUPABASE_SECRET_KEY=sb_secret_...
   ADMIN_PASSWORD=uma-senha-administrativa-forte
   SESSION_SECRET=um-segredo-aleatorio-com-pelo-menos-32-caracteres
   PIX_KEY=chave-pix-exibida-aos-convidados
   PIX_RECIPIENT_NAME=nome-do-favorecido
   PIX_CITY=cidade-do-favorecido
   PIX_BANK=nome-do-banco
   SUPPORT_URL=https://wa.me/55DDDNUMERO
   ```

   `SUPABASE_SECRET_KEY`, `ADMIN_PASSWORD` e `SESSION_SECRET` são exclusivos do servidor e nunca devem ser enviados ao navegador ou versionados. Os dados PIX aparecem na página de presentes; `SUPPORT_URL` pode ser um link HTTPS (como WhatsApp) ou `mailto:`.

3. No Supabase, abra o SQL Editor e execute todo o arquivo `supabase-schema.sql`. Ele cria as tabelas `upload_tokens` e `photos`, as funções transacionais e o bucket público `casamento-fotos`.

4. Inicie o projeto:

   ```bash
   npm run dev
   ```

5. Abra `http://localhost:3000/admin/login` e entre com `ADMIN_PASSWORD`.

## Configuração na Vercel

Cadastre as variáveis da seção anterior em **Preview** e **Production**. Depois de criar ou alterar variáveis, gere um novo deployment: deployments existentes não recebem valores adicionados posteriormente.

O valor de `NEXT_PUBLIC_SUPABASE_URL` deve ser a URL do projeto, terminando em `.supabase.co`; `https://supabase.com` não é uma URL de projeto válida.

## Fluxo de uso

1. O administrador entra em `/admin/login`.
2. Informa o nome do convidado e, opcionalmente, um limite de fotos.
3. O painel gera um código e o link `/enviar?t=TOKEN`. O token em texto puro é mostrado somente nessa resposta; o banco armazena apenas seu hash.
4. O convidado abre o link, escolhe até 20 fotos por lote e envia diretamente ao Storage.
5. As fotos registradas aparecem automaticamente na galeria, sem fila de aprovação.

## Verificação

```bash
npm run lint
npm run build
```

Para confirmar a integração completa, gere um token de teste no painel, abra o link em uma sessão anônima ou no celular, envie uma foto e verifique sua exibição na Home.
