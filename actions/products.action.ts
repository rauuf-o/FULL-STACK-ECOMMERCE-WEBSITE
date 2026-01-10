"use server";
import { prisma } from "../db/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { prismaToJson } from "../lib/utils";
import { LATEST_PRODUCTS_LIMIT } from "../lib/constants";
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
