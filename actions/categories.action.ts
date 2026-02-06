import { prisma } from "@/db/prisma";
import { cache } from "react";

export const getDerivedCategories = cache(async () => {
  // Fetch only category name and first image
  const products = await prisma.product.findMany({
    select: {
      category: true,
      images: true,
    },
  });

  // Map to store unique categories with one representative image
  const map = new Map<string, string>();

  for (const product of products) {
    const name = product.category.trim();

    // First image wins
    if (!map.has(name) && product.images?.[0]) {
      map.set(name, product.images[0]);
    }
  }

  // Convert map to array
  return Array.from(map.entries())
    .map(([name, image]) => ({ name, image }))
    .sort((a, b) => a.name.localeCompare(b.name));
});
