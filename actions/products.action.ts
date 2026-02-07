"use server";

import { prisma } from "@/db/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  convertCartToPlainObject,
  prismaToJson,
  formatError,
} from "@/lib/utils";
import { LATEST_PRODUCTS_LIMIT, PAGE_SIZE } from "@/lib/constants";
import { productInsertSchema, updateProductSchema } from "@/lib/validators";
import type { Product } from "@/types";
import { cache } from "react";

// ----------------------------
// Get latest products
// ----------------------------
export const getLatestProducts = cache(
  async (limit = 7): Promise<Product[]> => {
    const data = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        images: true,
        category: true,
        isFeatured: true,
        createdAt: true,
      },
    });

    return prismaToJson(data) as Product[];
  },
);

// ----------------------------
// Get product by slug
// ----------------------------
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const product = await prisma.product.findFirst({
    where: { slug },
  });
  return prismaToJson(product) as Product | null;
}

// ----------------------------
// Get all products with pagination & optional category/search
// ----------------------------
export async function getAllProducts({
  query,
  limit = PAGE_SIZE,
  page = 1,
  category,
}: {
  query?: string;
  limit?: number;
  page?: number;
  category?: string;
}) {
  const where = category ? { category } : undefined;

  const data = await prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  const dataCount = await prisma.product.count({ where });

  const products: Product[] = prismaToJson(data) as Product[];

  return {
    data: products,
    totalPages: Math.ceil(dataCount / limit),
    dataCount,
  };
}

// ----------------------------
// Get product by ID
// ----------------------------
export async function getProductById(id: string): Promise<Product | null> {
  const data = await prisma.product.findUnique({ where: { id } });
  return data ? (convertCartToPlainObject(data) as unknown as Product) : null;
}

// ----------------------------
// Delete Product
// ----------------------------
export async function deleteProduct(productId: string) {
  try {
    await prisma.product.delete({ where: { id: productId } });

    // ✅ ONLY ONE revalidatePath - revalidates entire app
    revalidatePath("/", "layout");

    return { success: true, message: "Product deleted successfully" };
  } catch (error: unknown) {
    return { success: false, message: formatError(error) };
  }
}

// ----------------------------
// Create Product
// ----------------------------
export async function createProduct(data: z.infer<typeof productInsertSchema>) {
  try {
    const validated = productInsertSchema.parse(data);
    await prisma.product.create({ data: validated });

    // ✅ ONLY ONE revalidatePath - revalidates entire app
    revalidatePath("/", "layout");

    return { success: true, message: "Product created successfully" };
  } catch (error: unknown) {
    return { success: false, message: formatError(error) };
  }
}

// ----------------------------
// Update Product
// ----------------------------
export async function updateProduct(data: z.infer<typeof updateProductSchema>) {
  try {
    const validated = updateProductSchema.parse(data);

    const exists = await prisma.product.findUnique({
      where: { id: validated.id },
    });
    if (!exists) throw new Error("Product not found");

    await prisma.product.update({
      where: { id: validated.id },
      data: validated,
    });

    // ✅ ONLY ONE revalidatePath - revalidates entire app
    revalidatePath("/", "layout");

    return { success: true, message: "Product updated successfully" };
  } catch (error: unknown) {
    return { success: false, message: formatError(error) };
  }
}

// ----------------------------
// Get products by category
// ----------------------------
export async function getProductsByCategory(
  categorySlug: string,
): Promise<Product[]> {
  const categoryName = categorySlug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const products = await prisma.product.findMany({
    where: {
      category: { contains: categoryName, mode: "insensitive" },
      stock: { gt: 0 },
    },
    orderBy: { createdAt: "desc" },
  });

  return products.map((p) => convertCartToPlainObject(p) as unknown as Product);
}

// ----------------------------
// Get last product
// ----------------------------
export const getLastProduct = cache(async (): Promise<Product | null> => {
  const data = await prisma.product.findFirst({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      images: true,
      category: true,
      isFeatured: true,
      createdAt: true,
    },
  });

  return data ? (prismaToJson(data) as Product) : null;
});
