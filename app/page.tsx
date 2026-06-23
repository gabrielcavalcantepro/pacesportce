import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroBanner from '@/components/home/HeroBanner';
import ProductSection from '@/components/home/ProductSection';
import AboutSection from '@/components/home/AboutSection';
import InstagramFeed from '@/components/home/InstagramFeed';
import ContactSection from '@/components/home/ContactSection';
import { getAllProducts } from '@/lib/products';

export default function Home() {
  const products = getAllProducts();

  return (
    <>
      <Header />
      <main className="flex-1">
        <HeroBanner />
        <ProductSection products={products} />
        <AboutSection />
        <InstagramFeed />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
