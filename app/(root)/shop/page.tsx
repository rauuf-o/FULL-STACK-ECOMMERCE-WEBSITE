// app/(root)/shop/page.tsx
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/db/prisma";
import { PAGE_SIZE } from "@/lib/constants";
import { getAllProducts } from "@/actions/products.action";
type SearchParams = {
  page?: string;
  category?: string;
};

function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

function buildUrl(params: Record<string, string | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v && v.trim().length > 0) sp.set(k, v);
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  const page = Math.max(1, Number(sp.page || "1") || 1);
  const category = (sp.category || "").trim() || undefined;

  // ✅ categories (distinct)
  const rawCats = await prisma.product.findMany({
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });

  const categoryNames = rawCats
    .map((c) => (c.category ?? "").trim())
    .filter((v) => v.length > 0);

  // ✅ counts per category (no groupBy)
  const allCatsForCount = await prisma.product.findMany({
    select: { category: true },
  });

  const countsMap = new Map<string, number>();
  for (const row of allCatsForCount) {
    const name = (row.category ?? "").trim();
    if (!name) continue;
    countsMap.set(name, (countsMap.get(name) || 0) + 1);
  }

  const categories = categoryNames.map((name) => ({
    name,
    count: countsMap.get(name) || 0,
  }));

  // ✅ products (no search bar, so query is omitted)
  const {
    data: products,
    totalPages,
    dataCount,
  } = await getAllProducts({
    page,
    limit: PAGE_SIZE,
    category,
  });

  const currentCategoryLabel = category || "All Products";

  return (
    <div className="min-h-screen w-full bg-[#181711] text-white">
      {/* Brand background */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(1100px_650px_at_50%_0%,rgba(244,209,37,0.18),transparent_60%),radial-gradient(900px_550px_at_20%_35%,rgba(255,255,255,0.06),transparent_62%)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-black/15 via-black/15 to-black/55" />

      <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        {/* Header (no search bar) */}
        <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[#f4d125] text-[40px] font-extrabold leading-tight tracking-tight sm:text-[52px]">
              Shop
            </h1>
            <p className="mt-1 text-sm text-[#bab59c]">
              {dataCount} produits •{" "}
              <span className="text-white/85">{currentCategoryLabel}</span>
            </p>
          </div>

          {category ? (
            <Link
              href={`/shop${buildUrl({ page: "1" })}`}
              className="mt-2 inline-flex w-fit items-center gap-2 rounded-2xl border border-[#393628] bg-[#27251b]/60 px-4 py-2 text-xs font-bold text-white/85 transition hover:bg-[#2f2c20] sm:mt-0"
            >
              Reset category <span className="text-[#f4d125]">✕</span>
            </Link>
          ) : null}
        </header>

        {/* Mobile categories: dropdown (already good) */}
        <div className="mt-6 lg:hidden">
          <form action="/shop" method="GET" className="grid gap-2">
            <input type="hidden" name="page" value="1" />

            <label className="text-xs font-semibold text-white/70">
              Catégorie
            </label>

            <select
              name="category"
              defaultValue={category || ""}
              className="w-full rounded-2xl border border-[#393628] bg-[#27251b]/70 px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_26px_rgba(0,0,0,0.25)] focus:outline-none"
            >
              <option value="">All Products</option>
              {categories.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.count})
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="rounded-2xl bg-[#f4d125] px-4 py-3 text-sm font-extrabold text-black hover:brightness-110"
            >
              Appliquer
            </button>
          </form>
        </div>

        {/* Desktop categories: make it look GOOD (not like mobile) */}
        <div className="mt-10 hidden lg:block">
          <div className="rounded-3xl border border-[#393628] bg-[#27251b]/55 p-5 shadow-[0_14px_40px_rgba(0,0,0,0.25)]">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm font-extrabold tracking-tight text-white/95">
                  Categories
                </p>
                <p className="mt-1 text-xs text-[#bab59c]">
                  Filtrer par catégorie
                </p>
              </div>

              {category ? (
                <Link
                  href={`/shop${buildUrl({ page: "1" })}`}
                  className="text-xs font-bold text-[#f4d125] hover:brightness-110"
                >
                  Reset
                </Link>
              ) : null}
            </div>

            <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-[#393628] to-transparent" />

            {/* Desktop: pill grid instead of sidebar list */}
            <div className="mt-4 grid grid-cols-4 gap-3 xl:grid-cols-6">
              {/* All */}
              <Link
                href={`/shop${buildUrl({ page: "1" })}`}
                className={cn(
                  "group rounded-2xl border px-4 py-3 transition",
                  !category
                    ? "border-[#f4d125]/50 bg-[#f4d125] text-black"
                    : "border-[#393628] bg-[#181711]/35 text-white/85 hover:bg-[#2f2c20]",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-extrabold">All</span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-1 text-[11px] font-extrabold",
                      !category
                        ? "bg-black/10 text-black"
                        : "bg-[#393628] text-white/80",
                    )}
                  >
                    {dataCount}
                  </span>
                </div>
              </Link>

              {categories.map((c) => {
                const active = category === c.name;
                return (
                  <Link
                    key={c.name}
                    href={`/shop${buildUrl({ category: c.name, page: "1" })}`}
                    className={cn(
                      "group rounded-2xl border px-4 py-3 transition",
                      active
                        ? "border-[#f4d125]/50 bg-[#181711]/60 shadow-[0_0_0_1px_rgba(244,209,37,0.35)]"
                        : "border-[#393628] bg-[#181711]/35 text-white/85 hover:bg-[#2f2c20]",
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="line-clamp-1 text-sm font-bold">
                        {c.name}
                      </span>
                      <span
                        className={cn(
                          "rounded-full border px-2 py-1 text-[11px] font-extrabold",
                          active
                            ? "border-[#f4d125]/40 bg-[#f4d125]/10 text-[#f4d125]"
                            : "border-[#393628] bg-[#27251b]/60 text-white/70",
                        )}
                      >
                        {c.count}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Products */}
        <section className="mt-10">
          {products.length === 0 ? (
            <div className="rounded-3xl border border-[#393628] bg-[#27251b]/60 p-10 text-center">
              <p className="text-[#bab59c]">
                Aucun produit trouvé pour cette catégorie.
              </p>
              <div className="mt-4">
                <Link
                  href="/shop"
                  className="inline-flex rounded-2xl bg-[#f4d125] px-6 py-3 text-sm font-extrabold text-black hover:brightness-110"
                >
                  Retour à Shop
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 xl:grid-cols-4">
                {products.map((p) => (
                  <Link
                    key={p.id}
                    href={`/product/${p.slug}`}
                    className="group"
                  >
                    <article className="h-full rounded-3xl border border-[#393628] bg-[#27251b]/70 p-4 shadow-[0_12px_34px_rgba(0,0,0,0.22)] transition hover:-translate-y-0.5 hover:bg-[#2f2c20] hover:shadow-[0_16px_44px_rgba(0,0,0,0.32)]">
                      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-white">
                        {p.images?.[0] ? (
                          <Image
                            src={p.images[0]}
                            alt={p.name}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="object-contain p-5 transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-gray-500">
                            No image
                          </div>
                        )}
                      </div>

                      <h3 className="mt-4 line-clamp-2 text-[14px] font-semibold leading-snug sm:text-[15px]">
                        {p.name}
                      </h3>

                      <div className="mt-2">
                        <span className="inline-flex items-center rounded-full border border-[#393628] bg-[#181711]/40 px-2.5 py-1 text-[11px] font-semibold text-white/85">
                          {p.category || "Uncategorized"}
                        </span>
                      </div>

                      <p className="mt-3 text-lg font-extrabold text-[#f4d125]">
                        DZD {p.price}
                      </p>
                    </article>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-10 flex items-center justify-center gap-3">
                <Link
                  aria-disabled={page <= 1}
                  className={cn(
                    "rounded-2xl border px-5 py-2 text-sm font-bold transition",
                    page <= 1
                      ? "cursor-not-allowed border-[#393628] bg-[#27251b]/40 text-white/40"
                      : "border-[#393628] bg-[#27251b]/70 text-white/90 hover:bg-[#2f2c20]",
                  )}
                  href={`/shop${buildUrl({
                    category,
                    page: String(Math.max(1, page - 1)),
                  })}`}
                >
                  ← Prev
                </Link>

                <span className="rounded-2xl border border-[#393628] bg-[#181711]/40 px-4 py-2 text-xs text-white/80">
                  Page <b>{page}</b> / {totalPages}
                </span>

                <Link
                  aria-disabled={page >= totalPages}
                  className={cn(
                    "rounded-2xl border px-5 py-2 text-sm font-bold transition",
                    page >= totalPages
                      ? "cursor-not-allowed border-[#393628] bg-[#27251b]/40 text-white/40"
                      : "border-[#393628] bg-[#27251b]/70 text-white/90 hover:bg-[#2f2c20]",
                  )}
                  href={`/shop${buildUrl({
                    category,
                    page: String(Math.min(totalPages, page + 1)),
                  })}`}
                >
                  Next →
                </Link>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
