"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTransition } from "react";
import { addItemToCart, removeItemFromCart } from "@/actions/cart-action";
import { ArrowRight, Loader, Minus, Plus } from "lucide-react";
import { Cart } from "@/types";
import Link from "next/link";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableHeader,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const CartTable = ({ cart }: { cart?: Cart }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  return (
    <div>
      <h1 className="py-4 h2-bold"> Shopping Cart</h1>
      {!cart || cart.items.length === 0 ? (
        <div>
          Your cart is empty. <Link href="/">Continue Shopping</Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-4">
          {/* LEFT: items */}
          <div className="md:col-span-3">
            {/* ✅ MOBILE: cards */}
            <div className="space-y-3 md:hidden">
              {cart.items.map((item) => (
                <div
                  key={item.productId}
                  className="rounded-2xl border bg-background p-4 shadow-sm"
                >
                  <div className="flex gap-3">
                    <Link href={`/product/${item.slug}`} className="shrink-0">
                      <div className="relative h-16 w-16 overflow-hidden rounded-xl border bg-muted">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                    </Link>

                    <div className="min-w-0 flex-1">
                      <Link href={`/product/${item.slug}`} className="block">
                        <h3 className="truncate font-medium">{item.name}</h3>
                      </Link>

                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm font-semibold tabular-nums">
                          DZD{Number(item.price).toFixed(2)}
                        </span>

                        <div className="flex items-center gap-2 rounded-full border bg-background px-2 py-1 shadow-sm">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            disabled={isPending}
                            onClick={() =>
                              startTransition(async () => {
                                const result = await removeItemFromCart(
                                  item.productId,
                                );
                                if (result?.success) {
                                  toast.success("Removed from cart", {
                                    description: item.name,
                                  });
                                } else {
                                  toast.error("Failed to remove item", {
                                    description:
                                      result?.message || "Please try again",
                                  });
                                }
                              })
                            }
                            aria-label="Decrease quantity"
                          >
                            <Minus className="size-4" />
                          </Button>

                          <span className="min-w-8 text-center text-sm font-semibold tabular-nums">
                            {item.quantity}
                          </span>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            disabled={isPending}
                            onClick={() =>
                              startTransition(async () => {
                                const result = await addItemToCart(item);
                                if (result?.success) {
                                  toast.success("Added to cart", {
                                    description: item.name,
                                  });
                                } else {
                                  toast.error("Failed to add item", {
                                    description:
                                      result?.message || "Please try again",
                                  });
                                }
                              })
                            }
                            aria-label="Increase quantity"
                          >
                            <Plus className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ✅ DESKTOP: table */}
            <div className="hidden md:block overflow-x-auto rounded-2xl border bg-background shadow-sm">
              <Table className="min-w-[720px]">
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="w-[55%] py-4 pl-6">Product</TableHead>
                    <TableHead className="py-4 text-center">Quantity</TableHead>
                    <TableHead className="py-4 pr-6 text-right">
                      Price
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {cart.items.map((item) => (
                    <TableRow
                      key={item.productId}
                      className="border-b last:border-b-0 hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="py-5 pl-6 align-middle">
                        <Link
                          href={`/product/${item.slug}`}
                          className="group flex items-center gap-4"
                        >
                          <div className="relative h-16 w-16 overflow-hidden rounded-xl border bg-muted">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover transition-transform group-hover:scale-105"
                              sizes="64px"
                            />
                          </div>
                          <div className="min-w-0">
                            <h3 className="truncate font-medium group-hover:underline">
                              {item.name}
                            </h3>
                          </div>
                        </Link>
                      </TableCell>

                      <TableCell className="py-5 align-middle">
                        <div className="mx-auto flex w-fit items-center gap-2 rounded-full border bg-background px-2 py-1 shadow-sm">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            disabled={isPending}
                            onClick={() =>
                              startTransition(async () => {
                                const result = await removeItemFromCart(
                                  item.productId,
                                );
                                if (result?.success) {
                                  toast.success("Removed from cart", {
                                    description: item.name,
                                  });
                                } else {
                                  toast.error("Failed to remove item", {
                                    description:
                                      result?.message || "Please try again",
                                  });
                                }
                              })
                            }
                          >
                            <Minus className="size-4" />
                          </Button>

                          <span className="min-w-8 text-center text-sm font-semibold tabular-nums">
                            {item.quantity}
                          </span>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            disabled={isPending}
                            onClick={() =>
                              startTransition(async () => {
                                const result = await addItemToCart(item);
                                if (result?.success) {
                                  toast.success("Added to cart", {
                                    description: item.name,
                                  });
                                } else {
                                  toast.error("Failed to add item", {
                                    description:
                                      result?.message || "Please try again",
                                  });
                                }
                              })
                            }
                          >
                            <Plus className="size-4" />
                          </Button>
                        </div>
                      </TableCell>

                      <TableCell className="py-5 pr-6 text-right align-middle">
                        <span className="font-semibold tabular-nums">
                          DZD{Number(item.price).toFixed(2)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* RIGHT: summary */}
          <Card>
            <CardContent className="p-4 gap-4">
              <div className="pb-3 text-xl">
                {" "}
                SubTotal (
                {cart.items.reduce((acc, item) => acc + item.quantity, 0)}):
                <span className="font-bold tabular-nums">
                  DZD
                  {cart.items
                    .reduce((acc, item) => acc + item.price * item.quantity, 0)
                    .toFixed(2)}
                </span>
                <div>
                  <Button
                    className="w-full my-4 h-15 "
                    disabled={isPending}
                    onClick={() =>
                      startTransition(() => router.push("/shipping-adresse"))
                    }
                  >
                    {isPending ? (
                      <Loader className="mx-auto animate-spin" />
                    ) : (
                      <>
                        Proceed to Checkout <ArrowRight className="ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CartTable;
