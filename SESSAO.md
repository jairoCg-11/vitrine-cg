# Vitrine CG — Estado do Projeto

## O que é
Marketplace/shopping virtual popular de Campina Grande – PB.
URL produção: https://vitrine-cg.inovautomatica.com
API produção: https://api.vitrine-cg.inovautomatica.com
Storage:      https://storage.vitrine-cg.inovautomatica.com
Repositório:  https://github.com/jairoCg-11/vitrine-cg

## Stack
- Frontend: Next.js 16 + Tailwind CSS 4 + TypeScript
- Backend:  FastAPI (Python) + SQLAlchemy + Alembic
- Banco:    PostgreSQL 15
- Storage:  MinIO
- Infra:    Docker Swarm + Traefik v2 (VPS Contabo 134.255.182.114)

## Perfis
- Admin:      gerencia usuários, planos e banners
- Lojista:    cadastra loja e produtos
- Consumidor: navega e contata via WhatsApp

## Funcionalidades implementadas
- Auth completo (JWT 7 dias, RBAC)
- Dashboard lojista: CRUD loja, produtos, upload de imagens via MinIO
- Painel admin: gestão de usuários, planos (gratis/basico/premium) e banners
- Páginas públicas: home, /lojas, /lojas/[id], /lojas/[id]/produtos/[id], /busca
- Carrossel de banners no hero (monetização)
- Sistema de destaque: lojas premium aparecem em seção especial na home
- SEO: metadados dinâmicos, sitemap.xml, robots.txt, 404 customizado
- Deploy em produção com HTTPS via Traefik + Let's Encrypt
- CI/CD: GitHub Actions faz deploy automático no git push
- Responsividade mobile completa
- Compressão automática de imagens via Pillow
- Layout e-commerce na página do produto
- Loading skeletons nas páginas de lojas
- error.tsx global para erros inesperados
- Botão flutuante de edição na página da loja (só para o dono logado)
- Alerta de upload de fotos no dashboard do lojista

## Credenciais de acesso (produção)
- Admin: admin@vitrinecg.com / 524218Pb@

## Infra local
docker compose -f docker/development/docker-compose.dev.yml --env-file .env up -d
cd apps/frontend && npm run dev

## Deploy
git add . && git commit -m "tipo(escopo): descrição" && git push
# GitHub Actions cuida do resto automaticamente (~5 min)

## Pendentes
- Múltiplas imagens por produto
- Reordenar banners por drag-and-drop
- Sistema de avaliações de lojas
- Integração de pagamento (Stripe/Asaas)
- App mobile nativo
- Notificação de deploy falho (Slack/WhatsApp)
- Monitoramento de erros (Sentry)
