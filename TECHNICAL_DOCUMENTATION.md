# Documentação Técnica - ABNP Admin Platform

## Índice
1. [Visão Geral da Arquitetura](#visão-geral-da-arquitetura)
2. [Pré-requisitos e Dependências](#pré-requisitos-e-dependências)
3. [Configuração do Ambiente](#configuração-do-ambiente)
4. [Database Schema](#database-schema)
5. [Sistema de Autenticação](#sistema-de-autenticação)
6. [Estrutura do Projeto](#estrutura-do-projeto)
7. [APIs e Endpoints](#apis-e-endpoints)
8. [Deployment](#deployment)
9. [Monitoramento e Logs](#monitoramento-e-logs)
10. [Manutenção](#manutenção)
11. [Troubleshooting](#troubleshooting)

## Visão Geral da Arquitetura

### Stack Tecnológico
- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Autenticação**: Supabase Auth (JWT)
- **Database**: PostgreSQL com Row Level Security (RLS)
- **Deploy**: Vite build estático

### Arquitetura de Alto Nível
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │───▶│   Supabase API  │───▶│   PostgreSQL    │
│   (Frontend)    │    │   (Backend)     │    │   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │                       ▼
         │              ┌─────────────────┐
         │              │  Edge Functions │
         │              │   (Serverless)  │
         └──────────────▶└─────────────────┘
```

## Pré-requisitos e Dependências

### Ambiente de Desenvolvimento
```bash
# Node.js (versão recomendada: 18+)
node --version  # >= 18.0.0
npm --version   # >= 9.0.0

# ou usar Bun (alternativa mais rápida)
bun --version   # >= 1.0.0
```

### Dependências Principais
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "typescript": "^5.0.0",
  "vite": "^5.0.0",
  "@supabase/supabase-js": "^2.57.4",
  "@tanstack/react-query": "^5.83.0",
  "react-router-dom": "^6.30.1",
  "tailwindcss": "^3.4.0"
}
```

## Configuração do Ambiente

### 1. Configuração do Supabase

#### Projeto Supabase
- **Project ID**: `wrtnpreotcryidsdxlpn`
- **URL**: `https://wrtnpreotcryidsdxlpn.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydG5wcmVvdGNyeWlkc2R4bHBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MTgzOTEsImV4cCI6MjA3NDI5NDM5MX0.7X9pKA0BCKz7c24XREStjAIH-AZKco8oDBccZjq8Z4Y`

#### Variáveis de Ambiente (.env)
```env
VITE_SUPABASE_PROJECT_ID="wrtnpreotcryidsdxlpn"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydG5wcmVvdGNyeWlkc2R4bHBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MTgzOTEsImV4cCI6MjA3NDI5NDM5MX0.7X9pKA0BCKz7c24XREStjAIH-AZKco8oDBccZjq8Z4Y"
VITE_SUPABASE_URL="https://wrtnpreotcryidsdxlpn.supabase.co"
```

### 2. Configuração Local

#### Instalação
```bash
# Clonar o repositório
git clone <YOUR_REPOSITORY_URL>
cd <PROJECT_NAME>

# Instalar dependências
npm install
# ou
bun install

# Executar em desenvolvimento
npm run dev
# ou
bun dev
```

#### Build de Produção
```bash
# Build
npm run build
# ou
bun run build

# Preview do build
npm run preview
# ou
bun preview
```

## Database Schema

### Enum Types
```sql
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
```

### Tabelas Principais

#### 1. profiles
```sql
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  display_name text,
  email_notifications boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

#### 2. user_roles
```sql
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
```

#### 3. settings
```sql
CREATE TABLE public.settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

#### 4. courses
```sql
CREATE TABLE public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  youtube_url text,
  thumbnail_url text,
  duration_minutes integer,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

#### 5. articles
```sql
CREATE TABLE public.articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text,
  excerpt text,
  content text,
  author text,
  featured_image_url text,
  external_url text,
  published_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

#### 6. offers
```sql
CREATE TABLE public.offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  original_price numeric,
  discount_percentage integer,
  discount_amount numeric,
  final_price numeric,
  coupon_code text,
  external_url text,
  valid_from timestamptz NOT NULL DEFAULT now(),
  valid_until timestamptz,
  max_uses integer,
  current_uses integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

#### 7. campaigns
```sql
CREATE TABLE public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subject text NOT NULL,
  content text NOT NULL,
  template text DEFAULT 'default',
  target_audience jsonb DEFAULT '{"all": true}',
  status text DEFAULT 'draft',
  scheduled_at timestamptz,
  sent_at timestamptz,
  sent_count integer DEFAULT 0,
  open_count integer DEFAULT 0,
  click_count integer DEFAULT 0,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

#### 8. messages
```sql
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  message_type text DEFAULT 'info',
  sender_id uuid NOT NULL,
  recipient_id uuid,
  is_broadcast boolean DEFAULT false,
  target_audience jsonb,
  is_read boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

#### 9. user_progress
```sql
CREATE TABLE public.user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  course_id uuid NOT NULL,
  current_video_id text,
  progress_percentage integer DEFAULT 0,
  last_position_seconds integer DEFAULT 0,
  watch_time_seconds integer DEFAULT 0,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

#### 10. video_sessions
```sql
CREATE TABLE public.video_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  video_id text NOT NULL,
  session_start timestamptz NOT NULL DEFAULT now(),
  session_end timestamptz,
  last_position_seconds integer NOT NULL DEFAULT 0,
  watch_time_seconds integer NOT NULL DEFAULT 0,
  video_duration_seconds integer,
  completion_percentage integer NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

### Funções de Database

#### 1. Verificação de Roles
```sql
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;
```

#### 2. Obter Role do Usuário
```sql
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role
      WHEN 'admin' THEN 1
      WHEN 'moderator' THEN 2
      WHEN 'user' THEN 3
    END
  LIMIT 1
$$;
```

#### 3. Trigger para Novos Usuários
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  
  -- Create default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

#### 4. Trigger para Updated_at
```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Aplicar em todas as tabelas relevantes
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ... (aplicar em todas as outras tabelas)
```

### Row Level Security (RLS) Policies

#### Profiles
```sql
-- Users can view their own profile
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);
```

#### User Roles
```sql
-- Users can view their own roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can manage all roles
CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (has_role(auth.uid(), 'admin'));
```

#### Settings
```sql
-- Admins can manage settings
CREATE POLICY "Admins can manage settings" ON public.settings
  FOR ALL USING (has_role(auth.uid(), 'admin'));
```

#### Courses
```sql
-- Anyone can view active courses
CREATE POLICY "Anyone can view active courses" ON public.courses
  FOR SELECT USING (is_active = true);
```

#### Articles
```sql
-- Anyone can view active articles
CREATE POLICY "Anyone can view active articles" ON public.articles
  FOR SELECT USING (is_active = true);
```

#### Offers
```sql
-- Anyone can view active offers
CREATE POLICY "Anyone can view active offers" ON public.offers
  FOR SELECT USING (is_active = true);

-- Admins can manage offers
CREATE POLICY "Admins can manage offers" ON public.offers
  FOR ALL USING (has_role(auth.uid(), 'admin'));
```

#### Campaigns
```sql
-- Admins can manage campaigns
CREATE POLICY "Admins can manage campaigns" ON public.campaigns
  FOR ALL USING (has_role(auth.uid(), 'admin'));
```

#### Messages
```sql
-- Users can view their messages
CREATE POLICY "Users can view their messages" ON public.messages
  FOR SELECT USING (
    (auth.uid() = recipient_id) OR 
    ((is_broadcast = true) AND (auth.uid() IS NOT NULL))
  );

-- Users can update their message status
CREATE POLICY "Users can update their message status" ON public.messages
  FOR UPDATE USING (auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = recipient_id);

-- Admins can manage all messages
CREATE POLICY "Admins can manage all messages" ON public.messages
  FOR ALL USING (has_role(auth.uid(), 'admin'));
```

#### User Progress
```sql
-- Users can view their own progress
CREATE POLICY "Users can view their own progress" ON public.user_progress
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own progress
CREATE POLICY "Users can insert their own progress" ON public.user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "Users can update their own progress" ON public.user_progress
  FOR UPDATE USING (auth.uid() = user_id);
```

#### Video Sessions
```sql
-- Users can view their own video sessions
CREATE POLICY "Users can view their own video sessions" ON public.video_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own video sessions
CREATE POLICY "Users can create their own video sessions" ON public.video_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own video sessions
CREATE POLICY "Users can update their own video sessions" ON public.video_sessions
  FOR UPDATE USING (auth.uid() = user_id);
```

## Sistema de Autenticação

### Configuração do Supabase Auth

#### Client Configuration
```typescript
// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://wrtnpreotcryidsdxlpn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydG5wcmVvdGNyeWlkc2R4bHBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MTgzOTEsImV4cCI6MjA3NDI5NDM5MX0.7X9pKA0BCKz7c24XREStjAIH-AZKco8oDBccZjq8Z4Y";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
```

### Hook de Autenticação Admin
```typescript
// src/hooks/useAuthAdmin.tsx
export interface AdminUser {
  user: User;
  role: 'admin' | 'moderator';
  isAdmin: boolean;
  isModerator: boolean;
}

export function useAuthAdmin() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          checkAuth();
        } else if (event === 'SIGNED_OUT') {
          setAdminUser(null);
          setLoading(false);
          navigate('/auth');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  async function checkAuth() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        setLoading(false);
        return;
      }

      const { data: roleData, error: roleError } = await supabase
        .rpc('get_user_role', { _user_id: session.user.id });

      if (roleError) {
        console.error('Error fetching user role:', roleError);
        navigate('/auth');
        setLoading(false);
        return;
      }

      if (!roleData || (roleData !== 'admin' && roleData !== 'moderator')) {
        navigate('/');
        setLoading(false);
        return;
      }

      setAdminUser({
        user: session.user,
        role: roleData,
        isAdmin: roleData === 'admin',
        isModerator: roleData === 'moderator'
      });
      
    } catch (error) {
      console.error('Auth check error:', error);
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  }

  return { adminUser, loading };
}
```

### Proteção de Rotas
```typescript
// src/components/admin/AdminProtectedRoute.tsx
export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { adminUser, loading } = useAuthAdmin();

  if (loading) {
    return <LoadingComponent />;
  }

  if (!adminUser) {
    return null; // useAuthAdmin handles navigation
  }

  return <>{children}</>;
}
```

### Fluxo de Autenticação

1. **Login/Signup**: `/auth`
2. **Verificação de Role**: Hook `useAuthAdmin`
3. **Redirecionamento**: 
   - Sem auth → `/auth`
   - User comum → `/`
   - Admin/Moderator → Acesso liberado

## Estrutura do Projeto

```
src/
├── components/
│   ├── admin/              # Componentes da área administrativa
│   │   ├── AdminHeader.tsx
│   │   ├── AdminLayout.tsx
│   │   ├── AdminProtectedRoute.tsx
│   │   └── AdminSidebar.tsx
│   └── ui/                 # Componentes UI (shadcn/ui)
│       ├── button.tsx
│       ├── card.tsx
│       ├── form.tsx
│       └── ...
├── hooks/
│   ├── useAuthAdmin.tsx    # Hook de autenticação admin
│   ├── use-mobile.tsx
│   └── use-toast.ts
├── integrations/
│   └── supabase/
│       ├── client.ts       # Cliente Supabase
│       └── types.ts        # Tipos TypeScript (auto-gerado)
├── lib/
│   └── utils.ts           # Utilitários
├── pages/
│   ├── admin/             # Páginas administrativas
│   │   ├── AdminArticles.tsx
│   │   ├── AdminCommunication.tsx
│   │   ├── AdminCourses.tsx
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminOffers.tsx
│   │   ├── AdminSettings.tsx
│   │   ├── AdminUsers.tsx
│   │   └── AdminWebhooks.tsx
│   ├── Auth.tsx           # Página de login/signup
│   ├── Index.tsx          # Página inicial
│   └── NotFound.tsx       # Página 404
├── App.tsx                # Componente principal
├── index.css             # Estilos globais + design system
└── main.tsx              # Entry point
```

### Design System

#### Configuração Tailwind (tailwind.config.ts)
```typescript
export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        // ... mais cores
      }
    }
  }
}
```

#### Tokens de Design (index.css)
```css
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 240 10% 3.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;
  --primary-foreground: 0 0% 98%;
  --secondary: 240 4.8% 95.9%;
  --secondary-foreground: 240 5.9% 10%;
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;
  --accent: 240 4.8% 95.9%;
  --accent-foreground: 240 5.9% 10%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 5.9% 90%;
  --input: 240 5.9% 90%;
  --ring: 240 5.9% 10%;
  --chart-1: 12 76% 61%;
  --chart-2: 173 58% 39%;
  --chart-3: 197 37% 24%;
  --chart-4: 43 74% 66%;
  --chart-5: 27 87% 67%;
  --radius: 0.5rem;
  
  /* Custom gradients */
  --gradient-subtle: linear-gradient(180deg, hsl(var(--background)), hsl(var(--muted)));
}

.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  /* ... modo escuro */
}
```

## APIs e Endpoints

### Supabase API Endpoints

#### Base URL
```
https://wrtnpreotcryidsdxlpn.supabase.co
```

#### Principais Endpoints

##### Auth
- `POST /auth/v1/signup` - Registro de usuário
- `POST /auth/v1/token?grant_type=password` - Login
- `POST /auth/v1/logout` - Logout
- `POST /auth/v1/recover` - Recuperação de senha

##### Database (REST API)
- `GET /rest/v1/profiles` - Listar perfis
- `POST /rest/v1/profiles` - Criar perfil
- `PATCH /rest/v1/profiles?id=eq.{id}` - Atualizar perfil
- `GET /rest/v1/courses` - Listar cursos
- `POST /rest/v1/courses` - Criar curso
- `GET /rest/v1/articles` - Listar artigos
- `GET /rest/v1/offers` - Listar ofertas

##### Headers Necessários
```
Authorization: Bearer {JWT_TOKEN}
apikey: {SUPABASE_ANON_KEY}
Content-Type: application/json
Prefer: return=representation
```

### Exemplos de Uso

#### Listar Cursos
```typescript
const { data: courses, error } = await supabase
  .from('courses')
  .select('*')
  .eq('is_active', true)
  .order('order_index');
```

#### Criar Artigo (Admin)
```typescript
const { data, error } = await supabase
  .from('articles')
  .insert({
    title: 'Novo Artigo',
    content: 'Conteúdo do artigo...',
    author: 'Autor',
    is_active: true
  });
```

#### Verificar Role do Usuário
```typescript
const { data: role, error } = await supabase
  .rpc('get_user_role', { _user_id: userId });
```

## Deployment

### 1. Build de Produção

```bash
# Instalar dependências
npm install

# Build
npm run build

# Resultado: pasta dist/ com arquivos estáticos
```

### 2. Deploy em Servidor Web

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    
    root /var/www/abnp-admin/dist;
    index index.html;
    
    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Gzip compression
    gzip on;
    gzip_types
        text/plain
        text/css
        text/js
        text/xml
        text/javascript
        application/javascript
        application/xml+rss;
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Apache Configuration
```apache
<VirtualHost *:80>
    ServerName seu-dominio.com
    DocumentRoot /var/www/abnp-admin/dist
    
    # SPA routing
    FallbackResource /index.html
    
    # Compression
    <IfModule mod_deflate.c>
        AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
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
    </IfModule>
</VirtualHost>
```

### 3. Deploy com Docker

#### Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### docker-compose.yml
```yaml
version: '3.8'
services:
  abnp-admin:
    build: .
    ports:
      - "80:80"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
```

### 4. Deploy em CDN/Static Hosting

#### Vercel
```json
// vercel.json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

#### Netlify
```toml
# netlify.toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 5. Configuração SSL
```bash
# Certbot (Let's Encrypt)
sudo certbot --nginx -d seu-dominio.com
```

## Monitoramento e Logs

### 1. Supabase Dashboard
- **URL**: https://supabase.com/dashboard/project/wrtnpreotcryidsdxlpn
- **Auth Users**: `/auth/users`
- **Database**: `/editor`
- **Logs**: `/logs`

### 2. Frontend Monitoring

#### Error Tracking
```typescript
// utils/errorTracking.ts
export function logError(error: Error, context?: string) {
  console.error(`[${context}]`, error);
  
  // Enviar para serviço de monitoramento
  // Ex: Sentry, LogRocket, etc.
}
```

#### Performance Monitoring
```typescript
// utils/performance.ts
export function trackPageLoad(page: string) {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  
  console.log(`Page Load: ${page}`, {
    loadTime: navigation.loadEventEnd - navigation.loadEventStart,
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    firstByte: navigation.responseStart - navigation.requestStart
  });
}
```

### 3. Database Monitoring

#### Queries Lentas
```sql
-- Ativar log de queries lentas
ALTER SYSTEM SET log_min_duration_statement = 1000; -- 1 segundo
SELECT pg_reload_conf();

-- Ver queries lentas
SELECT query, mean_time, calls
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

#### Connections
```sql
-- Conexões ativas
SELECT count(*) FROM pg_stat_activity;

-- Queries em execução
SELECT pid, now() - pg_stat_activity.query_start AS duration, query 
FROM pg_stat_activity 
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes';
```

## Manutenção

### 1. Backup do Banco de Dados

#### Backup Manual
```bash
# Via Supabase CLI
supabase db dump --db-url "postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres" > backup.sql

# Via pg_dump
pg_dump "postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres" > backup.sql
```

#### Backup Automatizado
```bash
#!/bin/bash
# backup-script.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/abnp-admin"
mkdir -p $BACKUP_DIR

# Database backup
pg_dump "postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres" > "$BACKUP_DIR/db_backup_$DATE.sql"

# Compress
gzip "$BACKUP_DIR/db_backup_$DATE.sql"

# Remove backups older than 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
```

#### Crontab
```bash
# Backup diário às 2:00 AM
0 2 * * * /path/to/backup-script.sh
```

### 2. Atualizações

#### Dependências
```bash
# Verificar dependências desatualizadas
npm outdated

# Atualizar dependências
npm update

# Atualização major (cuidado!)
npx npm-check-updates -u
npm install
```

#### Supabase
```bash
# Atualizar Supabase client
npm install @supabase/supabase-js@latest

# Verificar breaking changes na documentação
# https://supabase.com/docs/reference/javascript/upgrade-guide
```

### 3. Limpeza de Dados

#### Logs Antigos
```sql
-- Limpar logs de video sessions antigas (>90 dias)
DELETE FROM video_sessions 
WHERE created_at < NOW() - INTERVAL '90 days';

-- Limpar mensagens lidas antigas (>30 dias)
DELETE FROM messages 
WHERE is_read = true 
  AND created_at < NOW() - INTERVAL '30 days';
```

#### Usuários Inativos
```sql
-- Identificar usuários inativos (>1 ano sem login)
SELECT u.id, u.email, u.last_sign_in_at
FROM auth.users u
WHERE u.last_sign_in_at < NOW() - INTERVAL '1 year'
   OR u.last_sign_in_at IS NULL;

-- Scripts de limpeza devem ser executados manualmente
-- após verificação cuidadosa
```

### 4. Performance Optimization

#### Database Indexes
```sql
-- Adicionar índices para queries frequentes
CREATE INDEX CONCURRENTLY idx_articles_published 
ON articles(published_at) WHERE is_active = true;

CREATE INDEX CONCURRENTLY idx_user_progress_user_course 
ON user_progress(user_id, course_id);

CREATE INDEX CONCURRENTLY idx_video_sessions_user_video 
ON video_sessions(user_id, video_id);
```

#### Query Optimization
```sql
-- Analisar performance de queries
EXPLAIN ANALYZE 
SELECT * FROM courses WHERE is_active = true;

-- Vacuum e reindex
VACUUM ANALYZE;
REINDEX DATABASE postgres;
```

### 5. Security Checks

#### Passwords e Tokens
```bash
# Verificar se não há credenciais hardcoded
grep -r "password\|secret\|key" src/ --exclude-dir=node_modules

# Verificar .env não está no git
git status --ignored
```

#### RLS Policies
```sql
-- Verificar todas as políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';

-- Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND rowsecurity = false;
```

## Troubleshooting

### 1. Problemas Comuns

#### "User not found" após login
```typescript
// Verificar se o usuário tem perfil
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('user_id', user.id)
  .single();

if (!profile) {
  // Criar perfil manualmente
  await supabase.from('profiles').insert({
    user_id: user.id,
    display_name: user.email?.split('@')[0]
  });
}
```

#### RLS Policy Errors
```sql
-- Verificar políticas
SELECT * FROM pg_policies WHERE tablename = 'table_name';

-- Testar como usuário específico
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "user-uuid-here", "role": "authenticated"}';
SELECT * FROM table_name;
```

#### Connection Timeouts
```typescript
// Configurar timeout do cliente
const supabase = createClient(url, key, {
  db: {
    schema: 'public',
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  },
  global: {
    headers: { 'x-my-custom-header': 'my-app-name' },
  },
  realtime: {
    timeout: 30000, // 30 segundos
  }
});
```

### 2. Debug de Autenticação

#### Verificar Session
```typescript
const checkSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  console.log('Session:', session);
  console.log('Error:', error);
  
  if (session) {
    console.log('User:', session.user);
    console.log('Access Token:', session.access_token);
    console.log('Refresh Token:', session.refresh_token);
    console.log('Expires At:', new Date(session.expires_at! * 1000));
  }
};
```

#### Verificar Role
```typescript
const checkRole = async (userId: string) => {
  const { data, error } = await supabase
    .rpc('get_user_role', { _user_id: userId });
  
  console.log('Role:', data);
  console.log('Error:', error);
};
```

### 3. Debug de Database

#### Query Debugging
```typescript
// Ativar logs de query no cliente
const supabase = createClient(url, key, {
  db: {
    schema: 'public',
  },
  debug: true, // Ativa logs de debug
});
```

#### Connection Pool
```sql
-- Verificar conexões ativas
SELECT 
  state,
  count(*) 
FROM pg_stat_activity 
GROUP BY state;

-- Matar conexões ociosas
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle'
  AND state_change < current_timestamp - INTERVAL '5 minutes';
```

### 4. Performance Issues

#### Slow Queries
```sql
-- Encontrar queries lentas
SELECT 
  query,
  mean_time,
  calls,
  total_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

#### Memory Usage
```sql
-- Verificar uso de memória
SELECT 
  name,
  setting,
  unit,
  context
FROM pg_settings
WHERE name IN ('shared_buffers', 'work_mem', 'maintenance_work_mem');
```

### 5. Logs e Monitoramento

#### Frontend Errors
```typescript
// Error boundary
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Log para serviço de monitoramento
    logError(error, 'ErrorBoundary');
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    
    return this.props.children;
  }
}
```

#### Network Errors
```typescript
// Interceptar erros de rede
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT' && session === null) {
    // Verificar se foi logout voluntário ou erro de rede
    console.log('User signed out or session expired');
  }
});

// Retry mechanism
const retryOperation = async (operation: () => Promise<any>, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};
```

### 6. Emergency Procedures

#### Database Lock
```sql
-- Verificar locks
SELECT 
  blocked_locks.pid AS blocked_pid,
  blocked_activity.usename AS blocked_user,
  blocking_locks.pid AS blocking_pid,
  blocking_activity.usename AS blocking_user,
  blocked_activity.query AS blocked_statement,
  blocking_activity.query AS current_statement_in_blocking_process
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks ON blocking_locks.locktype = blocked_locks.locktype
  AND blocking_locks.DATABASE IS NOT DISTINCT FROM blocked_locks.DATABASE
  AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
  AND blocking_locks.page IS NOT DISTINCT FROM blocked_locks.page
  AND blocking_locks.tuple IS NOT DISTINCT FROM blocked_locks.tuple
  AND blocking_locks.virtualxid IS NOT DISTINCT FROM blocked_locks.virtualxid
  AND blocking_locks.transactionid IS NOT DISTINCT FROM blocked_locks.transactionid
  AND blocking_locks.classid IS NOT DISTINCT FROM blocked_locks.classid
  AND blocking_locks.objid IS NOT DISTINCT FROM blocked_locks.objid
  AND blocking_locks.objsubid IS NOT DISTINCT FROM blocked_locks.objsubid
  AND blocking_locks.pid != blocked_locks.pid
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.GRANTED;

-- Matar processo bloqueante (cuidado!)
SELECT pg_terminate_backend(pid);
```

#### Emergency Admin Access
```sql
-- Criar admin de emergência
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'emergency@admin.com',
  crypt('emergency_password_123', gen_salt('bf')),
  now(),
  now(),
  now()
);

-- Adicionar role de admin
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'emergency@admin.com';
```

### 7. Checklist de Saúde do Sistema

#### Diário
- [ ] Verificar logs de erro no Supabase Dashboard
- [ ] Verificar performance das queries principais
- [ ] Verificar espaço em disco do servidor
- [ ] Verificar certificados SSL

#### Semanal
- [ ] Backup do banco de dados
- [ ] Verificar atualizações de segurança
- [ ] Limpar logs antigos
- [ ] Verificar métricas de performance

#### Mensal
- [ ] Atualizar dependências
- [ ] Revisar políticas RLS
- [ ] Otimizar queries lentas
- [ ] Verificar crescimento do banco de dados

---

## Contatos e Suporte

### Recursos Oficiais
- **Supabase Docs**: https://supabase.com/docs
- **React Docs**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com/docs

### Informações do Projeto
- **Repositório**: [URL do repositório]
- **Deploy**: [URL de produção]
- **Supabase Project**: wrtnpreotcryidsdxlpn

Esta documentação deve ser atualizada sempre que houver mudanças significativas na arquitetura ou configuração do sistema.