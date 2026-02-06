"use client";

import React, { useMemo, useTransition } from "react";
import { Cart, CartItem } from "@/types";
import { Button } from "../../button";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { addItemToCart, removeItemFromCart } from "@/actions/cart-action";
import { useRouter } from "next/navigation";

const AddCart = ({ cart, item }: { cart?: Cart; item: CartItem }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // ✅ Match by productId AND taille (size)
  const existItem = useMemo(
    () =>
      cart?.items.find(
        (x) => x.productId === item.productId && x.taille === item.taille,
      ),
    [cart?.items, item.productId, item.taille],
  );

  const handleAddToCart = () => {
    const description = item.taille
      ? `${item.name} - Size: ${item.taille.toUpperCase()}`
      : item.name;

    const id = toast.loading("Adding to cart...", { description });

    startTransition(async () => {
      const result = await addItemToCart(item);

      if (result?.success) {
        // ✅ UPDATE NAVBAR BADGE INSTANTLY
        window.dispatchEvent(new Event("cart:updated"));

        toast.success("Added to cart", {
          id,
          description,
          action: {
            label: "View cart",
            onClick: () => router.push("/cart"),
          },
        });
      } else {
        toast.error("Failed to add item", {
          id,
          description: result?.message || "Please try again",
        });
      }
    });
  };

  const handleRemoveFromCart = () => {
    const description = item.taille
      ? `${item.name} - Size: ${item.taille.toUpperCase()}`
      : item.name;

    const id = toast.loading("Updating cart...", { description });

    startTransition(async () => {
      // ✅ Pass taille to remove the correct item
      const res = await removeItemFromCart(item.productId, item.taille);

      if (res?.success) {
        // ✅ UPDATE NAVBAR BADGE INSTANTLY
        window.dispatchEvent(new Event("cart:updated"));

        toast.success("Removed from cart", {
          id,
          description,
        });
      } else {
        toast.error("Failed to remove item", {
          id,
          description: res?.message || "Please try again",
        });
      }
    });
  };

  // ✅ Stepper UI when item exists
  if (existItem) {
    return (
      <div className="mt-3 w-full rounded-xl border bg-background p-3">
        {/* Show selected size */}
        {item.taille && (
          <div className="mb-2 text-center text-xs text-muted-foreground">
            Size:{" "}
            <span className="font-semibold">{item.taille.toUpperCase()}</span>
          </div>
        )}

        <div className="flex items-center justify-center gap-3">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={handleRemoveFromCart}
              disabled={isPending}
              aria-label="Decrease quantity"
            >
              <Minus className="size-4" />
            </Button>

            <div className="min-w-10 text-center text-sm font-semibold">
              {existItem.qty}
            </div>

            <Button
              type="button"
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={handleAddToCart}
              disabled={isPending}
              aria-label="Increase quantity"
            >
              <Plus className="size-4" />
            </Button>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          className="mt-2 w-full justify-center text-xs text-muted-foreground hover:text-foreground"
          onClick={() => router.push("/cart")}
          disabled={isPending}
        >
          Voir Le Panier
        </Button>
      </div>
    );
  }

  // ✅ Primary CTA when not in cart
  return (
    <Button
      className="mt-3 w-full gap-2 rounded-xl p-8"
      type="button"
      onClick={handleAddToCart}
      disabled={isPending}
    >
      <ShoppingCart className="size-4" />
      Ajouter Au Panier
    </Button>
  );
};

export default AddCart;
