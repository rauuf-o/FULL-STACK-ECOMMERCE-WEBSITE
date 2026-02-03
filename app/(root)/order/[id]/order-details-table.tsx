// app/order/[id]/order-details-table.tsx
"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

import { toast } from "sonner";
import { Copy, Check } from "lucide-react";

/* ===================== TYPES ===================== */

type ShippingAddress = {
  fullName?: string;
  phoneNumber?: string;
  address?: string;
  wilaya?: string;
  baladiya?: string;
  deliveryType?: "HOME" | "STOP_DESK";
  stopDeskId?: string;
};

type OrderItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
  image?: string | null;
  slug?: string | null;
};

type SafeOrder = {
  id: string;
  createdAt?: string | Date;
  itemsPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isDelivered: boolean;
  deliveredAt?: string | Date | null;
  shippingAddress?: ShippingAddress;
  orderItems?: OrderItem[];
};

/* ===================== HELPERS ===================== */

const shortenId = (id?: string) => (id ? id.slice(-6) : "—");

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

/* ===================== COMPONENT ===================== */

export default function OrderDetailsTable({ order }: { order: SafeOrder }) {
  const [copied, setCopied] = useState(false);

  const ship = order.shippingAddress ?? {};
  const items = order.orderItems ?? [];

  const shippingLine = useMemo(() => {
    if (ship.deliveryType === "STOP_DESK") {
      return `Stop Desk • ${ship.stopDeskId ?? "N/A"}`;
    }
    const line =
      [ship.wilaya, ship.baladiya, ship.address].filter(Boolean).join(" • ") ||
      "No address provided";
    return `Home delivery • ${line}`;
  }, [ship]);

  const itemsCount = useMemo(
    () => items.reduce((sum, i) => sum + (i.qty || 0), 0),
    [items],
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(order.id);
      setCopied(true);
      toast.success("Order ID copied");
      setTimeout(() => setCopied(false), 1200);
    } catch {
      toast.error("Could not copy");
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">
              Order <span className="font-mono">{shortenId(order.id)}</span>
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
        </div>

        <Button
          variant="outline"
          className="gap-2 rounded-2xl"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" /> Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" /> Copy Order ID
            </>
          )}
        </Button>
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
                items.map((item) => (
                  <div
                    key={`${order.id}-${item.id}-${item.slug ?? item.name}`}
                    className="flex gap-3 rounded-2xl border p-3"
                  >
                    <div className="relative h-16 w-16 overflow-hidden rounded-xl border bg-muted">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
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

                    <div className="flex-1">
                      <div className="flex justify-between gap-3">
                        <div>
                          {item.slug ? (
                            <Link
                              href={`/product/${item.slug}`}
                              className="font-medium hover:underline"
                            >
                              {item.name}
                            </Link>
                          ) : (
                            <p className="font-medium">{item.name}</p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            {formatDZD(item.price)} • Qty {item.qty}
                          </p>
                        </div>

                        <p className="font-semibold">
                          {formatDZD(item.price * item.qty)}
                        </p>
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
        <div className="lg:sticky lg:top-4">
          <Card className="rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Items</span>
                <span>{formatDZD(order.itemsPrice)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>{formatDZD(order.shippingPrice)}</span>
              </div>

              <Separator />

              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-lg">{formatDZD(order.totalPrice)}</span>
              </div>

              <div className="rounded-xl border p-3 text-sm">
                <p className="text-muted-foreground">Status</p>
                <p className="font-medium">
                  {order.isDelivered ? "Delivered ✅" : "Not delivered yet ⏳"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
