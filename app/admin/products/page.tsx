import React from "react";
import Link from "next/link";
import Image from "next/image";
import DeleteDialog from "@/components/ui/shared/delete-dialog";

import { getAllProducts, deleteProduct } from "@/actions/products.action";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

const AdminProductsPage = async (props: {
  searchParams: Promise<{ page: string; query: string; category: string }>;
}) => {
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const searchText = searchParams.query || "";
  const category = searchParams.category || "";

  const products = await getAllProducts({
    query: searchText,
    page,
    category,
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground">
            Manage your catalog — edit details, stock, and pricing.
          </p>
        </div>

        <Button asChild className="rounded-xl">
          <Link href="/admin/products/create">+ Add Product</Link>
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border bg-background overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-[72px]">Image</TableHead>
              <TableHead className="w-[140px]">ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-center">Stock</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right w-[160px]">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {products.data.length ? (
              products.data.map((product) => {
                const stock = Number(
                  (product as any).stock ?? (product as any).countInStock ?? 0,
                );

                const img =
                  (product as any).image ||
                  (product as any).images?.[0] ||
                  null;

                return (
                  <TableRow key={product.id} className="hover:bg-muted/30">
                    {/* Image */}
                    <TableCell>
                      <div className="relative h-12 w-12 overflow-hidden rounded-xl border bg-muted">
                        {img ? (
                          <Image
                            src={img}
                            alt={product.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                            No image
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* ID */}
                    <TableCell className="font-mono text-xs">
                      <span title={product.id}>
                        {String(product.id).slice(-8)}
                      </span>
                    </TableCell>

                    {/* Name */}
                    <TableCell className="max-w-[360px]">
                      <div className="space-y-1">
                        <p className="font-medium leading-tight line-clamp-1">
                          {product.name}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {(product as any).slug
                            ? `/${(product as any).slug}`
                            : ""}
                        </p>
                      </div>
                    </TableCell>

                    {/* Price */}
                    <TableCell className="text-right font-semibold">
                      {Number((product as any).price ?? 0).toLocaleString()} DA
                    </TableCell>

                    {/* Category */}
                    <TableCell>{(product as any).category ?? "—"}</TableCell>

                    {/* Stock */}
                    <TableCell className="text-center font-medium">
                      {stock}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="text-center">
                      {stock > 0 ? (
                        <Badge variant="default">In stock</Badge>
                      ) : (
                        <Badge variant="secondary">Out</Badge>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="rounded-xl"
                        >
                          <Link href={`/admin/products/${product.id}`}>
                            Edit
                          </Link>
                        </Button>

                        <DeleteDialog id={product.id} action={deleteProduct} />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center">
                  <p className="text-sm text-muted-foreground">
                    No products found.
                  </p>
                  <div className="mt-4">
                    <Button asChild className="rounded-xl">
                      <Link href="/admin/products/create">
                        + Add your first product
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination (same style as orders) */}
      <div className="mt-4 flex justify-end gap-2">
        {page > 1 && (
          <Button asChild variant="outline" size="sm">
            <Link
              href={`/admin/products?page=${page - 1}&query=${encodeURIComponent(
                searchText,
              )}&category=${encodeURIComponent(category)}`}
            >
              Previous
            </Link>
          </Button>
        )}

        {/* show Next if there might be more pages */}
        {!products.totalPages || page < products.totalPages ? (
          <Button asChild variant="outline" size="sm">
            <Link
              href={`/admin/products?page=${page + 1}&query=${encodeURIComponent(
                searchText,
              )}&category=${encodeURIComponent(category)}`}
            >
              Next
            </Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
};

export default AdminProductsPage;
