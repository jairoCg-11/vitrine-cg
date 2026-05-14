# Vitrine CG — Estado do Projeto

## O que é

Marketplace/shopping virtual popular de Campina Grande – PB.
URL produção: https://vitrine-cg.inovautomatica.com
API produção: https://api.vitrine-cg.inovautomatica.com
Storage: https://storage.vitrine-cg.inovautomatica.com
Repositório: https://github.com/jairoCg-11/vitrine-cg

## Stack

- Frontend: Next.js 16 + Tailwind CSS 4 + TypeScript + Fontes: Syne + DM Sans
- Backend: FastAPI (Python) + SQLAlchemy + Alembic
- Banco: PostgreSQL 15
- Storage: MinIO
- Infra: Docker Swarm + Traefik v2 (VPS Contabo 134.255.182.114)

## Perfis

- Admin: gerencia usuários, planos, banners, moderação e analytics
- Lojista: cadastra loja e produtos
- Consumidor: navega e contata via WhatsApp

## Credenciais de acesso (produção)

- Admin: admin@vitrinecg.com / 524218Pb@
- Email notificações admin: jairomarques20@gmail.com
- Email SMTP: promonamedida@gmail.com

## Infra local

docker compose -f docker/development/docker-compose.dev.yml --env-file .env up -d
cd apps/frontend && npm run dev

## Deploy

git add . && git commit -m "tipo(escopo): descrição" && git push

# GitHub Actions cuida do resto automaticamente (~5 min)

## Estrutura de pastas importantes

apps/backend/app/
models/ — user, store, product, product_image, banner, store_event, password_reset_token, plan_limit
schemas/ — auth, store, product, public, admin, banner
services/ — auth, store, product, public, admin, analytics, banner, email, whatsapp, plan, storage
routers/ — auth, admin, stores, public, banner
limiter.py — slowapi rate limiting

apps/frontend/src/
app/
page.tsx — home com carrossel, stats animados, vitrine
termos/page.tsx — termos de uso público
contato/page.tsx — contato e suporte
lojas/[id]/page.tsx — página da loja pública
lojas/[id]/produtos/[productId]/page.tsx — produto estilo e-commerce
dashboard/page.tsx — painel do lojista
admin/page.tsx — painel admin
auth/login/page.tsx
auth/register/page.tsx — com popup de termos
auth/esqueci-senha/page.tsx
auth/redefinir-senha/page.tsx
dashboard/trocar-senha/page.tsx
components/
layout/Header.tsx — responsivo com hambúrguer
banner/HeroBanner.tsx — carrossel de banners
store/StoreCard.tsx — card de loja com WhatsApp tracking
store/StoreStats.tsx — estatísticas do lojista
store/StoreEditButton.tsx — botão flutuante para dono
store/PlanUsageBar.tsx — barra de uso do plano
store/WhatsAppButton.tsx — rastreia cliques
store/PendingStoreBanner.tsx — aviso de loja pendente
product/ProductImageCarousel.tsx — carrossel e-commerce
home/StatsCounter.tsx — contador animado
auth/TermsModal.tsx — modal de termos
admin/PendingStores.tsx — lojas aguardando aprovação
admin/PlanLimitsAdmin.tsx — configuração de limites
admin/GlobalAnalytics.tsx — métricas em tempo real
admin/AdminModerationPanel.tsx — moderação de conteúdo
ui/StoreSkeleton.tsx
ui/ProductSkeleton.tsx

## Migrations (em ordem)

995449898944 — cria tabelas users, stores, products
a1b2c3d4e5f6 — add sizes to products
b1c2d3e4f5a6 — cria tabela banners
c1d2e3f4g5h6 — cria tabela product_images
d1e2f3g4h5i6 — cria tabela store_events
e1f2g3h4i5j6 — adiciona terms_accepted_at e terms_ip em users
f1g2h3i4j5k6 — cascade na fk stores.owner_id
g1h2i3j4k5l6 — cascade na fk products.store_id
h1i2j3k4l5m6 — adiciona is_approved em stores
i1j2k3l4m5n6 — cria tabela password_reset_tokens
j1k2l3m4n5o6 — cria tabela plan_limits

## Funcionalidades implementadas

### Auth

- JWT 7 dias, RBAC (admin/lojista/consumidor)
- Trocar senha, esqueci senha, redefinir senha via email
- Tokens de reset persistidos no banco
- Rate limiting: login 10/min, register 5/h, forgot-password 3/h

### Lojista

- Cadastro com popup de termos (IP e data registrados)
- Aprovação pelo admin antes de aparecer publicamente
- Email de confirmação ao cadastrar
- Dashboard com stats, uso do plano, produtos
- CRUD loja: logo, capa, informações
- CRUD produtos com até 3 fotos por produto
- Toggle abrir/fechar loja
- Trocar senha no dashboard
- Alerta de upload de fotos pendentes
- Barra de uso do plano (X de Y produtos)

### Admin

- Painel com abas: Usuários, Banners, Lojas Pendentes, Configurações
- Gestão de usuários: bloquear, desbloquear, excluir (cascade)
- Gestão de planos: gratis/basico/premium com ciclo
- Limites de produtos por plano configuráveis
- Aprovação de lojas pendentes com email ao lojista
- Banners com drag-and-drop para reordenar
- Métricas globais: online agora, hoje, total, WhatsApp
- Moderação de conteúdo: excluir produtos, remover capa/logo
- Notificação por email quando nova loja cadastrada

### Público

- Home com carrossel de banners, stats animados, destaque premium
- Listagem de lojas com filtro por segmento
- Página da loja com capa, produtos, WhatsApp fixo mobile
- Página do produto estilo e-commerce com carrossel de fotos
- Busca global
- Rastreamento de visitas e cliques no WhatsApp
- Estatísticas por loja (7, 30, 90 dias)
- Página de termos de uso pública (/termos)
- Página de contato e suporte (/contato)

### SEO

- generateMetadata dinâmico por loja e produto
- sitemap.ts dinâmico
- robots.ts bloqueando /admin e /dashboard
- Open Graph para WhatsApp/redes sociais

### Infraestrutura

- Docker Swarm + Traefik v2 + HTTPS Let's Encrypt
- CI/CD GitHub Actions: push → build → SCP → deploy → migrations
- Backup automático do banco no MinIO às 3h30 (30 dias retenção)
- UptimeRobot monitorando frontend e API
- Rate limiting com slowapi
- Compressão automática de imagens (Pillow)
- WhatsApp pré-configurado (ativar com WHATSAPP_ENABLED=true)

## Variáveis de ambiente necessárias (.env)

POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD
MINIO_ACCESS_KEY, MINIO_SECRET_KEY, MINIO_BUCKET_PRODUTOS, MINIO_PUBLIC_URL
JWT_SECRET, JWT_EXPIRES_IN
MAIL_USERNAME, MAIL_PASSWORD
FRONTEND_URL
ADMIN_EMAIL=jairomarques20@gmail.com
ADMIN_WHATSAPP=
WHATSAPP_ENABLED=false
WHATSAPP_API_URL=

## VPS — caminhos importantes

/root/opt/vitrine-cg/.env — variáveis de ambiente
/root/opt/vitrine-cg/docker-compose.prod.yml — compose de produção
/root/scripts/backup-db.sh — script de backup
/root/scripts/backup.log — log do backup

## Próximos passos sugeridos

- Cadastrar 2-3 lojas reais com fotos para lançamento
- Ativar WhatsApp Business API quando disponível
- Sistema de avaliações de lojas
- Integração de pagamento para planos (Stripe/Asaas)
- App mobile nativo (React Native)
- Monitoramento de erros (Sentry)
