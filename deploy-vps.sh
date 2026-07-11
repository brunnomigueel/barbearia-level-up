#!/bin/bash
set -e

echo "🚀 Iniciando Setup da Infraestrutura Barbeiros..."

# 1. Preparar pastas
mkdir -p /opt/infra
cd /opt/infra

# 2. Criar docker-compose.yml
cat << 'EOF' > docker-compose.yml
version: '3.8'

services:
  app:
    build:
      context: https://github.com/brunnomigueel/barbearia-level-up.git#main
    container_name: app-barbearia
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000

  n8n:
    image: docker.n8n.io/n8nio/n8n
    container_name: n8n
    restart: unless-stopped
    ports:
      - "5678:5678"
    environment:
      - N8N_HOST=n8n.brunnos.com.br
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - NODE_ENV=production
      - WEBHOOK_URL=https://n8n.brunnos.com.br/
      - GENERIC_TIMEZONE=America/Sao_Paulo
    volumes:
      - n8n_data:/home/node/.n8n

  npm:
    image: 'jc21/nginx-proxy-manager:latest'
    container_name: nginx-proxy
    restart: unless-stopped
    ports:
      - '80:80'
      - '81:81'
      - '443:443'
    volumes:
      - npm_data:/data
      - npm_letsencrypt:/etc/letsencrypt

volumes:
  n8n_data:
  npm_data:
  npm_letsencrypt:
EOF

echo "📦 Subindo todos os containeres (App, n8n, Nginx Proxy Manager)..."
docker compose up -d --build

echo "✅ Sucesso! Infraestrutura no ar."
echo "🌐 Acesse o painel do Nginx Proxy Manager em: http://<seu-ip>:81"
echo "👉 Login padrão: admin@example.com / changeme"
