export type Category =
  | 'acessorios-bike'
  | 'acessorios-corrida'
  | 'acessorios-natacao'
  | 'suplementos'
  | 'pecas'
  | 'seminovas';

export interface Variant {
  id: string;
  name: string;
  options: string[];
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  fullDescription: string;
  specifications: { label: string; value: string }[];
  price: number;
  compareAtPrice?: number;
  images: string[];
  category: Category;
  tags: string[];
  variants?: Variant[];
  stock: number;
  featured: boolean;
  condition?: 'new' | 'used';
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  selectedVariant?: Record<string, string>;
}

export interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}
