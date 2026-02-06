"use client";

import React, { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { Minus, Plus, Trash2, ArrowRight, Loader } from "lucide-react";

import { addItemToCart, removeItemFromCart } from "@/actions/cart-action";
import { Cart } from "@/types";

const CartTable = ({ cart }: { cart?: Cart }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <p className="text-lg font-semibold">Votre panier est vide 🛒</p>
        <Link href="/" className="text-primary font-bold underline">
          Continuer vos achats
        </Link>
      </div>
    );
  }

  const subtotal = cart.items.reduce(
    (acc, item) => acc + item.price * item.qty,
    0,
  );

  return (
    <div className="max-w-7xl mx-auto px-4 pb-32 md:pb-16">
      {/* GRID */}
      <div className="grid gap-8 md:grid-cols-[1fr_420px]">
        {/* ================= LEFT: ITEMS ================= */}
        <section className="space-y-3">
          {cart.items.map((item) => (
            <div
              key={`${item.productId}-${item.taille || "no-size"}`}
              className="flex gap-4 bg-white dark:bg-[#121212] p-4 rounded-xl border dark:border-white/5 shadow-sm"
            >
              {/* IMAGE */}
              <Link
                href={`/product/${item.slug}`}
                className="relative size-24 md:size-28 shrink-0 overflow-hidden rounded-lg"
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="112px"
                />
              </Link>

              {/* CONTENT */}
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0">
                    <Link href={`/product/${item.slug}`}>
                      <p className="font-bold text-base md:text-lg truncate">
                        {item.name}
                      </p>
                    </Link>
                    {/* ✅ Show size if exists */}
                    {item.taille && (
                      <p className="text-xs text-slate-500 mt-1">
                        Taille:{" "}
                        <span className="font-semibold">
                          {item.taille.toUpperCase()}
                        </span>
                      </p>
                    )}
                  </div>

                  {/* DELETE - ✅ Pass taille */}
                  <button
                    disabled={isPending}
                    onClick={() =>
                      startTransition(async () => {
                        const result = await removeItemFromCart(
                          item.productId,
                          item.taille,
                        );
                        result?.success
                          ? toast.success("Produit supprimé")
                          : toast.error("Erreur");
                      })
                    }
                    className="text-slate-400 hover:text-red-500 transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* PRICE + QTY */}
                <div className="flex items-center justify-between mt-4">
                  <p className="text-primary text-lg md:text-xl font-bold">
                    {item.price.toFixed(2)} DZD
                  </p>

                  <div className="flex items-center gap-3 bg-slate-100 dark:bg-white/5 rounded-full px-3 py-1">
                    {/* DECREASE - ✅ Pass taille */}
                    <button
                      disabled={isPending}
                      onClick={() =>
                        startTransition(async () => {
                          await removeItemFromCart(item.productId, item.taille);
                        })
                      }
                      className="h-7 w-7 flex items-center justify-center rounded-full text-slate-400 hover:bg-black/5"
                    >
                      <Minus size={14} />
                    </button>

                    <span className="w-6 text-center font-bold">
                      {item.qty}
                    </span>

                    {/* INCREASE - ✅ Already correct, passes full item */}
                    <button
                      disabled={isPending}
                      onClick={() =>
                        startTransition(async () => {
                          await addItemToCart(item);
                        })
                      }
                      className="h-7 w-7 flex items-center justify-center rounded-full text-primary hover:bg-black/5"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* ================= RIGHT: SUMMARY (DESKTOP) ================= */}
        <aside className="hidden md:block sticky top-24 h-fit">
          <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border dark:border-white/10 p-6 shadow-lg">
            <h2 className="text-xl font-extrabold mb-4">Récapitulatif</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Sous-total</span>
                <span className="font-semibold">{subtotal.toFixed(2)} DZD</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Livraison</span>
                <span className="font-semibold uppercase tracking-wide">
                  Pas encore
                </span>
              </div>

              <div className="h-px bg-slate-200 dark:bg-white/10 my-2" />

              <div className="flex justify-between items-end">
                <span className="text-lg font-extrabold">Total</span>
                <div className="text-right">
                  <p className="text-primary text-2xl font-black">
                    {subtotal.toFixed(2)} DZD
                  </p>
                  <p className="text-[10px] text-slate-500 uppercase">
                    TVA incluse
                  </p>
                </div>
              </div>
            </div>

            <button
              disabled={isPending}
              onClick={() =>
                startTransition(() => router.push("/shipping-adresse"))
              }
              className="w-full mt-6 bg-primary text-black font-extrabold py-4 rounded-xl flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
            >
              {isPending ? (
                <Loader className="animate-spin" />
              ) : (
                <>
                  Procéder au paiement
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </aside>
      </div>

      {/* ================= MOBILE BOTTOM BAR ================= */}
      <section className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#0a0a0a] border-t px-6 pt-6 shadow-[0_-10px_30px_rgba(0,0,0,0.15)]">
        <div className="max-w-lg mx-auto space-y-3">
          {/* Livraison */}
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500">Livraison</span>
            <span className="font-semibold uppercase tracking-wide">
              Pas encore
            </span>
          </div>

          {/* Divider */}
          <div className="h-px bg-slate-200 dark:bg-white/10" />

          {/* Total */}
          <div className="flex justify-between items-center">
            <span className="font-extrabold text-lg">Total</span>
            <span className="text-primary text-2xl font-black">
              {subtotal.toFixed(2)} DZD
            </span>
          </div>

          {/* CTA */}
          <button
            disabled={isPending}
            onClick={() =>
              startTransition(() => router.push("/shipping-adresse"))
            }
            className="w-full bg-primary text-black font-extrabold py-4 rounded-xl flex items-center justify-center gap-3 mb-6 uppercase tracking-widest text-sm"
          >
            {isPending ? (
              <Loader className="animate-spin" />
            ) : (
              <>
                Procéder au paiement
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  );
};

export default CartTable;
