export const dynamic = "force-dynamic";

import HeroSection from "@/components/ui/shared/hero/collection";
import CategoriesSection from "@/components/ui/shared/hero/CategoriesSection";
import LatestProducts from "@/components/ui/shared/hero/latestproducts";
import TrustSection from "@/components/ui/shared/hero/TrustSection";
import { getLatestProducts, getLastProduct } from "@/actions/products.action";

export const revalidate = 60;

export default async function HomePage() {
  const [lastProduct, latestProducts] = await Promise.all([
    getLastProduct(),
    getLatestProducts(7), // fetch latest 7 products
  ]);

  const featuredProducts = lastProduct ? [lastProduct] : [];

  return (
    <>
      <HeroSection products={featuredProducts} />
      <CategoriesSection />
      <LatestProducts products={latestProducts} />
      <TrustSection />
    </>
  );
}
