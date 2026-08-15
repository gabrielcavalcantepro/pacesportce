import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroBanner from '@/components/home/HeroBanner';
import ProductGrid from '@/components/home/ProductGrid';
import AboutSection from '@/components/home/AboutSection';
import InstagramFeed from '@/components/home/InstagramFeed';
import ContactSection from '@/components/home/ContactSection';
import {
  getPublicBanners,
  getPublicCategories,
  getPublicProducts,
  getPublicSettings,
} from '@/lib/queries/public';

export default async function Home() {
  const [banners, categories, products, settings] = await Promise.all([
    getPublicBanners(),
    getPublicCategories(),
    getPublicProducts(),
    getPublicSettings(),
  ]);

  return (
    <>
      <Header />
      <main className="flex-1">
        <HeroBanner banners={banners} />
        <ProductGrid products={products} categories={categories} />
        <AboutSection text={settings.about_text ?? ''} />
        <InstagramFeed handle={settings.instagram_handle || '@pacesportce'} />
        <ContactSection
          whatsapp={settings.whatsapp ?? ''}
          address={settings.address ?? ''}
          hours={settings.opening_hours ?? ''}
        />
      </main>
      <Footer />
    </>
  );
}
