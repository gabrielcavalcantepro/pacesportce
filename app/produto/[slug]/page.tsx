import { notFound } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductImages from '@/components/product/ProductImages';
import AddToCart from '@/components/product/AddToCart';
import ProductCard from '@/components/product/ProductCard';
import DescriptionExpander from '@/components/product/DescriptionExpander';
import SpecsTable from '@/components/product/SpecsTable';
import { getProductBySlug, getRelatedProducts, getAllProducts, formatPrice } from '@/lib/products';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};
  return {
    title: `${product.name} — PaceSportce`,
    description: product.description,
  };
}

const categoryLabel: Record<string, string> = {
  'acessorios-bike':    'Acessórios Bike',
  'acessorios-corrida': 'Acessórios Corrida',
  'acessorios-natacao': 'Acessórios de Natação',
  'suplementos':        'Suplementos',
  'pecas':              'Peças',
  'seminovas':          'Oportunidades em Semi Novas',
};

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const related = getRelatedProducts(slug);
  const label = categoryLabel[product.category] ?? product.category;

  return (
    <>
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[#888888] mb-8 flex-wrap">
          <Link href="/" className="hover:text-[#f4f4f4] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/#produtos" className="hover:text-[#f4f4f4] transition-colors">
            {label}
          </Link>
          <span>/</span>
          <span className="text-[#f4f4f4] truncate">{product.name}</span>
        </nav>

        {/* Product detail */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
          <ProductImages images={product.images} name={product.name} />

          <div>
            <p className="text-xs font-semibold text-[#888888] uppercase tracking-wider mb-2">
              {label}
            </p>
            <h1 className="font-display text-[22px] sm:text-[26px] lg:text-[32px] font-bold text-[#f4f4f4] mb-3">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-2xl font-bold text-[#f4f4f4]">
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && (
                <span className="text-base text-[#888888] line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
              {product.compareAtPrice && (
                <span className="text-sm font-semibold text-[#f4f4f4] bg-[#2a2a2a] px-2 py-0.5 rounded-full">
                  -{Math.round((1 - product.price / product.compareAtPrice) * 100)}% OFF
                </span>
              )}
            </div>

            {/* Description with expand */}
            <DescriptionExpander
              description={product.description}
              fullDescription={product.fullDescription}
            />

            {/* Specifications */}
            <SpecsTable specifications={product.specifications} />

            {/* Add to cart */}
            <div className="mt-8">
              <AddToCart product={product} />
            </div>

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="mt-6 pt-6 border-t border-[#2a2a2a]">
                <p className="text-xs text-[#888888] mb-2 uppercase tracking-wider">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 bg-[#2a2a2a] text-[#888888] rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <section>
            <h2 className="font-display text-xl font-bold text-[#f4f4f4] mb-6">
              Produtos Relacionados
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
