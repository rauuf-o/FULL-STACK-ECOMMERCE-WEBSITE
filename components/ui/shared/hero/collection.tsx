// HeroSection.tsx
import Link from "next/link";
import { Product } from "@/types";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HeroSection({ products }: { products: Product[] }) {
  const lastProduct = products?.[products.length - 1];

  // Fallback image if no products yet
  const bgImage =
    lastProduct?.images?.[0] ??
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAnzZ3Gvu6Cnd0jJ2XA7oefwH12gXLB8DfmUoyT9sYw8-2vWEhKEqPij-J1RBqSwqGqyMhnE4paX4q8juTiGy9LnhJF0qYiqDYlHGfzZPYtd3HMTbDJeythAcZTLwlz_9yW9NH1D9RUL-B22S0WyESslJj84O8AGLy1L6zGe7uLhxhLwg1Vg2tg_zzEW8scLteLAgViAJB-Z_bXd6ZNdlyYNX9deme1gxFzSRTvPS4oJxx3Mh9L_NJ8fNYeDRL-3D6RQLgxrvnkVqtk";

  const productHref = lastProduct ? `/product/${lastProduct.slug}` : "/shop";

  return (
    <>
      {/* Hero Section */}
      <section className="px-4 py-4 @container">
        <div className="relative group overflow-hidden rounded-xl bg-matte-black min-h-[500px] flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            data-alt={lastProduct ? lastProduct.name : "Hero background"}
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.9) 100%), url("${bgImage}")`,
            }}
          />

          <div className="relative p-6 space-y-4">
            <div className="inline-block bg-primary px-3 py-1 rounded-full">
              <p className="text-[10px] font-black uppercase text-background-dark tracking-tighter">
                Collection 2024
              </p>
            </div>
            <h2 className="text-white text-4xl font-extrabold leading-none tracking-tighter uppercase italic">
              La nouvelle collection <br />
              <span className="text-primary italic">est disponible</span>
            </h2>

            <Button
              asChild
              size="lg"
              className="
    w-full sm:w-auto
    bg-primary text-background-dark
    font-black uppercase tracking-widest
    px-8 py-6
    rounded-lg
    transition-all duration-300 ease-out
    hover:bg-primary/90
    hover:shadow-[0_8px_30px_rgba(0,0,0,0.35)]
    hover:-translate-y-0.5
    active:translate-y-0
    gap-2
  "
            >
              <Link href={productHref} className="flex items-center gap-3">
                Acheter maintenant
                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
            {lastProduct && (
              <p className="text-white/70 text-xs">
                En vedette :{" "}
                <span className="text-white font-semibold">
                  {lastProduct.name}
                </span>
              </p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
