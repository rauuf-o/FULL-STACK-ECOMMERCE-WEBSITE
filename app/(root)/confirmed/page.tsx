import React from "react";
import { getCartItems } from "@/actions/cart-action";
import { auth } from "@/auth";
import { getUserByID } from "@/actions/user.action";
import { ShippingAddress } from "@/types";
import { redirect } from "next/navigation";
import CheckoutSteps from "@/components/ui/shared/checkout-steps";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import ConfirmOrderForm from "./confirmed-order-form";
import { Cart } from "@/types";
import { shippingAddressSchema } from "@/lib/validators";

// ✅ ADD: compute shipping server-side for display
import { getShippingPriceByWilaya } from "@/lib/shippingRates";

export const metadata = {
  title: "Confirmed",
  description: "Your order has been confirmed",
};

const ConfirmedPage = async () => {
  const cart = await getCartItems();

  // 🛑 No cart or empty cart → go back
  if (!cart || cart.items.length === 0) {
    redirect("/cart");
  }

  const session = await auth();
  const userId = session?.user?.id;

  let address: ShippingAddress | undefined;

  if (userId) {
    const user = await getUserByID(userId);
    address = (user?.address as ShippingAddress) ?? undefined;
  } else {
    address = (cart.shippingAddress as ShippingAddress) ?? undefined;
  }

  if (!address) {
    redirect("/shipping");
  }

  // ✅ Validate & compute shipping price based on wilaya + deliveryType
  const validatedAddress = shippingAddressSchema.parse(address);

  const computedShippingPrice = getShippingPriceByWilaya(
    validatedAddress.wilaya,
    validatedAddress.deliveryType,
  );

  const itemsCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  const computedTotal =
    Number(cart.itemsPrice) +
    Number(computedShippingPrice) +
    Number((cart as any).taxPrice ?? 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      {/* Steps */}
      <div className="mb-8">
        <CheckoutSteps current={2} />
      </div>

      {/* Header */}
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">
            Review & Place Order
          </h1>
          <p className="text-sm text-muted-foreground">
            Please review your order before confirming.
          </p>
        </div>

        <Link href="/cart" className="hidden md:block">
          <Button variant="outline">Back to cart</Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* LEFT COLUMN */}
        <div className="space-y-6 md:col-span-2">
          {/* Shipping */}
          <Card>
            <CardHeader className="border-b bg-muted/30">
              <div className="flex items-center justify-between">
                <CardTitle>Shipping details</CardTitle>
                <Link href="/shipping-adresse">
                  <Button size="sm" variant="outline">
                    Edit
                  </Button>
                </Link>
              </div>
            </CardHeader>

            <CardContent className="p-5">
              <div className="rounded-xl border bg-background p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{validatedAddress.fullName}</p>
                  <span className="rounded-full border px-3 py-1 text-xs">
                    {validatedAddress.deliveryType === "HOME"
                      ? "Home delivery"
                      : "Stop desk"}
                  </span>
                </div>

                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                  <p className="text-foreground">
                    {validatedAddress.phoneNumber}
                  </p>

                  {/* ✅ Show wilaya for both types (useful) */}
                  <p>{validatedAddress.wilaya}</p>

                  {validatedAddress.deliveryType === "HOME" && (
                    <>
                      <p>{validatedAddress.baladiya}</p>
                      <p>{validatedAddress.address}</p>
                    </>
                  )}

                  {validatedAddress.deliveryType === "STOP_DESK" && (
                    <p>
                      Stop desk ID:{" "}
                      <span className="font-medium text-foreground">
                        {validatedAddress.stopDeskId}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ORDER ITEMS */}
          <Card>
            <CardHeader className="border-b bg-muted/30">
              <div className="flex items-center justify-between">
                <CardTitle>Order items</CardTitle>
                <span className="text-sm text-muted-foreground">
                  {itemsCount} item{itemsCount > 1 ? "s" : ""}
                </span>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="divide-y">
                {cart.items.map((item) => (
                  <div
                    key={`${item.productId}-${item.taille ?? "default"}`}
                    className="flex items-center gap-4 p-4 md:p-5"
                  >
                    <Link
                      href={`/product/${item.slug}`}
                      className="flex flex-1 items-center gap-4"
                    >
                      {/* Image */}
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border bg-muted/30">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{item.name}</p>

                        <div className="mt-1 flex flex-wrap gap-2 text-sm text-muted-foreground">
                          {item.taille && (
                            <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary">
                              Size {item.taille.toUpperCase()}
                            </span>
                          )}

                          <span>
                            Qty{" "}
                            <span className="font-medium text-foreground">
                              {item.quantity}
                            </span>
                          </span>
                        </div>
                      </div>
                    </Link>

                    {/* Price */}
                    <div className="text-right">
                      <p className="font-semibold">
                        DZD{" "}
                        {(Number(item.price) * Number(item.quantity)).toFixed(
                          2,
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        DZD {Number(item.price).toFixed(2)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN */}
        <div className="md:col-span-1">
          <Card className="sticky top-6">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle>Order summary</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 p-5">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Items</span>
                  <span className="font-medium">
                    DZD {Number(cart.itemsPrice).toFixed(2)}
                  </span>
                </div>

                {/* ✅ Use computedShippingPrice instead of cart.shippingPrice */}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">
                    DZD {Number(computedShippingPrice).toFixed(2)}
                  </span>
                </div>

                <div className="border-t pt-3 flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span>DZD {Number(computedTotal).toFixed(2)}</span>
                </div>
              </div>

              <ConfirmOrderForm />

              <Link href="/cart" className="md:hidden">
                <Button variant="outline" className="w-full">
                  Back to cart
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ConfirmedPage;
