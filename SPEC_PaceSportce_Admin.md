# SPEC — PaceSportce Admin Panel
> Fase 2 | Stack: Next.js 16 + Supabase + Supabase Auth
> Depende de: SPEC_PaceSportce.md (Fase 1)

---

## 1. VISÃO GERAL

Painel administrativo acessível em `/admin` para que a cliente gerencie a loja sem precisar de desenvolvedor. Login único por email/senha. Sem opção de cadastro de novos usuários.

Esta fase também migra os dados da loja de JSON local para o Supabase (banco de dados real + armazenamento de imagens).

---

## 2. STACK ADICIONADA

| Item | Escolha |
|---|---|
| Banco de dados | Supabase (PostgreSQL) |
| Armazenamento de imagens | Supabase Storage (bucket: `media`) |
| Autenticação | Supabase Auth (email + senha, usuário único) |
| Cliente Supabase no Next.js | `@supabase/ssr` |
| Validação de formulários | `react-hook-form` + `zod` |

---

## 3. VARIÁVEIS DE AMBIENTE

Criar arquivo `.env.local` na raiz do projeto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxx
SUPABASE_SERVICE_ROLE_KEY=xxxx
```

Criar também `.env.example` com as chaves sem valores (para commitar no Git).

---

## 4. BANCO DE DADOS — SCHEMA SQL (Supabase)

### 4.1 Tabela: categories

```sql
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  display_order INT DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed inicial
INSERT INTO categories (name, slug, display_order) VALUES
  ('Ciclismo', 'ciclismo', 1),
  ('Natação', 'natacao', 2),
  ('Corrida', 'corrida', 3);
```

### 4.2 Tabela: products

```sql
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  description TEXT,
  full_description TEXT,
  price INT NOT NULL,               -- em centavos (ex: 15990 = R$159,90)
  compare_at_price INT,             -- preço riscado
  images TEXT[] DEFAULT '{}',       -- array de URLs do Supabase Storage
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  stock INT DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'active',   -- active | inactive | draft
  condition VARCHAR(10) DEFAULT 'new',   -- new | used
  free_shipping BOOLEAN DEFAULT false,
  weight DECIMAL(8,3),              -- em kg
  length DECIMAL(8,2),              -- em cm
  width DECIMAL(8,2),               -- em cm
  height DECIMAL(8,2),              -- em cm
  specifications JSONB DEFAULT '[]',  -- [{label: string, value: string}]
  variants JSONB DEFAULT '[]',        -- [{name: string, options: string[]}]
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### 4.3 Tabela: banners

```sql
CREATE TABLE banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  title VARCHAR(200),
  subtitle TEXT,
  cta_text VARCHAR(100),
  cta_link VARCHAR(500),
  active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.4 Tabela: store_settings

```sql
CREATE TABLE store_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed: configurações iniciais
INSERT INTO store_settings (key, value) VALUES
  ('whatsapp', '5585999999999'),
  ('address', 'Rua Exemplo, 123 — Fortaleza, CE'),
  ('opening_hours', 'Seg a Sex: 9h–18h | Sáb: 9h–13h'),
  ('about_text', 'A PaceSportce é uma loja especializada em acessórios esportivos...'),
  ('instagram_handle', '@pacesportce'),
  ('instagram_token', ''),
  ('free_shipping_threshold', '0');  -- 0 = desativado, valor em centavos
```

### 4.5 Supabase Storage

Criar bucket `media` com as seguintes pastas:
- `media/products/` — imagens de produtos
- `media/banners/` — imagens de banners

Permissões do bucket:
- Leitura pública (anon pode ler)
- Escrita apenas autenticado (service role)

---

## 5. AUTENTICAÇÃO

### 5.1 Estratégia

Usar **Supabase Auth** com email + senha. O usuário admin é criado manualmente pelo desenvolvedor no painel do Supabase em **Authentication → Users → Invite user**. Não há tela de cadastro na aplicação.

### 5.2 Middleware de proteção

Criar `middleware.ts` na raiz do projeto:
- Todas as rotas `/admin/*` (exceto `/admin/login`) exigem sessão Supabase válida
- Usuário sem sessão é redirecionado para `/admin/login`
- Usuário autenticado tentando acessar `/admin/login` é redirecionado para `/admin`

### 5.3 Clientes Supabase

Criar três utilitários em `lib/supabase/`:
- `client.ts` — client-side (`createBrowserClient`)
- `server.ts` — server-side (`createServerClient` com cookies)
- `admin.ts` — service role para uploads (usa `SUPABASE_SERVICE_ROLE_KEY`)

---

## 6. ESTRUTURA DE ARQUIVOS (ADMIN)

```
app/
└── admin/
    ├── layout.tsx              ← layout do admin (sidebar + header)
    ├── page.tsx                ← redirect para /admin/dashboard
    ├── login/
    │   └── page.tsx            ← tela de login
    ├── dashboard/
    │   └── page.tsx            ← visão geral (contadores)
    ├── produtos/
    │   ├── page.tsx            ← lista de produtos
    │   ├── novo/
    │   │   └── page.tsx        ← formulário novo produto
    │   └── [id]/
    │       └── page.tsx        ← editar produto
    ├── categorias/
    │   └── page.tsx            ← lista + crud de categorias
    ├── banners/
    │   └── page.tsx            ← lista + crud de banners
    ├── configuracoes/
    │   └── page.tsx            ← configurações da loja
    └── frete/
        └── page.tsx            ← configuração global de frete

components/
└── admin/
    ├── AdminSidebar.tsx        ← menu lateral
    ├── AdminHeader.tsx         ← header com nome da página + botão sair
    ├── ProductForm.tsx         ← formulário completo de produto
    ├── ImageUploader.tsx       ← upload múltiplo para Supabase Storage
    ├── CategoryForm.tsx        ← formulário de categoria
    ├── BannerForm.tsx          ← formulário de banner
    └── ConfirmModal.tsx        ← modal de confirmação de exclusão

lib/
├── supabase/
│   ├── client.ts
│   ├── server.ts
│   └── admin.ts
├── queries/
│   ├── products.ts             ← CRUD de produtos (server actions)
│   ├── categories.ts           ← CRUD de categorias
│   ├── banners.ts              ← CRUD de banners
│   └── settings.ts             ← ler/atualizar configurações
└── utils/
    ├── slug.ts                 ← gerador de slug a partir do nome
    ├── price.ts                ← formatPrice (já existente)
    └── upload.ts               ← helper para upload no Supabase Storage
```

---

## 7. PÁGINAS DO ADMIN

### 7.1 Login `/admin/login`

- Logo PaceSportce centralizada
- Input email
- Input senha (com toggle show/hide)
- Botão "Entrar"
- Mensagem de erro se credenciais inválidas
- Sem link de "Criar conta"
- Fundo: #151515, card: #1e1e1e, bordas: #2a2a2a

### 7.2 Dashboard `/admin/dashboard`

Cards de contagem:
- Total de produtos ativos
- Total de categorias
- Total de banners ativos
- Produtos com estoque zerado (alerta visual)

### 7.3 Produtos `/admin/produtos`

**Lista:**
- Tabela com: imagem (thumb), nome, categoria, preço, status, estoque, frete grátis, ações
- Filtro por status (Todos / Ativo / Inativo / Rascunho)
- Filtro por categoria
- Busca por nome
- Botões de ação: Editar | Duplicar | Excluir
- Botão "Novo Produto" no canto superior direito

**Formulário (novo e editar):**

Organizado em seções:

1. **Informações básicas**
   - Nome (gera slug automaticamente)
   - Slug (editável)
   - Categoria (select)
   - Condição: Novo / Semi-novo
   - Status: Ativo / Inativo / Rascunho
   - Marcar como Destaque

2. **Preço e estoque**
   - Preço (input formatado em R$)
   - Preço promocional (opcional)
   - Estoque

3. **Descrição**
   - Descrição curta (preview — ~150 chars, textarea)
   - Descrição completa (textarea maior)

4. **Imagens**
   - Upload múltiplo via drag-and-drop ou clique
   - Preview das imagens carregadas
   - Reordenar por drag (primeira = imagem principal)
   - Remover imagem individual

5. **Frete**
   - Toggle: Frete grátis para este produto
   - Peso (kg)
   - Comprimento × Largura × Altura (cm)

6. **Especificações**
   - Lista dinâmica: campo Label + campo Valor
   - Botão "Adicionar especificação"
   - Remover linha individualmente

7. **Variantes** (opcional)
   - Nome da variante (ex: Tamanho) + opções separadas por vírgula
   - Botão "Adicionar variante"

### 7.4 Categorias `/admin/categorias`

- Lista em tabela: nome, slug, ordem, status, ações
- Formulário inline (ou modal): nome, ordem de exibição, ativa/inativa
- Slug gerado automaticamente a partir do nome
- Não permite excluir categoria que tem produtos vinculados

### 7.5 Banners `/admin/banners`

- Lista com preview da imagem, título, status, ordem
- Formulário:
  - Upload de imagem (Supabase Storage, pasta `banners/`)
  - Título (sobreposto na imagem)
  - Subtítulo
  - Texto do botão CTA
  - Link do botão CTA
  - Ordem de exibição
  - Ativo/Inativo

### 7.6 Configurações `/admin/configuracoes`

Formulário único com seções:

- **Contato:** WhatsApp, endereço, horário de funcionamento
- **Sobre:** Texto da seção "Sobre a PaceSportce"
- **Redes sociais:** @ do Instagram
- **Instagram API:** campo para colar o token (fase 3)

### 7.7 Frete `/admin/frete`

- Toggle: Habilitar frete grátis global acima de valor mínimo
- Input: Valor mínimo para frete grátis (R$)
- Informativo: "Produtos marcados como 'Frete Grátis' individual ignoram este valor mínimo"

---

## 8. MIGRAÇÃO DO FRONTEND DA LOJA

Atualizar os seguintes arquivos para buscar dados do Supabase em vez do JSON local:

| Arquivo | O que muda |
|---|---|
| `lib/products.ts` | `getAllProducts`, `getBySlug`, `getByCategory` passam a consultar Supabase |
| `lib/categories.ts` | Nova — busca categorias ativas ordenadas |
| `lib/banners.ts` | Nova — busca banners ativos ordenados |
| `lib/settings.ts` | Nova — busca configurações da loja |
| `components/home/HeroBanner.tsx` | Recebe dados do Supabase (banners) |
| `components/home/CategoryBar.tsx` | Recebe categorias do Supabase |
| `components/home/ProductGrid.tsx` | Recebe produtos do Supabase |
| `components/home/ContactSection.tsx` | Recebe whatsapp/endereço das settings |
| `components/home/AboutSection.tsx` | Recebe about_text das settings |

---

## 9. DESIGN DO ADMIN

- Fundo geral: `#0f0f0f`
- Sidebar: `#1a1a1a` com largura de 240px
- Cards/tabelas: `#1e1e1e`
- Bordas: `#2a2a2a`
- Texto: `#f4f4f4`
- Texto muted: `#888888`
- Cor de sucesso: `#22c55e`
- Cor de erro: `#ef4444`
- Cor de alerta: `#f59e0b`
- Botão primário: `bg-[#f4f4f4] text-[#151515]`

Sidebar — itens de navegação (com ícones lucide-react):
- Dashboard (LayoutDashboard)
- Produtos (Package)
- Categorias (Tag)
- Banners (Image)
- Frete (Truck)
- Configurações (Settings)
- Sair (LogOut)

---

## 10. SERVER ACTIONS

Usar Next.js Server Actions para todas as operações de escrita (criar, editar, excluir). Não criar API Routes separadas.

Padrão de retorno:
```typescript
type ActionResult = {
  success: boolean;
  error?: string;
  data?: unknown;
}
```

---

## 11. FASES ATUALIZADAS

| Fase | Entregável | Status |
|---|---|---|
| Fase 1 | Loja completa com mock JSON | ✅ Concluído |
| Fase 2 (atual) | Admin panel + Supabase + migração do frontend | 🔨 Em andamento |
| Fase 3 | Instagram API + formulário de contato | 🔜 |
| Fase 4 | Gateway de pagamento | 🔜 |

---

*Spec criado em: junho/2025 | Próxima revisão: antes da Fase 3*
