import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getProductBySlug } from "@/actions/products.action";
import { notFound } from "next/navigation";
import ProductImages from "@/components/ui/shared/products/product-images";
import AddCart from "@/components/ui/shared/products/add-cart";
import { getCartItems } from "@/actions/cart-action";
const ProductDetailsPage = async (props: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);
  if (!product) {
    notFound();
  }
  const cart = await getCartItems();
  return (
    <section>
      <div className="grid grid-cols-1 md:grid-cols-5 ">
        {/* IMAGE COLUMN */}
        <div className="col-span-2">
          <ProductImages images={product.images}></ProductImages>
        </div>
        {/* DETAILS COLUMN */}
        <div className="col-span-2 p-5">
          <div className="flex flex-col gap-6">
            <p>
              {product.brand} {product.category}
            </p>
            <h1 className="h3-bold ">{product.name}</h1>
            <p>
              {product.rating} of {product.numReviews} Reviews
            </p>
            <div className="">
              <p className="font-bold text-lg  w-30 rounded-full bg-green-100 text-green-700 px-5 py-2">
                DZD{product.price}
              </p>
            </div>
          </div>
          <div className="mt-10">
            <p className="font-semibold">Description</p>
            <p>{product.description}</p>
          </div>
        </div>
        {/* Action COLUMN */}
        <div>
          <Card>
            <CardContent className="p-4">
              <div className="mb-2 flex justify-between">
                <div>Price</div>
                <div>DZD{product.price}</div>
              </div>
              <div className="mb-2 flex justify-between">
                <div>Status</div>
                <p>
                  {product.stock > 0 ? (
                    <Badge variant="outline">In Stock</Badge>
                  ) : (
                    <Badge variant="destructive">Out of Stock</Badge>
                  )}
                </p>
              </div>
              {product.stock > 0 && (
                <div>
                  <AddCart
                    cart={cart}
                    item={{
                      productId: product.id,
                      name: product.name,
                      slug: product.slug,
                      price: product.price,
                      quantity: 1,
                      image: product.images[0],
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ProductDetailsPage;
