# PRD - Vitrine CG

## 1. Visão Geral do Produto

A **Vitrine CG** é uma plataforma de marketplace (shopping virtual) focada no comércio local de Campina Grande - PB. O objetivo é permitir que múltiplos lojistas cadastrem seus estabelecimentos e produtos, oferecendo aos consumidores uma interface centralizada, moderna e responsiva para busca, navegação e contato direto via WhatsApp.

---

## 2. Personas (Perfis de Usuário)

### 2.1 Administrador (Admin)

- Gerencia a plataforma como um todo.
- Gere usuários e níveis de acesso.
- Controla os planos de assinatura (Grátis, Básico, Premium).
- Gerencia banners de publicidade (carrossel hero) e destaques na home.
- **Novo:** Monitora métricas de acesso globais e de lojistas.

### 2.2 Lojista

- Cadastra e gerencia o perfil de sua loja (Logo, Capa, Redes Sociais, WhatsApp).
- Gerencia o catálogo de produtos (CRUD completo com upload de imagens).
- Acompanha o status de seu plano e visibilidade na plataforma.
- **Novo:** Visualiza métricas básicas de desempenho (visualizações e cliques no WhatsApp).
- Recebe contatos de clientes diretamente no WhatsApp configurado.

### 2.3 Consumidor (Visitante)

- Navega pela plataforma (mobile-first) sem necessidade de login.
- Busca produtos e lojas por nome, categoria ou relevância.
- Visualiza detalhes de produtos com layout estilo e-commerce.
- Inicia conversas no WhatsApp com lojistas com um clique.

---

## 3. Requisitos Funcionais

### 3.1 Autenticação e Segurança

- Login/Cadastro baseado em **JWT** (expiração de 7 dias).
- Controle de acesso baseado em funções (**RBAC**): Admin, Lojista e Consumidor.
- **Melhoria:** Integridade referencial com exclusão em cascata para usuários, lojas e produtos.

### 3.2 Painel do Lojista (Dashboard)

- Gestão de Loja: Nome, Slug único, Descrição, WhatsApp e links sociais.
- Branding: Upload de Logo e Imagem de Capa com feedback visual.
- Catálogo: Gestão de produtos (Nome, Descrição, Preço, Categoria) e múltiplas imagens.
- **Analytics:** Registro de eventos de visualização e cliques para mensuração de ROI.
- **UX:** Botão flutuante de edição rápida diretamente na página pública da loja (apenas para o dono).

### 3.3 Painel Administrativo

- Monitoramento de usuários e lojas.
- Gestão de banners para monetização no carrossel principal.
- **Ordenação:** Reordenação intuitiva de banners via Drag-and-Drop.
- Configuração de lojas em destaque (Seção "Lojas em Destaque" na Home).

### 3.4 Experiência do Consumidor

- **Home Dinâmica:** Carrossel de banners, lojas premium em destaque e busca rápida.
- **Navegação Fluida:** Implementação de **Loading Skeletons** para evitar layout shift.
- **Tratamento de Erros:** Captura global de exceções com interface amigável (`error.tsx`).
- **Página de Produto:** Layout detalhado focado em conversão.
- **Página de Loja:** Identidade visual completa do lojista com sua vitrine de produtos.

### 3.5 SEO e Performance

- **Metadados Dinâmicos:** Títulos e descrições otimizados por página.
- **Sitemap & Robots:** Geração automática para indexação em buscadores.
- **Otimização de Imagens:** Compressão automática via backend (Pillow).

---

## 4. Requisitos Técnicos (Stack)

### 4.1 Tecnologias Core

- **Frontend:** Next.js 16 (App Router) + Tailwind CSS 4 + TypeScript.
- **Backend:** FastAPI (Python) + SQLAlchemy + Alembic.
- **Banco de Dados:** PostgreSQL 15.
- **Storage:** MinIO (S3 compatible) para imagens e arquivos.

### 4.2 Infraestrutura e DevOps

- **Proxy/Ingress:** Traefik v2 com suporte a HTTPS (Let's Encrypt).
- **Deployment:** Docker Swarm em VPS (Contabo).
- **CI/CD:** GitHub Actions para deploy automatizado em produção.

---

## 5. Roadmap

### Fase 1: Concluída (Fundação e Estabilidade)

- [x] Implementação de **Loading Skeletons** para transições fluidas.
- [x] Tratamento global de erros com `error.tsx`.
- [x] Reordenação de banners via Drag-and-Drop no painel admin.
- [x] Sistema de rastreamento de eventos (Views/Clicks).
- [x] Estabilização do banco de dados (Cascading Deletes).

### Fase 2: Futuro (Engajamento e Monetização)

- [ ] Sistema de avaliações e comentários para lojas.
- [ ] Dashboard de relatórios visuais para o Lojista (Gráficos de Analytics).
- [ ] Integração de pagamento (Stripe/Asaas) para automação de planos.
- [ ] Monitoramento proativo com Sentry (Opcional).
- [ ] Aplicativo mobile nativo.

---

#### Status do Documento

### _Atualizado em: 20/04/2026_
