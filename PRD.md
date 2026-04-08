# PRD - Vitrine CG

## 1. Visão Geral do Produto
A **Vitrine CG** é uma plataforma de marketplace (shopping virtual) focada no comércio local de Campina Grande. O objetivo é permitir que múltiplos lojistas cadastrem seus estabelecimentos e produtos, oferecendo aos consumidores uma interface centralizada para busca, navegação e contato direto via WhatsApp.

## 2. Personas (Perfis de Usuário)

### 2.1 Administrador (Admin)
- Gerencia a plataforma como um todo.
- Aprova e gerencia contas de lojistas.
- Gerencia planos, destaques e categorias globais.
- Monitora estatísticas básicas de acesso.

### 2.2 Lojista
- Cadastra e gerencia o perfil de sua loja (Logo, Capa, Redes Sociais, WhatsApp).
- Cadastra e gerencia seu catálogo de produtos (Preços, Descrições, Imagens).
- Recebe contatos de clientes diretamente no WhatsApp configurado.

### 2.3 Consumidor (Visitante)
- Navega pela plataforma sem necessidade obrigatória de login.
- Busca produtos e lojas por nome ou categoria.
- Visualiza detalhes de produtos e lojas.
- Inicia conversas no WhatsApp com os lojistas.

## 3. Requisitos Funcionais

### 3.1 Gestão de Autenticação
- Login/Cadastro para Lojistas e Admins (JWT).
- Controle de acesso baseado em funções (Admin, Lojista).

### 3.2 Gestão de Lojas (Dashboard Lojista)
- Cadastro de Loja: Nome, Slug, Descrição, WhatsApp.
- Upload de Logo e Imagem de Capa.
- Configuração de links de redes sociais.

### 3.3 Catálogo de Produtos (Dashboard Lojista)
- CRUD de produtos (Nome, Descrição, Preço, Categoria).
- Upload de imagens para cada produto.

### 3.4 Experiência do Consumidor (Público)
- **Home:** Exibição de lojas e produtos em destaque.
- **Busca:** Filtros por nome e categoria.
- **Loja:** Página dedicada com todos os produtos do lojista.
- **WhatsApp:** Integração para envio de mensagens diretas.

## 4. Requisitos Técnicos (Stack)
- **Backend:** FastAPI (Python) + SQLAlchemy (PostgreSQL).
- **Frontend:** Next.js 15 (React) + Tailwind CSS.
- **Storage:** MinIO (Arquivos e imagens).
- **Infra:** Docker & Traefik.

## 5. Roadmap
- Integração com gateways de pagamento (Stripe/Asaas).
- Sistema de avaliações de lojas.
- App mobile nativo.

---
*Gerado por Antigravity para uso no Claude.ai.*
