// app/admin/overview/page.tsx (or wherever your AdminOverviewPage lives)
import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { getOrderSummary } from "@/actions/order-action";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import SalesChart from "../sales-chart";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("fr-DZ", {
    style: "currency",
    currency: "DZD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fr-DZ", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

const AdminOverviewPage = async () => {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    throw new Error("User Is Not Authorized");
  }

  const summary = await getOrderSummary();

  const totalSalesValue =
    Number((summary.totalSales as any)?._sum?.totalPrice ?? 0) || 0;

  // ✅ Make latestOrders safe + consistent (avoid Decimal/Date weirdness)
  const latestOrders = (summary.latestSales ?? []).map((o: any) => ({
    id: String(o.id),
    createdAt: o.createdAt,
    totalPrice: Number(o.totalPrice ?? 0),
    isPaid: Boolean(o.isPaid ?? false),
    itemsCount: Array.isArray(o.orderItems) ? o.orderItems.length : 0,
    customerName: o.customerName ?? "Unknown",
    customerPhone: o.customerPhone ?? "N/A",
  }));

  return (
    <div className="min-h-[calc(100vh-64px)] bg-muted/30">
      <div className="mx-auto w-full max-w-7xl px-4 py-6">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
            <p className="text-sm text-muted-foreground">
              Store performance, sales trend, and latest orders.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="rounded-full">
              {formatDate(new Date())}
            </Badge>
          </div>
        </div>

        {/* KPIs */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Total Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                {formatCurrency(totalSalesValue)}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Sum of all paid/unpaid orders (based on totalPrice)
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{summary.OrderCount}</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Total orders created
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                {summary.ProductCount}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Active products in catalog
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{summary.UserCount}</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Registered accounts
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Chart + Latest Orders */}
        <div className="mt-6 grid gap-4 lg:grid-cols-5">
          {/* Chart */}
          <Card className="rounded-2xl shadow-sm lg:col-span-3">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Monthly Sales</CardTitle>
              <p className="text-sm text-muted-foreground">
                Sum of totalPrice grouped by month (MM/YY)
              </p>
            </CardHeader>
            <CardContent className="pt-2">/** Chart */</CardContent>
          </Card>

          {/* Latest Orders (clickable cards via Link) */}
          <Card className="rounded-2xl shadow-sm lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Latest Orders</CardTitle>
              <p className="text-sm text-muted-foreground">
                Last 6 orders (name + phone from shipping)
              </p>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="space-y-3">
                {latestOrders.length === 0 ? (
                  <div className="rounded-xl border bg-background p-4 text-sm text-muted-foreground">
                    No recent orders.
                  </div>
                ) : (
                  latestOrders.map((o) => (
                    <Link
                      key={o.id}
                      href={`/order/${o.id}`}
                      className="block rounded-xl border bg-background p-3 transition hover:bg-muted/40 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate font-medium">
                            {o.customerName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {o.customerPhone}
                          </div>
                        </div>

                        <Badge
                          variant={o.isPaid ? "default" : "secondary"}
                          className="shrink-0 rounded-full"
                        >
                          {o.isPaid ? "Paid" : "Unpaid"}
                        </Badge>
                      </div>

                      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{formatDate(new Date(o.createdAt))}</span>
                        <span>{o.itemsCount} item(s)</span>
                      </div>

                      <div className="mt-1 text-sm font-semibold">
                        {formatCurrency(o.totalPrice)}
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table view (clickable rows using Link in first cell) */}
        <div className="mt-6">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Orders Snapshot</CardTitle>
              <p className="text-sm text-muted-foreground">
                Quick view for the latest orders
              </p>
            </CardHeader>

            <CardContent className="pt-2">
              <div className="overflow-x-auto rounded-xl border bg-background">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">
                        Customer
                      </th>
                      <th className="px-4 py-3 text-left font-medium">Phone</th>
                      <th className="px-4 py-3 text-left font-medium">Date</th>
                      <th className="px-4 py-3 text-left font-medium">Items</th>
                      <th className="px-4 py-3 text-left font-medium">
                        Status
                      </th>
                      <th className="px-4 py-3 text-right font-medium">
                        Total
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {latestOrders.map((o) => (
                      <tr key={o.id} className="border-t hover:bg-muted/40">
                        {/* ✅ Valid HTML: Link inside TD (not wrapping TR) */}
                        <td className="px-4 py-3 font-medium">
                          <Link
                            href={`/order/${o.id}`}
                            className="block focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md"
                          >
                            {o.customerName}
                          </Link>
                        </td>

                        <td className="px-4 py-3 text-muted-foreground">
                          {o.customerPhone}
                        </td>

                        <td className="px-4 py-3 text-muted-foreground">
                          {formatDate(new Date(o.createdAt))}
                        </td>

                        <td className="px-4 py-3 text-muted-foreground">
                          {o.itemsCount}
                        </td>

                        <td className="px-4 py-3">
                          <Badge
                            variant={o.isPaid ? "default" : "secondary"}
                            className="rounded-full"
                          >
                            {o.isPaid ? "Paid" : "Unpaid"}
                          </Badge>
                        </td>

                        <td className="px-4 py-3 text-right font-semibold">
                          {formatCurrency(o.totalPrice)}
                        </td>
                      </tr>
                    ))}

                    {latestOrders.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-6 text-center text-muted-foreground"
                        >
                          No orders yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <p className="mt-3 text-xs text-muted-foreground">
                Tip: click the customer name to open the order details.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminOverviewPage;
