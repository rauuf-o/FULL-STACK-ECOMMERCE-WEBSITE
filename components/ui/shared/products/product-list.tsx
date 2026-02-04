import HeroSection from "../hero/collection";
import ProductCard from "./product-card";
import { Product } from "@/types";
import CategoriesSection from "../hero/CategoriesSection";
import TrustSection from "../hero/TrustSection";
const ProductsList = ({
  data,
  title,
  limit,
}: {
  data: Product[];
  title?: string;
  limit?: number;
}) => {
  const limitedData = limit ? data.slice(0, limit) : data;

  return (
    <div className="my-10">
      <HeroSection products={data} />

      {/* ✅ NEW: Categories section using same products data */}
      <CategoriesSection products={data} />

      <h2 className="h2-bold mb-4">{title}</h2>

      {data.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {limitedData.map((product: Product) => (
            <div key={product.slug}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      ) : (
        <p>No products available.</p>
      )}
      <TrustSection />
    </div>
  );
};

export default ProductsList;
