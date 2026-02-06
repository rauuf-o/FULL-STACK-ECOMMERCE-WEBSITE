import HeroSection from "../hero/collection";
import ProductCard from "./product-card";
import { Product } from "@/types";
import CategoriesSection from "../hero/CategoriesSection";
import TrustSection from "../hero/TrustSection";
import LatestProducts from "../hero/latestproducts";
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
      <LatestProducts limit={7} />

      <TrustSection />
    </div>
  );
};

export default ProductsList;
