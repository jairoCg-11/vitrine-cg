# Vitrine CG

Shopping virtual popular de Campina Grande — marketplace com múltiplas lojas.

## Perfis
- **Admin** — gerencia lojistas, planos e destaques
- **Lojista** — cadastra loja, produtos e preços
- **Consumidor** — navega, busca e contata lojistas via WhatsApp

## Stack
- **Frontend:** Next.js + Tailwind CSS
- **Backend:** Node.js + NestJS
- **Banco:** PostgreSQL 15
- **Storage:** MinIO
- **Proxy:** Traefik v2
- **Deploy:** Docker Swarm (VPS Contabo)

## Desenvolvimento local
```bash
cp .env.example .env
# preencha o .env com suas credenciais locais
docker compose -f docker/development/docker-compose.dev.yml up -d
```

## Estrutura
```
vitrine-cg/
├── apps/
│   ├── frontend/    # Next.js
│   └── backend/     # NestJS
├── packages/        # tipos compartilhados
├── docker/
│   ├── development/ # compose local
│   └── production/  # compose Swarm
└── .env.example
```
