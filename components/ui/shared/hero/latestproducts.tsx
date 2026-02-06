import Link from "next/link";
import { Product } from "@/types";

type LatestProductsProps = {
  products: Product[];
};

export default function LatestProducts({ products }: LatestProductsProps) {
  if (!products.length)
    return <p className="text-center py-10 text-white">No products found.</p>;

  return (
    <>
      {/* Header */}
      <section className="px-4 wrapper pt-8 pb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-white text-2xl font-extrabold uppercase tracking-tight">
            Derniers Produits
          </h2>
          <Link
            href="/shop"
            className="text-primary text-xs font-bold uppercase border-b border-primary/60 hover:border-primary transition"
          >
            Voir tous
          </Link>
        </div>
      </section>

      {/* Products Grid */}
      <section className="px-4 wrapper pb-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.slug}`}
              className="relative h-56 rounded-xl overflow-hidden group block"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-[1.03]"
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,0.85) 100%), url("${product.images?.[0] || "/placeholder.png"}")`,
                }}
              />
              <div className="absolute bottom-0 left-0 p-4">
                <h3 className="text-white text-lg font-black uppercase">
                  {product.name}
                </h3>
                <p className="text-primary font-bold text-xs uppercase tracking-widest mt-1">
                  {product.category}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* See all button */}
      <div className="flex justify-center mb-10 pb-12">
        <Link
          href="/shop"
          className="px-6 py-3 bg-primary text-background-dark font-semibold rounded-xl shadow-lg hover:bg-yellow-500 transition"
        >
          Voir tous les produits
        </Link>
      </div>
    </>
  );
}
