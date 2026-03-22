# 🐳 Guia de Comandos Docker — Vitrine CG

## 📦 CONTAINERS

### Listar containers
```bash
# Containers rodando
docker ps

# Todos os containers (incluindo parados)
docker ps -a

# Formato resumido com portas
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

### Iniciar / Parar containers
```bash
# Subir containers em background
docker compose -f docker/development/docker-compose.dev.yml --env-file .env up -d

# Parar containers (preserva volumes e dados)
docker compose -f docker/development/docker-compose.dev.yml down

# Reiniciar um container específico
docker restart vitrine_cg_postgres

# Parar um container específico
docker stop vitrine_cg_postgres

# Iniciar um container parado
docker start vitrine_cg_postgres
```

### Remover containers
```bash
# Remove containers parados do vitrine-cg (preserva volumes)
docker compose -f docker/development/docker-compose.dev.yml down

# Remove containers parados de TODOS os projetos
docker container prune

# Remove um container específico (precisa estar parado)
docker rm vitrine_cg_postgres
```

---

## 🖼️ IMAGENS

### Listar imagens
```bash
# Todas as imagens
docker images

# Imagens sem uso (dangling)
docker images -f dangling=true
```

### Remover imagens
```bash
# Remove imagens sem uso (dangling) — seguro
docker image prune

# Remove TODAS as imagens não usadas por nenhum container
docker image prune -a

# Remove uma imagem específica
docker rmi postgres:15-alpine
```

---

## 💾 VOLUMES

### Listar volumes
```bash
# Todos os volumes
docker volume ls

# Volumes do vitrine-cg
docker volume ls | grep development
```

### Remover volumes
```bash
# ⚠️ CUIDADO — apaga os dados do banco!
# Remove volumes do vitrine-cg
docker compose -f docker/development/docker-compose.dev.yml down -v

# Remove volumes sem uso de todos os projetos
docker volume prune

# Remove um volume específico
docker volume rm development_postgres_data
```

---

## 🌐 REDES

### Listar redes
```bash
docker network ls
```

### Remover redes sem uso
```bash
docker network prune
```

---

## 🪵 LOGS
```bash
# Logs de um container
docker logs vitrine_cg_postgres

# Logs em tempo real
docker logs -f vitrine_cg_postgres

# Últimas 50 linhas
docker logs --tail 50 vitrine_cg_postgres

# Logs de todos os serviços do compose
docker compose -f docker/development/docker-compose.dev.yml logs -f
```

---

## 🔍 INSPECIONAR / DEBUGAR
```bash
# Acessar terminal do container PostgreSQL
docker exec -it vitrine_cg_postgres sh

# Acessar o psql dentro do container
docker exec -it vitrine_cg_postgres psql -U vitrine_user -d vitrine_cg

# Inspecionar detalhes de um container
docker inspect vitrine_cg_postgres

# Ver uso de CPU e memória em tempo real
docker stats

# Ver uso de disco do Docker
docker system df
```

---

## 🧹 LIMPEZA GERAL
```bash
# Remove tudo não utilizado: containers, redes e imagens (PRESERVA volumes)
docker system prune

# Remove tudo não utilizado INCLUINDO volumes — ⚠️ APAGA DADOS!
docker system prune --volumes

# Limpeza agressiva — use com cuidado em produção
docker system prune -a --volumes
```

---

## 🐝 DOCKER SWARM (Produção — VPS)
```bash
# Listar stacks ativas
docker stack ls

# Listar serviços de uma stack
docker stack services security-links

# Deploy de uma nova stack
docker stack deploy -c docker/production/docker-compose.prod.yml vitrine-cg

# Atualizar stack existente (mesmo comando)
docker stack deploy -c docker/production/docker-compose.prod.yml vitrine-cg

# Remover uma stack (preserva volumes)
docker stack rm vitrine-cg

# Ver logs de um serviço no Swarm
docker service logs vitrine-cg_backend -f

# Listar containers de um serviço no Swarm
docker service ps vitrine-cg_backend
```

---

## ⚡ ATALHOS ÚTEIS
```bash
# Para e remove todos os containers locais de uma vez
docker stop $(docker ps -q) && docker rm $(docker ps -aq)

# Remove todas as imagens não usadas
docker rmi $(docker images -q -f dangling=true)

# Reinicia todos os serviços do compose
docker compose -f docker/development/docker-compose.dev.yml restart
```

---

## 📋 ORDEM SEGURA DE LIMPEZA

Quando quiser liberar espaço em disco sem perder dados:

1. `docker container prune`  — remove containers parados
2. `docker image prune`      — remove imagens dangling
3. `docker network prune`    — remove redes sem uso
4. `docker image prune -a`   — remove imagens não usadas por containers ativos
5. `docker volume prune`     — ⚠️ só se tiver certeza que não precisa dos dados

