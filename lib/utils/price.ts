export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

type PricedProduct = { price: number; compare_at_price: number | null };

// Preço realmente cobrado: quando "Preço Promocional" está preenchido, ele é o
// preço ativo — "Preço (R$)" vira só a referência riscada, não o contrário.
export function getActivePrice(product: PricedProduct): number {
  return product.compare_at_price && product.compare_at_price > 0
    ? product.compare_at_price
    : product.price;
}

// Preço de referência riscado (o "era") — null quando não há promoção.
export function getOriginalPrice(product: PricedProduct): number | null {
  return product.compare_at_price && product.compare_at_price > 0 ? product.price : null;
}
