import { notFound } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductImages from '@/components/product/ProductImages';
import AddToCart from '@/components/product/AddToCart';
import ProductCard from '@/components/product/ProductCard';
import ProductTabs from '@/components/product/ProductTabs';
import ReviewSection from '@/components/product/ReviewSection';
import ProductPrice from '@/components/product/ProductPrice';
import { VariantPriceProvider } from '@/components/product/VariantPriceContext';
import { getPublicProductBySlug, getPublicSettings, getRelatedProducts } from '@/lib/queries/public';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublicProductBySlug(slug);
  if (!product) return {};
  return {
    title: `${product.name} — PaceSportce`,
    description: product.description ?? undefined,
  };
}

const PLACEHOLDER_IMAGE = 'https://placehold.co/600x600/1e1e1e/f4f4f4?text=Sem+Imagem';

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getPublicProductBySlug(slug);
  if (!product) notFound();

  const [related, settings] = await Promise.all([
    product.category_id ? getRelatedProducts(product.category_id, slug) : Promise.resolve([]),
    getPublicSettings(),
  ]);
  const whatsappNumber = settings.whatsapp ?? '';

  return (
    <>
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[#888888] mb-8 flex-wrap">
          <Link href="/" className="hover:text-[#f4f4f4] transition-colors">
            Home
          </Link>
          {product.category && (
            <>
              <span>/</span>
              <Link href="/#produtos" className="hover:text-[#f4f4f4] transition-colors">
                {product.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-[#f4f4f4] truncate">{product.name}</span>
        </nav>

        {/* Product detail */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
          <ProductImages
            images={product.images.length > 0 ? product.images : [PLACEHOLDER_IMAGE]}
            name={product.name}
          />

          <VariantPriceProvider product={product}>
            <div>
              {product.category && (
                <p className="text-xs font-semibold text-[#888888] uppercase tracking-wider mb-2">
                  {product.category.name}
                </p>
              )}
              <h1 className="font-display text-[22px] sm:text-[26px] lg:text-[32px] font-bold text-[#f4f4f4] mb-3">
                {product.name}
              </h1>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {product.free_shipping && (
                  <span className="text-xs font-medium text-[#22c55e] bg-[#22c55e]/15 px-2.5 py-1 rounded-full">
                    Frete Grátis
                  </span>
                )}
                <span className="text-xs font-medium text-[#888888] bg-[#2a2a2a] px-2.5 py-1 rounded-full">
                  {product.condition === 'used' ? 'Semi-novo' : 'Novo'}
                </span>
              </div>

              <ProductPrice product={product} />

              {/* Short description preview */}
              {product.description && (
                <p className="text-sm text-[#888888] leading-relaxed mb-8">{product.description}</p>
              )}

              {/* Add to cart */}
              <div className="mt-8">
                <AddToCart
                  product={product}
                  whatsapp_only={product.whatsapp_only}
                  whatsapp_number={whatsappNumber}
                  product_name={product.name}
                  variants={product.variants}
                />
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
          </VariantPriceProvider>
        </div>

        {/* Description & specifications tabs */}
        <ProductTabs product={product} />

        {/* Reviews */}
        <ReviewSection productId={product.id} />

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
