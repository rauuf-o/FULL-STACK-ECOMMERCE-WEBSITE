import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "@/types";

export default function CategoriesSection({
  products,
}: {
  products: Product[];
}) {
  // 🔍 DEBUG: Check all products
  console.log("=== CATEGORIES DEBUG ===");
  console.log("Total products:", products.length);
  console.log(
    "All product categories:",
    products.map((p) => p.category),
  );

  // 1️⃣ Extract unique categories
  const allCategories = products.map((p) => p.category).filter(Boolean);
  console.log("Categories before Set:", allCategories);

  const categories = Array.from(
    new Set(products.map((p) => p.category?.trim()).filter(Boolean)),
  ).sort();

  console.log("Unique categories after Set:", categories);
  console.log("Categories count:", categories.length);

  if (!categories.length) return null;

  // 2️⃣ Featured = first category
  const featured = categories[0];
  const rest = categories.slice(1);

  console.log("Featured category:", featured);
  console.log("Rest categories:", rest);
  console.log("Rest count:", rest.length);

  // ✅ Link builder: go directly to /shop with category selected
  const shopCategoryHref = (category: string) =>
    `/shop?category=${encodeURIComponent(category)}&page=1`;

  // 3️⃣ Image resolver (pick a product image for this category)
  const getCategoryImage = (category: string) => {
    const product = products.find(
      (p) => p.category?.trim() === category && p.images?.[0],
    );
    console.log(`Image for category "${category}":`, product?.images?.[0]);
    return product?.images?.[0] ?? "/images/category-fallback.jpg";
  };

  return (
    <>
      {/* Header */}
      <section className="px-4 wrapper pt-8 pb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-white text-2xl font-extrabold uppercase tracking-tight">
            Nos Catégories
          </h2>
          <Link
            href="/shop"
            className="text-primary text-xs font-bold uppercase border-b border-primary/60 hover:border-primary transition"
          >
            Voir tout
          </Link>
        </div>
      </section>

      {/* Featured category */}
      <section className="px-4 wrapper pb-4">
        <Link
          href={shopCategoryHref(featured)}
          className="relative h-64 rounded-xl overflow-hidden group block"
        >
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-[1.03]"
            style={{
              backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.25) 100%), url("${getCategoryImage(
                featured,
              )}")`,
            }}
          />
          <div className="relative h-full flex flex-col justify-center p-6">
            <h3 className="text-white text-2xl font-black uppercase italic">
              {featured}
            </h3>

            <p className="text-primary font-bold text-xs uppercase tracking-widest mt-1">
              Édition Limitée
            </p>

            <Button
              variant="outline"
              className="
                mt-5 size-11 rounded-full p-0
                border-primary/40 text-primary
                bg-black/25 backdrop-blur
                hover:bg-primary hover:text-background-dark hover:border-primary
                transition-all
              "
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </Link>
      </section>

      {/* All remaining categories */}
      {rest.length > 0 && (
        <section className="px-4 wrapper pb-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {rest.map((category, index) => {
              console.log(`Rendering category ${index}:`, category);
              return (
                <Link
                  key={category}
                  href={shopCategoryHref(category)}
                  className="relative h-56 rounded-xl overflow-hidden group block"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-[1.03]"
                    style={{
                      backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,0.85) 100%), url("${getCategoryImage(
                        category,
                      )}")`,
                    }}
                  />
                  <div className="absolute bottom-0 left-0 p-4">
                    <h3 className="text-white text-lg font-black uppercase">
                      {category}
                    </h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}
