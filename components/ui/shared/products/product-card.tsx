import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "../../card";
import { Product } from "@/types";

const ProductCard = ({ product }: { product: Product }) => {
  // Ensure stock is a number
  const stock = Number(product.stock) || 0;

  return (
    <Card>
      <CardHeader className="flex items-center justify-center">
        <Link href={`/product/${product.slug}`}>
          <Image
            src={product.images[0] ?? "/images/product-fallback.jpg"}
            alt={product.name}
            width={300}
            height={300}
            priority={true}
          />
        </Link>
      </CardHeader>
      <CardContent className="p-4 grid gap-4">
        {product.brand && <div className="text-xs">{product.brand}</div>}
        <Link href={`/product/${product.slug}`}>
          <h2 className="text-sm font-medium">{product.name}</h2>
        </Link>
        <div className="flex-between gap-4">
          <p>{product.rating ?? 0} Stars</p>
          {stock > 0 ? (
            <p className="font-bold">${product.price}</p>
          ) : (
            <p className="text-destructive">OUT OF STOCK</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
