export interface Category {
  id: string;
  name: string;
  slug: string;
  display_order: number;
  active: boolean;
  created_at: string;
}

export interface VariantDimension {
  name: string;
  options: string[];
}

export interface VariantCombination {
  key: string;
  price: number | null;
}

export interface ProductVariants {
  dimensions: VariantDimension[];
  combinations: VariantCombination[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  description: string | null;
  full_description: string | null;
  price: number;
  compare_at_price: number | null;
  images: string[];
  category_id: string | null;
  category?: Category;
  tags: string[];
  stock: number;
  featured: boolean;
  status: 'active' | 'inactive' | 'draft';
  condition: 'new' | 'used';
  free_shipping: boolean;
  weight: number | null;
  length: number | null;
  width: number | null;
  height: number | null;
  specifications: { label: string; value: string }[];
  variants: ProductVariants;
  whatsapp_only: boolean;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  author_name: string;
  rating: number;
  comment: string | null;
  approved: boolean;
  created_at: string;
}

export interface ShippingAddress {
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface CheckoutCustomer extends ShippingAddress {
  name: string;
  email: string;
  phone: string;
  cpf: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  customer_cpf?: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
  tracking_code: string | null;
  notes: string | null;
  payment_id?: string | null;
  payment_method?: string | null;
  payment_status?: string | null;
  shipping_address?: ShippingAddress | null;
  shipping_cost?: number;
  shipping_carrier?: string | null;
  shipping_service?: string | null;
  melhor_envio_order_id?: string | null;
  label_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Banner {
  id: string;
  image_url: string;
  title: string | null;
  subtitle: string | null;
  cta_text: string | null;
  cta_link: string | null;
  active: boolean;
  display_order: number;
  created_at: string;
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  selectedVariant?: Record<string, string>;
  weight?: number | null;
  length?: number | null;
  width?: number | null;
  height?: number | null;
  free_shipping?: boolean;
}

export interface Shipping {
  company: string;
  service: string;
  price: number; // em centavos, consistente com o resto do app
  delivery_time: number;
  cep: string;
}

export type ActionResult<T = unknown> = {
  success: boolean;
  error?: string;
  data?: T;
};

export interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  shipping: Shipping | null;
  setShipping: (shipping: Shipping | null) => void;
  hydrated: boolean;
}
