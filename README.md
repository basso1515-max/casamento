# Site de Casamento — Estilo Cottagecore

Um site interativo, colaborativo e personalizado, desenvolvido para centralizar as informações do casamento e proporcionar uma experiência acolhedora aos convidados.

---

## Por que este projeto foi criado?

Organizar um casamento vai muito além de enviar convites: envolve compartilhar momentos, alinhar expectativas (como o *dress code*) e criar memórias inesquecíveis. 

A proposta deste site é ir além de uma simples página informativa:
- **Centralizar tudo em um só lugar:** Informações da cerimônia, lista de presentes e orientações sobre trajes.
- **Criar uma experiência colaborativa:** Permitir que os convidados enviem suas próprias fotos do grande dia diretamente no site, gerando um álbum coletivo e interativo.
- **Transmitir a essência do casal:** Design personalizado com estética *Cottagecore* (tons terrosos, elementos naturais e sensação de aconchego).

---

## O que foi feito & Funcionalidades

### Design & Identidade Visual
- **Estética Cottagecore:** Paleta de cores suave, tipografia delicada e layout responsivo ajustado para dispositivos móveis e desktop.

### Galeria & Experiência Visual
- **Home Responsiva:** Carrossel de fotos principal com navegação automática e manual.
- **Galeria de Fotos:** Grade interativa com visualização detalhada em *lightbox*.

### Páginas Informativas
- **Guia de Vestimenta (*Dress Code*):** Página dedicada a orientar os convidados sobre a paleta e estilo Cottagecore.
- **Lista de Presentes:** Seção organizada para direcionar os presentes do casal.

### Upload Colaborativo de Fotos (Em evolução)
- Interface pronta para recebimento de fotos enviadas pelos convidados via token único de acesso.

---

## Tecnologias Utilizadas

- **[Next.js](https://nextjs.org/)** — Framework React para alta performance e boa renderização.
- **[TypeScript](https://www.typescriptlang.org/)** — Tipagem estática para maior segurança e facilidade de manutenção.
- **CSS / Estilização customizada** — Fidelidade à identidade visual Cottagecore.

---

## Próximas Etapas (Back-end & Infraestrutura)

Para viabilizar o envio em tempo real das fotos dos convidados, a próxima fase é a integração com o **Supabase**:

1. **Modelagem de Dados:** Criação das tabelas `upload_tokens` e `photos`.
2. **Armazenamento de Mídia:** Configuração do *Storage Bucket* para guardar as imagens enviadas.
3. **Autenticação e Segurança:** Validação de tokens no servidor e geração de URLs assinadas para uploads diretos e seguros.
4. **Painel de Moderação:** Interface administrativa para aprovação prévia das fotos antes de exibí-las na galeria pública.

---

## Como Rodar o Projeto Localmente

### Requisitos
- **Node.js** `20.9` ou superior
- Gerenciador de pacotes (`npm`, `pnpm`, `yarn` ou `bun`)

### Passo a passo

1. **Instale as dependências:**
   ```bash
   npm install
