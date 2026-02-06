// app/products/[slug]/page.tsx
export const dynamic = "force-dynamic";

import { getProductBySlug } from "@/actions/products.action";
import { getCartItems } from "@/actions/cart-action";
import { notFound } from "next/navigation";
import ProductDetailsClient from "./product-details-client";

const ProductDetailsPage = async (props: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const cart = await getCartItems();

  return <ProductDetailsClient product={product} cart={cart} />;
};

export default ProductDetailsPage;
