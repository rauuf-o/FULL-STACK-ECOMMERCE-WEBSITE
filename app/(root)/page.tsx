import { getLatestProducts } from "@/actions/products.action";
import ProductsList from "@/components/ui/shared/products/product-list";
const HomePage = async () => {
  const latestProducts = await getLatestProducts();
  return (
    <div>
      <ProductsList data={latestProducts} title="Featured Products" />
    </div>
  );
};

export default HomePage;
