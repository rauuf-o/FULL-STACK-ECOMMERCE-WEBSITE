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
    // ✅ Logged-in user → address from user
    const user = await getUserByID(userId);
    address = (user?.address as ShippingAddress) ?? undefined;
  } else {
    // ✅ Guest user → address from cart
    address = (cart.shippingAddress as ShippingAddress) ?? undefined;
  }

  // 🛑 No address at all → back to shipping
  if (!address) {
    redirect("/shipping");
  }

  const itemsCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 md:py-10">
      <div className="mb-6">
        <CheckoutSteps current={2} />
      </div>

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Review & Place Order
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Double-check your shipping details and items before placing your
            order.
          </p>
        </div>

        <Link href="/cart" className="hidden md:block">
          <Button variant="outline">Back to cart</Button>
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {/* Left column */}
        <div className="space-y-5 md:col-span-2">
          {/* Shipping card */}
          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-muted/30">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-base md:text-lg">
                  Shipping details
                </CardTitle>
                <Link href="/shipping-adresse">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </Link>
              </div>
            </CardHeader>

            <CardContent className="p-5">
              <div className="rounded-xl border bg-background p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-medium">{address.fullName}</div>

                  <span className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground">
                    {address.deliveryType === "HOME"
                      ? "Home delivery"
                      : "Stop desk"}
                  </span>
                </div>

                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                  {address.deliveryType === "HOME" && (
                    <>
                      <p className="text-foreground">{address.phoneNumber}</p>
                      <p>
                        {address.wilaya} • {address.baladiya}
                      </p>
                      <p>{address.address}</p>
                    </>
                  )}

                  {address.deliveryType === "STOP_DESK" && (
                    <p className="text-foreground">
                      Stop desk ID:{" "}
                      <span className="font-medium">{address.stopDeskId}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 text-xs text-muted-foreground">
                Make sure your address and phone number are correct to avoid
                delivery delays.
              </div>
            </CardContent>
          </Card>

          {/* Items card */}
          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-muted/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base md:text-lg">
                  Order items
                </CardTitle>
                <span className="text-sm text-muted-foreground">
                  {itemsCount} item{itemsCount > 1 ? "s" : ""}
                </span>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="divide-y">
                {cart.items.map((item) => (
                  <div
                    key={item.slug}
                    className="flex items-center gap-4 p-4 md:p-5"
                  >
                    <Link
                      href={`/product/${item.slug}`}
                      className="group flex items-center gap-4"
                    >
                      <div className="relative h-16 w-16 overflow-hidden rounded-xl border bg-muted/30">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover transition-transform group-hover:scale-[1.03]"
                          sizes="64px"
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="truncate font-medium leading-5">
                          {item.name}
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground">
                          Qty:{" "}
                          <span className="text-foreground">
                            {item.quantity}
                          </span>
                        </div>
                      </div>
                    </Link>

                    <div className="ml-auto text-right">
                      <div className="font-semibold">
                        DZD{" "}
                        {(Number(item.price) * Number(item.quantity)).toFixed(
                          2,
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        DZD {Number(item.price).toFixed(2)} each
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - sticky summary */}
        <div className="md:col-span-1">
          <Card className="sticky top-6">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="text-base md:text-lg">
                Order summary
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 p-5">
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Items</span>
                  <span className="font-medium">
                    DZD {Number(cart.itemsPrice).toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">
                    DZD {Number(cart.shippingPrice).toFixed(2)}
                  </span>
                </div>

                <div className="my-3 border-t" />

                <div className="flex items-center justify-between text-base">
                  <span className="font-semibold">Total</span>
                  <span className="font-semibold">
                    DZD{" "}
                    {(
                      Number(cart.itemsPrice) +
                      Number((cart as any).shippingPrice ?? 0) +
                      Number((cart as any).taxPrice ?? 0)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border bg-muted/30 p-3 text-xs text-muted-foreground">
                By placing your order, you agree to our terms and confirm your
                shipping details are correct.
              </div>

              <Link href="/cart" className="md:hidden">
                <Button variant="outline" className="w-full">
                  Back to cart
                </Button>
              </Link>
              <ConfirmOrderForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ConfirmedPage;
