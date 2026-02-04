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

  const existItem = useMemo(
    () => cart?.items.find((x) => x.productId === item.productId),
    [cart?.items, item.productId],
  );

  const handleAddToCart = () => {
    const id = toast.loading("Adding to cart...", { description: item.name });

    startTransition(async () => {
      const result = await addItemToCart(item);

      if (result?.success) {
        // ✅ UPDATE NAVBAR BADGE INSTANTLY
        window.dispatchEvent(new Event("cart:updated"));

        toast.success("Added to cart", {
          id,
          description: item.name,
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
    const id = toast.loading("Updating cart...", { description: item.name });

    startTransition(async () => {
      const res = await removeItemFromCart(item.productId);

      if (res?.success) {
        // ✅ UPDATE NAVBAR BADGE INSTANTLY
        window.dispatchEvent(new Event("cart:updated"));

        toast.success("Removed from cart", {
          id,
          description: item.name,
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
              {existItem.quantity}
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
          Open cart
        </Button>
      </div>
    );
  }

  // ✅ Primary CTA when not in cart
  return (
    <Button
      className="mt-3 w-full gap-2 rounded-xl"
      type="button"
      onClick={handleAddToCart}
      disabled={isPending}
    >
      <ShoppingCart className="size-4" />
      Add to cart
    </Button>
  );
};

export default AddCart;
