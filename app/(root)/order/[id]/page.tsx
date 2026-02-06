// app/order/[id]/page.tsx
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderById, updateOrderToDelivered } from "@/actions/order-action";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { auth } from "@/auth";
import MarkDeliveredButton from "@/components/ui/mark-delivered-button"; // ✅ ADD
import type { ShippingAddress, OrderItem } from "@/types";

type PageProps = {
  params: Promise<{ id: string }>;
};

function formatDZD(amount?: number) {
  if (!amount) return "0 DA";
  const n = Math.round(amount).toString();
  return n.replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " DA";
}

function formatDate(d?: string | Date | null) {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function OrderDetailsPage({ params }: PageProps) {
  const { id } = await params;

  const order = await getOrderById(id);
  if (!order) notFound();

  const ship = (order.shippingAddress ?? {}) as unknown as ShippingAddress;
  const items = (order.orderItems ?? []) as unknown as OrderItem[];

  const itemsCount = items.reduce((sum, i) => sum + (Number(i.qty) || 0), 0);

  const session = await auth();
  const isAdmin = session?.user?.role === "admin"; // ✅ KEEP (UI guard)

  const shippingLine =
    ship.deliveryType === "STOP_DESK"
      ? `Stop Desk • ${ship.stopDeskId ?? "N/A"}`
      : `Home delivery • ${
          [ship.wilaya, ship.baladiya, ship.address]
            .filter(Boolean)
            .join(" • ") || "No address provided"
        }`;

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">
              Order{" "}
              <span className="font-mono">{String(order.id).slice(-6)}</span>
            </h1>

            <Badge variant={order.isDelivered ? "default" : "secondary"}>
              {order.isDelivered ? "Delivered" : "Pending"}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground">
            Placed on {formatDate(order.createdAt)}
            {order.isDelivered && order.deliveredAt
              ? ` • Delivered on ${formatDate(order.deliveredAt)}`
              : ""}
          </p>

          <p className="text-xs text-muted-foreground font-mono break-all">
            Full ID: {order.id}
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Left */}
        <div className="space-y-5 lg:col-span-2">
          {/* Shipping */}
          <Card className="rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Shipping</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border p-3">
                  <p className="text-xs text-muted-foreground">Full name</p>
                  <p className="font-medium">
                    {ship.fullName?.trim() || "Unknown"}
                  </p>
                </div>

                <div className="rounded-xl border p-3">
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-medium">
                    {ship.phoneNumber?.trim() || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border p-3">
                <p className="text-xs text-muted-foreground">Delivery</p>
                <p className="font-medium">{shippingLine}</p>
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card className="rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                Items{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  ({itemsCount})
                </span>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              {items.length ? (
                items.map((item, index) => (
                  <div
                    key={`${order.id}-${index}`}
                    className="flex gap-3 rounded-2xl border p-3"
                  >
                    <div className="relative h-16 w-16 overflow-hidden rounded-xl border bg-muted">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name ?? "Item"}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          {item.slug ? (
                            <Link
                              href={`/product/${item.slug}`}
                              className="line-clamp-1 font-medium hover:underline"
                            >
                              {item.name}
                            </Link>
                          ) : (
                            <p className="line-clamp-1 font-medium">
                              {item.name}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            {formatDZD(Number(item.price ?? 0))} • Qty{" "}
                            {Number(item.qty ?? 0)}
                          </p>
                        </div>

                        <div className="mt-1 flex flex-wrap gap-2 text-sm text-muted-foreground">
                          {item.taille && (
                            <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary">
                              Size {String(item.taille).toUpperCase()}
                            </span>
                          )}

                          <span>
                            Qty{" "}
                            <span className="font-medium text-foreground">
                              {Number(item.qty ?? 0)}
                            </span>
                          </span>

                          <span className="hidden sm:inline">•</span>
                          <span className="hidden sm:inline">
                            {formatDZD(Number(item.price ?? 0))}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border p-6 text-center text-sm text-muted-foreground">
                  No items found for this order.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <div className="h-fit lg:sticky lg:top-4">
          <Card className="rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Summary</CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Items</span>
                <span className="font-medium">
                  {formatDZD(order.itemsPrice)}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">
                  {formatDZD(order.shippingPrice)}
                </span>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-lg font-bold">
                  {formatDZD(order.totalPrice)}
                </span>
              </div>

              <div className="rounded-xl border p-3 text-sm">
                <p className="text-muted-foreground">Status</p>
                <p className="font-medium">
                  {order.isDelivered ? "Delivered ✅" : "Not delivered yet ⏳"}
                </p>

                {/* ✅ ADD: Only admin + only if not delivered */}
                {isAdmin && !order.isDelivered ? (
                  <MarkDeliveredButton
                    id={order.id}
                    action={updateOrderToDelivered}
                    disabled={order.isDelivered}
                  />
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
