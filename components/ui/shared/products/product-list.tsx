import ProductCard from "./product-card";
import { Product } from "@/types";

const ProductsList = ({
  data,
  title,
  limit,
}: {
  data: Product[];
  title?: string;
  limit?: number;
}) => {
  // Only slice if limit is defined and smaller than data length
  const limitedData =
    limit && limit < data.length ? data.slice(0, limit) : data;

  if (!limitedData || limitedData.length === 0) return null;

  return (
    <section className="my-10">
      {title && <h2 className="text-2xl font-bold mb-6">{title}</h2>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {limitedData.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default ProductsList;
