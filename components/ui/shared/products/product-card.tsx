import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "../../card";
import { AlertTriangle } from "lucide-react";
import { Product } from "@/types";
const ProductCard = ({ product }: { product: Product }) => {
  return (
    <div>
      <Card>
        <CardHeader className="flex items-center justify-center">
          <Link href={`/product/${product.slug}`}>
            <Image
              src={product.images[0]}
              alt={product.name}
              width={300}
              height={300}
              priority={true}
            />
          </Link>
        </CardHeader>
        <CardContent className="p-4 grid gap-4">
          <div className="text-xs">{product.brand}</div>
          <Link href={`/product/${product.slug}`}>
            <h2 className="text-sm font-medium"> {product.name} </h2>
          </Link>
          <div className="flex-between gap-4">
            <p> {product.rating} Stars </p>
            {product.stock > 0 ? (
              <p className="font-bold">${product.price}</p>
            ) : (
              <p className="text-destructive">OUT OF STOCK</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductCard;
