"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import ProductImages from "@/components/ui/shared/products/product-images";
import AddCart from "@/components/ui/shared/products/add-cart";
import { Cart, Product } from "@/types";
import { cn } from "@/lib/utils";

type ProductDetailsClientProps = {
  product: Product;
  cart?: Cart;
};

const ProductDetailsClient = ({ product, cart }: ProductDetailsClientProps) => {
  /* ---------------- PARSE TAILLES ---------------- */
  const tailles: string[] = (() => {
    if (!product.taille) return [];

    const tailleStr = Array.isArray(product.taille)
      ? product.taille.join(",")
      : String(product.taille);

    if (tailleStr && tailleStr !== "[object Object]") {
      return tailleStr
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }

    return [];
  })();

  const [selectedSize, setSelectedSize] = useState<string>(
    tailles.length > 0 ? tailles[0] : "",
  );

  return (
    <section className="relative pb-40 md:pb-0">
      <div className="md:max-w-7xl md:mx-auto md:grid md:grid-cols-5 md:gap-12">
        {/* IMAGES */}
        <div className="md:col-span-2">
          <ProductImages images={product.images} />
        </div>

        {/* DETAILS */}
        <div className="px-4 pt-6 space-y-8 md:col-span-2 md:px-0">
          <div>
            <h1 className="text-primary text-3xl font-extrabold uppercase tracking-tight">
              {product.name}
            </h1>
            <p className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">
              DZD {product.price}
            </p>
          </div>

          <div>
            {product.stock > 0 ? (
              <Badge variant="outline">In Stock</Badge>
            ) : (
              <Badge variant="destructive">Out of Stock</Badge>
            )}
          </div>

          {/* SIZE */}
          {tailles.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold uppercase tracking-wider text-sm">
                  Sélectionner la taille
                </h3>
                <button className="text-primary text-xs underline">
                  Guide des tailles
                </button>
              </div>

              <div className="grid grid-cols-4 gap-4">
                {tailles.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      "py-4 rounded-xl border-2 font-bold transition text-sm",
                      selectedSize === size
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-gray-300 dark:border-white/20 hover:border-primary",
                    )}
                  >
                    {size.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ACCORDIONS */}
          <div className="border-t border-gray-200 dark:border-white/10 pt-8 space-y-5">
            <details open className="group">
              <summary className="flex cursor-pointer items-center justify-between font-bold uppercase tracking-wider list-none">
                Description
                <span className="transition group-open:rotate-180">⌄</span>
              </summary>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {product.description}
              </p>
            </details>

            <details className="group border-t border-gray-200 dark:border-white/10 pt-5">
              <summary className="flex cursor-pointer items-center justify-between font-bold uppercase tracking-wider list-none">
                Livraison & Retours
                <span className="transition group-open:rotate-180">⌄</span>
              </summary>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Livraison rapide & retours sous 14 jours.
              </p>
            </details>
          </div>
        </div>

        {/* ================= DESKTOP ADD TO CART ================= */}
        {product.stock > 0 && (
          <div className="hidden md:block md:col-span-1">
            <Card className="sticky top-24 border-2 border-primary/20 shadow-xl">
              <CardContent className="p-7 space-y-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Disponibilité</span>
                  <span className="font-semibold text-green-600">En stock</span>
                </div>

                <div className="pt-2">
                  <AddCart
                    cart={cart}
                    item={{
                      productId: product.id,
                      name: product.name,
                      slug: product.slug,
                      price: product.price,
                      qty: 1,
                      image: product.images[0],
                      ...(selectedSize && { taille: selectedSize }),
                    }}
                  />
                </div>

                <p className="text-center text-xs text-gray-500">
                  Paiement sécurisé . a main
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* ================= MOBILE STICKY CTA ================= */}
      {product.stock > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background-light dark:bg-background-dark border-t border-gray-200 dark:border-white/10 px-4 py-6 backdrop-blur-lg">
          <div className="max-w-lg mx-auto">
            <AddCart
              cart={cart}
              item={{
                productId: product.id,
                name: product.name,
                slug: product.slug,
                price: product.price,
                qty: 1,
                image: product.images[0],
                ...(selectedSize && { taille: selectedSize }),
              }}
            />
            <p className="mt-3 text-center text-[11px] text-gray-500 font-medium">
              Paiement sécurisé · a m
            </p>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProductDetailsClient;
