import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDerivedCategories } from "@/actions/categories.action";

export const revalidate = 300; // 5 minutes

export default async function CategoriesSection() {
  const categories = await getDerivedCategories();

  if (!categories.length) return null;

  const [featured, ...rest] = categories;

  const shopCategoryHref = (category: string) =>
    `/shop?category=${encodeURIComponent(category)}&page=1`;

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
          href={shopCategoryHref(featured.name)}
          className="relative h-64 rounded-xl overflow-hidden group block"
        >
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-[1.03]"
            style={{
              backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.25) 100%), url("${featured.image}")`,
            }}
          />
          <div className="relative h-full flex flex-col justify-center p-6">
            <h3 className="text-white text-2xl font-black uppercase italic">
              {featured.name}
            </h3>

            <Button
              variant="outline"
              className="mt-5 size-11 rounded-full p-0 border-primary/40 text-primary bg-black/25 backdrop-blur hover:bg-primary hover:text-background-dark hover:border-primary transition-all"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </Link>
      </section>

      {/* Remaining categories */}
      {rest.length > 0 && (
        <section className="px-4 wrapper pb-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {rest.map((category) => (
              <Link
                key={category.name}
                href={shopCategoryHref(category.name)}
                className="relative h-56 rounded-xl overflow-hidden group block"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-[1.03]"
                  style={{
                    backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,0.85) 100%), url("${category.image}")`,
                  }}
                />
                <div className="absolute bottom-0 left-0 p-4">
                  <h3 className="text-white text-lg font-black uppercase">
                    {category.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
