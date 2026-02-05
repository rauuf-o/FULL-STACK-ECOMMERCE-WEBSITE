"use server";
import { productInsertSchema, updateProductSchema } from "@/lib/validators";
import { prisma } from "../db/prisma";
import { convertCartToPlainObject, prismaToJson } from "../lib/utils";
import { LATEST_PRODUCTS_LIMIT, PAGE_SIZE } from "../lib/constants";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Get latest products
export async function getLatestProducts() {
  const data = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });
  return prismaToJson(data);
}

// Get product by slug
export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findFirst({
    where: { slug },
  });
  return prismaToJson(product);
}

// Get all products
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
    where: category ? { category } : undefined,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });
  const dataCount = await prisma.product.count({
    where: category ? { category } : undefined,
  });

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
    dataCount,
  };
}

// Get product by ID
export async function getProductById(id: string) {
  const data = await prisma.product.findUnique({ where: { id } });
  return convertCartToPlainObject(data);
}

// Delete Product
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

// Create Product
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

// Update Product
export async function updateProduct(data: z.infer<typeof updateProductSchema>) {
  try {
    const product = updateProductSchema.parse(data);

    const productExist = await prisma.product.findUnique({
      where: { id: product.id },
    });
    if (!productExist) {
      throw new Error("Product not found");
    }

    await prisma.product.update({
      where: { id: product.id },
      data: product,
    });

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
export async function getProductsByCategory(categorySlug: string) {
  try {
    console.log("Fetching products for category:", categorySlug);

    // ✅ Convert slug back to category name
    // "mens-dress-shirts" → "Men Dress"
    const categoryName = categorySlug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    console.log("Converted to category name:", categoryName);

    const products = await prisma.product.findMany({
      where: {
        category: {
          contains: categoryName, // ✅ Use contains for partial match
          mode: "insensitive", // ✅ Case-insensitive search
        },
        stock: { gt: 0 },
      },
      orderBy: { createdAt: "desc" },
    });

    console.log(
      `Found ${products.length} products for category ${categoryName}`,
    );

    return products.map((p) => convertCartToPlainObject(p));
  } catch (err) {
    console.error("Error fetching products by category:", err);
    return [];
  }
}
