"use client";

import React from "react";
import { Product } from "@/types";
import Image from "next/image";
import Link from "next/link";

type CategoryClientProps = {
  categorySlug: string;
  products: Product[];
};

const CategoryClient: React.FC<CategoryClientProps> = ({
  categorySlug,
  products,
}) => {
  // ✅ LOGIC UNCHANGED
  const displayName = categorySlug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const countLabel =
    products.length === 0
      ? "Aucun article trouvé"
      : products.length === 1
        ? "1 article trouvé"
        : `${products.length} articles trouvés`;

  return (
    <div className="min-h-screen w-full bg-[#181711] text-white">
      {/* Full-screen premium background */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(1000px_600px_at_50%_0%,rgba(244,209,37,0.18),transparent_60%),radial-gradient(900px_550px_at_15%_35%,rgba(255,255,255,0.06),transparent_60%)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-black/20 via-black/20 to-black/55" />

      <main className="mx-auto w-full max-w-7xl px-4 pb-24 pt-10 sm:px-6 lg:px-8">
        {/* Header (better hierarchy + spacing) */}
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[#f4d125] text-[38px] font-extrabold leading-tight tracking-tight sm:text-[46px]">
              {displayName}
            </h1>
            <p className="mt-1 text-sm text-[#bab59c]">{countLabel}</p>
          </div>

          {/* UX improvement: subtle helper text / sort indicator (UI only) */}
          <div className="flex items-center gap-2 text-xs text-white/70 sm:justify-end">
            <span className="inline-block size-1.5 rounded-full bg-[#f4d125]" />
            <span>Catalogue</span>
            <span className="opacity-50">•</span>
            <span className="opacity-80">Dernières nouveautés</span>
          </div>
        </header>

        {/* Empty state */}
        {products.length === 0 ? (
          <div className="mt-14 rounded-2xl border border-[#393628] bg-[#27251b]/65 p-10 text-center">
            <p className="text-[#bab59c]">
              No products found in this category.
            </p>
          </div>
        ) : (
          <>
            {/* MOBILE */}
            <section className="mt-10 lg:hidden">
              <div className="grid grid-cols-2 gap-4">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}`}
                    className="group"
                  >
                    <div className="rounded-2xl border border-[#393628] bg-[#27251b]/80 p-3 shadow-[0_10px_28px_rgba(0,0,0,0.25)] transition hover:bg-[#2f2c20] hover:shadow-[0_14px_36px_rgba(0,0,0,0.35)]">
                      {/* Image */}
                      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-white">
                        {product.images?.[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            sizes="50vw"
                            className="object-contain p-3 transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-gray-500">
                            No image
                          </div>
                        )}
                      </div>

                      {/* Name under image */}
                      <p className="mt-3 line-clamp-2 text-sm font-semibold leading-snug">
                        {product.name}
                      </p>

                      {/* Price */}
                      <p className="mt-1 text-base font-extrabold text-[#f4d125]">
                        DZD {product.price}
                      </p>

                      {/* UX: subtle “tap hint” */}
                      <p className="mt-1 text-[11px] text-[#bab59c]">
                        Appuyez pour voir
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* DESKTOP */}
            <section className="mt-12 hidden lg:block">
              {/* UX improvement: proper desktop grid + roomy spacing */}
              <div className="grid grid-cols-3 gap-8 xl:grid-cols-4">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}`}
                    className="group"
                  >
                    <article className="h-full rounded-3xl border border-[#393628] bg-[#27251b]/70 p-5 shadow-[0_14px_40px_rgba(0,0,0,0.25)] transition hover:-translate-y-0.5 hover:bg-[#2f2c20] hover:shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
                      {/* Bigger image (square, premium) */}
                      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-white">
                        {product.images?.[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            sizes="25vw"
                            className="object-contain p-5 transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-gray-500">
                            No image
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="mt-4">
                        <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug">
                          {product.name}
                        </h3>

                        {product.description ? (
                          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#bab59c]">
                            {product.description}
                          </p>
                        ) : (
                          <div className="mt-2" />
                        )}

                        <div className="mt-4 flex items-end justify-between">
                          <p className="text-lg font-extrabold text-[#f4d125]">
                            DZD {product.price}
                          </p>
                          <span className="text-xs text-white/70 transition group-hover:text-white">
                            Voir →
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </section>

            {/* CTA */}
            <div className="pt-16 text-center">
              <button
                type="button"
                className="rounded-2xl bg-[#f4d125] px-10 py-3.5 font-extrabold text-black shadow-lg shadow-[#f4d125]/20 transition hover:brightness-110 active:scale-[0.98]"
              >
                Voir plus de produits
              </button>
              <p className="mt-3 text-xs text-[#bab59c]">
                Chargement progressif • expérience plus rapide
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default CategoryClient;
