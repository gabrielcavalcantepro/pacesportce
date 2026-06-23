# SPEC — PaceSportce E-commerce
> Versão 1.0 | Stack: Next.js 14 | Dark Mode Only

---

## 1. VISÃO GERAL DO PROJETO

**Nome:** PaceSportce  
**Tipo:** Loja online de acessórios esportivos (estilo landing page)  
**Segmento:** Bicicleta, Natação, Corrida — acessórios, bicicletas novas/semi-novas e peças de reposição  
**Pagamento:** Não implementado na fase 1  
**Instagram:** Integração configurada em fase posterior  
**Painel de produtos:** Implementado em fase posterior  

---

## 2. STACK TÉCNICA

| Item | Escolha |
|---|---|
| Framework | Next.js 14 (App Router) |
| Linguagem | TypeScript |
| Estilização | Tailwind CSS |
| Estado global (carrinho) | React Context API |
| Dados de produtos (fase 1) | JSON mock local (`/lib/products.json`) |
| Fontes | Google Fonts via `next/font` |
| Imagens | `next/image` |
| Ícones | `lucide-react` |

---

## 3. DESIGN SYSTEM

### 3.1 Cores

```css
/* Cores principais — dark mode fixo */
--color-bg:        #151515;   /* fundo geral */
--color-surface:   #1e1e1e;   /* cards, modais, surfaces secundárias */
--color-border:    #2a2a2a;   /* bordas sutis */
--color-text:      #f4f4f4;   /* texto principal */
--color-muted:     #888888;   /* texto secundário / placeholders */
--color-accent:    #f4f4f4;   /* botões primários (branco sobre preto) */
--color-hover:     #ffffff;   /* estado hover nos textos/ícones */
```

> A loja é **exclusivamente dark**. Não implementar toggle de tema.

### 3.2 Tipografia

- **Títulos (H1/H2):** Montserrat — Bold / ExtraBold  
- **Corpo e UI:** Inter — Regular / Medium  
- **Tamanhos base:** seguir escala Tailwind (text-sm, text-base, text-lg, text-xl, text-2xl, text-4xl, text-6xl)

### 3.3 Espaçamento

- Padding de seções: `py-16` a `py-24`  
- Gap de grid: `gap-6` a `gap-8`  
- Bordas arredondadas: `rounded-lg` para cards, `rounded-full` para badges/pills

### 3.4 Botões

```
Primário:   bg-[#f4f4f4] text-[#151515] hover:bg-white — para CTAs principais
Secundário: border border-[#f4f4f4] text-[#f4f4f4] hover:bg-[#f4f4f4] hover:text-[#151515]
Ghost:      text-[#f4f4f4] underline — para links internos
```

---

## 4. ESTRUTURA DE ARQUIVOS

```
PaceSportce/
├── public/
│   └── assets/
│       ├── logo-branco.png
│       └── logo-preta.png   (não usada no dark mode, mas mantida)
│
├── app/
│   ├── layout.tsx            ← layout raiz (html, body, providers, font)
│   ├── page.tsx              ← Home (todas as seções)
│   ├── globals.css           ← variáveis CSS + reset
│   │
│   ├── produto/
│   │   └── [slug]/
│   │       └── page.tsx      ← Página do produto
│   │
│   ├── carrinho/
│   │   └── page.tsx          ← Carrinho
│   │
│   ├── politicas/
│   │   └── page.tsx          ← Políticas (privacidade, trocas, envio)
│   │
│   └── confirmacao/
│       └── page.tsx          ← Confirmação de pedido
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx        ← Logo + nav + ícone carrinho
│   │   └── Footer.tsx        ← Links + redes + copyright
│   │
│   ├── home/
│   │   ├── HeroBanner.tsx    ← Banner principal com CTA
│   │   ├── CategoryBar.tsx   ← Filtro de categorias
│   │   ├── ProductGrid.tsx   ← Grid de produtos (usa ProductCard)
│   │   ├── AboutSection.tsx  ← Seção "Sobre a PaceSportce"
│   │   ├── InstagramFeed.tsx ← Placeholder + futura integração real
│   │   └── ContactSection.tsx← Formulário + WhatsApp + mapa/endereço
│   │
│   ├── product/
│   │   ├── ProductCard.tsx   ← Card reutilizável no grid
│   │   ├── ProductImages.tsx ← Galeria de imagens do produto
│   │   └── AddToCart.tsx     ← Botão + seletor de quantidade/variante
│   │
│   └── cart/
│       ├── CartItem.tsx      ← Item individual no carrinho
│       └── CartSummary.tsx   ← Resumo + total + botão finalizar
│
├── context/
│   └── CartContext.tsx       ← Estado global do carrinho (React Context)
│
├── lib/
│   ├── products.json         ← Mock de produtos (fase 1)
│   ├── products.ts           ← Funções: getAll, getBySlug, getByCategory
│   └── types.ts              ← Interfaces TypeScript (Product, CartItem, etc.)
│
├── tailwind.config.ts
├── next.config.ts
└── tsconfig.json
```

---

## 5. PÁGINAS E SEÇÕES

### 5.1 Home `/`

Página única estilo landing page. Ordem das seções de cima para baixo:

| # | Seção | Componente | Descrição |
|---|---|---|---|
| 1 | Header | `Header.tsx` | Sticky. Logo à esquerda, nav no centro, ícone de carrinho com badge à direita |
| 2 | Hero Banner | `HeroBanner.tsx` | Imagem full-width, headline bold, subtítulo, botão CTA "Ver Produtos" |
| 3 | Barra de categorias | `CategoryBar.tsx` | Pills clicáveis: Todos / Bicicleta / Natação / Corrida / Semi-novas / Peças |
| 4 | Grid de produtos | `ProductGrid.tsx` | 3 colunas desktop, 2 tablet, 1 mobile. Filtrado pela categoria ativa |
| 5 | Sobre | `AboutSection.tsx` | Texto sobre a marca + 3 pilares (Qualidade / Variedade / Atendimento) |
| 6 | Instagram | `InstagramFeed.tsx` | Grid 3x2 de placeholders por ora. CTA "Seguir no Instagram" |
| 7 | Contato | `ContactSection.tsx` | Formulário (nome, e-mail, mensagem) + link WhatsApp + endereço/horário |
| 8 | Footer | `Footer.tsx` | Logo, links de política, redes sociais, copyright |

**Âncoras de navegação no Header:**
- `#produtos` → ProductGrid
- `#sobre` → AboutSection
- `#contato` → ContactSection

### 5.2 Página do Produto `/produto/[slug]`

- Galeria de imagens (principal + miniaturas)
- Nome, preço, descrição
- Seletor de variante (ex.: tamanho, cor) — se aplicável
- Botão "Adicionar ao Carrinho"
- Seção de produtos relacionados (mesma categoria)
- Breadcrumb: Home > Categoria > Nome do produto

### 5.3 Carrinho `/carrinho`

- Lista de itens (imagem, nome, preço, quantidade, subtotal)
- Controle de quantidade (+ / -)
- Remover item
- Resumo: subtotal, frete (a calcular / "consultar"), total
- Botão "Finalizar Pedido" → redireciona para `/confirmacao` (fase 1 sem pagamento)
- Botão "Continuar Comprando" → volta para Home

### 5.4 Políticas `/politicas`

Página única com três seções em tabs ou acordeão:
- Política de Privacidade
- Política de Troca e Devolução
- Política de Entrega e Frete

Conteúdo gerado como placeholder editável.

### 5.5 Confirmação `/confirmacao`

- Ícone de sucesso
- Mensagem: "Pedido recebido! Entraremos em contato em breve."
- Resumo do pedido
- Botão WhatsApp para confirmar/tirar dúvidas
- Botão "Voltar à loja"

---

## 6. MODELO DE DADOS

### 6.1 Product (TypeScript Interface)

```typescript
interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;              // em centavos (ex: 15990 = R$ 159,90)
  compareAtPrice?: number;    // preço riscado (promoção)
  images: string[];           // array de URLs/paths
  category: Category;
  tags: string[];
  variants?: Variant[];
  stock: number;
  featured: boolean;          // aparece em destaque no grid
  condition?: 'new' | 'used'; // para bicicletas semi-novas
}

type Category =
  | 'bicicleta'
  | 'natacao'
  | 'corrida'
  | 'bicicleta-nova'
  | 'bicicleta-seminova'
  | 'pecas';

interface Variant {
  id: string;
  name: string;     // ex: "Tamanho", "Cor"
  options: string[]; // ex: ["P", "M", "G"] ou ["Preto", "Branco"]
}
```

### 6.2 CartItem

```typescript
interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  selectedVariant?: Record<string, string>; // ex: { Tamanho: "M" }
}
```

---

## 7. ESTADO GLOBAL — CartContext

O carrinho vive em `context/CartContext.tsx` com as seguintes funções:

```typescript
interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;      // soma dos preços × quantidades
  itemCount: number;  // total de itens para o badge
}
```

**Persistência:** `localStorage` — o carrinho sobrevive ao fechar o browser.

---

## 8. MOCK DE PRODUTOS (fase 1)

Criar **8 produtos** de exemplo no `/lib/products.json` cobrindo as categorias:

| Qtd | Categoria | Exemplos |
|---|---|---|
| 2 | bicicleta | Capacete speed, Luva de ciclismo |
| 2 | natacao | Óculos de natação, Touca de silicone |
| 2 | corrida | Tênis de corrida (placeholder), Cinto de hidratação |
| 1 | bicicleta-seminova | Bicicleta MTB 2022 |
| 1 | pecas | Câmara de ar 29" |

---

## 9. INTEGRAÇÕES FUTURAS (não implementar na fase 1)

| Integração | Status | Observações |
|---|---|---|
| Instagram Feed | 🔜 Fase 2 | Instagram Basic Display API — placeholder visual no lugar |
| Pagamento | 🔜 Fase 3 | A definir (Stripe, Mercado Pago, etc.) |
| Painel de produtos | 🔜 Fase 4 | CRUD com autenticação admin |
| Envio de e-mail (contato) | 🔜 Fase 2 | Resend ou Nodemailer |

---

## 10. CONVENÇÕES DE CÓDIGO

- **Componentes:** PascalCase (`ProductCard.tsx`)
- **Funções/hooks:** camelCase (`useCart`, `getProductBySlug`)
- **CSS classes:** Tailwind utilitário direto no JSX (sem CSS Modules)
- **Imagens de produto (mock):** usar `https://placehold.co/600x600/1e1e1e/f4f4f4` com texto do produto
- **Textos em português** em toda a UI
- **`"use client"`** apenas nos componentes que usam hooks/eventos (não marcar tudo como client)

---

## 11. FASES DO PROJETO

| Fase | Entregável |
|---|---|
| **Fase 1 (atual)** | Estrutura completa Next.js + todas as páginas + mock de produtos + carrinho funcional |
| **Fase 2** | Instagram real + formulário de contato funcional (e-mail) |
| **Fase 3** | Gateway de pagamento |
| **Fase 4** | Painel admin para cadastro de produtos |

---

*Spec criado em: junho/2025 | Revisar antes de cada nova fase.*
