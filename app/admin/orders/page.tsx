// app/admin/orders/page.tsx
import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { deleteOrder, getAllOrders } from "@/actions/order-action";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DeleteDialog from "@/components/ui/shared/delete-dialog";

export const metadata: Metadata = {
  title: "Admin Orders",
  description: "Admin Orders",
};

function formatDate(date: string | Date) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("fr-DZ", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("fr-DZ", {
    style: "currency",
    currency: "DZD",
    maximumFractionDigits: 0,
  }).format(amount);
}

const AdminOrderPage = async (props: {
  searchParams: Promise<{ page?: string }>;
}) => {
  const searchParams = await props.searchParams;
  const page = Math.max(1, Number(searchParams.page ?? "1"));

  const session = await auth();
  if (session?.user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const orders = await getAllOrders({
    page,
    limit: 10,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">Orders</h1>
        <p className="text-sm text-muted-foreground">
          Manage all customer orders
        </p>
      </div>

      <div className="rounded-2xl border bg-background">
        <Table>
          <TableCaption>List of recent orders</TableCaption>

          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Full name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Delivered</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {orders.map((order) => {
              type OrderLike = {
                id: string;
                customerName?: string;
                customerPhone?: string;
                createdAt: string | Date;
                totalPrice?: number | string;
                isDelivered?: boolean;
              };
              const o = order as unknown as OrderLike;

              return (
                <TableRow key={o.id}>
                  <TableCell className="font-mono">
                    {String(o.id).slice(-6)}
                  </TableCell>
                  <TableCell>{o.customerName ?? "Unknown"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {o.customerPhone ?? "N/A"}
                  </TableCell>
                  <TableCell>{formatDate(o.createdAt)}</TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(Number(o.totalPrice ?? 0))}
                  </TableCell>
                  <TableCell>
                    <Badge variant={o.isDelivered ? "default" : "secondary"}>
                      {o.isDelivered ? "Delivered" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/order/${o.id}`}>View</Link>
                      </Button>

                      {/* Delete should NOT be a Link. Keep as placeholder button for now */}

                      <DeleteDialog id={o.id} action={deleteOrder} />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}

            {orders.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-6 text-center text-muted-foreground"
                >
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-end gap-2">
        {page > 1 && (
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/orders?page=${page - 1}`}>Previous</Link>
          </Button>
        )}

        <Button asChild variant="outline" size="sm">
          <Link href={`/admin/orders?page=${page + 1}`}>Next</Link>
        </Button>
      </div>
    </div>
  );
};

export default AdminOrderPage;
