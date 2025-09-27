# Guia de Deploy - ABNP Admin Platform

## Guia Rápido de Deploy

### 1. Pré-requisitos
- Servidor web (Nginx/Apache)
- Node.js 18+ (para build)
- Domínio configurado
- Certificado SSL

### 2. Deploy em 5 Passos

```bash
# 1. Build do projeto
npm install
npm run build

# 2. Upload da pasta dist/ para servidor
scp -r dist/ user@servidor:/var/www/abnp-admin/

# 3. Configurar servidor web (ver configurações abaixo)

# 4. Configurar SSL
sudo certbot --nginx -d seu-dominio.com

# 5. Testar
curl -I https://seu-dominio.com
```

## Configurações de Servidor Web

### Nginx
```nginx
server {
    listen 443 ssl http2;
    server_name seu-dominio.com;
    
    ssl_certificate /etc/letsencrypt/live/seu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com/privkey.pem;
    
    root /var/www/abnp-admin/dist;
    index index.html;
    
    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' https: data: 'unsafe-inline'" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # Cache HTML with short expiry
    location ~* \.html$ {
        expires 5m;
        add_header Cache-Control "public, must-revalidate";
    }
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name seu-dominio.com;
    return 301 https://$server_name$request_uri;
}
```

### Apache
```apache
<VirtualHost *:443>
    ServerName seu-dominio.com
    DocumentRoot /var/www/abnp-admin/dist
    
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/seu-dominio.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/seu-dominio.com/privkey.pem
    
    # SPA routing
    FallbackResource /index.html
    
    # Security headers
    Header always set X-Frame-Options SAMEORIGIN
    Header always set X-Content-Type-Options nosniff
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "no-referrer-when-downgrade"
    Header always set Content-Security-Policy "default-src 'self' https: data: 'unsafe-inline'"
    
    # Compression
    <IfModule mod_deflate.c>
        AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
    </IfModule>
    
    # Cache headers
    <IfModule mod_expires.c>
        ExpiresActive On
        ExpiresByType text/css "access plus 1 year"
        ExpiresByType application/javascript "access plus 1 year"
        ExpiresByType image/png "access plus 1 year"
        ExpiresByType image/jpg "access plus 1 year"
        ExpiresByType image/jpeg "access plus 1 year"
        ExpiresByType image/gif "access plus 1 year"
        ExpiresByType image/svg+xml "access plus 1 year"
        ExpiresByType font/woff "access plus 1 year"
        ExpiresByType font/woff2 "access plus 1 year"
        ExpiresByType text/html "access plus 5 minutes"
    </IfModule>
</VirtualHost>

<VirtualHost *:80>
    ServerName seu-dominio.com
    Redirect permanent / https://seu-dominio.com/
</VirtualHost>
```

## Deploy com Docker

### Dockerfile
```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy nginx configuration
COPY nginx.docker.conf /etc/nginx/conf.d/default.conf

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Add non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
USER nextjs

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### nginx.docker.conf
```nginx
server {
    listen 80;
    server_name _;
    
    root /usr/share/nginx/html;
    index index.html;
    
    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### docker-compose.yml
```yaml
version: '3.8'

services:
  abnp-admin:
    build: .
    container_name: abnp-admin
    ports:
      - "80:80"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    networks:
      - abnp-network

  # Opcional: Nginx Proxy Manager
  nginx-proxy:
    image: nginxproxymanager/nginx-proxy-manager:latest
    container_name: nginx-proxy
    ports:
      - "80:80"
      - "81:81"
      - "443:443"
    volumes:
      - ./nginx-proxy-data:/data
      - ./nginx-proxy-letsencrypt:/etc/letsencrypt
    restart: unless-stopped
    networks:
      - abnp-network

networks:
  abnp-network:
    driver: bridge
```

### Deploy com Docker
```bash
# Build e deploy
docker-compose up -d --build

# Verificar logs
docker-compose logs -f abnp-admin

# Atualizar
git pull
docker-compose down
docker-compose up -d --build
```

## Deploy em Cloud Providers

### Vercel
```json
{
  "name": "abnp-admin",
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

### Netlify
```toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"

[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### AWS S3 + CloudFront

#### S3 Bucket Policy
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::seu-bucket-name/*"
    }
  ]
}
```

#### CloudFront Distribution
```yaml
# cloudformation-template.yml
Resources:
  CloudFrontDistribution:
    Type: AWS::CloudFront::Distribution
    Properties:
      DistributionConfig:
        Origins:
          - DomainName: !GetAtt S3Bucket.DomainName
            Id: S3Origin
            S3OriginConfig:
              OriginAccessIdentity: !Sub "origin-access-identity/cloudfront/${OriginAccessIdentity}"
        Enabled: true
        DefaultRootObject: index.html
        CustomErrorResponses:
          - ErrorCode: 404
            ResponseCode: 200
            ResponsePagePath: /index.html
          - ErrorCode: 403
            ResponseCode: 200
            ResponsePagePath: /index.html
        DefaultCacheBehavior:
          TargetOriginId: S3Origin
          ViewerProtocolPolicy: redirect-to-https
          CachePolicyId: !Ref CachingOptimized
        PriceClass: PriceClass_100
        ViewerCertificate:
          AcmCertificateArn: !Ref SSLCertificate
          SslSupportMethod: sni-only
```

## Scripts de Deploy Automatizado

### deploy.sh
```bash
#!/bin/bash

set -e

echo "🚀 Iniciando deploy do ABNP Admin..."

# Configurações
PROJECT_NAME="abnp-admin"
BUILD_DIR="dist"
REMOTE_USER="deploy"
REMOTE_HOST="seu-servidor.com"
REMOTE_PATH="/var/www/abnp-admin"
BACKUP_DIR="/var/www/backups"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funções
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    log_error "package.json não encontrado. Execute o script na raiz do projeto."
    exit 1
fi

# Verificar Node.js
if ! command -v node &> /dev/null; then
    log_error "Node.js não está instalado."
    exit 1
fi

# 1. Instalar dependências
log_info "📦 Instalando dependências..."
npm ci --only=production

# 2. Build do projeto
log_info "🔨 Fazendo build do projeto..."
npm run build

# Verificar se o build foi criado
if [ ! -d "$BUILD_DIR" ]; then
    log_error "Build falhou. Diretório $BUILD_DIR não encontrado."
    exit 1
fi

# 3. Criar backup do deploy atual
log_info "💾 Criando backup do deploy atual..."
ssh $REMOTE_USER@$REMOTE_HOST "
    sudo mkdir -p $BACKUP_DIR
    if [ -d $REMOTE_PATH ]; then
        sudo cp -r $REMOTE_PATH $BACKUP_DIR/backup-\$(date +%Y%m%d_%H%M%S)
        # Manter apenas os 5 backups mais recentes
        sudo ls -t $BACKUP_DIR | tail -n +6 | sudo xargs -r rm -rf
    fi
"

# 4. Upload dos arquivos
log_info "📤 Fazendo upload dos arquivos..."
rsync -avz --delete $BUILD_DIR/ $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/

# 5. Ajustar permissões
log_info "🔐 Ajustando permissões..."
ssh $REMOTE_USER@$REMOTE_HOST "
    sudo chown -R www-data:www-data $REMOTE_PATH
    sudo chmod -R 755 $REMOTE_PATH
"

# 6. Recarregar servidor web
log_info "🔄 Recarregando servidor web..."
ssh $REMOTE_USER@$REMOTE_HOST "
    sudo nginx -t && sudo systemctl reload nginx
"

# 7. Verificar se o site está funcionando
log_info "🔍 Verificando se o site está online..."
if curl -f -s https://seu-dominio.com > /dev/null; then
    log_info "✅ Deploy concluído com sucesso!"
    log_info "🌐 Site disponível em: https://seu-dominio.com"
else
    log_error "❌ Site não está respondendo. Verifique os logs."
    exit 1
fi

echo
log_info "📊 Estatísticas do deploy:"
ssh $REMOTE_USER@$REMOTE_HOST "
    echo 'Arquivos no diretório:'
    find $REMOTE_PATH -type f | wc -l
    echo 'Tamanho total:'
    du -sh $REMOTE_PATH
"
```

### Executar deploy
```bash
chmod +x deploy.sh
./deploy.sh
```

### Deploy com GitHub Actions

#### .github/workflows/deploy.yml
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci --only=production
      
    - name: Build project
      run: npm run build
      
    - name: Deploy to server
      uses: easingthemes/ssh-deploy@main
      env:
        SSH_PRIVATE_KEY: ${{ secrets.SERVER_SSH_KEY }}
        REMOTE_HOST: ${{ secrets.REMOTE_HOST }}
        REMOTE_USER: ${{ secrets.REMOTE_USER }}
        SOURCE: "dist/"
        TARGET: "/var/www/abnp-admin"
        EXCLUDE: "/dist/, /node_modules/"
        SCRIPT_BEFORE: |
          sudo mkdir -p /var/www/backups
          if [ -d /var/www/abnp-admin ]; then
            sudo cp -r /var/www/abnp-admin /var/www/backups/backup-$(date +%Y%m%d_%H%M%S)
          fi
        SCRIPT_AFTER: |
          sudo chown -R www-data:www-data /var/www/abnp-admin
          sudo chmod -R 755 /var/www/abnp-admin
          sudo nginx -t && sudo systemctl reload nginx
          
    - name: Verify deployment
      run: |
        sleep 10
        curl -f https://seu-dominio.com || exit 1
        
    - name: Notify success
      if: success()
      run: echo "✅ Deploy successful!"
      
    - name: Notify failure
      if: failure()
      run: echo "❌ Deploy failed!"
```

### Secrets necessários para GitHub Actions
```
SERVER_SSH_KEY: Chave SSH privada para acesso ao servidor
REMOTE_HOST: IP ou domínio do servidor
REMOTE_USER: Usuário para SSH
```

## Monitoramento Pós-Deploy

### Health Check Script
```bash
#!/bin/bash
# health-check.sh

DOMAIN="https://seu-dominio.com"
EMAIL="admin@seu-dominio.com"

# Verificar se o site está online
if curl -f -s "$DOMAIN" > /dev/null; then
    echo "✅ Site online: $DOMAIN"
else
    echo "❌ Site offline: $DOMAIN"
    # Enviar notificação
    echo "Site $DOMAIN está offline!" | mail -s "ALERTA: Site offline" $EMAIL
    exit 1
fi

# Verificar certificado SSL
SSL_EXPIRY=$(echo | openssl s_client -servername $(echo $DOMAIN | sed 's|https://||') -connect $(echo $DOMAIN | sed 's|https://||'):443 2>/dev/null | openssl x509 -noout -dates | grep notAfter | cut -d= -f2)
SSL_EXPIRY_EPOCH=$(date -d "$SSL_EXPIRY" +%s)
CURRENT_EPOCH=$(date +%s)
DAYS_UNTIL_EXPIRY=$(( ($SSL_EXPIRY_EPOCH - $CURRENT_EPOCH) / 86400 ))

if [ $DAYS_UNTIL_EXPIRY -lt 30 ]; then
    echo "⚠️  Certificado SSL expira em $DAYS_UNTIL_EXPIRY dias"
    echo "Certificado SSL de $DOMAIN expira em $DAYS_UNTIL_EXPIRY dias" | mail -s "ALERTA: Certificado SSL" $EMAIL
fi

# Verificar tamanho dos logs
LOG_SIZE=$(du -sh /var/log/nginx/access.log 2>/dev/null | cut -f1)
echo "📊 Tamanho do log: $LOG_SIZE"

echo "✅ Health check concluído"
```

### Crontab para monitoramento
```bash
# Executar health check a cada 5 minutos
*/5 * * * * /path/to/health-check.sh

# Backup diário
0 2 * * * /path/to/backup-script.sh

# Renovar certificado SSL (Let's Encrypt)
0 3 * * 0 certbot renew --quiet
```

## Troubleshooting de Deploy

### Problemas Comuns

#### 1. "Cannot GET /" em rotas SPA
```nginx
# Certifique-se de ter o fallback para SPA
location / {
    try_files $uri $uri/ /index.html;
}
```

#### 2. Assets não carregam (404)
```bash
# Verificar permissões
sudo chown -R www-data:www-data /var/www/abnp-admin
sudo chmod -R 755 /var/www/abnp-admin

# Verificar estrutura de arquivos
ls -la /var/www/abnp-admin/
```

#### 3. Certificado SSL
```bash
# Verificar status do certificado
sudo certbot certificates

# Renovar manualmente
sudo certbot renew --force-renewal

# Verificar configuração nginx
sudo nginx -t
```

#### 4. Performance lenta
```bash
# Verificar compressão está habilitada
curl -H "Accept-Encoding: gzip" -I https://seu-dominio.com

# Verificar cache headers
curl -I https://seu-dominio.com/assets/index-abc123.js
```

### Logs Úteis
```bash
# Logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Logs do sistema
sudo journalctl -u nginx -f

# Verificar espaço em disco
df -h

# Verificar uso de memória
free -h
```

### Rollback Rápido
```bash
#!/bin/bash
# rollback.sh

BACKUP_DIR="/var/www/backups"
REMOTE_PATH="/var/www/abnp-admin"

# Listar backups disponíveis
echo "Backups disponíveis:"
ls -la $BACKUP_DIR

# Pegar o último backup
LAST_BACKUP=$(ls -t $BACKUP_DIR | head -1)

if [ -z "$LAST_BACKUP" ]; then
    echo "Nenhum backup encontrado!"
    exit 1
fi

echo "Fazendo rollback para: $LAST_BACKUP"

# Fazer backup do estado atual
sudo cp -r $REMOTE_PATH $BACKUP_DIR/before-rollback-$(date +%Y%m%d_%H%M%S)

# Restaurar backup
sudo rm -rf $REMOTE_PATH
sudo cp -r $BACKUP_DIR/$LAST_BACKUP $REMOTE_PATH

# Ajustar permissões
sudo chown -R www-data:www-data $REMOTE_PATH
sudo chmod -R 755 $REMOTE_PATH

# Recarregar nginx
sudo nginx -t && sudo systemctl reload nginx

echo "✅ Rollback concluído!"
```

---

Este guia fornece todas as informações necessárias para fazer deploy seguro e confiável do ABNP Admin Platform em qualquer ambiente de produção.