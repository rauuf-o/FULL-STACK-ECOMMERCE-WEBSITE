"use server";
import { productInsertSchema, updateProductSchema } from "@/lib/validators";

import { prisma } from "../db/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { convertCartToPlainObject, prismaToJson } from "../lib/utils";
import { LATEST_PRODUCTS_LIMIT } from "../lib/constants";
import { PAGE_SIZE } from "../lib/constants";
import { revalidatePath } from "next/cache";
import { z } from "zod";
export async function getLatestProducts() {
  const data = await prisma.product.findMany({
    take: LATEST_PRODUCTS_LIMIT,
    orderBy: {
      createdAt: "desc",
    },
  });
  return prismaToJson(data);
}
//get product by slug
export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findFirst({
    where: {
      slug: slug,
    },
  });
  return prismaToJson(product);
}
//get all products
export async function getAllProducts({
  query,
  limit = PAGE_SIZE,
  page,
  category,
}: {
  query?: string;
  limit?: number;
  page: number;
  category?: string;
}) {
  const data = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });
  const dataCount = await prisma.product.count();
  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
    dataCount,
  };
}
//delete Product
export async function deleteProduct(productId: string) {
  try {
    await prisma.product.delete({ where: { id: productId } });
    revalidatePath("/admin/products");
    return { success: true, message: "Product deleted successfully" };
  } catch (error: any) {
    console.error("Error deleting product:", error);
    return {
      success: false,
      message: error?.message || "Failed to delete product",
    };
  }
}
//create product
export async function createProduct(data: z.infer<typeof productInsertSchema>) {
  try {
    const product = productInsertSchema.parse(data);
    await prisma.product.create({ data: product });
    revalidatePath("/admin/products");
    return { success: true, message: "Product created successfully" };
  } catch (error: any) {
    console.error("Error creating product:", error);
    return {
      success: false,
      message: error?.message || "Failed to create product",
    };
  }
}
export async function updateProduct(data: z.infer<typeof updateProductSchema>) {
  try {
    const product = updateProductSchema.parse(data);
    const productExist = await prisma.product.findUnique({
      where: {
        id: product.id,
      },
    });
    if (!productExist) {
      throw new Error("Product not found");
    }
    await prisma.product.update({ where: { id: product.id }, data: product });
    revalidatePath("/admin/products");
    return { success: true, message: "Product Has Been Updated" };
  } catch (error: any) {
    console.error("Error updating product:", error);
    return {
      success: false,
      message: error?.message || "Failed to update product",
    };
  }
}
export async function getProductById(id: string) {
  const data = await prisma.product.findUnique({
    where: {
      id: id,
    },
  });
  return convertCartToPlainObject(data);
}
